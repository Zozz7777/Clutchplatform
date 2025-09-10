// Category Management System for Clutch Auto Parts System
const databaseManager = require('./simple-database');
const apiManager = require('./api');
const uiManager = require('./ui');

class CategoryManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
    }

    async loadCategories() {
        try {
            this.categories = await databaseManager.allQuery(
                'SELECT * FROM categories ORDER BY name'
            );
            return this.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }

    async addCategory(categoryData) {
        try {
            // Validate category data
            const validation = this.validateCategory(categoryData);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Check for duplicate name
            const existing = await databaseManager.getQuery(
                'SELECT id FROM categories WHERE name = ?',
                [categoryData.name]
            );

            if (existing) {
                throw new Error('الفئة موجودة مسبقاً');
            }

            // Add to database
            const result = await databaseManager.runQuery(
                'INSERT INTO categories (name, name_en, description, parent_id) VALUES (?, ?, ?, ?)',
                [
                    categoryData.name,
                    categoryData.name_en || '',
                    categoryData.description || '',
                    categoryData.parent_id || null
                ]
            );

            // Reload categories
            await this.loadCategories();

            // Sync with backend
            try {
                await apiManager.syncCategory({
                    id: result.id,
                    name: categoryData.name,
                    name_en: categoryData.name_en,
                    description: categoryData.description,
                    parent_id: categoryData.parent_id
                });
            } catch (syncError) {
                console.error('Error syncing category:', syncError);
                // Don't throw error as local save was successful
            }

            return result;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    }

    async updateCategory(id, categoryData) {
        try {
            // Validate category data
            const validation = this.validateCategory(categoryData);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Check for duplicate name (excluding current category)
            const existing = await databaseManager.getQuery(
                'SELECT id FROM categories WHERE name = ? AND id != ?',
                [categoryData.name, id]
            );

            if (existing) {
                throw new Error('الفئة موجودة مسبقاً');
            }

            // Update in database
            const result = await databaseManager.runQuery(
                'UPDATE categories SET name = ?, name_en = ?, description = ?, parent_id = ? WHERE id = ?',
                [
                    categoryData.name,
                    categoryData.name_en || '',
                    categoryData.description || '',
                    categoryData.parent_id || null,
                    id
                ]
            );

            // Reload categories
            await this.loadCategories();

            // Sync with backend
            try {
                await apiManager.syncCategory({
                    id: id,
                    name: categoryData.name,
                    name_en: categoryData.name_en,
                    description: categoryData.description,
                    parent_id: categoryData.parent_id
                });
            } catch (syncError) {
                console.error('Error syncing category:', syncError);
            }

            return result;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            // Check if category is used by any items
            const itemsCount = await databaseManager.getQuery(
                'SELECT COUNT(*) as count FROM inventory WHERE category_id = ?',
                [id]
            );

            if (itemsCount.count > 0) {
                throw new Error(`لا يمكن حذف هذه الفئة لأنها مستخدمة في ${itemsCount.count} عنصر`);
            }

            // Check if category has subcategories
            const subcategoriesCount = await databaseManager.getQuery(
                'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
                [id]
            );

            if (subcategoriesCount.count > 0) {
                throw new Error(`لا يمكن حذف هذه الفئة لأنها تحتوي على ${subcategoriesCount.count} فئة فرعية`);
            }

            // Delete category
            const result = await databaseManager.runQuery(
                'DELETE FROM categories WHERE id = ?',
                [id]
            );

            // Reload categories
            await this.loadCategories();

            return result;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    validateCategory(categoryData) {
        if (!categoryData.name || categoryData.name.trim() === '') {
            return { isValid: false, message: 'اسم الفئة مطلوب' };
        }

        if (categoryData.name.length > 100) {
            return { isValid: false, message: 'اسم الفئة طويل جداً' };
        }

        if (categoryData.name_en && categoryData.name_en.length > 100) {
            return { isValid: false, message: 'اسم الفئة بالانجليزي طويل جداً' };
        }

        if (categoryData.description && categoryData.description.length > 500) {
            return { isValid: false, message: 'وصف الفئة طويل جداً' };
        }

        return { isValid: true, message: 'صحيح' };
    }

    getCategoryById(id) {
        return this.categories.find(category => category.id === id);
    }

    getCategoryByName(name) {
        return this.categories.find(category => category.name === name);
    }

    getSubcategories(parentId) {
        return this.categories.filter(category => category.parent_id === parentId);
    }

    getTopLevelCategories() {
        return this.categories.filter(category => !category.parent_id);
    }

    getCategoryTree() {
        const tree = [];
        const topLevelCategories = this.getTopLevelCategories();

        topLevelCategories.forEach(category => {
            const categoryNode = {
                ...category,
                children: this.buildCategoryTree(category.id)
            };
            tree.push(categoryNode);
        });

        return tree;
    }

    buildCategoryTree(parentId) {
        const children = this.getSubcategories(parentId);
        return children.map(category => ({
            ...category,
            children: this.buildCategoryTree(category.id)
        }));
    }

    getCategoryPath(categoryId) {
        const path = [];
        let currentCategory = this.getCategoryById(categoryId);

        while (currentCategory) {
            path.unshift(currentCategory);
            currentCategory = currentCategory.parent_id ? 
                this.getCategoryById(currentCategory.parent_id) : null;
        }

        return path;
    }

    getCategoryPathString(categoryId, separator = ' > ') {
        const path = this.getCategoryPath(categoryId);
        return path.map(category => category.name).join(separator);
    }

    async getCategoryStats(categoryId) {
        try {
            const stats = await databaseManager.getQuery(`
                SELECT 
                    COUNT(*) as total_items,
                    SUM(stock_quantity) as total_stock,
                    SUM(unit_price * stock_quantity) as total_value,
                    AVG(unit_price) as avg_price
                FROM inventory 
                WHERE category_id = ? AND is_active = 1
            `, [categoryId]);

            return {
                total_items: stats.total_items || 0,
                total_stock: stats.total_stock || 0,
                total_value: stats.total_value || 0,
                avg_price: stats.avg_price || 0
            };
        } catch (error) {
            console.error('Error getting category stats:', error);
            return {
                total_items: 0,
                total_stock: 0,
                total_value: 0,
                avg_price: 0
            };
        }
    }

    async getAllCategoriesStats() {
        try {
            const stats = await databaseManager.allQuery(`
                SELECT 
                    c.id,
                    c.name,
                    COUNT(i.id) as total_items,
                    SUM(i.stock_quantity) as total_stock,
                    SUM(i.unit_price * i.stock_quantity) as total_value,
                    AVG(i.unit_price) as avg_price
                FROM categories c
                LEFT JOIN inventory i ON c.id = i.category_id AND i.is_active = 1
                GROUP BY c.id, c.name
                ORDER BY c.name
            `);

            return stats;
        } catch (error) {
            console.error('Error getting all categories stats:', error);
            return [];
        }
    }

    // Search categories
    searchCategories(query) {
        if (!query || query.trim() === '') {
            return this.categories;
        }

        const searchTerm = query.toLowerCase();
        return this.categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm) ||
            (category.name_en && category.name_en.toLowerCase().includes(searchTerm)) ||
            (category.description && category.description.toLowerCase().includes(searchTerm))
        );
    }

    // Get categories for dropdown
    getCategoriesForDropdown(includeEmpty = true) {
        const options = [];
        
        if (includeEmpty) {
            options.push({ value: '', text: 'اختر الفئة' });
        }

        this.categories.forEach(category => {
            options.push({
                value: category.id,
                text: category.name
            });
        });

        return options;
    }

    // Get category hierarchy for dropdown
    getCategoryHierarchyForDropdown(includeEmpty = true) {
        const options = [];
        
        if (includeEmpty) {
            options.push({ value: '', text: 'اختر الفئة' });
        }

        const addCategoryToOptions = (category, level = 0) => {
            const indent = '  '.repeat(level);
            options.push({
                value: category.id,
                text: `${indent}${category.name}`
            });

            const subcategories = this.getSubcategories(category.id);
            subcategories.forEach(subcategory => {
                addCategoryToOptions(subcategory, level + 1);
            });
        };

        const topLevelCategories = this.getTopLevelCategories();
        topLevelCategories.forEach(category => {
            addCategoryToOptions(category);
        });

        return options;
    }

    // Bulk operations
    async bulkUpdateCategories(updates) {
        const results = {
            success: 0,
            errors: []
        };

        for (const update of updates) {
            try {
                await this.updateCategory(update.id, update.data);
                results.success++;
            } catch (error) {
                results.errors.push({
                    id: update.id,
                    error: error.message
                });
            }
        }

        return results;
    }

    async bulkDeleteCategories(ids) {
        const results = {
            success: 0,
            errors: []
        };

        for (const id of ids) {
            try {
                await this.deleteCategory(id);
                results.success++;
            } catch (error) {
                results.errors.push({
                    id: id,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Export/Import
    async exportCategories() {
        try {
            const categories = await this.loadCategories();
            const exportData = categories.map(category => ({
                name: category.name,
                name_en: category.name_en,
                description: category.description,
                parent_name: category.parent_id ? this.getCategoryById(category.parent_id)?.name : ''
            }));

            return exportData;
        } catch (error) {
            console.error('Error exporting categories:', error);
            throw error;
        }
    }

    async importCategories(categoriesData) {
        const results = {
            imported: 0,
            updated: 0,
            errors: []
        };

        for (const categoryData of categoriesData) {
            try {
                // Check if category exists
                const existing = this.getCategoryByName(categoryData.name);
                
                if (existing) {
                    // Update existing category
                    await this.updateCategory(existing.id, categoryData);
                    results.updated++;
                } else {
                    // Add new category
                    await this.addCategory(categoryData);
                    results.imported++;
                }
            } catch (error) {
                results.errors.push({
                    category: categoryData.name,
                    error: error.message
                });
            }
        }

        return results;
    }
}

// Export singleton instance
const categoryManager = new CategoryManager();
module.exports = categoryManager;
