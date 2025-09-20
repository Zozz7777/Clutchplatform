// src/components/CustomersManager.tsx
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyalty_points: number;
  credit_limit: number;
  current_credit: number;
  created_at: string;
  updated_at: string;
}

interface CustomerSale {
  id: number;
  sale_number: string;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  items_count: number;
}

const CustomersManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<CustomerSale[]>([]);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      } else {
        setError('Failed to load customers');
      }
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerSales = async (customerId: number) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/sales`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomerSales(data.data || []);
      }
    } catch (err) {
      console.error('Error loading customer sales:', err);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowAddCustomer(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowAddCustomer(true);
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (confirm(i18nManager.t('confirm_delete_customer'))) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomers(customers.filter(c => c.id !== customerId));
        } else {
          setError('Failed to delete customer');
        }
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleViewSalesHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerSales(customer.id);
    setShowSalesHistory(true);
  };

  const handleAddLoyaltyPoints = async (customerId: number, points: number) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/loyalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points })
      });

      if (response.ok) {
        await loadCustomers();
        alert(i18nManager.t('loyalty_points_added'));
      } else {
        setError('Failed to add loyalty points');
      }
    } catch (err) {
      setError('Failed to add loyalty points');
      console.error('Error adding loyalty points:', err);
    }
  };

  const handleUpdateCreditLimit = async (customerId: number, creditLimit: number) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credit_limit: creditLimit })
      });

      if (response.ok) {
        await loadCustomers();
        alert(i18nManager.t('credit_limit_updated'));
      } else {
        setError('Failed to update credit limit');
      }
    } catch (err) {
      setError('Failed to update credit limit');
      console.error('Error updating credit limit:', err);
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
    <div className="customers-manager">
      <div className="customers-header">
        <h2>{i18nManager.t('customers')}</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddCustomer}>
            ➕ {i18nManager.t('add_customer')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="customers-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder={i18nManager.t('search_customers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <h3>{i18nManager.t('total_customers')}</h3>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('loyalty_members')}</h3>
          <div className="stat-value">
            {customers.filter(c => c.loyalty_points > 0).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('credit_customers')}</h3>
          <div className="stat-value">
            {customers.filter(c => c.credit_limit > 0).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>{i18nManager.t('total_loyalty_points')}</h3>
          <div className="stat-value">
            {customers.reduce((sum, c) => sum + c.loyalty_points, 0)}
          </div>
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>{i18nManager.t('name')}</th>
              <th>{i18nManager.t('phone')}</th>
              <th>{i18nManager.t('email')}</th>
              <th>{i18nManager.t('loyalty_points')}</th>
              <th>{i18nManager.t('credit_limit')}</th>
              <th>{i18nManager.t('current_credit')}</th>
              <th>{i18nManager.t('member_since')}</th>
              <th>{i18nManager.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-name">
                    <strong>{customer.name}</strong>
                    {customer.loyalty_points > 0 && (
                      <span className="loyalty-badge">⭐</span>
                    )}
                  </div>
                </td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.email || '-'}</td>
                <td>
                  <span className="loyalty-points">
                    {customer.loyalty_points}
                  </span>
                </td>
                <td>
                  {customer.credit_limit > 0 ? (
                    i18nManager.formatCurrency(customer.credit_limit)
                  ) : '-'}
                </td>
                <td>
                  {customer.current_credit > 0 ? (
                    <span className="credit-amount">
                      {i18nManager.formatCurrency(customer.current_credit)}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  {i18nManager.formatDate(new Date(customer.created_at))}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewSalesHistory(customer)}
                      title={i18nManager.t('view_sales_history')}
                    >
                      📊
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditCustomer(customer)}
                      title={i18nManager.t('edit_customer')}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCustomer(customer.id)}
                      title={i18nManager.t('delete_customer')}
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

      {showAddCustomer && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setShowAddCustomer(false)}
          onSave={loadCustomers}
        />
      )}

      {showSalesHistory && selectedCustomer && (
        <SalesHistoryModal
          customer={selectedCustomer}
          sales={customerSales}
          onClose={() => {
            setShowSalesHistory(false);
            setSelectedCustomer(null);
            setCustomerSales([]);
          }}
        />
      )}
    </div>
  );
};

// Customer Modal Component
interface CustomerModalProps {
  customer?: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    credit_limit: customer?.credit_limit || 0,
    loyalty_points: customer?.loyalty_points || 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer ? 'PUT' : 'POST';

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
        setError(errorData.message || 'Failed to save customer');
      }
    } catch (err) {
      setError('Failed to save customer');
      console.error('Error saving customer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{customer ? i18nManager.t('edit_customer') : i18nManager.t('add_customer')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
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

          <div className="form-row">
            <div className="form-group">
              <label>{i18nManager.t('credit_limit')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: Number(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>{i18nManager.t('loyalty_points')}</label>
              <input
                type="number"
                value={formData.loyalty_points}
                onChange={(e) => setFormData(prev => ({ ...prev, loyalty_points: Number(e.target.value) }))}
              />
            </div>
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

// Sales History Modal Component
interface SalesHistoryModalProps {
  customer: Customer;
  sales: CustomerSale[];
  onClose: () => void;
}

const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ customer, sales, onClose }) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [creditLimit, setCreditLimit] = useState(customer.credit_limit);

  const handleAddLoyaltyPoints = async () => {
    if (loyaltyPoints > 0) {
      try {
        const response = await fetch(`/api/customers/${customer.id}/loyalty`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ points: loyaltyPoints })
        });

        if (response.ok) {
          alert(i18nManager.t('loyalty_points_added'));
          setLoyaltyPoints(0);
        }
      } catch (err) {
        console.error('Error adding loyalty points:', err);
      }
    }
  };

  const handleUpdateCreditLimit = async () => {
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credit_limit: creditLimit })
      });

      if (response.ok) {
        alert(i18nManager.t('credit_limit_updated'));
      }
    } catch (err) {
      console.error('Error updating credit limit:', err);
    }
  };

  const totalSpent = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{customer.name} - {i18nManager.t('sales_history')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="customer-details">
          <div className="detail-row">
            <span>{i18nManager.t('phone')}:</span>
            <span>{customer.phone || '-'}</span>
          </div>
          <div className="detail-row">
            <span>{i18nManager.t('email')}:</span>
            <span>{customer.email || '-'}</span>
          </div>
          <div className="detail-row">
            <span>{i18nManager.t('loyalty_points')}:</span>
            <span>{customer.loyalty_points}</span>
          </div>
          <div className="detail-row">
            <span>{i18nManager.t('credit_limit')}:</span>
            <span>{i18nManager.formatCurrency(customer.credit_limit)}</span>
          </div>
          <div className="detail-row">
            <span>{i18nManager.t('current_credit')}:</span>
            <span>{i18nManager.formatCurrency(customer.current_credit)}</span>
          </div>
          <div className="detail-row">
            <span>{i18nManager.t('total_spent')}:</span>
            <span>{i18nManager.formatCurrency(totalSpent)}</span>
          </div>
        </div>

        <div className="customer-actions">
          <div className="action-group">
            <label>{i18nManager.t('add_loyalty_points')}</label>
            <div className="input-with-button">
              <input
                type="number"
                value={loyaltyPoints}
                onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                placeholder="0"
              />
              <button onClick={handleAddLoyaltyPoints} className="btn btn-sm">
                {i18nManager.t('add')}
              </button>
            </div>
          </div>

          <div className="action-group">
            <label>{i18nManager.t('update_credit_limit')}</label>
            <div className="input-with-button">
              <input
                type="number"
                step="0.01"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
              />
              <button onClick={handleUpdateCreditLimit} className="btn btn-sm">
                {i18nManager.t('update')}
              </button>
            </div>
          </div>
        </div>

        <div className="sales-history">
          <h4>{i18nManager.t('recent_sales')}</h4>
          {sales.length > 0 ? (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>{i18nManager.t('sale_number')}</th>
                  <th>{i18nManager.t('date')}</th>
                  <th>{i18nManager.t('amount')}</th>
                  <th>{i18nManager.t('payment_method')}</th>
                  <th>{i18nManager.t('items')}</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.sale_number}</td>
                    <td>{i18nManager.formatDate(new Date(sale.sale_date))}</td>
                    <td>{i18nManager.formatCurrency(sale.total_amount)}</td>
                    <td>{sale.payment_method}</td>
                    <td>{sale.items_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{i18nManager.t('no_sales_found')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersManager;
