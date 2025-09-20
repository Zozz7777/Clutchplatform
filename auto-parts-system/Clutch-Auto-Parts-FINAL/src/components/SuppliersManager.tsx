// src/components/SuppliersManager.tsx
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
  items_count: number;
}

interface SupplierPerformance {
  total_orders: number;
  total_amount: number;
  average_delivery_time: number;
  on_time_delivery_rate: number;
  quality_rating: number;
}

const SuppliersManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<PurchaseOrder[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers');
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.data || []);
      } else {
        setError('Failed to load suppliers');
      }
    } catch (err) {
      setError('Failed to load suppliers');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierDetails = async (supplierId: number) => {
    try {
      const [ordersRes, performanceRes] = await Promise.all([
        fetch(`/api/suppliers/${supplierId}/orders`),
        fetch(`/api/suppliers/${supplierId}/performance`)
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setSupplierOrders(ordersData.data || []);
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setSupplierPerformance(performanceData.data);
      }
    } catch (err) {
      console.error('Error loading supplier details:', err);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm)) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowAddSupplier(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowAddSupplier(true);
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    if (confirm(i18nManager.t('confirm_delete_supplier'))) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuppliers(suppliers.filter(s => s.id !== supplierId));
        } else {
          setError('Failed to delete supplier');
        }
      } catch (err) {
        setError('Failed to delete supplier');
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const handleViewSupplierDetails = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    await loadSupplierDetails(supplier.id);
    setShowSupplierDetails(true);
  };

  const handleCreatePurchaseOrder = async (supplierId: number) => {
    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplier_id: supplierId,
          order_date: new Date().toISOString(),
          status: 'pending'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(i18nManager.t('purchase_order_created') + ` #${data.data.order_number}`);
        await loadSupplierDetails(supplierId);
      } else {
        setError('Failed to create purchase order');
      }
    } catch (err) {
      setError('Failed to create purchase order');
      console.error('Error creating purchase order:', err);
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
    <div className="suppliers-manager">
      <div className="suppliers-header">
        <h2>{i18nManager.t('suppliers')}</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddSupplier}>
            ➕ {i18nManager.t('add_supplier')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="suppliers-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder={i18nManager.t('search_suppliers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="suppliers-stats">
        <div className="stat-card">
          <h3>{i18nManager.t('total_suppliers')}</h3>
          <div className="stat-value">{suppliers.length}</div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('active_suppliers')}</h3>
          <div className="stat-value">
            {suppliers.filter(s => s.phone || s.email).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('pending_orders')}</h3>
          <div className="stat-value">
            {/* This would need to be calculated from all suppliers */}
            0
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('total_orders')}</h3>
          <div className="stat-value">
            {/* This would need to be calculated from all suppliers */}
            0
          </div>
        </div>
      </div>

      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>{i18nManager.t('name')}</th>
              <th>{i18nManager.t('contact_person')}</th>
              <th>{i18nManager.t('phone')}</th>
              <th>{i18nManager.t('email')}</th>
              <th>{i18nManager.t('payment_terms')}</th>
              <th>{i18nManager.t('member_since')}</th>
              <th>{i18nManager.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.id}>
                <td>
                  <div className="supplier-name">
                    <strong>{supplier.name}</strong>
                  </div>
                </td>
                <td>{supplier.contact_person || '-'}</td>
                <td>{supplier.phone || '-'}</td>
                <td>{supplier.email || '-'}</td>
                <td>{supplier.payment_terms || '-'}</td>
                <td>
                  {i18nManager.formatDate(new Date(supplier.created_at))}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewSupplierDetails(supplier)}
                      title={i18nManager.t('view_details')}
                    >
                      📊
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCreatePurchaseOrder(supplier.id)}
                      title={i18nManager.t('create_order')}
                    >
                      📋
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditSupplier(supplier)}
                      title={i18nManager.t('edit_supplier')}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      title={i18nManager.t('delete_supplier')}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddSupplier && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => setShowAddSupplier(false)}
          onSave={loadSuppliers}
        />
      )}

      {showSupplierDetails && selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          orders={supplierOrders}
          performance={supplierPerformance}
          onClose={() => {
            setShowSupplierDetails(false);
            setSelectedSupplier(null);
            setSupplierOrders([]);
            setSupplierPerformance(null);
          }}
          onCreateOrder={handleCreatePurchaseOrder}
        />
      )}
    </div>
  );
};

