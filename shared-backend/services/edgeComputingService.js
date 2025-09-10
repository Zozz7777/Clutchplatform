const { logger } = require('../config/logger');
const axios = require('axios');

/**
 * Edge Computing Service
 * Manages global CDN, edge functions, and geographic optimization
 */
class EdgeComputingService {
  constructor() {
    this.edgeNodes = new Map();
    this.cdnConfig = {
      regions: [
        { name: 'us-east-1', location: 'Virginia', latency: 50 },
        { name: 'us-west-1', location: 'California', latency: 80 },
        { name: 'eu-west-1', location: 'Ireland', latency: 120 },
        { name: 'ap-southeast-1', location: 'Singapore', latency: 150 },
        { name: 'sa-east-1', location: 'São Paulo', latency: 180 }
      ],
      defaultRegion: 'us-east-1',
      cacheTTL: 3600, // 1 hour
      maxCacheSize: 1000 // MB
    };
    this.edgeFunctions = new Map();
    this.initializeEdgeNodes();
  }

  /**
   * Initialize edge nodes and their configurations
   */
  initializeEdgeNodes() {
    this.cdnConfig.regions.forEach(region => {
      this.edgeNodes.set(region.name, {
        ...region,
        status: 'active',
        load: 0,
        cache: new Map(),
        functions: new Map(),
        lastSync: new Date(),
        metrics: {
          requests: 0,
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0,
          latency: region.latency
        }
      });
    });
  }

