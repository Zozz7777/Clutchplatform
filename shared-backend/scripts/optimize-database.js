#!/usr/bin/env node

require('dotenv').config();
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');

/**
 * Database Optimization Script
 * Analyzes and optimizes MongoDB collections for better performance
 */

class DatabaseOptimizer {
  constructor() {
    this.db = null;
    this.optimizations = [];
  }

  async connect() {
    try {
      // Use the shared native connection
      const users = await getCollection('users');
      this.db = users.client.db();
      logger.info('✅ Connected to MongoDB (native) for optimization');
    } catch (error) {
      logger.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async analyzeCollections() {
    logger.info('🔍 Analyzing collections...');
    
    const collections = await this.db.listCollections().toArray();
    const analysis = [];

    for (const collection of collections) {
      logger.info(`Analyzing collection: ${collection.name}`);
      
      try {
        const stats = await this.db.collection(collection.name).stats();
        const indexes = await this.db.collection(collection.name).indexes();
        
        analysis.push({
          name: collection.name,
          stats: {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            storageSize: stats.storageSize,
            indexes: stats.nindexes,
            totalIndexSize: stats.totalIndexSize
          },
          indexes: indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false,
            background: idx.background || false
          }))
        });
      } catch (error) {
        logger.error(`Error analyzing collection ${collection.name}:`, error);
      }
    }

