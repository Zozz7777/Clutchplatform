/**
 * Simple In-Memory Cache System
 */

const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

const cacheMiddleware = (ttl = CACHE_TTL) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalSend.call(this, data);
    };
    
    next();
  };
};

const clearCache = () => {
  cache.clear();
};

const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
  getCacheStats
};