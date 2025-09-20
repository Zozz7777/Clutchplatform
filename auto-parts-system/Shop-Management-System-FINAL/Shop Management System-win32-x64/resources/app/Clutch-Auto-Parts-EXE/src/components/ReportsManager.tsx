// src/components/ReportsManager.tsx
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../client/i18n';

interface ReportData {
  type: string;
  period: string;
  data: any;
  generated_at: string;
  generated_by: number;
}

interface SalesReport {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_products: Array<{
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_payment_method: Array<{
    payment_method: string;
    count: number;
    amount: number;
  }>;
  sales_by_hour: Array<{
    hour: number;
    sales: number;
  }>;
  sales_by_day: Array<{
    date: string;
    sales: number;
  }>;
}

interface InventoryReport {
  total_products: number;
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  top_categories: Array<{
    category_id: number;
    category_name: string;
    product_count: number;
    total_value: number;
  }>;
  top_brands: Array<{
    brand_id: number;
    brand_name: string;
    product_count: number;
    total_value: number;
  }>;
  stock_movements: Array<{
    date: string;
    in: number;
    out: number;
    net: number;
  }>;
}

interface CustomerReport {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  loyalty_members: number;
  top_customers: Array<{
    customer_id: number;
    customer_name: string;
    total_spent: number;
    order_count: number;
  }>;
  customer_segments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}

interface FinancialReport {
  total_revenue: number;
  total_costs: number;
  gross_profit: number;
  profit_margin: number;
  tax_collected: number;
  discounts_given: number;
  expenses: Array<{
    category: string;
    amount: number;
  }>;
  monthly_trends: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

const ReportsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);

  useEffect(() => {
    loadReport(activeTab);
  }, [activeTab, dateRange]);

