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
  LineChart,
  Handshake,
  TrendingUp as TrendingUpIcon,
  Percent,
  Timer
} from 'lucide-react'
import SimpleChart from '@/components/charts/simple-chart'

interface Deal {
  id: string
  title: string
  customer: string
  customerEmail: string
  value: number
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  probability: number
  expectedCloseDate: string
  actualCloseDate?: string
  owner: string
  source: string
  notes: string
  tags: string[]
  lastActivity: string
  createdAt: string
}

interface DealMetrics {
  totalDeals: number
  totalValue: number
  wonDeals: number
  lostDeals: number
  averageDealSize: number
  winRate: number
  averageSalesCycle: number
  pipelineValue: number
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'pipeline'>('pipeline')

  const [metrics, setMetrics] = useState<DealMetrics>({
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    lostDeals: 0,
    averageDealSize: 0,
    winRate: 0,
    averageSalesCycle: 0,
    pipelineValue: 0
  })

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Enterprise Fleet Management',
        customer: 'TechCorp Solutions',
        customerEmail: 'sarah.johnson@techcorp.com',
        value: 125000,
        stage: 'negotiation',
        probability: 75,
        expectedCloseDate: '2024-02-15',
        owner: 'John Smith',
        source: 'Website',
        notes: 'High-value enterprise deal, technical evaluation completed',
        tags: ['enterprise', 'fleet', 'high-value'],
        lastActivity: '2024-01-15',
        createdAt: '2023-12-01'
      },
      {
        id: '2',
        title: 'Automotive Integration Platform',
        customer: 'AutoMax Industries',
        customerEmail: 'm.chen@automotive.com',
        value: 85000,
        stage: 'proposal',
        probability: 60,
        expectedCloseDate: '2024-02-28',
        owner: 'Sarah Johnson',
        source: 'Referral',
        notes: 'Proposal submitted, awaiting technical review',
        tags: ['automotive', 'integration', 'referral'],
        lastActivity: '2024-01-12',
        createdAt: '2023-12-15'
      },
      {
        id: '3',
        title: 'Logistics Optimization Suite',
        customer: 'LogiFlow Systems',
        customerEmail: 'emily.r@logistics.com',
        value: 45000,
        stage: 'qualification',
        probability: 40,
        expectedCloseDate: '2024-03-15',
        owner: 'Mike Chen',
        source: 'Trade Show',
        notes: 'Initial qualification completed, needs assessment scheduled',
        tags: ['logistics', 'optimization', 'prospect'],
        lastActivity: '2024-01-10',
        createdAt: '2024-01-05'
      },
      {
        id: '4',
        title: 'Retail Chain Management',
        customer: 'RetailMax Chain',
        customerEmail: 'david.t@retail.com',
        value: 95000,
        stage: 'closed-won',
        probability: 100,
        expectedCloseDate: '2024-01-10',
        actualCloseDate: '2024-01-10',
        owner: 'Lisa Wang',
        source: 'Cold Call',
        notes: 'Deal closed successfully, implementation starting',
        tags: ['retail', 'management', 'closed'],
        lastActivity: '2024-01-10',
        createdAt: '2023-11-20'
      },
      {
        id: '5',
        title: 'Manufacturing Analytics',
        customer: 'Manufacturing Plus',
        customerEmail: 'lisa.wang@manufacturing.com',
        value: 25000,
        stage: 'closed-lost',
        probability: 0,
        expectedCloseDate: '2024-01-05',
        actualCloseDate: '2024-01-05',
        owner: 'David Thompson',
        source: 'Website',
        notes: 'Lost to competitor, budget constraints',
        tags: ['manufacturing', 'analytics', 'lost'],
        lastActivity: '2024-01-05',
        createdAt: '2023-12-10'
      }
    ]

    setDeals(mockDeals)
    setFilteredDeals(mockDeals)

    // Calculate metrics
    const totalDeals = mockDeals.length
    const totalValue = mockDeals.reduce((sum, d) => sum + d.value, 0)
    const wonDeals = mockDeals.filter(d => d.stage === 'closed-won').length
    const lostDeals = mockDeals.filter(d => d.stage === 'closed-lost').length
    const averageDealSize = totalValue / totalDeals
    const winRate = (wonDeals / (wonDeals + lostDeals)) * 100
    const averageSalesCycle = 45 // Mock data - days
    const pipelineValue = mockDeals
      .filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.value * d.probability / 100), 0)

    setMetrics({
      totalDeals,
      totalValue,
      wonDeals,
      lostDeals,
      averageDealSize,
      winRate,
      averageSalesCycle,
      pipelineValue
    })
  }, [])

  // Filter and search deals
  useEffect(() => {
    let filtered = deals

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.owner.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage === stageFilter)
    }

    // Owner filter
    if (ownerFilter !== 'all') {
      filtered = filtered.filter(deal => deal.owner === ownerFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Deal]
      let bValue: any = b[sortBy as keyof Deal]

      if (sortBy === 'value') {
        aValue = a.value
        bValue = b.value
      } else if (sortBy === 'expectedCloseDate') {
        aValue = new Date(a.expectedCloseDate)
        bValue = new Date(b.expectedCloseDate)
      } else if (sortBy === 'probability') {
        aValue = a.probability
        bValue = b.probability
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredDeals(filtered)
  }, [deals, searchTerm, stageFilter, ownerFilter, sortBy, sortOrder])

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-100 text-gray-800'
      case 'qualification': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-yellow-100 text-yellow-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed-won': return 'bg-green-100 text-green-800'
      case 'closed-lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600'
    if (probability >= 50) return 'text-yellow-600'
    if (probability >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDeals.length === filteredDeals.length) {
      setSelectedDeals([])
    } else {
      setSelectedDeals(filteredDeals.map(d => d.id))
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

  const getDaysUntilClose = (expectedCloseDate: string) => {
    const today = new Date()
    const closeDate = new Date(expectedCloseDate)
    const diffTime = closeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const renderPipelineView = () => {
    const stages = ['prospect', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']
    const stageNames = {
      'prospect': 'Prospect',
      'qualification': 'Qualification',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'closed-won': 'Closed Won',
      'closed-lost': 'Closed Lost'
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stages.map(stage => {
          const stageDeals = filteredDeals.filter(deal => deal.stage === stage)
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
          
          return (
            <div key={stage} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stageNames[stage as keyof typeof stageNames]}</h3>
                <span className="text-sm text-gray-500">{stageDeals.length}</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {formatCurrency(stageValue)}
              </div>
              <div className="space-y-3">
                {stageDeals.map(deal => (
                  <div key={deal.id} className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="font-medium text-sm text-gray-900 mb-1">{deal.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{deal.customer}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                      {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                        <span className={`text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                      )}
                    </div>
                    {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {getDaysUntilClose(deal.expectedCloseDate)} days
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales pipeline and deals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'pipeline' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.pipelineValue)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+18% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.winRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+5% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Deal Size</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.averageDealSize)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-600">Sales Cycle</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.averageSalesCycle} days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">-8% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Value by Stage</h3>
          <SimpleChart
            title="Deal Value by Stage"
            data={[
              { label: 'Prospect', value: 150000 },
              { label: 'Qualification', value: 200000 },
              { label: 'Proposal', value: 180000 },
              { label: 'Negotiation', value: 120000 },
              { label: 'Closed Won', value: 95000 },
              { label: 'Closed Lost', value: 25000 }
            ]}
            type="bar"
            height={200}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <SimpleChart
            title="Monthly Revenue"
            data={[
              { label: 'Jan', value: 125000 },
              { label: 'Feb', value: 142000 },
              { label: 'Mar', value: 158000 },
              { label: 'Apr', value: 165000 },
              { label: 'May', value: 172000 },
              { label: 'Jun', value: 185000 }
            ]}
            type="line"
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
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Stages</option>
              <option value="prospect">Prospect</option>
              <option value="qualification">Qualification</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Owners</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Chen">Mike Chen</option>
              <option value="Lisa Wang">Lisa Wang</option>
              <option value="David Thompson">David Thompson</option>
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
              <option value="value-desc">Value High-Low</option>
              <option value="value-asc">Value Low-High</option>
              <option value="expectedCloseDate-asc">Close Date</option>
              <option value="probability-desc">Probability High-Low</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {viewMode === 'pipeline' ? (
          <div className="p-6">
            {renderPipelineView()}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDeals.includes(deal.id)}
                        onChange={() => handleSelectDeal(deal.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                        <div className="text-sm text-gray-500">{deal.source}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{deal.customer}</div>
                        <div className="text-sm text-gray-500">{deal.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                        {deal.stage.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(deal.value)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(deal.expectedCloseDate)}</div>
                      {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                        <div className="text-xs text-gray-500">
                          {getDaysUntilClose(deal.expectedCloseDate)} days
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{deal.owner}</td>
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
              {filteredDeals.map((deal) => (
                <div key={deal.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{deal.title}</h3>
                      <p className="text-sm text-gray-500">{deal.customer}</p>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Probability</span>
                      <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                        {deal.probability}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Stage</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                        {deal.stage.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Owner</span>
                      <span className="text-gray-900">{deal.owner}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Close Date</span>
                      <span className="text-gray-900">{formatDate(deal.expectedCloseDate)}</span>
                    </div>
                    {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                      <div className="mt-2 text-xs text-gray-500">
                        {getDaysUntilClose(deal.expectedCloseDate)} days remaining
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDeals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-800">
              {selectedDeals.length} deal{selectedDeals.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Export
              </button>
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Bulk Update
              </button>
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Move Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}