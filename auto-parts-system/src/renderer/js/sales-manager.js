// Sales Management System for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');
const syncManager = require('./sync-manager');

class SalesManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalSales = 0;
        this.currentFilters = {};
        this.sortField = 'created_at';
        this.sortDirection = 'desc';
        this.currentSale = {
            items: [],
            customer: null,
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            totalAmount: 0,
            paymentMethod: '',
            notes: ''
        };
        this.taxRate = 0.14; // 14% VAT
        
        this.init();
    }

    async init() {
        await this.loadCustomers();
        await this.loadSalesData();
        this.setupEventListeners();
        await this.updateSalesStatistics();
    }

    setupEventListeners() {
        // New sale button
        const newSaleBtn = document.getElementById('new-sale-btn');
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => {
                this.openNewSaleModal();
            });
        }

        // Quick sale button
        const quickSaleBtn = document.getElementById('quick-sale-btn');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => {
                this.openQuickSaleModal();
            });
        }

        // Sales report button
        const salesReportBtn = document.getElementById('sales-report-btn');
        if (salesReportBtn) {
            salesReportBtn.addEventListener('click', () => {
                this.generateSalesReport();
            });
        }

        // Filter controls
        this.setupFilterEventListeners();
        
        // Pagination
        this.setupPaginationEventListeners();
        
        // Table sorting
        this.setupTableSorting();
        
        // Modal events
        this.setupModalEventListeners();
    }

    setupFilterEventListeners() {
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Date filters
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (dateFrom) {
            dateFrom.addEventListener('change', () => {
                this.currentFilters.date_from = dateFrom.value;
            });
        }
        
        if (dateTo) {
            dateTo.addEventListener('change', () => {
                this.currentFilters.date_to = dateTo.value;
            });
        }

        // Payment status filter
        const paymentStatusFilter = document.getElementById('payment-status-filter');
        if (paymentStatusFilter) {
            paymentStatusFilter.addEventListener('change', () => {
                this.currentFilters.payment_status = paymentStatusFilter.value;
            });
        }

        // Customer filter
        const customerFilter = document.getElementById('customer-filter');
        if (customerFilter) {
            customerFilter.addEventListener('change', () => {
                this.currentFilters.customer_id = customerFilter.value;
            });
        }
    }

    setupPaginationEventListeners() {
        const prevPageBtn = document.getElementById('sales-prev-page-btn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadSalesData();
                }
            });
        }

        const nextPageBtn = document.getElementById('sales-next-page-btn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalSales / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadSalesData();
                }
            });
        }
    }

    setupTableSorting() {
        const table = document.getElementById('sales-table');
        if (table) {
            const sortableHeaders = table.querySelectorAll('.sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const field = header.dataset.sort;
                    this.sortTable(field);
                });
            });
        }
    }

    setupModalEventListeners() {
        // New sale modal
        const newSaleModal = document.getElementById('new-sale-modal');
        const newSaleModalClose = document.getElementById('new-sale-modal-close');
        const newSaleCancel = document.getElementById('new-sale-cancel');
        const newSaleSave = document.getElementById('new-sale-save');

        if (newSaleModalClose) {
            newSaleModalClose.addEventListener('click', () => {
                this.closeNewSaleModal();
            });
        }

        if (newSaleCancel) {
            newSaleCancel.addEventListener('click', () => {
                this.closeNewSaleModal();
            });
        }

        if (newSaleSave) {
            newSaleSave.addEventListener('click', () => {
                this.saveSale();
            });
        }

        // Quick sale modal
        const quickSaleModal = document.getElementById('quick-sale-modal');
        const quickSaleModalClose = document.getElementById('quick-sale-modal-close');
        const quickSaleCancel = document.getElementById('quick-sale-cancel');
        const quickSaleComplete = document.getElementById('quick-sale-complete');

        if (quickSaleModalClose) {
            quickSaleModalClose.addEventListener('click', () => {
                this.closeQuickSaleModal();
            });
        }

        if (quickSaleCancel) {
            quickSaleCancel.addEventListener('click', () => {
                this.closeQuickSaleModal();
            });
        }

        if (quickSaleComplete) {
            quickSaleComplete.addEventListener('click', () => {
                this.completeQuickSale();
            });
        }

        // Sale details modal
        const saleDetailsModal = document.getElementById('sale-details-modal');
        const saleDetailsModalClose = document.getElementById('sale-details-modal-close');
        const saleDetailsClose = document.getElementById('sale-details-close');
        const printReceiptBtn = document.getElementById('print-receipt-btn');

        if (saleDetailsModalClose) {
            saleDetailsModalClose.addEventListener('click', () => {
                this.closeSaleDetailsModal();
            });
        }

        if (saleDetailsClose) {
            saleDetailsClose.addEventListener('click', () => {
                this.closeSaleDetailsModal();
            });
        }

        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => {
                this.printReceipt();
            });
        }

        // Sale form events
        this.setupSaleFormEvents();
    }

    setupSaleFormEvents() {
        // Item search
        const itemSearch = document.getElementById('item-search');
        if (itemSearch) {
            itemSearch.addEventListener('input', (e) => {
                this.searchItems(e.target.value);
            });
        }

        // Add item to sale
        const addItemToSaleBtn = document.getElementById('add-item-to-sale-btn');
        if (addItemToSaleBtn) {
            addItemToSaleBtn.addEventListener('click', () => {
                this.addItemToSale();
            });
        }

        // Discount percentage
        const discountPercentage = document.getElementById('discount-percentage');
        if (discountPercentage) {
            discountPercentage.addEventListener('input', (e) => {
                this.calculateDiscount(e.target.value);
            });
        }

        // Quick sale barcode
        const quickItemBarcode = document.getElementById('quick-item-barcode');
        if (quickItemBarcode) {
            quickItemBarcode.addEventListener('input', (e) => {
                this.handleQuickSaleBarcode(e.target.value);
            });
        }

        // Quick sale quantity
        const quickItemQuantity = document.getElementById('quick-item-quantity');
        if (quickItemQuantity) {
            quickItemQuantity.addEventListener('input', (e) => {
                this.updateQuickSaleTotal();
            });
        }
    }

    async loadCustomers() {
        try {
            const customers = await databaseManager.allQuery(
                'SELECT * FROM customers ORDER BY name'
            );
            
            const customerFilter = document.getElementById('customer-filter');
            const saleCustomer = document.getElementById('sale-customer');
            
            if (customerFilter) {
                customerFilter.innerHTML = '<option value="">جميع العملاء</option>';
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = customer.name;
                    customerFilter.appendChild(option);
                });
            }

            if (saleCustomer) {
                saleCustomer.innerHTML = '<option value="">عميل نقدي</option>';
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = customer.name;
                    saleCustomer.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    async loadSalesData() {
        try {
            // Show loading state
            const tbody = document.getElementById('sales-tbody');
            if (tbody) {
                uiManager.showLoading(tbody, 'جاري تحميل المبيعات...');
            }

            // Build query
            let sql = `
                SELECT s.*, c.name as customer_name_full
                FROM sales s
                LEFT JOIN customers c ON s.customer_id = c.id
                WHERE 1=1
            `;
            const params = [];

            // Apply filters
            if (this.currentFilters.date_from) {
                sql += ' AND DATE(s.created_at) >= ?';
                params.push(this.currentFilters.date_from);
            }

            if (this.currentFilters.date_to) {
                sql += ' AND DATE(s.created_at) <= ?';
                params.push(this.currentFilters.date_to);
            }

            if (this.currentFilters.payment_status) {
                sql += ' AND s.payment_status = ?';
                params.push(this.currentFilters.payment_status);
            }

            if (this.currentFilters.customer_id) {
                sql += ' AND s.customer_id = ?';
                params.push(this.currentFilters.customer_id);
            }

            // Get total count
            const countSql = sql.replace('SELECT s.*, c.name as customer_name_full', 'SELECT COUNT(*) as count');
            const countResult = await databaseManager.getQuery(countSql, params);
            this.totalSales = countResult.count;

            // Add sorting
            sql += ` ORDER BY s.${this.sortField} ${this.sortDirection.toUpperCase()}`;

            // Add pagination
            const offset = (this.currentPage - 1) * this.itemsPerPage;
            sql += ` LIMIT ${this.itemsPerPage} OFFSET ${offset}`;

            const sales = await databaseManager.allQuery(sql, params);

            // Render table
            this.renderSalesTable(sales);

            // Update pagination
            this.updatePagination();

        } catch (error) {
            console.error('Error loading sales data:', error);
            uiManager.showNotification('خطأ في تحميل بيانات المبيعات', 'error');
        }
    }

    renderSalesTable(sales) {
        const tbody = document.getElementById('sales-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد مبيعات</td></tr>';
            return;
        }

        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.invoice_number}</td>
                <td>${sale.customer_name || sale.customer_name_full || 'عميل نقدي'}</td>
                <td>${uiManager.formatCurrency(sale.total_amount)}</td>
                <td>${this.getPaymentMethodText(sale.payment_method)}</td>
                <td>
                    <span class="status-badge ${sale.payment_status}">${this.getPaymentStatusText(sale.payment_status)}</span>
                </td>
                <td>${uiManager.formatDateTime(sale.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="salesManager.viewSaleDetails(${sale.id})" title="عرض التفاصيل">
                            <span class="btn-icon">👁️</span>
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="salesManager.printSaleReceipt(${sale.id})" title="طباعة الفاتورة">
                            <span class="btn-icon">🖨️</span>
                        </button>
                        ${sale.payment_status === 'pending' ? `
                            <button class="btn btn-small btn-success" onclick="salesManager.markAsPaid(${sale.id})" title="تم الدفع">
                                <span class="btn-icon">✅</span>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async updateSalesStatistics() {
        try {
            // Today's sales amount
            const todaySalesResult = await databaseManager.getQuery(
                'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(created_at) = DATE("now")'
            );
            const todaySalesAmount = document.getElementById('today-sales-amount');
            if (todaySalesAmount) todaySalesAmount.textContent = uiManager.formatCurrency(todaySalesResult.total);

            // Today's sales count
            const todaySalesCountResult = await databaseManager.getQuery(
                'SELECT COUNT(*) as count FROM sales WHERE DATE(created_at) = DATE("now")'
            );
            const todaySalesCount = document.getElementById('today-sales-count');
            if (todaySalesCount) todaySalesCount.textContent = todaySalesCountResult.count;

            // Today's customers
            const todayCustomersResult = await databaseManager.getQuery(
                'SELECT COUNT(DISTINCT customer_id) as count FROM sales WHERE DATE(created_at) = DATE("now") AND customer_id IS NOT NULL'
            );
            const todayCustomers = document.getElementById('today-customers');
            if (todayCustomers) todayCustomers.textContent = todayCustomersResult.count;

            // Sales growth (compared to yesterday)
            const yesterdaySalesResult = await databaseManager.getQuery(
                'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(created_at) = DATE("now", "-1 day")'
            );
            const salesGrowth = document.getElementById('sales-growth');
            if (salesGrowth) {
                const growth = yesterdaySalesResult.total > 0 ? 
                    ((todaySalesResult.total - yesterdaySalesResult.total) / yesterdaySalesResult.total * 100) : 0;
                salesGrowth.textContent = `${growth.toFixed(1)}%`;
                salesGrowth.className = growth >= 0 ? 'positive' : 'negative';
            }

        } catch (error) {
            console.error('Error updating sales statistics:', error);
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalSales / this.itemsPerPage);
        const paginationInfo = document.getElementById('sales-pagination-info');
        const prevPageBtn = document.getElementById('sales-prev-page-btn');
        const nextPageBtn = document.getElementById('sales-next-page-btn');
        const pageNumbers = document.getElementById('sales-page-numbers');

        // Update pagination info
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.totalSales);
            paginationInfo.textContent = `عرض ${start}-${end} من ${this.totalSales} مبيعة`;
        }

        // Update navigation buttons
        if (prevPageBtn) {
            prevPageBtn.disabled = this.currentPage <= 1;
        }

        if (nextPageBtn) {
            nextPageBtn.disabled = this.currentPage >= totalPages;
        }

        // Update page numbers
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn btn-small ${i === this.currentPage ? 'btn-primary' : 'btn-outline'}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.loadSalesData();
                });
                pageNumbers.appendChild(pageBtn);
            }
        }
    }

    sortTable(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'desc';
        }
        this.loadSalesData();
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadSalesData();
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Clear form inputs
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const paymentStatusFilter = document.getElementById('payment-status-filter');
        const customerFilter = document.getElementById('customer-filter');

        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        if (paymentStatusFilter) paymentStatusFilter.value = '';
        if (customerFilter) customerFilter.value = '';

        this.loadSalesData();
    }

    openNewSaleModal() {
        const modal = document.getElementById('new-sale-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetSaleForm();
        }
    }

    closeNewSaleModal() {
        const modal = document.getElementById('new-sale-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetSaleForm() {
        this.currentSale = {
            items: [],
            customer: null,
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            totalAmount: 0,
            paymentMethod: '',
            notes: ''
        };

        // Clear form
        const form = document.getElementById('new-sale-modal');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'number') {
                    input.value = input.id === 'discount-percentage' ? '0' : '1';
                } else {
                    input.value = '';
                }
            });
        }

        // Clear sale items
        const saleItems = document.getElementById('sale-items');
        if (saleItems) {
            saleItems.innerHTML = '';
        }

        this.updateSaleSummary();
    }

    async searchItems(query) {
        if (!query || query.trim() === '') {
            return;
        }

        try {
            const items = await databaseManager.getInventoryItems({
                search: query,
                limit: 10
            });

            this.showItemSearchResults(items);
        } catch (error) {
            console.error('Error searching items:', error);
        }
    }

    showItemSearchResults(items) {
        // Implementation for showing search results
        console.log('Search results:', items);
    }

    addItemToSale() {
        // Implementation for adding item to sale
        console.log('Add item to sale');
    }

    calculateDiscount(percentage) {
        const discountAmount = (this.currentSale.subtotal * percentage) / 100;
        this.currentSale.discountAmount = discountAmount;
        this.currentSale.taxAmount = (this.currentSale.subtotal - discountAmount) * this.taxRate;
        this.currentSale.totalAmount = this.currentSale.subtotal - discountAmount + this.currentSale.taxAmount;
        
        this.updateSaleSummary();
    }

    updateSaleSummary() {
        const subtotalElement = document.getElementById('subtotal-amount');
        const taxElement = document.getElementById('tax-amount');
        const discountElement = document.getElementById('discount-amount');
        const totalElement = document.getElementById('total-amount');

        if (subtotalElement) subtotalElement.textContent = uiManager.formatCurrency(this.currentSale.subtotal);
        if (taxElement) taxElement.textContent = uiManager.formatCurrency(this.currentSale.taxAmount);
        if (discountElement) discountElement.textContent = uiManager.formatCurrency(this.currentSale.discountAmount);
        if (totalElement) totalElement.textContent = uiManager.formatCurrency(this.currentSale.totalAmount);
    }

    async saveSale() {
        try {
            // Validate form
            const paymentMethod = document.getElementById('payment-method').value;
            if (!paymentMethod) {
                uiManager.showNotification('يرجى اختيار طريقة الدفع', 'error');
                return;
            }

            if (this.currentSale.items.length === 0) {
                uiManager.showNotification('يرجى إضافة أصناف للبيع', 'error');
                return;
            }

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber();

            // Prepare sale data
            const saleData = {
                invoice_number: invoiceNumber,
                customer_id: document.getElementById('sale-customer').value || null,
                customer_name: document.getElementById('sale-customer-name').value || null,
                customer_phone: document.getElementById('sale-customer-phone').value || null,
                subtotal: this.currentSale.subtotal,
                tax_amount: this.currentSale.taxAmount,
                discount_amount: this.currentSale.discountAmount,
                total_amount: this.currentSale.totalAmount,
                payment_method: paymentMethod,
                payment_status: 'paid',
                notes: document.getElementById('sale-notes').value || '',
                items: this.currentSale.items
            };

            // Save to database
            const result = await databaseManager.createSale(saleData);

            // Sync with backend
            await syncManager.queueSync('sales', 'create', result.id, saleData);

            uiManager.showNotification('تم حفظ البيع بنجاح', 'success');
            this.closeNewSaleModal();
            this.loadSalesData();
            this.updateSalesStatistics();

        } catch (error) {
            console.error('Error saving sale:', error);
            uiManager.showNotification('خطأ في حفظ البيع', 'error');
        }
    }

    async generateInvoiceNumber() {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Get today's sales count
        const countResult = await databaseManager.getQuery(
            'SELECT COUNT(*) as count FROM sales WHERE DATE(created_at) = DATE("now")'
        );
        
        const sequence = (countResult.count + 1).toString().padStart(4, '0');
        return `INV-${dateStr}-${sequence}`;
    }

    getPaymentMethodText(method) {
        const methods = {
            'cash': 'نقدي',
            'visa': 'فيزا',
            'instapay': 'إنستاباي',
            'vodafone_cash': 'فودافون كاش'
        };
        return methods[method] || method;
    }

    getPaymentStatusText(status) {
        const statuses = {
            'paid': 'مدفوع',
            'pending': 'في الانتظار',
            'cancelled': 'ملغي',
            'refunded': 'مسترد'
        };
        return statuses[status] || status;
    }

    async viewSaleDetails(saleId) {
        try {
            const sale = await databaseManager.getQuery(
                'SELECT * FROM sales WHERE id = ?',
                [saleId]
            );

            const saleItems = await databaseManager.allQuery(
                'SELECT * FROM sales_items WHERE sale_id = ?',
                [saleId]
            );

            this.showSaleDetails(sale, saleItems);
        } catch (error) {
            console.error('Error loading sale details:', error);
            uiManager.showNotification('خطأ في تحميل تفاصيل البيع', 'error');
        }
    }

    showSaleDetails(sale, items) {
        const modal = document.getElementById('sale-details-modal');
        const content = document.getElementById('sale-details-content');

        if (content) {
            content.innerHTML = `
                <div class="sale-details-info">
                    <div class="detail-row">
                        <span class="detail-label">رقم الفاتورة:</span>
                        <span class="detail-value">${sale.invoice_number}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">العميل:</span>
                        <span class="detail-value">${sale.customer_name || 'عميل نقدي'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">التاريخ:</span>
                        <span class="detail-value">${uiManager.formatDateTime(sale.created_at)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">طريقة الدفع:</span>
                        <span class="detail-value">${this.getPaymentMethodText(sale.payment_method)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">حالة الدفع:</span>
                        <span class="detail-value">${this.getPaymentStatusText(sale.payment_status)}</span>
                    </div>
                </div>
                
                <div class="sale-items-details">
                    <h4>الأصناف</h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الصنف</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.item_name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${uiManager.formatCurrency(item.unit_price)}</td>
                                    <td>${uiManager.formatCurrency(item.total_price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="sale-summary-details">
                    <div class="summary-row">
                        <span class="summary-label">المجموع الفرعي:</span>
                        <span class="summary-value">${uiManager.formatCurrency(sale.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">الضريبة:</span>
                        <span class="summary-value">${uiManager.formatCurrency(sale.tax_amount)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">الخصم:</span>
                        <span class="summary-value">${uiManager.formatCurrency(sale.discount_amount)}</span>
                    </div>
                    <div class="summary-row total">
                        <span class="summary-label">المجموع الكلي:</span>
                        <span class="summary-value">${uiManager.formatCurrency(sale.total_amount)}</span>
                    </div>
                </div>
            `;
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeSaleDetailsModal() {
        const modal = document.getElementById('sale-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async printSaleReceipt(saleId) {
        try {
            const sale = await databaseManager.getQuery(
                'SELECT * FROM sales WHERE id = ?',
                [saleId]
            );

            const saleItems = await databaseManager.allQuery(
                'SELECT * FROM sales_items WHERE sale_id = ?',
                [saleId]
            );

            this.printReceipt(sale, saleItems);
        } catch (error) {
            console.error('Error printing receipt:', error);
            uiManager.showNotification('خطأ في طباعة الفاتورة', 'error');
        }
    }

    printReceipt(sale, items) {
        // Implementation for printing receipt
        console.log('Print receipt:', sale, items);
    }

    async markAsPaid(saleId) {
        try {
            await databaseManager.runQuery(
                'UPDATE sales SET payment_status = ? WHERE id = ?',
                ['paid', saleId]
            );

            uiManager.showNotification('تم تحديث حالة الدفع', 'success');
            this.loadSalesData();
        } catch (error) {
            console.error('Error marking sale as paid:', error);
            uiManager.showNotification('خطأ في تحديث حالة الدفع', 'error');
        }
    }

    generateSalesReport() {
        // Implementation for generating sales report
        console.log('Generate sales report');
    }

    // Quick sale methods
    openQuickSaleModal() {
        const modal = document.getElementById('quick-sale-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetQuickSaleForm();
        }
    }

    closeQuickSaleModal() {
        const modal = document.getElementById('quick-sale-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetQuickSaleForm() {
        const barcodeInput = document.getElementById('quick-item-barcode');
        const quantityInput = document.getElementById('quick-item-quantity');
        const paymentMethodSelect = document.getElementById('quick-payment-method');

        if (barcodeInput) barcodeInput.value = '';
        if (quantityInput) quantityInput.value = '1';
        if (paymentMethodSelect) paymentMethodSelect.value = 'cash';

        this.updateQuickSaleDisplay();
    }

    async handleQuickSaleBarcode(barcode) {
        if (!barcode || barcode.length < 3) {
            this.updateQuickSaleDisplay();
            return;
        }

        try {
            const item = await databaseManager.getQuery(
                'SELECT * FROM inventory WHERE barcode = ? AND is_active = 1',
                [barcode]
            );

            if (item) {
                this.currentQuickSaleItem = item;
                this.updateQuickSaleDisplay();
            } else {
                this.currentQuickSaleItem = null;
                this.updateQuickSaleDisplay();
            }
        } catch (error) {
            console.error('Error handling quick sale barcode:', error);
        }
    }

    updateQuickSaleDisplay() {
        const itemName = document.getElementById('quick-item-name');
        const itemPrice = document.getElementById('quick-item-price');
        const itemQuantity = document.getElementById('quick-item-quantity-display');
        const totalAmount = document.getElementById('quick-total-amount');

        if (this.currentQuickSaleItem) {
            if (itemName) itemName.textContent = this.currentQuickSaleItem.name;
            if (itemPrice) itemPrice.textContent = uiManager.formatCurrency(this.currentQuickSaleItem.unit_price);
            
            const quantity = parseInt(document.getElementById('quick-item-quantity')?.value || '1');
            if (itemQuantity) itemQuantity.textContent = quantity;
            
            const total = this.currentQuickSaleItem.unit_price * quantity;
            if (totalAmount) totalAmount.textContent = uiManager.formatCurrency(total);
        } else {
            if (itemName) itemName.textContent = '-';
            if (itemPrice) itemPrice.textContent = '0.00';
            if (itemQuantity) itemQuantity.textContent = '1';
            if (totalAmount) totalAmount.textContent = '0.00';
        }
    }

    updateQuickSaleTotal() {
        this.updateQuickSaleDisplay();
    }

    async completeQuickSale() {
        if (!this.currentQuickSaleItem) {
            uiManager.showNotification('يرجى مسح باركود صحيح', 'error');
            return;
        }

        try {
            const quantity = parseInt(document.getElementById('quick-item-quantity')?.value || '1');
            const paymentMethod = document.getElementById('quick-payment-method')?.value || 'cash';

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber();

            // Prepare sale data
            const saleData = {
                invoice_number: invoiceNumber,
                customer_id: null,
                customer_name: null,
                customer_phone: null,
                subtotal: this.currentQuickSaleItem.unit_price * quantity,
                tax_amount: (this.currentQuickSaleItem.unit_price * quantity) * this.taxRate,
                discount_amount: 0,
                total_amount: (this.currentQuickSaleItem.unit_price * quantity) * (1 + this.taxRate),
                payment_method: paymentMethod,
                payment_status: 'paid',
                notes: 'بيع سريع',
                items: [{
                    inventory_id: this.currentQuickSaleItem.id,
                    item_name: this.currentQuickSaleItem.name,
                    quantity: quantity,
                    unit_price: this.currentQuickSaleItem.unit_price,
                    total_price: this.currentQuickSaleItem.unit_price * quantity
                }]
            };

            // Save to database
            const result = await databaseManager.createSale(saleData);

            // Sync with backend
            await syncManager.queueSync('sales', 'create', result.id, saleData);

            uiManager.showNotification('تم إتمام البيع السريع بنجاح', 'success');
            this.closeQuickSaleModal();
            this.loadSalesData();
            this.updateSalesStatistics();

        } catch (error) {
            console.error('Error completing quick sale:', error);
            uiManager.showNotification('خطأ في إتمام البيع السريع', 'error');
        }
    }
}

// Export singleton instance
const salesManager = new SalesManager();
module.exports = salesManager;
