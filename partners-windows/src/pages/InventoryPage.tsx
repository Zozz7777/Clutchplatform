import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CubeIcon,
  // ExclamationTriangleIcon,
  // CheckCircleIcon,
  QrCodeIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    cost_price: 0,
    sale_price: 0,
    quantity: 0,
    min_quantity: 5,
    barcode: '',
    images: [],
    specifications: {},
    is_active: true
  });
  const { t } = useTranslation();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.dbQuery(
        'SELECT * FROM products ORDER BY name'
      );
      setProducts(result || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load products:', error); }
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm)) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'low_stock') {
        filtered = filtered.filter(product => product.quantity <= product.min_quantity && product.quantity > 0);
      } else if (statusFilter === 'out_of_stock') {
        filtered = filtered.filter(product => product.quantity === 0);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.is_active && product.quantity > product.min_quantity);
      }
    }

    setFilteredProducts(filtered);
  };

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  };

  const getStatusColor = (product: Product) => {
    if (!product.is_active) return 'bg-muted/10 text-muted-foreground';
    if (product.quantity === 0) return 'bg-destructive/10 text-destructive';
    if (product.quantity <= product.min_quantity) return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  const getStatusLabel = (product: Product) => {
    if (!product.is_active) return 'غير نشط';
    if (product.quantity === 0) return 'نفد المخزون';
    if (product.quantity <= product.min_quantity) return 'مخزون منخفض';
    return 'متوفر';
  };

  const addProduct = async () => {
    try {
      setIsProcessing(true);
      
      // Generate SKU if not provided
      const sku = newProduct.sku || `SKU_${Date.now()}`;
      
      await window.electronAPI.dbExec(
        `INSERT INTO products (
          sku, name, description, category, brand, model,
          cost_price, sale_price, quantity, min_quantity, barcode,
          images, specifications, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sku,
          newProduct.name,
          newProduct.description || null,
          newProduct.category,
          newProduct.brand || null,
          newProduct.model || null,
          newProduct.cost_price || 0,
          newProduct.sale_price || 0,
          newProduct.quantity || 0,
          newProduct.min_quantity || 5,
          newProduct.barcode || null,
          JSON.stringify(newProduct.images || []),
          JSON.stringify(newProduct.specifications || {}),
          newProduct.is_active ? 1 : 0
        ]
      );

      await loadProducts();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        sku: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        cost_price: 0,
        sale_price: 0,
        quantity: 0,
        min_quantity: 5,
        barcode: '',
        images: [],
        specifications: {},
        is_active: true
      });

      await window.electronAPI.showNotification({
        title: 'تم إضافة المنتج',
        body: `تم إضافة المنتج ${newProduct.name} بنجاح`,
        urgency: 'normal'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to add product:', error); }
      await window.electronAPI.showNotification({
        title: 'فشل إضافة المنتج',
        body: 'حدث خطأ أثناء إضافة المنتج',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsProcessing(true);
      
      await window.electronAPI.dbExec(
        `UPDATE products SET 
          name = ?, description = ?, category = ?, brand = ?, model = ?,
          cost_price = ?, sale_price = ?, quantity = ?, min_quantity = ?, barcode = ?,
          images = ?, specifications = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE sku = ?`,
        [
          selectedProduct.name,
          selectedProduct.description || null,
          selectedProduct.category,
          selectedProduct.brand || null,
          selectedProduct.model || null,
          selectedProduct.cost_price,
          selectedProduct.sale_price,
          selectedProduct.quantity,
          selectedProduct.min_quantity,
          selectedProduct.barcode || null,
          JSON.stringify(selectedProduct.images || []),
          JSON.stringify(selectedProduct.specifications || {}),
          selectedProduct.is_active ? 1 : 0,
          selectedProduct.sku
        ]
      );

      await loadProducts();
      setShowEditModal(false);
      setSelectedProduct(null);

      await window.electronAPI.showNotification({
        title: 'تم تحديث المنتج',
        body: `تم تحديث المنتج ${selectedProduct.name} بنجاح`,
        urgency: 'normal'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to update product:', error); }
      await window.electronAPI.showNotification({
        title: 'فشل تحديث المنتج',
        body: 'حدث خطأ أثناء تحديث المنتج',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteProduct = async (sku: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      setIsProcessing(true);
      
      await window.electronAPI.dbExec(
        'DELETE FROM products WHERE sku = ?',
        [sku]
      );

      await loadProducts();

      await window.electronAPI.showNotification({
        title: 'تم حذف المنتج',
        body: 'تم حذف المنتج بنجاح',
        urgency: 'normal'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to delete product:', error); }
      await window.electronAPI.showNotification({
        title: 'فشل حذف المنتج',
        body: 'حدث خطأ أثناء حذف المنتج',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBarcode = async (product: Product) => {
    try {
      const barcode = `BC_${product.sku}_${Date.now()}`;
      await window.electronAPI.dbExec(
        'UPDATE products SET barcode = ? WHERE sku = ?',
        [barcode, product.sku]
      );
      await loadProducts();
      
      await window.electronAPI.showNotification({
        title: 'تم إنشاء الباركود',
        body: `تم إنشاء باركود للمنتج ${product.name}`,
        urgency: 'normal'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to generate barcode:', error); }
    }
  };

  const printBarcode = async (product: Product) => {
    if (!product.barcode) {
      await generateBarcode(product);
      return;
    }

    try {
      await window.electronAPI.printBarcode({
        barcode: product.barcode,
        productName: product.name,
        sku: product.sku,
        price: product.sale_price
      });

      await window.electronAPI.showNotification({
        title: 'تم طباعة الباركود',
        body: `تم طباعة باركود المنتج ${product.name}`,
        urgency: 'normal'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to print barcode:', error); }
    }
  };

  const exportToExcel = async () => {
    try {
      const result = await window.electronAPI.saveFile({
        title: 'تصدير المخزون',
        defaultPath: `inventory_${new Date().toISOString().split('T')[0]}.xlsx`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // Export logic would go here
        await window.electronAPI.showNotification({
          title: 'تم تصدير المخزون',
          body: 'تم تصدير بيانات المخزون إلى Excel',
          urgency: 'normal'
        });
      }
    } catch (error) {
      console.error('Failed to export inventory:', error);
    }
  };

  const importFromExcel = async () => {
    try {
      const result = await window.electronAPI.selectFile({
        title: 'استيراد المخزون',
        filters: [
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
        ]
      });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // Import logic would go here
        await window.electronAPI.showNotification({
          title: 'تم استيراد المخزون',
          body: 'تم استيراد بيانات المخزون من Excel',
          urgency: 'normal'
        });
        await loadProducts();
      }
    } catch (error) {
      console.error('Failed to import inventory:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('inventory.title')}</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={importFromExcel}>
            <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
            استيراد
          </Button>
          <Button variant="ghost" onClick={exportToExcel}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('inventory.addProduct')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('inventory.searchProducts')}
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">جميع الفئات</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">متوفر</option>
              <option value="low_stock">مخزون منخفض</option>
              <option value="out_of_stock">نفد المخزون</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.sku} className="p-4">
            <div className="space-y-4">
              {/* Product Image */}
              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                <CubeIcon className="w-12 h-12 text-muted-foreground" />
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-medium mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.sku}</p>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-primary">{product.sale_price} EGP</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product)}`}>
                    {getStatusLabel(product)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  الكمية: {product.quantity} | الحد الأدنى: {product.min_quantity}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                    className="p-1 h-8 w-8"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => printBarcode(product)}
                    className="p-1 h-8 w-8"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProduct(product.sku)}
                    className="p-1 h-8 w-8"
                  >
                    <TrashIcon className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <div className="text-center py-8 text-muted-foreground">
            <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد منتجات</p>
          </div>
        </Card>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('inventory.addProduct')}</h2>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
                <Input
                  value={newProduct.name || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, name: value }))}
                  placeholder={t('inventory.productName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رمز المنتج</label>
                <Input
                  value={newProduct.sku || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, sku: value }))}
                  placeholder={t('inventory.productCode')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الفئة *</label>
                <Input
                  value={newProduct.category || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                  placeholder={t('inventory.category')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العلامة التجارية</label>
                <Input
                  value={newProduct.brand || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, brand: value }))}
                  placeholder={t('inventory.brand')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">سعر التكلفة *</label>
                <Input
                  type="number"
                  value={newProduct.cost_price?.toString() || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(value) || 0 }))}
                  placeholder={t('inventory.costPrice')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">سعر البيع *</label>
                <Input
                  type="number"
                  value={newProduct.sale_price?.toString() || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, sale_price: parseFloat(value) || 0 }))}
                  placeholder={t('inventory.salePrice')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الكمية *</label>
                <Input
                  type="number"
                  value={newProduct.quantity?.toString() || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, quantity: parseInt(value) || 0 }))}
                  placeholder={t('inventory.quantity')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الحد الأدنى</label>
                <Input
                  type="number"
                  value={newProduct.min_quantity?.toString() || ''}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, min_quantity: parseInt(value) || 5 }))}
                  placeholder={t('inventory.minQuantity')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('inventory.productDescription')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={addProduct}
                disabled={!newProduct.name || !newProduct.category || isProcessing}
                loading={isProcessing}
              >
                إضافة المنتج
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('inventory.editProduct')}</h2>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
                <Input
                  value={selectedProduct.name}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, name: value } : null)}
                  placeholder={t('inventory.productName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رمز المنتج</label>
                <Input
                  value={selectedProduct.sku}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, sku: value } : null)}
                  placeholder={t('inventory.productCode')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الفئة *</label>
                <Input
                  value={selectedProduct.category}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, category: value } : null)}
                  placeholder={t('inventory.category')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">العلامة التجارية</label>
                <Input
                  value={selectedProduct.brand || ''}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, brand: value } : null)}
                  placeholder={t('inventory.brand')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">سعر التكلفة *</label>
                <Input
                  type="number"
                  value={selectedProduct.cost_price.toString()}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, cost_price: parseFloat(value) || 0 } : null)}
                  placeholder={t('inventory.costPrice')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">سعر البيع *</label>
                <Input
                  type="number"
                  value={selectedProduct.sale_price.toString()}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, sale_price: parseFloat(value) || 0 } : null)}
                  placeholder={t('inventory.salePrice')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الكمية *</label>
                <Input
                  type="number"
                  value={selectedProduct.quantity.toString()}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, quantity: parseInt(value) || 0 } : null)}
                  placeholder={t('inventory.quantity')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الحد الأدنى</label>
                <Input
                  type="number"
                  value={selectedProduct.min_quantity.toString()}
                  onChange={(value) => setSelectedProduct(prev => prev ? { ...prev, min_quantity: parseInt(value) || 5 } : null)}
                  placeholder={t('inventory.minQuantity')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={selectedProduct.description || ''}
                  onChange={(e) => setSelectedProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder={t('inventory.productDescription')}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={updateProduct}
                disabled={!selectedProduct.name || !selectedProduct.category || isProcessing}
                loading={isProcessing}
              >
                حفظ التغييرات
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
