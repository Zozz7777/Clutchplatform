const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class Deal {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.leadId = data.leadId ? new ObjectId(data.leadId) : null;
    this.pipeline = data.pipeline; // 'b2b'|'partners'
    this.stage = data.stage || 'prospect'; // 'prospect','proposal','negotiation','signed'
    this.valueEGP = data.valueEGP || 0;
    this.probability = data.probability || 0;
    this.assignedTo = data.assignedTo ? new ObjectId(data.assignedTo) : null; // References employees collection
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('deals');
      const deal = await collection.findOne({ _id: new ObjectId(id) });
      return deal ? new Deal(deal) : null;
    } catch (error) {
      console.error('Error finding deal by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('deals');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const deals = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return deals.map(deal => new Deal(deal));
    } catch (error) {
      console.error('Error finding deals:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('deals');
      const deal = new Deal(data);
      const result = await collection.insertOne(deal);
      return new Deal({ ...deal, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('deals');
      this.updatedAt = new Date();
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving deal:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const collection = await getCollection('deals');
      this.updatedAt = new Date();
      const result = await collection.updateOne(
        { _id: this._id },
        { $set: { ...updateData, updatedAt: this.updatedAt } }
      );
      return result;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const collection = await getCollection('deals');
      const result = await collection.deleteOne({ _id: this._id });
      return result;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  // Get pipeline data with counts
  static async getPipeline() {
    try {
      const collection = await getCollection('deals');
      const pipeline = [
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$valueEGP' },
            deals: { $push: '$$ROOT' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ];
      const result = await collection.aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      console.error('Error getting pipeline:', error);
      throw error;
    }
  }

  // Get deal statistics
  static async getStats() {
    try {
      const collection = await getCollection('deals');
      const pipeline = [
        {
          $group: {
            _id: null,
            totalDeals: { $sum: 1 },
            totalValue: { $sum: '$valueEGP' },
            avgValue: { $avg: '$valueEGP' },
            avgProbability: { $avg: '$probability' }
          }
        }
      ];
      const stats = await collection.aggregate(pipeline).toArray();
      return stats[0] || { totalDeals: 0, totalValue: 0, avgValue: 0, avgProbability: 0 };
    } catch (error) {
      console.error('Error getting deal stats:', error);
      throw error;
    }
  }
}

module.exports = Deal;
