/**
 * Environment Configuration and Validation
 * Ensures all required environment variables are present and valid
 */

const crypto = require('crypto');

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NODE_ENV'
  ];
  
  const optional = [
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD_HASH',
    'REDIS_URL',
    'DB_MAX_POOL_SIZE',
    'DB_MIN_POOL_SIZE',
    'BCRYPT_ROUNDS'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }
  
  return { 
    isValid: true,
    required: required.length,
    optional: optional.length,
    missing: missing.length
  };
};

/**
 * Generate secure admin credentials if not provided
 */
const generateAdminCredentials = () => {
  if (!process.env.ADMIN_EMAIL) {
    process.env.ADMIN_EMAIL = 'admin@yourclutch.com';
  }
  
  if (!process.env.ADMIN_PASSWORD_HASH) {
    // Generate a secure random password
    const randomPassword = crypto.randomBytes(16).toString('hex');
    console.warn('⚠️  ADMIN_PASSWORD_HASH not set. Generated temporary password:', randomPassword);
    console.warn('⚠️  Please set ADMIN_PASSWORD_HASH environment variable for production!');
    
    // For development only - in production this should be set manually
    const bcrypt = require('bcryptjs');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = bcrypt.hashSync(randomPassword, saltRounds);
    process.env.ADMIN_PASSWORD_HASH = hashedPassword;
    process.env.ADMIN_PASSWORD_PLAIN = randomPassword; // Temporary for setup
  }
};

/**
 * Get environment configuration
 */
const getEnvironmentConfig = () => {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error('Environment validation failed');
  }
  
  // Generate admin credentials if needed
  generateAdminCredentials();
  
  return {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 100,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 10,
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 30000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 45000
    },
    
    // Authentication
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      adminEmail: process.env.ADMIN_EMAIL,
      adminPasswordHash: process.env.ADMIN_PASSWORD_HASH
    },
    
    // Redis
    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    },
    
    // Server
    server: {
      port: parseInt(process.env.PORT) || 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      apiVersion: process.env.API_VERSION || 'v1'
    },
    
    // Security
    security: {
      corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
    }
  };
};

/**
 * Initialize environment
 */
const initializeEnvironment = () => {
  try {
    const config = getEnvironmentConfig();
    console.log('✅ Environment configuration validated successfully');
    console.log(`📊 Database: ${config.mongodb.uri ? 'Configured' : 'Not configured'}`);
    console.log(`🔐 Auth: ${config.auth.jwtSecret ? 'Configured' : 'Not configured'}`);
    console.log(`📦 Redis: ${config.redis.url ? 'Configured' : 'Not configured'}`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    
    return config;
  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    throw error;
  }
};

module.exports = {
  validateEnvironment,
  getEnvironmentConfig,
  initializeEnvironment
};
