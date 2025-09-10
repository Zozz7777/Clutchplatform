const { logger } = require('../config/logger');

class MobileBookingService {
  constructor() {
    this.dbService = require('./databaseService');
  }

  /**
   * Get nearby mechanics based on location and service type
   */
  async getNearbyMechanics(location, radius, serviceType) {
    try {
      const { latitude, longitude } = location;
      
      // Find mechanics within radius who offer the service type
      const query = {
        userType: 'mechanic',
        isVerified: true,
        isActive: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      };

      // Add service type filter if provided
      if (serviceType) {
        query.services = { $in: [serviceType] };
      }

      const mechanics = await this.dbService.find('users', query, {
        limit: 10,
        projection: {
          password: 0,
          __v: 0,
          deviceTokens: 0
        }
      });

      // Add distance calculation
      const mechanicsWithDistance = mechanics.map(mechanic => ({
        ...mechanic,
        distance: this.calculateDistance(latitude, longitude, mechanic.currentLocation.coordinates[1], mechanic.currentLocation.coordinates[0])
      }));

      // Sort by distance
      mechanicsWithDistance.sort((a, b) => a.distance - b.distance);

      return mechanicsWithDistance;
    } catch (error) {
      logger.error('Get nearby mechanics error:', error);
      throw error;
    }
  }

