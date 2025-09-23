const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class Communication {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.leadId = data.leadId ? new ObjectId(data.leadId) : null;
    this.partnerId = data.partnerId ? new ObjectId(data.partnerId) : null;
    this.type = data.type; // 'call','visit','email','whatsapp'
    this.subject = data.subject;
    this.body = data.body;
    this.attachments = data.attachments || [];
    this.outcome = data.outcome; // 'left-msg','no-answer','successful'
    this.date = data.date || new Date();
    this.createdBy = data.createdBy ? new ObjectId(data.createdBy) : null; // References employees collection
    this.createdAt = data.createdAt || new Date();
  }

  static async findById(id) {
    try {
      const collection = await getCollection('communications');
      const communication = await collection.findOne({ _id: new ObjectId(id) });
      return communication ? new Communication(communication) : null;
    } catch (error) {
      console.error('Error finding communication by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('communications');
      const { skip = 0, limit = 50, sort = { date: -1 } } = options;
      
      const communications = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return communications.map(comm => new Communication(comm));
    } catch (error) {
      console.error('Error finding communications:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('communications');
      const communication = new Communication(data);
      const result = await collection.insertOne(communication);
      return new Communication({ ...communication, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('communications');
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving communication:', error);
      throw error;
    }
  }
}

module.exports = Communication;