// Backend Configuration for Clutch Auto Parts System
class BackendConfig {
    constructor() {
        this.config = {
            // Clutch Backend API Configuration
            api: {
                baseURL: 'https://clutch-main-nk7x.onrender.com',
                version: 'v1',
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 1000
            },
            
            // WebSocket Configuration
            websocket: {
                url: 'wss://clutch-main-nk7x.onrender.com/ws',
                reconnectAttempts: 5,
                reconnectDelay: 1000,
                maxReconnectDelay: 30000,
                heartbeatInterval: 30000,
                heartbeatTimeout: 10000
            },
            
            // Authentication Configuration
            auth: {
                tokenType: 'Bearer',
                refreshThreshold: 300000, // 5 minutes before expiry
                autoRefresh: true
            },
            
            // Sync Configuration
            sync: {
                batchSize: 100,
                syncInterval: 15000, // 15 minutes
                realTimeSync: true,
                conflictResolution: 'server_wins',
                offlineQueue: true,
                maxQueueSize: 1000
            },
            
            // Data Endpoints
            endpoints: {
                // Authentication
                auth: {
                    login: '/auth/login',
                    refresh: '/auth/refresh',
                    logout: '/auth/logout',
                    verify: '/auth/verify'
                },
                
                // Shop Management
                shop: {
                    profile: '/shops/profile',
                    update: '/shops/update',
                    settings: '/shops/settings',
                    stats: '/shops/stats'
                },
                
                // Inventory Management
                inventory: {
                    list: '/inventory/items',
                    create: '/inventory/items',
                    update: '/inventory/items/{id}',
                    delete: '/inventory/items/{id}',
                    sync: '/inventory/sync',
                    batchSync: '/inventory/batch-sync',
                    recommendations: '/inventory/recommendations',
                    alerts: '/inventory/alerts'
                },
                
                // Sales Management
                sales: {
                    list: '/sales/transactions',
                    create: '/sales/transactions',
                    update: '/sales/transactions/{id}',
                    sync: '/sales/sync',
                    batchSync: '/sales/batch-sync',
                    analytics: '/sales/analytics',
                    reports: '/sales/reports'
                },
                
                // Customer Management
                customers: {
                    list: '/customers',
                    create: '/customers',
                    update: '/customers/{id}',
                    delete: '/customers/{id}',
                    sync: '/customers/sync',
                    analytics: '/customers/analytics'
                },
                
                // Supplier Management
                suppliers: {
                    list: '/suppliers',
                    create: '/suppliers',
                    update: '/suppliers/{id}',
                    delete: '/suppliers/{id}',
                    sync: '/suppliers/sync'
                },
                
                // AI Services
                ai: {
                    demandForecast: '/ai/demand-forecast',
                    priceOptimization: '/ai/price-optimization',
                    inventoryOptimization: '/ai/inventory-optimization',
                    customerInsights: '/ai/customer-insights',
                    marketAnalysis: '/ai/market-analysis',
                    recommendations: '/ai/recommendations'
                },
                
                // Orders (Clutch Platform)
                orders: {
                    list: '/orders',
                    get: '/orders/{id}',
                    accept: '/orders/{id}/accept',
                    reject: '/orders/{id}/reject',
                    quote: '/orders/{id}/quote',
                    update: '/orders/{id}/update',
                    status: '/orders/{id}/status'
                },
                
                // Market Intelligence
                market: {
                    insights: '/market/insights',
                    trends: '/market/trends',
                    topSelling: '/market/top-selling',
                    popularCars: '/market/popular-cars',
                    regionalData: '/market/regional-data'
                },
                
                // System
                system: {
                    health: '/system/health',
                    ping: '/system/ping',
                    time: '/system/time',
                    version: '/system/version',
                    status: '/system/status'
                }
            },
            
            // Real-time Events
            events: {
                inventory: {
                    update: 'inventory_update',
                    alert: 'inventory_alert',
                    lowStock: 'low_stock_alert',
                    outOfStock: 'out_of_stock_alert'
                },
                sales: {
                    new: 'new_sale',
                    update: 'sale_update',
                    payment: 'payment_received'
                },
                orders: {
                    new: 'new_order',
                    update: 'order_update',
                    accepted: 'order_accepted',
                    rejected: 'order_rejected',
                    quoted: 'order_quoted'
                },
                prices: {
                    update: 'price_update',
                    alert: 'price_alert'
                },
                ai: {
                    forecast: 'demand_forecast',
                    recommendation: 'ai_recommendation',
                    insight: 'market_insight'
                },
                system: {
                    message: 'system_message',
                    maintenance: 'maintenance_notice',
                    update: 'system_update'
                }
            }
        };
        
        this.credentials = {
            apiKey: null,
            shopId: null,
            token: null,
            refreshToken: null,
            tokenExpiry: null
        };
        
        this.connectionStatus = {
            api: false,
            websocket: false,
            lastSync: null,
            syncInProgress: false,
            offlineMode: false
        };
    }
    
