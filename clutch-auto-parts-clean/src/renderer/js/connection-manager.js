// Connection Manager for Clutch Backend Integration
// apiManager is loaded as a script and available globally
// websocketManager, backendConfig, and syncManager are loaded as scripts and available globally

class ConnectionManager {
    constructor() {
        this.connectionStatus = {
            api: { connected: false, lastCheck: null, errors: [] },
            websocket: { connected: false, lastCheck: null, errors: [] },
            endpoints: {},
            overall: false
        };
        
        this.healthCheckInterval = null;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 5;
        this.retryDelay = 5000; // 5 seconds
        
        this.endpointTests = [
            // Authentication endpoints
            { category: 'auth', action: 'verify', method: 'GET', required: true },
            
            // Shop management endpoints
            { category: 'shop', action: 'profile', method: 'GET', required: true },
            { category: 'shop', action: 'stats', method: 'GET', required: false },
            
            // Inventory endpoints
            { category: 'inventory', action: 'list', method: 'GET', required: true },
            { category: 'inventory', action: 'recommendations', method: 'GET', required: false },
            { category: 'inventory', action: 'alerts', method: 'GET', required: false },
            
            // Sales endpoints
            { category: 'sales', action: 'list', method: 'GET', required: true },
            { category: 'sales', action: 'analytics', method: 'GET', required: false },
            
            // Customer endpoints
            { category: 'customers', action: 'list', method: 'GET', required: true },
            { category: 'customers', action: 'analytics', method: 'GET', required: false },
            
            // Supplier endpoints
            { category: 'suppliers', action: 'list', method: 'GET', required: true },
            
            // AI endpoints
            { category: 'ai', action: 'demandForecast', method: 'GET', required: false },
            { category: 'ai', action: 'priceOptimization', method: 'GET', required: false },
            { category: 'ai', action: 'inventoryOptimization', method: 'GET', required: false },
            { category: 'ai', action: 'customerInsights', method: 'GET', required: false },
            { category: 'ai', action: 'marketAnalysis', method: 'GET', required: false },
            
            // Order endpoints
            { category: 'orders', action: 'list', method: 'GET', required: true },
            
            // Market intelligence endpoints
            { category: 'market', action: 'insights', method: 'GET', required: false },
            { category: 'market', action: 'trends', method: 'GET', required: false },
            { category: 'market', action: 'topSelling', method: 'GET', required: false },
            { category: 'market', action: 'popularCars', method: 'GET', required: false },
            
            // System endpoints
            { category: 'system', action: 'health', method: 'GET', required: true },
            { category: 'system', action: 'ping', method: 'GET', required: true },
            { category: 'system', action: 'time', method: 'GET', required: false },
            { category: 'system', action: 'version', method: 'GET', required: false }
        ];
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing Connection Manager...');
            
            // Initialize backend configuration
            await backendConfig.initialize();
            
            // Test all connections
            await this.testAllConnections();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            console.log('Connection Manager initialized successfully');
            
        } catch (error) {
            console.error('Connection Manager initialization failed:', error);
            this.scheduleRetry();
        }
    }
    
    // Test all connections
    async testAllConnections() {
        console.log('Testing all backend connections...');
        
        const results = {
            api: await this.testAPIConnection(),
            websocket: await this.testWebSocketConnection(),
            endpoints: await this.testAllEndpoints()
        };
        
        this.updateConnectionStatus(results);
        this.updateOverallStatus();
        
        return results;
    }
    
    // Test API connection
    async testAPIConnection() {
        try {
            console.log('Testing API connection...');
            
            // Check if we're in demo mode
            if (window.apiManager && window.apiManager.isDemoMode) {
                console.log('API connection test skipped in demo mode');
                this.connectionStatus.api = {
                    connected: true,
                    lastCheck: new Date(),
                    errors: []
                };
                return true;
            }
            
            const response = await window.apiManager.testConnection();
            
            this.connectionStatus.api = {
                connected: response,
                lastCheck: new Date(),
                errors: []
            };
            
            console.log(`API connection: ${response ? 'SUCCESS' : 'FAILED'}`);
            return response;
            
        } catch (error) {
            console.error('API connection test failed:', error);
            
            this.connectionStatus.api = {
                connected: false,
                lastCheck: new Date(),
                errors: [error.message]
            };
            
            return false;
        }
    }
    
    // Test WebSocket connection
    async testWebSocketConnection() {
        try {
            console.log('Testing WebSocket connection...');
            
            // Check if we're in demo mode
            if (window.apiManager && window.apiManager.isDemoMode) {
                console.log('WebSocket connection test skipped in demo mode');
                this.connectionStatus.websocket = {
                    connected: true,
                    lastCheck: new Date(),
                    errors: []
                };
                return true;
            }
            
            const status = websocketManager.getConnectionStatus();
            
            this.connectionStatus.websocket = {
                connected: status.isConnected,
                lastCheck: new Date(),
                errors: status.isConnected ? [] : ['WebSocket not connected']
            };
            
            console.log(`WebSocket connection: ${status.isConnected ? 'SUCCESS' : 'FAILED'}`);
            return status.isConnected;
            
        } catch (error) {
            console.error('WebSocket connection test failed:', error);
            
            this.connectionStatus.websocket = {
                connected: false,
                lastCheck: new Date(),
                errors: [error.message]
            };
            
            return false;
        }
    }
    
    // Test all endpoints
    async testAllEndpoints() {
        console.log('Testing all API endpoints...');
        
        const results = {};
        const testPromises = this.endpointTests.map(async (test) => {
            const endpointKey = `${test.category}.${test.action}`;
            
            try {
                const endpoint = backendConfig.getEndpoint(test.category, test.action);
                const response = await this.testEndpoint(endpoint, test.method);
                
                results[endpointKey] = {
                    connected: true,
                    lastCheck: new Date(),
                    errors: [],
                    responseTime: response.responseTime,
                    status: response.status
                };
                
                console.log(`✓ ${endpointKey}: SUCCESS (${response.responseTime}ms)`);
                
            } catch (error) {
                results[endpointKey] = {
                    connected: false,
                    lastCheck: new Date(),
                    errors: [error.message],
                    responseTime: null,
                    status: null
                };
                
                const status = test.required ? 'FAILED' : 'OPTIONAL';
                console.log(`✗ ${endpointKey}: ${status} - ${error.message}`);
            }
        });
        
        await Promise.all(testPromises);
        
        this.connectionStatus.endpoints = results;
        return results;
    }
    
    // Test individual endpoint
    async testEndpoint(endpoint, method = 'GET') {
        const startTime = Date.now();
        
        try {
            let response;
            
            switch (method.toUpperCase()) {
                case 'GET':
                    response = await apiManager.makeRequest('GET', endpoint);
                    break;
                case 'POST':
                    response = await apiManager.makeRequest('POST', endpoint, { test: true });
                    break;
                case 'PUT':
                    response = await apiManager.makeRequest('PUT', endpoint, { test: true });
                    break;
                case 'DELETE':
                    response = await apiManager.makeRequest('DELETE', endpoint);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }
            
            const responseTime = Date.now() - startTime;
            
            return {
                status: 200,
                responseTime,
                data: response
            };
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            if (error.response) {
                return {
                    status: error.response.status,
                    responseTime,
                    error: error.response.data
                };
            } else {
                throw error;
            }
        }
    }
    
    // Update connection status
    updateConnectionStatus(results) {
        if (results.api !== undefined) {
            this.connectionStatus.api = results.api;
        }
        
        if (results.websocket !== undefined) {
            this.connectionStatus.websocket = results.websocket;
        }
        
        if (results.endpoints) {
            this.connectionStatus.endpoints = results.endpoints;
        }
    }
    
    // Update overall connection status
    updateOverallStatus() {
        const requiredEndpoints = this.endpointTests.filter(test => test.required);
        const requiredEndpointKeys = requiredEndpoints.map(test => `${test.category}.${test.action}`);
        
        const apiConnected = this.connectionStatus.api.connected;
        const websocketConnected = this.connectionStatus.websocket.connected;
        
        const requiredEndpointsConnected = requiredEndpointKeys.every(key => 
            this.connectionStatus.endpoints[key]?.connected
        );
        
        this.connectionStatus.overall = apiConnected && websocketConnected && requiredEndpointsConnected;
        
        console.log(`Overall connection status: ${this.connectionStatus.overall ? 'CONNECTED' : 'DISCONNECTED'}`);
        
        // Update UI
        this.updateConnectionUI();
    }
    
    // Update connection UI
    updateConnectionUI() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        const status = this.connectionStatus.overall ? 'connected' : 'disconnected';
        const statusText = this.connectionStatus.overall ? 'متصل بالخادم' : 'غير متصل بالخادم';
        
        statusElement.className = `connection-status ${status}`;
        statusElement.textContent = statusText;
        
        // Update detailed status
        this.updateDetailedStatus();
    }
    
    // Update detailed connection status
    updateDetailedStatus() {
        const detailsElement = document.getElementById('connection-details');
        if (!detailsElement) return;
        
        const apiStatus = this.connectionStatus.api.connected ? '✓' : '✗';
        const wsStatus = this.connectionStatus.websocket.connected ? '✓' : '✗';
        
        const requiredEndpoints = this.endpointTests.filter(test => test.required);
        const endpointStatuses = requiredEndpoints.map(test => {
            const key = `${test.category}.${test.action}`;
            const status = this.connectionStatus.endpoints[key]?.connected ? '✓' : '✗';
            return `${status} ${test.category}.${test.action}`;
        }).join('<br>');
        
        detailsElement.innerHTML = `
            <div class="status-item">
                <span class="status-label">API:</span>
                <span class="status-value ${this.connectionStatus.api.connected ? 'success' : 'error'}">${apiStatus}</span>
            </div>
            <div class="status-item">
                <span class="status-label">WebSocket:</span>
                <span class="status-value ${this.connectionStatus.websocket.connected ? 'success' : 'error'}">${wsStatus}</span>
            </div>
            <div class="status-endpoints">
                <span class="status-label">Required Endpoints:</span><br>
                ${endpointStatuses}
            </div>
        `;
    }
    
    // Start health monitoring
    startHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        
        // Check every 30 seconds
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, 30000);
        
        console.log('Health monitoring started');
    }
    
    // Perform health check
    async performHealthCheck() {
        try {
            console.log('Performing health check...');
            
            // Test critical connections
            const apiHealth = await this.testAPIConnection();
            const wsHealth = await this.testWebSocketConnection();
            
            // Test critical endpoints
            const criticalEndpoints = this.endpointTests.filter(test => test.required);
            const endpointHealth = await Promise.all(
                criticalEndpoints.map(async (test) => {
                    try {
                        const endpoint = backendConfig.getEndpoint(test.category, test.action);
                        await this.testEndpoint(endpoint, test.method);
                        return true;
                    } catch (error) {
                        return false;
                    }
                })
            );
            
            const allCriticalEndpointsHealthy = endpointHealth.every(health => health);
            
            // Update status
            this.connectionStatus.api.connected = apiHealth;
            this.connectionStatus.websocket.connected = wsHealth;
            this.connectionStatus.overall = apiHealth && wsHealth && allCriticalEndpointsHealthy;
            
            this.updateOverallStatus();
            
            // Reset retry attempts on successful connection
            if (this.connectionStatus.overall) {
                this.retryAttempts = 0;
            } else {
                this.scheduleRetry();
            }
            
        } catch (error) {
            console.error('Health check failed:', error);
            this.scheduleRetry();
        }
    }
    
    // Schedule retry
    scheduleRetry() {
        if (this.retryAttempts >= this.maxRetryAttempts) {
            console.log('Max retry attempts reached, stopping retries');
            return;
        }
        
        this.retryAttempts++;
        const delay = this.retryDelay * this.retryAttempts;
        
        console.log(`Scheduling retry in ${delay}ms (attempt ${this.retryAttempts})`);
        
        setTimeout(async () => {
            await this.testAllConnections();
        }, delay);
    }
    
    // Force reconnection
    async forceReconnect() {
        console.log('Forcing reconnection...');
        
        try {
            // Disconnect existing connections
            websocketManager.disconnect();
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reinitialize
            await backendConfig.initialize();
            await this.testAllConnections();
            
            console.log('Reconnection completed');
            
        } catch (error) {
            console.error('Force reconnection failed:', error);
        }
    }
    
    // Get connection status
    getConnectionStatus() {
        return {
            ...this.connectionStatus,
            retryAttempts: this.retryAttempts,
            maxRetryAttempts: this.maxRetryAttempts,
            healthMonitoring: !!this.healthCheckInterval
        };
    }
    
    // Get endpoint status
    getEndpointStatus(category, action) {
        const key = `${category}.${action}`;
        return this.connectionStatus.endpoints[key] || null;
    }
    
    // Check if specific endpoint is available
    isEndpointAvailable(category, action) {
        const status = this.getEndpointStatus(category, action);
        return status ? status.connected : false;
    }
    
    // Get connection statistics
    getConnectionStats() {
        const totalEndpoints = this.endpointTests.length;
        const connectedEndpoints = Object.values(this.connectionStatus.endpoints)
            .filter(status => status.connected).length;
        
        const requiredEndpoints = this.endpointTests.filter(test => test.required).length;
        const connectedRequiredEndpoints = this.endpointTests
            .filter(test => test.required)
            .filter(test => this.isEndpointAvailable(test.category, test.action)).length;
        
        return {
            totalEndpoints,
            connectedEndpoints,
            connectionRate: totalEndpoints > 0 ? (connectedEndpoints / totalEndpoints) * 100 : 0,
            requiredEndpoints,
            connectedRequiredEndpoints,
            requiredConnectionRate: requiredEndpoints > 0 ? (connectedRequiredEndpoints / requiredEndpoints) * 100 : 0,
            apiConnected: this.connectionStatus.api.connected,
            websocketConnected: this.connectionStatus.websocket.connected,
            overallConnected: this.connectionStatus.overall
        };
    }
    
    // Stop health monitoring
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        console.log('Health monitoring stopped');
    }
    
    // Cleanup
    destroy() {
        this.stopHealthMonitoring();
        websocketManager.disconnect();
    }
}

// Export singleton instance
const connectionManager = new ConnectionManager();
module.exports = connectionManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.connectionManager = connectionManager;
}
