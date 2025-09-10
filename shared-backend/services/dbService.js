const { getDb } = require('../config/database');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async getDatabase() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  async getCollection(collectionName) {
    const db = await this.getDatabase();
    return db.collection(collectionName);
  }

  async findOne(collectionName, query) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.findOne(query);
    } catch (error) {
      throw new Error(`Database findOne error: ${error.message}`);
    }
  }

  async find(collectionName, query = {}) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.find(query).toArray();
    } catch (error) {
      throw new Error(`Database find error: ${error.message}`);
    }
  }

  async insertOne(collectionName, document) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.insertOne(document);
    } catch (error) {
      throw new Error(`Database insertOne error: ${error.message}`);
    }
  }

  async insertMany(collectionName, documents) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.insertMany(documents);
    } catch (error) {
      throw new Error(`Database insertMany error: ${error.message}`);
    }
  }

  async updateOne(collectionName, filter, update) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.updateOne(filter, update);
    } catch (error) {
      throw new Error(`Database updateOne error: ${error.message}`);
    }
  }

  async updateMany(collectionName, filter, update) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.updateMany(filter, update);
    } catch (error) {
      throw new Error(`Database updateMany error: ${error.message}`);
    }
  }

  async deleteOne(collectionName, filter) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.deleteOne(filter);
    } catch (error) {
      throw new Error(`Database deleteOne error: ${error.message}`);
    }
  }

  async deleteMany(collectionName, filter) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.deleteMany(filter);
    } catch (error) {
      throw new Error(`Database deleteMany error: ${error.message}`);
    }
  }

  async aggregate(collectionName, pipeline) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      throw new Error(`Database aggregate error: ${error.message}`);
    }
  }

  async countDocuments(collectionName, filter = {}) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.countDocuments(filter);
    } catch (error) {
      throw new Error(`Database countDocuments error: ${error.message}`);
    }
  }

  async distinct(collectionName, field, filter = {}) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.distinct(field, filter);
    } catch (error) {
      throw new Error(`Database distinct error: ${error.message}`);
    }
  }

  async createIndex(collectionName, indexSpec, options = {}) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.createIndex(indexSpec, options);
    } catch (error) {
      throw new Error(`Database createIndex error: ${error.message}`);
    }
  }

  async dropIndex(collectionName, indexName) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.dropIndex(indexName);
    } catch (error) {
      throw new Error(`Database dropIndex error: ${error.message}`);
    }
  }

  async listIndexes(collectionName) {
    try {
      const collection = await this.getCollection(collectionName);
      return await collection.listIndexes().toArray();
    } catch (error) {
      throw new Error(`Database listIndexes error: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const dbService = new DatabaseService();
module.exports = dbService;
