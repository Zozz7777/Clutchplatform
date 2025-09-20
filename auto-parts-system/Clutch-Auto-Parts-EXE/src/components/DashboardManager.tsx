import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  lowStockItems: number;
  recentSales: any[];
  topProducts: any[];
  stockAlerts: any[];
}

export const DashboardManager: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    recentSales: [],
    topProducts: [],
    stockAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data from API
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{i18nManager.t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{i18nManager.t('dashboard.title')}</h1>
        <p className="dashboard-subtitle">{i18nManager.t('dashboard.welcome')}</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{i18nManager.t('dashboard.totalProducts')}</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{i18nManager.t('dashboard.totalSales')}</h3>
            <p className="stat-value">{stats.totalSales}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{i18nManager.t('dashboard.totalCustomers')}</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{i18nManager.t('dashboard.lowStock')}</h3>
            <p className="stat-value">{stats.lowStockItems}</p>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="dashboard-section">
        <h2>{i18nManager.t('dashboard.recentSales')}</h2>
        <div className="recent-sales-list">
          {stats.recentSales.map((sale, index) => (
            <div key={index} className="sale-item">
              <div className="sale-info">
                <span className="sale-id">#{sale.id}</span>
                <span className="sale-customer">{sale.customer_name}</span>
              </div>
              <div className="sale-amount">{sale.total_amount}</div>
              <div className="sale-date">{sale.created_at}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="dashboard-section">
        <h2>{i18nManager.t('dashboard.topProducts')}</h2>
        <div className="top-products-list">
          {stats.topProducts.map((product, index) => (
            <div key={index} className="product-item">
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-sales">{product.sales_count} {i18nManager.t('sales')}</span>
              </div>
              <div className="product-stock">{product.stock_quantity} {i18nManager.t('in_stock')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="dashboard-section">
        <h2>{i18nManager.t('dashboard.stockAlerts')}</h2>
        <div className="stock-alerts-list">
          {stats.stockAlerts.map((alert, index) => (
            <div key={index} className="alert-item">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <span className="alert-product">{alert.product_name}</span>
                <span className="alert-stock">{alert.current_stock} / {alert.min_stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
