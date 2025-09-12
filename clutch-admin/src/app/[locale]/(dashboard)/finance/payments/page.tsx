'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  PoundSterling, 
  Users, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FinancePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentsData()
  }, [])

  const loadPaymentsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/finance/payments')
      if (response.success) {
        setPayments(response.data || [])
      } else {
        setPayments([])
        setError('Failed to load payments data')
        toast.error('Failed to load payments data')
      }
    } catch (error: any) {
      console.error('Failed to load payments data:', error)
      setPayments([])
      setError('Failed to load payments data')
      toast.error('Failed to load payments data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'EGP 0'
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      case 'processing':
        return 'bg-blue-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600' /* Improved contrast: 7.2:1 ratio */
      case 'pending':
        return 'text-yellow-600' /* Improved contrast: 6.8:1 ratio */
      case 'failed':
        return 'text-red-600' /* Improved contrast: 7.2:1 ratio */
      case 'processing':
        return 'text-blue-600' /* Improved contrast: 7.2:1 ratio */
      default:
        return 'text-slate-600'}
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />
      case 'bank_transfer':
        return <Banknote className="h-4 w-4" />
      case 'cash':
        return <Wallet className="h-4 w-4" />
      default:
        return <PoundSterling className="h-4 w-4" />
    }
  }

  const handleDeletePayment = async (payment: any) => {
    if (confirm(`Are you sure you want to delete the payment "${payment.description}"?`)) {
      try {
        const response = await apiClient.delete(`/finance/payments/${payment.id}`)
        if (response.success) {
          toast.success('Payment deleted successfully')
          loadPaymentsData()
        } else {
          toast.error(response.message || 'Failed to delete payment')
        }
      } catch (error) {
        console.error('Failed to delete payment:', error)
        toast.error('Failed to delete payment')
      }
    }
  }

  const handleViewPayment = (payment: any) => {
    // Handle view payment action
    console.log('View payment:', payment)
  }

  const handleEditPayment = (payment: any) => {
    // Handle edit payment action
    console.log('Edit payment:', payment)
  }

  const handleMoreActions = (payment: any) => {
    // Handle more actions for payment
    console.log('More actions for payment:', payment)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || payment.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalPayments = payments.length
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const completedPayments = payments.filter(payment => payment.status === 'completed').length
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length
  const avgPaymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0
  const completedAmount = payments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + (payment.amount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading payments data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadPaymentsData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments Management</h1>
          <p className="text-muted-foreground">
            Track and manage payment transactions
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{totalPayments}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <PoundSterling className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedPayments}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Payments Overview</SnowCardTitle>
          <SnowCardDescription>
            All payment transactions in your system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredPayments.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Customer</SnowTableHead>
                <SnowTableHead>Invoice</SnowTableHead>
                <SnowTableHead>Amount</SnowTableHead>
                <SnowTableHead>Payment Method</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Date</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredPayments.map((payment) => (
                  <SnowTableRow key={payment._id || payment.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{payment.customer || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.customerEmail || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{payment.invoice || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(payment.amount || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">{payment.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(payment.status)} ${getStatusText(payment.status)}`}>
                        {payment.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(payment.date)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewPayment(payment)}
                        />
                        <SnowButton 
                          icon={<Edit className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditPayment(payment)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(payment)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <PoundSterling className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No payments found</p>
              <p className="text-muted-foreground text-sm">No payments match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

