const { logger } = require('../config/logger');

class MobileLocationService {
  constructor() {
    this.dbService = require('./databaseService');
  }

  /**
   * Update user's current location
   */
  async updateUserLocation(userId, locationData) {
    try {
      const { latitude, longitude, accuracy, speed, timestamp } = locationData;

      // Validate coordinates
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates');
      }

      const locationUpdate = {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          accuracy: accuracy || null,
          speed: speed || null,
          timestamp: timestamp || new Date()
        },
        lastLocationUpdate: new Date(),
        updatedAt: new Date()
      };

      // Update user's location
      await this.dbService.updateOne('users',
        { _id: userId },
        locationUpdate
      );

      // Check if user is in any active geofences
      await this.checkGeofenceTriggers(userId, { latitude, longitude });

      return {
        success: true,
        message: 'Location updated successfully',
        location: {
          latitude,
          longitude,
          accuracy,
          speed,
          timestamp: locationUpdate.currentLocation.timestamp
        }
      };
    } catch (error) {
      logger.error('Update user location error:', error);
      throw error;
    }
  }

  /**
   * Get mechanic's current location
   */
  async getMechanicLocation(mechanicId) {
    try {
      const mechanic = await this.dbService.findOne('users', { 
        _id: mechanicId,
        userType: 'mechanic',
        isActive: true
      }, {
        projection: {
          currentLocation: 1,
          lastLocationUpdate: 1,
          firstName: 1,
          lastName: 1,
          phoneNumber: 1,
          rating: 1
        }
      });

      if (!mechanic) {
        throw new Error('Mechanic not found');
      }

      if (!mechanic.currentLocation) {
        throw new Error('Mechanic location not available');
      }

      return {
        mechanic: {
          id: mechanic._id,
          name: `${mechanic.firstName} ${mechanic.lastName}`,
          phoneNumber: mechanic.phoneNumber,
          rating: mechanic.rating
        },
        location: {
          latitude: mechanic.currentLocation.coordinates[1],
          longitude: mechanic.currentLocation.coordinates[0],
          accuracy: mechanic.currentLocation.accuracy,
          speed: mechanic.currentLocation.speed,
          timestamp: mechanic.currentLocation.timestamp,
          lastUpdate: mechanic.lastLocationUpdate
        }
      };
    } catch (error) {
      logger.error('Get mechanic location error:', error);
      throw error;
    }
  }

  /**
   * Setup geofence for booking
   */
  async setupGeofence(bookingId, center, radius) {
    try {
      const { latitude, longitude } = center;

      if (!latitude || !longitude || !radius) {
        throw new Error('Center coordinates and radius are required');
      }

      if (radius < 0.1 || radius > 50) {
        throw new Error('Radius must be between 0.1 and 50 kilometers');
      }

      const geofence = {
        bookingId,
        center: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        radius: radius * 1000, // Convert to meters
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create or update geofence
      await this.dbService.updateOne('geofences',
        { bookingId },
        geofence,
        { upsert: true }
      );

      return {
        success: true,
        message: 'Geofence set up successfully',
        geofence: {
          bookingId,
          center: { latitude, longitude },
          radius: radius,
          isActive: true
        }
      };
    } catch (error) {
      logger.error('Setup geofence error:', error);
      throw error;
    }
  }

  /**
   * Get active geofences for a user
   */
  async getActiveGeofences(userId) {
    try {
      // Get user's bookings with active geofences
      const bookings = await this.dbService.find('bookings', {
        userId,
        status: { $in: ['confirmed', 'assigned', 'in_progress'] }
      });

      const bookingIds = bookings.map(booking => booking._id);

      const geofences = await this.dbService.find('geofences', {
        bookingId: { $in: bookingIds },
        isActive: true
      });

      return geofences.map(geofence => ({
        id: geofence._id,
        bookingId: geofence.bookingId,
        center: {
          latitude: geofence.center.coordinates[1],
          longitude: geofence.center.coordinates[0]
        },
        radius: geofence.radius / 1000, // Convert back to kilometers
        isActive: geofence.isActive
      }));
    } catch (error) {
      logger.error('Get active geofences error:', error);
      throw error;
    }
  }

  /**
   * Check if user is within geofence
   */
  async checkGeofenceTriggers(userId, userLocation) {
    try {
      const { latitude, longitude } = userLocation;

      // Get user's active geofences
      const geofences = await this.getActiveGeofences(userId);

      for (const geofence of geofences) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          geofence.center.latitude,
          geofence.center.longitude
        );

        // If user is within geofence radius
        if (distance <= geofence.radius) {
          await this.triggerGeofenceEvent(geofence.bookingId, userId, 'entered');
        } else {
          // Check if user was previously inside and now left
          const wasInside = await this.wasUserInsideGeofence(geofence.bookingId, userId);
          if (wasInside) {
            await this.triggerGeofenceEvent(geofence.bookingId, userId, 'exited');
          }
        }
      }
    } catch (error) {
      logger.error('Check geofence triggers error:', error);
    }
  }

  /**
   * Trigger geofence event
   */
  async triggerGeofenceEvent(bookingId, userId, eventType) {
    try {
      const event = {
        bookingId,
        userId,
        eventType, // 'entered' or 'exited'
        timestamp: new Date(),
        createdAt: new Date()
      };

      // Record geofence event
      await this.dbService.create('geofenceEvents', event);

      // Send notification based on event type
      if (eventType === 'entered') {
        await this.notifyGeofenceEntered(bookingId, userId);
      } else if (eventType === 'exited') {
        await this.notifyGeofenceExited(bookingId, userId);
      }

      return event;
    } catch (error) {
      logger.error('Trigger geofence event error:', error);
    }
  }

  /**
   * Check if user was previously inside geofence
   */
  async wasUserInsideGeofence(bookingId, userId) {
    try {
      const lastEvent = await this.dbService.findOne('geofenceEvents', {
        bookingId,
        userId
      }, {
        sort: { timestamp: -1 }
      });

      return lastEvent && lastEvent.eventType === 'entered';
    } catch (error) {
      logger.error('Check if user was inside geofence error:', error);
      return false;
    }
  }

  /**
   * Get location history for a user
   */
  async getLocationHistory(userId, startDate, endDate, limit = 100) {
    try {
      const query = { userId };

      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const history = await this.dbService.find('locationHistory', query, {
        sort: { timestamp: -1 },
        limit
      });

      return history.map(record => ({
        latitude: record.location.coordinates[1],
        longitude: record.location.coordinates[0],
        accuracy: record.accuracy,
        speed: record.speed,
        timestamp: record.timestamp
      }));
    } catch (error) {
      logger.error('Get location history error:', error);
      throw error;
    }
  }

  /**
   * Get nearby users (for mechanics)
   */
  async getNearbyUsers(mechanicId, radius = 5) {
    try {
      const mechanic = await this.dbService.findOne('users', { _id: mechanicId });
      if (!mechanic || !mechanic.currentLocation) {
        throw new Error('Mechanic location not available');
      }

      const { coordinates } = mechanic.currentLocation;

      const nearbyUsers = await this.dbService.find('users', {
        userType: 'customer',
        isActive: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      }, {
        limit: 20,
        projection: {
          firstName: 1,
          lastName: 1,
          phoneNumber: 1,
          currentLocation: 1,
          lastLocationUpdate: 1
        }
      });

      return nearbyUsers.map(user => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        phoneNumber: user.phoneNumber,
        location: {
          latitude: user.currentLocation.coordinates[1],
          longitude: user.currentLocation.coordinates[0],
          accuracy: user.currentLocation.accuracy,
          lastUpdate: user.lastLocationUpdate
        },
        distance: this.calculateDistance(
          coordinates[1],
          coordinates[0],
          user.currentLocation.coordinates[1],
          user.currentLocation.coordinates[0]
        )
      }));
    } catch (error) {
      logger.error('Get nearby users error:', error);
      throw error;
    }
  }

  /**
   * Calculate route between two points
   */
  async calculateRoute(origin, destination, mode = 'driving') {
    try {
      // This would integrate with Google Maps Directions API
      // For now, return a simple straight-line route
      const route = {
        origin: {
          latitude: origin.latitude,
          longitude: origin.longitude
        },
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude
        },
        mode: mode,
        distance: this.calculateDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude
        ),
        duration: this.estimateTravelTime(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
          mode
        ),
        waypoints: [],
        polyline: this.generateSimplePolyline(origin, destination)
      };

      return route;
    } catch (error) {
      logger.error('Calculate route error:', error);
      throw error;
    }
  }

  /**
   * Track mechanic's route to customer
   */
  async trackMechanicRoute(bookingId, mechanicId) {
    try {
      const booking = await this.dbService.findOne('bookings', { _id: bookingId });
      const mechanic = await this.dbService.findOne('users', { _id: mechanicId });

      if (!booking || !mechanic) {
        throw new Error('Booking or mechanic not found');
      }

      const origin = {
        latitude: mechanic.currentLocation.coordinates[1],
        longitude: mechanic.currentLocation.coordinates[0]
      };

      const destination = {
        latitude: booking.location.coordinates[1],
        longitude: booking.location.coordinates[0]
      };

      const route = await this.calculateRoute(origin, destination);

      // Store route tracking
      const routeTracking = {
        bookingId,
        mechanicId,
        route,
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date()
      };

      await this.dbService.updateOne('routeTracking',
        { bookingId },
        routeTracking,
        { upsert: true }
      );

      return routeTracking;
    } catch (error) {
      logger.error('Track mechanic route error:', error);
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
   * Estimate travel time based on distance and mode
   */
  estimateTravelTime(lat1, lon1, lat2, lon2, mode) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    
    const averageSpeeds = {
      driving: 30, // km/h in city
      walking: 5,  // km/h
      bicycling: 15, // km/h
      transit: 20 // km/h
    };

    const speed = averageSpeeds[mode] || 30;
    const timeInHours = distance / speed;
    const timeInMinutes = Math.round(timeInHours * 60);

    return timeInMinutes;
  }

  /**
   * Generate simple polyline between two points
   */
  generateSimplePolyline(origin, destination) {
    // This is a simplified polyline - in production, use Google Maps API
    return {
      points: [
        { lat: origin.latitude, lng: origin.longitude },
        { lat: destination.latitude, lng: destination.longitude }
      ]
    };
  }

  /**
   * Notify when user enters geofence
   */
  async notifyGeofenceEntered(bookingId, userId) {
    try {
      // This would integrate with the notification service
      // await notificationService.sendPushNotification(user.deviceTokens, {
      //   title: 'Mechanic Nearby',
      //   body: 'Your mechanic is approaching your location',
      //   data: { bookingId, event: 'geofence_entered' }
      // });
    } catch (error) {
      logger.error('Notify geofence entered error:', error);
    }
  }

  /**
   * Notify when user exits geofence
   */
  async notifyGeofenceExited(bookingId, userId) {
    try {
      // This would integrate with the notification service
      // await notificationService.sendPushNotification(user.deviceTokens, {
      //   title: 'Mechanic Left Area',
      //   body: 'Your mechanic has left the service area',
      //   data: { bookingId, event: 'geofence_exited' }
      // });
    } catch (error) {
      logger.error('Notify geofence exited error:', error);
    }
  }
}

module.exports = new MobileLocationService();
