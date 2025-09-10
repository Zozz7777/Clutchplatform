const { getRedisClient } = require('../config/redis');
const { logger } = require('../config/logger');

/**
 * Circuit Breaker Middleware
 * Prevents cascading failures by temporarily blocking requests to failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.failures = new Map();
    this.states = new Map();
    this.redis = getRedisClient(); // Use centralized Redis client
  }

  async execute(operation, fallback = null, serviceName = 'unknown') {
    const state = await this.getState(serviceName);
    
    switch (state) {
      case 'OPEN':
        return this.handleOpenState(serviceName, fallback);
      
      case 'HALF_OPEN':
        return this.handleHalfOpenState(serviceName, operation, fallback);
      
      case 'CLOSED':
      default:
        return this.handleClosedState(serviceName, operation, fallback);
    }
  }

  async handleClosedState(serviceName, operation, fallback) {
    try {
      const result = await operation();
      await this.recordSuccess(serviceName);
      return result;
    } catch (error) {
      await this.recordFailure(serviceName);
      logger.warn(`Circuit breaker failure for ${serviceName}:`, error.message);
      
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          logger.error(`Fallback for ${serviceName} also failed:`, fallbackError);
        }
      }
      
      throw error;
    }
  }

  async handleOpenState(serviceName, fallback) {
    logger.warn(`Circuit breaker is OPEN for ${serviceName}, using fallback`);
    
    if (fallback) {
      try {
        return await fallback();
      } catch (error) {
        logger.error(`Fallback for ${serviceName} failed:`, error);
        throw new Error(`Service ${serviceName} is unavailable and fallback failed`);
      }
    }
    
    throw new Error(`Service ${serviceName} is temporarily unavailable`);
  }

  async handleHalfOpenState(serviceName, operation, fallback) {
    try {
      const result = await operation();
      await this.recordSuccess(serviceName);
      await this.setState(serviceName, 'CLOSED');
      return result;
    } catch (error) {
      await this.recordFailure(serviceName);
      await this.setState(serviceName, 'OPEN');
      logger.warn(`Circuit breaker reopened for ${serviceName}:`, error.message);
      
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          logger.error(`Fallback for ${serviceName} failed:`, fallbackError);
        }
      }
      
      throw error;
    }
  }

  async recordSuccess(serviceName) {
    const key = `circuit_breaker:${serviceName}:failures`;
    await this.redis.del(key);
  }

  async recordFailure(serviceName) {
    const key = `circuit_breaker:${serviceName}:failures`;
    const failures = await this.redis.incr(key);
    
    if (failures >= this.failureThreshold) {
      await this.setState(serviceName, 'OPEN');
      logger.error(`Circuit breaker opened for ${serviceName} after ${failures} failures`);
    }
  }

  async getState(serviceName) {
    const key = `circuit_breaker:${serviceName}:state`;
    const state = await this.redis.get(key);
    
    if (!state) {
      return 'CLOSED';
    }
    
    if (state === 'OPEN') {
      // Check if reset timeout has passed
      const lastFailureKey = `circuit_breaker:${serviceName}:last_failure`;
      const lastFailure = await this.redis.get(lastFailureKey);
      
      if (lastFailure && (Date.now() - parseInt(lastFailure)) > this.timeout) {
        await this.setState(serviceName, 'HALF_OPEN');
        return 'HALF_OPEN';
      }
    }
    
    return state;
  }

  async setState(serviceName, state) {
    const stateKey = `circuit_breaker:${serviceName}:state`;
    const lastFailureKey = `circuit_breaker:${serviceName}:last_failure`;
    
    await this.redis.set(stateKey, state);
    
    if (state === 'OPEN') {
      await this.redis.set(lastFailureKey, Date.now().toString());
    }
  }

  async getStats(serviceName) {
    const failures = await this.redis.get(`circuit_breaker:${serviceName}:failures`) || 0;
    const state = await this.getState(serviceName);
    
    return {
      serviceName,
      state,
      failures: parseInt(failures),
      failureThreshold: this.failureThreshold,
      resetTimeout: this.timeout
    };
  }
}

// Create middleware function
const circuitBreakerMiddleware = (options = {}) => {
  const circuitBreaker = new CircuitBreaker(options);
  
  return (serviceName) => {
    return async (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Record success if response is successful
        if (res.statusCode < 400) {
          circuitBreaker.recordSuccess(serviceName).catch(err => 
            logger.error('Failed to record circuit breaker success:', err)
          );
        } else {
          circuitBreaker.recordFailure(serviceName).catch(err => 
            logger.error('Failed to record circuit breaker failure:', err)
          );
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  };
};

module.exports = {
  CircuitBreaker,
  circuitBreakerMiddleware
};
