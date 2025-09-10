const { getDb } = require('../config/database');

class Vehicle {
  constructor() {
    this.collectionName = 'vehicles';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(vehicleData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...vehicleData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding vehicle by ID:', error);
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
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const collection = await this.getCollection();
      return await collection.find(query).toArray();
    } catch (error) {
      console.error('Error finding vehicles:', error);
      throw error;
    }
  }
}

module.exports = new Vehicle();
