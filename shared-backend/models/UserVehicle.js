const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class UserVehicle {
  constructor(data) {
    if (!data) {
      throw new Error('UserVehicle data is required');
    }
    
    this._id = data._id;
    this.userId = data.userId;
    this.vehicleId = data.vehicleId;
    this.brandId = data.brandId;
    this.modelId = data.modelId;
    this.year = data.year;
    this.licensePlate = data.licensePlate;
    this.vin = data.vin;
    this.color = data.color;
    this.mileage = data.mileage || 0;
    this.fuelType = data.fuelType || 'gasoline';
    this.transmissionType = data.transmissionType || 'automatic';
    this.engineSize = data.engineSize;
    this.isPrimary = data.isPrimary || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Vehicle Health
    this.health = data.health || {
      overallHealth: 100,
      lastHealthCheck: new Date(),
      healthHistory: []
    };
  }

  static async findById(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicle = await db.collection('user_vehicles').findOne({ _id: new ObjectId(id) });
      return vehicle ? new UserVehicle(vehicle) : null;
    } catch (error) {
      throw new Error(`Error finding user vehicle: ${error.message}`);
    }
  }

  static async findByVehicleId(vehicleId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicle = await db.collection('user_vehicles').findOne({ vehicleId: vehicleId });
      return vehicle ? new UserVehicle(vehicle) : null;
    } catch (error) {
      throw new Error(`Error finding user vehicle by vehicleId: ${error.message}`);
    }
  }

  static async findByUserId(userId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicles = await db.collection('user_vehicles').find({ userId: new ObjectId(userId) }).toArray();
      return vehicles.map(vehicle => new UserVehicle(vehicle));
    } catch (error) {
      throw new Error(`Error finding user vehicles: ${error.message}`);
    }
  }

  static async findByLicensePlate(licensePlate) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicle = await db.collection('user_vehicles').findOne({ licensePlate: licensePlate });
      return vehicle ? new UserVehicle(vehicle) : null;
    } catch (error) {
      throw new Error(`Error finding user vehicle by license plate: ${error.message}`);
    }
  }

  static async findByVin(vin) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicle = await db.collection('user_vehicles').findOne({ vin: vin });
      return vehicle ? new UserVehicle(vehicle) : null;
    } catch (error) {
      throw new Error(`Error finding user vehicle by VIN: ${error.message}`);
    }
  }

  static async findPrimaryVehicle(userId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicle = await db.collection('user_vehicles').findOne({ 
        userId: new ObjectId(userId), 
        isPrimary: true,
        isActive: true
      });
      return vehicle ? new UserVehicle(vehicle) : null;
    } catch (error) {
      throw new Error(`Error finding primary vehicle: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      // Generate vehicleId if not provided
      if (!data.vehicleId) {
        data.vehicleId = `VEH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const vehicleData = {
        ...data,
        userId: new ObjectId(data.userId),
        brandId: data.brandId ? new ObjectId(data.brandId) : null,
        modelId: data.modelId ? new ObjectId(data.modelId) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('user_vehicles').insertOne(vehicleData);
      return new UserVehicle({ ...vehicleData, _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error creating user vehicle: ${error.message}`);
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
        await db.collection('user_vehicles').updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        // Create new
        const result = await db.collection('user_vehicles').insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving user vehicle: ${error.message}`);
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
      if (update.brandId) updateData.brandId = new ObjectId(update.brandId);
      if (update.modelId) updateData.modelId = new ObjectId(update.modelId);
      
      const result = await db.collection('user_vehicles').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value ? new UserVehicle(result.value) : null;
    } catch (error) {
      throw new Error(`Error updating user vehicle: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('user_vehicles').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value ? new UserVehicle(result.value) : null;
    } catch (error) {
      throw new Error(`Error deleting user vehicle: ${error.message}`);
    }
  }

  // Update vehicle health
  async updateHealth(healthData) {
    try {
      this.health = {
        ...this.health,
        ...healthData,
        lastHealthCheck: new Date()
      };
      
      // Add to health history
      this.health.healthHistory.push({
        date: new Date(),
        health: healthData.overallHealth || this.health.overallHealth,
        notes: healthData.notes || ''
      });
      
      // Keep only last 10 health records
      if (this.health.healthHistory.length > 10) {
        this.health.healthHistory = this.health.healthHistory.slice(-10);
      }
      
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating vehicle health: ${error.message}`);
    }
  }

  // Update mileage
  async updateMileage(newMileage) {
    try {
      this.mileage = newMileage;
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error updating mileage: ${error.message}`);
    }
  }

  // Set as primary vehicle
  async setAsPrimary() {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      // Remove primary flag from all user vehicles
      await db.collection('user_vehicles').updateMany(
        { userId: this.userId },
        { $set: { isPrimary: false } }
      );
      
      // Set this vehicle as primary
      this.isPrimary = true;
      await this.save();
      return this;
    } catch (error) {
      throw new Error(`Error setting vehicle as primary: ${error.message}`);
    }
  }

  // Get vehicle statistics
  static async getVehicleStats(userId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const stats = await db.collection('user_vehicles').aggregate([
        { $match: { userId: new ObjectId(userId), isActive: true } },
        {
          $group: {
            _id: null,
            totalVehicles: { $sum: 1 },
            totalMileage: { $sum: '$mileage' },
            averageHealth: { $avg: '$health.overallHealth' },
            primaryVehicle: {
              $push: {
                $cond: [{ $eq: ['$isPrimary', true] }, '$$ROOT', null]
              }
            }
          }
        }
      ]).toArray();
      
      return stats[0] || {
        totalVehicles: 0,
        totalMileage: 0,
        averageHealth: 0,
        primaryVehicle: null
      };
    } catch (error) {
      throw new Error(`Error getting vehicle stats: ${error.message}`);
    }
  }

  // Find vehicles by brand
  static async findByBrand(userId, brandId) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicles = await db.collection('user_vehicles').find({ 
        userId: new ObjectId(userId), 
        brandId: new ObjectId(brandId),
        isActive: true
      }).toArray();
      return vehicles.map(vehicle => new UserVehicle(vehicle));
    } catch (error) {
      throw new Error(`Error finding vehicles by brand: ${error.message}`);
    }
  }

  // Find vehicles needing maintenance
  static async findNeedingMaintenance(userId, healthThreshold = 70) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const vehicles = await db.collection('user_vehicles').find({ 
        userId: new ObjectId(userId), 
        'health.overallHealth': { $lt: healthThreshold },
        isActive: true
      }).toArray();
      return vehicles.map(vehicle => new UserVehicle(vehicle));
    } catch (error) {
      throw new Error(`Error finding vehicles needing maintenance: ${error.message}`);
    }
  }
}

module.exports = UserVehicle;
