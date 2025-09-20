import { logger } from './logger';
import { DatabaseManager } from './database';

export interface DemandForecast {
  product_id: number;
  product_name: string;
  current_stock: number;
  predicted_demand: number;
  confidence_level: number;
  recommended_order_quantity: number;
  forecast_period: string;
  created_at: string;
}

export interface PricingRecommendation {
  product_id: number;
  product_name: string;
  current_price: number;
  recommended_price: number;
  price_change_percentage: number;
  expected_revenue_impact: number;
  confidence_level: number;
  reasoning: string;
  created_at: string;
}

export interface InventoryOptimization {
  product_id: number;
  product_name: string;
  current_stock: number;
  optimal_stock: number;
  stock_adjustment: number;
  cost_impact: number;
  service_level_impact: number;
  recommendation: string;
  created_at: string;
}

export interface CustomerInsight {
  customer_id: number;
  customer_name: string;
  insight_type: 'purchase_pattern' | 'loyalty_risk' | 'upsell_opportunity' | 'seasonal_behavior';
  insight_description: string;
  confidence_score: number;
  actionable_recommendations: string[];
  created_at: string;
}

export class AIManager {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  async initialize(): Promise<void> {
    logger.info('AI Manager initialized');
  }

  /**
   * Generate demand forecast for products based on historical sales data
   */
  async generateDemandForecast(period: '7d' | '30d' | '90d' = '30d'): Promise<DemandForecast[]> {
    try {
      logger.info(`Generating demand forecast for period: ${period}`);

      // Get historical sales data
      const salesData = await this.getHistoricalSalesData(period);
      
      // Simple demand forecasting algorithm
      const forecasts: DemandForecast[] = [];
      
      for (const product of salesData) {
        const avgDailyDemand = product.total_quantity / this.getDaysInPeriod(period);
        const predictedDemand = Math.ceil(avgDailyDemand * this.getDaysInPeriod(period));
        const confidenceLevel = this.calculateConfidenceLevel(product.sales_count, product.total_quantity);
        const recommendedOrderQuantity = Math.max(0, predictedDemand - product.current_stock);

        forecasts.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: product.current_stock,
          predicted_demand: predictedDemand,
          confidence_level: confidenceLevel,
          recommended_order_quantity: recommendedOrderQuantity,
          forecast_period: period,
          created_at: new Date().toISOString()
        });
      }