  /**
   * Create a quick booking for mobile users
   */
  async createQuickBooking(userId, bookingData) {
    try {
      const { serviceType, vehicleId, location, description, urgency } = bookingData;

      // Validate required fields
      if (!serviceType || !vehicleId || !location) {
        throw new Error('Service type, vehicle ID, and location are required');
      }

      // Get user details
      const user = await this.dbService.findOne('users', { _id: userId });
      if (!user) {
        throw new Error('User not found');
      }

      // Get vehicle details
      const vehicle = await this.dbService.findOne('vehicles', { _id: vehicleId, userId });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Find nearby mechanics
      const mechanics = await this.getNearbyMechanics(location, 10, serviceType);
      if (mechanics.length === 0) {
        throw new Error('No mechanics available in your area');
      }

      // Create booking
      const booking = {
        userId,
        vehicleId,
        serviceType,
        description: description || '',
        urgency: urgency || 'medium',
        status: 'pending',
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          address: location.address || ''
        },
        requestedMechanics: mechanics.slice(0, 3).map(m => m._id), // Top 3 nearest mechanics
        estimatedPrice: this.estimateServicePrice(serviceType, urgency),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newBooking = await this.dbService.create('bookings', booking);

      // Send notifications to nearby mechanics
      await this.notifyNearbyMechanics(mechanics, newBooking);

      return {
        booking: newBooking,
        availableMechanics: mechanics.length,
        estimatedPrice: booking.estimatedPrice
      };
    } catch (error) {
      logger.error('Create quick booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's active bookings
   */
  async getActiveBookings(userId) {
    try {
      const bookings = await this.dbService.find('bookings', {
        userId,
        status: { $in: ['pending', 'confirmed', 'in_progress', 'assigned'] }
      }, {
        sort: { createdAt: -1 },
        populate: [
          { path: 'vehicleId', select: 'make model year licensePlate' },
          { path: 'assignedMechanic', select: 'firstName lastName phoneNumber rating' }
        ]
      });

      return bookings;
    } catch (error) {
      logger.error('Get active bookings error:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status, userId) {
    try {
      const booking = await this.dbService.findOne('bookings', { _id: bookingId, userId });
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Validate status transition
      const validTransitions = {
        pending: ['cancelled'],
        confirmed: ['cancelled', 'in_progress'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        throw new Error(`Invalid status transition from ${booking.status} to ${status}`);
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      // Add completion time if status is completed
      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      // Add cancellation time if status is cancelled
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      const updatedBooking = await this.dbService.updateOne('bookings',
        { _id: bookingId },
        updateData
      );

      // Send notification to user about status change
      await this.notifyUserStatusChange(userId, bookingId, status);

      return updatedBooking;
    } catch (error) {
      logger.error('Update booking status error:', error);
      throw error;
    }
  }

  /**
   * Get booking details with mechanic information
   */
  async getBookingDetails(bookingId, userId) {
    try {
      const booking = await this.dbService.findOne('bookings', { _id: bookingId, userId });
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Populate related data
      const populatedBooking = await this.dbService.populate(booking, [
        { path: 'vehicleId', select: 'make model year licensePlate color' },
        { path: 'assignedMechanic', select: 'firstName lastName phoneNumber rating avatar currentLocation' },
        { path: 'requestedMechanics', select: 'firstName lastName phoneNumber rating avatar currentLocation' }
      ]);

      return populatedBooking;
    } catch (error) {
      logger.error('Get booking details error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason) {
    try {
      const booking = await this.dbService.findOne('bookings', { _id: bookingId, userId });
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'completed' || booking.status === 'cancelled') {
        throw new Error('Cannot cancel completed or already cancelled booking');
      }

      const updateData = {
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by user',
        cancelledAt: new Date(),
        updatedAt: new Date()
      };

      const updatedBooking = await this.dbService.updateOne('bookings',
        { _id: bookingId },
        updateData
      );

      // Notify assigned mechanic if any
      if (booking.assignedMechanic) {
        await this.notifyMechanicCancellation(booking.assignedMechanic, bookingId);
      }

      return updatedBooking;
    } catch (error) {
      logger.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Rate completed booking
   */
  async rateBooking(bookingId, userId, rating, review) {
    try {
      const booking = await this.dbService.findOne('bookings', { _id: bookingId, userId });
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'completed') {
        throw new Error('Can only rate completed bookings');
      }

      if (booking.rating) {
        throw new Error('Booking already rated');
      }

      const updateData = {
        rating,
        review: review || '',
        ratedAt: new Date(),
        updatedAt: new Date()
      };

      const updatedBooking = await this.dbService.updateOne('bookings',
        { _id: bookingId },
        updateData
      );

      // Update mechanic's average rating
      if (booking.assignedMechanic) {
        await this.updateMechanicRating(booking.assignedMechanic, rating);
      }

      return updatedBooking;
    } catch (error) {
      logger.error('Rate booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking history
   */
  async getBookingHistory(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const bookings = await this.dbService.find('bookings', {
        userId,
        status: { $in: ['completed', 'cancelled'] }
      }, {
        sort: { updatedAt: -1 },
        skip,
        limit,
        populate: [
          { path: 'vehicleId', select: 'make model year licensePlate' },
          { path: 'assignedMechanic', select: 'firstName lastName rating' }
        ]
      });

      const total = await this.dbService.count('bookings', {
        userId,
        status: { $in: ['completed', 'cancelled'] }
      });

      return {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get booking history error:', error);
      throw error;
    }
  }

  // Helper methods

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Estimate service price based on type and urgency
   */
  estimateServicePrice(serviceType, urgency) {
    const basePrices = {
      'oil_change': 50,
      'tire_rotation': 30,
      'brake_service': 150,
      'battery_replacement': 120,
      'ac_service': 100,
      'engine_diagnostic': 80,
      'emergency_service': 200
    };

    const urgencyMultipliers = {
      'low': 1.0,
      'medium': 1.2,
      'high': 1.5,
      'emergency': 2.0
    };

    const basePrice = basePrices[serviceType] || 100;
    const multiplier = urgencyMultipliers[urgency] || 1.0;

    return Math.round(basePrice * multiplier);
  }

  /**
   * Notify nearby mechanics about new booking
   */
  async notifyNearbyMechanics(mechanics, booking) {
    try {
      // This would integrate with the notification service
      for (const mechanic of mechanics) {
        // Send push notification to mechanic
        // await notificationService.sendPushNotification(mechanic.deviceTokens, {
        //   title: 'New Booking Request',
        //   body: `New ${booking.serviceType} service request nearby`,
        //   data: { bookingId: booking._id }
        // });
      }
    } catch (error) {
      logger.error('Notify nearby mechanics error:', error);
    }
  }

  /**
   * Notify user about status change
   */
  async notifyUserStatusChange(userId, bookingId, status) {
    try {
      // This would integrate with the notification service
      // await notificationService.sendPushNotification(user.deviceTokens, {
      //   title: 'Booking Status Updated',
      //   body: `Your booking status has been updated to ${status}`,
      //   data: { bookingId }
      // });
    } catch (error) {
      logger.error('Notify user status change error:', error);
    }
  }

  /**
   * Notify mechanic about cancellation
   */
  async notifyMechanicCancellation(mechanicId, bookingId) {
    try {
      // This would integrate with the notification service
      // await notificationService.sendPushNotification(mechanic.deviceTokens, {
      //   title: 'Booking Cancelled',
      //   body: 'A booking has been cancelled',
      //   data: { bookingId }
      // });
    } catch (error) {
      logger.error('Notify mechanic cancellation error:', error);
    }
  }

  /**
   * Update mechanic's average rating
   */
  async updateMechanicRating(mechanicId, newRating) {
    try {
      // Get all ratings for this mechanic
      const ratings = await this.dbService.find('bookings', {
        assignedMechanic: mechanicId,
        rating: { $exists: true }
      }, {
        projection: { rating: 1 }
      });

      const totalRating = ratings.reduce((sum, booking) => sum + booking.rating, 0);
      const averageRating = totalRating / ratings.length;

      // Update mechanic's average rating
      await this.dbService.updateOne('users',
        { _id: mechanicId },
        { 
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length,
          updatedAt: new Date()
        }
      );
    } catch (error) {
      logger.error('Update mechanic rating error:', error);
    }
  }
}

module.exports = new MobileBookingService();
