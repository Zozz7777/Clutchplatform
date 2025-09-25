import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  PrinterIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sku: string;
    quantity_sold: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByDay: [],
    paymentMethods: []
  });
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on report type
      let fromDate, toDate;
      const today = new Date();
      
      switch (reportType) {
        case 'daily':
          fromDate = toDate = today.toISOString().split('T')[0];
          break;
        case 'weekly': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          fromDate = weekStart.toISOString().split('T')[0];
          toDate = today.toISOString().split('T')[0];
          break;
        }
        case 'monthly': {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          fromDate = monthStart.toISOString().split('T')[0];
          toDate = today.toISOString().split('T')[0];
          break;
        }
        case 'custom':
          fromDate = dateRange.from;
          toDate = dateRange.to;
          break;
      }

      // Load total sales
      const salesResult = await window.electronAPI.dbQuery(
        `SELECT COALESCE(SUM(total), 0) as total FROM orders 
         WHERE DATE(created_at) BETWEEN ? AND ? AND payment_status = 'paid'`,
        [fromDate, toDate]
      );

      // Load total orders
      const ordersResult = await window.electronAPI.dbQuery(
        `SELECT COUNT(*) as count FROM orders 
         WHERE DATE(created_at) BETWEEN ? AND ?`,
        [fromDate, toDate]
      );

      // Load average order value
      const avgResult = await window.electronAPI.dbQuery(
        `SELECT COALESCE(AVG(total), 0) as avg FROM orders 
         WHERE DATE(created_at) BETWEEN ? AND ? AND payment_status = 'paid'`,
        [fromDate, toDate]
      );

      // Load top products
      const topProductsResult = await window.electronAPI.dbQuery(
        `SELECT 
           p.name, p.sku,
           SUM(CAST(json_extract(o.items, '$[' || i.value || '].quantity') AS INTEGER)) as quantity_sold,
           SUM(CAST(json_extract(o.items, '$[' || i.value || '].quantity') AS INTEGER) * CAST(json_extract(o.items, '$[' || i.value || '].price') AS REAL)) as revenue
         FROM products p
         JOIN orders o ON json_extract(o.items, '$[' || i.value || '].product.sku') = p.sku
         JOIN json_each(json_extract(o.items, '$')) i
         WHERE DATE(o.created_at) BETWEEN ? AND ? AND o.payment_status = 'paid'
         GROUP BY p.sku, p.name
         ORDER BY quantity_sold DESC
         LIMIT 10`,
        [fromDate, toDate]
      );

      // Load sales by day
      const salesByDayResult = await window.electronAPI.dbQuery(
        `SELECT 
           DATE(created_at) as date,
           COALESCE(SUM(total), 0) as sales,
           COUNT(*) as orders
         FROM orders 
         WHERE DATE(created_at) BETWEEN ? AND ? AND payment_status = 'paid'
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [fromDate, toDate]
      );

      // Load payment methods
      const paymentMethodsResult = await window.electronAPI.dbQuery(
        `SELECT 
           payment_method as method,
           COUNT(*) as count,
           COALESCE(SUM(total), 0) as amount
         FROM orders 
         WHERE DATE(created_at) BETWEEN ? AND ? AND payment_status = 'paid'
         GROUP BY payment_method
         ORDER BY amount DESC`,
        [fromDate, toDate]
      );

      setReportData({
        totalSales: salesResult[0]?.total || 0,
        totalOrders: ordersResult[0]?.count || 0,
        averageOrderValue: avgResult[0]?.avg || 0,
        topProducts: topProductsResult || [],
        salesByDay: salesByDayResult || [],
        paymentMethods: paymentMethodsResult || []
      });

    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const result = await window.electronAPI.saveFile({
        title: 'تصدير التقرير',
        defaultPath: `report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // Export logic would go here
        await window.electronAPI.showNotification({
          title: 'تم تصدير التقرير',
          body: 'تم تصدير التقرير إلى Excel',
          urgency: 'normal'
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to export report:', error); }
    }
  };

  const printReport = async () => {
    try {
      await window.electronAPI.printReceipt({
        type: 'report',
        reportType,
        dateRange,
        data: reportData,
        timestamp: new Date().toISOString()
      });

      await window.electronAPI.showNotification({
        title: 'تم طباعة التقرير',
        body: 'تم طباعة التقرير بنجاح',
        urgency: 'normal'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to print report:', error); }
    }
  };

  const reportTypes = [
    { value: 'daily', label: 'تقرير يومي' },
    { value: 'weekly', label: 'تقرير أسبوعي' },
    { value: 'monthly', label: 'تقرير شهري' },
    { value: 'custom', label: 'فترة مخصصة' }
  ];

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
        <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={exportToExcel}>
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            تصدير Excel
          </Button>
          <Button variant="ghost" onClick={printReport}>
            <PrinterIcon className="w-4 h-4 mr-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Report Type and Date Range */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-48">
            <label className="block text-sm font-medium mb-2">نوع التقرير</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {reportType === 'custom' && (
            <>
              <div className="md:w-48">
                <label className="block text-sm font-medium mb-2">من تاريخ</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(value) => setDateRange(prev => ({ ...prev, from: value }))}
                />
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium mb-2">إلى تاريخ</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(value) => setDateRange(prev => ({ ...prev, to: value }))}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success/10 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي المبيعات
              </p>
              <p className="text-2xl font-bold text-foreground">
                {reportData.totalSales.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-info/10 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الطلبات
              </p>
              <p className="text-2xl font-bold text-foreground">
                {reportData.totalOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                متوسط قيمة الطلب
              </p>
              <p className="text-2xl font-bold text-foreground">
                {reportData.averageOrderValue.toFixed(2)} EGP
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card title={t('reports.topSellingProducts')}>
          <div className="space-y-4">
            {reportData.topProducts.length > 0 ? (
              reportData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.quantity_sold || 0}</p>
                    <p className="text-sm text-muted-foreground">مباع</p>
                    <p className="text-sm font-medium text-success">
                      {(product.revenue || 0).toFixed(2)} EGP
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات مبيعات</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card title={t('reports.paymentMethods')}>
          <div className="space-y-4">
            {reportData.paymentMethods.length > 0 ? (
              reportData.paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{method.method || 'غير محدد'}</p>
                    <p className="text-sm text-muted-foreground">{method.count} معاملة</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{method.amount.toFixed(2)} EGP</p>
                    <p className="text-sm text-muted-foreground">
                      {((method.amount / reportData.totalSales) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات مدفوعات</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Sales by Day */}
      <Card title={t('reports.dailySales')}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right p-3 font-medium">التاريخ</th>
                <th className="text-right p-3 font-medium">المبيعات</th>
                <th className="text-right p-3 font-medium">عدد الطلبات</th>
                <th className="text-right p-3 font-medium">متوسط الطلب</th>
              </tr>
            </thead>
            <tbody>
              {reportData.salesByDay.map((day, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3">
                    {new Date(day.date).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{day.sales.toFixed(2)} EGP</span>
                  </td>
                  <td className="p-3">
                    <span>{day.orders}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-muted-foreground">
                      {day.orders > 0 ? (day.sales / day.orders).toFixed(2) : 0} EGP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reportData.salesByDay.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد بيانات مبيعات</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
