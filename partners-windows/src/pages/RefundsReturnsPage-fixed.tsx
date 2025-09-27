import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RBACGuard } from '../components/RBACGuard';

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
  status: 'pending' | 'approved' | 'rejected';
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
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export default function RefundsReturnsPage() {
  const { auth } = useAuth();
  const { t } = useTranslation();
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);

  const filteredRequests = useMemo(() => {
    return refundRequests.filter(request => {
      const matchesSearch = 
        request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerPhone.includes(searchTerm) ||
        request.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [refundRequests, searchTerm, statusFilter]);

  const loadRefundRequests = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/v1/partners/refunds', {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const refundRequests: RefundRequest[] = data.data || [];
        setRefundRequests(refundRequests);
      } else {
        console.error('Failed to load refund requests');
        setRefundRequests([]);
      }
    } catch (error) {
      console.error('Error loading refund requests:', error);
      setRefundRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRefund = async (requestId: string) => {
    try {
      const response = await fetch(`/api/v1/partners/refunds/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: approvalNotes,
          refundAmount: refundAmount
        })
      });

      if (response.ok) {
        await loadRefundRequests();
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalNotes('');
        setRefundAmount(0);
      } else {
        console.error('Failed to approve refund');
      }
    } catch (error) {
      console.error('Error approving refund:', error);
    }
  };

  const handleRejectRefund = async (requestId: string) => {
    try {
      const response = await fetch(`/api/v1/partners/refunds/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: approvalNotes
        })
      });

      if (response.ok) {
        await loadRefundRequests();
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalNotes('');
      } else {
        console.error('Failed to reject refund');
      }
    } catch (error) {
      console.error('Error rejecting refund:', error);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadRefundRequests();
    }
  }, [auth.isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-600 bg-green-100';
      case 'used': return 'text-yellow-600 bg-yellow-100';
      case 'damaged': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <RBACGuard requiredPermissions={['view_refunds', 'manage_refunds']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('refunds.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('refunds.subtitle')}
            </p>
          </div>
          <Button
            onClick={loadRefundRequests}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{t('common.refresh')}</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('refunds.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('refunds.allStatuses')}</option>
              <option value="pending">{t('refunds.pending')}</option>
              <option value="approved">{t('refunds.approved')}</option>
              <option value="rejected">{t('refunds.rejected')}</option>
              <option value="processing">{t('refunds.processing')}</option>
              <option value="completed">{t('refunds.completed')}</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {refundRequests.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">{t('refunds.pending')}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {refundRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">{t('refunds.approved')}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {refundRequests.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">{t('refunds.rejected')}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {refundRequests.filter(r => r.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">{t('refunds.processing')}</div>
            </div>
          </Card>
        </div>

        {/* Refund Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('refunds.noRequests')}
                </h3>
                <p className="text-gray-600">
                  {t('refunds.noRequestsDescription')}
                </p>
              </div>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('refunds.request')} #{request.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('refunds.order')}: {request.orderId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {t(`refunds.${request.status}`)}
                    </span>
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRefundAmount(request.totalAmount);
                          setShowApprovalModal(true);
                        }}
                      >
                        {t('refunds.review')}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('refunds.customerInfo')}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{request.customerName}</div>
                      <div>{request.customerPhone}</div>
                      <div>{request.customerEmail}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('refunds.requestInfo')}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{t('refunds.requestedAt')}: {new Date(request.requestedAt).toLocaleDateString()}</div>
                      <div>{t('refunds.totalAmount')}: ${request.totalAmount}</div>
                      <div>{t('refunds.reason')}: {request.reason}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('refunds.items')}</h4>
                  <div className="space-y-2">
                    {request.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-600">
                            {t('refunds.sku')}: {item.productSku} | {t('refunds.quantity')}: {item.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t('refunds.unitPrice')}: ${item.unitPrice} | {t('refunds.total')}: ${item.totalPrice}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                            {t(`refunds.${item.condition}`)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {t(`refunds.${item.status}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('refunds.reviewRequest')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('refunds.refundAmount')}
                  </label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    placeholder={selectedRequest.totalAmount.toString()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('refunds.notes')}
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={t('refunds.addNotes')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setApprovalNotes('');
                    setRefundAmount(0);
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleRejectRefund(selectedRequest.id)}
                >
                  {t('refunds.reject')}
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleApproveRefund(selectedRequest.id)}
                >
                  {t('refunds.approve')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RBACGuard>
  );
}
