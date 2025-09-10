// Simple Database Manager for Clutch Auto Parts System (No Native Dependencies)
const fs = require('fs');
const path = require('path');

class SimpleDatabaseManager {
    constructor() {
        this.dataPath = path.join(__dirname, '..', '..', '..', 'data');
        this.dbFile = path.join(this.dataPath, 'clutch_auto_parts.json');
        this.data = {
            shops: [],
            products: [],
            inventory: [],
            sales: [],
            sales_items: [],
            customers: [],
            suppliers: [],
            settings: [],
            categories: [],
            brands: [],
            sync_log: []
        };
        this.init();
    }

    init() {
        try {
            // Create data directory if it doesn't exist
            if (!fs.existsSync(this.dataPath)) {
                fs.mkdirSync(this.dataPath, { recursive: true });
            }

            // Load existing data
            if (fs.existsSync(this.dbFile)) {
                const fileData = fs.readFileSync(this.dbFile, 'utf8');
                this.data = JSON.parse(fileData);
                console.log('Database loaded successfully');
            } else {
                // Create initial database
                this.createInitialData();
                this.saveData();
                console.log('New database created');
            }
        } catch (error) {
            console.error('Error initializing database:', error);
            this.createInitialData();
        }
    }

    createInitialData() {
        // Create default shop
        this.data.shops = [{
            id: 1,
            name: 'متجر قطع الغيار',
            name_en: 'Auto Parts Shop',
            address: '',
            phone: '',
            email: '',
            logo: null,
            created_at: new Date().toISOString()
        }];

        // Create default settings
        this.data.settings = [
            { key: 'language', value: 'ar', type: 'string' },
            { key: 'currency', value: 'EGP', type: 'string' },
            { key: 'timezone', value: 'Africa/Cairo', type: 'string' },
            { key: 'clutch_api_key', value: '', type: 'string' },
            { key: 'shop_id', value: '', type: 'string' },
            { key: 'auth_token', value: '', type: 'string' }
        ];

        // Create default categories
        this.data.categories = [
            { id: 1, name: 'محرك', name_en: 'Engine', parent_id: null },
            { id: 2, name: 'فرامل', name_en: 'Brakes', parent_id: null },
            { id: 3, name: 'إطارات', name_en: 'Tires', parent_id: null },
            { id: 4, name: 'إضاءة', name_en: 'Lighting', parent_id: null },
            { id: 5, name: 'كهرباء', name_en: 'Electrical', parent_id: null }
        ];

        // Create default brands
        this.data.brands = [
            { id: 1, name: 'بوش', name_en: 'Bosch', country: 'Germany' },
            { id: 2, name: 'NGK', name_en: 'NGK', country: 'Japan' },
            { id: 3, name: 'دلفي', name_en: 'Delphi', country: 'UK' },
            { id: 4, name: 'فيلتر', name_en: 'Filter', country: 'Germany' },
            { id: 5, name: 'بريمي', name_en: 'Bremi', country: 'Germany' }
        ];
    }

