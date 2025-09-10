'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  Ticket, 
  MessageSquare, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Calendar,
  Tag,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useSupportDashboard } from '@/hooks/useSupportDashboard'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

interface TicketMetrics {
  totalTickets: number
  openTickets: number
  closedTickets: number
  pendingTickets: number
  avgResponseTime: number
  customerSatisfaction: number
  ticketsToday: number
  ticketsGrowth: number
}

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'general' | 'feature' | 'bug'
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    type: 'consumer' | 'partner' | 'fleet'
  }
  assignedTo?: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  updatedAt: string
  responseTime?: number
  tags: string[]
  platform: 'customer-app' | 'partner-app' | 'fleet-app' | 'website' | 'admin'
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [metrics, setMetrics] = useState<TicketMetrics>({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    pendingTickets: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0,
    ticketsToday: 0,
    ticketsGrowth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  useEffect(() => {
    loadSupportData()
  }, [])

  const loadSupportData = async () => {
    try {
      setIsLoading(true)
      
      const [ticketsResponse, metricsResponse] = await Promise.all([
        apiClient.get<SupportTicket[]>('/support/tickets'),
        apiClient.get<TicketMetrics>('/support/metrics')
      ])

      if (ticketsResponse.success && ticketsResponse.data) {
        setTickets(ticketsResponse.data)
      }

      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load support data:', error)
      toast.error('Failed to load support data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-red-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'customer-app': return 'ðŸ“±'
      case 'partner-app': return 'ðŸ¤'
      case 'fleet-app': return 'ðŸš›'
      case 'website': return 'ðŸŒ'
      case 'admin': return 'âš™ï¸'
      default: return 'â“'
    }
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesPlatform = platformFilter === 'all' || ticket.platform === platformFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Support</h1>
          <p className="text-muted-foreground">
            Manage customer tickets and support operations across all platforms
          </p>
        </div>
        <div className="flex gap-3">
          <SnowButton variant="outline" onClick={loadSupportData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton variant="default">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </SnowButton>
        </div>
      </div>

      {/* Support Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Open Tickets</p>
                <p className="text-2xl font-bold text-white">{metrics.openTickets}</p>
                <p className="text-blue-100 text-xs">
                  {metrics.ticketsToday} created today
                </p>
              </div>
              <Ticket className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold text-white">{formatResponseTime(metrics.avgResponseTime)}</p>
                <p className="text-green-100 text-xs">
                  Target: 2h
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-white">{metrics.customerSatisfaction}%</p>
                <p className="text-purple-100 text-xs">
                  Based on resolved tickets
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Tickets</p>
                <p className="text-2xl font-bold text-white">{metrics.totalTickets}</p>
                <p className="text-orange-100 text-xs flex items-center">
                  {metrics.ticketsGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.ticketsGrowth)}% this month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters and Search */}
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <SnowSearchInput
                placeholder="Search tickets, customers, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All Platforms</option>
              <option value="customer-app">Customer App</option>
              <option value="partner-app">Partner App</option>
              <option value="fleet-app">Fleet App</option>
              <option value="website">Website</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Tickets Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<MessageSquare className="h-5 w-5 text-blue-400" />}>
            Support Tickets ({filteredTickets.length})
          </SnowCardTitle>
          <SnowCardDescription>
            All customer support tickets across platforms
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <SnowTable>
            <SnowTableHeader>
              <SnowTableRow>
                <SnowTableHead>Ticket</SnowTableHead>
                <SnowTableHead>Customer</SnowTableHead>
                <SnowTableHead>Platform</SnowTableHead>
                <SnowTableHead>Priority</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Assigned To</SnowTableHead>
                <SnowTableHead>Created</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableRow>
            </SnowTableHeader>
            <SnowTableBody>
              {filteredTickets.map((ticket) => (
                <SnowTableRow key={ticket.id}>
                  <SnowTableCell>
                    <div>
                      <p className="font-medium text-white">{ticket.title}</p>
                      <p className="text-sm text-slate-600">#{ticket.id}</p>
                      {ticket.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {ticket.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {ticket.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{ticket.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div>
                      <p className="font-medium text-white">{ticket.customer.name}</p>
                      <p className="text-sm text-slate-600">{ticket.customer.email}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {ticket.customer.type}
                      </Badge>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPlatformIcon(ticket.platform)}</span>
                      <span className="text-sm capitalize">{ticket.platform.replace('-', ' ')}</span>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                      <span className="capitalize">{ticket.priority}</span>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                      {ticket.status}
                    </Badge>
                  </SnowTableCell>
                  <SnowTableCell>
                    {ticket.assignedTo ? (
                      <div>
                        <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                        <p className="text-xs text-slate-600">{ticket.assignedTo.role}</p>
                      </div>
                    ) : (
                      <span className="text-slate-600">Unassigned</span>
                    )}
                  </SnowTableCell>
                  <SnowTableCell>
                    <div>
                      <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-600">{new Date(ticket.createdAt).toLocaleTimeString()}</p>
                      {ticket.responseTime && (
                        <p className="text-xs text-green-600">
                          Responded in {formatResponseTime(ticket.responseTime)}
                        </p>
                      )}
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex space-x-2">
                      <SnowButton variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </SnowTableCell>
                </SnowTableRow>
              ))}
            </SnowTableBody>
          </SnowTable>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


