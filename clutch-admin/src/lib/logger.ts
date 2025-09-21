/**
 * Production-safe logging utility
 * Only logs in development environment
 */

import { handleError, handleWarning } from './error-handler';

export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
    // Also use centralized error handling for production logging
    if (args.length > 0 && args[0] instanceof Error) {
      handleError(args[0], { component: 'Logger' });
    }
  },
  
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
    // Also use centralized warning handling
    if (args.length > 0 && typeof args[0] === 'string') {
      handleWarning(args[0], { component: 'Logger' });
    }
  },
  
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  }
};

// For backward compatibility
export const devLog = logger.log;
export const devError = logger.error;
export const devWarn = logger.warn;
export const devInfo = logger.info;
export const devDebug = logger.debug;
