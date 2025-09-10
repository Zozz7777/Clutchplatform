// AI Manager for Clutch Auto Parts System - Advanced AI Integration
const apiManager = require('./api');
const databaseManager = require('./simple-database');
const uiManager = require('./ui');

class AIManager {
    constructor() {
        this.aiServices = {
            demandForecasting: null,
            priceOptimization: null,
            inventoryOptimization: null,
            customerInsights: null,
            marketAnalysis: null,
            recommendationEngine: null
        };
        this.isInitialized = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    async init() {
        try {
            await this.initializeAIServices();
            this.isInitialized = true;
            console.log('AI Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing AI Manager:', error);
        }
    }

    async initializeAIServices() {
        // Initialize AI services from Clutch backend
        try {
            const response = await apiManager.callAPI('/ai/services/status');
            if (response.success) {
                this.aiServices = response.data;
            }
        } catch (error) {
            console.error('Error fetching AI services status:', error);
        }
    }

    // Demand Forecasting
    async getDemandForecast(itemId, days = 30) {
        const cacheKey = `demand_forecast_${itemId}_${days}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/demand-forecast', {
                method: 'POST',
                data: {
                    item_id: itemId,
                    days: days,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const forecast = response.data;
                this.cache.set(cacheKey, {
                    data: forecast,
                    timestamp: Date.now()
                });
                return forecast;
            }
        } catch (error) {
            console.error('Error getting demand forecast:', error);
        }

        return null;
    }

    async getBulkDemandForecast(itemIds, days = 30) {
        try {
            const response = await apiManager.callAPI('/ai/demand-forecast/bulk', {
                method: 'POST',
                data: {
                    item_ids: itemIds,
                    days: days,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting bulk demand forecast:', error);
        }

        return null;
    }

    // Price Optimization
    async getOptimalPrice(itemId, currentPrice, marketConditions = {}) {
        const cacheKey = `optimal_price_${itemId}_${currentPrice}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/price-optimization', {
                method: 'POST',
                data: {
                    item_id: itemId,
                    current_price: currentPrice,
                    market_conditions: marketConditions,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const optimization = response.data;
                this.cache.set(cacheKey, {
                    data: optimization,
                    timestamp: Date.now()
                });
                return optimization;
            }
        } catch (error) {
            console.error('Error getting optimal price:', error);
        }

        return null;
    }

    async getBulkPriceOptimization(itemIds) {
        try {
            const response = await apiManager.callAPI('/ai/price-optimization/bulk', {
                method: 'POST',
                data: {
                    item_ids: itemIds,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting bulk price optimization:', error);
        }

        return null;
    }

    // Inventory Optimization
    async getInventoryOptimization() {
        const cacheKey = 'inventory_optimization';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/inventory-optimization', {
                method: 'POST',
                data: {
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const optimization = response.data;
                this.cache.set(cacheKey, {
                    data: optimization,
                    timestamp: Date.now()
                });
                return optimization;
            }
        } catch (error) {
            console.error('Error getting inventory optimization:', error);
        }

        return null;
    }

    // Customer Insights
    async getCustomerInsights(customerId) {
        const cacheKey = `customer_insights_${customerId}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/customer-insights', {
                method: 'POST',
                data: {
                    customer_id: customerId,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const insights = response.data;
                this.cache.set(cacheKey, {
                    data: insights,
                    timestamp: Date.now()
                });
                return insights;
            }
        } catch (error) {
            console.error('Error getting customer insights:', error);
        }

        return null;
    }

    async getCustomerSegmentation() {
        const cacheKey = 'customer_segmentation';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/customer-segmentation', {
                method: 'POST',
                data: {
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const segmentation = response.data;
                this.cache.set(cacheKey, {
                    data: segmentation,
                    timestamp: Date.now()
                });
                return segmentation;
            }
        } catch (error) {
            console.error('Error getting customer segmentation:', error);
        }

        return null;
    }

    // Market Analysis
    async getMarketAnalysis(category = null, region = null) {
        const cacheKey = `market_analysis_${category || 'all'}_${region || 'all'}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/market-analysis', {
                method: 'POST',
                data: {
                    category: category,
                    region: region,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const analysis = response.data;
                this.cache.set(cacheKey, {
                    data: analysis,
                    timestamp: Date.now()
                });
                return analysis;
            }
        } catch (error) {
            console.error('Error getting market analysis:', error);
        }

        return null;
    }

    async getTrendingProducts(days = 7) {
        const cacheKey = `trending_products_${days}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/trending-products', {
                method: 'POST',
                data: {
                    days: days,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const trending = response.data;
                this.cache.set(cacheKey, {
                    data: trending,
                    timestamp: Date.now()
                });
                return trending;
            }
        } catch (error) {
            console.error('Error getting trending products:', error);
        }

        return null;
    }

    // Recommendation Engine
    async getProductRecommendations(customerId = null, itemId = null) {
        const cacheKey = `recommendations_${customerId || 'general'}_${itemId || 'none'}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/recommendations', {
                method: 'POST',
                data: {
                    customer_id: customerId,
                    item_id: itemId,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const recommendations = response.data;
                this.cache.set(cacheKey, {
                    data: recommendations,
                    timestamp: Date.now()
                });
                return recommendations;
            }
        } catch (error) {
            console.error('Error getting product recommendations:', error);
        }

        return null;
    }

