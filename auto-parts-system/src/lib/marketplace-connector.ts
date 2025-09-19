import axios from 'axios';
import { logger } from './logger';
import { DatabaseManager } from './database';

export interface MarketplaceProduct {
  id: number;
  sku: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  category: string;
  brand: string;
  price: number;
  stock_quantity: number;
  images: string[];
  specifications: Record<string, any>;
  is_active: boolean;
  last_synced: string;
}

export interface MarketplaceOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{
    product_id: number;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  delivery_address: string;
  notes?: string;
}

export interface SyncResult {
  success: boolean;
  synced_products: number;
  synced_orders: number;
  errors: string[];
  timestamp: string;
}

export class MarketplaceConnector {
  private db: DatabaseManager;
  private clutchApiUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.db = new DatabaseManager();
    this.clutchApiUrl = process.env['CLUTCH_API_URL'] || 'https://clutch-main-nk7x.onrender.com';
    this.apiKey = process.env['CLUTCH_API_KEY'] || '';
    this.isEnabled = process.env['MARKETPLACE_ENABLED'] === 'true';
  }

  async initialize(): Promise<void> {
    logger.info('Marketplace Connector initialized');
    
    if (!this.isEnabled) {
      logger.info('Marketplace connector is disabled');
      return;
    }

    if (!this.apiKey) {
      logger.warn('No API key provided for Clutch marketplace');
      return;
    }

    // Test connection to Clutch API
    await this.testConnection();
  }

  /**
   * Test connection to Clutch marketplace API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.clutchApiUrl}/api/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        logger.info('Successfully connected to Clutch marketplace API');
        return true;
      } else {
        logger.error('Failed to connect to Clutch marketplace API');
        return false;
      }
    } catch (error) {
      logger.error('Error testing connection to Clutch marketplace:', error);
      return false;
    }
  }

  /**
   * Sync local products to Clutch marketplace
   */
  async syncProductsToMarketplace(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced_products: 0,
      synced_orders: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    if (!this.isEnabled || !this.apiKey) {
      result.errors.push('Marketplace connector is disabled or API key is missing');
      return result;
    }

    try {
      logger.info('Starting product sync to Clutch marketplace');

      // Get products that need to be synced
      const products = await this.getProductsToSync();
      
      for (const product of products) {
        try {
          const marketplaceProduct = await this.convertToMarketplaceProduct(product);
          await this.publishProductToMarketplace(marketplaceProduct);
          
          // Update sync status
          await this.updateProductSyncStatus(product.id, new Date().toISOString());
          result.synced_products++;
          
          logger.info(`Synced product: ${product.name} (ID: ${product.id})`);
        } catch (error) {
          const errorMsg = `Failed to sync product ${product.name}: ${error}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      logger.info(`Product sync completed. Synced: ${result.synced_products}, Errors: ${result.errors.length}`);
      
    } catch (error) {
      const errorMsg = `Product sync failed: ${error}`;
      logger.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * Sync orders from Clutch marketplace
   */
  async syncOrdersFromMarketplace(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced_products: 0,
      synced_orders: 0,
      errors: [],
      timestamp: new Date().toISOString()
    };

    if (!this.isEnabled || !this.apiKey) {
      result.errors.push('Marketplace connector is disabled or API key is missing');
      return result;
    }

    try {
      logger.info('Starting order sync from Clutch marketplace');

      // Get orders from marketplace
      const orders = await this.fetchOrdersFromMarketplace();
      
      for (const order of orders) {
        try {
          await this.processMarketplaceOrder(order);
          result.synced_orders++;
          
          logger.info(`Processed marketplace order: ${order.id}`);
        } catch (error) {
          const errorMsg = `Failed to process order ${order.id}: ${error}`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      logger.info(`Order sync completed. Synced: ${result.synced_orders}, Errors: ${result.errors.length}`);
      
    } catch (error) {
      const errorMsg = `Order sync failed: ${error}`;
      logger.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * Update product stock on marketplace
   */
  async updateProductStock(productId: number, newStock: number): Promise<boolean> {
    if (!this.isEnabled || !this.apiKey) {
      return false;
    }

    try {
      const response = await axios.patch(
        `${this.clutchApiUrl}/api/marketplace/products/${productId}/stock`,
        { stock_quantity: newStock },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        logger.info(`Updated stock for product ${productId} on marketplace: ${newStock}`);
        return true;
      } else {
        logger.error(`Failed to update stock for product ${productId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error updating stock for product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Update order status on marketplace
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!this.isEnabled || !this.apiKey) {
      return false;
    }

    try {
      const response = await axios.patch(
        `${this.clutchApiUrl}/api/marketplace/orders/${orderId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        logger.info(`Updated status for order ${orderId} on marketplace: ${status}`);
        return true;
      } else {
        logger.error(`Failed to update status for order ${orderId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error updating status for order ${orderId}:`, error);
      return false;
    }
  }

  // Private helper methods
  private async getProductsToSync(): Promise<any[]> {
    // Get products that are active and either never synced or need update
    const products = await this.db.query(`
      SELECT 
        p.id, p.sku, p.name, p.name_ar, p.description, p.description_ar,
        p.selling_price, p.current_stock, p.is_active,
        c.name as category_name, b.name as brand_name,
        p.last_synced
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 AND p.current_stock > 0
      ORDER BY p.last_synced ASC NULLS FIRST
      LIMIT 50
    `);

    return products;
  }

  private async convertToMarketplaceProduct(product: any): Promise<MarketplaceProduct> {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      name_ar: product.name_ar,
      description: product.description || '',
      description_ar: product.description_ar || '',
      category: product.category_name || 'Auto Parts',
      brand: product.brand_name || 'Generic',
      price: product.selling_price,
      stock_quantity: product.current_stock,
      images: [], // TODO: Add image handling
      specifications: {
        sku: product.sku,
        category: product.category_name,
        brand: product.brand_name
      },
      is_active: product.is_active,
      last_synced: new Date().toISOString()
    };
  }

  private async publishProductToMarketplace(product: MarketplaceProduct): Promise<void> {
    const response = await axios.post(
      `${this.clutchApiUrl}/api/marketplace/products`,
      product,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.status !== 201) {
      throw new Error(`Failed to publish product: ${response.statusText}`);
    }
  }

  private async updateProductSyncStatus(productId: number, timestamp: string): Promise<void> {
    await this.db.exec(
      'UPDATE products SET last_synced = ? WHERE id = ?',
      [timestamp, productId]
    );
  }

  private async fetchOrdersFromMarketplace(): Promise<MarketplaceOrder[]> {
    const response = await axios.get(
      `${this.clutchApiUrl}/api/marketplace/orders?status=pending`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.status === 200) {
      return response.data.orders || [];
    } else {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
  }

  private async processMarketplaceOrder(order: MarketplaceOrder): Promise<void> {
    // Create a new sale record for the marketplace order
    const saleNumber = `MP-${order.id}`;
    
    // Calculate totals
    let subtotal = 0;
    for (const item of order.items) {
      subtotal += item.quantity * item.unit_price;
    }
    
    const taxAmount = subtotal * 0.15; // 15% tax
    const totalAmount = subtotal + taxAmount;

    // Insert sale record
    const saleResult = await this.db.exec(
      `INSERT INTO sales (sale_number, customer_id, user_id, subtotal, tax_amount, total_amount, payment_method, payment_status, notes)
       VALUES (?, NULL, 1, ?, ?, ?, 'marketplace', 'completed', ?)`,
      [saleNumber, subtotal, taxAmount, totalAmount, `Marketplace order: ${order.id}`]
    );

    const saleId = saleResult.lastID;

    // Insert sale items
    for (const item of order.items) {
      await this.db.exec(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );

      // Update stock
      await this.db.exec(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Record stock movement
      await this.db.exec(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, user_id)
         VALUES (?, 'out', ?, 'sale', ?, ?, 1)`,
        [item.product_id, item.quantity, saleId, `Marketplace order: ${order.id}`]
      );
    }

    // Update order status on marketplace
    await this.updateOrderStatus(order.id, 'confirmed');
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<any> {
    if (!this.isEnabled) {
      return {
        enabled: false,
        message: 'Marketplace connector is disabled'
      };
    }

    try {
      const response = await axios.get(
        `${this.clutchApiUrl}/api/marketplace/stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        enabled: true,
        connected: true,
        stats: response.data
      };
    } catch (error) {
      return {
        enabled: true,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Enable/disable marketplace connector
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await this.db.exec(
      'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
      ['marketplace_enabled', enabled.toString(), 'Enable/disable marketplace connector']
    );
    logger.info(`Marketplace connector ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set API key for marketplace connector
   */
  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await this.db.exec(
      'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
      ['clutch_api_key', apiKey, 'API key for Clutch marketplace']
    );
    logger.info('Marketplace API key updated');
  }
}
