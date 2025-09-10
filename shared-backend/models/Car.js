const { getDb } = require('../config/database');

class Car {
  constructor() {
    this.collectionName = 'cars';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(carData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...carData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding car by ID:', error);
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
      console.error('Error updating car:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const collection = await this.getCollection();
      return await collection.find(query).toArray();
    } catch (error) {
      console.error('Error finding cars:', error);
      throw error;
    }
  }
}

module.exports = new Car();
