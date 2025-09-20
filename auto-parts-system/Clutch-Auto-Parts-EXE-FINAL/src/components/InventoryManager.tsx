// src/components/InventoryManager.tsx
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface Product {
  id: number;
  sku: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  category_id: number;
  brand_id: number;
  barcode?: string;
  cost_price: number;
  selling_price: number;
  min_stock: number;
  current_stock: number;
  max_stock?: number;
  unit: string;
  weight?: number;
  dimensions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  parent_id?: number;
  is_active: boolean;
}

interface Brand {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  logo_url?: string;
  is_active: boolean;
}

const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load products, categories, and brands from API
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/inventory/products'),
        fetch('/api/inventory/categories'),
        fetch('/api/inventory/brands')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data || []);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.data || []);
      }
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.name_ar.includes(searchTerm) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand_id === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm(i18nManager.t('confirm_delete_product'))) {
      try {
        const response = await fetch(`/api/inventory/products/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId));
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/inventory/export/excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to export inventory');
      console.error('Error exporting inventory:', err);
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/inventory/import/excel', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await loadData(); // Reload data after import
        alert(i18nManager.t('import_successful'));
      } else {
        setError('Failed to import inventory');
      }
    } catch (err) {
      setError('Failed to import inventory');
      console.error('Error importing inventory:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{i18nManager.t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h2>{i18nManager.t('inventory')}</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            📊 {i18nManager.t('export_excel')}
          </button>
          <label className="btn btn-secondary">
            📥 {i18nManager.t('import_excel')}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            ➕ {i18nManager.t('add_product')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="inventory-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder={i18nManager.t('search_products')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">{i18nManager.t('all_categories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {i18nManager.getCurrentLanguage() === 'ar' ? category.name_ar : category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={selectedBrand || ''}
            onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">{i18nManager.t('all_brands')}</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {i18nManager.getCurrentLanguage() === 'ar' ? brand.name_ar : brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat-card">
          <h3>{i18nManager.t('total_products')}</h3>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('low_stock_items')}</h3>
          <div className="stat-value warning">
            {products.filter(p => p.current_stock <= p.min_stock).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('out_of_stock')}</h3>
          <div className="stat-value danger">
            {products.filter(p => p.current_stock === 0).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('total_value')}</h3>
          <div className="stat-value">
            {i18nManager.formatCurrency(
              products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0)
            )}
          </div>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>{i18nManager.t('sku')}</th>
              <th>{i18nManager.t('product_name')}</th>
              <th>{i18nManager.t('category')}</th>
              <th>{i18nManager.t('brand')}</th>
              <th>{i18nManager.t('stock_quantity')}</th>
              <th>{i18nManager.t('cost_price')}</th>
              <th>{i18nManager.t('selling_price')}</th>
              <th>{i18nManager.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const category = categories.find(c => c.id === product.category_id);
              const brand = brands.find(b => b.id === product.brand_id);
              const isLowStock = product.current_stock <= product.min_stock;
              const isOutOfStock = product.current_stock === 0;

              return (
                <tr key={product.id} className={isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}>
                  <td>{product.sku}</td>
                  <td>
                    <div className="product-name">
                      {i18nManager.getCurrentLanguage() === 'ar' ? product.name_ar : product.name}
                    </div>
                    {product.barcode && (
                      <div className="product-barcode">📊 {product.barcode}</div>
                    )}
                  </td>
                  <td>
                    {category ? (
                      i18nManager.getCurrentLanguage() === 'ar' ? category.name_ar : category.name
                    ) : '-'}
                  </td>
                  <td>
                    {brand ? (
                      i18nManager.getCurrentLanguage() === 'ar' ? brand.name_ar : brand.name
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`stock-level ${isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}`}>
                      {product.current_stock} {product.unit}
                    </span>
                    {isLowStock && (
                      <div className="min-stock">Min: {product.min_stock}</div>
                    )}
                  </td>
                  <td>{i18nManager.formatCurrency(product.cost_price)}</td>
                  <td>{i18nManager.formatCurrency(product.selling_price)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditProduct(product)}
                        title={i18nManager.t('edit_product')}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                        title={i18nManager.t('delete_product')}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddProduct && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => setShowAddProduct(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};

// Product Modal Component
interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, categories, brands, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    name_ar: product?.name_ar || '',
    description: product?.description || '',
    description_ar: product?.description_ar || '',
    category_id: product?.category_id || 0,
    brand_id: product?.brand_id || 0,
    barcode: product?.barcode || '',
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    min_stock: product?.min_stock || 0,
    max_stock: product?.max_stock || 0,
    unit: product?.unit || 'pcs',
    weight: product?.weight || 0,
    dimensions: product?.dimensions || '',
    is_active: product?.is_active ?? true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = product ? `/api/inventory/products/${product.id}` : '/api/inventory/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save product');
      }
    } catch (err) {
      setError('Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = () => {
    const barcode = i18nManager.t('generate_barcode');
    setFormData(prev => ({ ...prev, barcode }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? i18nManager.t('edit_product') : i18nManager.t('add_product')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('product_name')} (EN)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('product_name')} (AR)</label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('category')}</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                required
              >
                <option value={0}>{i18nManager.t('select_category')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {i18nManager.getCurrentLanguage() === 'ar' ? category.name_ar : category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{i18nManager.t('brand')}</label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData(prev => ({ ...prev, brand_id: Number(e.target.value) }))}
                required
              >
                <option value={0}>{i18nManager.t('select_brand')}</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {i18nManager.getCurrentLanguage() === 'ar' ? brand.name_ar : brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('barcode')}</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                />
                <button type="button" onClick={generateBarcode} className="btn btn-sm">
                  🎲 {i18nManager.t('generate')}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>{i18nManager.t('unit')}</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="pcs">{i18nManager.t('pieces')}</option>
                <option value="kg">{i18nManager.t('kilograms')}</option>
                <option value="g">{i18nManager.t('grams')}</option>
                <option value="l">{i18nManager.t('liters')}</option>
                <option value="ml">{i18nManager.t('milliliters')}</option>
                <option value="m">{i18nManager.t('meters')}</option>
                <option value="cm">{i18nManager.t('centimeters')}</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('cost_price')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('selling_price')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('min_stock')}</label>
              <input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, min_stock: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('max_stock')}</label>
              <input
                type="number"
                value={formData.max_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, max_stock: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('weight')} (kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('dimensions')}</label>
              <input
                type="text"
                placeholder="L x W x H"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              {i18nManager.t('active')}
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {i18nManager.t('cancel')}
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? i18nManager.t('saving') : i18nManager.t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryManager;
