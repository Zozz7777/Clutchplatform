const rateLimit = require('express-rate-limit');

// General rate limiter
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (more strict)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a function that returns a rate limiter with custom configuration
const createRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // 100 requests default
    message: {
      error: options.message || 'Too many requests from this IP, please try again later.',
      retryAfter: `${Math.ceil((options.windowMs || 15 * 60 * 1000) / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

// Export the rate limit function for routes that need it
module.exports = {
  generalRateLimit,
  authRateLimit,
  apiRateLimit,
  rateLimit: createRateLimit // Function that can be called with configuration
};
