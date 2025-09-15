/**
 * Unified Database Configuration
 * Single source of truth for all database connections
 * Consolidates database.js and optimized-database.js
 */

const { MongoClient } = require('mongodb');
const { getEnvironmentConfig } = require('./environment');

let db = null;
let client = null;

// Enhanced Database configuration with performance optimizations
const getDatabaseConfig = () => {
  const envConfig = getEnvironmentConfig();
  
  return {
    // Connection settings - Optimized for production
    maxPoolSize: envConfig.mongodb.maxPoolSize,
    minPoolSize: envConfig.mongodb.minPoolSize,
    connectTimeoutMS: envConfig.mongodb.connectTimeoutMS,
    socketTimeoutMS: envConfig.mongodb.socketTimeoutMS,
    serverSelectionTimeoutMS: envConfig.mongodb.connectTimeoutMS,
    
    // Performance optimization settings
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 2500,
    maxConnecting: 2,
    
    // Security settings
    tls: true,
    tlsAllowInvalidCertificates: false,
    
    // Monitoring and debugging
    monitorCommands: envConfig.server.nodeEnv === 'development',
    
    // Read preferences for better performance
    readPreference: 'primaryPreferred',
    
    // Write concerns for data consistency
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 10000
    },
    
    // Retry settings
    retryReads: true,
    retryWrites: true,
    
    // Compression for network efficiency
    compressors: ['zlib'],
    zlibCompressionLevel: 6
  };
};

// Optimized collections list - reduced from 50+ to 25
const OPTIMIZED_COLLECTIONS = [
  // Core User Management (consolidated)
  'users',           // Consolidated: users + employees + mechanics
  'user_sessions',   // Keep for session management
  'user_vehicles',   // Keep for vehicle ownership
  
  // Vehicle & Parts Management (consolidated)
  'vehicles',        // Consolidated: vehicles + cars + car_brands + car_models
  'products',        // Consolidated: products + car_parts
  'vehicle_diagnostics', // Keep for OBD data
  
  // Service & Booking Management (consolidated)
  'bookings',        // Consolidated: bookings + service_bookings
  'service_centers', // Keep for service locations
  'service_categories', // Keep for service types
  
  // Business & Partner Management
  'partners',        // Keep for business partners
  'customers',       // Consolidated: customers + clients
  
  // Financial Management (consolidated)
  'transactions',    // Consolidated: transactions + payments
  'payment_methods', // Keep for payment options
  'invoices',        // Keep for billing
  
  // Communication & Notifications (consolidated)
  'notifications',   // Consolidated: notifications + notification_templates
  'chat_messages',   // Consolidated: chat_messages + chat_rooms
  'emails',          // Keep for email system
  
  // Analytics & Reporting (consolidated)
  'analytics',       // Consolidated: user_analytics + service_analytics
  'reports',         // Keep for business reports
  'audit_logs',      // Keep for security
  
  // System & Configuration
  'feature_flags',   // Keep for feature toggles
  'cities',          // Keep for location data
  'areas',           // Keep for location data
  
  // OBD & Diagnostic Data
  'obd_error_codes', // Keep for vehicle diagnostics
  'obd_categories',  // Keep for diagnostic categories
  
  // Device & Token Management
  'device_tokens',   // Keep for push notifications
  'sessions'         // Keep for authentication
];

// Enhanced connection management
const connectToDatabase = async () => {
  try {
    if (!client) {
      const envConfig = getEnvironmentConfig();
      const dbConfig = getDatabaseConfig();
      
      client = new MongoClient(envConfig.mongodb.uri, dbConfig);

      // Connection event handlers
      client.on('connected', () => {
        console.log('✅ MongoDB unified client connected successfully');
      });

      client.on('disconnected', () => {
        console.log('⚠️ MongoDB unified client disconnected');
      });

      client.on('error', (error) => {
        console.error('❌ MongoDB unified client connection error:', error);
      });

      await client.connect();
      db = client.db(process.env.MONGODB_DB || 'clutch');
      
      // Initialize optimized database
      await initializeOptimizedDatabase();
      
      console.log('✅ Unified MongoDB connected successfully');
      console.log(`📊 Collections optimized: ${OPTIMIZED_COLLECTIONS.length} active`);
    }
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

// Initialize optimized database with consolidated collections
const initializeOptimizedDatabase = async () => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    // Create indexes for performance
    const collections = [
      { name: 'users', indexes: [
        { key: { email: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { isActive: 1 } },
        { key: { createdAt: 1 } }
      ]},
      { name: 'vehicles', indexes: [
        { key: { userId: 1 } },
        { key: { status: 1 } },
        { key: { make: 1, model: 1 } },
        { key: { createdAt: 1 } }
      ]},
      { name: 'bookings', indexes: [
        { key: { userId: 1 } },
        { key: { status: 1 } },
        { key: { serviceDate: 1 } },
        { key: { createdAt: 1 } }
      ]},
      { name: 'transactions', indexes: [
        { key: { userId: 1 } },
        { key: { status: 1 } },
        { key: { amount: 1 } },
        { key: { createdAt: 1 } }
      ]},
      { name: 'sessions', indexes: [
        { key: { userId: 1 } },
        { key: { isActive: 1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
      ]}
    ];

    for (const collection of collections) {
      try {
        const coll = db.collection(collection.name);
        for (const index of collection.indexes) {
          await coll.createIndex(index.key, { 
            unique: index.unique || false,
            expireAfterSeconds: index.expireAfterSeconds || undefined
          });
        }
        console.log(`✅ Created indexes for ${collection.name}`);
      } catch (indexError) {
        if (indexError.code !== 85) { // Index already exists
          console.warn(`⚠️ Index creation warning for ${collection.name}:`, indexError.message);
        }
      }
    }

    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Get collection with error handling
const getCollection = async (collectionName) => {
  try {
    if (!db) {
      await connectToDatabase();
    }
    
    if (!OPTIMIZED_COLLECTIONS.includes(collectionName)) {
      console.warn(`⚠️ Collection ${collectionName} not in optimized list`);
    }
    
    return db.collection(collectionName);
  } catch (error) {
    console.error(`❌ Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    if (client) {
      await client.close();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
};

// Health check
const getDatabaseHealth = async () => {
  try {
    if (!db) {
      return { status: 'disconnected', error: 'Database not connected' };
    }
    
    await db.admin().ping();
    return { 
      status: 'connected', 
      collections: OPTIMIZED_COLLECTIONS.length,
      uptime: process.uptime()
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

module.exports = {
  connectToDatabase,
  getCollection,
  closeDatabase,
  getDatabaseHealth,
  getDatabaseConfig,
  OPTIMIZED_COLLECTIONS
};
