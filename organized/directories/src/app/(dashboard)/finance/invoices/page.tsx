'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { useFinanceStore } from '@/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  FileText, Plus, Search, Filter, MoreHorizontal, Download, Eye, Edit, Trash2, DollarSign, Calendar, User, Building2, CheckCircle, Clock, XCircle,
} from 'lucide-react'

export default function InvoicesPage() {
  const { invoices, isLoading, fetchInvoices } = useFinanceStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

  React.useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const totalInvoices = filteredInvoices.length
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid').length
  const pendingInvoices = filteredInvoices.filter(invoice => invoice.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage and track all invoices</p>
        </div>
        <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Invoices</SnowCardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Amount</SnowCardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Paid Invoices</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Pending Invoices</SnowCardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Filters</SnowCardTitle>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SnowInput
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Invoices Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>All Invoices</SnowCardTitle>
          <SnowCardDescription>A list of all invoices in the system</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">{invoice.customerName}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                    {getStatusIcon(invoice.status)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SnowButton variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </SnowButton>
                    <SnowButton variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </SnowButton>
                    <SnowButton variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No invoices found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

