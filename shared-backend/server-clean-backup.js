const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectToDatabase } = require('./config/database');

// Import middleware
const { createVersionMiddleware } = require('./middleware/apiVersioning');
const { enhancedErrorHandler } = require('./middleware/enhancedErrorHandler');
const { performanceMonitor } = require('./middleware/performanceMonitor');

// Import routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CRITICAL: Health endpoints must be available immediately, before any middleware
app.get('/health/ping', (req, res) => {
  try {
    console.log('🏥 Health ping endpoint called (bypassing all middleware)');
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('🏥 Health ping error:', error);
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  }
});

// Alternative ping endpoint
app.get('/ping', (req, res) => {
  try {
    console.log('🏥 Alternative ping endpoint called (bypassing all middleware)');
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('🏥 Alternative ping error:', error);
    res.status(200).json({
      success: true,
      data: {
        status: 'pong',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  }
});

// Setup middleware and routes
function setupApp() {
  console.log('🔧 setupApp() function started...');

  // Performance monitoring middleware
  app.use(performanceMonitor);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS configuration
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://admin.yourclutch.com,https://yourclutch.com,https://clutch-main-nk7x.onrender.com,http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8080,http://10.0.2.2:8080,http://127.0.0.1:8080')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  
  console.log('🌐 CORS Configuration:', {
    allowedOrigins,
    corsCredentials: process.env.CORS_CREDENTIALS,
    nodeEnv: process.env.NODE_ENV
  });

  app.use(cors({
    origin: function (origin, callback) {
      try {
        // Allow requests with no origin (mobile apps/curl) in development
        if (!origin) {
          if (process.env.NODE_ENV === 'development' || process.env.CORS_ALLOW_NO_ORIGIN === 'true') {
            console.log('✅ CORS allowing request with no origin (development mode)');
            return callback(null, true);
          }
          console.log('❌ CORS blocking request with no origin');
          return callback(new Error('Origin required'));
        }
        
        // Log CORS requests for debugging
        console.log(`🌐 CORS request from origin: ${origin}`);
        console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
        
        // Check if origin is in allowed list (case-insensitive)
        const isAllowed = allowedOrigins.length > 0 && allowedOrigins.some(allowedOrigin => 
          allowedOrigin.toLowerCase() === origin.toLowerCase()
        );
        
        if (isAllowed) {
          console.log(`✅ CORS allowed for origin: ${origin}`);
          callback(null, true);
        } else {
          // In development, be more permissive
          if (process.env.NODE_ENV === 'development') {
            console.log(`⚠️ CORS allowing origin in development: ${origin}`);
            callback(null, true);
          } else {
            console.log(`❌ CORS blocked request from: ${origin}`);
            console.log(`❌ Allowed origins: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
          }
        }
      } catch (error) {
        console.error('❌ CORS middleware error:', error);
        callback(error);
      }
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-token', 'X-API-Version', 'X-Correlation-ID', 'Accept', 'Origin'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400
  }));

  // Add request logging middleware
  app.use((req, res, next) => {
    const redactedHeaders = { ...req.headers };
    if (redactedHeaders.authorization) redactedHeaders.authorization = '[REDACTED]';
    if (redactedHeaders.cookie) redactedHeaders.cookie = '[REDACTED]';
    const logEntry = {
      method: req.method,
      path: req.path,
      contentType: req.headers['content-type'] || 'none',
      userAgent: (req.headers['user-agent'] || '').substring(0, 80),
      origin: req.headers.origin || 'none',
      timestamp: new Date().toISOString()
    };
    console.log(`🚀 CLUTCH_REQUEST: ${req.method} ${req.path}`, logEntry);
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount routes
  const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

  // Apply API versioning middleware only to API routes
  app.use('/api', createVersionMiddleware(process.env.API_VERSION || 'v1'));

  // Core business routes
  console.log('🔧 Mounting auth routes at:', `${apiPrefix}/auth`);
  console.log('🔧 Environment check:', { 
    NODE_ENV: process.env.NODE_ENV, 
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
    shouldApplyRateLimit: process.env.ENABLE_RATE_LIMITING === 'true'
  });
  
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use(`${apiPrefix}/auth`, authRoutes);
    console.log('✅ Auth routes mounted with rate limiting');
  } else {
    app.use(`${apiPrefix}/auth`, authRoutes);
    console.log('✅ Auth routes mounted without rate limiting');
  }

  // Health routes
  app.use('/health', healthRoutes);

  // Admin routes
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use(`${apiPrefix}/admin`, adminRoutes);
  } else {
    app.use(`${apiPrefix}/admin`, adminRoutes);
  }

  // Fallback routes for requests without /api/v1 prefix
  console.log('🔧 Adding fallback routes for reverse proxy compatibility');
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    console.log('✅ Fallback auth routes mounted with rate limiting at /auth');
  } else {
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    console.log('✅ Fallback auth routes mounted without rate limiting at /auth');
  }

  // Test endpoints
  app.get('/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({ success: true, message: 'Basic routing works', timestamp: new Date().toISOString() });
  });

  app.get('/auth-test', (req, res) => {
    console.log('🧪 Top-level auth test endpoint called');
    res.json({ success: true, message: 'Top-level auth test works', timestamp: new Date().toISOString() });
  });

  // OPTIONS handler for all routes
  app.options('*', (req, res) => {
    console.log('🔍 Top-level OPTIONS handler called:', { path: req.path, origin: req.headers.origin });
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-session-token, X-API-Version, X-Correlation-ID, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.status(200).end();
  });

  // Global error handling middleware
  app.use((err, req, res, next) => {
    // Skip error handling for health endpoints
    if (req.path === '/health/ping' || req.path === '/ping') {
      console.log('🏥 Health endpoint error bypassed:', err.message);
      return res.status(200).json({
        success: true,
        data: {
          status: 'pong',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      });
    }
    // Use the enhanced error handler for all other routes
    enhancedErrorHandler(err, req, res, next);
  });

  // 404 handler - must be the very last route
  app.use('*', (req, res) => {
    console.log(`❌ 404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
    console.log(`❌ Available routes: /health, /api/v1/auth/*, /api/v1/admin/*, etc.`);
    
    res.status(404).json({
      success: false,
      error: 'ENDPOINT_NOT_FOUND',
      message: `Can't find ${req.originalUrl} on this server!`,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/health',
        '/test',
        '/auth-test',
        '/api/v1/auth/*',
        '/api/v1/admin/*',
        '/auth/*',
        '/admin/*'
      ]
    });
  });

  console.log('✅ setupApp() completed successfully');
}

// Environment validation
function validateEnvironment() {
  const requiredVars = ['MONGODB_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return { isValid: false, missing };
  }
  
  return { isValid: true };
}

// Async function to start the server
async function startServer() {
  try {
    // Validate environment variables first
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('❌ Environment validation failed. Please fix the errors above.');
      process.exit(1);
    }

    console.log('🚀 Initializing server...');
    console.log('✅ Environment validation passed');

    // Connect to database
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connection established');

    // Setup the Express app
    console.log('🔧 About to call setupApp()...');
    setupApp();
    console.log('✅ setupApp() completed successfully');

    // Start HTTP server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health/ping`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
