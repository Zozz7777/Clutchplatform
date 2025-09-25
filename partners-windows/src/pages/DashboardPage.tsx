import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShoppingCartIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
  recentOrders: any[];
  topProducts: any[];
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    recentOrders: [],
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, partnerId: _partnerId } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load today's sales
      const salesResult = await window.electronAPI.dbQuery(
        `SELECT COALESCE(SUM(total), 0) as total FROM orders 
         WHERE DATE(created_at) = DATE('now') AND payment_status = 'paid'`
      );
      
      // Load total orders
      const ordersResult = await window.electronAPI.dbQuery(
        `SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')`
      );
      
      // Load pending orders
      const pendingResult = await window.electronAPI.dbQuery(
        `SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'`
      );
      
      // Load low stock items
      const lowStockResult = await window.electronAPI.dbQuery(
        `SELECT COUNT(*) as count FROM products WHERE quantity <= min_quantity AND is_active = 1`
      );
      
      // Load recent orders
      const recentOrdersResult = await window.electronAPI.dbQuery(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`
      );
      
      // Load top products
      const topProductsResult = await window.electronAPI.dbQuery(
        `SELECT p.name, p.sku, SUM(CAST(json_extract(o.items, '$[' || i.value || '].quantity') AS INTEGER)) as total_sold
         FROM products p
         JOIN orders o ON json_extract(o.items, '$[' || i.value || '].product.sku') = p.sku
         JOIN json_each(json_extract(o.items, '$')) i
         WHERE DATE(o.created_at) = DATE('now')
         GROUP BY p.sku, p.name
         ORDER BY total_sold DESC
         LIMIT 5`
      );

      setStats({
        todaySales: salesResult[0]?.total || 0,
        totalOrders: ordersResult[0]?.count || 0,
        pendingOrders: pendingResult[0]?.count || 0,
        lowStockItems: lowStockResult[0]?.count || 0,
        recentOrders: recentOrdersResult || [],
        topProducts: topProductsResult || []
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load dashboard data:', error); }
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('dashboard.openPOS'),
      icon: ShoppingCartIcon,
      color: 'bg-primary',
      href: '/pos'
    },
    {
      title: t('dashboard.manageInventory'),
      icon: CubeIcon,
      color: 'bg-success',
      href: '/inventory'
    },
    {
      title: t('dashboard.syncData'),
      icon: ChartBarIcon,
      color: 'bg-info',
      href: '#'
    },
    {
      title: t('dashboard.printReport'),
      icon: ClipboardDocumentListIcon,
      color: 'bg-warning',
      href: '/reports'
    }
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome')}, {user?.username}
        </h1>
        <p className="text-primary-foreground/80">
          {new Date().toLocaleDateString('ar-SA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-success/10 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.todaySales')}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.todaySales.toLocaleString()} EGP
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-info/10 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-info" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.totalOrders')}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-warning/10 rounded-lg">
              <ClockIcon className="w-6 h-6 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.pendingOrders')}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.lowStock')}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.lowStockItems}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title={t('dashboard.quickActions')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-muted"
                onClick={() => {
                  if (action.href !== '#') {
                    window.location.href = action.href;
                  }
                }}
              >
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card title={t('dashboard.recentOrders')}>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">#{order.order_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name || 'عميل غير محدد'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.total} EGP</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment_status === 'paid' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {order.payment_status === 'paid' ? 'مدفوع' : 'معلق'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد طلبات حديثة</p>
              </div>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card title={t('dashboard.topProducts')}>
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
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
                    <p className="font-medium">{product.total_sold || 0}</p>
                    <p className="text-sm text-muted-foreground">مباع</p>
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
      </div>

      {/* Sync Status */}
      <Card title={t('dashboard.syncStatus')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-success mr-2" />
            <span className="text-sm">{t('dashboard.connectedToServer')}</span>
          </div>
          <Button variant="ghost" size="sm">
            {t('dashboard.syncNow')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
