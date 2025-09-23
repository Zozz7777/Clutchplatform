const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class SalesActivity {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.userId = data.userId ? new ObjectId(data.userId) : null; // References employees collection
    this.type = data.type; // 'visit'|'call'|'email'|'meeting'
    this.targetId = data.targetId ? new ObjectId(data.targetId) : null;
    this.notes = data.notes;
    this.attachments = data.attachments || [];
    this.createdAt = data.createdAt || new Date();
  }

  static async findById(id) {
    try {
      const collection = await getCollection('sales_activities');
      const activity = await collection.findOne({ _id: new ObjectId(id) });
      return activity ? new SalesActivity(activity) : null;
    } catch (error) {
      console.error('Error finding sales activity by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('sales_activities');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const activities = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return activities.map(activity => new SalesActivity(activity));
    } catch (error) {
      console.error('Error finding sales activities:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('sales_activities');
      const activity = new SalesActivity(data);
      const result = await collection.insertOne(activity);
      return new SalesActivity({ ...activity, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating sales activity:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('sales_activities');
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving sales activity:', error);
      throw error;
    }
  }
}

module.exports = SalesActivity;
