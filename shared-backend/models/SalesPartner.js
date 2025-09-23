const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class SalesPartner {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.name = data.name;
    this.type = data.type; // 'shop','service_center','importer','manufacturer'
    this.address = data.address;
    this.contact = data.contact;
    this.city = data.city;
    this.country = data.country;
    this.inventorySynced = data.inventorySynced || false;
    this.status = data.status || 'pending'; // 'pending','active','suspended'
    this.createdBy = data.createdBy ? new ObjectId(data.createdBy) : null; // References employees collection
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('sales_partners');
      const partner = await collection.findOne({ _id: new ObjectId(id) });
      return partner ? new SalesPartner(partner) : null;
    } catch (error) {
      console.error('Error finding sales partner by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('sales_partners');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const partners = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return partners.map(partner => new SalesPartner(partner));
    } catch (error) {
      console.error('Error finding sales partners:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('sales_partners');
      const partner = new SalesPartner(data);
      const result = await collection.insertOne(partner);
      return new SalesPartner({ ...partner, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating sales partner:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('sales_partners');
      this.updatedAt = new Date();
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving sales partner:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const collection = await getCollection('sales_partners');
      this.updatedAt = new Date();
      const result = await collection.updateOne(
        { _id: this._id },
        { $set: { ...updateData, updatedAt: this.updatedAt } }
      );
      return result;
    } catch (error) {
      console.error('Error updating sales partner:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const collection = await getCollection('sales_partners');
      const result = await collection.deleteOne({ _id: this._id });
      return result;
    } catch (error) {
      console.error('Error deleting sales partner:', error);
      throw error;
    }
  }

  async syncInventory() {
    try {
      this.inventorySynced = true;
      await this.save();
      return this;
    } catch (error) {
      console.error('Error syncing sales partner inventory:', error);
      throw error;
    }
  }

  static async findByStatus(status) {
    try {
      const collection = await getCollection('sales_partners');
      const partners = await collection.find({ status }).toArray();
      return partners.map(partner => new SalesPartner(partner));
    } catch (error) {
      console.error('Error finding sales partners by status:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const collection = await getCollection('sales_partners');
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
      console.error('Error getting sales partner stats:', error);
      throw error;
    }
  }
}

module.exports = SalesPartner;
