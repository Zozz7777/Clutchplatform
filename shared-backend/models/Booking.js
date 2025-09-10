const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class Booking {
  constructor(data) {
    if (!data) {
      throw new Error('Booking data is required');
    }
    
    this._id = data._id;
    this.userId = data.userId;
    this.mechanicId = data.mechanicId;
    this.serviceType = data.serviceType;
    this.status = data.status || 'pending';
    this.scheduledDate = data.scheduledDate;
    this.location = data.location;
    this.description = data.description;
    this.estimatedCost = data.estimatedCost;
    this.actualCost = data.actualCost;
    this.rating = data.rating;
    this.review = data.review;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const booking = await db.collection('bookings').findOne({ _id: id });
      return booking ? new Booking(booking) : null;
    } catch (error) {
      throw new Error(`Error finding booking: ${error.message}`);
    }
  }

  static async findOne(query) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const booking = await db.collection('bookings').findOne(query);
      return booking ? new Booking(booking) : null;
    } catch (error) {
      throw new Error(`Error finding booking: ${error.message}`);
    }
  }

  static async find(query = {}) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookings = await db.collection('bookings').find(query).toArray();
      return bookings.map(booking => new Booking(booking));
    } catch (error) {
      throw new Error(`Error finding bookings: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const bookingData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('bookings').insertOne(bookingData);
      return new Booking({ ...bookingData, _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
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
        await db.collection('bookings').updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        // Create new
        const result = await db.collection('bookings').insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving booking: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('bookings').findOneAndUpdate(
        { _id: id },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value ? new Booking(result.value) : null;
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('bookings').findOneAndDelete({ _id: id });
      return result.value ? new Booking(result.value) : null;
    } catch (error) {
      throw new Error(`Error deleting booking: ${error.message}`);
    }
  }
}

module.exports = Booking;
