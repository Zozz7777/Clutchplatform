// Reports Manager for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const uiManager = require('./ui');

class ReportsManager {
    constructor() {
        this.currentReport = null;
        this.reportData = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDefaultReport();
    }

    setupEventListeners() {
        // Report type selection
        const reportTypeSelect = document.getElementById('report-type-select');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', (e) => {
                this.loadReport(e.target.value);
            });
        }

        // Export buttons
        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }
    }

    async loadDefaultReport() {
        const defaultReport = 'sales-summary';
        await this.loadReport(defaultReport);
    }

    async loadReport(reportType) {
        try {
            this.currentReport = reportType;
            this.showLoading();

            switch (reportType) {
                case 'sales-summary':
                    await this.loadSalesSummaryReport();
                    break;
                case 'inventory-status':
                    await this.loadInventoryStatusReport();
                    break;
                default:
                    throw new Error('Unknown report type');
            }

            this.hideLoading();
        } catch (error) {
            console.error('Error loading report:', error);
            uiManager.showNotification('خطأ في تحميل التقرير', 'error');
            this.hideLoading();
        }
    }

    async loadSalesSummaryReport() {
        const sales = await databaseManager.allQuery('SELECT * FROM sales');
        
        const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const totalTransactions = sales.length;

        this.reportData = {
            type: 'sales-summary',
            title: 'تقرير ملخص المبيعات',
            summary: { totalSales, totalTransactions },
            data: sales
        };

        this.renderSalesSummaryReport();
    }

    async loadInventoryStatusReport() {
        const inventory = await databaseManager.allQuery('SELECT * FROM inventory WHERE is_active = 1');
        
        const totalItems = inventory.length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.stock_quantity * item.unit_price), 0);

        this.reportData = {
            type: 'inventory-status',
            title: 'تقرير حالة المخزون',
            summary: { totalItems, totalValue },
            data: inventory
        };

        this.renderInventoryStatusReport();
    }

    renderSalesSummaryReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const { summary, data } = this.reportData;

        container.innerHTML = `
            <div class="report-header">
                <h2>${this.reportData.title}</h2>
            </div>
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="card-value">${uiManager.formatCurrency(summary.totalSales)}</div>
                        <div class="card-label">إجمالي المبيعات</div>
                    </div>
                    <div class="summary-card">
                        <div class="card-value">${summary.totalTransactions}</div>
                        <div class="card-label">عدد المعاملات</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderInventoryStatusReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const { summary } = this.reportData;

        container.innerHTML = `
            <div class="report-header">
                <h2>${this.reportData.title}</h2>
            </div>
            <div class="report-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="card-value">${summary.totalItems}</div>
                        <div class="card-label">إجمالي الأصناف</div>
                    </div>
                    <div class="summary-card">
                        <div class="card-value">${uiManager.formatCurrency(summary.totalValue)}</div>
                        <div class="card-label">إجمالي قيمة المخزون</div>
                    </div>
                </div>
            </div>
        `;
    }

    showLoading() {
        const container = document.getElementById('report-content');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">جاري تحميل التقرير...</div>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is hidden when content is rendered
    }

    async exportToExcel() {
        try {
            if (!this.reportData) {
                uiManager.showNotification('لا يوجد تقرير للتصدير', 'error');
                return;
            }

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(this.reportData.data);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'التقرير');
            
            const fileName = `${this.reportData.title}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير التقرير بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting report:', error);
            uiManager.showNotification('خطأ في تصدير التقرير', 'error');
        }
    }
}

// Export singleton instance
const reportsManager = new ReportsManager();
module.exports = reportsManager;