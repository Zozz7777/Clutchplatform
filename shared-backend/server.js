const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Import security middleware
const securityHeaders = require('./middleware/securityHeaders');
const { cacheMiddleware } = require('./middleware/cache');
const { validateInput } = require('./middleware/validation');
const { performanceMonitor, getPerformanceMetrics } = require('./middleware/performanceMonitor');
const { addAlert, getAlerts } = require('./middleware/alerting');

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
const legalRoutes = require('./routes/legal');
const shopsRoutes = require('./routes/shops');
const partsRoutes = require('./routes/parts');
const usersRoutes = require('./routes/users');
const vehiclesRoutes = require('./routes/vehicles');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const inventoryRoutes = require('./routes/inventory');
const reportsRoutes = require('./routes/reports');
const ordersRoutes = require('./routes/orders');
const customersRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const carsRoutes = require('./routes/cars');
const chatRoutes = require('./routes/chat');
const clientsRoutes = require('./routes/clients');
const communitiesRoutes = require('./routes/communities');
const crmRoutes = require('./routes/crm');
const dashboardRoutes = require('./routes/dashboard');
const diagnosticsRoutes = require('./routes/diagnostics');
const discountsRoutes = require('./routes/discounts');
const disputesRoutes = require('./routes/disputes');
const driverRoutes = require('./routes/driver');
const earningsRoutes = require('./routes/earnings');
const ecommerceRoutes = require('./routes/ecommerce');
const employeesRoutes = require('./routes/employees');
const enterpriseRoutes = require('./routes/enterprise');
const feedbackRoutes = require('./routes/feedback');
const financeRoutes = require('./routes/finance');
const fleetRoutes = require('./routes/fleet');
const fleetVehicleRoutes = require('./routes/fleetVehicle');
const gpsDeviceRoutes = require('./routes/gpsDevice');
const hrRoutes = require('./routes/hr');
const insuranceRoutes = require('./routes/insurance');
const invoicesRoutes = require('./routes/invoices');
const jobsRoutes = require('./routes/jobs');
const learningSystemRoutes = require('./routes/learning-system');
const localizationRoutes = require('./routes/localization');
const locationRoutes = require('./routes/location');
const loyaltyRoutes = require('./routes/loyalty');
const maintenanceRoutes = require('./routes/maintenance');
const marketRoutes = require('./routes/market');
const marketingRoutes = require('./routes/marketing');
const mechanicsRoutes = require('./routes/mechanics');
const mfaSetupRoutes = require('./routes/mfaSetup');
const mobileRoutes = require('./routes/mobile');
const monitoringRoutes = require('./routes/monitoring');
const notificationsRoutes = require('./routes/notifications');
const obdRoutes = require('./routes/obd');
const obd2DeviceRoutes = require('./routes/obd2Device');
const operationsRoutes = require('./routes/operations');
const partnersRoutes = require('./routes/partners');
const paymentRoutes = require('./routes/payment');
const payoutsRoutes = require('./routes/payouts');
const permissionRoutes = require('./routes/permission');
const productsRoutes = require('./routes/products');
const projectsRoutes = require('./routes/projects');
const reviewsRoutes = require('./routes/reviews');
const roadsideAssistanceRoutes = require('./routes/roadsideAssistance');
const roleRoutes = require('./routes/role');
const salesRoutes = require('./routes/sales');
const securityRoutes = require('./routes/security');
const servicesRoutes = require('./routes/services');
const sessionRoutes = require('./routes/session');
const settingsRoutes = require('./routes/settings');
const subscriptionsRoutes = require('./routes/subscriptions');
const suppliersRoutes = require('./routes/suppliers');
const supportRoutes = require('./routes/support');
const systemRoutes = require('./routes/system');
const telematicsDataRoutes = require('./routes/telematicsData');
const trackingRoutes = require('./routes/tracking');
const tradeInRoutes = require('./routes/tradeIn');
const transactionsRoutes = require('./routes/transactions');
const twoFactorAuthRoutes = require('./routes/twoFactorAuth');
const uploadRoutes = require('./routes/upload');
const verificationRoutes = require('./routes/verification');
const advancedFeaturesRoutes = require('./routes/advancedFeatures');
const aiAgentRoutes = require('./routes/ai-agent');
const aiServicesRoutes = require('./routes/ai-services');
const aiRoutes = require('./routes/ai');
const appConfigurationRoutes = require('./routes/app-configuration');
const auditLogRoutes = require('./routes/auditLog');
const autonomousDashboardRoutes = require('./routes/autonomous-dashboard');
const autonomousSystemRoutes = require('./routes/autonomous-system');
const b2bRoutes = require('./routes/b2b');
const businessIntelligenceRoutes = require('./routes/business-intelligence');
const carHealthRoutes = require('./routes/car-health');
const carPartsRoutes = require('./routes/carParts');
const clutchEmailRoutes = require('./routes/clutch-email');
const clutchMobileRoutes = require('./routes/clutch-mobile');
const communicationRoutes = require('./routes/communication');
const corporateAccountRoutes = require('./routes/corporateAccount');
const dashboardNewRoutes = require('./routes/dashboard-new');
const deviceTokenRoutes = require('./routes/deviceToken');
const digitalWalletRoutes = require('./routes/digitalWallet');
const emailMarketingRoutes = require('./routes/email-marketing');
const emailServiceRoutes = require('./routes/email-service');
const enhancedAuthRoutes = require('./routes/enhanced-auth');
const enhancedFeaturesRoutes = require('./routes/enhancedFeatures');
const enterpriseAuthRoutes = require('./routes/enterpriseAuth');
const errorsRoutes = require('./routes/errors');
const featureFlagsRoutes = require('./routes/featureFlags');
const healthEnhancedRoutes = require('./routes/health-enhanced');
const healthEnhancedAutonomousRoutes = require('./routes/health-enhanced-autonomous');
const partnersMobileRoutes = require('./routes/partners-mobile');
const nextLevelFeaturesRoutes = require('./routes/nextLevelFeatures');
const analyticsBackupRoutes = require('./routes/analytics-backup');
const communicationBackupRoutes = require('./routes/communication-backup');
const userAnalyticsBackupRoutes = require('./routes/user-analytics-backup');
const endpointTesterRoutes = require('./routes/endpoint-tester');
const searchRoutes = require('./routes/search');
const webhooksRoutes = require('./routes/webhooks');

