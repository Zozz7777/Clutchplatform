// Inventory Management System for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const excelImportManager = require('./excel-import');
const apiManager = require('./api');
const uiManager = require('./ui');

class InventoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalItems = 0;
        this.currentFilters = {};
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.selectedItems = [];
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadBrands();
        await this.loadSuppliers();
        this.setupEventListeners();
        await this.loadInventoryData();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadInventoryData();
            });
        }

        // Filter controls
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category_id = e.target.value;
                this.currentPage = 1;
                this.loadInventoryData();
            });
        }

        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter) {
            brandFilter.addEventListener('change', (e) => {
                this.currentFilters.brand_id = e.target.value;
                this.currentPage = 1;
                this.loadInventoryData();
            });
        }

        const stockFilter = document.getElementById('stock-filter');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                this.currentFilters.stock_status = e.target.value;
                this.currentPage = 1;
                this.loadInventoryData();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Add item button
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.openAddItemModal();
            });
        }

        // Import Excel button
        const importExcelBtn = document.getElementById('import-excel-btn');
        if (importExcelBtn) {
            importExcelBtn.addEventListener('click', () => {
                this.openImportModal();
            });
        }

        // Export Excel button
        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => {
                this.exportToExcel();
            });
        }

        // Generate barcode button
        const generateBarcodeBtn = document.getElementById('generate-barcode-btn');
        if (generateBarcodeBtn) {
            generateBarcodeBtn.addEventListener('click', () => {
                this.openBarcodeModal();
            });
        }

        // Table sorting
        const table = document.getElementById('inventory-table');
        if (table) {
            const sortableHeaders = table.querySelectorAll('.sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const field = header.dataset.sort;
                    this.sortTable(field);
                });
            });
        }

        // Pagination
        const prevPageBtn = document.getElementById('prev-page-btn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadInventoryData();
                }
            });
        }

        const nextPageBtn = document.getElementById('next-page-btn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadInventoryData();
                }
            });
        }

        // Item modal events
        this.setupItemModalEvents();
        
        // Import modal events
        this.setupImportModalEvents();
        
        // Barcode modal events
        this.setupBarcodeModalEvents();
    }

    setupItemModalEvents() {
        const itemModal = document.getElementById('item-modal');
        const itemModalClose = document.getElementById('item-modal-close');
        const itemModalCancel = document.getElementById('item-modal-cancel');
        const itemModalSave = document.getElementById('item-modal-save');

        if (itemModalClose) {
            itemModalClose.addEventListener('click', () => {
                this.closeItemModal();
            });
        }

        if (itemModalCancel) {
            itemModalCancel.addEventListener('click', () => {
                this.closeItemModal();
            });
        }

        if (itemModalSave) {
            itemModalSave.addEventListener('click', () => {
                this.saveItem();
            });
        }

        // Add category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.openAddCategoryModal();
            });
        }

        // Add brand button
        const addBrandBtn = document.getElementById('add-brand-btn');
        if (addBrandBtn) {
            addBrandBtn.addEventListener('click', () => {
                this.openAddBrandModal();
            });
        }

        // Generate barcode in modal
        const generateBarcodeBtnModal = document.getElementById('generate-barcode-btn-modal');
        if (generateBarcodeBtnModal) {
            generateBarcodeBtnModal.addEventListener('click', () => {
                this.generateBarcodeForItem();
            });
        }
    }

    setupImportModalEvents() {
        const importModal = document.getElementById('import-modal');
        const importModalClose = document.getElementById('import-modal-close');
        const importModalCancel = document.getElementById('import-modal-cancel');
        const importModalNext = document.getElementById('import-modal-next');
        const importModalImport = document.getElementById('import-modal-import');

        if (importModalClose) {
            importModalClose.addEventListener('click', () => {
                this.closeImportModal();
            });
        }

        if (importModalCancel) {
            importModalCancel.addEventListener('click', () => {
                this.closeImportModal();
            });
        }

        if (importModalNext) {
            importModalNext.addEventListener('click', () => {
                this.nextImportStep();
            });
        }

        if (importModalImport) {
            importModalImport.addEventListener('click', () => {
                this.startImport();
            });
        }

        // File selection
        const selectFileBtn = document.getElementById('select-file-btn');
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
                this.selectImportFile();
            });
        }

        // Download template
        const downloadTemplateBtn = document.getElementById('download-template-btn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', () => {
                this.downloadTemplate();
            });
        }
    }

    setupBarcodeModalEvents() {
        const barcodeModal = document.getElementById('barcode-modal');
        const barcodeModalClose = document.getElementById('barcode-modal-close');
        const generateBarcodePreviewBtn = document.getElementById('generate-barcode-preview-btn');
        const printBarcodeBtn = document.getElementById('print-barcode-btn');
        const saveBarcodeBtn = document.getElementById('save-barcode-btn');

        if (barcodeModalClose) {
            barcodeModalClose.addEventListener('click', () => {
                this.closeBarcodeModal();
            });
        }

        if (generateBarcodePreviewBtn) {
            generateBarcodePreviewBtn.addEventListener('click', () => {
                this.generateBarcodePreview();
            });
        }

        if (printBarcodeBtn) {
            printBarcodeBtn.addEventListener('click', () => {
                this.printBarcode();
            });
        }

        if (saveBarcodeBtn) {
            saveBarcodeBtn.addEventListener('click', () => {
                this.saveBarcode();
            });
        }
    }

    async loadCategories() {
        try {
            const categories = await databaseManager.allQuery('SELECT * FROM categories ORDER BY name');
            const categoryFilter = document.getElementById('category-filter');
            const itemCategory = document.getElementById('item-category');
            
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }

            if (itemCategory) {
                itemCategory.innerHTML = '<option value="">اختر الفئة</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    itemCategory.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadBrands() {
        try {
            const brands = await databaseManager.allQuery('SELECT * FROM brands ORDER BY name');
            const brandFilter = document.getElementById('brand-filter');
            const itemBrand = document.getElementById('item-brand');
            
            if (brandFilter) {
                brandFilter.innerHTML = '<option value="">جميع الماركات</option>';
                brands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.id;
                    option.textContent = brand.name;
                    brandFilter.appendChild(option);
                });
            }

            if (itemBrand) {
                itemBrand.innerHTML = '<option value="">اختر الماركة</option>';
                brands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.id;
                    option.textContent = brand.name;
                    itemBrand.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading brands:', error);
        }
    }

    async loadSuppliers() {
        try {
            const suppliers = await databaseManager.allQuery('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name');
            const itemSupplier = document.getElementById('item-supplier');
            
            if (itemSupplier) {
                itemSupplier.innerHTML = '<option value="">اختر المورد</option>';
                suppliers.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = supplier.name;
                    itemSupplier.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    async loadInventoryData() {
        try {
            // Show loading state
            const tbody = document.getElementById('inventory-tbody');
            if (tbody) {
                uiManager.showLoading(tbody, 'جاري تحميل المخزون...');
            }

            // Build query
            let sql = `
                SELECT i.*, c.name as category_name, b.name as brand_name, s.name as supplier_name
                FROM inventory i
                LEFT JOIN categories c ON i.category_id = c.id
                LEFT JOIN brands b ON i.brand_id = b.id
                LEFT JOIN suppliers s ON i.supplier_id = s.id
                WHERE i.is_active = 1
            `;
            const params = [];

            // Apply filters
            if (this.currentFilters.search) {
                sql += ' AND (i.name LIKE ? OR i.name_en LIKE ? OR i.barcode LIKE ? OR i.sku LIKE ?)';
                const searchTerm = `%${this.currentFilters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (this.currentFilters.category_id) {
                sql += ' AND i.category_id = ?';
                params.push(this.currentFilters.category_id);
            }

            if (this.currentFilters.brand_id) {
                sql += ' AND i.brand_id = ?';
                params.push(this.currentFilters.brand_id);
            }

            if (this.currentFilters.stock_status) {
                switch (this.currentFilters.stock_status) {
                    case 'low':
                        sql += ' AND i.stock_quantity <= i.min_stock_level';
                        break;
                    case 'out':
                        sql += ' AND i.stock_quantity = 0';
                        break;
                    case 'normal':
                        sql += ' AND i.stock_quantity > i.min_stock_level';
                        break;
                }
            }

            // Get total count
            const countSql = sql.replace('SELECT i.*, c.name as category_name, b.name as brand_name, s.name as supplier_name', 'SELECT COUNT(*) as count');
            const countResult = await databaseManager.getQuery(countSql, params);
            this.totalItems = countResult.count;

            // Add sorting
            sql += ` ORDER BY i.${this.sortField} ${this.sortDirection.toUpperCase()}`;

            // Add pagination
            const offset = (this.currentPage - 1) * this.itemsPerPage;
            sql += ` LIMIT ${this.itemsPerPage} OFFSET ${offset}`;

            const items = await databaseManager.allQuery(sql, params);

            // Update statistics
            await this.updateInventoryStatistics();

            // Render table
            this.renderInventoryTable(items);

            // Update pagination
            this.updatePagination();

        } catch (error) {
            console.error('Error loading inventory data:', error);
            uiManager.showNotification('خطأ في تحميل بيانات المخزون', 'error');
        }
    }

    renderInventoryTable(items) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">لا توجد عناصر في المخزون</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        ${item.name_en ? `<div class="item-name-en">${item.name_en}</div>` : ''}
                    </div>
                </td>
                <td>${item.barcode || '-'}</td>
                <td>${item.category_name || '-'}</td>
                <td>${item.brand_name || '-'}</td>
                <td>${uiManager.formatCurrency(item.unit_price)}</td>
                <td>
                    <span class="stock-quantity ${this.getStockStatusClass(item)}">${item.stock_quantity}</span>
                </td>
                <td>${item.min_stock_level || 0}</td>
                <td>
                    <span class="status-badge ${this.getStockStatusClass(item)}">${this.getStockStatusText(item)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="inventoryManager.editItem(${item.id})" title="تعديل">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="inventoryManager.adjustStock(${item.id})" title="تعديل المخزون">
                            <span class="btn-icon">📦</span>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="inventoryManager.deleteItem(${item.id})" title="حذف">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStockStatusClass(item) {
        if (item.stock_quantity === 0) return 'out-of-stock';
        if (item.stock_quantity <= item.min_stock_level) return 'low-stock';
        return 'normal-stock';
    }

    getStockStatusText(item) {
        if (item.stock_quantity === 0) return 'نفد المخزون';
        if (item.stock_quantity <= item.min_stock_level) return 'مخزون منخفض';
        return 'متوفر';
    }

    async updateInventoryStatistics() {
        try {
            // Total items
            const totalItemsResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM inventory WHERE is_active = 1');
            const totalItemsCount = document.getElementById('total-items-count');
            if (totalItemsCount) totalItemsCount.textContent = totalItemsResult.count;

            // Total value
            const totalValueResult = await databaseManager.getQuery('SELECT SUM(unit_price * stock_quantity) as total FROM inventory WHERE is_active = 1');
            const totalValue = document.getElementById('total-value');
            if (totalValue) totalValue.textContent = uiManager.formatCurrency(totalValueResult.total || 0);

            // Low stock count
            const lowStockResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM inventory WHERE stock_quantity <= min_stock_level AND is_active = 1');
            const lowStockCount = document.getElementById('low-stock-count');
            if (lowStockCount) lowStockCount.textContent = lowStockResult.count;

            // Out of stock count
            const outOfStockResult = await databaseManager.getQuery('SELECT COUNT(*) as count FROM inventory WHERE stock_quantity = 0 AND is_active = 1');
            const outOfStockCount = document.getElementById('out-of-stock-count');
            if (outOfStockCount) outOfStockCount.textContent = outOfStockResult.count;

        } catch (error) {
            console.error('Error updating inventory statistics:', error);
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const paginationInfo = document.getElementById('pagination-info');
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        const pageNumbers = document.getElementById('page-numbers');

        // Update pagination info
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.itemsPerPage + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
            paginationInfo.textContent = `عرض ${start}-${end} من ${this.totalItems} عنصر`;
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
                    this.loadInventoryData();
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
        this.loadInventoryData();
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentPage = 1;
        
        // Clear form inputs
        const searchInput = document.getElementById('inventory-search');
        const categoryFilter = document.getElementById('category-filter');
        const brandFilter = document.getElementById('brand-filter');
        const stockFilter = document.getElementById('stock-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (brandFilter) brandFilter.value = '';
        if (stockFilter) stockFilter.value = '';

        this.loadInventoryData();
    }

    openAddItemModal() {
        const modal = document.getElementById('item-modal');
        const modalTitle = document.getElementById('item-modal-title');
        const form = document.getElementById('item-form');

        if (modalTitle) modalTitle.textContent = 'إضافة صنف جديد';
        if (form) form.reset();
        if (modal) modal.style.display = 'flex';

        // Focus on first input
        const firstInput = form?.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    closeItemModal() {
        const modal = document.getElementById('item-modal');
        if (modal) modal.style.display = 'none';
    }

    async saveItem() {
        const form = document.getElementById('item-form');
        if (!form) return;

        const formData = new FormData(form);
        const itemData = Object.fromEntries(formData.entries());

        // Validate form
        const errors = uiManager.validateForm(form);
        if (errors.length > 0) {
            uiManager.showFormErrors(form, errors);
            return;
        }

        try {
            // Convert string values to appropriate types
            itemData.unit_price = parseFloat(itemData.unit_price);
            itemData.cost_price = parseFloat(itemData.cost_price) || 0;
            itemData.stock_quantity = parseInt(itemData.stock_quantity);
            itemData.min_stock_level = parseInt(itemData.min_stock_level) || 0;
            itemData.max_stock_level = parseInt(itemData.max_stock_level) || 0;
            itemData.weight = parseFloat(itemData.weight) || 0;
            itemData.warranty_period = parseInt(itemData.warranty_period) || 0;

            // Add item to database
            await databaseManager.addInventoryItem(itemData);

            // Sync with backend
            await apiManager.syncInventoryItem(itemData);

            uiManager.showNotification('تم حفظ الصنف بنجاح', 'success');
            this.closeItemModal();
            this.loadInventoryData();

        } catch (error) {
            console.error('Error saving item:', error);
            uiManager.showNotification('خطأ في حفظ الصنف', 'error');
        }
    }

    async editItem(itemId) {
        try {
            const item = await databaseManager.getQuery(
                'SELECT * FROM inventory WHERE id = ?',
                [itemId]
            );

            if (!item) {
                uiManager.showNotification('الصنف غير موجود', 'error');
                return;
            }

            // Open modal with item data
            this.openEditItemModal(item);

        } catch (error) {
            console.error('Error loading item for edit:', error);
            uiManager.showNotification('خطأ في تحميل بيانات الصنف', 'error');
        }
    }

    openEditItemModal(item) {
        const modal = document.getElementById('item-modal');
        const modalTitle = document.getElementById('item-modal-title');
        const form = document.getElementById('item-form');

        if (modalTitle) modalTitle.textContent = 'تعديل الصنف';
        if (form) {
            // Populate form with item data
            Object.keys(item).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = item[key] || '';
                }
            });
        }
        if (modal) modal.style.display = 'flex';
    }

    async deleteItem(itemId) {
        const confirmed = await this.showConfirmDialog(
            'تأكيد الحذف',
            'هل أنت متأكد من حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.'
        );

        if (!confirmed) return;

        try {
            await databaseManager.runQuery(
                'UPDATE inventory SET is_active = 0 WHERE id = ?',
                [itemId]
            );

            uiManager.showNotification('تم حذف الصنف بنجاح', 'success');
            this.loadInventoryData();

        } catch (error) {
            console.error('Error deleting item:', error);
            uiManager.showNotification('خطأ في حذف الصنف', 'error');
        }
    }

    async adjustStock(itemId) {
        // Implementation for stock adjustment modal
        console.log('Adjust stock for item:', itemId);
    }

    async exportToExcel() {
        try {
            // Get all inventory data
            const items = await databaseManager.getInventoryItems();
            
            // Create Excel workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(items);
            
            // Set column widths
            const columnWidths = [
                { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
            ];
            worksheet['!cols'] = columnWidths;
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'المخزون');
            
            // Save file
            const fileName = `مخزون_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير البيانات بنجاح', 'success');
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            uiManager.showNotification('خطأ في تصدير البيانات', 'error');
        }
    }

    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }
}

// Export singleton instance
const inventoryManager = new InventoryManager();
module.exports = inventoryManager;
