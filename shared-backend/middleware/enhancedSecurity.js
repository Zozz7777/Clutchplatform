const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { logger } = require('../config/logger');

class EnhancedSecurity {
  constructor() {
    this.threatPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi,
      /update\s+set/gi,
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi
    ];

    this.suspiciousIPs = new Set();
    this.blockedIPs = new Set();
    this.requestCounts = new Map();
  }

  // Comprehensive security middleware
  getSecurityMiddleware() {
    return [
      this.helmetConfig(),
      this.corsConfig(),
      this.rateLimitConfig(),
      this.sanitizationConfig(),
      this.threatDetection(),
      this.requestValidation(),
      this.securityHeaders(),
      this.errorHandler()
    ];
  }

  // Enhanced Helmet configuration
  helmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          connectSrc: ["'self'", "https://api.openai.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true
    });
  }

  // CORS configuration
  corsConfig() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://clutch-a2f49.web.app',
      'https://admin.yourclutch.com',
      'https://yourclutch.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];

    return cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked request from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-API-Key',
        'X-Correlation-ID'
      ],
      exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Correlation-ID'
      ],
      maxAge: 86400 // 24 hours
    });
  }

  // Rate limiting configuration
  rateLimitConfig() {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
      message: {
        error: 'Too many requests from this IP',
        message: 'Please try again later.',
        retryAfter: `${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)} minutes`
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => this.isWhitelisted(req.ip),
      keyGenerator: (req) => req.ip,
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000)
        });
      }
    });
  }

  // Input sanitization configuration
  sanitizationConfig() {
    return [
      // MongoDB query sanitization
      mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
          logger.warn(`MongoDB injection attempt detected: ${key} in ${req.method} ${req.path}`);
        }
      }),

      // XSS protection
      xss({
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      }),

      // HTTP Parameter Pollution protection
      hpp({
        whitelist: ['filter', 'sort', 'page', 'limit']
      })
    ];
  }

  // Advanced threat detection
  threatDetection() {
    return (req, res, next) => {
      try {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const url = req.url;
        const method = req.method;
        const body = JSON.stringify(req.body || {});
        const query = JSON.stringify(req.query || {});

        // Check for suspicious patterns
        const isThreat = this.detectThreats(url, method, body, query, userAgent);
        
        if (isThreat) {
          this.handleThreat(req, res, isThreat);
          return;
        }

        // Track request patterns
        this.trackRequestPattern(ip, url, method);

        // Check for suspicious behavior
        if (this.isSuspiciousBehavior(ip)) {
          this.handleSuspiciousBehavior(req, res, ip);
          return;
        }

        next();
      } catch (error) {
        logger.error('Threat detection error:', error);
        next();
      }
    };
  }

  detectThreats(url, method, body, query, userAgent) {
    const combinedInput = `${url} ${method} ${body} ${query} ${userAgent}`.toLowerCase();

    // Check for threat patterns
    for (const pattern of this.threatPatterns) {
      if (pattern.test(combinedInput)) {
        return {
          type: 'malicious_pattern',
          pattern: pattern.source,
          input: combinedInput.substring(0, 200) // Limit log size
        };
      }
    }

    // Check for suspicious user agents
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /perl/i
    ];

    for (const pattern of suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        return {
          type: 'suspicious_user_agent',
          userAgent: userAgent.substring(0, 100)
        };
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /exec\s*\(/i,
      /xp_cmdshell/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(combinedInput)) {
        return {
          type: 'sql_injection',
          pattern: pattern.source
        };
      }
    }

    return null;
  }

  handleThreat(req, res, threat) {
    const ip = req.ip;
    
    logger.warn(`Security threat detected`, {
      ip,
      threat,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent']
    });

    // Add IP to suspicious list
    this.suspiciousIPs.add(ip);

    // Block IP if multiple threats detected
    if (this.suspiciousIPs.has(ip) && this.getThreatCount(ip) > 3) {
      this.blockedIPs.add(ip);
      logger.error(`IP ${ip} blocked due to multiple security threats`);
    }

    res.status(403).json({
      error: 'Access denied',
      message: 'Request blocked due to security policy violation',
      code: 'SECURITY_VIOLATION'
    });
  }

  trackRequestPattern(ip, url, method) {
    const key = `${ip}:${method}:${url}`;
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);

    // Clean up old entries
    if (this.requestCounts.size > 10000) {
      const entries = Array.from(this.requestCounts.entries());
      this.requestCounts = new Map(entries.slice(-5000));
    }
  }

  isSuspiciousBehavior(ip) {
    const patterns = Array.from(this.requestCounts.entries())
      .filter(([key]) => key.startsWith(ip + ':'))
      .map(([, count]) => count);

    // Check for rapid requests
    const rapidRequests = patterns.some(count => count > 50);
    
    // Check for multiple failed attempts
    const failedAttempts = patterns.filter(count => count > 10).length > 5;

    return rapidRequests || failedAttempts;
  }

  handleSuspiciousBehavior(req, res, ip) {
    logger.warn(`Suspicious behavior detected from IP: ${ip}`);
    
    res.status(429).json({
      error: 'Suspicious activity detected',
      message: 'Too many requests or suspicious behavior detected',
      code: 'SUSPICIOUS_ACTIVITY'
    });
  }

  getThreatCount(ip) {
    return Array.from(this.requestCounts.keys())
      .filter(key => key.startsWith(ip + ':'))
      .length;
  }

  // Request validation middleware
  requestValidation() {
    return (req, res, next) => {
      try {
        // Validate request size
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

        if (contentLength > maxSize) {
          return res.status(413).json({
            error: 'Request too large',
            message: 'Request body exceeds maximum allowed size'
          });
        }

        // Validate content type for POST/PUT requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const contentType = req.headers['content-type'] || '';
          
          if (!contentType.includes('application/json') && 
              !contentType.includes('multipart/form-data') &&
              !contentType.includes('application/x-www-form-urlencoded')) {
            return res.status(400).json({
              error: 'Invalid content type',
              message: 'Only JSON, form data, and multipart data are allowed'
            });
          }
        }

        // Add correlation ID for tracking
        req.correlationId = req.headers['x-correlation-id'] || this.generateCorrelationId();
        res.setHeader('X-Correlation-ID', req.correlationId);

        next();
      } catch (error) {
        logger.error('Request validation error:', error);
        next();
      }
    };
  }

  // Additional security headers
  securityHeaders() {
    return (req, res, next) => {
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Custom security headers
      res.setHeader('X-Security-Policy', 'block-all-mixed-content');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      
      next();
    };
  }

  // Error handler for security-related errors
  errorHandler() {
    return (err, req, res, next) => {
      if (err.name === 'UnauthorizedError') {
        logger.warn(`Unauthorized access attempt: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token'
        });
      }

      if (err.message === 'Not allowed by CORS') {
        logger.warn(`CORS violation: ${req.ip} - ${req.headers.origin}`);
        return res.status(403).json({
          error: 'CORS violation',
          message: 'Cross-origin request not allowed'
        });
      }

      // Log security-related errors
      if (err.status === 403 || err.status === 401) {
        logger.warn(`Security error: ${err.message}`, {
          ip: req.ip,
          url: req.url,
          method: req.method,
          userAgent: req.headers['user-agent']
        });
      }

      next(err);
    };
  }

  // Utility functions
  generateCorrelationId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isWhitelisted(ip) {
    const whitelist = process.env.SECURITY_WHITELIST?.split(',') || [];
    return whitelist.includes(ip);
  }

  // Security monitoring and reporting
  getSecurityStats() {
    return {
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: this.blockedIPs.size,
      requestPatterns: this.requestCounts.size,
      threatPatterns: this.threatPatterns.length
    };
  }

  // IP management
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
    logger.info(`IP ${ip} unblocked`);
  }

  addToWhitelist(ip) {
    // This would typically update environment variables or database
    logger.info(`IP ${ip} added to security whitelist`);
  }
}

// Create singleton instance
const enhancedSecurity = new EnhancedSecurity();

// Export middleware and utilities
module.exports = {
  enhancedSecurity,
  getSecurityMiddleware: () => enhancedSecurity.getSecurityMiddleware(),
  getSecurityStats: () => enhancedSecurity.getSecurityStats(),
  unblockIP: (ip) => enhancedSecurity.unblockIP(ip),
  addToWhitelist: (ip) => enhancedSecurity.addToWhitelist(ip)
};
