import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MagnifyingGlassIcon, 
  ArrowUturnLeftIcon,
  ReceiptRefundIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface RefundItem {
  id: string;
  orderId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason: string;
  condition: 'new' | 'used' | 'damaged';
  status: 'pending' | 'approved' | 'rejected' | 'processed';
}

interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: RefundItem[];
  totalAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

const RefundsReturnsPage: React.FC = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RefundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [refundNotes, setRefundNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    loadRefundRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [refundRequests, searchTerm, statusFilter]);

  const loadRefundRequests = async () => {
    try {
      setIsLoading(true);
      // Mock implementation - in real app, this would query the database
      const mockRequests: RefundRequest[] = [
        {
          id: 'refund_001',
          orderId: 'ORD_001',
          customerName: 'Ahmed Ali',
          customerPhone: '+20123456789',
          customerEmail: 'ahmed@email.com',
          items: [
            {
              id: 'item_001',
              orderId: 'ORD_001',
              productSku: 'SKU_001',
              productName: 'Engine Oil',
              quantity: 2,
              unitPrice: 25,
              totalPrice: 50,
              reason: 'Product defect',
              condition: 'damaged',
              status: 'pending'
            }
          ],
          totalAmount: 50,
          reason: 'Product defect',
          status: 'pending',
          requestedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'refund_002',
          orderId: 'ORD_002',
          customerName: 'Sara Mohamed',
          customerPhone: '+20123456790',
          customerEmail: 'sara@email.com',
          items: [
            {
              id: 'item_002',
              orderId: 'ORD_002',
              productSku: 'SKU_002',
              productName: 'Brake Pads',
              quantity: 1,
              unitPrice: 120,
              totalPrice: 120,
              reason: 'Wrong item',
              condition: 'new',
              status: 'approved'
            }
          ],
          totalAmount: 120,
          reason: 'Wrong item',
          status: 'approved',
          requestedAt: '2024-01-14T14:30:00Z',
          processedAt: '2024-01-14T16:00:00Z',
          processedBy: 'Manager'
        }
      ];
      setRefundRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load refund requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = refundRequests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerPhone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'approved':
        return 'bg-success/10 text-success';
      case 'rejected':
        return 'bg-destructive/10 text-destructive';
      case 'processed':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      case 'processed':
        return 'تم المعالجة';
      default:
        return 'غير محدد';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-success/10 text-success';
      case 'used':
        return 'bg-warning/10 text-warning';
      case 'damaged':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'جديد';
      case 'used':
        return 'مستعمل';
      case 'damaged':
        return 'تالف';
      default:
        return 'غير محدد';
    }
  };

  const approveRefund = async (requestId: string) => {
    try {
      setIsProcessing(true);
      
      // Update refund request status
      await window.electronAPI.dbExec(
        `UPDATE refund_requests SET 
         status = 'approved', processed_at = ?, processed_by = ?, notes = ?
         WHERE id = ?`,
        [
          new Date().toISOString(),
          'Current User',
          refundNotes,
          requestId
        ]
      );

      // Update request in state
      setRefundRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'approved' as const,
                processedAt: new Date().toISOString(),
                processedBy: 'Current User',
                notes: refundNotes
              }
            : req
        )
      );

      setShowProcessModal(false);
      setRefundNotes('');

      await window.electronAPI.showNotification({
        title: 'تم الموافقة على الاسترداد',
        body: 'تم الموافقة على طلب الاسترداد بنجاح',
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Failed to approve refund:', error);
      await window.electronAPI.showNotification({
        title: 'فشل الموافقة على الاسترداد',
        body: 'حدث خطأ أثناء الموافقة على طلب الاسترداد',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectRefund = async (requestId: string) => {
    try {
      setIsProcessing(true);
      
      // Update refund request status
      await window.electronAPI.dbExec(
        `UPDATE refund_requests SET 
         status = 'rejected', processed_at = ?, processed_by = ?, notes = ?
         WHERE id = ?`,
        [
          new Date().toISOString(),
          'Current User',
          refundNotes,
          requestId
        ]
      );

      // Update request in state
      setRefundRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'rejected' as const,
                processedAt: new Date().toISOString(),
                processedBy: 'Current User',
                notes: refundNotes
              }
            : req
        )
      );

      setShowProcessModal(false);
      setRefundNotes('');

      await window.electronAPI.showNotification({
        title: 'تم رفض الاسترداد',
        body: 'تم رفض طلب الاسترداد',
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Failed to reject refund:', error);
      await window.electronAPI.showNotification({
        title: 'فشل رفض الاسترداد',
        body: 'حدث خطأ أثناء رفض طلب الاسترداد',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processRefund = async (requestId: string) => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      
      const refundAmountValue = parseFloat(refundAmount) || selectedRequest.totalAmount;

      // Create refund transaction
      const refundId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      await window.electronAPI.dbExec(
        `INSERT INTO refunds (id, refund_request_id, order_id, amount, method, status, processed_by, processed_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          refundId,
          requestId,
          selectedRequest.orderId,
          refundAmountValue,
          'cash',
          'completed',
          'Current User',
          new Date().toISOString(),
          refundNotes
        ]
      );

      // Update refund request status
      await window.electronAPI.dbExec(
        `UPDATE refund_requests SET 
         status = 'processed', processed_at = ?, processed_by = ?, notes = ?
         WHERE id = ?`,
        [
          new Date().toISOString(),
          'Current User',
          refundNotes,
          requestId
        ]
      );

      // Update inventory
      for (const item of selectedRequest.items) {
        await window.electronAPI.dbExec(
          'UPDATE products SET quantity = quantity + ? WHERE sku = ?',
          [item.quantity, item.productSku]
        );
      }

      // Print refund receipt
      await window.electronAPI.printRefundReceipt({
        refundId: refundId,
        orderId: selectedRequest.orderId,
        customerName: selectedRequest.customerName,
        items: selectedRequest.items,
        totalAmount: refundAmountValue,
        processedBy: 'Current User',
        processedAt: new Date().toISOString()
      });

      // Update request in state
      setRefundRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'processed' as const,
                processedAt: new Date().toISOString(),
                processedBy: 'Current User',
                notes: refundNotes
              }
            : req
        )
      );

      setShowRefundModal(false);
      setRefundAmount('');
      setRefundNotes('');

      await window.electronAPI.showNotification({
        title: 'تم معالجة الاسترداد',
        body: `تم معالجة الاسترداد بمبلغ ${refundAmountValue} EGP`,
        urgency: 'normal'
      });

    } catch (error) {
      console.error('Failed to process refund:', error);
      await window.electronAPI.showNotification({
        title: 'فشل معالجة الاسترداد',
        body: 'حدث خطأ أثناء معالجة الاسترداد',
        urgency: 'critical'
      });
    } finally {
      setIsProcessing(false);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الاستردادات والمرتجعات</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="البحث برقم الطلب أو اسم العميل أو الهاتف"
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
              <option value="processed">تم المعالجة</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Refund Requests */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  طلب استرداد #{request.id}
                </h3>
                <div className="text-sm text-muted-foreground">
                  الطلب: {request.orderId} | العميل: {request.customerName}
                </div>
                <div className="text-sm text-muted-foreground">
                  الهاتف: {request.customerPhone} | البريد: {request.customerEmail}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(request.requestedAt).toLocaleString('ar-EG')}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">المنتجات:</h4>
              <div className="space-y-2">
                {request.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.productSku} | الكمية: {item.quantity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        السبب: {item.reason}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.totalPrice.toFixed(2)} EGP</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(item.condition)}`}>
                        {getConditionLabel(item.condition)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">السبب:</div>
                <div className="font-medium">{request.reason}</div>
                <div className="text-lg font-bold text-primary">
                  إجمالي المبلغ: {request.totalAmount.toFixed(2)} EGP
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {request.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowProcessModal(true);
                      }}
                    >
                      مراجعة
                    </Button>
                  </>
                )}
                {request.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setRefundAmount(request.totalAmount.toString());
                      setShowRefundModal(true);
                    }}
                  >
                    معالجة الاسترداد
                  </Button>
                )}
                {request.status === 'processed' && (
                  <div className="flex items-center text-success">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">تم المعالجة</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <div className="text-center py-8 text-muted-foreground">
            <ReceiptRefundIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد طلبات استرداد</p>
          </div>
        </Card>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">مراجعة طلب الاسترداد</h2>
              <Button variant="ghost" onClick={() => setShowProcessModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">تفاصيل الطلب</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>رقم الطلب:</span>
                    <span>{selectedRequest.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>العميل:</span>
                    <span>{selectedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المبلغ:</span>
                    <span>{selectedRequest.totalAmount.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول القرار..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowProcessModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectRefund(selectedRequest.id)}
                disabled={isProcessing}
                loading={isProcessing}
              >
                رفض
              </Button>
              <Button
                variant="primary"
                onClick={() => approveRefund(selectedRequest.id)}
                disabled={isProcessing}
                loading={isProcessing}
              >
                موافقة
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">معالجة الاسترداد</h2>
              <Button variant="ghost" onClick={() => setShowRefundModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">تفاصيل الاسترداد</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>رقم الطلب:</span>
                    <span>{selectedRequest.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>العميل:</span>
                    <span>{selectedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ الأصلي:</span>
                    <span>{selectedRequest.totalAmount.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">مبلغ الاسترداد (EGP)</label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={setRefundAmount}
                  placeholder={selectedRequest.totalAmount.toString()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول الاسترداد..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button variant="ghost" onClick={() => setShowRefundModal(false)}>
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={() => processRefund(selectedRequest.id)}
                disabled={!refundAmount || isProcessing}
                loading={isProcessing}
              >
                معالجة الاسترداد
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RefundsReturnsPage;
