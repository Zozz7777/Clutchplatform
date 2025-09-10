// Endpoint Tester for Clutch Backend Integration
const apiManager = require('./api');
const backendConfig = require('./backend-config');

class EndpointTester {
    constructor() {
        this.testResults = {};
        this.testQueue = [];
        this.isRunning = false;
        
        this.endpointTests = [
            // Authentication endpoints
            {
                name: 'auth.verify',
                category: 'auth',
                action: 'verify',
                method: 'GET',
                required: true,
                description: 'Verify authentication token'
            },
            {
                name: 'auth.refresh',
                category: 'auth',
                action: 'refresh',
                method: 'POST',
                required: true,
                description: 'Refresh authentication token',
                data: { refresh_token: 'test_token' }
            },
            
            // Shop management endpoints
            {
                name: 'shop.profile',
                category: 'shop',
                action: 'profile',
                method: 'GET',
                required: true,
                description: 'Get shop profile information'
            },
            {
                name: 'shop.stats',
                category: 'shop',
                action: 'stats',
                method: 'GET',
                required: false,
                description: 'Get shop statistics'
            },
            
            // Inventory endpoints
            {
                name: 'inventory.list',
                category: 'inventory',
                action: 'list',
                method: 'GET',
                required: true,
                description: 'List inventory items'
            },
            {
                name: 'inventory.create',
                category: 'inventory',
                action: 'create',
                method: 'POST',
                required: true,
                description: 'Create new inventory item',
                data: {
                    name: 'Test Item',
                    sku: 'TEST-001',
                    price: 100,
                    stock: 10
                }
            },
            {
                name: 'inventory.recommendations',
                category: 'inventory',
                action: 'recommendations',
                method: 'GET',
                required: false,
                description: 'Get inventory recommendations'
            },
            {
                name: 'inventory.alerts',
                category: 'inventory',
                action: 'alerts',
                method: 'GET',
                required: false,
                description: 'Get inventory alerts'
            },
            
            // Sales endpoints
            {
                name: 'sales.list',
                category: 'sales',
                action: 'list',
                method: 'GET',
                required: true,
                description: 'List sales transactions'
            },
            {
                name: 'sales.create',
                category: 'sales',
                action: 'create',
                method: 'POST',
                required: true,
                description: 'Create new sale',
                data: {
                    items: [{ id: 1, quantity: 1, price: 100 }],
                    total: 100,
                    payment_method: 'cash'
                }
            },
            {
                name: 'sales.analytics',
                category: 'sales',
                action: 'analytics',
                method: 'GET',
                required: false,
                description: 'Get sales analytics'
            },
            
            // Customer endpoints
            {
                name: 'customers.list',
                category: 'customers',
                action: 'list',
                method: 'GET',
                required: true,
                description: 'List customers'
            },
            {
                name: 'customers.create',
                category: 'customers',
                action: 'create',
                method: 'POST',
                required: true,
                description: 'Create new customer',
                data: {
                    name: 'Test Customer',
                    phone: '01234567890',
                    email: 'test@example.com'
                }
            },
            {
                name: 'customers.analytics',
                category: 'customers',
                action: 'analytics',
                method: 'GET',
                required: false,
                description: 'Get customer analytics'
            },
            
            // Supplier endpoints
            {
                name: 'suppliers.list',
                category: 'suppliers',
                action: 'list',
                method: 'GET',
                required: true,
                description: 'List suppliers'
            },
            {
                name: 'suppliers.create',
                category: 'suppliers',
                action: 'create',
                method: 'POST',
                required: true,
                description: 'Create new supplier',
                data: {
                    name: 'Test Supplier',
                    contact_person: 'John Doe',
                    phone: '01234567890',
                    email: 'supplier@example.com'
                }
            },
            
            // AI endpoints
            {
                name: 'ai.demandForecast',
                category: 'ai',
                action: 'demandForecast',
                method: 'GET',
                required: false,
                description: 'Get demand forecast',
                params: { item_id: 1, period: '30d' }
            },
            {
                name: 'ai.priceOptimization',
                category: 'ai',
                action: 'priceOptimization',
                method: 'GET',
                required: false,
                description: 'Get price optimization',
                params: { item_id: 1 }
            },
            {
                name: 'ai.inventoryOptimization',
                category: 'ai',
                action: 'inventoryOptimization',
                method: 'GET',
                required: false,
                description: 'Get inventory optimization'
            },
            {
                name: 'ai.customerInsights',
                category: 'ai',
                action: 'customerInsights',
                method: 'GET',
                required: false,
                description: 'Get customer insights'
            },
            {
                name: 'ai.marketAnalysis',
                category: 'ai',
                action: 'marketAnalysis',
                method: 'GET',
                required: false,
                description: 'Get market analysis'
            },
            
            // Order endpoints
            {
                name: 'orders.list',
                category: 'orders',
                action: 'list',
                method: 'GET',
                required: true,
                description: 'List orders'
            },
            {
                name: 'orders.get',
                category: 'orders',
                action: 'get',
                method: 'GET',
                required: true,
                description: 'Get order details',
                params: { id: 1 }
            },
            
            // Market intelligence endpoints
            {
                name: 'market.insights',
                category: 'market',
                action: 'insights',
                method: 'GET',
                required: false,
                description: 'Get market insights'
            },
            {
                name: 'market.trends',
                category: 'market',
                action: 'trends',
                method: 'GET',
                required: false,
                description: 'Get market trends'
            },
            {
                name: 'market.topSelling',
                category: 'market',
                action: 'topSelling',
                method: 'GET',
                required: false,
                description: 'Get top selling items'
            },
            {
                name: 'market.popularCars',
                category: 'market',
                action: 'popularCars',
                method: 'GET',
                required: false,
                description: 'Get popular car models'
            },
            
            // System endpoints
            {
                name: 'system.health',
                category: 'system',
                action: 'health',
                method: 'GET',
                required: true,
                description: 'System health check'
            },
            {
                name: 'system.ping',
                category: 'system',
                action: 'ping',
                method: 'GET',
                required: true,
                description: 'System ping'
            },
            {
                name: 'system.time',
                category: 'system',
                action: 'time',
                method: 'GET',
                required: false,
                description: 'Get server time'
            },
            {
                name: 'system.version',
                category: 'system',
                action: 'version',
                method: 'GET',
                required: false,
                description: 'Get system version'
            }
        ];
    }
    
