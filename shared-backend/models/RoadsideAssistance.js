const { getDb } = require('../config/database');

class RoadsideAssistance {
  constructor() {
    this.collectionName = 'roadsideAssistance';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(assistanceData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...assistanceData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating roadside assistance request:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding roadside assistance by ID:', error);
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
      console.error('Error updating roadside assistance:', error);
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding roadside assistance by user ID:', error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ status }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding roadside assistance by status:', error);
      throw error;
    }
  }

  async assignMechanic(assistanceId, mechanicId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: assistanceId },
        { 
          $set: {
            mechanicId,
            status: 'assigned',
            assignedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error assigning mechanic to roadside assistance:', error);
      throw error;
    }
  }

  async updateStatus(assistanceId, status, additionalData = {}) {
    try {
      const collection = await this.getCollection();
      const updateData = {
        status,
        updatedAt: new Date(),
        ...additionalData
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'in_progress') {
        updateData.startedAt = new Date();
      }

      const result = await collection.updateOne(
        { _id: assistanceId },
        { $set: updateData }
      );
      return result;
    } catch (error) {
      console.error('Error updating roadside assistance status:', error);
      throw error;
    }
  }
}

module.exports = new RoadsideAssistance();
