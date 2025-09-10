// Dashboard Manager for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const uiManager = require('./ui');
const apiManager = require('./api');

class DashboardManager {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDashboardData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-dashboard-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboard();
            });
        }

        // Quick action buttons
        const quickSaleBtn = document.getElementById('quick-sale-btn');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => {
                this.openQuickSale();
            });
        }

        const addInventoryBtn = document.getElementById('add-inventory-btn');
        if (addInventoryBtn) {
            addInventoryBtn.addEventListener('click', () => {
                this.openAddInventory();
            });
        }

        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => {
                this.openAddCustomer();
            });
        }

        const addSupplierBtn = document.getElementById('add-supplier-btn');
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => {
                this.openAddSupplier();
            });
        }

        const importExcelBtn = document.getElementById('import-excel-btn');
        if (importExcelBtn) {
            importExcelBtn.addEventListener('click', () => {
                this.openImportExcel();
            });
        }

        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.openGenerateReport();
            });
        }
    }

    async loadDashboardData() {
        try {
            // Show loading state
            this.showLoading();

            // Load all dashboard data in parallel
            const [
                inventoryStats,
                salesStats,
                customerStats,
                supplierStats,
                recentActivity,
                lowStockAlerts,
                aiInsights
            ] = await Promise.all([
                this.loadInventoryStats(),
                this.loadSalesStats(),
                this.loadCustomerStats(),
                this.loadSupplierStats(),
                this.loadRecentActivity(),
                this.loadLowStockAlerts(),
                this.loadAIInsights()
            ]);

            // Update statistics
            this.updateStatistics(inventoryStats, salesStats, customerStats, supplierStats);

            // Update charts
            this.updateCharts(salesStats, inventoryStats);

            // Update recent activity
            this.updateRecentActivity(recentActivity);

            // Update low stock alerts
            this.updateLowStockAlerts(lowStockAlerts);

            // Update AI insights
            this.updateAIInsights(aiInsights);

            // Hide loading state
            this.hideLoading();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            uiManager.showNotification('خطأ في تحميل بيانات لوحة التحكم', 'error');
            this.hideLoading();
        }
    }

    async loadInventoryStats() {
        try {
            const inventory = await databaseManager.allQuery('SELECT * FROM inventory WHERE is_active = 1');
            const totalItems = inventory.length;
            const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.unit_price), 0);
            const lowStockItems = inventory.filter(item => item.stock_quantity <= item.min_stock_level);
            const outOfStockItems = inventory.filter(item => item.stock_quantity === 0);

            return {
                totalItems,
                totalValue,
                lowStockItems: lowStockItems.length,
                outOfStockItems: outOfStockItems.length,
                items: inventory
            };
        } catch (error) {
            console.error('Error loading inventory stats:', error);
            return { totalItems: 0, totalValue: 0, lowStockItems: 0, outOfStockItems: 0, items: [] };
        }
    }

    async loadSalesStats() {
        try {
            const sales = await databaseManager.allQuery('SELECT * FROM sales');
            const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
            const totalTransactions = sales.length;
            const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

            // Get sales for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentSales = sales.filter(sale => new Date(sale.created_at) >= thirtyDaysAgo);

            return {
                totalSales,
                totalTransactions,
                avgTransactionValue,
                recentSales,
                allSales: sales
            };
        } catch (error) {
            console.error('Error loading sales stats:', error);
            return { totalSales: 0, totalTransactions: 0, avgTransactionValue: 0, recentSales: [], allSales: [] };
        }
    }

    async loadCustomerStats() {
        try {
            const customers = await databaseManager.allQuery('SELECT * FROM customers WHERE is_active = 1');
            const totalCustomers = customers.length;
            
            // Get active customers (customers with sales)
            const activeCustomers = await databaseManager.allQuery(`
                SELECT DISTINCT customer_id FROM sales WHERE customer_id IS NOT NULL
            `);

            return {
                totalCustomers,
                activeCustomers: activeCustomers.length,
                customers
            };
        } catch (error) {
            console.error('Error loading customer stats:', error);
            return { totalCustomers: 0, activeCustomers: 0, customers: [] };
        }
    }

    async loadSupplierStats() {
        try {
            const suppliers = await databaseManager.allQuery('SELECT * FROM suppliers WHERE is_active = 1');
            const totalSuppliers = suppliers.length;
            
            // Get active suppliers (suppliers with inventory)
            const activeSuppliers = await databaseManager.allQuery(`
                SELECT DISTINCT supplier_id FROM inventory WHERE supplier_id IS NOT NULL AND is_active = 1
            `);

            return {
                totalSuppliers,
                activeSuppliers: activeSuppliers.length,
                suppliers
            };
        } catch (error) {
            console.error('Error loading supplier stats:', error);
            return { totalSuppliers: 0, activeSuppliers: 0, suppliers: [] };
        }
    }

    async loadRecentActivity() {
        try {
            // Get recent sales
            const recentSales = await databaseManager.allQuery(`
                SELECT * FROM sales ORDER BY created_at DESC LIMIT 10
            `);

            // Get recent inventory updates
            const recentInventory = await databaseManager.allQuery(`
                SELECT * FROM inventory WHERE updated_at >= datetime('now', '-7 days') ORDER BY updated_at DESC LIMIT 5
            `);

            // Combine and sort activities
            const activities = [
                ...recentSales.map(sale => ({
                    type: 'sale',
                    title: `بيع جديد - ${sale.customer_name || 'عميل نقدي'}`,
                    description: `مبلغ: ${uiManager.formatCurrency(sale.total_amount)}`,
                    timestamp: sale.created_at,
                    icon: '💰'
                })),
                ...recentInventory.map(item => ({
                    type: 'inventory',
                    title: `تحديث مخزون - ${item.name}`,
                    description: `الكمية: ${item.stock_quantity}`,
                    timestamp: item.updated_at,
                    icon: '📦'
                }))
            ];

            // Sort by timestamp
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return activities.slice(0, 10);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            return [];
        }
    }

    async loadLowStockAlerts() {
        try {
            const lowStockItems = await databaseManager.allQuery(`
                SELECT * FROM inventory 
                WHERE is_active = 1 AND stock_quantity <= min_stock_level
                ORDER BY (stock_quantity - min_stock_level) ASC
                LIMIT 10
            `);

            return lowStockItems;
        } catch (error) {
            console.error('Error loading low stock alerts:', error);
            return [];
        }
    }

    async loadAIInsights() {
        try {
            // Try to get AI insights from the API
            if (window.aiInsightsManager) {
                const insights = await window.aiInsightsManager.getAllInsights();
                return insights;
            }
            
            // Fallback to mock data
            return {
                demandForecast: {
                    title: 'توقع الطلب',
                    description: 'زيادة متوقعة في الطلب على قطع الغيار',
                    value: '+15%',
                    trend: 'up'
                },
                priceOptimization: {
                    title: 'تحسين الأسعار',
                    description: 'فرصة لتحسين أسعار 5 منتجات',
                    value: '5 منتجات',
                    trend: 'neutral'
                },
                inventoryOptimization: {
                    title: 'تحسين المخزون',
                    description: 'توصية بزيادة مخزون 3 منتجات',
                    value: '3 منتجات',
                    trend: 'up'
                }
            };
        } catch (error) {
            console.error('Error loading AI insights:', error);
            return null;
        }
    }

    updateStatistics(inventoryStats, salesStats, customerStats, supplierStats) {
        // Update inventory stats
        const totalInventoryItems = document.getElementById('total-inventory-items');
        if (totalInventoryItems) {
            totalInventoryItems.textContent = inventoryStats.totalItems;
        }

        // Update sales stats
        const totalSalesAmount = document.getElementById('total-sales-amount');
        if (totalSalesAmount) {
            totalSalesAmount.textContent = uiManager.formatCurrency(salesStats.totalSales);
        }

        // Update customer stats
        const totalCustomers = document.getElementById('total-customers');
        if (totalCustomers) {
            totalCustomers.textContent = customerStats.totalCustomers;
        }

        // Update supplier stats
        const totalSuppliers = document.getElementById('total-suppliers');
        if (totalSuppliers) {
            totalSuppliers.textContent = supplierStats.totalSuppliers;
        }
    }

    updateCharts(salesStats, inventoryStats) {
        this.renderSalesTrendChart(salesStats);
        this.renderInventoryDistributionChart(inventoryStats);
    }

    renderSalesTrendChart(salesStats) {
        const canvas = document.getElementById('sales-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.salesTrend) {
            this.charts.salesTrend.destroy();
        }

        // Group sales by day for the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailySales = last7Days.map(date => {
            const daySales = salesStats.allSales.filter(sale => 
                sale.created_at.startsWith(date)
            );
            return daySales.reduce((sum, sale) => sum + sale.total_amount, 0);
        });

        this.charts.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => new Date(date).toLocaleDateString('ar-EG')),
                datasets: [{
                    label: 'المبيعات اليومية',
                    data: dailySales,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderInventoryDistributionChart(inventoryStats) {
        const canvas = document.getElementById('inventory-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.inventoryDistribution) {
            this.charts.inventoryDistribution.destroy();
        }

        // Group inventory by category
        const categoryStats = {};
        inventoryStats.items.forEach(item => {
            const category = item.category_id || 'غير محدد';
            if (!categoryStats[category]) {
                categoryStats[category] = 0;
            }
            categoryStats[category]++;
        });

        const labels = Object.keys(categoryStats);
        const data = Object.values(categoryStats);

        this.charts.inventoryDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe',
                        '#00f2fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<div class="no-activity">لا يوجد نشاط حديث</div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${uiManager.formatDateTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    updateLowStockAlerts(alerts) {
        const container = document.getElementById('low-stock-alerts');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">لا توجد تنبيهات</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.stock_quantity === 0 ? 'critical' : 'warning'}">
                <div class="alert-icon">${alert.stock_quantity === 0 ? '❌' : '⚠️'}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.name}</div>
                    <div class="alert-description">
                        المخزون: ${alert.stock_quantity} / الحد الأدنى: ${alert.min_stock_level}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAIInsights(insights) {
        const container = document.getElementById('ai-insights-grid');
        if (!container || !insights) return;

        const insightsArray = [
            insights.demandForecast,
            insights.priceOptimization,
            insights.inventoryOptimization
        ].filter(Boolean);

        if (insightsArray.length === 0) {
            container.innerHTML = '<div class="no-insights">لا توجد رؤى متاحة</div>';
            return;
        }

        container.innerHTML = insightsArray.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <h4>${insight.title}</h4>
                    <span class="insight-value ${insight.trend}">${insight.value}</span>
                </div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `).join('');
    }

    showLoading() {
        // Show loading state for dashboard
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span class="btn-icon">⏳</span> جاري التحديث...';
        }
    }

    hideLoading() {
        // Hide loading state
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> تحديث البيانات';
        }
    }

    startAutoRefresh() {
        // Refresh dashboard every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Quick action methods
    openQuickSale() {
        // Navigate to sales page and open quick sale modal
        window.app.navigateToPage('sales');
        setTimeout(() => {
            const quickSaleBtn = document.getElementById('quick-sale-btn');
            if (quickSaleBtn) {
                quickSaleBtn.click();
            }
        }, 100);
    }

    openAddInventory() {
        // Navigate to inventory page and open add item modal
        window.app.navigateToPage('inventory');
        setTimeout(() => {
            const addItemBtn = document.getElementById('add-item-btn');
            if (addItemBtn) {
                addItemBtn.click();
            }
        }, 100);
    }

    openAddCustomer() {
        // Navigate to customers page and open add customer modal
        window.app.navigateToPage('customers');
        setTimeout(() => {
            const addCustomerBtn = document.getElementById('add-customer-btn');
            if (addCustomerBtn) {
                addCustomerBtn.click();
            }
        }, 100);
    }

    openAddSupplier() {
        // Navigate to suppliers page and open add supplier modal
        window.app.navigateToPage('suppliers');
        setTimeout(() => {
            const addSupplierBtn = document.getElementById('add-supplier-btn');
            if (addSupplierBtn) {
                addSupplierBtn.click();
            }
        }, 100);
    }

    openImportExcel() {
        // Navigate to inventory page and open import modal
        window.app.navigateToPage('inventory');
        setTimeout(() => {
            const importExcelBtn = document.getElementById('import-excel-btn');
            if (importExcelBtn) {
                importExcelBtn.click();
            }
        }, 100);
    }

    openGenerateReport() {
        // Navigate to reports page
        window.app.navigateToPage('reports');
    }

    async exportDashboard() {
        try {
            // Create a comprehensive dashboard report
            const reportData = {
                timestamp: new Date().toISOString(),
                inventory: await this.loadInventoryStats(),
                sales: await this.loadSalesStats(),
                customers: await this.loadCustomerStats(),
                suppliers: await this.loadSupplierStats(),
                recentActivity: await this.loadRecentActivity(),
                lowStockAlerts: await this.loadLowStockAlerts()
            };

            // Export as JSON
            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            uiManager.showNotification('تم تصدير تقرير لوحة التحكم بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting dashboard:', error);
            uiManager.showNotification('خطأ في تصدير التقرير', 'error');
        }
    }

    destroy() {
        this.stopAutoRefresh();
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
}

// Export singleton instance
const dashboardManager = new DashboardManager();
module.exports = dashboardManager;