// Supplier Modal Component
interface SupplierModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ supplier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    payment_terms: supplier?.payment_terms || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = supplier ? `/api/suppliers/${supplier.id}` : '/api/suppliers';
      const method = supplier ? 'PUT' : 'POST';

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
        setError(errorData.message || 'Failed to save supplier');
      }
    } catch (err) {
      setError('Failed to save supplier');
      console.error('Error saving supplier:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{supplier ? i18nManager.t('edit_supplier') : i18nManager.t('add_supplier')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="supplier-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>{i18nManager.t('name')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>{i18nManager.t('contact_person')}</label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{i18nManager.t('address')}</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{i18nManager.t('payment_terms')}</label>
            <select
              value={formData.payment_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            >
              <option value="">{i18nManager.t('select_payment_terms')}</option>
              <option value="net_15">{i18nManager.t('net_15_days')}</option>
              <option value="net_30">{i18nManager.t('net_30_days')}</option>
              <option value="net_45">{i18nManager.t('net_45_days')}</option>
              <option value="net_60">{i18nManager.t('net_60_days')}</option>
              <option value="cash_on_delivery">{i18nManager.t('cash_on_delivery')}</option>
              <option value="prepaid">{i18nManager.t('prepaid')}</option>
            </select>
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

// Supplier Details Modal Component
interface SupplierDetailsModalProps {
  supplier: Supplier;
  orders: PurchaseOrder[];
  performance: SupplierPerformance | null;
  onClose: () => void;
  onCreateOrder: (supplierId: number) => void;
}

const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  supplier,
  orders,
  performance,
  onClose,
  onCreateOrder
}) => {
  const totalOrdersValue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{supplier.name} - {i18nManager.t('details')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="supplier-details">
          <div className="detail-section">
            <h4>{i18nManager.t('contact_information')}</h4>
            <div className="detail-row">
              <span>{i18nManager.t('contact_person')}:</span>
              <span>{supplier.contact_person || '-'}</span>
            </div>
            <div className="detail-row">
              <span>{i18nManager.t('phone')}:</span>
              <span>{supplier.phone || '-'}</span>
            </div>
            <div className="detail-row">
              <span>{i18nManager.t('email')}:</span>
              <span>{supplier.email || '-'}</span>
            </div>
            <div className="detail-row">
              <span>{i18nManager.t('address')}:</span>
              <span>{supplier.address || '-'}</span>
            </div>
            <div className="detail-row">
              <span>{i18nManager.t('payment_terms')}:</span>
              <span>{supplier.payment_terms || '-'}</span>
            </div>
          </div>

          {performance && (
            <div className="detail-section">
              <h4>{i18nManager.t('performance_metrics')}</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">{i18nManager.t('total_orders')}</span>
                  <span className="metric-value">{performance.total_orders}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">{i18nManager.t('total_value')}</span>
                  <span className="metric-value">{i18nManager.formatCurrency(performance.total_amount)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">{i18nManager.t('avg_delivery_time')}</span>
                  <span className="metric-value">{performance.average_delivery_time} {i18nManager.t('days')}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">{i18nManager.t('on_time_rate')}</span>
                  <span className="metric-value">{performance.on_time_delivery_rate}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">{i18nManager.t('quality_rating')}</span>
                  <span className="metric-value">{performance.quality_rating}/5</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail-section">
            <div className="section-header">
              <h4>{i18nManager.t('purchase_orders')}</h4>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => onCreateOrder(supplier.id)}
              >
                ➕ {i18nManager.t('create_order')}
              </button>
            </div>

            <div className="orders-summary">
              <div className="summary-item">
                <span>{i18nManager.t('total_orders')}:</span>
                <span>{orders.length}</span>
              </div>
              <div className="summary-item">
                <span>{i18nManager.t('pending')}:</span>
                <span className="warning">{pendingOrders}</span>
              </div>
              <div className="summary-item">
                <span>{i18nManager.t('completed')}:</span>
                <span className="success">{completedOrders}</span>
              </div>
              <div className="summary-item">
                <span>{i18nManager.t('total_value')}:</span>
                <span>{i18nManager.formatCurrency(totalOrdersValue)}</span>
              </div>
            </div>

            {orders.length > 0 ? (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>{i18nManager.t('order_number')}</th>
                    <th>{i18nManager.t('date')}</th>
                    <th>{i18nManager.t('expected_delivery')}</th>
                    <th>{i18nManager.t('status')}</th>
                    <th>{i18nManager.t('amount')}</th>
                    <th>{i18nManager.t('items')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{i18nManager.formatDate(new Date(order.order_date))}</td>
                      <td>
                        {order.expected_delivery_date
                          ? i18nManager.formatDate(new Date(order.expected_delivery_date))
                          : '-'
                        }
                      </td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {i18nManager.t(order.status)}
                        </span>
                      </td>
                      <td>{i18nManager.formatCurrency(order.total_amount)}</td>
                      <td>{order.items_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>{i18nManager.t('no_orders_found')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersManager;
