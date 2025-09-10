const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

class Client {
  constructor(data) {
    if (!data) {
      throw new Error('Client data is required');
    }
    
    this._id = data._id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.fcmToken = data.fcmToken;
    this.deviceType = data.deviceType;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const client = await db.collection('clients').findOne({ _id: id });
      return client ? new Client(client) : null;
    } catch (error) {
      throw new Error(`Error finding client: ${error.message}`);
    }
  }

  static async findOne(query) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const client = await db.collection('clients').findOne(query);
      return client ? new Client(client) : null;
    } catch (error) {
      throw new Error(`Error finding client: ${error.message}`);
    }
  }

  static async find(query = {}) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const clients = await db.collection('clients').find(query).toArray();
      return clients.map(client => new Client(client));
    } catch (error) {
      throw new Error(`Error finding clients: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const clientData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('clients').insertOne(clientData);
      return new Client({ ...clientData, _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error creating client: ${error.message}`);
    }
  }

  async save() {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing
        await db.collection('clients').updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        // Create new
        const result = await db.collection('clients').insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving client: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('clients').findOneAndUpdate(
        { _id: id },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value ? new Client(result.value) : null;
    } catch (error) {
      throw new Error(`Error updating client: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection not available');
      }
      const result = await db.collection('clients').findOneAndDelete({ _id: id });
      return result.value ? new Client(result.value) : null;
    } catch (error) {
      throw new Error(`Error deleting client: ${error.message}`);
    }
  }
}

module.exports = Client;
