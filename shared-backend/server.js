
// Optimized imports
const { applyOptimizedMiddleware, getMemoryStats } = require('./middleware/optimized-middleware');
const { redisCache } = require('./config/optimized-redis');
const OptimizedAIProviderManager = require('./services/optimizedAIProviderManager');
const { connectToDatabase: connectOptimizedDatabase } = require('./config/optimized-database');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const logger = require('./utils/logger');

// Environment variables are loaded via dotenv

// Import security middleware
const securityHeaders = require('./middleware/securityHeaders');
const { cacheMiddleware } = require('./middleware/cache');
const { validateInput } = require('./middleware/validation');
const { performanceMonitor, getPerformanceMetrics } = require('./middleware/performanceMonitor');
const { addAlert, getAlerts } = require('./middleware/alerting');
const { responseMiddleware } = require('./utils/response-format');

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

// Import graceful restart handling
const {
  gracefulRestartManager,
  trackConnection
} = require('./middleware/graceful-restart');

// Import performance tuning
const {
  performanceTuner,
  analyzeAndTune
} = require('./middleware/performance-tuning');

// Import WebSocket server
const webSocketServer = require('./services/websocket-server');

// Import unified database connection
const { connectToDatabase } = require('./config/database-unified');
const { initializeEnvironment } = require('./config/environment');

// Import routes
// Import only existing routes
const authRoutes = require('./routes/consolidated-auth');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/consolidated-analytics');
const usersRoutes = require('./routes/users');
const otherRoutes = require('./routes/other');
const errorsRoutes = require('./routes/errors');
const knowledgeBaseRoutes = require('./routes/knowledge-base');
const incidentsRoutes = require('./routes/incidents');
// const autoPartsRoutes = require('./routes/auto-parts'); // Removed - file deleted
const realtimeRoutes = require('./routes/realtime');
const shopsRoutes = require('./routes/shops');
const bookingsRoutes = require('./routes/bookings');
const enterpriseRoutes = require('./routes/enterprise');
const enterpriseAuthRoutes = require('./routes/enterpriseAuth');
const aiRoutes = require('./routes/ai');

// Import new missing routes
const hrRoutes = require('./routes/hr');
const legalRoutes = require('./routes/legal');
const projectsRoutes = require('./routes/projects');
const featureFlagsRoutes = require('./routes/feature-flags');
const cmsRoutes = require('./routes/cms');
const marketingRoutes = require('./routes/marketing');
const assetsRoutes = require('./routes/assets');
const vendorsRoutes = require('./routes/vendors');
const auditRoutes = require('./routes/audit');
const systemHealthRoutes = require('./routes/system-health');
const systemRoutes = require('./routes/system');
const systemPerformanceRoutes = require('./routes/system-performance');
const sessionsRoutes = require('./routes/sessions');
const revenueRoutes = require('./routes/revenue');
const complianceRoutes = require('./routes/compliance');
const customersRoutes = require('./routes/customers');
const adminCeoRoutes = require('./routes/admin-ceo');
const authFallbackRoutes = require('./routes/auth-fallback');
const emergencyAuthRoutes = require('./routes/emergency-auth');
const fleetRoutes = require('./routes/fleet');
const paymentsRoutes = require('./routes/payments');
const communicationRoutes = require('./routes/communication');
const performanceRoutes = require('./routes/performance');
const dashboardRoutes = require('./routes/dashboard');
const notificationsRoutes = require('./routes/notifications');
const employeesRoutes = require('./routes/employees');
const employeeInvitationsRoutes = require('./routes/employee-invitations');
const exportRoutes = require('./routes/export');

// Import new missing route files
const crmRoutes = require('./routes/crm');
const financeRoutes = require('./routes/finance');
const chatRoutes = require('./routes/chat');
const settingsRoutes = require('./routes/settings');
const integrationsRoutes = require('./routes/integrations');
const auditTrailRoutes = require('./routes/audit-trail');
const reportsRoutes = require('./routes/reports');
const rbacRoutes = require('./routes/rbac');
const businessIntelligenceRoutes = require('./routes/business-intelligence');
const monitoringRoutes = require('./routes/monitoring');
const filesRoutes = require('./routes/files');
const apiDocsRoutes = require('./routes/api-docs');
const pendingEmailsRoutes = require('./routes/pending-emails');
const notificationServiceRoutes = require('./routes/notification-service');
const mobileAppsRoutes = require('./routes/mobile-apps');
const operationsRoutes = require('./routes/operations');
const securityRoutes = require('./routes/security');

