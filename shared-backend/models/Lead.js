const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class Lead {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.title = data.title;
    this.type = data.type; // 'shop','importer','manufacturer','fleet','insurance'
    this.companyName = data.companyName;
    this.contact = {
      name: data.contact?.name,
      email: data.contact?.email,
      phone: data.contact?.phone
    };
    this.address = {
      text: data.address?.text,
      geo: {
        lat: data.address?.geo?.lat,
        lng: data.address?.geo?.lng
      }
    };
    this.source = data.source;
    this.status = data.status || 'new'; // 'new','contacted','qualified','converted','lost'
    this.assignedTo = data.assignedTo && ObjectId.isValid(data.assignedTo) ? new ObjectId(data.assignedTo) : null; // References employees collection
    this.notes = data.notes || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('leads');
      const lead = await collection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
      return lead ? new Lead(lead) : null;
    } catch (error) {
      console.error('Error finding lead by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('leads');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const leads = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return leads.map(lead => new Lead(lead));
    } catch (error) {
      console.error('Error finding leads:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('leads');
      const lead = new Lead(data);
      const result = await collection.insertOne(lead);
      return new Lead({ ...lead, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('leads');
      this.updatedAt = new Date();
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving lead:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const collection = await getCollection('leads');
      this.updatedAt = new Date();
      const result = await collection.updateOne(
        { _id: this._id },
        { $set: { ...updateData, updatedAt: this.updatedAt } }
      );
      return result;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const collection = await getCollection('leads');
      const result = await collection.deleteOne({ _id: this._id });
      return result;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Add note to lead
  async addNote(employeeId, text) {
    try {
      const note = {
        employeeId: ObjectId.isValid(employeeId) ? new ObjectId(employeeId) : employeeId, // References employees collection
        text,
        createdAt: new Date()
      };
      this.notes.push(note);
      await this.save();
      return note;
    } catch (error) {
      console.error('Error adding note to lead:', error);
      throw error;
    }
  }

  // Get lead statistics
  static async getStats() {
    try {
      const collection = await getCollection('leads');
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
      console.error('Error getting lead stats:', error);
      throw error;
    }
  }
}

module.exports = Lead;
