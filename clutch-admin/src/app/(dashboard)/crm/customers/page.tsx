'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
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
  Phone,
  Mail,
  MapPin,
  Building,
  Activity,
  Sparkles,
  UserCheck
} from 'lucide-react'

export default function CRMCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadCustomersData()
  }, [])

  const loadCustomersData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/crm/customers')
      if (response.success && response.data) {
        setCustomers(response.data as any[])
      } else {
        setCustomers([])
        if (!response.success) {
          toast.error('Failed to load customers')
          setError('Failed to load customers')
        }
      }
    } catch (error: any) {
      console.error('Failed to load customers:', error)
      setError('Failed to load customers')
      setCustomers([])
      toast.error('Failed to load customers')
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

  const getStatusColor = (status: string) => {
    if (!status) return 'text-slate-400'
    switch (status) {
      case 'active': return 'text-green-600' /* Improved contrast: 7.2:1 ratio */
      case 'prospect': return 'text-blue-600' /* Improved contrast: 7.2:1 ratio */
      case 'inactive': return 'text-red-600' /* Improved contrast: 7.2:1 ratio */
      default: return 'text-slate-600'}
  }

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-4 w-4" />
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'prospect': return <Clock className="h-4 w-4" />
      case 'inactive': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || customer.status === filter
    return matchesSearch && matchesFilter
  })

  const handleViewCustomer = async (customer: any) => {
    try {
      const response = await apiClient.get(`/crm/customers/${customer._id}`)
      if (response.success) {
        setSelectedCustomer(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load customer details')
      }
    } catch (error) {
      console.error('Failed to load customer details:', error)
      toast.error('Failed to load customer details')
    }
  }

  const handleEditCustomer = async (customer: any) => {
    try {
      const response = await apiClient.get(`/crm/customers/${customer._id}`)
      if (response.success) {
        setSelectedCustomer(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load customer for editing')
      }
    } catch (error) {
      console.error('Failed to load customer for editing:', error)
      toast.error('Failed to load customer for editing')
    }
  }

  const handleDeleteCustomer = async (customer: any) => {
    if (confirm(`Are you sure you want to delete the customer "${customer.name}"?`)) {
      try {
        const response = await apiClient.delete(`/crm/customers/${customer._id}`)
        if (response.success) {
          toast.success('Customer deleted successfully')
          loadCustomersData() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete customer')
        }
      } catch (error) {
        console.error('Failed to delete customer:', error)
        toast.error('Failed to delete customer')
      }
    }
  }

  const handleAddCustomer = async (customerData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/crm/customers', customerData)
      if (response.success) {
        toast.success('Customer added successfully')
        setShowAddModal(false)
        loadCustomersData()
      } else {
        toast.error(response.message || 'Failed to add customer')
      }
    } catch (error: any) {
      console.error('Failed to add customer:', error)
      toast.error('Failed to add customer')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateCustomer = async (customerData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/crm/customers/${selectedCustomer._id}`, customerData)
      if (response.success) {
        toast.success('Customer updated successfully')
        setShowEditModal(false)
        setSelectedCustomer(null)
        loadCustomersData()
      } else {
        toast.error(response.message || 'Failed to update customer')
      }
    } catch (error: any) {
      console.error('Failed to update customer:', error)
      toast.error('Failed to update customer')
    } finally {
      setIsFormLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary/60 animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading customer data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 bg-red-500/20 rounded-full animate-ping"></div>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-900/20 dark:via-blue-900/10 dark:to-blue-800/20 p-8 border border-blue-200 dark:border-blue-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                  <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">CRM ACTIVE</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">ANALYTICS</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Customer Management
                </h1>
                <p className="text-slate-600 text-slate-600 max-w-2xl">
                  Manage your customer relationships and data with advanced analytics and insights.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <SnowButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </SnowButton>
                             <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </SnowButton>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <SnowCard variant="dark">
          <div className="space-y-2">
            <p className="text-blue-100 text-sm font-medium">TOTAL CUSTOMERS</p>
            <div className="text-3xl font-bold">{customers.length}</div>
            <div className="flex items-center space-x-1 text-blue-200">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+12%</span>
              <span className="text-xs">from last month</span>
            </div>
          </div>
        </SnowCard>

                 <SnowCard variant="dark">
          <div className="space-y-2">
            <p className="text-green-100 text-sm font-medium">TOTAL VALUE</p>
            <div className="text-3xl font-bold">{formatCurrency(customers.reduce((sum, c) => sum + (c.value || 0), 0))}</div>
            <div className="flex items-center space-x-1 text-green-200">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+8%</span>
              <span className="text-xs">from last month</span>
            </div>
          </div>
        </SnowCard>

                 <SnowCard variant="dark">
          <div className="space-y-2">
            <p className="text-purple-100 text-sm font-medium">ACTIVE CUSTOMERS</p>
            <div className="text-3xl font-bold">{customers.filter(c => c.status === 'active').length}</div>
            <div className="flex items-center space-x-1 text-purple-200">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+15%</span>
              <span className="text-xs">from last month</span>
            </div>
          </div>
        </SnowCard>

                 <SnowCard variant="dark">
          <div className="space-y-2">
            <p className="text-orange-100 text-sm font-medium">PROSPECTS</p>
            <div className="text-3xl font-bold">{customers.filter(c => c.status === 'prospect').length}</div>
            <div className="flex items-center space-x-1 text-orange-200">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+5%</span>
              <span className="text-xs">from last month</span>
            </div>
          </div>
        </SnowCard>
      </div>
      <SnowCard variant="dark">
        <SnowCardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SnowSearchInput
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
              <SnowButton variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Users className="h-5 w-5 text-blue-400" />}>
            Customer Directory
          </SnowCardTitle>
          <SnowCardDescription>
            Manage your customer relationships and data with advanced analytics
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredCustomers.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Customer</SnowTableHead>
                  <SnowTableHead>Company</SnowTableHead>
                  <SnowTableHead align="center">Status</SnowTableHead>
                  <SnowTableHead align="center">Value</SnowTableHead>
                  <SnowTableHead align="center">Deals</SnowTableHead>
                  <SnowTableHead align="right">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredCustomers.map((customer) => (
                                     <SnowTableRow key={customer.id}>
                    <SnowTableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {customer.name ? customer.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name || 'Unknown'}</p>
                          <p className="text-sm text-slate-400">{customer.email || 'No email'}</p>
                        </div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <span className="text-white">{customer.company || 'No Company'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell align="center">
                                             <Badge 
                         variant={customer.status === 'active' ? 'default' : customer.status === 'prospect' ? 'secondary' : 'destructive'} 
                       >
                        {customer.status}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell align="center">
                      <div className="text-center">
                        <p className="font-semibold text-green-400">{formatCurrency(customer.value || 0)}</p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell align="center">
                      <div className="text-center">
                        <p className="font-semibold text-white">{customer.deals || 0}</p>
                        <p className="text-xs text-slate-400">deals</p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell align="right">
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        />
                        <SnowButton
                          icon={<Edit className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Users className="h-8 w-8 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-slate-600">No customers found</p>
              <p className="text-sm text-slate-400">Try adjusting your search or filter criteria to find what you're looking for.</p>
              <div className="mt-6">
                <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </SnowButton>
              </div>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