    async getCrossSellRecommendations(itemId) {
        try {
            const response = await apiManager.callAPI('/ai/cross-sell', {
                method: 'POST',
                data: {
                    item_id: itemId,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting cross-sell recommendations:', error);
        }

        return null;
    }

    // Predictive Analytics
    async getSalesPrediction(days = 30) {
        const cacheKey = `sales_prediction_${days}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/sales-prediction', {
                method: 'POST',
                data: {
                    days: days,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const prediction = response.data;
                this.cache.set(cacheKey, {
                    data: prediction,
                    timestamp: Date.now()
                });
                return prediction;
            }
        } catch (error) {
            console.error('Error getting sales prediction:', error);
        }

        return null;
    }

    async getStockoutPrediction() {
        const cacheKey = 'stockout_prediction';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/stockout-prediction', {
                method: 'POST',
                data: {
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const prediction = response.data;
                this.cache.set(cacheKey, {
                    data: prediction,
                    timestamp: Date.now()
                });
                return prediction;
            }
        } catch (error) {
            console.error('Error getting stockout prediction:', error);
        }

        return null;
    }

    // AI-Powered Alerts
    async getAIAlerts() {
        try {
            const response = await apiManager.callAPI('/ai/alerts', {
                method: 'POST',
                data: {
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting AI alerts:', error);
        }

        return null;
    }

    // Performance Analytics
    async getPerformanceAnalytics(period = 'month') {
        const cacheKey = `performance_analytics_${period}`;
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/performance-analytics', {
                method: 'POST',
                data: {
                    period: period,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const analytics = response.data;
                this.cache.set(cacheKey, {
                    data: analytics,
                    timestamp: Date.now()
                });
                return analytics;
            }
        } catch (error) {
            console.error('Error getting performance analytics:', error);
        }

        return null;
    }

    // AI Insights Dashboard
    async getAIInsightsDashboard() {
        const cacheKey = 'ai_insights_dashboard';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await apiManager.callAPI('/ai/insights-dashboard', {
                method: 'POST',
                data: {
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                const insights = response.data;
                this.cache.set(cacheKey, {
                    data: insights,
                    timestamp: Date.now()
                });
                return insights;
            }
        } catch (error) {
            console.error('Error getting AI insights dashboard:', error);
        }

        return null;
    }

    // Utility Methods
    clearCache() {
        this.cache.clear();
    }

    clearCacheItem(key) {
        this.cache.delete(key);
    }

    getCacheSize() {
        return this.cache.size;
    }

    isServiceAvailable(serviceName) {
        return this.aiServices[serviceName] !== null;
    }

    getAvailableServices() {
        return Object.keys(this.aiServices).filter(service => this.aiServices[service] !== null);
    }

    // AI Service Status
    async getAIServiceStatus() {
        try {
            const response = await apiManager.callAPI('/ai/services/status');
            if (response.success) {
                this.aiServices = response.data;
                return this.aiServices;
            }
        } catch (error) {
            console.error('Error getting AI service status:', error);
        }

        return this.aiServices;
    }

    // Batch Processing
    async processBatchAIRequests(requests) {
        try {
            const response = await apiManager.callAPI('/ai/batch-process', {
                method: 'POST',
                data: {
                    requests: requests,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error processing batch AI requests:', error);
        }

        return null;
    }

    // AI Model Training Status
    async getModelTrainingStatus() {
        try {
            const response = await apiManager.callAPI('/ai/models/training-status');
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting model training status:', error);
        }

        return null;
    }

    // AI Configuration
    async updateAIConfiguration(config) {
        try {
            const response = await apiManager.callAPI('/ai/configuration', {
                method: 'PUT',
                data: {
                    config: config,
                    shop_id: apiManager.shopId
                }
            });

            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error updating AI configuration:', error);
        }

        return null;
    }

    async getAIConfiguration() {
        try {
            const response = await apiManager.callAPI('/ai/configuration');
            if (response.success) {
                return response.data;
            }
        } catch (error) {
            console.error('Error getting AI configuration:', error);
        }

        return null;
    }
}

// Export singleton instance
const aiManager = new AIManager();
module.exports = aiManager;
