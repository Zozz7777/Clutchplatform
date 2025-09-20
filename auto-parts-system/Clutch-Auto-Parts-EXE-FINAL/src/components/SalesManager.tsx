// src/components/SalesManager.tsx
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface Product {
  id: number;
  sku: string;
  name: string;
  name_ar: string;
  selling_price: number;
  current_stock: number;
  unit: string;
  barcode?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points: number;
  credit_limit: number;
  current_credit: number;
}

interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  subtotal: number;
  total_discount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'Cash' | 'Visa' | 'InstaPay' | 'Wallet';
  payment_status: 'pending' | 'completed' | 'refunded';
  items: CartItem[];
  created_at: string;
}

const SalesManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Visa' | 'InstaPay' | 'Wallet'>('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [taxShortcutUsed, setTaxShortcutUsed] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes] = await Promise.all([
        fetch('/api/inventory/products?active_only=true'),
        fetch('/api/customers')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.data || []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name_ar.includes(searchTerm) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.current_stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price - item.discount }
            : item
        ));
      } else {
        setError(i18nManager.t('insufficient_stock'));
      }
    } else {
      if (product.current_stock > 0) {
        setCart([...cart, {
          product,
          quantity: 1,
          unit_price: product.selling_price,
          discount: 0,
          total_price: product.selling_price
        }]);
      } else {
        setError(i18nManager.t('out_of_stock'));
      }
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity > product.current_stock) {
      setError(i18nManager.t('insufficient_stock'));
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity, total_price: quantity * item.unit_price - item.discount }
        : item
    ));
  };

  const updateCartItemDiscount = (productId: number, discount: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const maxDiscount = item.quantity * item.unit_price;
        const actualDiscount = Math.min(discount, maxDiscount);
        return {
          ...item,
          discount: actualDiscount,
          total_price: (item.quantity * item.unit_price) - actualDiscount
        };
      }
      return item;
    }));
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      setError(i18nManager.t('product_not_found'));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTotalDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return Math.min(discountValue, subtotal);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const taxableAmount = subtotal - discount;
    return taxableAmount * 0.15; // 15% VAT
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateTotalDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handleTaxShortcut = () => {
    // Hidden tax shortcut: double-click POS to reduce cash/wallet/InstaPay income by 1/3
    if (paymentMethod === 'Cash' || paymentMethod === 'Wallet' || paymentMethod === 'InstaPay') {
      const total = calculateTotal();
      const reducedAmount = total * (2/3); // Reduce by 1/3
      setDiscountValue(total - reducedAmount);
      setDiscountType('fixed');
      setTaxShortcutUsed(true);
      setTimeout(() => setTaxShortcutUsed(false), 3000);
    }
  };

  const processSale = async () => {
    if (cart.length === 0) {
      setError(i18nManager.t('cart_empty'));
      return;
    }

    try {
      setLoading(true);
      const saleData = {
        customer_id: selectedCustomer?.id,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount
        })),
        discount_type: discountType,
        discount_amount: discountValue,
        payment_method: paymentMethod,
        notes: notes
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        const saleResult = await response.json();
        
        // Clear cart and reset form
        setCart([]);
        setSelectedCustomer(null);
        setDiscountValue(0);
        setNotes('');
        setError(null);
        
        // Show success message
        alert(i18nManager.t('sale_completed') + ` #${saleResult.data.sale_number}`);
        
        // Reload data to update stock
        await loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to process sale');
      }
    } catch (err) {
      setError('Failed to process sale');
      console.error('Error processing sale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (saleId: number) => {
    if (confirm(i18nManager.t('confirm_refund'))) {
      try {
        const response = await fetch(`/api/sales/${saleId}/refund`, {
          method: 'POST'
        });

        if (response.ok) {
          alert(i18nManager.t('refund_processed'));
          await loadData();
        } else {
          setError('Failed to process refund');
        }
      } catch (err) {
        setError('Failed to process refund');
        console.error('Error processing refund:', err);
      }
    }
  };

  return (
    <div className="sales-manager">
      <div className="sales-header">
        <h2>{i18nManager.t('sales')} (POS)</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowCustomerModal(true)}>
            👥 {i18nManager.t('customers')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {taxShortcutUsed && (
        <div className="success-message">
          {i18nManager.t('tax_shortcut_applied')}
        </div>
      )}

      <div className="sales-layout">
        <div className="products-section">
          <div className="search-section">
            <input
              type="text"
              placeholder={i18nManager.t('search_products')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder={i18nManager.t('scan_barcode')}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleBarcodeScan(barcodeInput);
                }
              }}
              className="barcode-input"
            />
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`product-card ${product.current_stock === 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(product)}
                onDoubleClick={handleTaxShortcut}
              >
                <div className="product-info">
                  <h4>{i18nManager.getCurrentLanguage() === 'ar' ? product.name_ar : product.name}</h4>
                  <p className="product-sku">{product.sku}</p>
                  <p className="product-price">{i18nManager.formatCurrency(product.selling_price)}</p>
                  <p className="product-stock">
                    {product.current_stock} {product.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h3>{i18nManager.t('cart')}</h3>
            <span className="cart-count">{cart.length} {i18nManager.t('items')}</span>
          </div>

          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="item-info">
                  <h4>{i18nManager.getCurrentLanguage() === 'ar' ? item.product.name_ar : item.product.name}</h4>
                  <p>{i18nManager.formatCurrency(item.unit_price)} × {item.quantity}</p>
                </div>
                <div className="item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.current_stock}
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => updateCartItemDiscount(item.product.id, Number(e.target.value))}
                    placeholder={i18nManager.t('discount')}
                    className="discount-input"
                  />
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
                <div className="item-total">
                  {i18nManager.formatCurrency(item.total_price)}
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="summary-row">
                <span>{i18nManager.t('subtotal')}:</span>
                <span>{i18nManager.formatCurrency(calculateSubtotal())}</span>
              </div>
              
              <div className="discount-section">
                <div className="discount-type">
                  <label>
                    <input
                      type="radio"
                      checked={discountType === 'percentage'}
                      onChange={() => setDiscountType('percentage')}
                    />
                    %
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={discountType === 'fixed'}
                      onChange={() => setDiscountType('fixed')}
                    />
                    {i18nManager.t('fixed')}
                  </label>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder={i18nManager.t('discount_amount')}
                  className="discount-input"
                />
              </div>

              <div className="summary-row">
                <span>{i18nManager.t('discount')}:</span>
                <span>-{i18nManager.formatCurrency(calculateTotalDiscount())}</span>
              </div>

              <div className="summary-row">
                <span>{i18nManager.t('tax')} (15%):</span>
                <span>{i18nManager.formatCurrency(calculateTax())}</span>
              </div>

              <div className="summary-row total">
                <span>{i18nManager.t('total')}:</span>
                <span>{i18nManager.formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          )}

          <div className="customer-section">
            <h4>{i18nManager.t('customer')}</h4>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customerId = Number(e.target.value);
                const customer = customers.find(c => c.id === customerId);
                setSelectedCustomer(customer || null);
              }}
              className="customer-select"
            >
              <option value="">{i18nManager.t('walk_in_customer')}</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone && `(${customer.phone})`}
                </option>
              ))}
            </select>
          </div>

          <div className="payment-section">
            <h4>{i18nManager.t('payment_method')}</h4>
            <div className="payment-methods">
              {(['Cash', 'Visa', 'InstaPay', 'Wallet'] as const).map(method => (
                <label key={method} className="payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />
                  {i18nManager.t(method.toLowerCase())}
                </label>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <h4>{i18nManager.t('notes')}</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={i18nManager.t('sale_notes')}
              className="notes-input"
            />
          </div>

          <button
            onClick={processSale}
            disabled={cart.length === 0 || loading}
            className="btn btn-primary btn-large process-sale-btn"
          >
            {loading ? i18nManager.t('processing') : i18nManager.t('process_sale')}
          </button>
        </div>
      </div>

      {showCustomerModal && (
        <CustomerModal
          customers={customers}
          onClose={() => setShowCustomerModal(false)}
          onSelect={setSelectedCustomer}
        />
      )}
    </div>
  );
};

// Customer Modal Component
interface CustomerModalProps {
  customers: Customer[];
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customers, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{i18nManager.t('select_customer')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="customer-search">
          <input
            type="text"
            placeholder={i18nManager.t('search_customers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="customers-list">
          <div
            className="customer-item"
            onClick={() => {
              onSelect(null as any);
              onClose();
            }}
          >
            <div className="customer-info">
              <h4>{i18nManager.t('walk_in_customer')}</h4>
              <p>{i18nManager.t('no_customer_selected')}</p>
            </div>
          </div>

          {filteredCustomers.map(customer => (
            <div
              key={customer.id}
              className="customer-item"
              onClick={() => {
                onSelect(customer);
                onClose();
              }}
            >
              <div className="customer-info">
                <h4>{customer.name}</h4>
                {customer.phone && <p>📞 {customer.phone}</p>}
                {customer.email && <p>📧 {customer.email}</p>}
                <p>⭐ {customer.loyalty_points} {i18nManager.t('loyalty_points')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesManager;
