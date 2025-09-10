const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.db) {
        console.log('✅ Database already connected');
        return this.db;
      }

      let mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/?retryWrites=true&w=majority&appName=Clutch';
      
      // Ensure we're connecting to the clutch database
      const dbName = process.env.MONGODB_DB || 'clutch';
      if (!mongoUri.includes('/' + dbName)) {
        // Add database name to URI if not present
        mongoUri = mongoUri.replace('?', '/' + dbName + '?');
      }
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log(`🔌 Connecting to MongoDB database: ${dbName}...`);
      this.client = new MongoClient(mongoUri, options);
      await this.client.connect();
      
      this.db = this.client.db(dbName);
      this.isConnected = true;
      
      console.log(`✅ MongoDB connected successfully to database: ${dbName}`);
      
      return this.db;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.close();
        this.isConnected = false;
        this.db = null;
        console.log('🔌 MongoDB connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected || !this.db) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      const result = await this.db.admin().ping();
      
      if (result.ok === 1) {
        return { status: 'healthy', message: 'Database is responding' };
      } else {
        return { status: 'unhealthy', message: 'Database ping failed' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async createIndexes() {
    try {
      console.log('📊 Creating database indexes...');
      
      // Create indexes for carparts collection
      const carpartsCollection = this.db.collection('carparts');
      try {
        // First, clean up any duplicate partNumbers
        const duplicates = await carpartsCollection.aggregate([
          { $group: { _id: '$partNumber', count: { $sum: 1 }, docs: { $push: '$_id' } } },
          { $match: { count: { $gt: 1 } } }
        ]).toArray();
        
        if (duplicates.length > 0) {
          console.log(`  🧹 Found ${duplicates.length} duplicate partNumbers, cleaning up...`);
          for (const dup of duplicates) {
            // Keep the first document, remove the rest
            const docsToRemove = dup.docs.slice(1);
            await carpartsCollection.deleteMany({ _id: { $in: docsToRemove } });
          }
        }
        
        await carpartsCollection.createIndex({ partNumber: 1 }, { unique: true });
        await carpartsCollection.createIndex({ category: 1 });
        await carpartsCollection.createIndex({ brand: 1 });
        await carpartsCollection.createIndex({ 'vehicleCompatibility.makes': 1 });
        await carpartsCollection.createIndex({ 'vehicleCompatibility.models': 1 });
        await carpartsCollection.createIndex({ 'vehicleCompatibility.years.start': 1 });
        await carpartsCollection.createIndex({ 'vehicleCompatibility.years.end': 1 });
        console.log('  ✅ Indexes created for carparts');
      } catch (indexError) {
        if (indexError.code === 11000) {
          console.log('  ⚠️  Indexes already exist for carparts (skipping)');
        } else {
          console.error('  ❌ Error creating indexes for carparts:', indexError.message);
        }
      }

      // Create indexes for obdelements collection
      const obdelementsCollection = this.db.collection('obdelements');
      try {
        await obdelementsCollection.createIndex({ code: 1 }, { unique: true });
        await obdelementsCollection.createIndex({ category: 1 });
        await obdelementsCollection.createIndex({ severity: 1 });
        console.log('  ✅ Indexes created for obdelements');
      } catch (indexError) {
        if (indexError.code === 11000) {
          console.log('  ⚠️  Indexes already exist for obdelements (skipping)');
        } else {
          console.error('  ❌ Error creating indexes for obdelements:', indexError.message);
        }
      }

      // Create indexes for car brands collection
      const carBrandsCollection = this.db.collection('carbrands');
      try {
        await carBrandsCollection.createIndex({ name: 1 }, { unique: true });
        await carBrandsCollection.createIndex({ region: 1 });
        console.log('  ✅ Indexes created for carbrands');
      } catch (indexError) {
        if (indexError.code === 11000) {
          console.log('  ⚠️  Indexes already exist for carbrands (skipping)');
        } else {
          console.error('  ❌ Error creating indexes for carbrands:', indexError.message);
        }
      }

      // Create indexes for car models collection
      const carModelsCollection = this.db.collection('carmodels');
      try {
        await carModelsCollection.createIndex({ name: 1 });
        await carModelsCollection.createIndex({ brandId: 1 });
        await carModelsCollection.createIndex({ year: 1 });
        console.log('  ✅ Indexes created for carmodels');
      } catch (indexError) {
        if (indexError.code === 11000) {
          console.log('  ⚠️  Indexes already exist for carmodels (skipping)');
        } else {
          console.error('  ❌ Error creating indexes for carmodels:', indexError.message);
        }
      }

      console.log('✅ All indexes processed successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  async dropCollection(collectionName) {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const collections = await this.db.listCollections().toArray();
      const collectionExists = collections.some(col => col.name === collectionName);

      if (collectionExists) {
        await this.db.collection(collectionName).drop();
        console.log(`🗑️  Dropped collection: ${collectionName}`);
        return true;
      } else {
        console.log(`ℹ️  Collection does not exist: ${collectionName}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error dropping collection ${collectionName}:`, error);
      throw error;
    }
  }

  async clearCollection(collectionName) {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const result = await this.db.collection(collectionName).deleteMany({});
      console.log(`🧹 Cleared ${result.deletedCount} documents from ${collectionName}`);
      return result.deletedCount;
    } catch (error) {
      console.error(`❌ Error clearing collection ${collectionName}:`, error);
      throw error;
    }
  }

  async getCollectionStats(collectionName) {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const collection = this.db.collection(collectionName);
      const count = await collection.countDocuments();
      
      return {
        name: collectionName,
        count: count,
        size: 0, // Not available without stats()
        avgObjSize: 0, // Not available without stats()
        storageSize: 0, // Not available without stats()
        indexes: 1 // Default index count
      };
    } catch (error) {
      console.error(`❌ Error getting stats for collection ${collectionName}:`, error);
      throw error;
    }
  }

  async getAllCollectionStats() {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const collections = await this.db.listCollections().toArray();
      const stats = [];

      for (const collection of collections) {
        try {
          const collectionStats = await this.getCollectionStats(collection.name);
          stats.push(collectionStats);
        } catch (error) {
          console.warn(`⚠️  Could not get stats for ${collection.name}:`, error.message);
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting all collection stats:', error);
      throw error;
    }
  }

  async backupCollection(collectionName, backupName = null) {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupCollectionName = backupName || `${collectionName}_backup_${timestamp}`;

      const sourceCollection = this.db.collection(collectionName);
      const backupCollection = this.db.collection(backupCollectionName);

      // Check if source collection exists
      const collections = await this.db.listCollections().toArray();
      const sourceExists = collections.some(col => col.name === collectionName);

      if (!sourceExists) {
        throw new Error(`Source collection ${collectionName} does not exist`);
      }

      // Copy all documents to backup collection
      const documents = await sourceCollection.find({}).toArray();
      if (documents.length > 0) {
        await backupCollection.insertMany(documents);
      }

      console.log(`💾 Backed up ${documents.length} documents from ${collectionName} to ${backupCollectionName}`);
      return { backupCollectionName, documentCount: documents.length };
    } catch (error) {
      console.error(`❌ Error backing up collection ${collectionName}:`, error);
      throw error;
    }
  }

  async restoreCollection(backupCollectionName, targetCollectionName) {
    try {
      if (!this.isConnected || !this.db) {
        throw new Error('Database not connected');
      }

      const backupCollection = this.db.collection(backupCollectionName);
      const targetCollection = this.db.collection(targetCollectionName);

      // Check if backup collection exists
      const collections = await this.db.listCollections().toArray();
      const backupExists = collections.some(col => col.name === backupCollectionName);

      if (!backupExists) {
        throw new Error(`Backup collection ${backupCollectionName} does not exist`);
      }

      // Clear target collection if it exists
      const targetExists = collections.some(col => col.name === targetCollectionName);
      if (targetExists) {
        await targetCollection.deleteMany({});
      }

      // Copy all documents from backup to target
      const documents = await backupCollection.find({}).toArray();
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
      }

      console.log(`🔄 Restored ${documents.length} documents from ${backupCollectionName} to ${targetCollectionName}`);
      return { documentCount: documents.length };
    } catch (error) {
      console.error(`❌ Error restoring collection from ${backupCollectionName}:`, error);
      throw error;
    }
  }

  // Get database instance
  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  // Get collection
  getCollection(collectionName) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(collectionName);
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = databaseConfig;
