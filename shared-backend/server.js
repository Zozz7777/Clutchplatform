const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import performance monitoring
const { 
  requestPerformanceMiddleware, 
  databaseQueryMiddleware,
  trackError 
} = require('./middleware/performance-monitor');
const { 
  optimizationMiddleware,
  setCache,
  getCache 
} = require('./middleware/performance-optimizer');
const { 
  gracefulRestartManager,
  trackConnection 
} = require('./middleware/graceful-restart');

// Import database connection
const { connectToDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');
const knowledgeBaseRoutes = require('./routes/knowledge-base');
const incidentsRoutes = require('./routes/incidents');
const mobileCmsRoutes = require('./routes/mobile-cms');
const userAnalyticsRoutes = require('./routes/user-analytics');
const autoPartsRoutes = require('./routes/auto-parts');
const autoPartsAdvancedRoutes = require('./routes/auto-parts-advanced');
const authAdvancedRoutes = require('./routes/auth-advanced');
const realtimeRoutes = require('./routes/realtime');
const performanceRoutes = require('./routes/performance');
const aiMlRoutes = require('./routes/ai-ml');
const mediaManagementRoutes = require('./routes/media-management');
const feedbackSystemRoutes = require('./routes/feedback-system');
const revenueAnalyticsRoutes = require('./routes/revenue-analytics');

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Performance monitoring middleware
app.use(requestPerformanceMiddleware());
app.use(databaseQueryMiddleware());
app.use(optimizationMiddleware());

// Compression middleware
app.use(compression());

// Basic CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-token', 'X-API-Version', 'X-Correlation-ID', 'Accept', 'Origin']
}));

// Body parsing with security enhancements
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'INVALID_JSON',
        message: 'Invalid JSON format'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation and XSS protection middleware
app.use((req, res, next) => {
  // Basic XSS protection
  const sanitizeInput = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitizeInput(obj[key]);
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  next();
});

// Rate limiting (gradual implementation)
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient in development
  message: { 
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health endpoints
    return req.path.includes('/health') || req.path.includes('/ping');
  }
});

// Apply general rate limiting
app.use(generalRateLimit);

// CRITICAL: Health endpoints first
app.get('/health/ping', (req, res) => {
  console.log('🏥 Health ping endpoint called');
  res.status(200).json({
    success: true,
    data: {
      status: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/ping', (req, res) => {
  console.log('🏥 Alternative ping endpoint called');
  res.status(200).json({
    success: true,
    data: {
      status: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mount routes
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

console.log('🔧 Mounting routes...');

// API routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/knowledge-base`, knowledgeBaseRoutes);
app.use(`${apiPrefix}/incidents`, incidentsRoutes);
app.use(`${apiPrefix}/mobile-cms`, mobileCmsRoutes);
app.use(`${apiPrefix}/user-analytics`, userAnalyticsRoutes);
app.use(`${apiPrefix}/auto-parts`, autoPartsRoutes);
app.use(`${apiPrefix}/auto-parts/advanced`, autoPartsAdvancedRoutes);
app.use(`${apiPrefix}/auth-advanced`, authAdvancedRoutes);
app.use(`${apiPrefix}/realtime`, realtimeRoutes);
app.use(`${apiPrefix}/performance`, performanceRoutes);
app.use(`${apiPrefix}/ai-ml`, aiMlRoutes);
app.use(`${apiPrefix}/media-management`, mediaManagementRoutes);
app.use(`${apiPrefix}/feedback-system`, feedbackSystemRoutes);
app.use(`${apiPrefix}/revenue-analytics`, revenueAnalyticsRoutes);

// Fallback routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Test endpoints
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    success: true, 
    message: 'Basic routing works', 
    timestamp: new Date().toISOString()
  });
});

app.get('/auth-test', (req, res) => {
  console.log('🧪 Auth test endpoint called');
  res.json({ 
    success: true, 
    message: 'Auth test works', 
    timestamp: new Date().toISOString()
  });
});

// OPTIONS handler
app.options('*', (req, res) => {
  console.log('🔍 OPTIONS handler called:', req.path);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-session-token, X-API-Version, X-Correlation-ID, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  // Track error for performance monitoring
  trackError(err, { 
    endpoint: req.path, 
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `Can't find ${req.originalUrl} on this server!`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/ping',
      '/test',
      '/auth-test',
      '/api/v1/auth/*',
      '/api/v1/admin/*',
      '/auth/*',
      '/admin/*'
    ]
  });
});

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

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting minimal server...');
    
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('❌ Environment validation failed');
      process.exit(1);
    }

    console.log('✅ Environment validation passed');

    // Connect to database
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connection established');

    // Start HTTP server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Enhanced server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health/ping`);
      console.log(`⚡ Performance monitoring: http://localhost:${PORT}/api/v1/performance/monitor`);
      console.log(`🔄 Graceful restart: SIGUSR2 or SIGHUP`);
    });

    // Track server connections for graceful restart
    server.on('connection', (socket) => {
      trackConnection(socket);
    });

    // Enhanced graceful shutdown (handled by graceful restart manager)
    console.log('✅ Graceful restart manager initialized');

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
