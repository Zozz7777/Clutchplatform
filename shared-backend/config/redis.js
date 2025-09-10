const Redis = require('ioredis');
require('dotenv').config();

// Redis configuration
const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '1f1KghLl0pOXlh4JwNRwoGjaZbV6fHi6';
const REDIS_HOST = process.env.REDIS_HOST || 'redis-18769.c280.us-central1-2.gce.redns.redis-cloud.com';
const REDIS_PORT = process.env.REDIS_PORT || '18769';

// Construct Redis URL with authentication
const REDIS_URL = process.env.REDIS_URL || `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;

let redisClient = null;
let redisDisabled = false;

// Initialize Redis client
const initializeRedis = () => {
  try {
    // Check if Redis is disabled globally
    if (redisDisabled) {
      console.log('⚠️  Redis disabled due to previous authentication failures');
      return null;
    }

    if (!redisClient) {
      // Check if Redis is enabled
      if (process.env.REDIS_ENABLED === 'false') {
        console.log('⚠️  Redis disabled, using in-memory cache');
        return null;
      }

      // Check if we should skip Redis due to previous auth failures
      if (process.env.REDIS_SKIP === 'true') {
        console.log('⚠️  Redis skipped due to previous authentication failures');
        redisDisabled = true;
        return null;
      }

      console.log('🔴 Initializing Redis connection...');
      
      redisClient = new Redis(REDIS_URL, {
        // Disable automatic reconnection to prevent spam
        retryDelayOnFailover: 0,
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 3000,
        commandTimeout: 2000,
        // Disable ready check to prevent auth errors
        enableReadyCheck: false,
        // Add explicit authentication
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD
      });

      // Handle connection events
      redisClient.on('connect', () => {
        console.log('✅ Redis client connected');
      });

      redisClient.on('error', (error) => {
        // Handle auth errors by completely disabling Redis
        if (error.code === 'NOAUTH' || error.message.includes('NOAUTH') || error.code === 'ECONNREFUSED') {
          console.log('⚠️  Redis connection failed, disabling Redis completely');
          redisDisabled = true;
          process.env.REDIS_SKIP = 'true';
          if (redisClient) {
            redisClient.disconnect();
            redisClient = null;
          }
        } else {
          console.error('❌ Redis client error:', error.message);
        }
      });

      redisClient.on('close', () => {
        console.log('🔌 Redis client connection closed');
      });

      redisClient.on('reconnecting', () => {
        // Disable reconnecting to prevent spam
        console.log('⚠️  Redis reconnection attempt blocked to prevent spam');
        redisDisabled = true;
        process.env.REDIS_SKIP = 'true';
        if (redisClient) {
          redisClient.disconnect();
          redisClient = null;
        }
      });

      // Handle connection failures gracefully
      redisClient.on('end', () => {
        console.log('⚠️  Redis connection ended, continuing without Redis');
        redisClient = null;
      });

      // Handle ready event
      redisClient.on('ready', () => {
        console.log('✅ Redis client ready');
      });
    }
    return redisClient;
  } catch (error) {
    console.error('❌ Redis client initialization failed:', error);
    console.log('⚠️  Continuing without Redis');
    redisDisabled = true;
    return null;
  }
};

// Get Redis client
const getRedisClient = () => {
  // Check if Redis is disabled
  if (redisDisabled) {
    return null;
  }
  
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
};

// Test Redis connection
const testRedisConnection = async () => {
  try {
    // Check if Redis is disabled
    if (redisDisabled) {
      console.log('⚠️  Redis disabled due to previous authentication failures');
      return false;
    }

    // Check if Redis is skipped
    if (process.env.REDIS_SKIP === 'true') {
      console.log('⚠️  Redis skipped due to previous authentication failures');
      redisDisabled = true;
      return false;
    }

    const client = getRedisClient();
    if (!client) {
      console.log('⚠️  Redis client not available, skipping test');
      return false;
    }
    
    // Check if client is connected
    if (client.status !== 'ready') {
      console.log('⚠️  Redis client not ready, attempting to connect...');
      try {
        await client.connect();
      } catch (connectError) {
        if (connectError.code === 'NOAUTH' || connectError.message.includes('NOAUTH')) {
          console.log('⚠️  Redis authentication failed, disabling Redis completely');
          redisDisabled = true;
          process.env.REDIS_SKIP = 'true';
          if (redisClient) {
            redisClient.disconnect();
            redisClient = null;
          }
          return false;
        }
        throw connectError;
      }
    }
    
    await client.ping();
    console.log('✅ Redis connection test successful');
    return true;
  } catch (error) {
    if (error.code === 'NOAUTH' || error.message.includes('NOAUTH')) {
      console.log('⚠️  Redis authentication failed, disabling Redis completely');
      redisDisabled = true;
      process.env.REDIS_SKIP = 'true';
      if (redisClient) {
        redisClient.disconnect();
        redisClient = null;
      }
      return false;
    }
    console.error('❌ Redis connection test failed:', error.message);
    console.log('⚠️  Continuing without Redis connection');
    return false;
  }
};

// Close Redis connection
const closeRedisConnection = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      console.log('✅ Redis connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  testRedisConnection,
  closeRedisConnection
};
