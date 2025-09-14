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
  UserPlus,
  MessageSquare,
  Calendar as CalendarIcon,
  Globe,
  Briefcase
} from 'lucide-react'
import SimpleChart from '@/components/charts/simple-chart'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  title: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
  source: string
  score: number
  lastActivity: string
  nextFollowUp: string
  owner: string
  location: string
  industry: string
  notes: string
  tags: string[]
  createdAt: string
  convertedDealId?: string
}

interface LeadMetrics {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  convertedLeads: number
  averageScore: number
  conversionRate: number
  responseRate: number
  averageResponseTime: number
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [metrics, setMetrics] = useState<LeadMetrics>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    averageScore: 0,
    conversionRate: 0,
    responseRate: 0,
    averageResponseTime: 0
  })

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'Alex Thompson',
        email: 'alex.thompson@innovate.com',
        phone: '+1 (555) 123-4567',
        company: 'InnovateTech Solutions',
        title: 'CTO',
        status: 'qualified',
        source: 'Website',
        score: 85,
        lastActivity: '2024-01-15',
        nextFollowUp: '2024-01-20',
        owner: 'Sarah Johnson',
        location: 'Austin, TX',
        industry: 'Technology',
        notes: 'Very interested in our enterprise solution, budget approved',
        tags: ['enterprise', 'tech', 'high-priority'],
        createdAt: '2024-01-10'
      },
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria.garcia@logistics.com',
        phone: '+1 (555) 234-5678',
        company: 'LogiFlow Systems',
        title: 'Operations Director',
        status: 'contacted',
        source: 'Trade Show',
        score: 72,
        lastActivity: '2024-01-14',
        nextFollowUp: '2024-01-18',
        owner: 'Mike Chen',
        location: 'Miami, FL',
        industry: 'Logistics',
        notes: 'Initial contact made, scheduling demo for next week',
        tags: ['logistics', 'operations', 'demo-scheduled'],
        createdAt: '2024-01-12'
      },
      {
        id: '3',
        name: 'James Wilson',
        email: 'james.wilson@retail.com',
        phone: '+1 (555) 345-6789',
        company: 'RetailMax Chain',
        title: 'IT Manager',
        status: 'new',
        source: 'Referral',
        score: 68,
        lastActivity: '2024-01-16',
        nextFollowUp: '2024-01-19',
        owner: 'Lisa Wang',
        location: 'Seattle, WA',
        industry: 'Retail',
        notes: 'Referred by existing customer, needs assessment required',
        tags: ['retail', 'referral', 'assessment-needed'],
        createdAt: '2024-01-16'
      },
      {
        id: '4',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@manufacturing.com',
        phone: '+1 (555) 456-7890',
        company: 'Manufacturing Plus',
        title: 'VP of Operations',
        status: 'converted',
        source: 'Cold Call',
        score: 92,
        lastActivity: '2024-01-10',
        nextFollowUp: '2024-01-25',
        owner: 'David Thompson',
        location: 'Detroit, MI',
        industry: 'Manufacturing',
        notes: 'Converted to deal #4, implementation starting soon',
        tags: ['manufacturing', 'converted', 'implementation'],
        createdAt: '2024-01-05',
        convertedDealId: '4'
      },
      {
        id: '5',
        name: 'Robert Brown',
        email: 'robert.brown@automotive.com',
        phone: '+1 (555) 567-8901',
        company: 'AutoMax Industries',
        title: 'Fleet Manager',
        status: 'unqualified',
        source: 'Website',
        score: 35,
        lastActivity: '2024-01-08',
        nextFollowUp: '2024-01-22',
        owner: 'John Smith',
        location: 'Phoenix, AZ',
        industry: 'Automotive',
        notes: 'Budget constraints, not a good fit for current solution',
        tags: ['automotive', 'unqualified', 'budget-constraints'],
        createdAt: '2024-01-08'
      }
    ]

    setLeads(mockLeads)
    setFilteredLeads(mockLeads)

    // Calculate metrics
    const totalLeads = mockLeads.length
    const newLeads = mockLeads.filter(l => l.status === 'new').length
    const qualifiedLeads = mockLeads.filter(l => l.status === 'qualified').length
    const convertedLeads = mockLeads.filter(l => l.status === 'converted').length
    const averageScore = mockLeads.reduce((sum, l) => sum + l.score, 0) / totalLeads
    const conversionRate = (convertedLeads / totalLeads) * 100
    const responseRate = 78 // Mock data
    const averageResponseTime = 2.5 // Mock data - hours

    setMetrics({
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      averageScore,
      conversionRate,
      responseRate,
      averageResponseTime
    })
  }, [])

  // Filter and search leads
  useEffect(() => {
    let filtered = leads

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter)
    }

    // Owner filter
    if (ownerFilter !== 'all') {
      filtered = filtered.filter(lead => lead.owner === ownerFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Lead]
      let bValue: any = b[sortBy as keyof Lead]

      if (sortBy === 'score') {
        aValue = a.score
        bValue = b.score
      } else if (sortBy === 'lastActivity') {
        aValue = new Date(a.lastActivity)
        bValue = new Date(b.lastActivity)
      } else if (sortBy === 'nextFollowUp') {
        aValue = new Date(a.nextFollowUp)
        bValue = new Date(b.nextFollowUp)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredLeads(filtered)
  }, [leads, searchTerm, statusFilter, sourceFilter, ownerFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'unqualified': return 'bg-red-100 text-red-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilFollowUp = (nextFollowUp: string) => {
    const today = new Date()
    const followUpDate = new Date(nextFollowUp)
    const diffTime = followUpDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getFollowUpColor = (days: number) => {
    if (days < 0) return 'text-red-600'
    if (days === 0) return 'text-orange-600'
    if (days <= 2) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Track and nurture your sales leads</p>
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
            Add Lead
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.qualifiedLeads}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.averageScore.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+5% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
          <SimpleChart
            title="Leads by Source"
            data={[
              { label: 'Website', value: 45 },
              { label: 'Referral', value: 25 },
              { label: 'Trade Show', value: 15 },
              { label: 'Cold Call', value: 10 },
              { label: 'Social Media', value: 5 }
            ]}
            type="donut"
            height={200}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Conversion Funnel</h3>
          <SimpleChart
            title="Lead Conversion Funnel"
            data={[
              { label: 'New', value: 100 },
              { label: 'Contacted', value: 75 },
              { label: 'Qualified', value: 50 },
              { label: 'Converted', value: 20 }
            ]}
            type="bar"
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
                placeholder="Search leads..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="converted">Converted</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Social Media">Social Media</option>
            </select>

            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Owners</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Chen">Mike Chen</option>
              <option value="Lisa Wang">Lisa Wang</option>
              <option value="David Thompson">David Thompson</option>
              <option value="John Smith">John Smith</option>
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
              <option value="score-desc">Score High-Low</option>
              <option value="score-asc">Score Low-High</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="nextFollowUp-asc">Follow-up Date</option>
              <option value="lastActivity-desc">Last Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List/Grid */}
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
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Follow-up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{lead.company}</div>
                        <div className="text-sm text-gray-500">{lead.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{lead.source}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(lead.nextFollowUp)}</div>
                      <div className={`text-xs ${getFollowUpColor(getDaysUntilFollowUp(lead.nextFollowUp))}`}>
                        {getDaysUntilFollowUp(lead.nextFollowUp)} days
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{lead.owner}</td>
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
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <p className="text-sm text-gray-500">{lead.title}</p>
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
                      <Building2 className="h-4 w-4 mr-2" />
                      {lead.company}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {lead.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                      <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${lead.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Source</span>
                      <span className="text-gray-900">{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Owner</span>
                      <span className="text-gray-900">{lead.owner}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Next Follow-up</span>
                      <span className={`text-sm ${getFollowUpColor(getDaysUntilFollowUp(lead.nextFollowUp))}`}>
                        {formatDate(lead.nextFollowUp)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {getDaysUntilFollowUp(lead.nextFollowUp)} days remaining
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-800">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
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
              <button className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                Convert to Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}