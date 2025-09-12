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
  CreditCard,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FinanceExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExpensesData()
  }, [])

  const loadExpensesData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/finance/expenses')
      if (response.success) {
        setExpenses(response.data || [])
      } else {
        setExpenses([])
        setError('Failed to load expenses data')
        toast.error('Failed to load expenses data')
      }
    } catch (error: any) {
      console.error('Failed to load expenses data:', error)
      setExpenses([])
      setError('Failed to load expenses data')
      toast.error('Failed to load expenses data')
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
      case 'approved':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'paid':
        return 'bg-blue-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'paid':
        return 'text-blue-400'
      case 'rejected':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || expense.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalExpenses = expenses.length
  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const pendingExpenses = expenses.filter(expense => expense.status === 'pending').length
  const approvedExpenses = expenses.filter(expense => expense.status === 'approved').length
  const avgExpenseAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0
  const pendingAmount = expenses.filter(expense => expense.status === 'pending').reduce((sum, expense) => sum + (expense.amount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading expenses data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadExpensesData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  const handleDeleteExpense = async (expense: any) => {
    if (confirm(`Are you sure you want to delete the expense "${expense.description}"?`)) {
      try {
        const response = await apiClient.delete(`/finance/expenses/${expense.id}`)
        if (response.success) {
          toast.success('Expense deleted successfully')
          loadExpensesData()
        } else {
          toast.error(response.message || 'Failed to delete expense')
        }
      } catch (error) {
        console.error('Failed to delete expense:', error)
        toast.error('Failed to delete expense')
      }
    }
  }

  const handleViewExpense = (expense: any) => {
    // Handle view expense action
    console.log('View expense:', expense)
  }

  const handleEditExpense = (expense: any) => {
    // Handle edit expense action
    console.log('Edit expense:', expense)
  }

  const handleMoreActions = (expense: any) => {
    // Handle more actions for expense
    console.log('More actions for expense:', expense)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses Management</h1>
          <p className="text-muted-foreground">
            Track and manage your expenses
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{totalExpenses}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingExpenses}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedExpenses}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Expenses Overview</SnowCardTitle>
          <SnowCardDescription>
            All expenses in your system
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredExpenses.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Description</SnowTableHead>
                <SnowTableHead>Employee</SnowTableHead>
                <SnowTableHead>Category</SnowTableHead>
                <SnowTableHead>Amount</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Date</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredExpenses.map((expense) => (
                  <SnowTableRow key={expense._id || expense.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{expense.description || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.department || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{expense.employee || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {expense.category || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(expense.amount || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(expense.status)} ${getStatusText(expense.status)}`}>
                        {expense.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(expense.date)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewExpense(expense)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMoreActions(expense)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <PoundSterling className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No expenses match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

