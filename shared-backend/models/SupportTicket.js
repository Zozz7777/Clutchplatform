const { getDb } = require('../config/database');

class SupportTicket {
  constructor() {
    this.collectionName = 'support_tickets';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(ticketData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...ticketData,
        status: ticketData.status || 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding support ticket by ID:', error);
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
      console.error('Error updating support ticket:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const collection = await this.getCollection();
      return await collection.find(query).toArray();
    } catch (error) {
      console.error('Error finding support tickets:', error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ status: status }).toArray();
    } catch (error) {
      console.error('Error finding support tickets by status:', error);
      throw error;
    }
  }
}

module.exports = new SupportTicket();
