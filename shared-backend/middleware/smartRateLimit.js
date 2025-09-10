const { getRedisClient } = require('../config/redis');
const { logger } = require('../config/logger');

/**
 * Smart Rate Limiting Middleware
 * Provides intelligent rate limiting with dynamic thresholds
 */
class SmartRateLimit {
  constructor(options = {}) {
    this.redis = getRedisClient(); // Use centralized Redis client
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100;
    this.dynamicThresholds = options.dynamicThresholds || true;
  }

  // Smart rate limiting with user tier support
  createSmartRateLimit(options = {}) {
    return async (req, res, next) => {
      try {
        const identifier = this.getIdentifier(req);
        const userTier = await this.getUserTier(req);
        const endpointWeight = this.getEndpointWeight(req);
        
        const limits = this.userTiers[userTier] || this.userTiers.free;
        const adjustedLimits = this.adjustLimitsForWeight(limits, endpointWeight);
        
        const isAllowed = await this.checkRateLimit(identifier, adjustedLimits, req);
        
        if (!isAllowed) {
          const retryAfter = await this.getRetryAfter(identifier);
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            retryAfter,
            userTier,
            limits: adjustedLimits
          });
        }
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', adjustedLimits.requestsPerMinute);
        res.setHeader('X-RateLimit-Remaining', await this.getRemainingRequests(identifier));
        res.setHeader('X-RateLimit-Reset', await this.getResetTime(identifier));
        
        next();
      } catch (error) {
        logger.error('Rate limiting error:', error);
        next(); // Allow request to proceed if rate limiting fails
      }
    };
  }

  getIdentifier(req) {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip || req.connection.remoteAddress;
  }

  async getUserTier(req) {
    if (!req.user) return 'free';
    
    try {
      // Check user subscription or role
      if (req.user.role === 'admin' || req.user.role === 'enterprise') {
        return 'enterprise';
      }
      
      // Check subscription status
      const subscription = await this.getUserSubscription(req.user.id);
      if (subscription?.plan === 'premium') {
        return 'premium';
      }
      
      return 'free';
    } catch (error) {
      logger.error('Failed to get user tier:', error);
      return 'free';
    }
  }

  getEndpointWeight(req) {
    const key = `${req.method} ${req.path}`;
    return this.endpointWeights[key] || 1;
  }

  adjustLimitsForWeight(limits, weight) {
    return {
      requestsPerMinute: Math.floor(limits.requestsPerMinute / weight),
      requestsPerHour: Math.floor(limits.requestsPerHour / weight),
      burstLimit: Math.floor(limits.burstLimit / weight)
    };
  }

  async checkRateLimit(identifier, limits, req) {
    const now = Date.now();
    const minuteKey = `rate_limit:${identifier}:minute:${Math.floor(now / 60000)}`;
    const hourKey = `rate_limit:${identifier}:hour:${Math.floor(now / 3600000)}`;
    const burstKey = `rate_limit:${identifier}:burst:${Math.floor(now / 1000)}`;

    // Check burst limit first
    const burstCount = await this.redis.incr(burstKey);
    await this.redis.expire(burstKey, 1);
    
    if (burstCount > limits.burstLimit) {
      return false;
    }

    // Check minute limit
    const minuteCount = await this.redis.incr(minuteKey);
    await this.redis.expire(minuteKey, 60);
    
    if (minuteCount > limits.requestsPerMinute) {
      return false;
    }

    // Check hour limit
    const hourCount = await this.redis.incr(hourKey);
    await this.redis.expire(hourKey, 3600);
    
    if (hourCount > limits.requestsPerHour) {
      return false;
    }

    // Log rate limit usage for analytics
    this.logRateLimitUsage(identifier, req, limits);
    
    return true;
  }

  async getRetryAfter(identifier) {
    const now = Date.now();
    const minuteKey = `rate_limit:${identifier}:minute:${Math.floor(now / 60000)}`;
    const ttl = await this.redis.ttl(minuteKey);
    return Math.max(ttl, 1);
  }

  async getRemainingRequests(identifier) {
    const now = Date.now();
    const minuteKey = `rate_limit:${identifier}:minute:${Math.floor(now / 60000)}`;
    const count = await this.redis.get(minuteKey) || 0;
    return Math.max(0, 60 - parseInt(count));
  }

  async getResetTime(identifier) {
    const now = Date.now();
    return Math.floor(now / 60000) * 60000 + 60000;
  }

  async getUserSubscription(userId) {
    try {
      const collection = await getCollection('subscriptions');
      return await collection.findOne({ userId, status: 'active' });
    } catch (error) {
      logger.error('Failed to get user subscription:', error);
      return null;
    }
  }

  logRateLimitUsage(identifier, req, limits) {
    logger.info('Rate limit usage', {
      identifier,
      method: req.method,
      path: req.path,
      userTier: req.user?.role || 'anonymous',
      limits
    });
  }

  // Adaptive rate limiting based on system load
  createAdaptiveRateLimit(baseOptions = {}) {
    return async (req, res, next) => {
      try {
        const systemLoad = await this.getSystemLoad();
        const adjustedOptions = this.adjustForSystemLoad(baseOptions, systemLoad);
        
        const limiter = this.createSmartRateLimit(adjustedOptions);
        return limiter(req, res, next);
      } catch (error) {
        logger.error('Adaptive rate limiting error:', error);
        next();
      }
    };
  }

  async getSystemLoad() {
    try {
      const usage = process.memoryUsage();
      const memoryUsage = (usage.heapUsed / usage.heapTotal) * 100;
      
      return {
        memory: memoryUsage,
        cpu: process.cpuUsage(),
        uptime: process.uptime()
      };
    } catch (error) {
      return { memory: 50, cpu: { user: 0, system: 0 }, uptime: 0 };
    }
  }

  adjustForSystemLoad(options, systemLoad) {
    const adjusted = { ...options };
    
    // Reduce limits if system is under high load
    if (systemLoad.memory > 80) {
      adjusted.max = Math.floor(adjusted.max * 0.5);
      adjusted.windowMs = adjusted.windowMs * 1.5;
    } else if (systemLoad.memory > 60) {
      adjusted.max = Math.floor(adjusted.max * 0.8);
    }
    
    return adjusted;
  }

  // Whitelist management
  async isWhitelisted(identifier) {
    try {
      const whitelist = await this.redis.smembers('rate_limit_whitelist');
      return whitelist.includes(identifier);
    } catch (error) {
      return false;
    }
  }

  async addToWhitelist(identifier) {
    try {
      await this.redis.sadd('rate_limit_whitelist', identifier);
      logger.info(`Added ${identifier} to rate limit whitelist`);
    } catch (error) {
      logger.error('Failed to add to whitelist:', error);
    }
  }

  async removeFromWhitelist(identifier) {
    try {
      await this.redis.srem('rate_limit_whitelist', identifier);
      logger.info(`Removed ${identifier} from rate limit whitelist`);
    } catch (error) {
      logger.error('Failed to remove from whitelist:', error);
    }
  }

  // Rate limit analytics
  async getRateLimitStats() {
    try {
      const stats = {
        totalRequests: await this.redis.get('rate_limit:total_requests') || 0,
        blockedRequests: await this.redis.get('rate_limit:blocked_requests') || 0,
        whitelistedUsers: await this.redis.scard('rate_limit_whitelist') || 0,
        topUsers: await this.getTopUsers(),
        topEndpoints: await this.getTopEndpoints()
      };
      
      return stats;
    } catch (error) {
      logger.error('Failed to get rate limit stats:', error);
      return {};
    }
  }

  async getTopUsers() {
    try {
      const keys = await this.redis.keys('rate_limit:*:minute:*');
      const userStats = {};
      
      for (const key of keys.slice(0, 100)) { // Limit to first 100 keys
        const identifier = key.split(':')[1];
        const count = await this.redis.get(key) || 0;
        userStats[identifier] = (userStats[identifier] || 0) + parseInt(count);
      }
      
      return Object.entries(userStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([user, count]) => ({ user, count }));
    } catch (error) {
      return [];
    }
  }

  async getTopEndpoints() {
    try {
      const keys = await this.redis.keys('rate_limit:endpoint:*');
      const endpointStats = {};
      
      for (const key of keys) {
        const endpoint = key.split(':')[2];
        const count = await this.redis.get(key) || 0;
        endpointStats[endpoint] = (endpointStats[endpoint] || 0) + parseInt(count);
      }
      
      return Object.entries(endpointStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count }));
    } catch (error) {
      return [];
    }
  }
}

// Create singleton instance
const smartRateLimiter = new SmartRateLimit();

// Export middleware functions
const createSmartRateLimit = (options = {}) => {
  return smartRateLimiter.createSmartRateLimit(options);
};

const createAdaptiveRateLimit = (options = {}) => {
  return smartRateLimiter.createAdaptiveRateLimit(options);
};

// Pre-configured rate limiters
const authRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
});

const apiRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'API rate limit exceeded, please try again later.'
});

const paymentRateLimit = createSmartRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment attempts per hour
  message: 'Too many payment attempts, please try again later.'
});

const uploadRateLimit = createSmartRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, please try again later.'
});

module.exports = {
  createSmartRateLimit,
  createAdaptiveRateLimit,
  authRateLimit,
  apiRateLimit,
  paymentRateLimit,
  uploadRateLimit,
  smartRateLimiter
};