// Import newly created routes
const supportRoutes = require('./routes/support');
const analyticsExtendedRoutes = require('./routes/analytics-extended');

// All route imports cleaned up - only existing routes imported above

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Apply optimized middleware stack
applyOptimizedMiddleware(app);

// Add standardized response format middleware
app.use(responseMiddleware);

// CRITICAL: Health endpoints first
app.get('/health/ping', (req, res) => {
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


// Mount only existing routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use('/api', otherRoutes);
app.use('/errors', errorsRoutes);
app.use(`${apiPrefix}/knowledge-base`, knowledgeBaseRoutes);
app.use(`${apiPrefix}/incidents`, incidentsRoutes);
// app.use(`${apiPrefix}/auto-parts`, autoPartsRoutes); // Removed - route deleted
app.use(`${apiPrefix}/realtime`, realtimeRoutes);
app.use(`${apiPrefix}/shops`, shopsRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/enterprise`, enterpriseRoutes);
app.use(`${apiPrefix}/enterprise-auth`, enterpriseAuthRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// Mount new missing routes
app.use(`${apiPrefix}/hr`, hrRoutes);
app.use(`${apiPrefix}/legal`, legalRoutes);
app.use(`${apiPrefix}/projects`, projectsRoutes);
app.use(`${apiPrefix}/feature-flags`, featureFlagsRoutes);
app.use(`${apiPrefix}/cms`, cmsRoutes);
app.use(`${apiPrefix}/marketing`, marketingRoutes);
app.use(`${apiPrefix}/assets`, assetsRoutes);
app.use(`${apiPrefix}/vendors`, vendorsRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);
app.use(`${apiPrefix}/system-health`, systemHealthRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);
app.use(`${apiPrefix}/system/performance`, systemPerformanceRoutes);
app.use(`${apiPrefix}/sessions`, sessionsRoutes);
app.use(`${apiPrefix}/revenue`, revenueRoutes);
app.use(`${apiPrefix}/compliance`, complianceRoutes);
app.use(`${apiPrefix}/customers`, customersRoutes);
app.use(`${apiPrefix}/admin-ceo`, adminCeoRoutes);

// Fallback authentication routes
app.use(`${apiPrefix}/auth-fallback`, authFallbackRoutes);

// Emergency authentication routes
app.use(`${apiPrefix}/emergency-auth`, emergencyAuthRoutes);

// New missing routes
app.use(`${apiPrefix}/fleet`, fleetRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/communication`, communicationRoutes);
app.use(`${apiPrefix}/performance`, performanceRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/employees`, employeesRoutes);
app.use(`${apiPrefix}/employee-invitations`, employeeInvitationsRoutes);
app.use(`${apiPrefix}/export`, exportRoutes);

// Mount new missing route files with correct v1 prefix
app.use(`${apiPrefix}/crm`, crmRoutes);
app.use(`${apiPrefix}/finance`, financeRoutes);
app.use(`${apiPrefix}/chat`, chatRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);
app.use(`${apiPrefix}/integrations`, integrationsRoutes);
app.use(`${apiPrefix}/audit-trail`, auditTrailRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/rbac`, rbacRoutes);

// Mount newly created routes
app.use(`${apiPrefix}/support`, supportRoutes);
app.use(`${apiPrefix}/analytics`, analyticsExtendedRoutes);

// Fallback routes (without v1 prefix for frontend compatibility)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/export', exportRoutes);
app.use(`${apiPrefix}/employees`, employeeInvitationsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/audit-trail', auditTrailRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/rbac', rbacRoutes);

// API v1 routes (for frontend compatibility)
app.use('/api/v1/fleet', fleetRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/audit-trail', auditTrailRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/system-health', systemHealthRoutes);
app.use('/api/v1/feature-flags', featureFlagsRoutes);
app.use('/api/v1/audit', auditRoutes);
// app.use('/api/v1/assets', assetsRoutes); // Removed duplicate - already mounted with apiPrefix
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/vendors', vendorsRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/system/performance', performanceRoutes); // Add system performance route
app.use('/api/v1/ai-ml', aiRoutes);
app.use('/api/v1/monitoring', monitoringRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/docs', apiDocsRoutes);
app.use('/api/v1/pending-emails', pendingEmailsRoutes);
app.use('/api/v1/mobile-apps', mobileAppsRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/security', securityRoutes);

// Test endpoints
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Basic routing works', 
    timestamp: new Date().toISOString()
  });
});

