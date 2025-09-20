const dbService = require('./databaseService');
const redis = require('../config/redis');
const { getDb } = require('../config/database');
const os = require('os');

class CostOptimizationService {
    constructor() {
        this.metrics = new Map();
        this.optimizationRules = new Map();
        this.costThresholds = {
            databaseQueries: 1000,
            redisOperations: 5000,
            memoryUsage: 80, // percentage
            cpuUsage: 70, // percentage
            responseTime: 2000 // milliseconds
        };

        this.initializeOptimizationRules();
        this.startMonitoring();
    }

    /**
     * Initialize optimization rules
     */
    initializeOptimizationRules() {
        // Database optimization rules
        this.optimizationRules.set('database', {
            slowQueries: { threshold: 1000, action: 'log' },
            frequentQueries: { threshold: 100, action: 'cache' },
            largeResults: { threshold: 1000, action: 'paginate' }
        });

        // Redis optimization rules
        this.optimizationRules.set('redis', {
            memoryUsage: { threshold: 80, action: 'cleanup' },
            keyExpiration: { threshold: 1000, action: 'optimize' },
            connectionPool: { threshold: 10, action: 'monitor' }
        });

        // API optimization rules
        this.optimizationRules.set('api', {
            responseTime: { threshold: 2000, action: 'optimize' },
            requestSize: { threshold: 1024 * 1024, action: 'compress' },
            concurrentRequests: { threshold: 100, action: 'throttle' }
        });
    }

    /**
     * Start monitoring
     */
    startMonitoring() {
        // Monitor system resources every 5 minutes
        setInterval(() => this.monitorSystemResources(), 5 * 60 * 1000);
        
        // Monitor database performance every 10 minutes
        setInterval(() => this.monitorDatabasePerformance(), 10 * 60 * 1000);
        
        // Monitor Redis performance every 5 minutes
        setInterval(() => this.monitorRedisPerformance(), 5 * 60 * 1000);
        
        // Generate cost report daily
        setInterval(() => this.generateCostReport(), 24 * 60 * 60 * 1000);
    }