    return analysis;
  }

  async optimizeIndexes() {
    logger.info('🔧 Optimizing indexes...');
    
    const optimizations = [];

    // Common index optimizations for different collections
    const indexOptimizations = {
      users: [
        { key: { email: 1 }, unique: true, background: true },
        { key: { phone: 1 }, sparse: true, background: true },
        { key: { createdAt: -1 }, background: true },
        { key: { status: 1, createdAt: -1 }, background: true }
      ],
      bookings: [
        { key: { userId: 1, createdAt: -1 }, background: true },
        { key: { mechanicId: 1, status: 1 }, background: true },
        { key: { status: 1, scheduledDate: 1 }, background: true },
        { key: { createdAt: -1 }, background: true },
        { key: { scheduledDate: 1, status: 1 }, background: true }
      ],
      mechanics: [
        { key: { location: '2dsphere' }, background: true },
        { key: { specialties: 1 }, background: true },
        { key: { rating: -1 }, background: true },
        { key: { status: 1, rating: -1 }, background: true }
      ],
      services: [
        { key: { category: 1, price: 1 }, background: true },
        { key: { name: 'text' }, background: true },
        { key: { isActive: 1, category: 1 }, background: true }
      ],
      payments: [
        { key: { userId: 1, createdAt: -1 }, background: true },
        { key: { bookingId: 1 }, background: true },
        { key: { status: 1, createdAt: -1 }, background: true },
        { key: { paymentMethod: 1, status: 1 }, background: true }
      ],
      notifications: [
        { key: { userId: 1, createdAt: -1 }, background: true },
        { key: { type: 1, createdAt: -1 }, background: true },
        { key: { isRead: 1, userId: 1 }, background: true }
      ]
    };

    for (const [collectionName, indexes] of Object.entries(indexOptimizations)) {
      try {
        const collection = this.db.collection(collectionName);
        const existingIndexes = await collection.indexes();
        
        for (const index of indexes) {
          const indexName = Object.keys(index.key).map(k => `${k}_${index.key[k]}`).join('_');
          const exists = existingIndexes.find(idx => idx.name === indexName);
          
          if (!exists) {
            logger.info(`Creating index: ${collectionName}.${indexName}`);
            await collection.createIndex(index.key, {
              name: indexName,
              unique: index.unique || false,
              sparse: index.sparse || false,
              background: true
            });
            optimizations.push(`Created index: ${collectionName}.${indexName}`);
          }
        }
      } catch (error) {
        logger.error(`Error optimizing indexes for ${collectionName}:`, error);
      }
    }

    return optimizations;
  }

  async analyzeSlowQueries() {
    logger.info('🐌 Analyzing potential slow queries...');
    
    const slowQueryPatterns = [
      {
        collection: 'bookings',
        query: { status: 'pending' },
        suggestion: 'Add index on status field'
      },
      {
        collection: 'users',
        query: { email: 'test@example.com' },
        suggestion: 'Ensure unique index on email'
      },
      {
        collection: 'mechanics',
        query: { 
          location: { 
            $near: { 
              $geometry: { type: 'Point', coordinates: [0, 0] },
              $maxDistance: 50000 
            } 
          } 
        },
        suggestion: 'Add 2dsphere index on location field'
      }
    ];

    const analysis = [];
    
    for (const pattern of slowQueryPatterns) {
      try {
        const collection = this.db.collection(pattern.collection);
        const startTime = Date.now();
        
        // Execute the query
        await collection.find(pattern.query).limit(1).toArray();
        
        const duration = Date.now() - startTime;
        
        analysis.push({
          collection: pattern.collection,
          query: pattern.query,
          duration: `${duration}ms`,
          suggestion: pattern.suggestion,
          isSlow: duration > 100
        });
      } catch (error) {
        logger.error(`Error analyzing query for ${pattern.collection}:`, error);
      }
    }

    return analysis;
  }

  async optimizeStorage() {
    logger.info('💾 Optimizing storage...');
    
    const optimizations = [];

    try {
      // Compact collections to reclaim space
      const collections = await this.db.listCollections().toArray();
      
      for (const collection of collections) {
        try {
          const stats = await this.db.collection(collection.name).stats();
          
          // Check if collection needs compaction
          if (stats.storageSize > stats.size * 2) {
            logger.info(`Compacting collection: ${collection.name}`);
            await this.db.command({ compact: collection.name });
            optimizations.push(`Compacted collection: ${collection.name}`);
          }
        } catch (error) {
          logger.error(`Error compacting collection ${collection.name}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error during storage optimization:', error);
    }

    return optimizations;
  }

  async generateOptimizationReport() {
    logger.info('📊 Generating optimization report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      database: this.db.databaseName,
      collections: await this.analyzeCollections(),
      slowQueries: await this.analyzeSlowQueries(),
      optimizations: []
    };

    // Perform optimizations
    const indexOptimizations = await this.optimizeIndexes();
    const storageOptimizations = await this.optimizeStorage();
    
    report.optimizations = [...indexOptimizations, ...storageOptimizations];

    return report;
  }

  async disconnect() {
    // Native connection is managed globally; nothing to do
  }

  printReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE OPTIMIZATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n🕒 Timestamp: ${report.timestamp}`);
    console.log(`🗄️  Database: ${report.database}`);
    
    console.log('\n📋 COLLECTIONS ANALYSIS:');
    console.log('-'.repeat(50));
    report.collections.forEach(collection => {
      console.log(`\n📁 ${collection.name}:`);
      console.log(`   Documents: ${collection.stats.count.toLocaleString()}`);
      console.log(`   Size: ${(collection.stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Storage: ${(collection.stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Indexes: ${collection.stats.indexes}`);
      console.log(`   Index Size: ${(collection.stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    });
    
    console.log('\n🐌 SLOW QUERY ANALYSIS:');
    console.log('-'.repeat(50));
    report.slowQueries.forEach(query => {
      const status = query.isSlow ? '❌ SLOW' : '✅ OK';
      console.log(`\n${status} ${query.collection}:`);
      console.log(`   Duration: ${query.duration}`);
      console.log(`   Suggestion: ${query.suggestion}`);
    });
    
    console.log('\n🔧 OPTIMIZATIONS PERFORMED:');
    console.log('-'.repeat(50));
    if (report.optimizations.length === 0) {
      console.log('✅ No optimizations needed');
    } else {
      report.optimizations.forEach(opt => {
        console.log(`✅ ${opt}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Main execution
async function main() {
  const optimizer = new DatabaseOptimizer();
  
  try {
    await optimizer.connect();
    const report = await optimizer.generateOptimizationReport();
    optimizer.printReport(report);
  } catch (error) {
    logger.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await optimizer.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseOptimizer;
