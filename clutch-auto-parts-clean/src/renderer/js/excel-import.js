// Excel Import System for Clutch Auto Parts System
const XLSX = require('xlsx');
const { ipcRenderer } = require('electron');

class ExcelImportManager {
    constructor() {
        this.supportedFormats = ['.xlsx', '.xls', '.csv'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.requiredFields = ['name', 'category', 'brand', 'unit_price', 'stock_quantity'];
        this.optionalFields = [
            'name_en', 'description', 'barcode', 'sku', 'cost_price',
            'min_stock_level', 'max_stock_level', 'unit', 'weight',
            'dimensions', 'car_brand', 'car_model', 'car_year',
            'part_number', 'oem_number', 'warranty_period', 'supplier'
        ];
        this.validationRules = {
            name: { required: true, type: 'string', maxLength: 255 },
            name_en: { required: false, type: 'string', maxLength: 255 },
            description: { required: false, type: 'string', maxLength: 1000 },
            barcode: { required: false, type: 'string', maxLength: 50, unique: true },
            sku: { required: false, type: 'string', maxLength: 50, unique: true },
            category: { required: true, type: 'string', maxLength: 100 },
            brand: { required: true, type: 'string', maxLength: 100 },
            unit_price: { required: true, type: 'number', min: 0 },
            cost_price: { required: false, type: 'number', min: 0 },
            stock_quantity: { required: true, type: 'number', min: 0 },
            min_stock_level: { required: false, type: 'number', min: 0 },
            max_stock_level: { required: false, type: 'number', min: 0 },
            unit: { required: false, type: 'string', maxLength: 20 },
            weight: { required: false, type: 'number', min: 0 },
            dimensions: { required: false, type: 'string', maxLength: 100 },
            car_brand: { required: false, type: 'string', maxLength: 50 },
            car_model: { required: false, type: 'string', maxLength: 50 },
            car_year: { required: false, type: 'string', maxLength: 10 },
            part_number: { required: false, type: 'string', maxLength: 100 },
            oem_number: { required: false, type: 'string', maxLength: 100 },
            warranty_period: { required: false, type: 'number', min: 0 },
            supplier: { required: false, type: 'string', maxLength: 100 }
        };
    }

    async openFileDialog() {
        try {
            const result = await ipcRenderer.invoke('show-open-dialog', {
                title: 'اختيار ملف Excel',
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
                    { name: 'CSV Files', extensions: ['csv'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
                return result.filePaths[0];
            }
            return null;
        } catch (error) {
            console.error('Error opening file dialog:', error);
            throw error;
        }
    }

    async readExcelFile(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const data = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: '',
                raw: false
            });

            if (data.length < 2) {
                throw new Error('الملف لا يحتوي على بيانات كافية');
            }

            // Extract headers and data
            const headers = data[0];
            const rows = data.slice(1);

            return {
                headers: headers,
                data: rows,
                totalRows: rows.length
            };
        } catch (error) {
            console.error('Error reading Excel file:', error);
            throw new Error(`خطأ في قراءة الملف: ${error.message}`);
        }
    }

    validateHeaders(headers) {
        const errors = [];
        const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
        
        // Check for required fields
        this.requiredFields.forEach(field => {
            if (!normalizedHeaders.includes(field)) {
                errors.push({
                    type: 'missing_required_field',
                    field: field,
                    message: `الحقل المطلوب مفقود: ${this.getFieldDisplayName(field)}`
                });
            }
        });

        // Check for unknown fields
        normalizedHeaders.forEach(header => {
            if (!this.requiredFields.includes(header) && !this.optionalFields.includes(header)) {
                errors.push({
                    type: 'unknown_field',
                    field: header,
                    message: `حقل غير معروف: ${header}`
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors,
            mappedHeaders: this.mapHeaders(headers)
        };
    }

    normalizeHeader(header) {
        if (!header) return '';
        
        // Remove extra spaces and convert to lowercase
        const normalized = header.toString().trim().toLowerCase();
        
        // Map common variations
        const mappings = {
            'اسم المنتج': 'name',
            'product name': 'name',
            'name': 'name',
            'اسم المنتج بالانجليزي': 'name_en',
            'english name': 'name_en',
            'name_en': 'name_en',
            'الوصف': 'description',
            'description': 'description',
            'الباركود': 'barcode',
            'barcode': 'barcode',
            'كود المنتج': 'sku',
            'sku': 'sku',
            'product code': 'sku',
            'الفئة': 'category',
            'category': 'category',
            'الماركة': 'brand',
            'brand': 'brand',
            'السعر': 'unit_price',
            'price': 'unit_price',
            'unit_price': 'unit_price',
            'سعر التكلفة': 'cost_price',
            'cost price': 'cost_price',
            'cost_price': 'cost_price',
            'الكمية': 'stock_quantity',
            'quantity': 'stock_quantity',
            'stock_quantity': 'stock_quantity',
            'stock': 'stock_quantity',
            'الحد الأدنى': 'min_stock_level',
            'min stock': 'min_stock_level',
            'min_stock_level': 'min_stock_level',
            'الحد الأقصى': 'max_stock_level',
            'max stock': 'max_stock_level',
            'max_stock_level': 'max_stock_level',
            'الوحدة': 'unit',
            'unit': 'unit',
            'الوزن': 'weight',
            'weight': 'weight',
            'الأبعاد': 'dimensions',
            'dimensions': 'dimensions',
            'ماركة السيارة': 'car_brand',
            'car brand': 'car_brand',
            'car_brand': 'car_brand',
            'موديل السيارة': 'car_model',
            'car model': 'car_model',
            'car_model': 'car_model',
            'سنة السيارة': 'car_year',
            'car year': 'car_year',
            'car_year': 'car_year',
            'رقم القطعة': 'part_number',
            'part number': 'part_number',
            'part_number': 'part_number',
            'رقم oem': 'oem_number',
            'oem number': 'oem_number',
            'oem_number': 'oem_number',
            'فترة الضمان': 'warranty_period',
            'warranty': 'warranty_period',
            'warranty_period': 'warranty_period',
            'المورد': 'supplier',
            'supplier': 'supplier'
        };

        return mappings[normalized] || normalized;
    }

    mapHeaders(headers) {
        const mapping = {};
        headers.forEach((header, index) => {
            const normalized = this.normalizeHeader(header);
            mapping[normalized] = index;
        });
        return mapping;
    }

    getFieldDisplayName(field) {
        const displayNames = {
            name: 'اسم المنتج',
            name_en: 'اسم المنتج بالانجليزي',
            description: 'الوصف',
            barcode: 'الباركود',
            sku: 'كود المنتج',
            category: 'الفئة',
            brand: 'الماركة',
            unit_price: 'السعر',
            cost_price: 'سعر التكلفة',
            stock_quantity: 'الكمية',
            min_stock_level: 'الحد الأدنى',
            max_stock_level: 'الحد الأقصى',
            unit: 'الوحدة',
            weight: 'الوزن',
            dimensions: 'الأبعاد',
            car_brand: 'ماركة السيارة',
            car_model: 'موديل السيارة',
            car_year: 'سنة السيارة',
            part_number: 'رقم القطعة',
            oem_number: 'رقم OEM',
            warranty_period: 'فترة الضمان',
            supplier: 'المورد'
        };
        return displayNames[field] || field;
    }

    validateRowData(row, rowIndex, headerMapping) {
        const errors = [];
        const item = {};

        // Extract data based on header mapping
        Object.keys(headerMapping).forEach(field => {
            const columnIndex = headerMapping[field];
            const value = row[columnIndex];
            item[field] = value;
        });

        // Validate each field
        Object.keys(this.validationRules).forEach(field => {
            const rule = this.validationRules[field];
            const value = item[field];

            // Required field validation
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push({
                    row: rowIndex + 2, // +2 because Excel rows start from 1 and we skip header
                    field: field,
                    type: 'required_field_missing',
                    message: `الحقل المطلوب فارغ: ${this.getFieldDisplayName(field)}`
                });
                return;
            }

            // Skip validation if field is empty and not required
            if (!value || value.toString().trim() === '') {
                return;
            }

            // Type validation
            if (rule.type === 'number') {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    errors.push({
                        row: rowIndex + 2,
                        field: field,
                        type: 'invalid_number',
                        message: `قيمة غير صحيحة: ${this.getFieldDisplayName(field)} يجب أن يكون رقماً`
                    });
                    return;
                }

                // Min value validation
                if (rule.min !== undefined && numValue < rule.min) {
                    errors.push({
                        row: rowIndex + 2,
                        field: field,
                        type: 'value_too_small',
                        message: `القيمة صغيرة جداً: ${this.getFieldDisplayName(field)} يجب أن يكون ${rule.min} على الأقل`
                    });
                }

                item[field] = numValue;
            } else if (rule.type === 'string') {
                // String length validation
                if (rule.maxLength && value.toString().length > rule.maxLength) {
                    errors.push({
                        row: rowIndex + 2,
                        field: field,
                        type: 'string_too_long',
                        message: `النص طويل جداً: ${this.getFieldDisplayName(field)} يجب أن يكون ${rule.maxLength} حرف على الأكثر`
                    });
                }
                item[field] = value.toString().trim();
            }
        });

        return {
            item: item,
            errors: errors
        };
    }

    async validateAllData(headers, data) {
        const headerValidation = this.validateHeaders(headers);
        if (!headerValidation.isValid) {
            return {
                isValid: false,
                headerErrors: headerValidation.errors,
                dataErrors: [],
                validItems: [],
                totalRows: data.length
            };
        }

        const dataErrors = [];
        const validItems = [];
        const headerMapping = headerValidation.mappedHeaders;

        data.forEach((row, index) => {
            const validation = this.validateRowData(row, index, headerMapping);
            if (validation.errors.length > 0) {
                dataErrors.push(...validation.errors);
            } else {
                validItems.push(validation.item);
            }
        });

        return {
            isValid: dataErrors.length === 0,
            headerErrors: [],
            dataErrors: dataErrors,
            validItems: validItems,
            totalRows: data.length
        };
    }

    async generateTemplate() {
        const templateData = [
            // Headers
            [
                'اسم المنتج',
                'اسم المنتج بالانجليزي',
                'الوصف',
                'الباركود',
                'كود المنتج',
                'الفئة',
                'الماركة',
                'السعر',
                'سعر التكلفة',
                'الكمية',
                'الحد الأدنى',
                'الحد الأقصى',
                'الوحدة',
                'الوزن',
                'الأبعاد',
                'ماركة السيارة',
                'موديل السيارة',
                'سنة السيارة',
                'رقم القطعة',
                'رقم OEM',
                'فترة الضمان',
                'المورد'
            ],
            // Sample data
            [
                'فلتر زيت محرك',
                'Engine Oil Filter',
                'فلتر زيت محرك عالي الجودة',
                '1234567890123',
                'FILTER-001',
                'فلاتر',
                'بوش',
                '150.00',
                '100.00',
                '50',
                '10',
                '100',
                'قطعة',
                '0.5',
                '10x10x5 سم',
                'تويوتا',
                'كورولا',
                '2020',
                '90915-YZZD2',
                '90915-YZZD2',
                '12',
                'مورد الفلاتر'
            ],
            [
                'شمعة احتراق',
                'Spark Plug',
                'شمعة احتراق عالية الأداء',
                '1234567890124',
                'SPARK-001',
                'شمعات الاحتراق',
                'NGK',
                '25.00',
                '15.00',
                '100',
                '20',
                '200',
                'قطعة',
                '0.1',
                '2x2x2 سم',
                'هونداي',
                'إلنترا',
                '2019',
                'BKR6E',
                'BKR6E',
                '24',
                'مورد الشمعات'
            ]
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        
        // Set column widths
        const columnWidths = [
            { wch: 20 }, // اسم المنتج
            { wch: 20 }, // اسم المنتج بالانجليزي
            { wch: 30 }, // الوصف
            { wch: 15 }, // الباركود
            { wch: 15 }, // كود المنتج
            { wch: 15 }, // الفئة
            { wch: 15 }, // الماركة
            { wch: 10 }, // السعر
            { wch: 10 }, // سعر التكلفة
            { wch: 10 }, // الكمية
            { wch: 10 }, // الحد الأدنى
            { wch: 10 }, // الحد الأقصى
            { wch: 10 }, // الوحدة
            { wch: 10 }, // الوزن
            { wch: 15 }, // الأبعاد
            { wch: 15 }, // ماركة السيارة
            { wch: 15 }, // موديل السيارة
            { wch: 10 }, // سنة السيارة
            { wch: 15 }, // رقم القطعة
            { wch: 15 }, // رقم OEM
            { wch: 10 }, // فترة الضمان
            { wch: 15 }  // المورد
        ];
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'المخزون');

        // Save template
        const templatePath = await this.saveTemplate(workbook);
        return templatePath;
    }

    async saveTemplate(workbook) {
        try {
            const result = await ipcRenderer.invoke('show-save-dialog', {
                title: 'حفظ قالب Excel',
                defaultPath: 'قالب_استيراد_المخزون.xlsx',
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx'] }
                ]
            });

            if (!result.canceled && result.filePath) {
                XLSX.writeFile(workbook, result.filePath);
                return result.filePath;
            }
            return null;
        } catch (error) {
            console.error('Error saving template:', error);
            throw error;
        }
    }

    async importData(items, options = {}) {
        const {
            skipDuplicates = true,
            updateExisting = false,
            createCategories = true,
            createBrands = true,
            createSuppliers = true
        } = options;

        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: []
        };

        for (const item of items) {
            try {
                // Process categories, brands, and suppliers
                if (createCategories && item.category) {
                    await this.ensureCategoryExists(item.category);
                }
                if (createBrands && item.brand) {
                    await this.ensureBrandExists(item.brand);
                }
                if (createSuppliers && item.supplier) {
                    await this.ensureSupplierExists(item.supplier);
                }

                // Check for duplicates
                const existingItem = await this.findDuplicateItem(item);
                
                if (existingItem) {
                    if (updateExisting) {
                        await this.updateExistingItem(existingItem.id, item);
                        results.updated++;
                    } else if (skipDuplicates) {
                        results.skipped++;
                        continue;
                    } else {
                        throw new Error('عنصر موجود مسبقاً');
                    }
                } else {
                    await this.createNewItem(item);
                    results.imported++;
                }
            } catch (error) {
                results.errors.push({
                    item: item,
                    error: error.message
                });
            }
        }

        return results;
    }

    async ensureCategoryExists(categoryName) {
        const databaseManager = require('./simple-database');
        const existing = await databaseManager.getQuery(
            'SELECT id FROM categories WHERE name = ?',
            [categoryName]
        );

        if (!existing) {
            await databaseManager.runQuery(
                'INSERT INTO categories (name) VALUES (?)',
                [categoryName]
            );
        }
    }

    async ensureBrandExists(brandName) {
        const databaseManager = require('./simple-database');
        const existing = await databaseManager.getQuery(
            'SELECT id FROM brands WHERE name = ?',
            [brandName]
        );

        if (!existing) {
            await databaseManager.runQuery(
                'INSERT INTO brands (name) VALUES (?)',
                [brandName]
            );
        }
    }

    async ensureSupplierExists(supplierName) {
        const databaseManager = require('./simple-database');
        const existing = await databaseManager.getQuery(
            'SELECT id FROM suppliers WHERE name = ?',
            [supplierName]
        );

        if (!existing) {
            await databaseManager.runQuery(
                'INSERT INTO suppliers (name) VALUES (?)',
                [supplierName]
            );
        }
    }

    async findDuplicateItem(item) {
        const databaseManager = require('./simple-database');
        
        // Check by barcode first
        if (item.barcode) {
            const byBarcode = await databaseManager.getQuery(
                'SELECT * FROM inventory WHERE barcode = ?',
                [item.barcode]
            );
            if (byBarcode) return byBarcode;
        }

        // Check by SKU
        if (item.sku) {
            const bySku = await databaseManager.getQuery(
                'SELECT * FROM inventory WHERE sku = ?',
                [item.sku]
            );
            if (bySku) return bySku;
        }

        // Check by name and brand
        if (item.name && item.brand) {
            const byNameBrand = await databaseManager.getQuery(
                'SELECT i.* FROM inventory i JOIN brands b ON i.brand_id = b.id WHERE i.name = ? AND b.name = ?',
                [item.name, item.brand]
            );
            if (byNameBrand) return byNameBrand;
        }

        return null;
    }

    async createNewItem(item) {
        const databaseManager = require('./simple-database');
        
        // Get category ID
        const category = await databaseManager.getQuery(
            'SELECT id FROM categories WHERE name = ?',
            [item.category]
        );

        // Get brand ID
        const brand = await databaseManager.getQuery(
            'SELECT id FROM brands WHERE name = ?',
            [item.brand]
        );

        // Get supplier ID
        let supplierId = null;
        if (item.supplier) {
            const supplier = await databaseManager.getQuery(
                'SELECT id FROM suppliers WHERE name = ?',
                [item.supplier]
            );
            supplierId = supplier ? supplier.id : null;
        }

        // Create item
        const itemData = {
            name: item.name,
            name_en: item.name_en || '',
            description: item.description || '',
            barcode: item.barcode || '',
            sku: item.sku || '',
            category_id: category ? category.id : null,
            brand_id: brand ? brand.id : null,
            unit_price: item.unit_price || 0,
            cost_price: item.cost_price || 0,
            stock_quantity: item.stock_quantity || 0,
            min_stock_level: item.min_stock_level || 0,
            max_stock_level: item.max_stock_level || 0,
            unit: item.unit || 'قطعة',
            weight: item.weight || 0,
            dimensions: item.dimensions || '',
            car_brand: item.car_brand || '',
            car_model: item.car_model || '',
            car_year: item.car_year || '',
            part_number: item.part_number || '',
            oem_number: item.oem_number || '',
            warranty_period: item.warranty_period || 0,
            supplier_id: supplierId
        };

        return await databaseManager.addInventoryItem(itemData);
    }

    async updateExistingItem(itemId, item) {
        const databaseManager = require('./simple-database');
        
        // Get category ID
        const category = await databaseManager.getQuery(
            'SELECT id FROM categories WHERE name = ?',
            [item.category]
        );

        // Get brand ID
        const brand = await databaseManager.getQuery(
            'SELECT id FROM brands WHERE name = ?',
            [item.brand]
        );

        // Get supplier ID
        let supplierId = null;
        if (item.supplier) {
            const supplier = await databaseManager.getQuery(
                'SELECT id FROM suppliers WHERE name = ?',
                [item.supplier]
            );
            supplierId = supplier ? supplier.id : null;
        }

        // Update item
        const itemData = {
            name: item.name,
            name_en: item.name_en || '',
            description: item.description || '',
            barcode: item.barcode || '',
            sku: item.sku || '',
            category_id: category ? category.id : null,
            brand_id: brand ? brand.id : null,
            unit_price: item.unit_price || 0,
            cost_price: item.cost_price || 0,
            stock_quantity: item.stock_quantity || 0,
            min_stock_level: item.min_stock_level || 0,
            max_stock_level: item.max_stock_level || 0,
            unit: item.unit || 'قطعة',
            weight: item.weight || 0,
            dimensions: item.dimensions || '',
            car_brand: item.car_brand || '',
            car_model: item.car_model || '',
            car_year: item.car_year || '',
            part_number: item.part_number || '',
            oem_number: item.oem_number || '',
            warranty_period: item.warranty_period || 0,
            supplier_id: supplierId
        };

        return await databaseManager.updateInventoryItem(itemId, itemData);
    }

    formatImportResults(results) {
        const summary = `
            تم استيراد ${results.imported} عنصر جديد
            تم تحديث ${results.updated} عنصر موجود
            تم تخطي ${results.skipped} عنصر مكرر
            ${results.errors.length > 0 ? `حدث ${results.errors.length} خطأ` : 'لا توجد أخطاء'}
        `;

        return {
            summary: summary,
            details: results
        };
    }
}

// Export singleton instance
const excelImportManager = new ExcelImportManager();
module.exports = excelImportManager;