  /**
   * Get optimal edge node for user location
   */
  getOptimalEdgeNode(userLocation) {
    try {
      const { latitude, longitude } = userLocation;
      
      // Calculate distances to all edge nodes
      const distances = this.cdnConfig.regions.map(region => ({
        ...region,
        distance: this.calculateDistance(latitude, longitude, region.latitude, region.longitude)
      }));

      // Sort by distance and load
      const sortedNodes = distances.sort((a, b) => {
        const distanceScore = a.distance - b.distance;
        const loadScore = (a.load || 0) - (b.load || 0);
        return distanceScore + loadScore * 0.3; // Weight load less than distance
      });

      return sortedNodes[0];
    } catch (error) {
      logger.error('Error getting optimal edge node:', error);
      return this.cdnConfig.regions.find(r => r.name === this.cdnConfig.defaultRegion);
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Cache data at edge nodes
   */
  async cacheAtEdge(key, data, options = {}) {
    const { ttl = this.cdnConfig.cacheTTL, regions = [] } = options;
    
    try {
      const targetRegions = regions.length > 0 ? regions : this.cdnConfig.regions.map(r => r.name);
      
      const cachePromises = targetRegions.map(async (regionName) => {
        const edgeNode = this.edgeNodes.get(regionName);
        if (!edgeNode) return false;

        const cacheEntry = {
          data,
          timestamp: Date.now(),
          ttl: ttl * 1000, // Convert to milliseconds
          accessCount: 0
        };

        edgeNode.cache.set(key, cacheEntry);
        
        // Implement cache size limit
        if (edgeNode.cache.size > this.cdnConfig.maxCacheSize) {
          this.evictOldestCache(edgeNode);
        }

        logger.info(`Cached data at edge node: ${regionName}, key: ${key}`);
        return true;
      });

      const results = await Promise.all(cachePromises);
      return results.every(result => result);
    } catch (error) {
      logger.error('Error caching at edge:', error);
      return false;
    }
  }

  /**
   * Get data from edge cache
   */
  async getFromEdgeCache(key, userLocation) {
    try {
      const optimalNode = this.getOptimalEdgeNode(userLocation);
      const edgeNode = this.edgeNodes.get(optimalNode.name);
      
      if (!edgeNode) {
        return { cached: false, data: null, source: 'origin' };
      }

      const cacheEntry = edgeNode.cache.get(key);
      if (!cacheEntry) {
        edgeNode.metrics.cacheMisses++;
        return { cached: false, data: null, source: 'origin' };
      }

      // Check if cache entry is expired
      if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
        edgeNode.cache.delete(key);
        edgeNode.metrics.cacheMisses++;
        return { cached: false, data: null, source: 'origin' };
      }

      // Update access count and metrics
      cacheEntry.accessCount++;
      edgeNode.metrics.cacheHits++;
      edgeNode.metrics.requests++;

      return {
        cached: true,
        data: cacheEntry.data,
        source: optimalNode.name,
        latency: optimalNode.latency
      };
    } catch (error) {
      logger.error('Error getting from edge cache:', error);
      return { cached: false, data: null, source: 'origin' };
    }
  }

  /**
   * Evict oldest cache entries when limit is reached
   */
  evictOldestCache(edgeNode) {
    const entries = Array.from(edgeNode.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      edgeNode.cache.delete(entries[i][0]);
    }
  }

  /**
   * Register edge function
   */
  registerEdgeFunction(name, functionCode, options = {}) {
    const { regions = [], timeout = 5000, memory = 128 } = options;
    
    try {
      const edgeFunction = {
        name,
        code: functionCode,
        regions: regions.length > 0 ? regions : this.cdnConfig.regions.map(r => r.name),
        timeout,
        memory,
        createdAt: new Date(),
        invocations: 0,
        errors: 0,
        avgExecutionTime: 0
      };

      this.edgeFunctions.set(name, edgeFunction);
      
      // Deploy to specified regions
      edgeFunction.regions.forEach(regionName => {
        const edgeNode = this.edgeNodes.get(regionName);
        if (edgeNode) {
          edgeNode.functions.set(name, edgeFunction);
        }
      });

      logger.info(`Edge function registered: ${name} in ${edgeFunction.regions.length} regions`);
      return true;
    } catch (error) {
      logger.error('Error registering edge function:', error);
      return false;
    }
  }

  /**
   * Execute edge function
   */
  async executeEdgeFunction(name, data, userLocation) {
    try {
      const functionDef = this.edgeFunctions.get(name);
      if (!functionDef) {
        throw new Error(`Edge function not found: ${name}`);
      }

      const optimalNode = this.getOptimalEdgeNode(userLocation);
      const edgeNode = this.edgeNodes.get(optimalNode.name);
      
      if (!edgeNode || !edgeNode.functions.has(name)) {
        throw new Error(`Function not available in region: ${optimalNode.name}`);
      }

      const startTime = Date.now();
      functionDef.invocations++;

      // Execute function in sandboxed environment
      const result = await this.executeInSandbox(functionDef.code, data, {
        timeout: functionDef.timeout,
        memory: functionDef.memory
      });

      const executionTime = Date.now() - startTime;
      functionDef.avgExecutionTime = (functionDef.avgExecutionTime + executionTime) / 2;

      logger.info(`Edge function executed: ${name} in ${executionTime}ms`);
      return {
        result,
        executionTime,
        region: optimalNode.name,
        latency: optimalNode.latency
      };
    } catch (error) {
      const functionDef = this.edgeFunctions.get(name);
      if (functionDef) {
        functionDef.errors++;
      }
      logger.error('Error executing edge function:', error);
      throw error;
    }
  }

  /**
   * Execute function in sandboxed environment
   */
  async executeInSandbox(code, data, options) {
    // In production, this would use a proper sandboxing solution
    // For now, we'll use a simple eval with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Function execution timeout'));
      }, options.timeout);

