// API Manager for Clutch Backend Integration
const axios = require('axios');

class APIManager {
    constructor() {
        this.baseURL = 'https://clutch-main-nk7x.onrender.com'; // Clutch API URL
        this.apiKey = null;
        this.shopId = null;
        this.isConnected = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        try {
            // Load API configuration from settings
            await this.loadAPIConfig();
            
            // Test connection
            await this.testConnection();
            
            console.log('API Manager initialized successfully');
        } catch (error) {
            console.error('API Manager initialization failed:', error);
        }
    }

    async loadAPIConfig() {
        // Load API key and shop ID from settings
        // This would typically come from the database or configuration
        this.apiKey = process.env.CLUTCH_API_KEY || 'demo-api-key';
        this.shopId = process.env.CLUTCH_SHOP_ID || 'demo-shop-id';
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Shop-ID': this.shopId,
            'X-Client-Version': '1.0.0'
        };
    }

    async testConnection() {
        try {
            const response = await axios.get(`${this.baseURL}/health`, {
                headers: this.getHeaders(),
                timeout: 5000
            });
            
            this.isConnected = response.status === 200;
            return this.isConnected;
        } catch (error) {
            console.error('Connection test failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    async makeRequest(method, endpoint, data = null, retryCount = 0) {
        try {
            const config = {
                method,
                url: `${this.baseURL}${endpoint}`,
                headers: this.getHeaders(),
                timeout: 10000
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`API request failed (attempt ${retryCount + 1}):`, error);
            
            if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.makeRequest(method, endpoint, data, retryCount + 1);
            }
            
            throw error;
        }
    }

    shouldRetry(error) {
        // Retry on network errors or 5xx server errors
        return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Inventory Management API
    async syncInventoryItem(itemData) {
        try {
            const response = await this.makeRequest('POST', '/api/inventory/sync', {
                shop_id: this.shopId,
                item: itemData
            });
            return response;
        } catch (error) {
            console.error('Error syncing inventory item:', error);
            throw error;
        }
    }

    async updateInventoryStock(itemId, newStock) {
        try {
            const response = await this.makeRequest('PUT', `/api/inventory/${itemId}/stock`, {
                shop_id: this.shopId,
                stock_quantity: newStock
            });
            return response;
        } catch (error) {
            console.error('Error updating inventory stock:', error);
            throw error;
        }
    }

    async getInventoryRecommendations() {
        try {
            const response = await this.makeRequest('GET', `/api/inventory/recommendations?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting inventory recommendations:', error);
            throw error;
        }
    }

    // Sales Data API
    async syncSalesData(salesData) {
        try {
            const response = await this.makeRequest('POST', '/api/sales/sync', {
                shop_id: this.shopId,
                sales: salesData
            });
            return response;
        } catch (error) {
            console.error('Error syncing sales data:', error);
            throw error;
        }
    }

    async getMarketInsights() {
        try {
            const response = await this.makeRequest('GET', `/api/market/insights?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting market insights:', error);
            throw error;
        }
    }

    async getTopSellingParts() {
        try {
            const response = await this.makeRequest('GET', `/api/market/top-selling?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting top selling parts:', error);
            throw error;
        }
    }

    async getPopularCarModels() {
        try {
            const response = await this.makeRequest('GET', `/api/market/popular-cars?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting popular car models:', error);
            throw error;
        }
    }

    // AI Services API
    async getDemandForecast(itemId, period = '30d') {
        try {
            const response = await this.makeRequest('GET', `/api/ai/demand-forecast?item_id=${itemId}&period=${period}&shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting demand forecast:', error);
            throw error;
        }
    }

    async getPriceOptimization(itemId) {
        try {
            const response = await this.makeRequest('GET', `/api/ai/price-optimization?item_id=${itemId}&shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting price optimization:', error);
            throw error;
        }
    }

    async getInventoryOptimization() {
        try {
            const response = await this.makeRequest('GET', `/api/ai/inventory-optimization?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting inventory optimization:', error);
            throw error;
        }
    }

    async getCustomerInsights() {
        try {
            const response = await this.makeRequest('GET', `/api/ai/customer-insights?shop_id=${this.shopId}`);
            return response;
        } catch (error) {
            console.error('Error getting customer insights:', error);
            throw error;
        }
    }

    // Real-time Sync API
    async syncTransaction(transactionData) {
        try {
            const response = await this.makeRequest('POST', '/api/sync/transaction', {
                shop_id: this.shopId,
                transaction: transactionData
            });
            return response;
        } catch (error) {
            console.error('Error syncing transaction:', error);
            throw error;
        }
    }

    async syncInventoryUpdate(inventoryData) {
        try {
            const response = await this.makeRequest('POST', '/api/sync/inventory', {
                shop_id: this.shopId,
                inventory: inventoryData
            });
            return response;
        } catch (error) {
            console.error('Error syncing inventory update:', error);
            throw error;
        }
    }

    // WebSocket Connection for Real-time Updates
    connectWebSocket() {
        try {
            const wsUrl = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
            this.websocket = new WebSocket(`${wsUrl}/ws/shop/${this.shopId}`);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
            };
            
            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                
                // Attempt to reconnect after 5 seconds
                setTimeout(() => {
                    this.connectWebSocket();
                }, 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'inventory_update':
                this.handleInventoryUpdate(data.payload);
                break;
            case 'price_update':
                this.handlePriceUpdate(data.payload);
                break;
            case 'demand_forecast':
                this.handleDemandForecast(data.payload);
                break;
            case 'market_insight':
                this.handleMarketInsight(data.payload);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleInventoryUpdate(payload) {
        // Handle inventory update from backend
        console.log('Inventory update received:', payload);
        // Update local inventory if needed
    }

    handlePriceUpdate(payload) {
        // Handle price update from backend
        console.log('Price update received:', payload);
        // Update local prices if needed
    }

    handleDemandForecast(payload) {
        // Handle demand forecast from backend
        console.log('Demand forecast received:', payload);
        // Update local forecasts if needed
    }

    handleMarketInsight(payload) {
        // Handle market insight from backend
        console.log('Market insight received:', payload);
        // Update local insights if needed
    }

    // Batch Operations
    async batchSyncInventory(items) {
        try {
            const response = await this.makeRequest('POST', '/api/inventory/batch-sync', {
                shop_id: this.shopId,
                items: items
            });
            return response;
        } catch (error) {
            console.error('Error batch syncing inventory:', error);
            throw error;
        }
    }

    async batchSyncSales(sales) {
        try {
            const response = await this.makeRequest('POST', '/api/sales/batch-sync', {
                shop_id: this.shopId,
                sales: sales
            });
            return response;
        } catch (error) {
            console.error('Error batch syncing sales:', error);
            throw error;
        }
    }

    // Error Handling
    handleAPIError(error) {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || 'Unknown server error';
            
            switch (status) {
                case 401:
                    return 'غير مصرح بالوصول. يرجى التحقق من بيانات الاعتماد.';
                case 403:
                    return 'غير مسموح بالوصول إلى هذا المورد.';
                case 404:
                    return 'المورد المطلوب غير موجود.';
                case 429:
                    return 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً.';
                case 500:
                    return 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
                default:
                    return `خطأ في الخادم (${status}): ${message}`;
            }
        } else if (error.request) {
            // Network error
            return 'خطأ في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.';
        } else {
            // Other error
            return `خطأ غير متوقع: ${error.message}`;
        }
    }

    // Utility Methods
    async ping() {
        try {
            const response = await this.makeRequest('GET', '/api/ping');
            return response;
        } catch (error) {
            console.error('Ping failed:', error);
            throw error;
        }
    }

    async getServerTime() {
        try {
            const response = await this.makeRequest('GET', '/api/time');
            return response;
        } catch (error) {
            console.error('Error getting server time:', error);
            throw error;
        }
    }

    // Disconnect
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
        }
        this.isConnected = false;
    }
}

// Export singleton instance
const apiManager = new APIManager();
module.exports = apiManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.apiManager = apiManager;
}
