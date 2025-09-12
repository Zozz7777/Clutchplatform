'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Download,
  FileText,
  Receipt,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FinanceInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/finance/invoices')
      if (response.success && response.data) {
        setInvoices(response.data as any[])
      } else {
        setInvoices([])
        if (!response.success) {
          toast.error('Failed to load invoices')
          setError('Failed to load invoices')
        }
      }
    } catch (error: any) {
      console.error('Failed to load invoices:', error)
      setError('Failed to load invoices')
      setInvoices([])
      toast.error('Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewInvoice = async (invoice: any) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoice._id}`)
      if (response.success) {
        setSelectedInvoice(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load invoice details')
      }
    } catch (error) {
      console.error('Failed to load invoice details:', error)
      toast.error('Failed to load invoice details')
    }
  }

  const handleEditInvoice = async (invoice: any) => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoice._id}`)
      if (response.success) {
        setSelectedInvoice(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load invoice for editing')
      }
    } catch (error) {
      console.error('Failed to load invoice for editing:', error)
      toast.error('Failed to load invoice for editing')
    }
  }

  const handleDeleteInvoice = async (invoice: any) => {
    if (confirm(`Are you sure you want to delete the invoice "${invoice.invoiceNumber}"?`)) {
      try {
        const response = await apiClient.delete(`/finance/invoices/${invoice._id}`)
        if (response.success) {
          toast.success('Invoice deleted successfully')
          loadInvoices() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete invoice')
        }
      } catch (error) {
        console.error('Failed to delete invoice:', error)
        toast.error('Failed to delete invoice')
      }
    }
  }

  const handleExportInvoice = async (invoice: any, format: string = 'pdf') => {
    try {
      const response = await apiClient.get(`/finance/invoices/${invoice._id}/export?format=${format}`)
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data as BlobPart], { type: `application/${format}` })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice.invoiceNumber}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Invoice exported as ${format.toUpperCase()}`)
      } else {
        toast.error('Failed to export invoice')
      }
    } catch (error) {
      console.error('Failed to export invoice:', error)
      toast.error('Failed to export invoice')
    }
  }

  const handleAddInvoice = async (invoiceData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/finance/invoices', invoiceData)
      if (response.success) {
        toast.success('Invoice created successfully')
        setShowAddModal(false)
        loadInvoices()
      } else {
        toast.error(response.message || 'Failed to create invoice')
      }
    } catch (error: any) {
      console.error('Failed to create invoice:', error)
      toast.error('Failed to create invoice')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateInvoice = async (invoiceData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/finance/invoices/${selectedInvoice._id}`, invoiceData)
      if (response.success) {
        toast.success('Invoice updated successfully')
        setShowEditModal(false)
        setSelectedInvoice(null)
        loadInvoices()
      } else {
        toast.error(response.message || 'Failed to update invoice')
      }
    } catch (error: any) {
      console.error('Failed to update invoice:', error)
      toast.error('Failed to update invoice')
    } finally {
      setIsFormLoading(false)
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
      case 'paid':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'overdue':
        return 'bg-red-500'
      case 'draft':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'overdue':
        return 'text-red-400'
      case 'draft':
        return 'text-slate-400'
      default:
        return 'text-slate-400'
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || invoice.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length
  const avgInvoiceAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading invoices data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadInvoices}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices Management</h1>
          <p className="text-muted-foreground">
            Track and manage your invoices
          </p>
        </div>
                 <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{paidInvoices}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueInvoices}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Invoices Overview</SnowCardTitle>
          <SnowCardDescription>
            All invoices in your system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredInvoices.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Invoice</SnowTableHead>
                <SnowTableHead>Customer</SnowTableHead>
                <SnowTableHead>Amount</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Issue Date</SnowTableHead>
                <SnowTableHead>Due Date</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredInvoices.map((invoice) => (
                  <SnowTableRow key={invoice._id || invoice.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customerEmail || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{invoice.customerName || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(invoice.amount || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(invoice.status)} ${getStatusText(invoice.status)}`}>
                        {invoice.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(invoice.issueDate)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(invoice.dueDate)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        />
                        <SnowButton
                          icon={<Edit className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                        />
                        <SnowButton
                          icon={<Download className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportInvoice(invoice, 'pdf')}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <PoundSterling className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No invoices found</p>
              <p className="text-muted-foreground text-sm">No invoices match your current filters.</p>
                             <SnowButton variant="default" onClick={() => setShowAddModal(true)} className="mt-4">
                 <Plus className="h-4 w-4 mr-2" />
                 Create Invoice
               </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

