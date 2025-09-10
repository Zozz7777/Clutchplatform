const express = require('express');
const databaseUtils = require('../utils/databaseUtils');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

// Import models
const bookingService = require('../services/bookingService');
const Mechanic = require('../models/Mechanic');
const Client = require('../models/Client');

/**
 * @swagger
 * /api/jobs/available:
 *   get:
 *     summary: Get available jobs for mechanics
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs per page
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: Available jobs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/available', authenticateToken, requireRole(['mechanic']), async (req, res) => {
  try {
    const { page = 1, limit = 10, serviceType, location } = req.query;
    
    // Build filter for available jobs
    const filter = {
      status: 'pending',
      mechanicId: { $exists: false } // No mechanic assigned yet
    };
    
    if (serviceType) filter.serviceType = serviceType;
    if (location) filter.location = location;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const availableJobs = await bookingService.findBookings(filter)
      .populate('customerId', 'firstName lastName phoneNumber address')
      .populate('vehicleId', 'make model year licensePlate')
      .sort({ priority: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await bookingService.countBookings(filter);
    
    res.json({
      success: true,
      data: {
        jobs: availableJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalJobs: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching available jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available jobs',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/{id}/accept:
 *   post:
 *     summary: Accept a job (mechanic only)
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Booking ID
 *     responses:
 *       200:
 *         description: Job accepted successfully
 *       400:
 *         description: Job already assigned or validation error
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/:id/accept', authenticateToken, requireRole(['mechanic']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if job is still available
    const job = await bookingService.getBookingById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.status !== 'pending' || job.mechanicId) {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer available'
      });
    }
    
    // Check if mechanic is available
    const mechanic = await databaseUtils.findOne('mechanics', { userId: req.user._id });
    if (!mechanic || mechanic.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'You must be available to accept jobs'
      });
    }
    
    // Accept the job
    const updatedJob = await bookingService.updateBooking(id, {
      mechanicId: req.user._id,
      status: 'assigned',
      mechanicAssignedAt: new Date(),
      updatedAt: new Date()
    }, { new: true });
    
    // Update mechanic status
    await databaseUtils.updateOne('mechanics', mechanic._id, {
      status: 'busy',
      currentBooking: id,
      updatedAt: new Date()
    });
    
    logger.info(`Job accepted: ${id} by mechanic ${req.user._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('job:accepted', {
        jobId: id,
        mechanicId: req.user._id,
        message: 'Job accepted by mechanic'
      });
    }
    
    res.json({
      success: true,
      message: 'Job accepted successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    logger.error('Error accepting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/{id}/status:
 *   put:
 *     summary: Update job status (mechanic only)
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [en_route, arrived, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *                 description: Additional notes about the status change
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authenticateToken, requireRole(['mechanic']), [
  body('status').isIn(['en_route', 'arrived', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Check if job exists and mechanic is assigned
    const job = await bookingService.getBookingById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.mechanicId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this job'
      });
    }
    
    // Update job status with appropriate timestamps
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    switch (status) {
      case 'en_route':
        updateData.mechanicEnRouteAt = new Date();
        break;
      case 'arrived':
        updateData.mechanicArrivedAt = new Date();
        break;
      case 'in_progress':
        updateData.serviceStartedAt = new Date();
        break;
      case 'completed':
        updateData.serviceCompletedAt = new Date();
        updateData.completedAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
    }
    
    if (notes) {
      updateData.notes = updateData.notes || [];
      updateData.notes.push({
        message: notes,
        author: req.user._id,
        timestamp: new Date()
      });
    }
    
    const updatedJob = await bookingService.updateBooking(id, updateData, { new: true });
    
    // Update mechanic status if job is completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      await databaseUtils.updateOne('mechanics', req.user._id, {
        status: 'available',
        currentBooking: null,
        updatedAt: new Date()
      });
    }
    
    logger.info(`Job status updated: ${id} to ${status} by mechanic ${req.user._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('job:status:updated', {
        jobId: id,
        status: status,
        mechanicId: req.user._id,
        message: `Job status updated to ${status}`
      });
    }
    
    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    logger.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/active:
 *   get:
 *     summary: Get active jobs for current mechanic
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active jobs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/active', authenticateToken, requireRole(['mechanic']), async (req, res) => {
  try {
    const activeJobs = await bookingService.findBookings({
      mechanicId: req.user._id,
      status: { $in: ['assigned', 'en_route', 'arrived', 'in_progress'] }
    })
    .populate('customerId', 'firstName lastName phoneNumber address')
    .populate('vehicleId', 'make model year licensePlate')
    .sort({ priority: -1, createdAt: 1 });
    
    res.json({
      success: true,
      data: {
        activeJobs,
        totalActive: activeJobs.length
      }
    });
  } catch (error) {
    logger.error('Error fetching active jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active jobs',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/history:
 *   get:
 *     summary: Get job history for current mechanic
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by job status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Job history retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/history', authenticateToken, requireRole(['mechanic']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    // Build filter for completed jobs
    const filter = {
      mechanicId: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    };
    
    if (status) filter.status = status;
    
    // Date filtering
    if (startDate || endDate) {
      filter.completedAt = {};
      if (startDate) filter.completedAt.$gte = new Date(startDate);
      if (endDate) filter.completedAt.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const jobHistory = await bookingService.findBookings(filter)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await bookingService.countBookings(filter);
    
    res.json({
      success: true,
      data: {
        jobs: jobHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalJobs: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching job history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job history',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/{id}/complete:
 *   post:
 *     summary: Mark job as complete (mechanic only)
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - finalNotes
 *               - serviceDetails
 *             properties:
 *               finalNotes:
 *                 type: string
 *                 description: Final notes about the service
 *               serviceDetails:
 *                 type: object
 *                 description: Details of services performed
 *               partsUsed:
 *                 type: array
 *                 items:
 *                   type: object
 *               totalCost:
 *                 type: number
 *                 description: Total cost of the service
 *     responses:
 *       200:
 *         description: Job completed successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/:id/complete', authenticateToken, requireRole(['mechanic']), [
  body('finalNotes').notEmpty().withMessage('Final notes are required'),
  body('serviceDetails').isObject().withMessage('Service details are required'),
  body('totalCost').isFloat({ min: 0 }).withMessage('Valid total cost is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { finalNotes, serviceDetails, partsUsed, totalCost } = req.body;
    
    // Check if job exists and mechanic is assigned
    const job = await bookingService.getBookingById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.mechanicId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this job'
      });
    }
    
    if (job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Job must be in progress to complete'
      });
    }
    
    // Complete the job
    const updatedJob = await bookingService.updateBooking(id, {
      status: 'completed',
      finalNotes: finalNotes,
      serviceDetails: serviceDetails,
      partsUsed: partsUsed || [],
      totalCost: totalCost,
      serviceCompletedAt: new Date(),
      completedAt: new Date(),
      updatedAt: new Date()
    }, { new: true });
    
    // Update mechanic status
    await databaseUtils.updateOne('mechanics', req.user._id, {
      status: 'available',
      currentBooking: null,
      updatedAt: new Date()
    });
    
    logger.info(`Job completed: ${id} by mechanic ${req.user._id}`);
    
    // Emit WebSocket event for real-time updates
    if (global.io) {
      global.io.emit('job:completed', {
        jobId: id,
        mechanicId: req.user._id,
        totalCost: totalCost,
        message: 'Job completed successfully'
      });
    }
    
    res.json({
      success: true,
      message: 'Job completed successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    logger.error('Error completing job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete job',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job/Booking ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await bookingService.getBookingById(id)
      .populate('customerId', 'firstName lastName phoneNumber address')
      .populate('mechanicId', 'firstName lastName phoneNumber rating')
      .populate('vehicleId', 'make model year licensePlate vin');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Verify access (customer can see their own jobs, mechanic can see assigned jobs)
    if (req.user.role === 'customer') {
      const customer = await databaseUtils.findOne('clients', { userId: req.user._id });
      if (!customer || job.customerId._id.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'mechanic') {
      if (job.mechanicId && job.mechanicId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    logger.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: error.message
    });
  }
});

module.exports = router;
