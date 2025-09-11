const { logger } = require('../config/logger');
const { createErrorResponse, handleDatabaseError, handleAuthError, ERROR_MESSAGES, ERROR_STATUS_CODES } = require('../utils/errorHandler');

const enhancedErrorHandler = (err, req, res, next) => {
  // Log error with context
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    requestBody: req.body,
    requestQuery: req.query,
    requestParams: req.params
  });

  let errorResponse;

  // Handle different types of errors using our comprehensive error handling
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const validationErrors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    errorResponse = createErrorResponse('INVALID_INPUT',
      'Validation failed. Please check the provided data.',
      { validationErrors },
      err
    );
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT errors
    errorResponse = handleAuthError(err);
  } else if (err.code === 11000 || err.name === 'CastError') {
    // Database errors
    errorResponse = handleDatabaseError(err);
  } else if (err.customError) {
    // Custom error with predefined code
    errorResponse = createErrorResponse(err.code, err.message, err.details, err);
  } else if (err.name === 'UnauthorizedError') {
    errorResponse = createErrorResponse('INVALID_CREDENTIALS', err.message, {}, err);
  } else if (err.name === 'ForbiddenError') {
    errorResponse = createErrorResponse('INSUFFICIENT_PERMISSIONS', err.message, {}, err);
  } else if (err.name === 'NotFoundError') {
    errorResponse = createErrorResponse('USER_NOT_FOUND', err.message, {}, err);
  } else if (err.code === 'ECONNREFUSED') {
    errorResponse = createErrorResponse('DATABASE_CONNECTION_FAILED', null, {}, err);
  } else if (err.code === 'ETIMEDOUT') {
    errorResponse = createErrorResponse('TIMEOUT_ERROR', null, {}, err);
  } else {
    // Generic server error
    errorResponse = createErrorResponse('INTERNAL_SERVER_ERROR', null, {}, err);
  }

  // Add request context to error response
  errorResponse.path = req.url;
  errorResponse.method = req.method;

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.statusCode).json(errorResponse);
};

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = { 
  enhancedErrorHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};

    // Add timeout handling for slow requests
    const timeoutHandler = (req, res, next) => {
      const timeout = 30000; // 30 seconds timeout
      
      req.setTimeout(timeout, () => {
        if (!res.headersSent) {
          res.status(408).json({
            success: false,
            error: 'REQUEST_TIMEOUT',
            message: 'Request timed out after 30 seconds',
            timestamp: new Date().toISOString()
          });
        }
      });
      
      next();
    };
    
    module.exports.timeoutHandler = timeoutHandler;
    