      try {
        // Create sandboxed context
        const sandbox = {
          data,
          console: {
            log: (...args) => logger.info('Edge function log:', ...args),
            error: (...args) => logger.error('Edge function error:', ...args)
          },
          Date,
          Math,
          JSON,
          setTimeout,
          clearTimeout
        };

        // Execute function
        const func = new Function('data', 'console', 'Date', 'Math', 'JSON', 'setTimeout', 'clearTimeout', code);
        const result = func(data, sandbox.console, Date, Math, JSON, setTimeout, clearTimeout);
        
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Get edge computing statistics
   */
  getEdgeStats() {
    const stats = {
      totalNodes: this.edgeNodes.size,
      activeNodes: 0,
      totalRequests: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      cacheHitRate: 0,
      totalFunctions: this.edgeFunctions.size,
      functionInvocations: 0,
      functionErrors: 0,
      regions: []
    };

    this.edgeNodes.forEach((node, regionName) => {
      if (node.status === 'active') {
        stats.activeNodes++;
        stats.totalRequests += node.metrics.requests;
        stats.totalCacheHits += node.metrics.cacheHits;
        stats.totalCacheMisses += node.metrics.cacheMisses;
        
        stats.regions.push({
          name: regionName,
          location: node.location,
          status: node.status,
          load: node.load,
          requests: node.metrics.requests,
          cacheHits: node.metrics.cacheHits,
          cacheMisses: node.metrics.cacheMisses,
          latency: node.metrics.latency,
          cacheSize: node.cache.size,
          functionsCount: node.functions.size
        });
      }
    });

    if (stats.totalRequests > 0) {
      stats.cacheHitRate = (stats.totalCacheHits / (stats.totalCacheHits + stats.totalCacheMisses)) * 100;
    }

    this.edgeFunctions.forEach(func => {
      stats.functionInvocations += func.invocations;
      stats.functionErrors += func.errors;
    });

    return stats;
  }

  /**
   * Update edge node load
   */
  updateNodeLoad(regionName, load) {
    const edgeNode = this.edgeNodes.get(regionName);
    if (edgeNode) {
      edgeNode.load = load;
      edgeNode.lastSync = new Date();
    }
  }

  /**
   * Health check for edge nodes
   */
  async healthCheck() {
    const healthStatus = {
      status: 'healthy',
      nodes: [],
      timestamp: new Date().toISOString()
    };

    for (const [regionName, node] of this.edgeNodes) {
      const nodeHealth = {
        region: regionName,
        status: node.status,
        latency: node.metrics.latency,
        load: node.load,
        lastSync: node.lastSync,
        cacheSize: node.cache.size,
        functionsCount: node.functions.size
      };

      // Check if node is responsive
      try {
        // In production, this would be an actual health check
        const isHealthy = node.status === 'active' && 
                         Date.now() - node.lastSync.getTime() < 300000; // 5 minutes
        
        nodeHealth.healthy = isHealthy;
        if (!isHealthy) {
          healthStatus.status = 'degraded';
        }
      } catch (error) {
        nodeHealth.healthy = false;
        healthStatus.status = 'unhealthy';
      }

      healthStatus.nodes.push(nodeHealth);
    }

    return healthStatus;
  }

  /**
   * Clear edge cache
   */
  async clearEdgeCache(regions = []) {
    try {
      const targetRegions = regions.length > 0 ? regions : Array.from(this.edgeNodes.keys());
      
      targetRegions.forEach(regionName => {
        const edgeNode = this.edgeNodes.get(regionName);
        if (edgeNode) {
          edgeNode.cache.clear();
          logger.info(`Cleared cache for edge node: ${regionName}`);
        }
      });

      return true;
    } catch (error) {
      logger.error('Error clearing edge cache:', error);
      return false;
    }
  }

  /**
   * Optimize edge distribution
   */
  async optimizeDistribution() {
    try {
      const stats = this.getEdgeStats();
      const optimizations = [];

      // Analyze load distribution
      const avgLoad = stats.regions.reduce((sum, region) => sum + region.load, 0) / stats.regions.length;
      
      stats.regions.forEach(region => {
        if (region.load > avgLoad * 1.5) {
          optimizations.push({
            type: 'load_balancing',
            region: region.name,
            currentLoad: region.load,
            recommendedAction: 'Consider adding more edge nodes or redistributing load'
          });
        }
      });

      // Analyze cache hit rates
      stats.regions.forEach(region => {
        const hitRate = region.requests > 0 ? (region.cacheHits / region.requests) * 100 : 0;
        if (hitRate < 50) {
          optimizations.push({
            type: 'cache_optimization',
            region: region.name,
            currentHitRate: hitRate.toFixed(2) + '%',
            recommendedAction: 'Consider adjusting cache TTL or pre-warming popular content'
          });
        }
      });

      return optimizations;
    } catch (error) {
      logger.error('Error optimizing edge distribution:', error);
      return [];
    }
  }
}

// Create singleton instance
const edgeComputingService = new EdgeComputingService();

module.exports = edgeComputingService;
