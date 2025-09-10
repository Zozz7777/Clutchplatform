// AI Insights Manager for Clutch Auto Parts System
// Manages AI-powered analytics and insights

class AIInsightsManager {
    constructor() {
        this.insights = {
            demandForecast: [],
            priceOptimization: [],
            inventoryOptimization: [],
            customerInsights: [],
            marketAnalysis: []
        };
        this.lastUpdate = null;
        this.updateInterval = 300000; // 5 minutes
        this.isUpdating = false;
        
        this.init();
    }

    async init() {
        console.log('AI Insights Manager initialized');
        await this.loadInsights();
        this.startPeriodicUpdates();
    }

    async loadInsights() {
        try {
            // Load insights from API or local cache
            await this.fetchAllInsights();
        } catch (error) {
            console.error('Error loading AI insights:', error);
            // Load mock data as fallback
            this.loadMockInsights();
        }
    }

    async fetchAllInsights() {
        if (!window.apiManager) {
            throw new Error('API Manager not available');
        }

        try {
            // Fetch all AI insights in parallel
            const [
                demandForecast,
                priceOptimization,
                inventoryOptimization,
                customerInsights,
                marketAnalysis
            ] = await Promise.all([
                this.fetchDemandForecast(),
                this.fetchPriceOptimization(),
                this.fetchInventoryOptimization(),
                this.fetchCustomerInsights(),
                this.fetchMarketAnalysis()
            ]);

            this.insights = {
                demandForecast,
                priceOptimization,
                inventoryOptimization,
                customerInsights,
                marketAnalysis
            };

            this.lastUpdate = new Date();
            console.log('AI insights updated successfully');
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            throw error;
        }
    }

    async fetchDemandForecast() {
        try {
            const shopId = window.apiManager.shopId || 'demo-shop-id';
            const response = await window.apiManager.makeRequest('GET', `/ai/demand-forecast?shop_id=${shopId}`);
            return response.data?.forecasts || [];
        } catch (error) {
            console.error('Error fetching demand forecast:', error);
            return [];
        }
    }

    async fetchPriceOptimization() {
        try {
            const shopId = window.apiManager.shopId || 'demo-shop-id';
            const response = await window.apiManager.makeRequest('GET', `/ai/price-optimization?shop_id=${shopId}`);
            return response.data?.suggestions || [];
        } catch (error) {
            console.error('Error fetching price optimization:', error);
            return [];
        }
    }

    async fetchInventoryOptimization() {
        try {
            const shopId = window.apiManager.shopId || 'demo-shop-id';
            const response = await window.apiManager.makeRequest('GET', `/ai/inventory-optimization?shop_id=${shopId}`);
            return response.data?.recommendations || [];
        } catch (error) {
            console.error('Error fetching inventory optimization:', error);
            return [];
        }
    }

    async fetchCustomerInsights() {
        try {
            const shopId = window.apiManager.shopId || 'demo-shop-id';
            const response = await window.apiManager.makeRequest('GET', `/ai/customer-insights?shop_id=${shopId}`);
            return response.data?.insights || [];
        } catch (error) {
            console.error('Error fetching customer insights:', error);
            return [];
        }
    }

    async fetchMarketAnalysis() {
        try {
            const shopId = window.apiManager.shopId || 'demo-shop-id';
            const response = await window.apiManager.makeRequest('GET', `/ai/market-analysis?shop_id=${shopId}`);
            return response.data?.trends || [];
        } catch (error) {
            console.error('Error fetching market analysis:', error);
            return [];
        }
    }

    loadMockInsights() {
        // Mock data for development and testing
        this.insights = {
            demandForecast: [
                {
                    item_id: 'item_001',
                    item_name: 'Front Brake Pads',
                    predicted_demand: 45,
                    confidence: 0.85,
                    timeframe: 'next_30_days'
                },
                {
                    item_id: 'item_002',
                    item_name: 'Oil Filter',
                    predicted_demand: 38,
                    confidence: 0.78,
                    timeframe: 'next_30_days'
                }
            ],
            priceOptimization: [
                {
                    item_id: 'item_001',
                    current_price: 150.00,
                    suggested_price: 165.00,
                    expected_increase: '10%',
                    reason: 'High demand, low competition'
                }
            ],
            inventoryOptimization: [
                {
                    type: 'restock',
                    item_id: 'item_002',
                    current_stock: 5,
                    recommended_stock: 25,
                    reason: 'Seasonal demand increase'
                }
            ],
            customerInsights: [
                {
                    type: 'purchase_pattern',
                    description: 'Customers buy brake pads every 6 months',
                    confidence: 0.78
                }
            ],
            marketAnalysis: [
                {
                    category: 'Brakes',
                    trend: 'increasing',
                    growth_rate: '15%',
                    timeframe: 'last_6_months'
                }
            ]
        };
        this.lastUpdate = new Date();
        console.log('Mock AI insights loaded');
    }

    startPeriodicUpdates() {
        setInterval(async () => {
            if (!this.isUpdating) {
                await this.updateInsights();
            }
        }, this.updateInterval);
    }

    async updateInsights() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        try {
            await this.fetchAllInsights();
        } catch (error) {
            console.error('Error updating AI insights:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    // Getter methods
    getDemandForecast() {
        return this.insights.demandForecast;
    }

    getPriceOptimization() {
        return this.insights.priceOptimization;
    }

    getInventoryOptimization() {
        return this.insights.inventoryOptimization;
    }

    getCustomerInsights() {
        return this.insights.customerInsights;
    }

    getMarketAnalysis() {
        return this.insights.marketAnalysis;
    }

    getAllInsights() {
        return {
            ...this.insights,
            lastUpdate: this.lastUpdate,
            isUpdating: this.isUpdating
        };
    }

    // Utility methods
    getInsightSummary() {
        return {
            totalInsights: Object.values(this.insights).reduce((sum, arr) => sum + arr.length, 0),
            lastUpdate: this.lastUpdate,
            categories: {
                demandForecast: this.insights.demandForecast.length,
                priceOptimization: this.insights.priceOptimization.length,
                inventoryOptimization: this.insights.inventoryOptimization.length,
                customerInsights: this.insights.customerInsights.length,
                marketAnalysis: this.insights.marketAnalysis.length
            }
        };
    }

    // Cleanup
    destroy() {
        // Clean up any intervals or event listeners
        console.log('AI Insights Manager destroyed');
    }
}

// Export singleton instance
const aiInsightsManager = new AIInsightsManager();
module.exports = aiInsightsManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.aiInsightsManager = aiInsightsManager;
}