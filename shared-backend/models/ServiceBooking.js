const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class ServiceBooking {
  constructor(data) {
    if (!data) {
      throw new Error('ServiceBooking data is required');
    }
    
    this._id = data._id;
    this.bookingId = data.bookingId;
    this.userId = data.userId;
    this.vehicleId = data.vehicleId;
    this.serviceCenterId = data.serviceCenterId;
    this.bookingDate = data.bookingDate || new Date();
    this.appointmentDate = data.appointmentDate;
    this.appointmentTime = data.appointmentTime;
    this.status = data.status || 'pending';
    this.totalAmount = data.totalAmount || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Services array
    this.services = data.services || [];
    
    // Quotation details
    this.quotation = data.quotation || {
      quotationId: null,
      quotationNumber: null,
      quotationDate: null,
      validUntil: null,
      status: 'pending',
      totalAmount: 0,
      services: []
    };
    
    // Payment details
    this.payment = data.payment || {
      paymentId: null,
      paymentMethod: null,
      paymentStatus: 'pending',
      amount: 0,
      heldAmount: 0,
      releasedAmount: 0,
      transactionDate: null
    };
  }

  static async findById(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const booking = await db.collection('service_bookings').findOne({ _id: new ObjectId(id) });
      return booking ? new ServiceBooking(booking) : null;
    } catch (error) {
      throw new Error(`Error finding service booking: ${error.message}`);
    }
  }

  static async findByBookingId(bookingId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const booking = await db.collection('service_bookings').findOne({ bookingId: bookingId });
      return booking ? new ServiceBooking(booking) : null;
    } catch (error) {
      throw new Error(`Error finding service booking by bookingId: ${error.message}`);
    }
  }

  static async findByUserId(userId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookings = await db.collection('service_bookings').find({ userId: new ObjectId(userId) }).toArray();
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding service bookings by userId: ${error.message}`);
    }
  }

  static async findByServiceCenter(serviceCenterId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookings = await db.collection('service_bookings').find({ serviceCenterId: new ObjectId(serviceCenterId) }).toArray();
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding service bookings by serviceCenterId: ${error.message}`);
    }
  }

  static async findByStatus(status) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookings = await db.collection('service_bookings').find({ status: status }).toArray();
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding service bookings by status: ${error.message}`);
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookings = await db.collection('service_bookings').find({
        appointmentDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).toArray();
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding service bookings by date range: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      // Generate bookingId if not provided
      if (!data.bookingId) {
        data.bookingId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const bookingData = {
        ...data,
        userId: new ObjectId(data.userId),
        vehicleId: new ObjectId(data.vehicleId),
        serviceCenterId: new ObjectId(data.serviceCenterId),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('service_bookings').insertOne(bookingData);
      return new ServiceBooking({ ...bookingData, _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error creating service booking: ${error.message}`);
    }
  }

  async save() {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing
        await db.collection('service_bookings').updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        // Create new
        const result = await db.collection('service_bookings').insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving service booking: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const updateData = {
        ...update,
        updatedAt: new Date()
      };
      
      // Convert ObjectIds if present
      if (update.userId) updateData.userId = new ObjectId(update.userId);
      if (update.vehicleId) updateData.vehicleId = new ObjectId(update.vehicleId);
      if (update.serviceCenterId) updateData.serviceCenterId = new ObjectId(update.serviceCenterId);
      
      const result = await db.collection('service_bookings').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value ? new ServiceBooking(result.value) : null;
    } catch (error) {
      throw new Error(`Error updating service booking: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('service_bookings').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value ? new ServiceBooking(result.value) : null;
    } catch (error) {
      throw new Error(`Error deleting service booking: ${error.message}`);
    }
  }

  // Update booking status
  async updateStatus(newStatus) {
    try {
      this.status = newStatus;
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating booking status: ${error.message}`);
    }
  }

  // Add service to booking
  async addService(serviceData) {
    try {
      this.services.push({
        serviceId: new ObjectId(serviceData.serviceId),
        quantity: serviceData.quantity || 1,
        price: serviceData.price || 0,
        totalPrice: (serviceData.price || 0) * (serviceData.quantity || 1)
      });
      
      // Recalculate total amount
      this.totalAmount = this.services.reduce((sum, service) => sum + service.totalPrice, 0);
      
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error adding service to booking: ${error.message}`);
    }
  }

  // Update quotation
  async updateQuotation(quotationData) {
    try {
      this.quotation = {
        ...this.quotation,
        ...quotationData,
        quotationDate: new Date()
      };
      
      if (quotationData.services) {
        this.quotation.services = quotationData.services.map(service => ({
          ...service,
          serviceId: new ObjectId(service.serviceId)
        }));
      }
      
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating quotation: ${error.message}`);
    }
  }

  // Update payment
  async updatePayment(paymentData) {
    try {
      this.payment = {
        ...this.payment,
        ...paymentData,
        transactionDate: new Date()
      };
      
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }
  }

  // Get booking statistics
  static async getBookingStats(userId = null, serviceCenterId = null) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const matchStage = {};
      if (userId) matchStage.userId = new ObjectId(userId);
      if (serviceCenterId) matchStage.serviceCenterId = new ObjectId(serviceCenterId);
      
      const stats = await db.collection('service_bookings').aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            averageAmount: { $avg: '$totalAmount' },
            statusBreakdown: {
              $push: '$status'
            }
          }
        }
      ]).toArray();
      
      if (stats.length === 0) {
        return {
          totalBookings: 0,
          totalAmount: 0,
          averageAmount: 0,
          statusBreakdown: {}
        };
      }
      
      // Calculate status breakdown
      const statusCounts = {};
      stats[0].statusBreakdown.forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      return {
        totalBookings: stats[0].totalBookings,
        totalAmount: stats[0].totalAmount,
        averageAmount: stats[0].averageAmount,
        statusBreakdown: statusCounts
      };
    } catch (error) {
      throw new Error(`Error getting booking stats: ${error.message}`);
    }
  }

  // Find upcoming bookings
  static async findUpcomingBookings(userId = null, days = 7) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const matchStage = {
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['pending', 'confirmed'] }
      };
      
      if (userId) matchStage.userId = new ObjectId(userId);
      
      const bookings = await db.collection('service_bookings').find(matchStage).toArray();
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding upcoming bookings: ${error.message}`);
    }
  }

  // Find overdue bookings
  static async findOverdueBookings() {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const bookings = await db.collection('service_bookings').find({
        appointmentDate: { $lt: new Date() },
        status: { $in: ['pending', 'confirmed'] }
      }).toArray();
      
      return bookings.map(booking => new ServiceBooking(booking));
    } catch (error) {
      throw new Error(`Error finding overdue bookings: ${error.message}`);
    }
  }

  // Cancel booking
  async cancelBooking(reason = '') {
    try {
      this.status = 'cancelled';
      this.cancellationReason = reason;
      this.cancelledAt = new Date();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error cancelling booking: ${error.message}`);
    }
  }

  // Complete booking
  async completeBooking(completionNotes = '') {
    try {
      this.status = 'completed';
      this.completionNotes = completionNotes;
      this.completedAt = new Date();
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error completing booking: ${error.message}`);
    }
  }
}

module.exports = ServiceBooking;
