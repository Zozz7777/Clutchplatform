'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Webhook, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Key,
  Globe,
  Database,
  Server,
  Zap,
  Network,
  Shield,
  Code,
  TestTube
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function EnterpriseWebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWebhooksData()
  }, [])

  const loadWebhooksData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/enterprise/webhooks')
      if (response.success && response.data) {
        setWebhooks(response.data as any[])
      } else {
        setWebhooks([])
        if (!response.success) {
          toast.error('Failed to load webhooks')
          setError('Failed to load webhooks')
        }
      }
    } catch (error: any) {
      console.error('Failed to load webhooks data:', error)
      setWebhooks([])
      setError('Failed to load webhooks data')
      toast.error('Failed to load webhooks data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'inactive': return 'text-slate-600'
      case 'error': return 'text-red-600'
      case 'testing': return 'text-blue-600'
      default: return 'text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <Clock className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      case 'testing': return <TestTube className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResponseTimeColor = (time: number) => {
    if (time <= 200) return 'text-green-600'
    if (time <= 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredWebhooks = webhooks.filter(webhook => {
    const statusMatch = filter === 'all' || webhook.status === filter
    const eventMatch = searchTerm === '' || webhook.events.some((event: string) => 
      event.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return statusMatch && eventMatch
  })

  const handleWebhookAction = async (webhookId: string, action: string) => {
    try {
      const response = await apiClient.put(`/enterprise/webhooks/${webhookId}`, { action })
      if (response.success) {
        toast.success(`Webhook ${action} successfully`)
        loadWebhooksData()
      } else {
        toast.error(`Failed to ${action} webhook`)
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} webhook`)
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await apiClient.post(`/enterprise/webhooks/${webhookId}/test`, {})
      if (response.success) {
        toast.success('Test webhook sent successfully')
      } else {
        toast.error('Failed to send test webhook')
      }
    } catch (error: any) {
      toast.error('Failed to send test webhook')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Enterprise Webhooks
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage webhook endpoints and event delivery
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </SnowButton>
          <SnowButton variant="outline" onClick={loadWebhooksData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Webhook className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Webhooks</p>
                <p className="text-2xl font-bold">{webhooks.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Webhooks</p>
                <p className="text-2xl font-bold">{webhooks.filter(w => w.status === 'active').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0).toLocaleString()}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Success Rate</p>
                <p className="text-2xl font-bold">{Math.round(webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length)}%</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={searchTerm} onValueChange={setSearchTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Search webhooks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="order">Order Events</SelectItem>
                  <SelectItem value="payment">Payment Events</SelectItem>
                  <SelectItem value="user">User Events</SelectItem>
                  <SelectItem value="inventory">Inventory Events</SelectItem>
                  <SelectItem value="analytics">Analytics Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SnowButton variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWebhooks.map((webhook) => (
          <SnowCard key={webhook.id} className="hover:shadow-md transition-shadow">
            <SnowCardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-blue-600" />
                  <div>
                    <SnowCardTitle className="text-lg">{webhook.name}</SnowCardTitle>
                    <SnowCardDescription>{webhook.accountName}</SnowCardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getStatusColor(webhook.status)}`}>
                    {getStatusIcon(webhook.status)}
                    <span className="text-xs capitalize">{webhook.status}</span>
                  </div>
                </div>
              </div>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Endpoint URL</div>
                <div className="text-sm text-slate-600 text-slate-600 break-all">
                  {webhook.url}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Events</div>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Success Rate:</span>
                  <span className={`font-medium ${getSuccessRateColor(webhook.successRate)}`}>
                    {webhook.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Deliveries:</span>
                  <span className="font-medium">{webhook.totalDeliveries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Failed Deliveries:</span>
                  <span className="font-medium text-red-600">{webhook.failedDeliveries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Response Time:</span>
                  <span className={`font-medium ${getResponseTimeColor(webhook.averageResponseTime)}`}>
                    {webhook.averageResponseTime}ms
                  </span>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Timeout:</span>
                  <span className="font-medium">{webhook.timeout}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Retry Attempts:</span>
                  <span className="font-medium">{webhook.retryAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Triggered:</span>
                  <span className="font-medium">{new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <SnowButton size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </SnowButton>
                <SnowButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleTestWebhook(webhook.id)}
                >
                  <TestTube className="h-4 w-4" />
                </SnowButton>
                <SnowButton size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </SnowButton>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Webhook Analytics
          </SnowCardTitle>
          <SnowCardDescription>Performance metrics and delivery statistics</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{webhooks.filter(w => w.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Inactive:</span>
                  <span className="font-medium text-slate-600">{webhooks.filter(w => w.status === 'inactive').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Error:</span>
                  <span className="font-medium text-red-600">{webhooks.filter(w => w.status === 'error').length}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Event Types</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Order Events:</span>
                  <span className="font-medium">{webhooks.filter(w => w.events.some((e: string) => e.startsWith('order'))).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Events:</span>
                  <span className="font-medium">{webhooks.filter(w => w.events.some((e: string) => e.startsWith('payment'))).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>User Events:</span>
                  <span className="font-medium">{webhooks.filter(w => w.events.some((e: string) => e.startsWith('user'))).length}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Performance Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Deliveries:</span>
                  <span className="font-medium">{webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed Deliveries:</span>
                  <span className="font-medium text-red-600">{webhooks.reduce((sum, w) => sum + w.failedDeliveries, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Success Rate:</span>
                  <span className="font-medium">{Math.round(webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length)}%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Response Times</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fastest:</span>
                  <span className="font-medium text-green-600">{Math.min(...webhooks.map(w => w.averageResponseTime))}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Slowest:</span>
                  <span className="font-medium text-red-600">{Math.max(...webhooks.map(w => w.averageResponseTime))}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average:</span>
                  <span className="font-medium">{Math.round(webhooks.reduce((sum, w) => sum + w.averageResponseTime, 0) / webhooks.length)}ms</span>
                </div>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



