const { getDb } = require('../config/database');

class Insurance {
  constructor() {
    this.collectionName = 'insurance';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(insuranceData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...insuranceData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      return result;
    } catch (error) {
      console.error('Error creating insurance record:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id, isActive: true });
    } catch (error) {
      console.error('Error finding insurance by ID:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating insurance:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      return result;
    } catch (error) {
      console.error('Error deleting insurance:', error);
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ userId, isActive: true }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding insurance by user ID:', error);
      throw error;
    }
  }

  async findByVehicleId(vehicleId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ vehicleId, isActive: true }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding insurance by vehicle ID:', error);
      throw error;
    }
  }

  async findExpiringSoon(daysThreshold = 30) {
    try {
      const collection = await this.getCollection();
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
      
      return await collection.find({
        expiryDate: { $lte: thresholdDate },
        isActive: true
      }).toArray();
    } catch (error) {
      console.error('Error finding expiring insurance:', error);
      throw error;
    }
  }

  async compareRates(vehicleData, userData) {
    try {
      const collection = await this.getCollection();
      // This would typically integrate with external insurance APIs
      // For now, return mock comparison data
      return [
        {
          provider: 'Provider A',
          monthlyRate: 150,
          coverage: 'Comprehensive',
          deductible: 500,
          features: ['Roadside Assistance', 'Rental Car', 'Glass Coverage']
        },
        {
          provider: 'Provider B',
          monthlyRate: 180,
          coverage: 'Comprehensive',
          deductible: 300,
          features: ['Roadside Assistance', 'Rental Car', 'Glass Coverage', 'Accident Forgiveness']
        },
        {
          provider: 'Provider C',
          monthlyRate: 120,
          coverage: 'Liability Only',
          deductible: 1000,
          features: ['Basic Coverage']
        }
      ];
    } catch (error) {
      console.error('Error comparing insurance rates:', error);
      throw error;
    }
  }
}

module.exports = new Insurance();