    async runAllTests() {
        console.log('Starting comprehensive endpoint testing...');
        this.isRunning = true;
        this.testResults = {};
        
        const startTime = Date.now();
        
        try {
            // Test endpoints in batches to avoid overwhelming the server
            const batches = this.createBatches(this.endpointTests, 5);
            
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`Testing batch ${i + 1}/${batches.length} (${batch.length} endpoints)`);
                
                const batchPromises = batch.map(test => this.runSingleTest(test));
                const batchResults = await Promise.allSettled(batchPromises);
                
                batchResults.forEach((result, index) => {
                    const test = batch[index];
                    this.testResults[test.name] = result.status === 'fulfilled' ? 
                        result.value : { success: false, error: result.reason.message };
                });
                
                // Small delay between batches
                if (i < batches.length - 1) {
                    await this.delay(1000);
                }
            }
            
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            console.log(`Endpoint testing completed in ${totalTime}ms`);
            this.generateTestReport(totalTime);
            
        } catch (error) {
            console.error('Error during endpoint testing:', error);
        } finally {
            this.isRunning = false;
        }
        
        return this.testResults;
    }
    
    createBatches(tests, batchSize) {
        const batches = [];
        for (let i = 0; i < tests.length; i += batchSize) {
            batches.push(tests.slice(i, i + batchSize));
        }
        return batches;
    }
    
    async runSingleTest(test) {
        const startTime = Date.now();
        
        try {
            let endpoint = backendConfig.getEndpoint(test.category, test.action);
            
            // Add query parameters if specified
            if (test.params) {
                const params = new URLSearchParams(test.params);
                endpoint += `?${params.toString()}`;
            }
            
            let response;
            switch (test.method.toUpperCase()) {
                case 'GET':
                    response = await apiManager.makeRequest('GET', endpoint);
                    break;
                case 'POST':
                    response = await apiManager.makeRequest('POST', endpoint, test.data || {});
                    break;
                case 'PUT':
                    response = await apiManager.makeRequest('PUT', endpoint, test.data || {});
                    break;
                case 'DELETE':
                    response = await apiManager.makeRequest('DELETE', endpoint);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${test.method}`);
            }
            
            const responseTime = Date.now() - startTime;
            
            return {
                success: true,
                responseTime,
                status: 200,
                data: response,
                description: test.description,
                required: test.required
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            return {
                success: false,
                responseTime,
                status: error.response?.status || 0,
                error: error.message,
                description: test.description,
                required: test.required
            };
        }
    }
    
    generateTestReport(totalTime) {
        const totalTests = this.endpointTests.length;
        const successfulTests = Object.values(this.testResults).filter(result => result.success).length;
        const failedTests = totalTests - successfulTests;
        const requiredTests = this.endpointTests.filter(test => test.required).length;
        const successfulRequiredTests = this.endpointTests
            .filter(test => test.required)
            .filter(test => this.testResults[test.name]?.success).length;
        
        const report = {
            summary: {
                totalTests,
                successfulTests,
                failedTests,
                successRate: (successfulTests / totalTests) * 100,
                requiredTests,
                successfulRequiredTests,
                requiredSuccessRate: (successfulRequiredTests / requiredTests) * 100,
                totalTime
            },
            results: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        console.log('=== ENDPOINT TEST REPORT ===');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Successful: ${successfulTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`);
        console.log(`Required Tests Success Rate: ${report.summary.requiredSuccessRate.toFixed(2)}%`);
        console.log(`Total Time: ${totalTime}ms`);
        
        // Log failed tests
        const failedTestNames = Object.entries(this.testResults)
            .filter(([name, result]) => !result.success)
            .map(([name, result]) => `${name}: ${result.error}`);
        
        if (failedTestNames.length > 0) {
            console.log('\nFailed Tests:');
            failedTestNames.forEach(name => console.log(`  - ${name}`));
        }
        
        // Log recommendations
        if (report.recommendations.length > 0) {
            console.log('\nRecommendations:');
            report.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
        
        return report;
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        // Check for critical failures
        const criticalFailures = this.endpointTests
            .filter(test => test.required)
            .filter(test => !this.testResults[test.name]?.success);
        
        if (criticalFailures.length > 0) {
            recommendations.push(`Critical endpoints are failing: ${criticalFailures.map(t => t.name).join(', ')}`);
        }
        
        // Check for slow responses
        const slowEndpoints = Object.entries(this.testResults)
            .filter(([name, result]) => result.success && result.responseTime > 5000)
            .map(([name, result]) => `${name} (${result.responseTime}ms)`);
        
        if (slowEndpoints.length > 0) {
            recommendations.push(`Slow endpoints detected: ${slowEndpoints.join(', ')}`);
        }
        
        // Check for authentication issues
        const authFailures = Object.entries(this.testResults)
            .filter(([name, result]) => !result.success && result.status === 401)
            .map(([name]) => name);
        
        if (authFailures.length > 0) {
            recommendations.push(`Authentication issues detected: ${authFailures.join(', ')}`);
        }
        
        // Check for server errors
        const serverErrors = Object.entries(this.testResults)
            .filter(([name, result]) => !result.success && result.status >= 500)
            .map(([name]) => name);
        
        if (serverErrors.length > 0) {
            recommendations.push(`Server errors detected: ${serverErrors.join(', ')}`);
        }
        
        return recommendations;
    }
    
    async testSpecificEndpoint(category, action) {
        const test = this.endpointTests.find(t => t.category === category && t.action === action);
        if (!test) {
            throw new Error(`Test not found for ${category}.${action}`);
        }
        
        return await this.runSingleTest(test);
    }
    
    async testEndpointGroup(category) {
        const groupTests = this.endpointTests.filter(t => t.category === category);
        if (groupTests.length === 0) {
            throw new Error(`No tests found for category: ${category}`);
        }
        
        console.log(`Testing ${category} endpoints...`);
        const results = {};
        
        for (const test of groupTests) {
            results[test.name] = await this.runSingleTest(test);
        }
        
        return results;
    }
    
    getTestResults() {
        return this.testResults;
    }
    
    isTestRunning() {
        return this.isRunning;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
const endpointTester = new EndpointTester();
module.exports = endpointTester;
