'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Users,
  Building2,
  DollarSign,
  Activity,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import SimpleChart from '@/components/charts/simple-chart'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive' | 'prospect' | 'churned'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  lastContact: string
  totalValue: number
  dealsCount: number
  location: string
  industry: string
  source: string
  notes: string
  tags: string[]
  avatar?: string
}

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  churnedCustomers: number
  averageValue: number
  conversionRate: number
  retentionRate: number
  satisfactionScore: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [metrics, setMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    churnedCustomers: 0,
    averageValue: 0,
    conversionRate: 0,
    retentionRate: 0,
    satisfactionScore: 0
  })

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Solutions',
        status: 'active',
        tier: 'platinum',
        lastContact: '2024-01-15',
        totalValue: 125000,
        dealsCount: 8,
        location: 'San Francisco, CA',
        industry: 'Technology',
        source: 'Website',
        notes: 'High-value client, very responsive to new features',
        tags: ['enterprise', 'tech', 'high-value']
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'm.chen@automotive.com',
        phone: '+1 (555) 234-5678',
        company: 'AutoMax Industries',
        status: 'active',
        tier: 'gold',
        lastContact: '2024-01-12',
        totalValue: 85000,
        dealsCount: 5,
        location: 'Detroit, MI',
        industry: 'Automotive',
        source: 'Referral',
        notes: 'Interested in fleet management solutions',
        tags: ['automotive', 'fleet', 'referral']
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.r@logistics.com',
        phone: '+1 (555) 345-6789',
        company: 'LogiFlow Systems',
        status: 'prospect',
        tier: 'silver',
        lastContact: '2024-01-10',
        totalValue: 45000,
        dealsCount: 2,
        location: 'Chicago, IL',
        industry: 'Logistics',
        source: 'Trade Show',
        notes: 'Evaluating multiple solutions, decision pending',
        tags: ['logistics', 'prospect', 'evaluation']
      },
      {
        id: '4',
        name: 'David Thompson',
        email: 'david.t@retail.com',
        phone: '+1 (555) 456-7890',
        company: 'RetailMax Chain',
        status: 'active',
        tier: 'gold',
        lastContact: '2024-01-08',
        totalValue: 95000,
        dealsCount: 6,
        location: 'New York, NY',
        industry: 'Retail',
        source: 'Cold Call',
        notes: 'Expanding to new locations, needs scalable solution',
        tags: ['retail', 'expansion', 'scalable']
      },
      {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa.wang@manufacturing.com',
        phone: '+1 (555) 567-8901',
        company: 'Manufacturing Plus',
        status: 'inactive',
        tier: 'bronze',
        lastContact: '2023-12-20',
        totalValue: 25000,
        dealsCount: 1,
        location: 'Houston, TX',
        industry: 'Manufacturing',
        source: 'Website',
        notes: 'Contract expired, follow-up needed',
        tags: ['manufacturing', 'expired', 'follow-up']
      }
    ]

    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)

    // Calculate metrics
    const totalCustomers = mockCustomers.length
    const activeCustomers = mockCustomers.filter(c => c.status === 'active').length
    const newCustomers = mockCustomers.filter(c => {
      const lastContact = new Date(c.lastContact)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastContact > thirtyDaysAgo
    }).length
    const churnedCustomers = mockCustomers.filter(c => c.status === 'churned').length
    const averageValue = mockCustomers.reduce((sum, c) => sum + c.totalValue, 0) / totalCustomers
    const conversionRate = (activeCustomers / totalCustomers) * 100
    const retentionRate = 85 // Mock data
    const satisfactionScore = 4.2 // Mock data

    setMetrics({
      totalCustomers,
      activeCustomers,
      newCustomers,
      churnedCustomers,
      averageValue,
      conversionRate,
      retentionRate,
      satisfactionScore
    })
  }, [])

  // Filter and search customers
  useEffect(() => {
    let filtered = customers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter)
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(customer => customer.tier === tierFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Customer]
      let bValue: any = b[sortBy as keyof Customer]

      if (sortBy === 'totalValue') {
        aValue = a.totalValue
        bValue = b.totalValue
      } else if (sortBy === 'lastContact') {
        aValue = new Date(a.lastContact)
        bValue = new Date(b.lastContact)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredCustomers(filtered)
  }, [customers, searchTerm, statusFilter, tierFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      case 'churned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800'
      case 'gold': return 'bg-yellow-100 text-yellow-800'
      case 'silver': return 'bg-gray-100 text-gray-800'
      case 'bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Value</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.averageValue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+15% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retention Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.retentionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+3% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
          <SimpleChart
            title="Customer Growth"
            data={[
              { label: 'Jan', value: 120 },
              { label: 'Feb', value: 135 },
              { label: 'Mar', value: 142 },
              { label: 'Apr', value: 158 },
              { label: 'May', value: 165 },
              { label: 'Jun', value: 172 }
            ]}
            type="line"
            height={200}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Tiers</h3>
          <SimpleChart
            title="Customer Tiers"
            data={[
              { label: 'Platinum', value: 15 },
              { label: 'Gold', value: 35 },
              { label: 'Silver', value: 40 },
              { label: 'Bronze', value: 10 }
            ]}
            type="donut"
            height={200}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="churned">Churned</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="totalValue-desc">Value High-Low</option>
              <option value="totalValue-asc">Value Low-High</option>
              <option value="lastContact-desc">Recent Contact</option>
              <option value="lastContact-asc">Oldest Contact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List/Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {viewMode === 'list' ? (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.company}</div>
                      <div className="text-sm text-gray-500">{customer.industry}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalValue)}</div>
                      <div className="text-sm text-gray-500">{customer.dealsCount} deals</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(customer.lastContact)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {customer.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Value</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(customer.totalValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Last Contact</span>
                      <span className="text-gray-900">{formatDate(customer.lastContact)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-800">
              {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Export
              </button>
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Send Email
              </button>
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}