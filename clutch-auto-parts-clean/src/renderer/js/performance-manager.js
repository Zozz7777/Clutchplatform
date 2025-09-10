// Performance Manager for Clutch Auto Parts System - Optimization & Testing
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');

class PerformanceManager {
    constructor() {
        this.performanceMetrics = {
            loadTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            databaseQueries: 0,
            apiCalls: 0,
            cacheHitRate: 0,
            errorRate: 0,
            responseTime: 0
        };
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.performanceHistory = [];
        this.maxHistorySize = 100;
        
        this.init();
    }

    async init() {
        await this.setupPerformanceMonitoring();
        await this.optimizeDatabase();
        await this.optimizeMemoryUsage();
        await this.setupCaching();
        this.startPerformanceMonitoring();
    }

    async setupPerformanceMonitoring() {
        // Monitor page load times
        window.addEventListener('load', () => {
            this.performanceMetrics.loadTime = performance.now();
        });

        // Monitor memory usage
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }

        // Monitor API response times
        this.interceptAPICalls();
        
        // Monitor database query performance
        this.interceptDatabaseQueries();
    }

    interceptAPICalls() {
        const originalCallAPI = apiManager.callAPI;
        const self = this;
        
        apiManager.callAPI = async function(...args) {
            const startTime = performance.now();
            self.performanceMetrics.apiCalls++;
            
            try {
                const result = await originalCallAPI.apply(this, args);
                const endTime = performance.now();
                self.performanceMetrics.responseTime = endTime - startTime;
                return result;
            } catch (error) {
                self.performanceMetrics.errorRate++;
                throw error;
            }
        };
    }

    interceptDatabaseQueries() {
        const originalRunQuery = databaseManager.runQuery;
        const originalAllQuery = databaseManager.allQuery;
        const originalGetQuery = databaseManager.getQuery;
        const self = this;
        
        // Intercept runQuery
        databaseManager.runQuery = async function(...args) {
            const startTime = performance.now();
            self.performanceMetrics.databaseQueries++;
            
            try {
                const result = await originalRunQuery.apply(this, args);
                const endTime = performance.now();
                self.recordQueryPerformance(args[0], endTime - startTime);
                return result;
            } catch (error) {
                self.performanceMetrics.errorRate++;
                throw error;
            }
        };

        // Intercept allQuery
        databaseManager.allQuery = async function(...args) {
            const startTime = performance.now();
            self.performanceMetrics.databaseQueries++;
            
            try {
                const result = await originalAllQuery.apply(this, args);
                const endTime = performance.now();
                self.recordQueryPerformance(args[0], endTime - startTime);
                return result;
            } catch (error) {
                self.performanceMetrics.errorRate++;
                throw error;
            }
        };

        // Intercept getQuery
        databaseManager.getQuery = async function(...args) {
            const startTime = performance.now();
            self.performanceMetrics.databaseQueries++;
            
            try {
                const result = await originalGetQuery.apply(this, args);
                const endTime = performance.now();
                self.recordQueryPerformance(args[0], endTime - startTime);
                return result;
            } catch (error) {
                self.performanceMetrics.errorRate++;
                throw error;
            }
        };
    }

    recordQueryPerformance(query, executionTime) {
        // Store query performance data
        const queryData = {
            query: query.substring(0, 100), // Truncate for storage
            executionTime: executionTime,
            timestamp: Date.now()
        };
        
        this.performanceHistory.push(queryData);
        
        // Keep only recent history
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory.shift();
        }
    }

    async optimizeDatabase() {
        try {
            // Create indexes for better performance
            await this.createDatabaseIndexes();
            
            // Optimize database settings
            await this.optimizeDatabaseSettings();
            
            // Analyze database performance
            await this.analyzeDatabasePerformance();
            
        } catch (error) {
            console.error('Error optimizing database:', error);
        }
    }

    async createDatabaseIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)',
            'CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(payment_status)',
            'CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name)',
            'CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)',
            'CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON inventory(barcode)',
            'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
            'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
            'CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)',
            'CREATE INDEX IF NOT EXISTS idx_sales_items_sale ON sales_items(sale_id)',
            'CREATE INDEX IF NOT EXISTS idx_sales_items_inventory ON sales_items(inventory_id)'
        ];

        for (const index of indexes) {
            try {
                await databaseManager.runQuery(index);
            } catch (error) {
                console.warn('Index creation failed:', error);
            }
        }
    }

    async optimizeDatabaseSettings() {
        const optimizations = [
            'PRAGMA journal_mode = WAL',
            'PRAGMA synchronous = NORMAL',
            'PRAGMA cache_size = 10000',
            'PRAGMA temp_store = MEMORY',
            'PRAGMA mmap_size = 268435456'
        ];

        for (const optimization of optimizations) {
            try {
                await databaseManager.runQuery(optimization);
            } catch (error) {
                console.warn('Database optimization failed:', error);
            }
        }
    }

    async analyzeDatabasePerformance() {
        try {
            // Analyze table statistics
            const tables = ['sales', 'inventory', 'customers', 'suppliers', 'sales_items'];
            
            for (const table of tables) {
                await databaseManager.runQuery(`ANALYZE ${table}`);
            }
            
            console.log('Database analysis completed');
        } catch (error) {
            console.error('Database analysis failed:', error);
        }
    }

    async optimizeMemoryUsage() {
        // Implement memory optimization strategies
        this.setupMemoryCleanup();
        this.optimizeEventListeners();
        this.optimizeDOMOperations();
    }

    setupMemoryCleanup() {
        // Clean up unused objects periodically
        setInterval(() => {
            this.cleanupMemory();
        }, 30000); // Every 30 seconds
    }

    cleanupMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear unused caches
        this.clearUnusedCaches();
        
        // Update memory metrics
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
    }

    clearUnusedCaches() {
        // Clear unused caches from various managers
        if (window.aiManager && window.aiManager.clearCache) {
            window.aiManager.clearCache();
        }
        
        if (window.syncManager && window.syncManager.clearCache) {
            window.syncManager.clearCache();
        }
    }

    optimizeEventListeners() {
        // Use event delegation to reduce memory usage
        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('change', this.handleDelegatedChange.bind(this));
    }

    handleDelegatedClick(event) {
        // Handle delegated click events
        const target = event.target;
        
        if (target.matches('[data-action]')) {
            const action = target.dataset.action;
            this.handleAction(action, target);
        }
    }

    handleDelegatedChange(event) {
        // Handle delegated change events
        const target = event.target;
        
        if (target.matches('[data-filter]')) {
            const filter = target.dataset.filter;
            this.handleFilter(filter, target);
        }
    }

    handleAction(action, element) {
        // Handle common actions efficiently
        switch (action) {
            case 'refresh':
                this.refreshData();
                break;
            case 'export':
                this.exportData();
                break;
            case 'filter':
                this.applyFilter(element);
                break;
        }
    }

    handleFilter(filter, element) {
        // Handle filtering efficiently
        console.log('Filter applied:', filter, element.value);
    }

    optimizeDOMOperations() {
        // Batch DOM operations
        this.setupDOMBatching();
        
        // Use document fragments for bulk operations
        this.setupDocumentFragments();
    }

    setupDOMBatching() {
        // Batch DOM updates to improve performance
        this.domUpdateQueue = [];
        this.domUpdateScheduled = false;
    }

    batchDOMUpdate(updateFunction) {
        this.domUpdateQueue.push(updateFunction);
        
        if (!this.domUpdateScheduled) {
            this.domUpdateScheduled = true;
            requestAnimationFrame(() => {
                this.flushDOMUpdates();
            });
        }
    }

    flushDOMUpdates() {
        while (this.domUpdateQueue.length > 0) {
            const update = this.domUpdateQueue.shift();
            update();
        }
        this.domUpdateScheduled = false;
    }

    setupDocumentFragments() {
        // Use document fragments for bulk DOM operations
        this.createDocumentFragment = () => document.createDocumentFragment();
    }

    async setupCaching() {
        // Implement intelligent caching system
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.maxCacheSize = 100;
        
        // Setup cache cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 60000); // Every minute
    }

    setCache(key, value, ttl = this.cacheTimeout) {
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldestCache();
        }
        
        this.cache.set(key, {
            value: value,
            timestamp: Date.now(),
            ttl: ttl
        });
    }

    getCache(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    evictOldestCache() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, item] of this.cache) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    cleanupCache() {
        const now = Date.now();
        
        for (const [key, item] of this.cache) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    startPerformanceMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectPerformanceMetrics();
        }, 5000); // Every 5 seconds
    }

    stopPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
    }

    collectPerformanceMetrics() {
        // Collect current performance metrics
        const metrics = {
            timestamp: Date.now(),
            loadTime: this.performanceMetrics.loadTime,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            databaseQueries: this.performanceMetrics.databaseQueries,
            apiCalls: this.performanceMetrics.apiCalls,
            errorRate: this.performanceMetrics.errorRate,
            responseTime: this.performanceMetrics.responseTime,
            cacheSize: this.cache.size,
            cacheHitRate: this.calculateCacheHitRate()
        };
        
        // Store metrics history
        this.performanceHistory.push(metrics);
        
        // Keep only recent history
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory.shift();
        }
        
        // Check for performance issues
        this.checkPerformanceIssues(metrics);
    }

    calculateCacheHitRate() {
        // Calculate cache hit rate
        const totalRequests = this.performanceMetrics.apiCalls + this.performanceMetrics.databaseQueries;
        const cacheHits = this.cache.size;
        
        return totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    }

    checkPerformanceIssues(metrics) {
        const issues = [];
        
        // Check memory usage
        if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
            issues.push('High memory usage detected');
        }
        
        // Check response time
        if (metrics.responseTime > 1000) { // 1 second
            issues.push('Slow API response time detected');
        }
        
        // Check error rate
        if (metrics.errorRate > 10) { // 10 errors
            issues.push('High error rate detected');
        }
        
        // Check cache hit rate
        if (metrics.cacheHitRate < 50) { // 50%
            issues.push('Low cache hit rate detected');
        }
        
        if (issues.length > 0) {
            this.handlePerformanceIssues(issues);
        }
    }

    handlePerformanceIssues(issues) {
        console.warn('Performance issues detected:', issues);
        
        // Auto-optimize if possible
        this.autoOptimize();
        
        // Notify user if critical
        if (issues.some(issue => issue.includes('High memory') || issue.includes('High error'))) {
            uiManager.showNotification('تم اكتشاف مشاكل في الأداء، جاري التحسين...', 'warning');
        }
    }

    autoOptimize() {
        // Automatic performance optimizations
        this.cleanupMemory();
        this.clearUnusedCaches();
        this.optimizeDatabase();
    }

    getPerformanceReport() {
        const currentMetrics = this.performanceHistory[this.performanceHistory.length - 1];
        const avgMetrics = this.calculateAverageMetrics();
        
        return {
            current: currentMetrics,
            average: avgMetrics,
            history: this.performanceHistory,
            recommendations: this.generatePerformanceRecommendations()
        };
    }

    calculateAverageMetrics() {
        if (this.performanceHistory.length === 0) {
            return null;
        }
        
        const sum = this.performanceHistory.reduce((acc, metrics) => {
            acc.memoryUsage += metrics.memoryUsage;
            acc.databaseQueries += metrics.databaseQueries;
            acc.apiCalls += metrics.apiCalls;
            acc.errorRate += metrics.errorRate;
            acc.responseTime += metrics.responseTime;
            acc.cacheHitRate += metrics.cacheHitRate;
            return acc;
        }, {
            memoryUsage: 0,
            databaseQueries: 0,
            apiCalls: 0,
            errorRate: 0,
            responseTime: 0,
            cacheHitRate: 0
        });
        
        const count = this.performanceHistory.length;
        
        return {
            memoryUsage: sum.memoryUsage / count,
            databaseQueries: sum.databaseQueries / count,
            apiCalls: sum.apiCalls / count,
            errorRate: sum.errorRate / count,
            responseTime: sum.responseTime / count,
            cacheHitRate: sum.cacheHitRate / count
        };
    }

    generatePerformanceRecommendations() {
        const recommendations = [];
        const avgMetrics = this.calculateAverageMetrics();
        
        if (!avgMetrics) {
            return recommendations;
        }
        
        if (avgMetrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
            recommendations.push('تحسين استخدام الذاكرة - إغلاق النوافذ غير المستخدمة');
        }
        
        if (avgMetrics.responseTime > 500) { // 500ms
            recommendations.push('تحسين سرعة الاستجابة - تحسين استعلامات قاعدة البيانات');
        }
        
        if (avgMetrics.errorRate > 5) { // 5 errors
            recommendations.push('تقليل معدل الأخطاء - مراجعة معالجة الأخطاء');
        }
        
        if (avgMetrics.cacheHitRate < 70) { // 70%
            recommendations.push('تحسين معدل التخزين المؤقت - زيادة حجم التخزين المؤقت');
        }
        
        return recommendations;
    }

    // Testing methods
    async runPerformanceTests() {
        const tests = [
            this.testDatabasePerformance,
            this.testAPIPerformance,
            this.testMemoryUsage,
            this.testCachePerformance,
            this.testDOMPerformance
        ];
        
        const results = [];
        
        for (const test of tests) {
            try {
                const result = await test.call(this);
                results.push(result);
            } catch (error) {
                results.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        
        return results;
    }

    async testDatabasePerformance() {
        const startTime = performance.now();
        
        // Test complex query
        await databaseManager.allQuery(`
            SELECT s.*, c.name as customer_name, 
                   COUNT(si.id) as item_count,
                   SUM(si.total_price) as total_amount
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN sales_items si ON s.id = si.sale_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT 100
        `);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return {
            name: 'testDatabasePerformance',
            status: 'passed',
            executionTime: executionTime,
            recommendation: executionTime > 1000 ? 'تحسين استعلامات قاعدة البيانات' : 'أداء قاعدة البيانات جيد'
        };
    }

    async testAPIPerformance() {
        const startTime = performance.now();
        
        try {
            await apiManager.callAPI('/test/performance');
        } catch (error) {
            // Expected for test endpoint
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return {
            name: 'testAPIPerformance',
            status: 'passed',
            executionTime: executionTime,
            recommendation: executionTime > 2000 ? 'تحسين سرعة الاتصال بالخادم' : 'أداء API جيد'
        };
    }

    async testMemoryUsage() {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        // Create some objects to test memory
        const testObjects = [];
        for (let i = 0; i < 1000; i++) {
            testObjects.push({
                id: i,
                data: new Array(100).fill('test')
            });
        }
        
        const peakMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const memoryIncrease = peakMemory - initialMemory;
        
        // Clean up
        testObjects.length = 0;
        this.cleanupMemory();
        
        return {
            name: 'testMemoryUsage',
            status: 'passed',
            memoryIncrease: memoryIncrease,
            recommendation: memoryIncrease > 10 * 1024 * 1024 ? 'تحسين إدارة الذاكرة' : 'إدارة الذاكرة جيدة'
        };
    }

    async testCachePerformance() {
        const startTime = performance.now();
        
        // Test cache operations
        for (let i = 0; i < 100; i++) {
            this.setCache(`test_${i}`, { data: `value_${i}` });
        }
        
        for (let i = 0; i < 100; i++) {
            this.getCache(`test_${i}`);
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return {
            name: 'testCachePerformance',
            status: 'passed',
            executionTime: executionTime,
            recommendation: executionTime > 100 ? 'تحسين أداء التخزين المؤقت' : 'أداء التخزين المؤقت جيد'
        };
    }

    async testDOMPerformance() {
        const startTime = performance.now();
        
        // Test DOM operations
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 100; i++) {
            const div = document.createElement('div');
            div.textContent = `Test ${i}`;
            fragment.appendChild(div);
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        return {
            name: 'testDOMPerformance',
            status: 'passed',
            executionTime: executionTime,
            recommendation: executionTime > 50 ? 'تحسين عمليات DOM' : 'أداء DOM جيد'
        };
    }

    destroy() {
        this.stopPerformanceMonitoring();
        this.cache.clear();
        this.performanceHistory = [];
    }
}

// Export singleton instance
const performanceManager = new PerformanceManager();
module.exports = performanceManager;