  const loadReport = async (reportType: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
        type: reportType
      });

      const response = await fetch(`/api/reports?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        
        switch (reportType) {
          case 'sales':
            setSalesReport(data.data);
            break;
          case 'inventory':
            setInventoryReport(data.data);
            break;
          case 'customers':
            setCustomerReport(data.data);
            break;
          case 'financial':
            setFinancialReport(data.data);
            break;
        }
      } else {
        setError('Failed to load report');
      }
    } catch (err) {
      setError('Failed to load report');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
        type: activeTab,
        format
      });

      const response = await fetch(`/api/reports/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}-report-${dateRange.start}-to-${dateRange.end}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export report');
      }
    } catch (err) {
      setError('Failed to export report');
      console.error('Error exporting report:', err);
    }
  };

  const renderSalesReport = () => {
    if (!salesReport) return <div className="loading">Loading sales report...</div>;

    return (
      <div className="sales-report">
        <div className="report-summary">
          <div className="summary-card">
            <h3>{i18nManager.t('total_sales')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(salesReport.total_sales)}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('total_orders')}</h3>
            <div className="summary-value">{salesReport.total_orders}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('average_order_value')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(salesReport.average_order_value)}</div>
          </div>
        </div>

        <div className="report-charts">
          <div className="chart-section">
            <h4>{i18nManager.t('top_products')}</h4>
            <div className="chart-container">
              {salesReport.top_products.map((product, index) => (
                <div key={product.product_id} className="chart-item">
                  <div className="item-info">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{product.product_name}</span>
                  </div>
                  <div className="item-stats">
                    <span className="quantity">{product.quantity_sold} {i18nManager.t('sold')}</span>
                    <span className="revenue">{i18nManager.formatCurrency(product.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h4>{i18nManager.t('sales_by_payment_method')}</h4>
            <div className="chart-container">
              {salesReport.sales_by_payment_method.map(method => (
                <div key={method.payment_method} className="chart-item">
                  <div className="item-info">
                    <span className="name">{i18nManager.t(method.payment_method.toLowerCase())}</span>
                  </div>
                  <div className="item-stats">
                    <span className="count">{method.count} {i18nManager.t('orders')}</span>
                    <span className="amount">{i18nManager.formatCurrency(method.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryReport) return <div className="loading">Loading inventory report...</div>;

    return (
      <div className="inventory-report">
        <div className="report-summary">
          <div className="summary-card">
            <h3>{i18nManager.t('total_products')}</h3>
            <div className="summary-value">{inventoryReport.total_products}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('total_value')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(inventoryReport.total_value)}</div>
          </div>
          <div className="summary-card warning">
            <h3>{i18nManager.t('low_stock_items')}</h3>
            <div className="summary-value">{inventoryReport.low_stock_items}</div>
          </div>
          <div className="summary-card danger">
            <h3>{i18nManager.t('out_of_stock_items')}</h3>
            <div className="summary-value">{inventoryReport.out_of_stock_items}</div>
          </div>
        </div>

        <div className="report-charts">
          <div className="chart-section">
            <h4>{i18nManager.t('top_categories')}</h4>
            <div className="chart-container">
              {inventoryReport.top_categories.map((category, index) => (
                <div key={category.category_id} className="chart-item">
                  <div className="item-info">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{category.category_name}</span>
                  </div>
                  <div className="item-stats">
                    <span className="count">{category.product_count} {i18nManager.t('products')}</span>
                    <span className="value">{i18nManager.formatCurrency(category.total_value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h4>{i18nManager.t('top_brands')}</h4>
            <div className="chart-container">
              {inventoryReport.top_brands.map((brand, index) => (
                <div key={brand.brand_id} className="chart-item">
                  <div className="item-info">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{brand.brand_name}</span>
                  </div>
                  <div className="item-stats">
                    <span className="count">{brand.product_count} {i18nManager.t('products')}</span>
                    <span className="value">{i18nManager.formatCurrency(brand.total_value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerReport = () => {
    if (!customerReport) return <div className="loading">Loading customer report...</div>;

    return (
      <div className="customer-report">
        <div className="report-summary">
          <div className="summary-card">
            <h3>{i18nManager.t('total_customers')}</h3>
            <div className="summary-value">{customerReport.total_customers}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('new_customers')}</h3>
            <div className="summary-value">{customerReport.new_customers}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('returning_customers')}</h3>
            <div className="summary-value">{customerReport.returning_customers}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('loyalty_members')}</h3>
            <div className="summary-value">{customerReport.loyalty_members}</div>
          </div>
        </div>

        <div className="report-charts">
          <div className="chart-section">
            <h4>{i18nManager.t('top_customers')}</h4>
            <div className="chart-container">
              {customerReport.top_customers.map((customer, index) => (
                <div key={customer.customer_id} className="chart-item">
                  <div className="item-info">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{customer.customer_name}</span>
                  </div>
                  <div className="item-stats">
                    <span className="orders">{customer.order_count} {i18nManager.t('orders')}</span>
                    <span className="spent">{i18nManager.formatCurrency(customer.total_spent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h4>{i18nManager.t('customer_segments')}</h4>
            <div className="chart-container">
              {customerReport.customer_segments.map(segment => (
                <div key={segment.segment} className="chart-item">
                  <div className="item-info">
                    <span className="name">{i18nManager.t(segment.segment)}</span>
                  </div>
                  <div className="item-stats">
                    <span className="count">{segment.count} {i18nManager.t('customers')}</span>
                    <span className="percentage">{segment.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!financialReport) return <div className="loading">Loading financial report...</div>;

    return (
      <div className="financial-report">
        <div className="report-summary">
          <div className="summary-card">
            <h3>{i18nManager.t('total_revenue')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(financialReport.total_revenue)}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('total_costs')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(financialReport.total_costs)}</div>
          </div>
          <div className="summary-card success">
            <h3>{i18nManager.t('gross_profit')}</h3>
            <div className="summary-value">{i18nManager.formatCurrency(financialReport.gross_profit)}</div>
          </div>
          <div className="summary-card">
            <h3>{i18nManager.t('profit_margin')}</h3>
            <div className="summary-value">{financialReport.profit_margin.toFixed(2)}%</div>
          </div>
        </div>

        <div className="report-charts">
          <div className="chart-section">
            <h4>{i18nManager.t('expenses_breakdown')}</h4>
            <div className="chart-container">
              {financialReport.expenses.map(expense => (
                <div key={expense.category} className="chart-item">
                  <div className="item-info">
                    <span className="name">{i18nManager.t(expense.category)}</span>
                  </div>
                  <div className="item-stats">
                    <span className="amount">{i18nManager.formatCurrency(expense.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h4>{i18nManager.t('monthly_trends')}</h4>
            <div className="chart-container">
              {financialReport.monthly_trends.map(trend => (
                <div key={trend.month} className="chart-item">
                  <div className="item-info">
                    <span className="name">{trend.month}</span>
                  </div>
                  <div className="item-stats">
                    <span className="revenue">{i18nManager.formatCurrency(trend.revenue)}</span>
                    <span className="profit">{i18nManager.formatCurrency(trend.profit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    switch (activeTab) {
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'customers':
        return renderCustomerReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="reports-manager">
      <div className="reports-header">
        <h2>{i18nManager.t('reports')}</h2>
        <div className="header-actions">
          <div className="date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>{i18nManager.t('to')}</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => exportReport('excel')}
            disabled={loading}
          >
            📊 {i18nManager.t('export_excel')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => exportReport('pdf')}
            disabled={loading}
          >
            📄 {i18nManager.t('export_pdf')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="reports-tabs">
        <button
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          📈 {i18nManager.t('sales')}
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 {i18nManager.t('inventory')}
        </button>
        <button
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 {i18nManager.t('customers')}
        </button>
        <button
          className={`tab ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          💰 {i18nManager.t('financial')}
        </button>
      </div>

      <div className="reports-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{i18nManager.t('loading_report')}</p>
          </div>
        ) : (
          renderReport()
        )}
      </div>
    </div>
  );
};

export default ReportsManager;
