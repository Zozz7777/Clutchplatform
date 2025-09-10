const { getDb } = require('../config/database');

class Maintenance {
  constructor() {
    this.collectionName = 'maintenance';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(maintenanceData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...maintenanceData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding maintenance by ID:', error);
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
      console.error('Error updating maintenance:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const collection = await this.getCollection();
      return await collection.find(query).toArray();
    } catch (error) {
      console.error('Error finding maintenance records:', error);
      throw error;
    }
  }
}

module.exports = new Maintenance();