    saveData() {
        try {
            fs.writeFileSync(this.dbFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    // Generic CRUD operations
    async create(table, data) {
        const id = this.getNextId(table);
        const record = {
            id,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.data[table].push(record);
        this.saveData();
        return record;
    }

    async read(table, id = null) {
        if (id) {
            return this.data[table].find(item => item.id === id);
        }
        return this.data[table];
    }

    async update(table, id, data) {
        const index = this.data[table].findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[table][index] = {
                ...this.data[table][index],
                ...data,
                updated_at: new Date().toISOString()
            };
            this.saveData();
            return this.data[table][index];
        }
        return null;
    }

    async delete(table, id) {
        const index = this.data[table].findIndex(item => item.id === id);
        if (index !== -1) {
            const deleted = this.data[table].splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    getNextId(table) {
        if (this.data[table].length === 0) return 1;
        return Math.max(...this.data[table].map(item => item.id)) + 1;
    }

    // Specific methods for compatibility
    async initialize() {
        return Promise.resolve();
    }

    async getQuery(query, params = []) {
        // Simple query parser for basic operations
        if (query.includes('SELECT') && query.includes('FROM')) {
            const tableMatch = query.match(/FROM\s+(\w+)/i);
            if (tableMatch) {
                const table = tableMatch[1];
                if (query.includes('LIMIT 1')) {
                    return this.data[table][0] || null;
                }
                return this.data[table];
            }
        }
        return null;
    }

    async runQuery(query, params = []) {
        // Simple query parser for basic operations
        if (query.includes('INSERT')) {
            const tableMatch = query.match(/INTO\s+(\w+)/i);
            if (tableMatch) {
                const table = tableMatch[1];
                const data = params[0] || {};
                return await this.create(table, data);
            }
        } else if (query.includes('UPDATE')) {
            const tableMatch = query.match(/UPDATE\s+(\w+)/i);
            if (tableMatch) {
                const table = tableMatch[1];
                const idMatch = query.match(/WHERE\s+id\s*=\s*\?/i);
                if (idMatch) {
                    const id = params[1];
                    const data = params[0];
                    return await this.update(table, id, data);
                }
            }
        } else if (query.includes('DELETE')) {
            const tableMatch = query.match(/FROM\s+(\w+)/i);
            if (tableMatch) {
                const table = tableMatch[1];
                const idMatch = query.match(/WHERE\s+id\s*=\s*\?/i);
                if (idMatch) {
                    const id = params[0];
                    return await this.delete(table, id);
                }
            }
        }
        return null;
    }

    async getAllSettings() {
        const settings = {};
        this.data.settings.forEach(setting => {
            settings[setting.key] = setting;
        });
        return settings;
    }

    async setSetting(key, value) {
        const existingIndex = this.data.settings.findIndex(s => s.key === key);
        if (existingIndex >= 0) {
            this.data.settings[existingIndex].value = value;
        } else {
            this.data.settings.push({ key, value });
        }
        this.saveData();
        return true;
    }

    async allQuery(query, params = []) {
        // Simple query implementation for common queries
        if (query.includes('SELECT * FROM settings')) {
            return this.data.settings;
        }
        if (query.includes('SELECT * FROM sync_log')) {
            return this.data.sync_log || [];
        }
        if (query.includes('SELECT * FROM inventory')) {
            return this.data.inventory;
        }
        if (query.includes('SELECT * FROM sales')) {
            return this.data.sales;
        }
        if (query.includes('SELECT * FROM customers')) {
            return this.data.customers;
        }
        if (query.includes('SELECT * FROM suppliers')) {
            return this.data.suppliers;
        }
        return [];
    }

    async getShopInfo() {
        return this.data.shops[0] || null;
    }
    
    async getShops() {
        return this.data.shops;
    }
    
    async getShop(id) {
        return this.data.shops.find(shop => shop.id === id) || null;
    }
    
    async addShop(shop) {
        this.data.shops.push(shop);
        await this.saveData();
        return shop;
    }
    
    async updateShop(id, shopData) {
        const index = this.data.shops.findIndex(shop => shop.id === id);
        if (index !== -1) {
            this.data.shops[index] = { ...this.data.shops[index], ...shopData };
            await this.saveData();
            return this.data.shops[index];
        }
        return null;
    }
    
    async deleteShop(id) {
        const index = this.data.shops.findIndex(shop => shop.id === id);
        if (index !== -1) {
            this.data.shops.splice(index, 1);
            await this.saveData();
            return true;
        }
        return false;
    }

    // Inventory methods
    async getInventoryItems() {
        return this.data.inventory;
    }

    async addInventoryItem(item) {
        return await this.create('inventory', item);
    }

    async updateInventoryItem(id, item) {
        return await this.update('inventory', id, item);
    }

    async deleteInventoryItem(id) {
        return await this.delete('inventory', id);
    }

    async getInventoryItems(filters = {}) {
        let items = this.data.inventory.filter(item => item.is_active !== false);
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.name_en?.toLowerCase().includes(searchTerm) ||
                item.barcode?.toLowerCase().includes(searchTerm) ||
                item.sku?.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.category_id) {
            items = items.filter(item => item.category_id == filters.category_id);
        }
        
        if (filters.brand_id) {
            items = items.filter(item => item.brand_id == filters.brand_id);
        }
        
        if (filters.limit) {
            items = items.slice(0, filters.limit);
        }
        
        return items;
    }

    // Sales methods
    async getSales() {
        return this.data.sales;
    }

    async addSale(sale) {
        return await this.create('sales', sale);
    }

    async createSale(saleData) {
        try {
            const sale = {
                id: this.getNextId('sales'),
                ...saleData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            this.data.sales.push(sale);
            
            // Add sale items if provided
            if (saleData.items && saleData.items.length > 0) {
                saleData.items.forEach(item => {
                    const saleItem = {
                        id: this.getNextId('sales_items'),
                        sale_id: sale.id,
                        inventory_id: item.inventory_id,
                        item_name: item.item_name,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total_price: item.total_price,
                        created_at: new Date().toISOString()
                    };
                    this.data.sales_items.push(saleItem);
                });
            }
            
            await this.saveData();
            return sale;
        } catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    }

    async getSale(id) {
        return this.data.sales.find(sale => sale.id === id) || null;
    }

    async updateSale(id, saleData) {
        return await this.update('sales', id, saleData);
    }

    async deleteSale(id) {
        return await this.delete('sales', id);
    }

    // Customer methods
    async getCustomers() {
        return this.data.customers;
    }

    async addCustomer(customer) {
        return await this.create('customers', customer);
    }

    // Supplier methods
    async getSuppliers() {
        return this.data.suppliers;
    }

    async addSupplier(supplier) {
        return await this.create('suppliers', supplier);
    }

    // Category methods
    async getCategories() {
        return this.data.categories;
    }

    async addCategory(category) {
        return await this.create('categories', category);
    }

    // Brand methods
    async getBrands() {
        return this.data.brands || [];
    }

    async addBrand(brand) {
        return await this.create('brands', brand);
    }

    async getBrand(id) {
        return this.data.brands?.find(brand => brand.id === id) || null;
    }

    async updateBrand(id, brandData) {
        return await this.update('brands', id, brandData);
    }

    async deleteBrand(id) {
        return await this.delete('brands', id);
    }

    // Search methods
    async searchInventory(query) {
        return this.data.inventory.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.sku.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Statistics methods
    async getInventoryStats() {
        const total = this.data.inventory.length;
        const lowStock = this.data.inventory.filter(item => item.stock < item.min_stock).length;
        const outOfStock = this.data.inventory.filter(item => item.stock === 0).length;
        
        return {
            total,
            lowStock,
            outOfStock,
            inStock: total - outOfStock
        };
    }

    async getSalesStats() {
        const total = this.data.sales.length;
        const today = new Date().toISOString().split('T')[0];
        const todaySales = this.data.sales.filter(sale => 
            sale.created_at.startsWith(today)
        ).length;
        
        return {
            total,
            todaySales,
            totalRevenue: this.data.sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        };
    }

    async getDashboardStats() {
        // Return mock dashboard statistics
        return {
            total_inventory: this.data.inventory?.length || 0,
            total_customers: this.data.customers?.length || 0,
            total_sales: this.data.sales?.length || 0,
            monthly_revenue: 12500.50,
            low_stock_items: this.data.inventory?.filter(item => item.stock <= item.min_stock).length || 0,
            pending_orders: 0 // No orders table yet
        };
    }

    // Backup and restore
    async backup() {
        const backupPath = path.join(this.dataPath, `backup_${Date.now()}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(this.data, null, 2));
        return backupPath;
    }

    async restore(backupPath) {
        if (fs.existsSync(backupPath)) {
            const backupData = fs.readFileSync(backupPath, 'utf8');
            this.data = JSON.parse(backupData);
            this.saveData();
            return true;
        }
        return false;
    }

    // Export data
    async exportData(table) {
        return this.data[table] || [];
    }

    async importData(table, data) {
        if (Array.isArray(data)) {
            this.data[table] = data;
            this.saveData();
            return true;
        }
        return false;
    }
}

// Export singleton instance
const databaseManager = new SimpleDatabaseManager();
module.exports = databaseManager;

// Also make available globally when loaded as script
if (typeof window !== 'undefined') {
    window.databaseManager = databaseManager;
}
