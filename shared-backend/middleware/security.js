const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// Security middleware
const securityMiddleware = (req, res, next) => {
  // HTTP Parameter Pollution protection
  hpp()(req, res, next);
};

// XSS protection middleware
const xssProtection = (req, res, next) => {
  xss()(req, res, next);
};

// MongoDB injection protection
const mongoInjectionProtection = (req, res, next) => {
  mongoSanitize()(req, res, next);
};

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 10 * 1024 * 1024; // 10MB
  
  if (req.headers && req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      maxSize: `${maxSize / (1024 * 1024)}MB`
    });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Input validation middleware
const inputValidation = (req, res, next) => {
  // Basic input sanitization
  const sanitizeInput = (obj) => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
    
    const sanitized = {};
    try {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          // Remove potentially dangerous characters
          sanitized[key] = value
            .replace(/[<>]/g, '') // Remove < and >
            .trim();
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeInput(value);
        } else {
          sanitized[key] = value;
        }
      }
    } catch (error) {
      console.warn('Error sanitizing input:', error.message);
      return obj; // Return original object if sanitization fails
    }
    return sanitized;
  };

  // Sanitize request body, query, and params
  if (req.body && typeof req.body === 'object') req.body = sanitizeInput(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeInput(req.query);
  if (req.params && typeof req.params === 'object') req.params = sanitizeInput(req.params);
  
  next();
};

// Failed attempts tracking
const failedAttempts = new Map();

const trackFailedAttempts = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  if (!failedAttempts.has(ip)) {
    failedAttempts.set(ip, { count: 0, firstAttempt: now });
  }
  
  const attempts = failedAttempts.get(ip);
  
  // Reset if window has passed
  if (now - attempts.firstAttempt > windowMs) {
    attempts.count = 0;
    attempts.firstAttempt = now;
  }
  
  // Track failed authentication attempts
  if (req.path.includes('/auth') && req.method === 'POST') {
    res.on('finish', () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        attempts.count++;
        
        // Block IP if too many failed attempts
        if (attempts.count >= 5) {
          console.warn(`🚫 IP ${ip} blocked due to too many failed attempts`);
        }
      } else if (res.statusCode === 200) {
        // Reset on successful authentication
        attempts.count = 0;
      }
    });
  }
  
  // Check if IP is blocked
  if (attempts.count >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed attempts. Please try again later.',
      retryAfter: Math.ceil((windowMs - (now - attempts.firstAttempt)) / 1000)
    });
  }
  
  next();
};

// Clean up old failed attempts
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  for (const [ip, attempts] of failedAttempts.entries()) {
    if (now - attempts.firstAttempt > windowMs) {
      failedAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = {
  securityMiddleware,
  xssProtection,
  mongoInjectionProtection,
  requestSizeLimit,
  securityHeaders,
  inputValidation,
  trackFailedAttempts
};