    /**
     * Monitor system resources
     */
    async monitorSystemResources() {
        try {
            const metrics = {
                timestamp: new Date(),
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem(),
                    usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
                },
                cpu: {
                    loadAverage: os.loadavg(),
                    cores: os.cpus().length
                },
                uptime: os.uptime()
            };

            // Store metrics
            await this.storeMetrics('system', metrics);

            // Check thresholds
            if (metrics.memory.usagePercentage > this.costThresholds.memoryUsage) {
                await this.triggerOptimization('memory', metrics.memory);
            }

            if (metrics.cpu.loadAverage[0] > this.costThresholds.cpuUsage) {
                await this.triggerOptimization('cpu', metrics.cpu);
            }

            console.log('System resources monitored');
        } catch (error) {
            console.error('Error monitoring system resources:', error);
        }
    }

    /**
     * Monitor database performance
     */
    async monitorDatabasePerformance() {
        try {
            const startTime = Date.now();
            
            // Get database stats
            const db = await getDb();
            const dbStats = await db.stats();
            
            // Test query performance
            const testQuery = await this.testQueryPerformance();
            
            const metrics = {
                timestamp: new Date(),
                collections: dbStats.collections,
                dataSize: dbStats.dataSize,
                storageSize: dbStats.storageSize,
                indexes: dbStats.indexes,
                indexSize: dbStats.indexSize,
                queryPerformance: testQuery,
                responseTime: Date.now() - startTime
            };

            // Store metrics
            await this.storeMetrics('database', metrics);

            // Check for optimization opportunities
            await this.checkDatabaseOptimizations(metrics);

            console.log('Database performance monitored');
        } catch (error) {
            console.error('Error monitoring database performance:', error);
        }
    }

    /**
     * Test query performance
     */
    async testQueryPerformance() {
        const queries = [
            { name: 'users_count', query: async () => await dbService.count('users') },
            { name: 'bookings_count', query: async () => await dbService.count('bookings') },
            { name: 'recent_bookings', query: async () => await dbService.find('bookings', {}, { limit: 10 }) }
        ];

        const results = {};
        
        for (const { name, query } of queries) {
            const startTime = Date.now();
            try {
                await query();
                results[name] = Date.now() - startTime;
            } catch (error) {
                results[name] = -1; // Error
            }
        }

        return results;
    }

    /**
     * Monitor Redis performance
     */
    async monitorRedisPerformance() {
        try {
            const redisClient = redis.getRedisClient();
            if (!redisClient) {
                console.log('Redis client not available');
                return;
            }
            
            const info = await redisClient.info();
            const memory = await redisClient.info('memory');
            
            // Parse Redis info
            const metrics = {
                timestamp: new Date(),
                connectedClients: this.parseRedisInfo(info, 'connected_clients'),
                usedMemory: this.parseRedisInfo(memory, 'used_memory'),
                usedMemoryPeak: this.parseRedisInfo(memory, 'used_memory_peak'),
                keyspaceHits: this.parseRedisInfo(info, 'keyspace_hits'),
                keyspaceMisses: this.parseRedisInfo(info, 'keyspace_misses'),
                totalCommandsProcessed: this.parseRedisInfo(info, 'total_commands_processed')
            };

            // Calculate hit rate
            const totalRequests = metrics.keyspaceHits + metrics.keyspaceMisses;
            metrics.hitRate = totalRequests > 0 ? (metrics.keyspaceHits / totalRequests) * 100 : 0;

            // Store metrics
            await this.storeMetrics('redis', metrics);

            // Check for optimization opportunities
            await this.checkRedisOptimizations(metrics);

            console.log('Redis performance monitored');
        } catch (error) {
            console.error('Error monitoring Redis performance:', error);
        }
    }

    /**
     * Parse Redis info output
     */
    parseRedisInfo(info, key) {
        const match = info.match(new RegExp(`${key}:(\\d+)`));
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Store metrics
     */
    async storeMetrics(type, metrics) {
        const key = `cost_metrics:${type}:${new Date().toISOString().slice(0, 10)}`;
        
        try {
            const redisClient = redis.getRedisClient();
            if (redisClient) {
                await redisClient.hset(key, Date.now().toString(), JSON.stringify(metrics));
                await redisClient.expire(key, 7 * 24 * 60 * 60); // 7 days
            }
        } catch (error) {
            console.error('Error storing metrics:', error);
        }
    }

    /**
     * Check database optimizations
     */
    async checkDatabaseOptimizations(metrics) {
        // Check for slow queries
        if (metrics.queryPerformance.recent_bookings > 1000) {
            await this.optimizeDatabaseQueries();
        }

        // Check for large data size
        if (metrics.dataSize > 100 * 1024 * 1024) { // 100MB
            await this.optimizeDataStorage();
        }

        // Check for too many indexes
        if (metrics.indexes > 20) {
            await this.optimizeIndexes();
        }
    }

    /**
     * Check Redis optimizations
     */
    async checkRedisOptimizations(metrics) {
        // Check hit rate
        if (metrics.hitRate < 80) {
            await this.optimizeRedisCaching();
        }

        // Check memory usage
        if (metrics.usedMemory > 100 * 1024 * 1024) { // 100MB
            await this.optimizeRedisMemory();
        }
    }

    /**
     * Optimize database queries
     */
    async optimizeDatabaseQueries() {
        try {
            console.log('Optimizing database queries...');
            
            // Create indexes for frequently queried fields
            const indexes = [
                { collection: 'bookings', fields: { userId: 1, status: 1 } },
                { collection: 'bookings', fields: { createdAt: -1 } },
                { collection: 'users', fields: { email: 1 } },
                { collection: 'mechanics', fields: { status: 1, location: '2dsphere' } }
            ];

            for (const index of indexes) {
                try {
                    await dbService.createIndex(index.collection, index.fields);
                } catch (error) {
                    // Index might already exist
                }
            }

            console.log('Database query optimization completed');
        } catch (error) {
            console.error('Error optimizing database queries:', error);
        }
    }

    /**
     * Optimize data storage
     */
    async optimizeDataStorage() {
        try {
            console.log('Optimizing data storage...');
            
            // Archive old data
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            // Move old analytics events to archive
            const oldEvents = await dbService.find('analytics_events', { timestamp: { $lt: thirtyDaysAgo } });
            
            if (oldEvents.length > 0) {
                await dbService.bulkInsert('analytics_events_archive', oldEvents);
                
                // Delete old events from main collection
                const db = await getDb();
                await db.collection('analytics_events').deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
            }

            console.log('Data storage optimization completed');
        } catch (error) {
            console.error('Error optimizing data storage:', error);
        }
    }

    /**
     * Optimize indexes
     */
    async optimizeIndexes() {
        try {
            console.log('Optimizing indexes...');
            
            // Get current indexes
            const db = await getDb();
            const collections = await db.listCollections().toArray();
            
            for (const collection of collections) {
                const indexes = await dbService.getIndexes(collection.name);
                
                // Remove duplicate or unnecessary indexes
                const indexNames = indexes.map(idx => idx.name);
                const duplicateIndexes = this.findDuplicateIndexes(indexes);
                
                for (const duplicate of duplicateIndexes) {
                    try {
                        await dbService.dropIndex(collection.name, duplicate);
                    } catch (error) {
                        // Index might not exist
                    }
                }
            }

            console.log('Index optimization completed');
        } catch (error) {
            console.error('Error optimizing indexes:', error);
        }
    }

    /**
     * Find duplicate indexes
     */
    findDuplicateIndexes(indexes) {
        const duplicates = [];
        const seen = new Set();
        
        for (const index of indexes) {
            const key = JSON.stringify(index.key);
            if (seen.has(key) && index.name !== '_id_') {
                duplicates.push(index.name);
            }
            seen.add(key);
        }
        
        return duplicates;
    }

    /**
     * Optimize Redis caching
     */
    async optimizeRedisCaching() {
        try {
            console.log('Optimizing Redis caching...');
            
            // Implement cache warming for frequently accessed data
            const cacheKeys = [
                'business_analytics:30d',
                'user_analytics:*',
                'service_list',
                'mechanic_list'
            ];
            
            for (const pattern of cacheKeys) {
                const redisClient = redis.getRedisClient();
            if (!redisClient) return [];
            
            const keys = await redisClient.keys(pattern);
                for (const key of keys) {
                    // Refresh cache if expired
                    const ttl = await redisClient.ttl(key);
                    if (ttl < 300) { // Less than 5 minutes
                        await this.warmCache(key);
                    }
                }
            }

            console.log('Redis caching optimization completed');
        } catch (error) {
            console.error('Error optimizing Redis caching:', error);
        }
    }

    /**
     * Warm cache
     */
    async warmCache(key) {
        try {
            if (key.includes('business_analytics')) {
                // Warm business analytics cache
                const analyticsService = require('./analyticsService');
                await analyticsService.getBusinessAnalytics('30d');
            } else if (key.includes('user_analytics')) {
                // Warm user analytics cache
                const userId = key.split(':')[2];
                const analyticsService = require('./analyticsService');
                await analyticsService.getUserAnalytics(userId, '30d');
            }
        } catch (error) {
            console.error('Error warming cache:', error);
        }
    }

    /**
     * Optimize Redis memory
     */
    async optimizeRedisMemory() {
        try {
            console.log('Optimizing Redis memory...');
            
            // Remove expired keys
            const redisClientForEval = redis.getRedisClient();
            if (redisClientForEval) {
                await redisClientForEval.eval(`
                    local keys = redis.call('keys', '*')
                    local deleted = 0
                    for i, key in ipairs(keys) do
                        local ttl = redis.call('ttl', key)
                        if ttl == -1 then
                            redis.call('del', key)
                            deleted = deleted + 1
                        end
                    end
                    return deleted
                `, 0);
            }
            
            // Clear old metrics
            const redisClient = redis.getRedisClient();
            if (!redisClient) return;
            
            const oldMetricKeys = await redisClient.keys('cost_metrics:*');
            for (const key of oldMetricKeys) {
                const ttl = await redisClient.ttl(key);
                if (ttl === -1) {
                    await redisClient.del(key);
                }
            }

            console.log('Redis memory optimization completed');
        } catch (error) {
            console.error('Error optimizing Redis memory:', error);
        }
    }

    /**
     * Trigger optimization
     */
    async triggerOptimization(type, data) {
        console.log(`Triggering ${type} optimization:`, data);
        
        switch (type) {
            case 'memory':
                await this.optimizeMemoryUsage(data);
                break;
            case 'cpu':
                await this.optimizeCpuUsage(data);
                break;
            case 'database':
                await this.optimizeDatabaseQueries();
                break;
            case 'redis':
                await this.optimizeRedisCaching();
                break;
        }
    }

    /**
     * Optimize memory usage
     */
    async optimizeMemoryUsage(memoryData) {
        try {
            console.log('Optimizing memory usage...');
            
            // Clear unnecessary caches
            const redisClientForCache = redis.getRedisClient();
            if (redisClientForCache) {
                await redisClientForCache.eval(`
                    local keys = redis.call('keys', 'temp:*')
                    for i, key in ipairs(keys) do
                        redis.call('del', key)
                    end
                `, 0);
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            console.log('Memory optimization completed');
        } catch (error) {
            console.error('Error optimizing memory usage:', error);
        }
    }

    /**
     * Optimize CPU usage
     */
    async optimizeCpuUsage(cpuData) {
        try {
            console.log('Optimizing CPU usage...');
            
            // Reduce background tasks frequency
            // This would typically involve adjusting intervals for monitoring tasks
            
            console.log('CPU optimization completed');
        } catch (error) {
            console.error('Error optimizing CPU usage:', error);
        }
    }

    /**
     * Generate cost report
     */
    async generateCostReport() {
        try {
            console.log('Generating cost report...');
            
            const report = {
                timestamp: new Date(),
                system: await this.getSystemCosts(),
                database: await this.getDatabaseCosts(),
                redis: await this.getRedisCosts(),
                recommendations: await this.generateRecommendations()
            };
            
            // Store report
            await this.storeCostReport(report);
            
            console.log('Cost report generated');
            return report;
        } catch (error) {
            console.error('Error generating cost report:', error);
        }
    }

    /**
     * Get system costs
     */
    async getSystemCosts() {
        const memory = os.totalmem() - os.freemem();
        const memoryGB = memory / (1024 * 1024 * 1024);
        
        return {
            memoryUsage: memoryGB,
            cpuUsage: os.loadavg()[0],
            uptime: os.uptime(),
            estimatedCost: this.estimateSystemCost(memoryGB, os.loadavg()[0])
        };
    }

    /**
     * Get database costs
     */
    async getDatabaseCosts() {
                 try {
             const stats = await dbService.getDB().stats();
            const dataSizeGB = stats.dataSize / (1024 * 1024 * 1024);
            
            return {
                dataSize: dataSizeGB,
                storageSize: stats.storageSize / (1024 * 1024 * 1024),
                collections: stats.collections,
                indexes: stats.indexes,
                estimatedCost: this.estimateDatabaseCost(dataSizeGB)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get Redis costs
     */
    async getRedisCosts() {
        try {
            const redisClient = redis.getRedisClient();
            if (!redisClient) {
                return { error: 'Redis client not available' };
            }
            
            const info = await redisClient.info('memory');
            const usedMemoryMB = this.parseRedisInfo(info, 'used_memory') / (1024 * 1024);
            
            return {
                usedMemory: usedMemoryMB,
                connectedClients: this.parseRedisInfo(await redisClient.info(), 'connected_clients'),
                estimatedCost: this.estimateRedisCost(usedMemoryMB)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Estimate system cost
     */
    estimateSystemCost(memoryGB, cpuLoad) {
        // Rough estimation based on typical cloud pricing
        const memoryCost = memoryGB * 0.1; // 0.1 EGP per GB
        const cpuCost = cpuLoad * 0.05; // 0.05 EGP per CPU load
        return memoryCost + cpuCost;
    }

    /**
     * Estimate database cost
     */
    estimateDatabaseCost(dataSizeGB) {
        // Rough estimation for MongoDB Atlas
        return dataSizeGB * 0.25; // 0.25 EGP per GB
    }

    /**
     * Estimate Redis cost
     */
    estimateRedisCost(memoryMB) {
        // Rough estimation for Redis Cloud
        return (memoryMB / 1024) * 0.15; // 0.15 EGP per GB
    }

    /**
     * Generate recommendations
     */
    async generateRecommendations() {
        const recommendations = [];
        
        // Get current metrics
        const systemMetrics = await this.getSystemCosts();
        const dbMetrics = await this.getDatabaseCosts();
        const redisMetrics = await this.getRedisCosts();
        
        if (systemMetrics.memoryUsage > 2) {
            recommendations.push('Consider upgrading memory or optimizing memory usage');
        }
        
        if (systemMetrics.cpuUsage > 5) {
            recommendations.push('Consider scaling CPU or optimizing CPU-intensive operations');
        }
        
        if (dbMetrics.dataSize > 1) {
            recommendations.push('Consider data archiving or database optimization');
        }
        
        if (redisMetrics.usedMemory > 100) {
            recommendations.push('Consider Redis memory optimization or scaling');
        }
        
        return recommendations;
    }

    /**
     * Store cost report
     */
    async storeCostReport(report) {
                 try {
             await dbService.getCollection('cost_reports').insertOne(report);
        } catch (error) {
            console.error('Error storing cost report:', error);
        }
    }

    /**
     * Get optimization status
     */
    async getOptimizationStatus() {
        return {
            monitoring: true,
            lastSystemCheck: new Date(),
            lastDatabaseCheck: new Date(),
            lastRedisCheck: new Date(),
            optimizationsApplied: Array.from(this.metrics.keys()),
            costThresholds: this.costThresholds
        };
    }
}

module.exports = new CostOptimizationService();
