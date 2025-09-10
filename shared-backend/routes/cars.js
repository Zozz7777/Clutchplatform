const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRateLimit } = require('../middleware/rateLimit');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');
const Car = require('../models/Car');

const router = express.Router();

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - brand
 *               - model
 *               - trim
 *               - kilometers
 *               - color
 *             properties:
 *               year:
 *                 type: integer
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               trim:
 *                 type: string
 *               kilometers:
 *                 type: integer
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Car added successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticateToken,
  authRateLimit,
  [
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('trim').notEmpty().withMessage('Trim is required'),
    body('kilometers').isInt({ min: 0 }).withMessage('Valid kilometers is required'),
    body('color').notEmpty().withMessage('Color is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { year, brand, model, trim, kilometers, color } = req.body;
    const userId = req.user.userId || req.user.id;

    try {
      const car = new Car({
        userId,
        year,
        brand,
        model,
        trim,
        kilometers,
        color
      });

      await car.save();

      logger.info(`New car added: ${brand} ${model} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Car added successfully',
        car: {
          id: car._id,
          year: car.year,
          brand: car.brand,
          model: car.model,
          trim: car.trim,
          kilometers: car.kilometers,
          color: car.color,
          userId: car.userId,
          createdAt: car.createdAt
        }
      });

    } catch (error) {
      logger.error('Add car error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get user's cars
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cars retrieved successfully
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user.id;

    try {
      const cars = await Car.find({ userId }).sort({ createdAt: -1 });

      res.json(cars.map(car => ({
        id: car._id,
        year: car.year,
        brand: car.brand,
        model: car.model,
        trim: car.trim,
        kilometers: car.kilometers,
        color: car.color,
        userId: car.userId,
        createdAt: car.createdAt
      })));

    } catch (error) {
      logger.error('Get cars error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/cars/{carId}:
 *   get:
 *     summary: Get specific car
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car retrieved successfully
 *       404:
 *         description: Car not found
 */
router.get('/:carId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { carId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
      const car = await Car.findOne({ _id: carId, userId });

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      res.json({
        id: car._id,
        year: car.year,
        brand: car.brand,
        model: car.model,
        trim: car.trim,
        kilometers: car.kilometers,
        color: car.color,
        userId: car.userId,
        createdAt: car.createdAt
      });

    } catch (error) {
      logger.error('Get car error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/cars/{carId}:
 *   put:
 *     summary: Update car
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               trim:
 *                 type: string
 *               kilometers:
 *                 type: integer
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       404:
 *         description: Car not found
 */
router.put('/:carId',
  authenticateToken,
  authRateLimit,
  [
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    body('kilometers').optional().isInt({ min: 0 }).withMessage('Valid kilometers is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { carId } = req.params;
    const userId = req.user.userId || req.user.id;
    const updateData = req.body;

    try {
      const car = await Car.findOneAndUpdate(
        { _id: carId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      logger.info(`Car updated: ${car.brand} ${car.model} by user ${userId}`);

      res.json({
        success: true,
        message: 'Car updated successfully',
        car: {
          id: car._id,
          year: car.year,
          brand: car.brand,
          model: car.model,
          trim: car.trim,
          kilometers: car.kilometers,
          color: car.color,
          userId: car.userId,
          createdAt: car.createdAt
        }
      });

    } catch (error) {
      logger.error('Update car error:', error);
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/cars/{carId}:
 *   delete:
 *     summary: Delete car
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       404:
 *         description: Car not found
 */
router.delete('/:carId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { carId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
      const car = await Car.findOneAndDelete({ _id: carId, userId });

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      logger.info(`Car deleted: ${car.brand} ${car.model} by user ${userId}`);

      res.json({
        success: true,
        message: 'Car deleted successfully'
      });

    } catch (error) {
      logger.error('Delete car error:', error);
      throw error;
    }
  })
);

module.exports = router;
