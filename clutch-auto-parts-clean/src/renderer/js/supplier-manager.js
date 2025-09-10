// Supplier Management System for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');
const syncManager = require('./sync-manager');

class SupplierManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalSuppliers = 0;
        this.currentFilters = {};
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.selectedSupplier = null;
        
        this.init();
    }

    async init() {
        await this.loadSuppliersData();
        this.setupEventListeners();
        await this.updateSupplierStatistics();
    }

    setupEventListeners() {
        // Add supplier button
        const addSupplierBtn = document.getElementById('add-supplier-btn');
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => {
                this.openAddSupplierModal();
            });
        }

        // Import suppliers button
        const importSuppliersBtn = document.getElementById('import-suppliers-btn');
        if (importSuppliersBtn) {
            importSuppliersBtn.addEventListener('click', () => {
                this.importSuppliers();
            });
        }

        // Export suppliers button
        const exportSuppliersBtn = document.getElementById('export-suppliers-btn');
        if (exportSuppliersBtn) {
            exportSuppliersBtn.addEventListener('click', () => {
                this.exportSuppliers();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('supplier-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadSuppliersData();
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
        const supplierTypeFilter = document.getElementById('supplier-type-filter');
        if (supplierTypeFilter) {
            supplierTypeFilter.addEventListener('change', (e) => {
                this.currentFilters.supplier_type = e.target.value;
                this.currentPage = 1;
                this.loadSuppliersData();
            });
        }

        const supplierStatusFilter = document.getElementById('supplier-status-filter');
        if (supplierStatusFilter) {
            supplierStatusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.currentPage = 1;
                this.loadSuppliersData();
            });
        }

        const clearFiltersBtn = document.getElementById('clear-supplier-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    setupPaginationEventListeners() {
        const prevPageBtn = document.getElementById('suppliers-prev-page-btn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadSuppliersData();
                }
            });
        }

        const nextPageBtn = document.getElementById('suppliers-next-page-btn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalSuppliers / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadSuppliersData();
                }
            });
        }
    }

    setupTableSorting() {
        const table = document.getElementById('suppliers-table');
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
        // Supplier modal
        const supplierModal = document.getElementById('supplier-modal');
        const supplierModalClose = document.getElementById('supplier-modal-close');
        const supplierModalCancel = document.getElementById('supplier-modal-cancel');
        const supplierModalSave = document.getElementById('supplier-modal-save');

        if (supplierModalClose) {
            supplierModalClose.addEventListener('click', () => {
                this.closeSupplierModal();
            });
        }

        if (supplierModalCancel) {
            supplierModalCancel.addEventListener('click', () => {
                this.closeSupplierModal();
            });
        }

        if (supplierModalSave) {
            supplierModalSave.addEventListener('click', () => {
                this.saveSupplier();
            });
        }

        // Supplier details modal
        const supplierDetailsModal = document.getElementById('supplier-details-modal');
        const supplierDetailsModalClose = document.getElementById('supplier-details-modal-close');
        const supplierDetailsClose = document.getElementById('supplier-details-close');
        const supplierDetailsEdit = document.getElementById('supplier-details-edit');

        if (supplierDetailsModalClose) {
            supplierDetailsModalClose.addEventListener('click', () => {
                this.closeSupplierDetailsModal();
            });
        }

        if (supplierDetailsClose) {
            supplierDetailsClose.addEventListener('click', () => {
                this.closeSupplierDetailsModal();
            });
        }

        if (supplierDetailsEdit) {
            supplierDetailsEdit.addEventListener('click', () => {
                this.editSupplier();
            });
        }
    }

    async loadSuppliersData() {
        try {
            // Show loading state
            const tbody = document.getElementById('suppliers-tbody');
            if (tbody) {
                uiManager.showLoading(tbody, 'جاري تحميل الموردين...');
            }

            // Build query
            let sql = `
                SELECT s.*, 
                       COUNT(i.id) as products_count,
                       COALESCE(SUM(i.stock_quantity * i.cost_price), 0) as total_inventory_value
                FROM suppliers s
                LEFT JOIN inventory i ON s.id = i.supplier_id
                WHERE 1=1
            `;
            const params = [];

            // Apply filters
            if (this.currentFilters.search) {
                sql += ' AND (s.name LIKE ? OR s.contact_person LIKE ? OR s.email LIKE ?)';
                const searchTerm = `%${this.currentFilters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (this.currentFilters.supplier_type) {
                sql += ' AND s.supplier_type = ?';
                params.push(this.currentFilters.supplier_type);
            }

            if (this.currentFilters.status) {
                sql += ' AND s.status = ?';
                params.push(this.currentFilters.status);
            }

            // Group by supplier
            sql += ' GROUP BY s.id';

            // Get total count
            const countSql = sql.replace('SELECT s.*, COUNT(i.id) as products_count, COALESCE(SUM(i.stock_quantity * i.cost_price), 0) as total_inventory_value', 'SELECT COUNT(DISTINCT s.id) as count');
            const countResult = await databaseManager.getQuery(countSql, params);
            this.totalSuppliers = countResult.count;

            // Add sorting
            sql += ` ORDER BY s.${this.sortField} ${this.sortDirection.toUpperCase()}`;

            // Add pagination
            const offset = (this.currentPage - 1) * this.itemsPerPage;
            sql += ` LIMIT ${this.itemsPerPage} OFFSET ${offset}`;

            const suppliers = await databaseManager.allQuery(sql, params);

            // Render table
            this.renderSuppliersTable(suppliers);

            // Update pagination
            this.updatePagination();

        } catch (error) {
            console.error('Error loading suppliers data:', error);
            uiManager.showNotification('خطأ في تحميل بيانات الموردين', 'error');
        }
    }

    renderSuppliersTable(suppliers) {
        const tbody = document.getElementById('suppliers-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد موردين</td></tr>';
            return;
        }

        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="supplier-info">
                        <div class="supplier-name">${supplier.name}</div>
                        ${supplier.is_preferred ? '<span class="preferred-badge">مفضل</span>' : ''}
                    </div>
                </td>
                <td>${supplier.contact_person || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${this.getSupplierTypeText(supplier.supplier_type)}</td>
                <td>${supplier.products_count || 0}</td>
                <td>${uiManager.formatCurrency(supplier.total_inventory_value || 0)}</td>
                <td>
                    <span class="status-badge ${supplier.status}">${this.getSupplierStatusText(supplier.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="supplierManager.viewSupplierDetails(${supplier.id})" title="عرض التفاصيل">
                            <span class="btn-icon">👁️</span>
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="supplierManager.viewSupplierProducts(${supplier.id})" title="منتجات المورد">
                            <span class="btn-icon">📦</span>
                        </button>
                        <button class="btn btn-small btn-success" onclick="supplierManager.editSupplier(${supplier.id})" title="تعديل">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="supplierManager.deleteSupplier(${supplier.id})" title="حذف">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async updateSupplierStatistics() {
        try {
            // Total suppliers
            const totalSuppliersResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM suppliers WHERE is_active = 1');
            const totalSuppliersCount = document.getElementById('total-suppliers-count');
            if (totalSuppliersCount) totalSuppliersCount.textContent = totalSuppliersResult.count;

            // Active suppliers
            const activeSuppliersResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM suppliers WHERE status = "active" AND is_active = 1');
            const activeSuppliersCount = document.getElementById('active-suppliers-count');
            if (activeSuppliersCount) activeSuppliersCount.textContent = activeSuppliersResult.count;

            // Preferred suppliers
            const preferredSuppliersResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM suppliers WHERE is_preferred = 1 AND is_active = 1');
            const preferredSuppliersCount = document.getElementById('preferred-suppliers-count');
            if (preferredSuppliersCount) preferredSuppliersCount.textContent = preferredSuppliersResult.count;

            // Total products from suppliers
            const totalProductsResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM inventory WHERE supplier_id IS NOT NULL AND is_active = 1');
            const totalProductsCount = document.getElementById('total-supplier-products-count');
            if (totalProductsCount) totalProductsCount.textContent = totalProductsResult.count;

        } catch (error) {
            console.error('Error updating supplier statistics:', error);
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalSuppliers / this.itemsPerPage);
        const paginationInfo = document.getElementById('suppliers-pagination-info');
        const prevPageBtn = document.getElementById('suppliers-prev-page-btn');
        const nextPageBtn = document.getElementById('suppliers-next-page-btn');
        const pageNumbers = document.getElementById('suppliers-page-numbers');

        // Update pagination info
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.totalSuppliers);
            paginationInfo.textContent = `عرض ${start}-${end} من ${this.totalSuppliers} مورد`;
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
                    this.loadSuppliersData();
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
        this.loadSuppliersData();
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Clear form inputs
        const searchInput = document.getElementById('supplier-search');
        const supplierTypeFilter = document.getElementById('supplier-type-filter');
        const supplierStatusFilter = document.getElementById('supplier-status-filter');

        if (searchInput) searchInput.value = '';
        if (supplierTypeFilter) supplierTypeFilter.value = '';
        if (supplierStatusFilter) supplierStatusFilter.value = '';

        this.loadSuppliersData();
    }

    openAddSupplierModal() {
        const modal = document.getElementById('supplier-modal');
        const modalTitle = document.getElementById('supplier-modal-title');
        const form = document.getElementById('supplier-form');

        if (modalTitle) modalTitle.textContent = 'إضافة مورد جديد';
        if (form) form.reset();
        if (modal) modal.style.display = 'flex';

        this.selectedSupplier = null;
    }

    closeSupplierModal() {
        const modal = document.getElementById('supplier-modal');
        if (modal) modal.style.display = 'none';
    }

    async saveSupplier() {
        const form = document.getElementById('supplier-form');
        if (!form) return;

        const formData = new FormData(form);
        const supplierData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = uiManager.validateForm(form);
        if (errors.length > 0) {
            uiManager.showFormErrors(form, errors);
            return;
        }

        try {
            // Convert checkbox values
            supplierData.is_preferred = document.getElementById('supplier-is-preferred').checked ? 1 : 0;
            supplierData.is_active = document.getElementById('supplier-is-active').checked ? 1 : 0;

            let result;
            if (this.selectedSupplier) {
                // Update existing supplier
                result = await databaseManager.runQuery(
                    'UPDATE suppliers SET name = ?, supplier_type = ?, contact_person = ?, phone = ?, email = ?, address = ?, city = ?, country = ?, payment_terms = ?, credit_limit = ?, notes = ?, is_preferred = ?, is_active = ? WHERE id = ?',
                    [
                        supplierData.name, supplierData.supplier_type, supplierData.contact_person, supplierData.phone,
                        supplierData.email, supplierData.address, supplierData.city, supplierData.country,
                        supplierData.payment_terms, supplierData.credit_limit, supplierData.notes,
                        supplierData.is_preferred, supplierData.is_active, this.selectedSupplier
                    ]
                );
                
                // Sync with backend
                await syncManager.queueSync('suppliers', 'update', this.selectedSupplier, supplierData);
            } else {
                // Add new supplier
                result = await databaseManager.runQuery(
                    'INSERT INTO suppliers (name, supplier_type, contact_person, phone, email, address, city, country, payment_terms, credit_limit, notes, is_preferred, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        supplierData.name, supplierData.supplier_type, supplierData.contact_person, supplierData.phone,
                        supplierData.email, supplierData.address, supplierData.city, supplierData.country,
                        supplierData.payment_terms, supplierData.credit_limit, supplierData.notes,
                        supplierData.is_preferred, supplierData.is_active
                    ]
                );
                
                // Sync with backend
                await syncManager.queueSync('suppliers', 'create', result.lastID, supplierData);
            }

            uiManager.showNotification('تم حفظ المورد بنجاح', 'success');
            this.closeSupplierModal();
            this.loadSuppliersData();
            this.updateSupplierStatistics();

        } catch (error) {
            console.error('Error saving supplier:', error);
            uiManager.showNotification('خطأ في حفظ المورد', 'error');
        }
    }

    async editSupplier(supplierId) {
        try {
            const supplier = await databaseManager.getQuery(
                'SELECT * FROM suppliers WHERE id = ?',
                [supplierId]
            );

            if (!supplier) {
                uiManager.showNotification('المورد غير موجود', 'error');
                return;
            }

            this.selectedSupplier = supplierId;
            this.openEditSupplierModal(supplier);

        } catch (error) {
            console.error('Error loading supplier for edit:', error);
            uiManager.showNotification('خطأ في تحميل بيانات المورد', 'error');
        }
    }

    openEditSupplierModal(supplier) {
        const modal = document.getElementById('supplier-modal');
        const modalTitle = document.getElementById('supplier-modal-title');
        const form = document.getElementById('supplier-form');

        if (modalTitle) modalTitle.textContent = 'تعديل المورد';
        if (form) {
            // Populate form with supplier data
            Object.keys(supplier).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = supplier[key] == 1;
                    } else {
                        input.value = supplier[key] || '';
                    }
                }
            });
        }
        if (modal) modal.style.display = 'flex';
    }

    async viewSupplierDetails(supplierId) {
        try {
            const supplier = await databaseManager.getQuery(
                'SELECT * FROM suppliers WHERE id = ?',
                [supplierId]
            );

            if (!supplier) {
                uiManager.showNotification('المورد غير موجود', 'error');
                return;
            }

            this.showSupplierDetails(supplier);

        } catch (error) {
            console.error('Error loading supplier details:', error);
            uiManager.showNotification('خطأ في تحميل تفاصيل المورد', 'error');
        }
    }

    showSupplierDetails(supplier) {
        const modal = document.getElementById('supplier-details-modal');
        const content = document.getElementById('supplier-details-content');

        if (content) {
            content.innerHTML = `
                <div class="supplier-details-info">
                    <div class="detail-row">
                        <span class="detail-label">الاسم:</span>
                        <span class="detail-value">${supplier.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">نوع المورد:</span>
                        <span class="detail-value">${this.getSupplierTypeText(supplier.supplier_type)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">الشخص المسؤول:</span>
                        <span class="detail-value">${supplier.contact_person || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">رقم الهاتف:</span>
                        <span class="detail-value">${supplier.phone || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">البريد الإلكتروني:</span>
                        <span class="detail-value">${supplier.email || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">العنوان:</span>
                        <span class="detail-value">${supplier.address || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">المدينة:</span>
                        <span class="detail-value">${supplier.city || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">البلد:</span>
                        <span class="detail-value">${supplier.country || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">شروط الدفع:</span>
                        <span class="detail-value">${supplier.payment_terms || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">حد الائتمان:</span>
                        <span class="detail-value">${supplier.credit_limit ? uiManager.formatCurrency(supplier.credit_limit) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ملاحظات:</span>
                        <span class="detail-value">${supplier.notes || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">مورد مفضل:</span>
                        <span class="detail-value">${supplier.is_preferred ? 'نعم' : 'لا'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">الحالة:</span>
                        <span class="detail-value">${this.getSupplierStatusText(supplier.status)}</span>
                    </div>
                </div>
            `;
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeSupplierDetailsModal() {
        const modal = document.getElementById('supplier-details-modal');
        if (modal) modal.style.display = 'none';
    }

    async viewSupplierProducts(supplierId) {
        try {
            const products = await databaseManager.allQuery(
                'SELECT * FROM inventory WHERE supplier_id = ? AND is_active = 1 ORDER BY name',
                [supplierId]
            );

            this.showSupplierProducts(products);

        } catch (error) {
            console.error('Error loading supplier products:', error);
            uiManager.showNotification('خطأ في تحميل منتجات المورد', 'error');
        }
    }

    showSupplierProducts(products) {
        // Implementation for showing supplier products
        console.log('Supplier products:', products);
        uiManager.showNotification(`المورد لديه ${products.length} منتج`, 'info');
    }

    async deleteSupplier(supplierId) {
        const confirmed = await this.showConfirmDialog(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.'
        );

        if (!confirmed) return;

        try {
            await databaseManager.runQuery(
                'UPDATE suppliers SET is_active = 0 WHERE id = ?',
                [supplierId]
            );

            // Sync with backend
            await syncManager.queueSync('suppliers', 'delete', supplierId, {});

            uiManager.showNotification('تم حذف المورد بنجاح', 'success');
            this.loadSuppliersData();
            this.updateSupplierStatistics();

        } catch (error) {
            console.error('Error deleting supplier:', error);
            uiManager.showNotification('خطأ في حذف المورد', 'error');
        }
    }

    async importSuppliers() {
        // Implementation for importing suppliers from Excel
        console.log('Import suppliers');
    }

    async exportSuppliers() {
        try {
            const suppliers = await databaseManager.allQuery('SELECT * FROM suppliers WHERE is_active = 1');
            
            // Create Excel workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(suppliers);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'الموردين');
            
            // Save file
            const fileName = `الموردين_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير الموردين بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting suppliers:', error);
            uiManager.showNotification('خطأ في تصدير الموردين', 'error');
        }
    }

    // Utility methods
    getSupplierTypeText(type) {
        const types = {
            'manufacturer': 'مصنع',
            'distributor': 'موزع',
            'wholesaler': 'تاجر جملة',
            'retailer': 'تاجر تجزئة'
        };
        return types[type] || type;
    }

    getSupplierStatusText(status) {
        const statuses = {
            'active': 'نشط',
            'inactive': 'غير نشط',
            'suspended': 'معلق'
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
const supplierManager = new SupplierManager();
module.exports = supplierManager;