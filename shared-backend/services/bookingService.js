const {
  createDocument,
  findDocument,
  findDocumentById,
  findDocuments,
  updateDocumentById,
  deleteDocumentById,
  countDocuments,
  aggregateDocuments,
  generateId,
  toObjectId,
  createDateRangeFilter
} = require('../utils/databaseUtils');

// ==================== BOOKING SERVICE ====================

class BookingService {
  constructor() {
    this.collectionName = 'service_bookings';
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    try {
      // Generate booking ID
      bookingData.bookingId = bookingData.bookingId || generateId();

      // Set default values
      bookingData.status = bookingData.status || 'pending';
      bookingData.createdAt = new Date();
      bookingData.updatedAt = new Date();

      // Convert IDs to ObjectId
      if (bookingData.userId) {
        bookingData.userId = toObjectId(bookingData.userId);
      }
      if (bookingData.mechanicId) {
        bookingData.mechanicId = toObjectId(bookingData.mechanicId);
      }
      if (bookingData.serviceCenterId) {
        bookingData.serviceCenterId = toObjectId(bookingData.serviceCenterId);
      }
      if (bookingData.vehicleId) {
        bookingData.vehicleId = toObjectId(bookingData.vehicleId);
      }

      const result = await createDocument(this.collectionName, bookingData);
      return result;
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find booking by ID
   */
  async findBookingById(bookingId, projection = {}) {
    try {
      const result = await findDocumentById(this.collectionName, bookingId, projection);
      return result;
    } catch (error) {
      console.error('Error finding booking by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find booking by booking ID
   */
  async findBookingByBookingId(bookingId, projection = {}) {
    try {
      const result = await findDocument(this.collectionName, { bookingId }, projection);
      return result;
    } catch (error) {
      console.error('Error finding booking by booking ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find bookings by user
   */
  async findBookingsByUser(userId, options = {}) {
    try {
      const filter = { userId: toObjectId(userId) };
      
      if (options.status) filter.status = options.status;
      if (options.startDate || options.endDate) {
        filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
      }

      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding bookings by user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find bookings by mechanic
   */
  async findBookingsByMechanic(mechanicId, options = {}) {
    try {
      const filter = { mechanicId: toObjectId(mechanicId) };
      
      if (options.status) filter.status = options.status;
      if (options.startDate || options.endDate) {
        filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
      }

      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding bookings by mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find bookings by service center
   */
  async findBookingsByServiceCenter(serviceCenterId, options = {}) {
    try {
      const filter = { serviceCenterId: toObjectId(serviceCenterId) };
      
      if (options.status) filter.status = options.status;
      if (options.startDate || options.endDate) {
        filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
      }

      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding bookings by service center:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find pending bookings
   */
  async findPendingBookings(options = {}) {
    try {
      const filter = { status: 'pending' };
      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding pending bookings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find active bookings
   */
  async findActiveBookings(options = {}) {
    try {
      const filter = { status: { $in: ['pending', 'confirmed', 'in_progress'] } };
      const result = await findDocuments(this.collectionName, filter, options);
      return result;
    } catch (error) {
      console.error('Error finding active bookings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update booking by ID
   */
  async updateBookingById(bookingId, updateData) {
    try {
      // Convert IDs to ObjectId if provided
      if (updateData.userId) {
        updateData.userId = toObjectId(updateData.userId);
      }
      if (updateData.mechanicId) {
        updateData.mechanicId = toObjectId(updateData.mechanicId);
      }
      if (updateData.serviceCenterId) {
        updateData.serviceCenterId = toObjectId(updateData.serviceCenterId);
      }
      if (updateData.vehicleId) {
        updateData.vehicleId = toObjectId(updateData.vehicleId);
      }

      const result = await updateDocumentById(this.collectionName, bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error updating booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete booking by ID
   */
  async deleteBookingById(bookingId) {
    try {
      const result = await deleteDocumentById(this.collectionName, bookingId);
      return result;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId, mechanicId = null) {
    try {
      const updateData = {
        status: 'confirmed',
        confirmedAt: new Date(),
        updatedAt: new Date()
      };

      if (mechanicId) {
        updateData.mechanicId = toObjectId(mechanicId);
      }

      const result = await this.updateBookingById(bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error confirming booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start booking
   */
  async startBooking(bookingId) {
    try {
      const updateData = {
        status: 'in_progress',
        startedAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.updateBookingById(bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error starting booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete booking
   */
  async completeBooking(bookingId, completionData = {}) {
    try {
      const updateData = {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
        ...completionData
      };

      const result = await this.updateBookingById(bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error completing booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, cancellationReason = '') {
    try {
      const updateData = {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
        cancellationReason
      };

      const result = await this.updateBookingById(bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reschedule booking
   */
  async rescheduleBooking(bookingId, newAppointmentDate, rescheduleReason = '') {
    try {
      const updateData = {
        appointmentDate: new Date(newAppointmentDate),
        rescheduledAt: new Date(),
        updatedAt: new Date(),
        rescheduleReason
      };

      const result = await this.updateBookingById(bookingId, updateData);
      return result;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate booking statistics
   */
  async getBookingStats() {
    try {
      const totalBookings = await countDocuments(this.collectionName);
      const pendingBookings = await countDocuments(this.collectionName, { status: 'pending' });
      const confirmedBookings = await countDocuments(this.collectionName, { status: 'confirmed' });
      const inProgressBookings = await countDocuments(this.collectionName, { status: 'in_progress' });
      const completedBookings = await countDocuments(this.collectionName, { status: 'completed' });
      const cancelledBookings = await countDocuments(this.collectionName, { status: 'cancelled' });

      return {
        success: true,
        data: {
          total: totalBookings.count || 0,
          pending: pendingBookings.count || 0,
          confirmed: confirmedBookings.count || 0,
          inProgress: inProgressBookings.count || 0,
          completed: completedBookings.count || 0,
          cancelled: cancelledBookings.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting booking stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get bookings by date range
   */
  async getBookingsByDateRange(startDate, endDate, options = {}) {
    try {
      const dateFilter = createDateRangeFilter(startDate, endDate, 'appointmentDate');
      const result = await findDocuments(this.collectionName, dateFilter, options);
      return result;
    } catch (error) {
      console.error('Error getting bookings by date range:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get booking analytics
   */
  async getBookingAnalytics(userId, period) {
    try {
      const filter = { userId: toObjectId(userId) };
      
      if (period) {
        filter.createdAt = createDateRangeFilter(period.startDate, period.endDate).createdAt;
      }

      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ];

      const result = await aggregateDocuments(this.collectionName, pipeline);
      return result;
    } catch (error) {
      console.error('Error getting booking analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate booking data
   */
  validateBookingData(bookingData) {
    const errors = [];

    if (!bookingData.userId) {
      errors.push('User ID is required');
    }

    if (!bookingData.serviceType) {
      errors.push('Service type is required');
    }

    if (!bookingData.appointmentDate) {
      errors.push('Appointment date is required');
    }

    if (!bookingData.location) {
      errors.push('Location is required');
    }

    if (bookingData.totalAmount && bookingData.totalAmount < 0) {
      errors.push('Total amount must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new BookingService();
