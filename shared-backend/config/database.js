const { MongoClient } = require('mongodb');
    // Connection pooling configuration
    const poolOptions = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };
    
require('dotenv').config();

let db = null;
let client = null;

// Use only environment variables for security
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'clutch';

// Validate required environment variables
if (!MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI environment variable is required');
  throw new Error('MONGODB_URI is required');
}

// Enhanced Database configuration with performance optimizations
const DB_CONFIG = {
  // Connection settings - Optimized for production
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 100,
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 10,
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 30000,
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 45000,
  serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 30000,
  
  // Performance optimization settings
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 2500,
  maxConnecting: 2,
  
  // Security settings
  tls: true,
  tlsAllowInvalidCertificates: false,
  
  // Monitoring and debugging
  monitorCommands: process.env.NODE_ENV === 'development',
  
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

// Enhanced connection management with automatic reconnection
const connectToDatabase = async () => {
  try {
    // Connect native MongoDB client
    if (!client) {
      client = new MongoClient(MONGODB_URI, DB_CONFIG);

      // Connection event handlers
      client.on('connected', () => {
        console.log('✅ MongoDB native client connected successfully');
      });

      client.on('disconnected', () => {
        console.log('⚠️ MongoDB native client disconnected');
      });

      client.on('error', (error) => {
        console.error('❌ MongoDB native client connection error:', error);
      });

      client.on('timeout', () => {
        console.error('⏰ MongoDB native client connection timeout');
      });

      await client.connect();
      // If URI already includes database name, use it directly
      if (MONGODB_URI.includes('/clutch?') || MONGODB_URI.includes('/Clutch?')) {
        db = client.db();
      } else {
        db = client.db(MONGODB_DB);
      }
      
      // Initialize database with required collections and indexes
      await initializeDatabase();
      
      console.log('✅ MongoDB Atlas connected successfully');
      console.log('✅ Database collections and indexes initialized');
      console.log('✅ Connection pool configured for optimal performance');
    }
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Implement exponential backoff retry logic
    if (!client) {
      console.log('🔄 Attempting to reconnect in 5 seconds...');
      setTimeout(() => connectToDatabase(), 5000);
    }
    return null;
  }
};

// Enhanced database initialization with strategic indexing
const initializeDatabase = async () => {
  try {
    const collections = [
      // User Management Collections
      'users', 'user_vehicles', 'user_sessions',
      
      // Vehicle & Parts Collections
      'car_brands', 'car_models', 'car_parts', 'user_vehicle_parts',
      
      // Service & Booking Collections
      'service_categories', 'service_types', 'service_centers', 'service_bookings',
      
      // Business & Partner Collections
      'partners', 'business_categories',
      
      // Payment & Financial Collections
      'payment_methods', 'installment_providers', 'transactions',
      
      // Analytics & Reporting Collections
      'user_analytics', 'service_analytics',
      
      // System & Configuration Collections
      'feature_flags', 'notification_templates', 'cities', 'areas',
      
      // OBD & Diagnostic Collections
      'obd_error_codes', 'obd_categories', 'vehicle_diagnostics',
      
      // Legacy Collections (for backward compatibility)
      'vehicles', 'bookings', 'payments', 'clients', 'mechanics', 'employees',
      'support_tickets', 'maintenance', 'cars', 'products', 'communities',
      'diagnostics', 'trade_ins', 'discounts', 'insurance', 'roadside_assistance',
      'telematics_data', 'gps_devices', 'obd2_devices', 'drivers',
      'chat_rooms', 'chat_messages', 'notifications', 'device_tokens',
      'audit_logs', 'sessions', 'mfa_setups', 'roles', 'subscriptions',
      'fleet_vehicles', 'corporate_accounts', 'fleets', 'ai_predictions',
      'ai_models', 'location_tracking', 'geofences', 'geofence_events',
      'routes', 'mobile_versions', 'mobile_configs'
    ];

    // Create collections with optimized settings
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName, {
          // Optimized collection settings
          validator: {},
          validationLevel: 'moderate',
          validationAction: 'warn'
        });
        console.log(`✅ Collection '${collectionName}' created/verified`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`✅ Collection '${collectionName}' already exists`);
        } else {
          console.error(`❌ Error creating collection '${collectionName}':`, error.message);
        }
      }
    }

    // Create strategic indexes for optimal performance
    await createDatabaseIndexes();
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Enhanced index creation with performance optimization
const createDatabaseIndexes = async () => {
  try {
    const indexes = [
      // Users collection - Critical for authentication and user management
      { collection: 'users', index: { email: 1 }, options: { unique: true, background: true } },
      { collection: 'users', index: { phoneNumber: 1 }, options: { background: true } },
      { collection: 'users', index: { role: 1, isActive: 1 }, options: { background: true } },
      { collection: 'users', index: { createdAt: -1 }, options: { background: true } },
      
      // Bookings collection - Critical for service management
      { collection: 'bookings', index: { userId: 1, status: 1 }, options: { background: true } },
      { collection: 'bookings', index: { mechanicId: 1, status: 1 }, options: { background: true } },
      { collection: 'bookings', index: { scheduledDate: 1 }, options: { background: true } },
      { collection: 'bookings', index: { createdAt: -1 }, options: { background: true } },
      
      // Payments collection - Critical for financial operations
      { collection: 'payments', index: { userId: 1, status: 1 }, options: { background: true } },
      { collection: 'payments', index: { bookingId: 1 }, options: { background: true } },
      { collection: 'payments', index: { createdAt: -1 }, options: { background: true } },
      
      // Transactions collection - Critical for financial tracking
      { collection: 'transactions', index: { userId: 1, type: 1 }, options: { background: true } },
      { collection: 'transactions', index: { createdAt: -1 }, options: { background: true } },
      
      // Vehicles collection - Critical for vehicle management
      { collection: 'vehicles', index: { userId: 1 }, options: { background: true } },
      { collection: 'vehicles', index: { licensePlate: 1 }, options: { background: true } },
      
      // Chat messages collection - Critical for real-time communication
      { collection: 'chat_messages', index: { roomId: 1, createdAt: -1 }, options: { background: true } },
      { collection: 'chat_messages', index: { senderId: 1 }, options: { background: true } },
      
      // Notifications collection - Critical for user engagement
      { collection: 'notifications', index: { userId: 1, read: 1 }, options: { background: true } },
      { collection: 'notifications', index: { createdAt: -1 }, options: { background: true } },
      
      // Location tracking collection - Critical for real-time tracking
      { collection: 'location_tracking', index: { userId: 1, timestamp: -1 }, options: { background: true } },
      { collection: 'location_tracking', index: { location: '2dsphere' }, options: { background: true } },
      
      // Analytics collections - Critical for business intelligence
      { collection: 'user_analytics', index: { userId: 1, eventType: 1 }, options: { background: true } },
      { collection: 'service_analytics', index: { serviceId: 1, date: -1 }, options: { background: true } },
      
      // Audit logs collection - Critical for security and compliance
      { collection: 'audit_logs', index: { userId: 1, action: 1 }, options: { background: true } },
      { collection: 'audit_logs', index: { timestamp: -1 }, options: { background: true } },
      
      // Sessions collection - Critical for authentication
      { collection: 'sessions', index: { userId: 1, isActive: 1 }, options: { background: true } },
      { collection: 'sessions', index: { sessionToken: 1 }, options: { unique: true, background: true } },
      
      // Device tokens collection - Critical for push notifications
      { collection: 'device_tokens', index: { userId: 1, platform: 1 }, options: { background: true } },
      { collection: 'device_tokens', index: { token: 1 }, options: { unique: true, background: true } }
    ];

    for (const { collection: collectionName, index, options } of indexes) {
      try {
        await createIndexSafely(collectionName, index, options);
      } catch (error) {
        console.error(`❌ Error creating index for ${collectionName}:`, error.message);
      }
    }

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Index creation error:', error);
  }
};

