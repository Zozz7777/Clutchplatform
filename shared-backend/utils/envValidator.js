/**
 * Environment Variable Validator
 * Validates and provides defaults for environment variables
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '5000',
  HOST: '0.0.0.0',
  MONGODB_DB: 'clutch',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:3000',
  CORS_CREDENTIALS: 'true',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '1000',
  AUTH_RATE_LIMIT_MAX: '50',
  HELMET_CONTENT_SECURITY_POLICY: 'false',
  DEBUG: 'false',
  ENABLE_LOGGING: 'true',
  ENABLE_METRICS: 'true',
  ENABLE_EMULATORS: 'false',
  DB_MAX_POOL_SIZE: '100',
  DB_MIN_POOL_SIZE: '10',
  DB_CONNECT_TIMEOUT_MS: '30000',
  DB_SOCKET_TIMEOUT_MS: '45000',
  ENABLE_PERFORMANCE_MONITORING: 'true',
  PERFORMANCE_METRICS_INTERVAL: '300000',
  ENABLE_RATE_LIMITING: 'true',
  ENABLE_CORS: 'true',
  ENABLE_HELMET: 'true',
  ENABLE_MONGO_SANITIZE: 'true',
  ENABLE_XSS_PROTECTION: 'true'
};

function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const config = {};

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Required environment variable ${envVar} is not set`);
    } else {
      config[envVar] = process.env[envVar];
    }
  }

  // Set optional environment variables with defaults
  for (const [envVar, defaultValue] of Object.entries(optionalEnvVars)) {
    config[envVar] = process.env[envVar] || defaultValue;
  }

  // Validate specific values
  if (config.NODE_ENV && !['development', 'production', 'test'].includes(config.NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  if (config.PORT && (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535)) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  if (config.JWT_REFRESH_SECRET && config.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters long for security');
  }

  if (config.NODE_ENV === 'production') {
    if (config.JWT_SECRET === 'test_jwt_secret_for_development_only') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
    if (config.JWT_REFRESH_SECRET === 'test_refresh_secret_for_development_only') {
      errors.push('JWT_REFRESH_SECRET must be changed from default value in production');
    }
    if (config.DEBUG === 'true') {
      warnings.push('DEBUG should be false in production');
    }
    if (config.CORS_ORIGIN.includes('localhost')) {
      warnings.push('CORS_ORIGIN should not include localhost in production');
    }
  }

  // Log validation results
  if (errors.length > 0) {
    console.error('❌ Environment validation errors:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0) {
    console.log('✅ Environment validation passed');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

function getEnvironmentInfo() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const isDevelopment = env === 'development';
  const isTest = env === 'test';

  return {
    environment: env,
    isProduction,
    isDevelopment,
    isTest,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    pid: process.pid
  };
}

function logEnvironmentInfo() {
  const info = getEnvironmentInfo();
  
  console.log('🌍 Environment Information:');
  console.log(`  Environment: ${info.environment}`);
  console.log(`  Node Version: ${info.nodeVersion}`);
  console.log(`  Platform: ${info.platform} ${info.arch}`);
  console.log(`  Process ID: ${info.pid}`);
  console.log(`  Uptime: ${Math.round(info.uptime)}s`);
  console.log(`  Memory Usage: ${Math.round(info.memoryUsage.heapUsed / 1024 / 1024)}MB`);
}

module.exports = {
  validateEnvironment,
  getEnvironmentInfo,
  logEnvironmentInfo,
  requiredEnvVars,
  optionalEnvVars
};
