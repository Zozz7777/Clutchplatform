/**
 * Enterprise API Gateway
 * Provides centralized request routing, authentication, and management for microservices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const jwt = require('jsonwebtoken');
const axios = require('axios');

class APIGateway {
  constructor() {
    this.app = express();
    this.services = new Map();
    this.routes = new Map();
    this.middleware = new Map();
    this.circuitBreakers = new Map();
    this.rateLimiters = new Map();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.redisClient = null;
  }

  /**
   * Initialize API Gateway
   */
  async initialize() {
    console.log('🌐 Initializing Enterprise API Gateway...');
    
    try {
      // Setup middleware
      await this.setupMiddleware();
      
      // Register services
      await this.registerServices();
      
      // Setup routing
      await this.setupRouting();
      
      // Setup circuit breakers
      await this.setupCircuitBreakers();
      
      // Setup rate limiting
      await this.setupRateLimiting();
      
      // Setup monitoring
      await this.setupMonitoring();
      
      console.log('✅ API Gateway initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize API Gateway:', error);
      throw error;
    }
  }

  /**
   * Register microservice
   */
  async registerService(serviceConfig) {
    const {
      name,
      version,
      baseUrl,
      healthCheckUrl,
      routes = [],
      authentication = true,
      rateLimit = null,
      circuitBreaker = null,
      loadBalancer = 'round-robin'
    } = serviceConfig;

    try {
      const serviceId = this.generateServiceId(name, version);
      
      const service = {
        id: serviceId,
        name,
        version,
        baseUrl,
        healthCheckUrl,
        routes,
        authentication,
        rateLimit,
        circuitBreaker,
        loadBalancer,
        status: 'healthy',
        lastHealthCheck: new Date(),
        instances: [baseUrl], // Support for multiple instances
        currentInstance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate service configuration
      await this.validateServiceConfig(service);
      
      // Test service connectivity
      await this.testServiceConnectivity(service);
      
      // Store service
      this.services.set(serviceId, service);
      
      // Register routes
      await this.registerServiceRoutes(service);
      
      // Setup service monitoring
      await this.setupServiceMonitoring(service);
      
      console.log(`✅ Service '${name}' v${version} registered successfully`);
      return service;
      
    } catch (error) {
      console.error(`❌ Failed to register service '${name}':`, error);
      throw error;
    }
  }

  /**
   * Route request to appropriate service
   */
  async routeRequest(req, res, next) {
    try {
      const { method, path } = req;
      const routeKey = `${method}:${path}`;
      
      // Find matching route
      const route = this.findMatchingRoute(routeKey, path);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }

      // Get service
      const service = this.services.get(route.serviceId);
      if (!service) {
        return res.status(503).json({ error: 'Service not available' });
      }

      // Check service health
      if (service.status !== 'healthy') {
        return res.status(503).json({ error: 'Service unhealthy' });
      }

      // Apply middleware
      await this.applyRouteMiddleware(route, req, res);

      // Get service instance
      const serviceInstance = this.getServiceInstance(service);
      
      // Make request to service
      const response = await this.forwardRequest(serviceInstance, req, res);
      
      return response;
      
    } catch (error) {
      console.error('❌ Failed to route request:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Setup middleware
   */
  async setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }));
    
    // Compression middleware
    this.app.use(compression());
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging middleware
    this.app.use(this.requestLoggingMiddleware);
    
    // Authentication middleware
    this.app.use(this.authenticationMiddleware);
    
    // Rate limiting middleware
    this.app.use(this.rateLimitingMiddleware);
  }

  /**
   * Register services
   */
  async registerServices() {
    const defaultServices = [
      {
        name: 'user-service',
        version: '1.0.0',
        baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        healthCheckUrl: '/health',
        routes: [
          { method: 'GET', path: '/api/users/*', authentication: true },
          { method: 'POST', path: '/api/users/*', authentication: true },
          { method: 'PUT', path: '/api/users/*', authentication: true },
          { method: 'DELETE', path: '/api/users/*', authentication: true }
        ]
      },
      {
        name: 'shop-service',
        version: '1.0.0',
        baseUrl: process.env.SHOP_SERVICE_URL || 'http://localhost:3002',
        healthCheckUrl: '/health',
        routes: [
          { method: 'GET', path: '/api/shops/*', authentication: true },
          { method: 'POST', path: '/api/shops/*', authentication: true },
          { method: 'PUT', path: '/api/shops/*', authentication: true },
          { method: 'DELETE', path: '/api/shops/*', authentication: true }
        ]
      },
      {
        name: 'parts-service',
        version: '1.0.0',
        baseUrl: process.env.PARTS_SERVICE_URL || 'http://localhost:3003',
        healthCheckUrl: '/health',
        routes: [
          { method: 'GET', path: '/api/parts/*', authentication: true },
          { method: 'POST', path: '/api/parts/*', authentication: true },
          { method: 'PUT', path: '/api/parts/*', authentication: true },
          { method: 'DELETE', path: '/api/parts/*', authentication: true }
        ]
      },
      {
        name: 'order-service',
        version: '1.0.0',
        baseUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
        healthCheckUrl: '/health',
        routes: [
          { method: 'GET', path: '/api/orders/*', authentication: true },
          { method: 'POST', path: '/api/orders/*', authentication: true },
          { method: 'PUT', path: '/api/orders/*', authentication: true },
          { method: 'DELETE', path: '/api/orders/*', authentication: true }
        ]
      },
      {
        name: 'notification-service',
        version: '1.0.0',
        baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
        healthCheckUrl: '/health',
        routes: [
          { method: 'POST', path: '/api/notifications/*', authentication: true },
          { method: 'GET', path: '/api/notifications/*', authentication: true }
        ]
      }
    ];

    for (const serviceConfig of defaultServices) {
      await this.registerService(serviceConfig);
    }
  }

  /**
   * Setup routing
   */
  async setupRouting() {
    // Setup catch-all route for service routing
    this.app.all('/api/*', this.routeRequest.bind(this));
    
    // Setup health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        services: Array.from(this.services.values()).map(service => ({
          name: service.name,
          version: service.version,
          status: service.status
        }))
      });
    });
    
    // Setup service discovery endpoint
    this.app.get('/services', (req, res) => {
      res.json({
        services: Array.from(this.services.values())
      });
    });
  }

  /**
   * Setup circuit breakers
   */
  async setupCircuitBreakers() {
    for (const [serviceId, service] of this.services) {
      if (service.circuitBreaker) {
        const circuitBreaker = {
          serviceId,
          failureThreshold: service.circuitBreaker.failureThreshold || 5,
          timeout: service.circuitBreaker.timeout || 60000,
          resetTimeout: service.circuitBreaker.resetTimeout || 30000,
          failures: 0,
          lastFailureTime: null,
          state: 'closed' // closed, open, half-open
        };
        
        this.circuitBreakers.set(serviceId, circuitBreaker);
      }
    }
  }

  /**
   * Setup rate limiting
   */
  async setupRateLimiting() {
    // Global rate limiter
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    
    this.app.use(globalLimiter);
    
    // Per-service rate limiters
    for (const [serviceId, service] of this.services) {
      if (service.rateLimit) {
        const limiter = rateLimit({
          windowMs: service.rateLimit.windowMs || 15 * 60 * 1000,
          max: service.rateLimit.max || 100,
          message: `Rate limit exceeded for service ${service.name}`
        });
        
        this.rateLimiters.set(serviceId, limiter);
      }
    }
  }

  /**
   * Setup monitoring
   */
  async setupMonitoring() {
    // Start health check monitoring
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds
    
    // Start metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Collect every minute
  }

  /**
   * Middleware functions
   */
  requestLoggingMiddleware = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  };

  authenticationMiddleware = async (req, res, next) => {
    // Skip authentication for health checks and public endpoints
    if (req.path === '/health' || req.path === '/services' || req.path.startsWith('/public/')) {
      return next();
    }

    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, this.jwtSecret);
      req.user = decoded;
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  rateLimitingMiddleware = async (req, res, next) => {
    // Apply service-specific rate limiting if available
    const route = this.findMatchingRoute(`${req.method}:${req.path}`, req.path);
    if (route) {
      const limiter = this.rateLimiters.get(route.serviceId);
      if (limiter) {
        return limiter(req, res, next);
      }
    }
    
    next();
  };

  /**
   * Service management methods
   */
  async findMatchingRoute(routeKey, path) {
    // First try exact match
    if (this.routes.has(routeKey)) {
      return this.routes.get(routeKey);
    }

    // Then try pattern matching
    for (const [key, route] of this.routes) {
      if (this.matchRoutePattern(key, path)) {
        return route;
      }
    }

    return null;
  }

  matchRoutePattern(routePattern, path) {
    const pattern = routePattern.replace('*', '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  }

  async registerServiceRoutes(service) {
    for (const route of service.routes) {
      const routeKey = `${route.method}:${route.path}`;
      this.routes.set(routeKey, {
        serviceId: service.id,
        method: route.method,
        path: route.path,
        authentication: route.authentication !== false
      });
    }
  }

  getServiceInstance(service) {
    if (service.instances.length === 1) {
      return service.instances[0];
    }

    // Load balancing
    switch (service.loadBalancer) {
      case 'round-robin':
        const instance = service.instances[service.currentInstance];
        service.currentInstance = (service.currentInstance + 1) % service.instances.length;
        return instance;
      case 'random':
        return service.instances[Math.floor(Math.random() * service.instances.length)];
      default:
        return service.instances[0];
    }
  }

  async forwardRequest(serviceInstance, req, res) {
    try {
      const url = `${serviceInstance}${req.path}`;
      const options = {
        method: req.method,
        url,
        headers: {
          ...req.headers,
          'x-forwarded-for': req.ip,
          'x-user-id': req.user?.userId
        },
        data: req.body,
        timeout: 30000
      };

      const response = await axios(options);
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error('❌ Service request failed:', error.message);
      return res.status(500).json({ error: 'Service unavailable' });
    }
  }

  async applyRouteMiddleware(route, req, res) {
    // Apply route-specific middleware
    if (route.authentication && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  async performHealthChecks() {
    for (const [serviceId, service] of this.services) {
      try {
        const response = await axios.get(`${service.baseUrl}${service.healthCheckUrl}`, {
          timeout: 5000
        });
        
        if (response.status === 200) {
          service.status = 'healthy';
        } else {
          service.status = 'unhealthy';
        }
      } catch (error) {
        service.status = 'unhealthy';
        console.warn(`⚠️ Service ${service.name} health check failed:`, error.message);
      }
      
      service.lastHealthCheck = new Date();
    }
  }

  async collectMetrics() {
    const metrics = {
      timestamp: new Date(),
      services: Array.from(this.services.values()).map(service => ({
        name: service.name,
        status: service.status,
        lastHealthCheck: service.lastHealthCheck
      })),
      routes: this.routes.size,
      circuitBreakers: Array.from(this.circuitBreakers.values())
    };
    
    console.log('📊 API Gateway Metrics:', JSON.stringify(metrics, null, 2));
  }

  async testServiceConnectivity(service) {
    try {
      const response = await axios.get(`${service.baseUrl}${service.healthCheckUrl}`, {
        timeout: 5000
      });
      
      if (response.status !== 200) {
        throw new Error(`Service health check failed with status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Service connectivity test failed: ${error.message}`);
    }
  }

  async validateServiceConfig(service) {
    if (!service.name || !service.version || !service.baseUrl) {
      throw new Error('Invalid service configuration');
    }
  }

  generateServiceId(name, version) {
    return `${name}-${version}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  /**
   * Start the API Gateway
   */
  start(port = process.env.API_GATEWAY_PORT || 3000) {
    this.app.listen(port, () => {
      console.log(`🌐 API Gateway running on port ${port}`);
    });
  }
}

module.exports = APIGateway;