// Root endpoint handler
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Clutch API Server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      ping: '/ping',
      auth: '/api/v1/auth/*',
      admin: '/api/v1/admin/*',
      performance: '/api/v1/performance/*'
    }
  });
});

// Handle HEAD requests for root
app.head('/', (req, res) => {
  res.status(200).end();
});

app.get('/auth-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth test works', 
    timestamp: new Date().toISOString()
  });
});

// OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-session-token, X-API-Version, X-Correlation-ID, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Global error handler:', err);
  
  // Track error for performance monitoring
  trackError(err, { 
    endpoint: req.path, 
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle different types of errors
  let statusCode = err.status || 500;
  let errorMessage = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = 409;
    errorMessage = 'Duplicate entry';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Token expired';
  }
  
  res.status(statusCode).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: isDevelopment ? err.message : errorMessage,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
});

// Logo route (for frontend compatibility)
app.get('/Logored.png', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Logo file not found - please check the frontend static files',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
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
      '/api/v1/shops/*',
      '/api/v1/parts/*',
      '/api/v1/users/*',
      '/api/v1/vehicles/*',
      '/api/v1/bookings/*',
      '/api/v1/payments/*',
      '/api/v1/inventory/*',
      '/api/v1/reports/*',
      '/api/v1/orders/*',
      '/api/v1/customers/*',
      '/api/v1/analytics/*',
      '/api/v1/cars/*',
      '/api/v1/chat/*',
      '/api/v1/clients/*',
      '/api/v1/communities/*',
      '/api/v1/crm/*',
      '/api/v1/dashboard/*',
      '/api/v1/diagnostics/*',
      '/api/v1/discounts/*',
      '/api/v1/disputes/*',
      '/api/v1/driver/*',
      '/api/v1/earnings/*',
      '/api/v1/ecommerce/*',
      '/api/v1/employees/*',
      '/api/v1/enterprise/*',
      '/api/v1/feedback/*',
      '/api/v1/finance/*',
      '/api/v1/fleet/*',
      '/api/v1/fleet-vehicle/*',
      '/api/v1/gps-device/*',
          '/api/v1/hr/*',
          '/api/v1/legal/*',
          '/api/v1/projects/*',
          '/api/v1/feature-flags/*',
          '/api/v1/cms/*',
          '/api/v1/marketing/*',
          '/api/v1/assets/*',
          '/api/v1/vendors/*',
          '/api/v1/audit/*',
          '/api/v1/system-health/*',
          '/api/v1/system/*',
          '/api/v1/admin-ceo/*',
      '/api/v1/insurance/*',
      '/api/v1/invoices/*',
      '/api/v1/jobs/*',
      '/api/v1/learning-system/*',
      '/api/v1/localization/*',
      '/api/v1/location/*',
      '/api/v1/loyalty/*',
      '/api/v1/maintenance/*',
      '/api/v1/market/*',
      '/api/v1/marketing/*',
      '/api/v1/mechanics/*',
      '/api/v1/mfa-setup/*',
      '/api/v1/mobile/*',
      '/api/v1/monitoring/*',
      '/api/v1/notifications/*',
      '/api/v1/obd/*',
      '/api/v1/obd2-device/*',
      '/api/v1/operations/*',
      '/api/v1/partners/*',
      '/api/v1/payment/*',
      '/api/v1/payouts/*',
      '/api/v1/permission/*',
      '/api/v1/products/*',
      '/api/v1/projects/*',
      '/api/v1/reviews/*',
      '/api/v1/roadside-assistance/*',
      '/api/v1/role/*',
      '/api/v1/sales/*',
      '/api/v1/security/*',
      '/api/v1/services/*',
      '/api/v1/session/*',
      '/api/v1/settings/*',
      '/api/v1/subscriptions/*',
      '/api/v1/suppliers/*',
      '/api/v1/support/*',
      '/api/v1/system/*',
      '/api/v1/telematics-data/*',
      '/api/v1/tracking/*',
      '/api/v1/trade-in/*',
      '/api/v1/transactions/*',
      '/api/v1/two-factor-auth/*',
      '/api/v1/upload/*',
      '/api/v1/verification/*',
      '/api/v1/advanced-features/*',
      '/api/v1/ai-agent/*',
      '/api/v1/ai-services/*',
      '/api/v1/ai/*',
      '/api/v1/app-configuration/*',
      '/api/v1/audit-log/*',
      '/api/v1/autonomous-dashboard/*',
      '/api/v1/autonomous-system/*',
      '/api/v1/b2b/*',
      '/api/v1/business-intelligence/*',
      '/api/v1/car-health/*',
      '/api/v1/car-parts/*',
      '/api/v1/clutch-email/*',
      '/api/v1/clutch-mobile/*',
      '/api/v1/communication/*',
      '/api/v1/corporate-account/*',
      '/api/v1/dashboard-new/*',
      '/api/v1/device-token/*',
      '/api/v1/digital-wallet/*',
      '/api/v1/email-marketing/*',
      '/api/v1/email-service/*',
      '/api/v1/enhanced-auth/*',
      '/api/v1/enhanced-features/*',
      '/api/v1/enterprise-auth/*',
      '/api/v1/errors/*',
      '/api/v1/feature-flags/*',
      '/api/v1/health-enhanced/*',
      '/api/v1/health-enhanced-autonomous/*',
      '/api/v1/partners-mobile/*',
      '/api/v1/next-level-features/*',
      '/api/v1/analytics-backup/*',
      '/api/v1/communication-backup/*',
      '/api/v1/user-analytics-backup/*',
      '/api/v1/performance/*',
      '/api/v1/ai-ml/*',
      '/api/v1/media-management/*',
      '/api/v1/feedback-system/*',
      '/api/v1/revenue-analytics/*',
      '/api/v1/legal/*',
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
    logger.error('Missing required environment variables:', missing);
    return { isValid: false, missing };
  }
  
  return { isValid: true };
}