// Import new advanced routes
const aiAdvancedRoutes = require('./routes/ai-advanced');
const enterpriseAdvancedRoutes = require('./routes/enterprise-advanced');
const mobileAdvancedRoutes = require('./routes/mobile-advanced');
const analyticsAdvancedRoutes = require('./routes/analytics-advanced');
const integrationAdvancedRoutes = require('./routes/integration-advanced');
const experimentalRoutes = require('./routes/experimental');
const autoPartsAIRoutes = require('./routes/auto-parts-ai');
const serviceCentersAdvancedRoutes = require('./routes/service-centers-advanced');
const securityComplianceRoutes = require('./routes/security-compliance');
const enterpriseFeaturesRoutes = require('./routes/enterprise-features');

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Performance monitoring middleware
app.use(requestPerformanceMiddleware());
app.use(databaseQueryMiddleware());
app.use(optimizationMiddleware());
app.use(performanceMonitor);

// Security headers middleware
app.use(securityHeaders);

// Input validation middleware
app.use(validateInput);

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
  limit: '10mb'
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

// Request timeout middleware
app.use((req, res, next) => {
  const timeout = 30000; // 30 seconds timeout
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'REQUEST_TIMEOUT',
        message: 'Request timeout. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
  });
  next();
});

// Async error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Make asyncHandler available globally
app.use((req, res, next) => {
  req.asyncHandler = asyncHandler;
  next();
});

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
app.use(`${apiPrefix}/legal`, legalRoutes);
app.use(`${apiPrefix}/shops`, shopsRoutes);
app.use(`${apiPrefix}/parts`, partsRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/vehicles`, vehiclesRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/inventory`, inventoryRoutes);
app.use(`${apiPrefix}/reports`, reportsRoutes);
app.use(`${apiPrefix}/orders`, ordersRoutes);
app.use(`${apiPrefix}/customers`, customersRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/cars`, carsRoutes);
app.use(`${apiPrefix}/chat`, chatRoutes);
app.use(`${apiPrefix}/clients`, clientsRoutes);
app.use(`${apiPrefix}/communities`, communitiesRoutes);
app.use(`${apiPrefix}/crm`, crmRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/diagnostics`, diagnosticsRoutes);
app.use(`${apiPrefix}/discounts`, discountsRoutes);
app.use(`${apiPrefix}/disputes`, disputesRoutes);
app.use(`${apiPrefix}/driver`, driverRoutes);
app.use(`${apiPrefix}/earnings`, earningsRoutes);
app.use(`${apiPrefix}/ecommerce`, ecommerceRoutes);
app.use(`${apiPrefix}/employees`, employeesRoutes);
app.use(`${apiPrefix}/enterprise`, enterpriseRoutes);
app.use(`${apiPrefix}/feedback`, feedbackRoutes);
app.use(`${apiPrefix}/finance`, financeRoutes);
app.use(`${apiPrefix}/fleet`, fleetRoutes);
app.use(`${apiPrefix}/fleetVehicle`, fleetVehicleRoutes);
app.use(`${apiPrefix}/fleet-vehicle`, fleetVehicleRoutes);
app.use(`${apiPrefix}/gpsDevice`, gpsDeviceRoutes);
app.use(`${apiPrefix}/gps-device`, gpsDeviceRoutes);
app.use(`${apiPrefix}/hr`, hrRoutes);
app.use(`${apiPrefix}/insurance`, insuranceRoutes);
app.use(`${apiPrefix}/invoices`, invoicesRoutes);
app.use(`${apiPrefix}/jobs`, jobsRoutes);
app.use(`${apiPrefix}/learning-system`, learningSystemRoutes);
app.use(`${apiPrefix}/localization`, localizationRoutes);
app.use(`${apiPrefix}/location`, locationRoutes);
app.use(`${apiPrefix}/loyalty`, loyaltyRoutes);
app.use(`${apiPrefix}/maintenance`, maintenanceRoutes);
app.use(`${apiPrefix}/market`, marketRoutes);
app.use(`${apiPrefix}/marketing`, marketingRoutes);
app.use(`${apiPrefix}/mechanics`, mechanicsRoutes);
app.use(`${apiPrefix}/mfa-setup`, mfaSetupRoutes);
app.use(`${apiPrefix}/mobile`, mobileRoutes);
app.use(`${apiPrefix}/monitoring`, monitoringRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes);
app.use(`${apiPrefix}/obd`, obdRoutes);
app.use(`${apiPrefix}/obd2-device`, obd2DeviceRoutes);
app.use(`${apiPrefix}/operations`, operationsRoutes);
app.use(`${apiPrefix}/partners`, partnersRoutes);
app.use(`${apiPrefix}/payment`, paymentRoutes);
app.use(`${apiPrefix}/payouts`, payoutsRoutes);
app.use(`${apiPrefix}/permission`, permissionRoutes);
app.use(`${apiPrefix}/products`, productsRoutes);
app.use(`${apiPrefix}/projects`, projectsRoutes);
app.use(`${apiPrefix}/reviews`, reviewsRoutes);
app.use(`${apiPrefix}/roadside-assistance`, roadsideAssistanceRoutes);
app.use(`${apiPrefix}/role`, roleRoutes);
app.use(`${apiPrefix}/sales`, salesRoutes);
app.use(`${apiPrefix}/security`, securityRoutes);
app.use(`${apiPrefix}/services`, servicesRoutes);
app.use(`${apiPrefix}/session`, sessionRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);
app.use(`${apiPrefix}/subscriptions`, subscriptionsRoutes);
app.use(`${apiPrefix}/suppliers`, suppliersRoutes);
app.use(`${apiPrefix}/support`, supportRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);
app.use(`${apiPrefix}/telematics-data`, telematicsDataRoutes);
app.use(`${apiPrefix}/tracking`, trackingRoutes);
app.use(`${apiPrefix}/trade-in`, tradeInRoutes);
app.use(`${apiPrefix}/transactions`, transactionsRoutes);
app.use(`${apiPrefix}/two-factor-auth`, twoFactorAuthRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/verification`, verificationRoutes);
app.use(`${apiPrefix}/advanced-features`, advancedFeaturesRoutes);
app.use(`${apiPrefix}/ai-agent`, aiAgentRoutes);
app.use(`${apiPrefix}/ai-services`, aiServicesRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/app-configuration`, appConfigurationRoutes);
app.use(`${apiPrefix}/audit-log`, auditLogRoutes);
app.use(`${apiPrefix}/autonomous-dashboard`, autonomousDashboardRoutes);
app.use(`${apiPrefix}/autonomous-system`, autonomousSystemRoutes);
app.use(`${apiPrefix}/b2b`, b2bRoutes);
app.use(`${apiPrefix}/business-intelligence`, businessIntelligenceRoutes);
app.use(`${apiPrefix}/car-health`, carHealthRoutes);
app.use(`${apiPrefix}/carParts`, carPartsRoutes);
app.use(`${apiPrefix}/car-parts`, carPartsRoutes);
app.use(`${apiPrefix}/clutch-email`, clutchEmailRoutes);
app.use(`${apiPrefix}/clutch-mobile`, clutchMobileRoutes);
app.use(`${apiPrefix}/communication`, communicationRoutes);
app.use(`${apiPrefix}/corporateAccount`, corporateAccountRoutes);
app.use(`${apiPrefix}/corporate-account`, corporateAccountRoutes);
app.use(`${apiPrefix}/dashboard-new`, dashboardNewRoutes);
app.use(`${apiPrefix}/deviceToken`, deviceTokenRoutes);
app.use(`${apiPrefix}/device-token`, deviceTokenRoutes);
app.use(`${apiPrefix}/digitalWallet`, digitalWalletRoutes);
app.use(`${apiPrefix}/digital-wallet`, digitalWalletRoutes);
app.use(`${apiPrefix}/email-marketing`, emailMarketingRoutes);
app.use(`${apiPrefix}/email-service`, emailServiceRoutes);
app.use(`${apiPrefix}/enhanced-auth`, enhancedAuthRoutes);
app.use(`${apiPrefix}/enhancedFeatures`, enhancedFeaturesRoutes);
app.use(`${apiPrefix}/enhanced-features`, enhancedFeaturesRoutes);
app.use(`${apiPrefix}/enterpriseAuth`, enterpriseAuthRoutes);
app.use(`${apiPrefix}/enterprise-auth`, enterpriseAuthRoutes);
app.use(`${apiPrefix}/errors`, errorsRoutes);
app.use(`${apiPrefix}/featureFlags`, featureFlagsRoutes);
app.use(`${apiPrefix}/feature-flags`, featureFlagsRoutes);
app.use(`${apiPrefix}/health-enhanced`, healthEnhancedRoutes);
app.use(`${apiPrefix}/health-enhanced-autonomous`, healthEnhancedAutonomousRoutes);
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/partners-mobile`, partnersMobileRoutes);
app.use(`${apiPrefix}/next-level-features`, nextLevelFeaturesRoutes);
app.use(`${apiPrefix}/analytics-backup`, analyticsBackupRoutes);
app.use(`${apiPrefix}/communication-backup`, communicationBackupRoutes);
app.use(`${apiPrefix}/user-analytics-backup`, userAnalyticsBackupRoutes);
app.use(`${apiPrefix}/endpoint-tester`, endpointTesterRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/webhooks`, webhooksRoutes);

