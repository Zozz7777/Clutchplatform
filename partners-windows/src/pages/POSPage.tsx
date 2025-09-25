import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product, CartItem } from '../types';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon,
  // PrinterIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  CubeIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const POSPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'visa' | 'instapay' | 'wallet'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadProducts();
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.dbQuery(
        'SELECT * FROM products WHERE is_active = 1 ORDER BY name'
      );
      setProducts(result || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load products:', error); }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.sku === product.sku);
      if (existingItem) {
        return prev.map(item =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity: 1,
          price: product.sale_price,
          discount: 0
        }];
      }
    });
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const updateCartItemQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.sku === sku ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(item => item.product.sku !== sku));
  };

  const updateCartItemPrice = (sku: string, price: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.sku === sku ? { ...item, price } : item
      )
    );
  };

  const updateCartItemDiscount = (sku: string, discount: number) => {
    setCart(prev =>
      prev.map(item =>
        item.product.sku === sku ? { ...item, discount } : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
  const tax = (subtotal - totalDiscount) * 0.14; // 14% VAT
  const total = subtotal - totalDiscount + tax;

  const processPayment = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessing(true);
      
      const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Create order
      await window.electronAPI.dbExec(
        `INSERT INTO orders (
          order_id, customer_name, customer_phone, customer_email,
          items, subtotal, tax, discount, total, payment_method,
          payment_status, order_status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          customerInfo.name || null,
          customerInfo.phone || null,
          customerInfo.email || null,
          JSON.stringify(cart),
          subtotal,
          tax,
          totalDiscount,
          total,
          paymentMethod,
          'paid',
          'completed',
          1 // User ID
        ]
      );

      // Create payment record
      await window.electronAPI.dbExec(
        `INSERT INTO payments (payment_id, order_id, amount, method, status, reference)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          orderId,
          total,
          paymentMethod,
          'completed',
          `REF_${Date.now()}`
        ]
      );

      // Update product quantities
      for (const item of cart) {
        await window.electronAPI.dbExec(
          'UPDATE products SET quantity = quantity - ? WHERE sku = ?',
          [item.quantity, item.product.sku]
        );
      }

      // Print receipt
      await window.electronAPI.printReceipt({
        orderId,
        items: cart,
        subtotal,
        tax,
        discount: totalDiscount,
        total,
        paymentMethod,
        customerInfo,
        timestamp: new Date().toISOString()
      });

      // Clear cart and reset form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', email: '' });
      setPaymentMethod('cash');
      setSearchTerm('');

      // Show success message
      await window.electronAPI.showNotification({
        title: 'تم الدفع بنجاح',
        body: `تم إكمال الطلب ${orderId} بنجاح`,
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Payment processing failed:', error);
      await window.electronAPI.showNotification({
        title: 'فشل الدفع',
        body: 'حدث خطأ أثناء معالجة الدفع',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const _handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    } else {
      setSearchTerm(barcode);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search and Selection */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search Bar */}
        <Card>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t('pos.searchProduct')}
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Products Grid */}
        <Card title={t('pos.products')}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.sku}
                  className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <CubeIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                    <p className="font-bold text-primary">{product.sale_price} EGP</p>
                    <p className="text-xs text-muted-foreground">
                      متوفر: {product.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Cart and Checkout */}
      <div className="space-y-6">
        {/* Cart */}
        <Card title={`السلة (${cart.length})`}>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.sku} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product.sku)}
                    className="p-1 h-6 w-6"
                  >
                    <TrashIcon className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">الكمية:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.product.sku, item.quantity - 1)}
                        className="p-1 h-6 w-6"
                      >
                        <MinusIcon className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.product.sku, item.quantity + 1)}
                        className="p-1 h-6 w-6"
                      >
                        <PlusIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">السعر:</span>
                    <Input
                      type="number"
                      value={String(item.price)}
                      onChange={(value) => updateCartItemPrice(item.product.sku, parseFloat(value) || 0)}
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">خصم:</span>
                    <Input
                      type="number"
                      value={String(item.discount || 0)}
                      onChange={(value) => updateCartItemDiscount(item.product.sku, parseFloat(value) || 0)}
                      className="w-20 h-6 text-xs"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium">المجموع:</span>
                    <span className="text-sm font-bold">
                      {((item.price - (item.discount || 0)) * item.quantity).toFixed(2)} EGP
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {cart.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>السلة فارغة</p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Summary */}
        {cart.length > 0 && (
          <Card title={t('pos.orderSummary')}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span className="text-success">-{totalDiscount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة (14%):</span>
                <span>{tax.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span>{total.toFixed(2)} EGP</span>
              </div>
            </div>
          </Card>
        )}

        {/* Customer Info */}
        <Card title={t('pos.customerInfo')}>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder={t('pos.customerName')}
              value={customerInfo.name}
              onChange={(value) => setCustomerInfo(prev => ({ ...prev, name: value }))}
            />
            <Input
              type="tel"
              placeholder={t('pos.customerPhone')}
              value={customerInfo.phone}
              onChange={(value) => setCustomerInfo(prev => ({ ...prev, phone: value }))}
            />
            <Input
              type="email"
              placeholder={t('pos.customerEmail')}
              value={customerInfo.email}
              onChange={(value) => setCustomerInfo(prev => ({ ...prev, email: value }))}
            />
          </div>
        </Card>

        {/* Payment Method */}
        <Card title={t('pos.paymentMethod')}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'cash', label: 'نقداً', icon: BanknotesIcon },
              { key: 'card', label: 'بطاقة', icon: CreditCardIcon },
              { key: 'visa', label: 'فيزا', icon: CreditCardIcon },
              { key: 'instapay', label: 'إنستاباي', icon: QrCodeIcon },
              { key: 'wallet', label: 'محفظة', icon: QrCodeIcon }
            ].map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.key}
                  variant={paymentMethod === method.key ? 'primary' : 'ghost'}
                  onClick={() => setPaymentMethod(method.key as any)}
                  className="h-12 flex flex-col items-center justify-center"
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{method.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Checkout Button */}
        {cart.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            onClick={processPayment}
            disabled={isProcessing}
            loading={isProcessing}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                جاري المعالجة...
              </div>
            ) : (
              `دفع ${total.toFixed(2)} EGP`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default POSPage;
