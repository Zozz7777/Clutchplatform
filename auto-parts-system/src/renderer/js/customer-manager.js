// Customer Management System for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');
const syncManager = require('./sync-manager');

class CustomerManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalCustomers = 0;
        this.currentFilters = {};
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.selectedCustomer = null;
        
        this.init();
    }

    async init() {
        await this.loadCustomersData();
        this.setupEventListeners();
        await this.updateCustomerStatistics();
    }

    setupEventListeners() {
        // Add customer button
        const addCustomerBtn = document.getElementById('add-customer-btn');
        if (addCustomerBtn) {
            addCustomerBtn.addEventListener('click', () => {
                this.openAddCustomerModal();
            });
        }

        // Import customers button
        const importCustomersBtn = document.getElementById('import-customers-btn');
        if (importCustomersBtn) {
            importCustomersBtn.addEventListener('click', () => {
                this.importCustomers();
            });
        }

        // Export customers button
        const exportCustomersBtn = document.getElementById('export-customers-btn');
        if (exportCustomersBtn) {
            exportCustomersBtn.addEventListener('click', () => {
                this.exportCustomers();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadCustomersData();
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
        const customerTypeFilter = document.getElementById('customer-type-filter');
        if (customerTypeFilter) {
            customerTypeFilter.addEventListener('change', (e) => {
                this.currentFilters.customer_type = e.target.value;
                this.currentPage = 1;
                this.loadCustomersData();
            });
        }

        const customerStatusFilter = document.getElementById('customer-status-filter');
        if (customerStatusFilter) {
            customerStatusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadCustomersData();
            });
        }

        const customerLocationFilter = document.getElementById('customer-location-filter');
        if (customerLocationFilter) {
            customerLocationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.currentPage = 1;
                this.loadCustomersData();
            });
        }

        const clearFiltersBtn = document.getElementById('clear-customer-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    setupPaginationEventListeners() {
        const prevPageBtn = document.getElementById('customers-prev-page-btn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadCustomersData();
                }
            });
        }

        const nextPageBtn = document.getElementById('customers-next-page-btn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalCustomers / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadCustomersData();
                }
            });
        }
    }

    setupTableSorting() {
        const table = document.getElementById('customers-table');
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
        // Customer modal
        const customerModal = document.getElementById('customer-modal');
        const customerModalClose = document.getElementById('customer-modal-close');
        const customerModalCancel = document.getElementById('customer-modal-cancel');
        const customerModalSave = document.getElementById('customer-modal-save');

        if (customerModalClose) {
            customerModalClose.addEventListener('click', () => {
                this.closeCustomerModal();
            });
        }

        if (customerModalCancel) {
            customerModalCancel.addEventListener('click', () => {
                this.closeCustomerModal();
            });
        }

        if (customerModalSave) {
            customerModalSave.addEventListener('click', () => {
                this.saveCustomer();
            });
        }

        // Customer details modal
        const customerDetailsModal = document.getElementById('customer-details-modal');
        const customerDetailsModalClose = document.getElementById('customer-details-modal-close');
        const customerDetailsClose = document.getElementById('customer-details-close');
        const customerDetailsEdit = document.getElementById('customer-details-edit');

        if (customerDetailsModalClose) {
            customerDetailsModalClose.addEventListener('click', () => {
                this.closeCustomerDetailsModal();
            });
        }

        if (customerDetailsClose) {
            customerDetailsClose.addEventListener('click', () => {
                this.closeCustomerDetailsModal();
            });
        }

        if (customerDetailsEdit) {
            customerDetailsEdit.addEventListener('click', () => {
                this.editCustomer();
            });
        }

        // Customer sales modal
        const customerSalesModal = document.getElementById('customer-sales-modal');
        const customerSalesModalClose = document.getElementById('customer-sales-modal-close');
        const customerSalesClose = document.getElementById('customer-sales-close');

        if (customerSalesModalClose) {
            customerSalesModalClose.addEventListener('click', () => {
                this.closeCustomerSalesModal();
            });
        }

        if (customerSalesClose) {
            customerSalesClose.addEventListener('click', () => {
                this.closeCustomerSalesModal();
            });
        }
    }

    async loadCustomersData() {
        try {
            // Show loading state
            const tbody = document.getElementById('customers-tbody');
            if (tbody) {
                uiManager.showLoading(tbody, 'جاري تحميل العملاء...');
            }

            // Build query
            let sql = `
                SELECT c.*, 
                       COALESCE(SUM(s.total_amount), 0) as total_purchases,
                       MAX(s.created_at) as last_purchase
                FROM customers c
                LEFT JOIN sales s ON c.id = s.customer_id
                WHERE 1=1
            `;
            const params = [];

            // Apply filters
            if (this.currentFilters.search) {
                sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
                const searchTerm = `%${this.currentFilters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (this.currentFilters.customer_type) {
                sql += ' AND c.customer_type = ?';
                params.push(this.currentFilters.customer_type);
            }

            if (this.currentFilters.status) {
                sql += ' AND c.status = ?';
                params.push(this.currentFilters.status);
            }

            if (this.currentFilters.location) {
                sql += ' AND c.city = ?';
                params.push(this.currentFilters.location);
            }

            // Group by customer
            sql += ' GROUP BY c.id';

            // Get total count
            const countSql = sql.replace('SELECT c.*, COALESCE(SUM(s.total_amount), 0) as total_purchases, MAX(s.created_at) as last_purchase', 'SELECT COUNT(DISTINCT c.id) as count');
            const countResult = await databaseManager.getQuery(countSql, params);
            this.totalCustomers = countResult.count;

            // Add sorting
            sql += ` ORDER BY c.${this.sortField} ${this.sortDirection.toUpperCase()}`;

            // Add pagination
            const offset = (this.currentPage - 1) * this.itemsPerPage;
            sql += ` LIMIT ${this.itemsPerPage} OFFSET ${offset}`;

            const customers = await databaseManager.allQuery(sql, params);

            // Render table
            this.renderCustomersTable(customers);

            // Update pagination
            this.updatePagination();

        } catch (error) {
            console.error('Error loading customers data:', error);
            uiManager.showNotification('خطأ في تحميل بيانات العملاء', 'error');
        }
    }

    renderCustomersTable(customers) {
        const tbody = document.getElementById('customers-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد عملاء</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        ${customer.is_vip ? '<span class="vip-badge">VIP</span>' : ''}
                    </div>
                </td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.email || '-'}</td>
                <td>${this.getCustomerTypeText(customer.customer_type)}</td>
                <td>${uiManager.formatCurrency(customer.total_purchases || 0)}</td>
                <td>${customer.last_purchase ? uiManager.formatDate(customer.last_purchase) : '-'}</td>
                <td>
                    <span class="status-badge ${customer.status}">${this.getCustomerStatusText(customer.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="customerManager.viewCustomerDetails(${customer.id})" title="عرض التفاصيل">
                            <span class="btn-icon">👁️</span>
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="customerManager.viewCustomerSales(${customer.id})" title="تاريخ المبيعات">
                            <span class="btn-icon">📊</span>
                        </button>
                        <button class="btn btn-small btn-success" onclick="customerManager.editCustomer(${customer.id})" title="تعديل">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="customerManager.deleteCustomer(${customer.id})" title="حذف">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async updateCustomerStatistics() {
        try {
            // Total customers
            const totalCustomersResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM customers WHERE is_active = 1');
            const totalCustomersCount = document.getElementById('total-customers-count');
            if (totalCustomersCount) totalCustomersCount.textContent = totalCustomersResult.count;

            // Total customer sales
            const totalCustomerSalesResult = await databaseManager.getQuery(
                'SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE customer_id IS NOT NULL'
            );
            const totalCustomerSales = document.getElementById('total-customer-sales');
            if (totalCustomerSales) totalCustomerSales.textContent = uiManager.formatCurrency(totalCustomerSalesResult.total);

            // New customers today
            const newCustomersTodayResult = await databaseManager.getQuery(
                'SELECT COUNT(*) as count FROM customers WHERE DATE(created_at) = DATE("now")'
            );
            const newCustomersToday = document.getElementById('new-customers-today');
            if (newCustomersToday) newCustomersToday.textContent = newCustomersTodayResult.count;

            // VIP customers
            const vipCustomersResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM customers WHERE is_vip = 1 AND is_active = 1');
            const vipCustomersCount = document.getElementById('vip-customers-count');
            if (vipCustomersCount) vipCustomersCount.textContent = vipCustomersResult.count;

        } catch (error) {
            console.error('Error updating customer statistics:', error);
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalCustomers / this.itemsPerPage);
        const paginationInfo = document.getElementById('customers-pagination-info');
        const prevPageBtn = document.getElementById('customers-prev-page-btn');
        const nextPageBtn = document.getElementById('customers-next-page-btn');
        const pageNumbers = document.getElementById('customers-page-numbers');

        // Update pagination info
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.totalCustomers);
            paginationInfo.textContent = `عرض ${start}-${end} من ${this.totalCustomers} عميل`;
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
                    this.loadCustomersData();
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
            this.sortDirection = 'asc';
        }
        this.loadCustomersData();
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Clear form inputs
        const searchInput = document.getElementById('customer-search');
        const customerTypeFilter = document.getElementById('customer-type-filter');
        const customerStatusFilter = document.getElementById('customer-status-filter');
        const customerLocationFilter = document.getElementById('customer-location-filter');

        if (searchInput) searchInput.value = '';
        if (customerTypeFilter) customerTypeFilter.value = '';
        if (customerStatusFilter) customerStatusFilter.value = '';
        if (customerLocationFilter) customerLocationFilter.value = '';

        this.loadCustomersData();
    }

    openAddCustomerModal() {
        const modal = document.getElementById('customer-modal');
        const modalTitle = document.getElementById('customer-modal-title');
        const form = document.getElementById('customer-form');

        if (modalTitle) modalTitle.textContent = 'إضافة عميل جديد';
        if (form) form.reset();
        if (modal) modal.style.display = 'flex';

        this.selectedCustomer = null;
    }

    closeCustomerModal() {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'none';
    }

    async saveCustomer() {
        const form = document.getElementById('customer-form');
        if (!form) return;

        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = uiManager.validateForm(form);
        if (errors.length > 0) {
            uiManager.showFormErrors(form, errors);
            return;
        }

        try {
            // Convert checkbox values
            customerData.is_vip = document.getElementById('customer-is-vip').checked ? 1 : 0;
            customerData.is_active = document.getElementById('customer-is-active').checked ? 1 : 0;

            let result;
            if (this.selectedCustomer) {
                // Update existing customer
                result = await databaseManager.runQuery(
                    'UPDATE customers SET name = ?, customer_type = ?, phone = ?, email = ?, id_number = ?, birth_date = ?, address = ?, city = ?, area = ?, postal_code = ?, country = ?, occupation = ?, company = ?, credit_limit = ?, discount_percentage = ?, notes = ?, is_vip = ?, is_active = ? WHERE id = ?',
                    [
                        customerData.name, customerData.customer_type, customerData.phone, customerData.email,
                        customerData.id_number, customerData.birth_date, customerData.address, customerData.city,
                        customerData.area, customerData.postal_code, customerData.country, customerData.occupation,
                        customerData.company, customerData.credit_limit, customerData.discount_percentage,
                        customerData.notes, customerData.is_vip, customerData.is_active, this.selectedCustomer
                    ]
                );
                
                // Sync with backend
                await syncManager.queueSync('customers', 'update', this.selectedCustomer, customerData);
            } else {
                // Add new customer
                result = await databaseManager.runQuery(
                    'INSERT INTO customers (name, customer_type, phone, email, id_number, birth_date, address, city, area, postal_code, country, occupation, company, credit_limit, discount_percentage, notes, is_vip, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        customerData.name, customerData.customer_type, customerData.phone, customerData.email,
                        customerData.id_number, customerData.birth_date, customerData.address, customerData.city,
                        customerData.area, customerData.postal_code, customerData.country, customerData.occupation,
                        customerData.company, customerData.credit_limit, customerData.discount_percentage,
                        customerData.notes, customerData.is_vip, customerData.is_active
                    ]
                );
                
                // Sync with backend
                await syncManager.queueSync('customers', 'create', result.lastID, customerData);
            }

            uiManager.showNotification('تم حفظ العميل بنجاح', 'success');
            this.closeCustomerModal();
            this.loadCustomersData();
            this.updateCustomerStatistics();

        } catch (error) {
            console.error('Error saving customer:', error);
            uiManager.showNotification('خطأ في حفظ العميل', 'error');
        }
    }

    async editCustomer(customerId) {
        try {
            const customer = await databaseManager.getQuery(
                'SELECT * FROM customers WHERE id = ?',
                [customerId]
            );

            if (!customer) {
                uiManager.showNotification('العميل غير موجود', 'error');
                return;
            }

            this.selectedCustomer = customerId;
            this.openEditCustomerModal(customer);

        } catch (error) {
            console.error('Error loading customer for edit:', error);
            uiManager.showNotification('خطأ في تحميل بيانات العميل', 'error');
        }
    }

    openEditCustomerModal(customer) {
        const modal = document.getElementById('customer-modal');
        const modalTitle = document.getElementById('customer-modal-title');
        const form = document.getElementById('customer-form');

        if (modalTitle) modalTitle.textContent = 'تعديل العميل';
        if (form) {
            // Populate form with customer data
            Object.keys(customer).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = customer[key] == 1;
                    } else {
                        input.value = customer[key] || '';
                    }
                }
            });
        }
        if (modal) modal.style.display = 'flex';
    }

    async viewCustomerDetails(customerId) {
        try {
            const customer = await databaseManager.getQuery(
                'SELECT * FROM customers WHERE id = ?',
                [customerId]
            );

            if (!customer) {
                uiManager.showNotification('العميل غير موجود', 'error');
                return;
            }

            this.showCustomerDetails(customer);

        } catch (error) {
            console.error('Error loading customer details:', error);
            uiManager.showNotification('خطأ في تحميل تفاصيل العميل', 'error');
        }
    }

    showCustomerDetails(customer) {
        const modal = document.getElementById('customer-details-modal');
        const content = document.getElementById('customer-details-content');

        if (content) {
            content.innerHTML = `
                <div class="customer-details-info">
                    <div class="detail-row">
                        <span class="detail-label">الاسم:</span>
                        <span class="detail-value">${customer.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">نوع العميل:</span>
                        <span class="detail-value">${this.getCustomerTypeText(customer.customer_type)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">رقم الهاتف:</span>
                        <span class="detail-value">${customer.phone || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">البريد الإلكتروني:</span>
                        <span class="detail-value">${customer.email || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">رقم الهوية:</span>
                        <span class="detail-value">${customer.id_number || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">تاريخ الميلاد:</span>
                        <span class="detail-value">${customer.birth_date ? uiManager.formatDate(customer.birth_date) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">العنوان:</span>
                        <span class="detail-value">${customer.address || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">المدينة:</span>
                        <span class="detail-value">${customer.city || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">المنطقة:</span>
                        <span class="detail-value">${customer.area || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">المهنة:</span>
                        <span class="detail-value">${customer.occupation || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">الشركة:</span>
                        <span class="detail-value">${customer.company || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">حد الائتمان:</span>
                        <span class="detail-value">${customer.credit_limit ? uiManager.formatCurrency(customer.credit_limit) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">نسبة الخصم:</span>
                        <span class="detail-value">${customer.discount_percentage ? customer.discount_percentage + '%' : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ملاحظات:</span>
                        <span class="detail-value">${customer.notes || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">عميل VIP:</span>
                        <span class="detail-value">${customer.is_vip ? 'نعم' : 'لا'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">الحالة:</span>
                        <span class="detail-value">${this.getCustomerStatusText(customer.status)}</span>
                    </div>
                </div>
            `;
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeCustomerDetailsModal() {
        const modal = document.getElementById('customer-details-modal');
        if (modal) modal.style.display = 'none';
    }

    async viewCustomerSales(customerId) {
        try {
            const customer = await databaseManager.getQuery(
                'SELECT name FROM customers WHERE id = ?',
                [customerId]
            );

            if (!customer) {
                uiManager.showNotification('العميل غير موجود', 'error');
                return;
            }

            // Get customer sales
            const sales = await databaseManager.allQuery(
                'SELECT * FROM sales WHERE customer_id = ? ORDER BY created_at DESC',
                [customerId]
            );

            // Calculate statistics
            const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
            const avgPurchase = sales.length > 0 ? totalSales / sales.length : 0;
            const lastPurchase = sales.length > 0 ? sales[0].created_at : null;

            this.showCustomerSales(customer, sales, {
                totalSales,
                transactionsCount: sales.length,
                avgPurchase,
                lastPurchase
            });

        } catch (error) {
            console.error('Error loading customer sales:', error);
            uiManager.showNotification('خطأ في تحميل تاريخ مبيعات العميل', 'error');
        }
    }

    showCustomerSales(customer, sales, stats) {
        const modal = document.getElementById('customer-sales-modal');
        const content = document.getElementById('customer-sales-modal');
        
        if (content) {
            // Update statistics
            const totalSalesElement = document.getElementById('customer-total-sales');
            const transactionsCountElement = document.getElementById('customer-transactions-count');
            const avgPurchaseElement = document.getElementById('customer-avg-purchase');
            const lastPurchaseElement = document.getElementById('customer-last-purchase');

            if (totalSalesElement) totalSalesElement.textContent = uiManager.formatCurrency(stats.totalSales);
            if (transactionsCountElement) transactionsCountElement.textContent = stats.transactionsCount;
            if (avgPurchaseElement) avgPurchaseElement.textContent = uiManager.formatCurrency(stats.avgPurchase);
            if (lastPurchaseElement) lastPurchaseElement.textContent = stats.lastPurchase ? uiManager.formatDateTime(stats.lastPurchase) : '-';

            // Update sales table
            const tbody = document.getElementById('customer-sales-tbody');
            if (tbody) {
                tbody.innerHTML = '';
                sales.forEach(sale => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${sale.invoice_number}</td>
                        <td>${uiManager.formatDateTime(sale.created_at)}</td>
                        <td>${uiManager.formatCurrency(sale.total_amount)}</td>
                        <td>${this.getPaymentMethodText(sale.payment_method)}</td>
                        <td>
                            <span class="status-badge ${sale.payment_status}">${this.getPaymentStatusText(sale.payment_status)}</span>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeCustomerSalesModal() {
        const modal = document.getElementById('customer-sales-modal');
        if (modal) modal.style.display = 'none';
    }

    async deleteCustomer(customerId) {
        const confirmed = await this.showConfirmDialog(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.'
        );

        if (!confirmed) return;

        try {
            await databaseManager.runQuery(
                'UPDATE customers SET is_active = 0 WHERE id = ?',
                [customerId]
            );

            // Sync with backend
            await syncManager.queueSync('customers', 'delete', customerId, {});

            uiManager.showNotification('تم حذف العميل بنجاح', 'success');
            this.loadCustomersData();
            this.updateCustomerStatistics();

        } catch (error) {
            console.error('Error deleting customer:', error);
            uiManager.showNotification('خطأ في حذف العميل', 'error');
        }
    }

    async importCustomers() {
        // Implementation for importing customers from Excel
        console.log('Import customers');
    }

    async exportCustomers() {
        try {
            const customers = await databaseManager.allQuery('SELECT * FROM customers WHERE is_active = 1');
            
            // Create Excel workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(customers);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء');
            
            // Save file
            const fileName = `العملاء_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير العملاء بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting customers:', error);
            uiManager.showNotification('خطأ في تصدير العملاء', 'error');
        }
    }

    // Utility methods
    getCustomerTypeText(type) {
        const types = {
            'individual': 'فردي',
            'company': 'شركة',
            'vip': 'VIP'
        };
        return types[type] || type;
    }

    getCustomerStatusText(status) {
        const statuses = {
            'active': 'نشط',
            'inactive': 'غير نشط',
            'blocked': 'محظور'
        };
        return statuses[status] || status;
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

    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }
}

// Export singleton instance
const customerManager = new CustomerManager();
module.exports = customerManager;