// Register new advanced routes
app.use(`${apiPrefix}/ai-advanced`, aiAdvancedRoutes);
app.use(`${apiPrefix}/enterprise-advanced`, enterpriseAdvancedRoutes);
app.use(`${apiPrefix}/mobile-advanced`, mobileAdvancedRoutes);
app.use(`${apiPrefix}/analytics-advanced`, analyticsAdvancedRoutes);
app.use(`${apiPrefix}/integration-advanced`, integrationAdvancedRoutes);
app.use(`${apiPrefix}/experimental`, experimentalRoutes);
app.use(`${apiPrefix}/auto-parts-ai`, autoPartsAIRoutes);
app.use(`${apiPrefix}/service-centers-advanced`, serviceCentersAdvancedRoutes);
app.use(`${apiPrefix}/security-compliance`, securityComplianceRoutes);
app.use(`${apiPrefix}/enterprise-features`, enterpriseFeaturesRoutes);

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

// Root endpoint handler
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint called');
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
  console.log('🏠 HEAD request to root endpoint');
  res.status(200).end();
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

// Enhanced error handling middleware
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
      console.log(`📊 Health check: https://clutch-main-nk7x.onrender.com/health/ping`);
      console.log(`⚡ Performance monitoring: https://clutch-main-nk7x.onrender.com/api/v1/performance/monitor`);
      console.log(`🔄 Graceful restart: SIGUSR2 or SIGHUP`);
      
      // Run endpoint testing in production to generate logs
      if (process.env.NODE_ENV === 'production') {
        console.log(`🧪 Starting endpoint testing for Render logs...`);
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
        console.error('❌ Error in performance tuning:', error);
      }
    }, 600000); // Run every 10 minutes to reduce memory pressure

    // Enhanced graceful shutdown (handled by graceful restart manager)
    console.log('✅ Graceful restart manager initialized');
    console.log('✅ Performance tuning system initialized');

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