    // Initialize backend configuration
    async initialize() {
        try {
            await this.loadCredentials();
            await this.validateConfiguration();
            await this.testConnections();
            
            console.log('Backend configuration initialized successfully');
            return true;
        } catch (error) {
            console.error('Backend configuration initialization failed:', error);
            return false;
        }
    }
    
    // Load credentials from settings
    async loadCredentials() {
        try {
            // databaseManager is available globally
            
            // Load API credentials
            const apiKey = await window.databaseManager.getQuery(
                'SELECT value FROM settings WHERE key = ?',
                ['clutch_api_key']
            );
            
            const shopId = await window.databaseManager.getQuery(
                'SELECT value FROM settings WHERE key = ?',
                ['shop_id']
            );
            
            if (apiKey) this.credentials.apiKey = apiKey.value;
            if (shopId) this.credentials.shopId = shopId.value;
            
            // Use default values if not found in database
            if (!this.credentials.apiKey) {
                this.credentials.apiKey = process.env.CLUTCH_API_KEY || 'demo-api-key';
            }
            if (!this.credentials.shopId) {
                this.credentials.shopId = process.env.CLUTCH_SHOP_ID || 'demo-shop-id';
            }
            
            // Load authentication token if exists
            const token = await window.databaseManager.getQuery(
                'SELECT value FROM settings WHERE key = ?',
                ['auth_token']
            );
            
            if (token) {
                this.credentials.token = token.value;
                this.credentials.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour default
            }
            
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    }
    
    // Validate configuration
    async validateConfiguration() {
        const errors = [];
        
        // Check required credentials (allow demo values)
        if (!this.credentials.apiKey || this.credentials.apiKey === '') {
            errors.push('API key is required');
        }
        
        if (!this.credentials.shopId || this.credentials.shopId === '') {
            errors.push('Shop ID is required');
        }
        
        // Check API configuration
        if (!this.config.api.baseURL) {
            errors.push('API base URL is required');
        }
        
        // Allow demo values to pass validation
        const isDemoMode = this.credentials.apiKey === 'demo-api-key' && this.credentials.shopId === 'demo-shop-id';
        
        if (errors.length > 0 && !isDemoMode) {
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }
        
        if (isDemoMode) {
            console.log('Running in demo mode with default credentials');
        }
    }
    
    // Test connections
    async testConnections() {
        try {
            // Test API connection
            await this.testAPIConnection();
            
            // Test WebSocket connection
            await this.testWebSocketConnection();
            
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
    
    // Test API connection
    async testAPIConnection() {
        try {
            // Skip API testing in demo mode to avoid circular dependencies
            if (this.isDemoMode) {
                this.connectionStatus.api = false;
                console.log('API connection skipped in demo mode');
                return;
            }
            
            // Simple fetch test instead of requiring api module
            const response = await fetch(`${this.apiBaseUrl}/system/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            if (response.ok) {
                this.connectionStatus.api = true;
                console.log('API connection successful');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            this.connectionStatus.api = false;
            console.error('API connection failed:', error);
            throw error;
        }
    }
    
    // Test WebSocket connection
    async testWebSocketConnection() {
        try {
            const websocketManager = require('./websocket-manager');
            
            // Check if WebSocket is connected
            const status = websocketManager.getConnectionStatus();
            this.connectionStatus.websocket = status.isConnected;
            
            if (!status.isConnected) {
                console.warn('WebSocket not connected, will retry automatically');
            } else {
                console.log('WebSocket connection successful');
            }
            
        } catch (error) {
            this.connectionStatus.websocket = false;
            console.error('WebSocket connection test failed:', error);
        }
    }
    
    // Get API endpoint URL
    getEndpoint(category, action, params = {}) {
        const endpoint = this.config.endpoints[category]?.[action];
        if (!endpoint) {
            throw new Error(`Endpoint not found: ${category}.${action}`);
        }
        
        // Replace URL parameters
        let url = endpoint;
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        
        return url;
    }
    
    // Get full API URL
    getFullURL(endpoint) {
        return `${this.config.api.baseURL}/api${this.config.api.version}${endpoint}`;
    }
    
    // Get WebSocket URL
    getWebSocketURL() {
        const { shopId, token } = this.credentials;
        return `${this.config.websocket.url}/shop/${shopId}?token=${token}`;
    }
    
    // Update credentials
    async updateCredentials(credentials) {
        try {
            // databaseManager is available globally
            
            // Update API key
            if (credentials.apiKey) {
                await window.databaseManager.runQuery(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['clutch_api_key', credentials.apiKey]
                );
                this.credentials.apiKey = credentials.apiKey;
            }
            
            // Update shop ID
            if (credentials.shopId) {
                await window.databaseManager.runQuery(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['shop_id', credentials.shopId]
                );
                this.credentials.shopId = credentials.shopId;
            }
            
            // Update authentication token
            if (credentials.token) {
                await window.databaseManager.runQuery(
                    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                    ['auth_token', credentials.token]
                );
                this.credentials.token = credentials.token;
                this.credentials.tokenExpiry = new Date(Date.now() + 3600000);
            }
            
            console.log('Credentials updated successfully');
            
        } catch (error) {
            console.error('Error updating credentials:', error);
            throw error;
        }
    }
    
    // Check if token needs refresh
    needsTokenRefresh() {
        if (!this.credentials.token || !this.credentials.tokenExpiry) {
            return true;
        }
        
        const now = new Date();
        const refreshTime = new Date(this.credentials.tokenExpiry.getTime() - this.config.auth.refreshThreshold);
        
        return now >= refreshTime;
    }
    
    // Refresh authentication token
    async refreshToken() {
        try {
            if (!this.credentials.refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const apiManager = require('./api');
            const response = await apiManager.makeRequest('POST', '/auth/refresh', {
                refresh_token: this.credentials.refreshToken
            });
            
            if (response.token) {
                await this.updateCredentials({
                    token: response.token,
                    refreshToken: response.refresh_token
                });
                
                console.log('Token refreshed successfully');
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }
    
    // Get connection status
    getConnectionStatus() {
        return {
            ...this.connectionStatus,
            credentials: {
                hasApiKey: !!this.credentials.apiKey,
                hasShopId: !!this.credentials.shopId,
                hasToken: !!this.credentials.token,
                tokenExpiry: this.credentials.tokenExpiry
            },
            config: {
                apiBaseURL: this.config.api.baseURL,
                websocketURL: this.config.websocket.url,
                syncInterval: this.config.sync.syncInterval
            }
        };
    }
    
    // Update connection status
    updateConnectionStatus(status) {
        this.connectionStatus = { ...this.connectionStatus, ...status };
    }
    
    // Get configuration for specific service
    getServiceConfig(service) {
        return this.config[service] || null;
    }
    
    // Update configuration
    updateConfig(service, config) {
        if (this.config[service]) {
            this.config[service] = { ...this.config[service], ...config };
        }
    }
    
    // Reset configuration to defaults
    resetConfig() {
        this.credentials = {
            apiKey: null,
            shopId: null,
            token: null,
            refreshToken: null,
            tokenExpiry: null
        };
        
        this.connectionStatus = {
            api: false,
            websocket: false,
            lastSync: null,
            syncInProgress: false,
            offlineMode: false
        };
    }
    
    // Export configuration for backup
    exportConfig() {
        return {
            config: this.config,
            credentials: {
                // Don't export sensitive data
                hasApiKey: !!this.credentials.apiKey,
                hasShopId: !!this.credentials.shopId,
                hasToken: !!this.credentials.token
            },
            connectionStatus: this.connectionStatus,
            timestamp: new Date().toISOString()
        };
    }
    
    // Import configuration from backup
    async importConfig(configData) {
        try {
            if (configData.config) {
                this.config = { ...this.config, ...configData.config };
            }
            
            if (configData.connectionStatus) {
                this.connectionStatus = { ...this.connectionStatus, ...configData.connectionStatus };
            }
            
            console.log('Configuration imported successfully');
            
        } catch (error) {
            console.error('Error importing configuration:', error);
            throw error;
        }
    }
}

// Export singleton instance
const backendConfig = new BackendConfig();
module.exports = backendConfig;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.backendConfig = backendConfig;
}
