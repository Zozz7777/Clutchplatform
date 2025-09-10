/**
 * Global Error Handler Middleware
 * Handles unhandled promise rejections and uncaught exceptions
 */

const { logger } = require('../config/logger');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
  
  // Log to file if logger is available
  if (logger) {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
  }
  
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    console.error('Stack trace:', reason?.stack);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Log to file if logger is available
  if (logger) {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack
    });
  }
  
  // Exit the process for uncaught exceptions as they can leave the app in an undefined state
  console.error('Exiting process due to uncaught exception...');
  process.exit(1);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Handle SIGINT gracefully
process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = {
  setupGlobalErrorHandlers: () => {
    console.log('✅ Global error handlers initialized');
  }
};