// Safe index creation with conflict handling
const createIndexSafely = async (collectionName, index, options = {}) => {
  try {
    const collection = db.collection(collectionName);
    
    // Check if index already exists
    const existingIndexes = await collection.indexes();
    const indexName = Object.keys(index)[0];
    
    const indexExists = existingIndexes.some(idx => 
      idx.name === indexName || 
      (idx.key && Object.keys(idx.key)[0] === indexName)
    );
    
    if (indexExists) {
      console.log(`⚠️  Index already exists for ${collectionName}, skipping...`);
      return;
    }
    
    await collection.createIndex(index, options);
    console.log(`✅ Index created for ${collectionName}: ${JSON.stringify(index)}`);
  } catch (error) {
    if (error.code === 85) { // Index already exists
      console.log(`⚠️  Index already exists for ${collectionName}, skipping...`);
    } else {
      throw error;
    }
  }
};

// Enhanced database utilities with performance monitoring
const getCollection = async (collectionName) => {
  try {
    if (!db) {
      await connectToDatabase();
    }
    
    // Wait for database to be properly initialized
    let retries = 0;
    const maxRetries = 10;
    while (!db && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
    
    if (!db) {
      throw new Error('Database connection not established after retries');
    }
    
    return db.collection(collectionName);
  } catch (error) {
    console.error(`❌ Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

// Database health check with performance metrics
const checkDatabaseHealth = async () => {
  try {
    if (!db) {
      return { status: 'disconnected', message: 'Database not connected' };
    }

    const startTime = Date.now();
    await db.admin().ping();
    const responseTime = Date.now() - startTime;

    // Get database stats
    const stats = await db.stats();
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Graceful shutdown with connection cleanup
const closeDatabaseConnection = async () => {
  try {
    // Close Mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ Mongoose connection closed gracefully');
    }
    
    // Close native MongoDB client
    if (client) {
      await client.close();
      console.log('✅ MongoDB native client connection closed gracefully');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

// Export enhanced database utilities
module.exports = {
  connectToDatabase,
  getCollection,
  checkDatabaseHealth,
  closeDatabaseConnection,
  createIndexSafely,
  db: () => db,
  client: () => client
};
