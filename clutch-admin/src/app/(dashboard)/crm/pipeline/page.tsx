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
  Timer,
  ArrowRight,
  ArrowLeft,
  Move,
  GripVertical
} from 'lucide-react'
import SimpleChart from '@/components/charts/simple-chart'

interface PipelineDeal {
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
  priority: 'low' | 'medium' | 'high'
}

interface PipelineMetrics {
  totalDeals: number
  totalValue: number
  wonDeals: number
  lostDeals: number
  averageDealSize: number
  winRate: number
  averageSalesCycle: number
  pipelineValue: number
  weightedPipelineValue: number
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<PipelineDeal[]>([])
  const [filteredDeals, setFilteredDeals] = useState<PipelineDeal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    lostDeals: 0,
    averageDealSize: 0,
    winRate: 0,
    averageSalesCycle: 0,
    pipelineValue: 0,
    weightedPipelineValue: 0
  })

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockDeals: PipelineDeal[] = [
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
        createdAt: '2023-12-01',
        priority: 'high'
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
        createdAt: '2023-12-15',
        priority: 'medium'
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
        createdAt: '2024-01-05',
        priority: 'medium'
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
        createdAt: '2023-11-20',
        priority: 'high'
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
        createdAt: '2023-12-10',
        priority: 'low'
      },
      {
        id: '6',
        title: 'Healthcare Data Platform',
        customer: 'MedTech Solutions',
        customerEmail: 'contact@medtech.com',
        value: 180000,
        stage: 'prospect',
        probability: 25,
        expectedCloseDate: '2024-04-30',
        owner: 'John Smith',
        source: 'Website',
        notes: 'Initial contact made, needs assessment required',
        tags: ['healthcare', 'data', 'enterprise'],
        lastActivity: '2024-01-16',
        createdAt: '2024-01-16',
        priority: 'high'
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
      .reduce((sum, d) => sum + d.value, 0)
    const weightedPipelineValue = mockDeals
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
      pipelineValue,
      weightedPipelineValue
    })
  }, [])

  // Filter deals
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

    // Owner filter
    if (ownerFilter !== 'all') {
      filtered = filtered.filter(deal => deal.owner === ownerFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(deal => deal.priority === priorityFilter)
    }

    setFilteredDeals(filtered)
  }, [deals, searchTerm, ownerFilter, priorityFilter])

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
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

  const renderPipelineStages = () => {
    const stages = [
      { key: 'prospect', name: 'Prospect', color: 'bg-gray-50' },
      { key: 'qualification', name: 'Qualification', color: 'bg-blue-50' },
      { key: 'proposal', name: 'Proposal', color: 'bg-yellow-50' },
      { key: 'negotiation', name: 'Negotiation', color: 'bg-orange-50' },
      { key: 'closed-won', name: 'Closed Won', color: 'bg-green-50' },
      { key: 'closed-lost', name: 'Closed Lost', color: 'bg-red-50' }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stages.map(stage => {
          const stageDeals = filteredDeals.filter(deal => deal.stage === stage.key)
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
          const weightedValue = stageDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
          
          return (
            <div key={stage.key} className={`${stage.color} rounded-lg border border-gray-200 p-4 min-h-[400px]`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{stageDeals.length}</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  Total: {formatCurrency(stageValue)}
                </div>
                {stage.key !== 'closed-won' && stage.key !== 'closed-lost' && (
                  <div className="text-sm text-gray-600">
                    Weighted: {formatCurrency(weightedValue)}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {stageDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={() => setDraggedDeal(deal.id)}
                    onDragEnd={() => setDraggedDeal(null)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 mb-1">{deal.title}</div>
                        <div className="text-xs text-gray-600 mb-1">{deal.customer}</div>
                        <div className="text-xs text-gray-500">{deal.owner}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(deal.priority)}`}>
                          {deal.priority}
                        </span>
                        <GripVertical className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                      {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                        <span className={`text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
                          {deal.probability}%
                        </span>
                      )}
                    </div>

                    {deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                      <div className="text-xs text-gray-500">
                        {getDaysUntilClose(deal.expectedCloseDate)} days to close
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-3 w-3" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-3 w-3" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">Visualize and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
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
              <p className="text-sm font-medium text-gray-600">Weighted Pipeline</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.weightedPipelineValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+22% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.winRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Value by Stage</h3>
          <SimpleChart
            title="Pipeline Value by Stage"
            data={[
              { label: 'Prospect', value: 180000 },
              { label: 'Qualification', value: 45000 },
              { label: 'Proposal', value: 85000 },
              { label: 'Negotiation', value: 125000 },
              { label: 'Closed Won', value: 95000 },
              { label: 'Closed Lost', value: 25000 }
            ]}
            type="bar"
            height={200}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Flow</h3>
          <SimpleChart
            title="Deal Flow"
            data={[
              { label: 'Jan', value: 8 },
              { label: 'Feb', value: 12 },
              { label: 'Mar', value: 15 },
              { label: 'Apr', value: 18 },
              { label: 'May', value: 22 },
              { label: 'Jun', value: 25 }
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pipeline Stages</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>
          </div>
        </div>
        
        {renderPipelineStages()}
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