// Start server

// Initialize optimized systems
const optimizedAI = new OptimizedAIProviderManager();
let redisInitialized = false;

// Initialize Redis cache - Render compatible
async function initializeRedis() {
  try {
    // Check if Redis is configured
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      redisInitialized = false;
      return;
    }

    redisInitialized = await redisCache.initialize();
    if (redisInitialized) {
    } else {
    }
  } catch (error) {
    logger.error('Redis initialization error:', error);
    redisInitialized = false;
  }
}
async function startServer() {
  try {
    
    // Initialize and validate environment
    const envConfig = initializeEnvironment();


    // Connect to database
    await connectOptimizedDatabase();
    
    // Initialize Redis cache
    await initializeRedis();

    // Start HTTP server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      
      // Initialize WebSocket server
      webSocketServer.initialize(server);
      
      // Run endpoint testing in production to generate logs
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          require('./scripts/test-endpoints-on-render.js');
        }, 5000); // Wait 5 seconds after server start
      }
    });

    // Track server connections for graceful restart
    server.on('connection', (socket) => {
      trackConnection(socket);
    });

    // Setup performance monitoring and tuning
    setInterval(async () => {
      try {
        const memUsage = process.memoryUsage();
        const metrics = {
          memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
          avgResponseTime: 0, // Would be calculated from performance monitor
          errorRate: 0, // Would be calculated from error tracking
          throughput: 0, // Would be calculated from request tracking
          dbQueryTime: 0 // Would be calculated from database monitor
        };
        
        await analyzeAndTune(metrics);
      } catch (error) {
        logger.error('Error in performance tuning:', error);
      }
    }, 600000); // Run every 10 minutes to reduce memory pressure

    // Enhanced graceful shutdown (handled by graceful restart manager)

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
