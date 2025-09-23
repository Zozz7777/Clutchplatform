const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class Approval {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.resourceType = data.resourceType; // 'contract','job_post','deal'
    this.resourceId = data.resourceId ? new ObjectId(data.resourceId) : null;
    this.requesterId = data.requesterId ? new ObjectId(data.requesterId) : null; // References employees collection
    this.approverRole = data.approverRole;
    this.status = data.status || 'pending'; // 'pending'|'approved'|'rejected'
    this.history = data.history || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(id) {
    try {
      const collection = await getCollection('approvals');
      const approval = await collection.findOne({ _id: new ObjectId(id) });
      return approval ? new Approval(approval) : null;
    } catch (error) {
      console.error('Error finding approval by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('approvals');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const approvals = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return approvals.map(approval => new Approval(approval));
    } catch (error) {
      console.error('Error finding approvals:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('approvals');
      const approval = new Approval(data);
      const result = await collection.insertOne(approval);
      return new Approval({ ...approval, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating approval:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('approvals');
      this.updatedAt = new Date();
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving approval:', error);
      throw error;
    }
  }

  async addHistoryEntry(actorId, action, reason = null) {
    try {
      const entry = {
        actorId: new ObjectId(actorId), // References employees collection
        action,
        reason,
        at: new Date()
      };
      this.history.push(entry);
      await this.save();
      return entry;
    } catch (error) {
      console.error('Error adding history entry:', error);
      throw error;
    }
  }

  async updateStatus(status, actorId, reason = null) {
    try {
      this.status = status;
      await this.addHistoryEntry(actorId, status, reason);
      await this.save();
      return this;
    } catch (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
  }
}

module.exports = Approval;
