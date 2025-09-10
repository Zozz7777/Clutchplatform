/**
 * AI Response Cache for Cost Optimization
 * Implements intelligent caching to reduce API costs and improve performance
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

class AIResponseCache {
  constructor() {
    // Singleton pattern to prevent multiple instances
    if (AIResponseCache.instance) {
      return AIResponseCache.instance;
    }
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/ai-response-cache.log' }),
        new winston.transports.Console()
      ]
    });

    this.cacheConfig = {
      // Cache TTL in milliseconds
      defaultTtl: 24 * 60 * 60 * 1000, // 24 hours
      maxCacheSize: 1000, // Maximum number of cached responses
      cacheDirectory: 'cache/ai-responses',
      // Different TTL for different types of responses
      ttlByType: {
        'analysis': 12 * 60 * 60 * 1000, // 12 hours for analysis
        'solution': 6 * 60 * 60 * 1000,  // 6 hours for solutions
        'code_fix': 2 * 60 * 60 * 1000,  // 2 hours for code fixes
        'general': 24 * 60 * 60 * 1000   // 24 hours for general responses
      }
    };

    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      saves: 0,
      evictions: 0,
      totalSavings: 0
    };

    this.initializeCache();
    AIResponseCache.instance = this;
  }

  /**
   * Initialize cache directory and load existing cache
   */
  async initializeCache() {
    try {
      await fs.mkdir(this.cacheConfig.cacheDirectory, { recursive: true });
      await this.loadCacheFromDisk();
      this.logger.info('✅ AI Response Cache initialized');
    } catch (error) {
      this.logger.error('Failed to initialize cache:', error);
    }
  }

  /**
   * Generate cache key from prompt and options
   */
  generateCacheKey(prompt, options = {}) {
    const keyData = {
      prompt: prompt.trim(),
      model: options.model || 'default',
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 4000,
      systemPrompt: options.systemPrompt || ''
    };

    const keyString = JSON.stringify(keyData);
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  /**
   * Get cached response
   */
  async get(prompt, options = {}) {
    try {
      const cacheKey = this.generateCacheKey(prompt, options);
      
      // Check memory cache first
      if (this.memoryCache.has(cacheKey)) {
        const cached = this.memoryCache.get(cacheKey);
        if (this.isValidCacheEntry(cached)) {
          this.cacheStats.hits++;
          this.logger.debug(`Cache hit: ${cacheKey.substring(0, 8)}...`);
          return cached.response;
        } else {
          this.memoryCache.delete(cacheKey);
        }
      }

      // Check disk cache
      const diskCache = await this.getFromDiskCache(cacheKey);
      if (diskCache && this.isValidCacheEntry(diskCache)) {
        // Load back into memory cache
        this.memoryCache.set(cacheKey, diskCache);
        this.cacheStats.hits++;
        this.logger.debug(`Cache hit (disk): ${cacheKey.substring(0, 8)}...`);
        return diskCache.response;
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      this.logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Save response to cache
   */
  async set(prompt, response, options = {}) {
    try {
      const cacheKey = this.generateCacheKey(prompt, options);
      const responseType = this.detectResponseType(prompt, response);
      const ttl = this.cacheConfig.ttlByType[responseType] || this.cacheConfig.defaultTtl;

      const cacheEntry = {
        key: cacheKey,
        response: response,
        timestamp: Date.now(),
        ttl: ttl,
        type: responseType,
        prompt: prompt.substring(0, 100), // Store first 100 chars for debugging
        options: {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens
        }
      };

      // Save to memory cache
      this.memoryCache.set(cacheKey, cacheEntry);

      // Save to disk cache
      await this.saveToDiskCache(cacheKey, cacheEntry);

      // Cleanup if cache is too large
      await this.cleanupCache();

      this.cacheStats.saves++;
      this.logger.debug(`Cache saved: ${cacheKey.substring(0, 8)}... (type: ${responseType})`);
    } catch (error) {
      this.logger.error('Cache set error:', error);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  isValidCacheEntry(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp || !cacheEntry.ttl) {
      return false;
    }

    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    return age < cacheEntry.ttl;
  }

  /**
   * Detect response type for appropriate TTL
   */
  detectResponseType(prompt, response) {
    const promptLower = prompt.toLowerCase();
    const responseLower = response.toLowerCase();

    if (promptLower.includes('analyze') || promptLower.includes('analysis')) {
      return 'analysis';
    } else if (promptLower.includes('solution') || promptLower.includes('fix') || promptLower.includes('resolve')) {
      return 'solution';
    } else if (promptLower.includes('code') || responseLower.includes('```') || responseLower.includes('function')) {
      return 'code_fix';
    } else {
      return 'general';
    }
  }

  /**
   * Get from disk cache
   */
  async getFromDiskCache(cacheKey) {
    try {
      const filePath = path.join(this.cacheConfig.cacheDirectory, `${cacheKey}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is corrupted
      return null;
    }
  }

  /**
   * Save to disk cache
   */
  async saveToDiskCache(cacheKey, cacheEntry) {
    try {
      const filePath = path.join(this.cacheConfig.cacheDirectory, `${cacheKey}.json`);
      await fs.writeFile(filePath, JSON.stringify(cacheEntry, null, 2), 'utf8');
    } catch (error) {
      this.logger.error('Failed to save to disk cache:', error);
    }
  }

  /**
   * Cleanup cache when it gets too large
   */
  async cleanupCache() {
    if (this.memoryCache.size <= this.cacheConfig.maxCacheSize) {
      return;
    }

    // Remove oldest entries
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, this.memoryCache.size - this.cacheConfig.maxCacheSize);
    
    for (const [key, entry] of toRemove) {
      this.memoryCache.delete(key);
      // Also remove from disk
      try {
        const filePath = path.join(this.cacheConfig.cacheDirectory, `${key}.json`);
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist
      }
      this.cacheStats.evictions++;
    }

    this.logger.info(`Cache cleanup: removed ${toRemove.length} entries`);
  }

  /**
   * Load cache from disk on startup
   */
  async loadCacheFromDisk() {
    try {
      const files = await fs.readdir(this.cacheConfig.cacheDirectory);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      let loadedCount = 0;
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.cacheConfig.cacheDirectory, file);
          const data = await fs.readFile(filePath, 'utf8');
          const cacheEntry = JSON.parse(data);

          if (this.isValidCacheEntry(cacheEntry)) {
            this.memoryCache.set(cacheEntry.key, cacheEntry);
            loadedCount++;
          } else {
            // Remove expired cache file
            await fs.unlink(filePath);
          }
        } catch (error) {
          // Skip corrupted files
          this.logger.warn(`Skipping corrupted cache file: ${file}`);
        }
      }

      this.logger.info(`Loaded ${loadedCount} valid cache entries from disk`);
    } catch (error) {
      this.logger.error('Failed to load cache from disk:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      this.memoryCache.clear();
      
      const files = await fs.readdir(this.cacheConfig.cacheDirectory);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      for (const file of jsonFiles) {
        await fs.unlink(path.join(this.cacheConfig.cacheDirectory, file));
      }

      this.cacheStats = {
        hits: 0,
        misses: 0,
        saves: 0,
        evictions: 0,
        totalSavings: 0
      };

      this.logger.info('Cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      maxCacheSize: this.cacheConfig.maxCacheSize,
      cacheDirectory: this.cacheConfig.cacheDirectory
    };
  }

  /**
   * Estimate cost savings
   */
  estimateCostSavings() {
    // Rough estimates based on typical API costs
    const costPerRequest = {
      'openai': 0.002, // $0.002 per request
      'gemini': 0.001, // $0.001 per request
      'deepseek': 0.0005, // $0.0005 per request
      'anthropic': 0.003, // $0.003 per request
      'grok': 0.001 // $0.001 per request
    };

    const averageCost = Object.values(costPerRequest).reduce((a, b) => a + b, 0) / Object.keys(costPerRequest).length;
    const estimatedSavings = this.cacheStats.hits * averageCost;

    return {
      cacheHits: this.cacheStats.hits,
      estimatedSavings: `$${estimatedSavings.toFixed(4)}`,
      averageCostPerRequest: `$${averageCost.toFixed(4)}`
    };
  }
}

module.exports = AIResponseCache;