      logger.info(`Generated ${forecasts.length} demand forecasts`);
      return forecasts;
    } catch (error) {
      logger.error('Error generating demand forecast:', error);
      throw error;
    }
  }

  /**
   * Generate pricing optimization recommendations
   */
  async generatePricingOptimization(): Promise<PricingRecommendation[]> {
    try {
      logger.info('Generating pricing optimization recommendations');

      // Get product sales and pricing data
      const productData = await this.getProductPricingData();
      
      const recommendations: PricingRecommendation[] = [];
      
      for (const product of productData) {
        const priceElasticity = this.calculatePriceElasticity(product);
        const optimalPrice = this.calculateOptimalPrice(product, priceElasticity);
        const priceChangePercentage = ((optimalPrice - product.current_price) / product.current_price) * 100;
        const expectedRevenueImpact = this.calculateRevenueImpact(product, optimalPrice);
        const confidenceLevel = this.calculatePricingConfidence(product);

        if (Math.abs(priceChangePercentage) > 5) { // Only recommend if change is significant
          recommendations.push({
            product_id: product.id,
            product_name: product.name,
            current_price: product.current_price,
            recommended_price: optimalPrice,
            price_change_percentage: priceChangePercentage,
            expected_revenue_impact: expectedRevenueImpact,
            confidence_level: confidenceLevel,
            reasoning: this.generatePricingReasoning(product, optimalPrice, priceElasticity),
            created_at: new Date().toISOString()
          });
        }
      }

      logger.info(`Generated ${recommendations.length} pricing recommendations`);
      return recommendations;
    } catch (error) {
      logger.error('Error generating pricing optimization:', error);
      throw error;
    }
  }

  /**
   * Generate inventory optimization recommendations
   */
  async generateInventoryOptimization(): Promise<InventoryOptimization[]> {
    try {
      logger.info('Generating inventory optimization recommendations');

      const productData = await this.getProductInventoryData();
      const optimizations: InventoryOptimization[] = [];
      
      for (const product of productData) {
        const optimalStock = this.calculateOptimalStock(product);
        const stockAdjustment = optimalStock - product.current_stock;
        const costImpact = stockAdjustment * product.cost_price;
        const serviceLevelImpact = this.calculateServiceLevelImpact(product, optimalStock);

        if (Math.abs(stockAdjustment) > 0) {
          optimizations.push({
            product_id: product.id,
            product_name: product.name,
            current_stock: product.current_stock,
            optimal_stock: optimalStock,
            stock_adjustment: stockAdjustment,
            cost_impact: costImpact,
            service_level_impact: serviceLevelImpact,
            recommendation: this.generateInventoryRecommendation(product, stockAdjustment),
            created_at: new Date().toISOString()
          });
        }
      }

      logger.info(`Generated ${optimizations.length} inventory optimizations`);
      return optimizations;
    } catch (error) {
      logger.error('Error generating inventory optimization:', error);
      throw error;
    }
  }

  /**
   * Generate customer insights
   */
  async generateCustomerInsights(): Promise<CustomerInsight[]> {
    try {
      logger.info('Generating customer insights');

      const customerData = await this.getCustomerBehaviorData();
      const insights: CustomerInsight[] = [];
      
      for (const customer of customerData) {
        // Purchase pattern insights
        const purchasePattern = this.analyzePurchasePattern(customer);
        if (purchasePattern) {
          insights.push(purchasePattern);
        }

        // Loyalty risk analysis
        const loyaltyRisk = this.analyzeLoyaltyRisk(customer);
        if (loyaltyRisk) {
          insights.push(loyaltyRisk);
        }

        // Upsell opportunities
        const upsellOpportunity = this.analyzeUpsellOpportunity(customer);
        if (upsellOpportunity) {
          insights.push(upsellOpportunity);
        }

        // Seasonal behavior
        const seasonalBehavior = this.analyzeSeasonalBehavior(customer);
        if (seasonalBehavior) {
          insights.push(seasonalBehavior);
        }
      }

      logger.info(`Generated ${insights.length} customer insights`);
      return insights;
    } catch (error) {
      logger.error('Error generating customer insights:', error);
      throw error;
    }
  }

  // Helper methods
  private async getHistoricalSalesData(period: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          p.id,
          p.name,
          p.stock_quantity as current_stock,
          p.stock_quantity as total_quantity,
          COUNT(si.id) as sales_count
        FROM products p
        LEFT JOIN sale_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= datetime('now', '-${period}')
        GROUP BY p.id, p.name, p.stock_quantity
        ORDER BY sales_count DESC
        LIMIT 50
      `;
      
      return await this.db.query(query);
    } catch (error) {
      logger.error('Error fetching historical sales data:', error);
      return [];
    }
  }

  private async getProductPricingData(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          p.id,
          p.name,
          p.selling_price as current_price,
          p.cost_price,
          COUNT(si.id) as sales_volume,
          '[]' as competitor_prices
        FROM products p
        LEFT JOIN sale_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= datetime('now', '-30 days')
        GROUP BY p.id, p.name, p.selling_price, p.cost_price
        ORDER BY sales_volume DESC
        LIMIT 50
      `;
      
      return await this.db.query(query);
    } catch (error) {
      logger.error('Error fetching product pricing data:', error);
      return [];
    }
  }

  private async getProductInventoryData(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          p.id,
          p.name,
          p.stock_quantity as current_stock,
          p.min_stock,
          p.max_stock,
          p.cost_price,
          0.2 as demand_variance
        FROM products p
        WHERE p.stock_quantity <= p.min_stock * 2
        ORDER BY p.stock_quantity ASC
        LIMIT 50
      `;
      
      return await this.db.query(query);
    } catch (error) {
      logger.error('Error fetching product inventory data:', error);
      return [];
    }
  }

  private async getCustomerBehaviorData(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          c.id,
          c.name,
          COALESCE(SUM(s.total_amount), 0) as total_purchases,
          COALESCE(COUNT(s.id) / 30.0, 0) as purchase_frequency,
          COALESCE(julianday('now') - julianday(MAX(s.created_at)), 0) as last_purchase_days_ago,
          '[]' as preferred_categories,
          '[]' as seasonal_patterns
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        WHERE s.created_at >= datetime('now', '-90 days')
        GROUP BY c.id, c.name
        HAVING total_purchases > 0
        ORDER BY total_purchases DESC
        LIMIT 50
      `;
      
      return await this.db.query(query);
    } catch (error) {
      logger.error('Error fetching customer behavior data:', error);
      return [];
    }
  }

  private getDaysInPeriod(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  }

  private calculateConfidenceLevel(salesCount: number, totalQuantity: number): number {
    // Simple confidence calculation based on data volume
    const dataVolume = Math.min(salesCount * totalQuantity / 100, 1);
    return Math.round(dataVolume * 100);
  }

  private calculatePriceElasticity(product: any): number {
    // Simple price elasticity calculation
    const avgCompetitorPrice = product.competitor_prices.reduce((a: number, b: number) => a + b, 0) / product.competitor_prices.length;
    const priceDifference = (product.current_price - avgCompetitorPrice) / avgCompetitorPrice;
    return Math.max(-2, Math.min(0, priceDifference * -2)); // Elasticity between -2 and 0
  }

  private calculateOptimalPrice(product: any, elasticity: number): number {
    // Simple optimal price calculation using elasticity
    const costPrice = product.cost_price;
    const markup = 1 / (1 + elasticity);
    return Math.round((costPrice * markup) * 100) / 100;
  }

  private calculateRevenueImpact(product: any, newPrice: number): number {
    const currentRevenue = product.current_price * product.sales_volume;
    const newRevenue = newPrice * product.sales_volume;
    return newRevenue - currentRevenue;
  }

  private calculatePricingConfidence(product: any): number {
    // Confidence based on data availability and competitor price variance
    const competitorVariance = this.calculateVariance(product.competitor_prices);
    const confidence = Math.max(50, 100 - (competitorVariance * 10));
    return Math.round(confidence);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private generatePricingReasoning(product: any, optimalPrice: number, elasticity: number): string {
    if (optimalPrice > product.current_price) {
      return `Price increase recommended due to low price elasticity (${elasticity.toFixed(2)}). Current price is below market average.`;
    } else {
      return `Price decrease recommended due to high price elasticity (${elasticity.toFixed(2)}). Current price is above market average.`;
    }
  }

  private calculateOptimalStock(product: any): number {
    // Simple optimal stock calculation using demand variance
    const baseStock = product.min_stock + (product.max_stock - product.min_stock) * 0.6;
    const varianceAdjustment = product.demand_variance * 20;
    return Math.round(baseStock + varianceAdjustment);
  }

  private calculateServiceLevelImpact(product: any, optimalStock: number): number {
    const currentServiceLevel = Math.min(100, (product.current_stock / product.max_stock) * 100);
    const optimalServiceLevel = Math.min(100, (optimalStock / product.max_stock) * 100);
    return optimalServiceLevel - currentServiceLevel;
  }

  private generateInventoryRecommendation(product: any, stockAdjustment: number): string {
    if (stockAdjustment > 0) {
      return `Increase stock by ${stockAdjustment} units to improve service level and reduce stockout risk.`;
    } else {
      return `Reduce stock by ${Math.abs(stockAdjustment)} units to optimize carrying costs.`;
    }
  }

  private analyzePurchasePattern(customer: any): CustomerInsight | null {
    if (customer.purchase_frequency > 2) {
      return {
        customer_id: customer.id,
        customer_name: customer.name,
        insight_type: 'purchase_pattern',
        insight_description: `High-frequency customer with ${customer.purchase_frequency} purchases per month`,
        confidence_score: 85,
        actionable_recommendations: [
          'Offer loyalty rewards program',
          'Provide early access to new products',
          'Send personalized product recommendations'
        ],
        created_at: new Date().toISOString()
      };
    }
    return null;
  }

  private analyzeLoyaltyRisk(customer: any): CustomerInsight | null {
    if (customer.last_purchase_days_ago > 30) {
      return {
        customer_id: customer.id,
        customer_name: customer.name,
        insight_type: 'loyalty_risk',
        insight_description: `Customer hasn't purchased in ${customer.last_purchase_days_ago} days - risk of churn`,
        confidence_score: 75,
        actionable_recommendations: [
          'Send re-engagement email with special offer',
          'Call customer to check satisfaction',
          'Offer discount on preferred categories'
        ],
        created_at: new Date().toISOString()
      };
    }
    return null;
  }

  private analyzeUpsellOpportunity(customer: any): CustomerInsight | null {
    if (customer.total_purchases > 1000) {
      return {
        customer_id: customer.id,
        customer_name: customer.name,
        insight_type: 'upsell_opportunity',
        insight_description: `High-value customer with $${customer.total_purchases} in purchases - good upsell candidate`,
        confidence_score: 80,
        actionable_recommendations: [
          'Recommend premium products in preferred categories',
          'Offer bundle deals',
          'Introduce new product lines'
        ],
        created_at: new Date().toISOString()
      };
    }
    return null;
  }

  private analyzeSeasonalBehavior(customer: any): CustomerInsight | null {
    if (customer.seasonal_patterns && customer.seasonal_patterns.length > 0) {
      return {
        customer_id: customer.id,
        customer_name: customer.name,
        insight_type: 'seasonal_behavior',
        insight_description: `Customer shows seasonal patterns: ${customer.seasonal_patterns.join(', ')}`,
        confidence_score: 70,
        actionable_recommendations: [
          'Plan seasonal marketing campaigns',
          'Stock up on preferred products before peak seasons',
          'Offer seasonal promotions'
        ],
        created_at: new Date().toISOString()
      };
    }
    return null;
  }
}
