const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class Contract {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.leadId = data.leadId ? new ObjectId(data.leadId) : null;
    this.partnerId = data.partnerId ? new ObjectId(data.partnerId) : null;
    this.templateId = data.templateId;
    this.draftPdfUrl = data.draftPdfUrl;
    this.signedPdfUrl = data.signedPdfUrl;
    this.metadata = {
      signedDate: data.metadata?.signedDate,
      repId: data.metadata?.repId ? new ObjectId(data.metadata.repId) : null, // References employees collection
      notes: data.metadata?.notes
    };
    this.status = data.status || 'draft'; // 'draft','printed','signed_uploaded','pending_legal','approved','rejected'
    this.legalReview = {
      reviewerId: data.legalReview?.reviewerId ? new ObjectId(data.legalReview.reviewerId) : null, // References employees collection
      approved: data.legalReview?.approved,
      reason: data.legalReview?.reason,
      reviewedAt: data.legalReview?.reviewedAt
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('contracts');
      const contract = await collection.findOne({ _id: new ObjectId(id) });
      return contract ? new Contract(contract) : null;
    } catch (error) {
      console.error('Error finding contract by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('contracts');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const contracts = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return contracts.map(contract => new Contract(contract));
    } catch (error) {
      console.error('Error finding contracts:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('contracts');
      const contract = new Contract(data);
      const result = await collection.insertOne(contract);
      return new Contract({ ...contract, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('contracts');
      this.updatedAt = new Date();
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving contract:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const collection = await getCollection('contracts');
      this.updatedAt = new Date();
      const result = await collection.updateOne(
        { _id: this._id },
        { $set: { ...updateData, updatedAt: this.updatedAt } }
      );
      return result;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const collection = await getCollection('contracts');
      const result = await collection.deleteOne({ _id: this._id });
      return result;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  // Update contract status
  async updateStatus(status, reviewerId, reason = null) {
    try {
      this.status = status;
      this.legalReview = {
        reviewerId: reviewerId ? new ObjectId(reviewerId) : null, // References employees collection
        approved: status === 'approved',
        reason,
        reviewedAt: new Date()
      };
      await this.save();
      return this;
    } catch (error) {
      console.error('Error updating contract status:', error);
      throw error;
    }
  }

  // Get contracts by status
  static async findByStatus(status) {
    try {
      const collection = await getCollection('contracts');
      const contracts = await collection.find({ status }).toArray();
      return contracts.map(contract => new Contract(contract));
    } catch (error) {
      console.error('Error finding contracts by status:', error);
      throw error;
    }
  }

  // Get contract statistics
  static async getStats() {
    try {
      const collection = await getCollection('contracts');
      const pipeline = [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ];
      const stats = await collection.aggregate(pipeline).toArray();
      return stats;
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw error;
    }
  }
}

module.exports = Contract;
