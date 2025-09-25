import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import BarcodeScanner from '../components/BarcodeScanner';
import { Order, CartItem, DatabaseOrder } from '../types';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XMarkIcon,
  PrinterIcon,
  TruckIcon,
  QrCodeIcon,
  // ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.dbQuery(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );
      
      // Convert DatabaseOrder to Order
      const convertedOrders: Order[] = (result || []).map((dbOrder: DatabaseOrder) => ({
        ...dbOrder,
        items: JSON.parse(dbOrder.items || '[]') as CartItem[]
      }));
      
      setOrders(convertedOrders);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to load orders:', error); }
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_phone && order.customer_phone.includes(searchTerm))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchTerm(barcode);
    // The filterOrders will be called automatically by useEffect
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsProcessing(true);
      
      await window.electronAPI.dbExec(
        'UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
        [newStatus, orderId]
      );

      // Reload orders
      await loadOrders();
      
      // Show notification
      await window.electronAPI.showNotification({
        title: 'تم تحديث حالة الطلب',
        body: `تم تحديث الطلب ${orderId} إلى ${getStatusLabel(newStatus)}`,
        urgency: 'normal'
      });

    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to update order status:', error); }
      await window.electronAPI.showNotification({
        title: 'فشل تحديث الطلب',
        body: 'حدث خطأ أثناء تحديث حالة الطلب',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'معلق',
      confirmed: 'مؤكد',
      in_progress: 'قيد التحضير',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      rejected: 'مرفوض'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      confirmed: 'bg-info/10 text-info',
      in_progress: 'bg-primary/10 text-primary',
      completed: 'bg-success/10 text-success',
      cancelled: 'bg-muted/10 text-muted-foreground',
      rejected: 'bg-destructive/10 text-destructive'
    };
    return statusColors[status] || 'bg-muted/10 text-muted-foreground';
  };

  const getPaymentStatusColor = (status: string) => {
    const paymentColors: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      paid: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
      refunded: 'bg-info/10 text-info'
    };
    return paymentColors[status] || 'bg-muted/10 text-muted-foreground';
  };

  const getPaymentStatusLabel = (status: string) => {
    const paymentLabels: Record<string, string> = {
      pending: 'معلق',
      paid: 'مدفوع',
      rejected: 'مرفوض',
      refunded: 'مسترد'
    };
    return paymentLabels[status] || status;
  };

  const printInvoice = async (order: Order) => {
    try {
      await window.electronAPI.printReceipt({
        orderId: order.order_id,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.payment_method,
        customerInfo: {
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email
        },
        timestamp: order.created_at
      });

      await window.electronAPI.showNotification({
        title: 'تم طباعة الفاتورة',
        body: `تم طباعة فاتورة الطلب ${order.order_id}`,
        urgency: 'normal'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error('Failed to print invoice:', error); }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'جميع الطلبات' },
    { value: 'pending', label: 'معلق' },
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'in_progress', label: 'قيد التحضير' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'rejected', label: 'مرفوض' }
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
        <h1 className="text-2xl font-bold">{t('orders.title')}</h1>
        <div className="flex items-center space-x-4">
          <Button variant="primary" onClick={loadOrders}>
            {t('common.refresh')}
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
                        placeholder={t('orders.searchPlaceholder')}
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10 pr-12"
              />
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        title={t('barcode.scanBarcode')}
              >
                <QrCodeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-3 font-medium">رقم الطلب</th>
                    <th className="text-right p-3 font-medium">العميل</th>
                    <th className="text-right p-3 font-medium">المبلغ</th>
                    <th className="text-right p-3 font-medium">حالة الطلب</th>
                    <th className="text-right p-3 font-medium">حالة الدفع</th>
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">
                        <span className="font-medium">#{order.order_id}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{order.customer_name || 'عميل غير محدد'}</p>
                          {order.customer_phone && (
                            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{order.total} EGP</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.order_status)}`}>
                          {getStatusLabel(order.order_status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.payment_status)}`}>
                          {getPaymentStatusLabel(order.payment_status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 h-8 w-8"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printInvoice(order)}
                            className="p-1 h-8 w-8"
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Details */}
        <div>
          {selectedOrder ? (
            <Card title={`تفاصيل الطلب #${selectedOrder.order_id}`}>
              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2">معلومات العميل</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">الاسم:</span> {selectedOrder.customer_name || 'غير محدد'}</p>
                    <p><span className="text-muted-foreground">الهاتف:</span> {selectedOrder.customer_phone || 'غير محدد'}</p>
                    <p><span className="text-muted-foreground">البريد:</span> {selectedOrder.customer_email || 'غير محدد'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">عناصر الطلب</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: CartItem, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <span className="font-medium">{(item.price * item.quantity).toFixed(2)} EGP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{selectedOrder.subtotal} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الخصم:</span>
                      <span className="text-success">-{selectedOrder.discount} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الضريبة:</span>
                      <span>{selectedOrder.tax} EGP</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>الإجمالي:</span>
                      <span>{selectedOrder.total} EGP</span>
                    </div>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium">تحديث حالة الطلب</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.order_status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.order_id, 'confirmed')}
                        disabled={isProcessing}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        تأكيد
                      </Button>
                    )}
                    {selectedOrder.order_status === 'confirmed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.order_id, 'in_progress')}
                        disabled={isProcessing}
                      >
                        <ClockIcon className="w-4 h-4 mr-1" />
                        بدء التحضير
                      </Button>
                    )}
                    {selectedOrder.order_status === 'in_progress' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.order_id, 'completed')}
                        disabled={isProcessing}
                      >
                        <TruckIcon className="w-4 h-4 mr-1" />
                        جاهز للاستلام
                      </Button>
                    )}
                    {(selectedOrder.order_status === 'pending' || selectedOrder.order_status === 'confirmed') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.order_id, 'cancelled')}
                        disabled={isProcessing}
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        إلغاء
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium mb-2">ملاحظات</h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-muted-foreground">
                <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>اختر طلباً لعرض التفاصيل</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onBarcodeScanned={handleBarcodeScanned}
        onClose={() => setShowBarcodeScanner(false)}
      />
    </div>
  );
};

export default OrdersPage;
