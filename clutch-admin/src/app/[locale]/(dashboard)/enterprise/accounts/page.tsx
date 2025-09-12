'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Users,
  Shield,
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
  Server
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function EnterpriseAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAccountsData()
  }, [])

  const loadAccountsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/enterprise/accounts')
      if (response.success && response.data) {
        setAccounts(response.data as any[])
      } else {
        setAccounts([])
        if (!response.success) {
          toast.error('Failed to load enterprise accounts')
          setError('Failed to load enterprise accounts')
        }
      }
    } catch (error: any) {
      console.error('Failed to load enterprise accounts data:', error)
      setAccounts([])
      setError('Failed to load enterprise accounts data')
      toast.error('Failed to load enterprise accounts data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'trial': return 'text-blue-600'
      case 'suspended': return 'text-red-600'
      case 'inactive': return 'text-slate-600'
      default: return 'text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'trial': return <Clock className="h-4 w-4" />
      case 'suspended': return <XCircle className="h-4 w-4" />
      case 'inactive': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'premium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'professional': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'basic': return 'bg-slate-100 text-slate-800 bg-white/20 text-slate-600'
      default: return 'bg-slate-100 text-slate-800 bg-white/20 text-slate-600'
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise': return <Building2 className="h-4 w-4" />
      case 'startup': return <Activity className="h-4 w-4" />
      case 'agency': return <Users className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const statusMatch = filter === 'all' || account.status === filter
    const planMatch = filter === 'all' || account.plan === filter
    return statusMatch && planMatch
  })

  const handleAccountAction = async (accountId: string, action: string) => {
    try {
      const response = await apiClient.put(`/enterprise/accounts/${accountId}`, { action })
      if (response.success) {
        toast.success(`Account ${action} successfully`)
        loadAccountsData()
      } else {
        toast.error(`Failed to ${action} account`)
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} account`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading enterprise accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Enterprise Accounts
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage enterprise customers and their subscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </SnowButton>
          <SnowButton variant="outline" onClick={loadAccountsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Accounts</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Accounts</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold">{accounts.reduce((sum, a) => sum + a.users, 0)}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(accounts.reduce((sum, a) => sum + a.monthlyRevenue, 0))}</p>
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
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
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
        {filteredAccounts.map((account) => (
          <SnowCard key={account.id} className="hover:shadow-md transition-shadow">
            <SnowCardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getAccountTypeIcon(account.accountType)}
                  <div>
                    <SnowCardTitle className="text-lg">{account.companyName}</SnowCardTitle>
                    <SnowCardDescription>{account.contactPerson}</SnowCardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getStatusColor(account.status)}`}>
                    {getStatusIcon(account.status)}
                    <span className="text-xs capitalize">{account.status}</span>
                  </div>
                </div>
              </div>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getPlanColor(account.plan)}>
                  {account.plan}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(account.monthlyRevenue)}</div>
                  <div className="text-xs text-slate-500">Monthly</div>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Users:</span>
                  <span className="font-medium">{account.users}/{account.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">API Usage:</span>
                  <span className="font-medium">{account.apiUsage.requests.toLocaleString()}/{account.apiUsage.limit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage:</span>
                  <span className="font-medium">{account.storage.used}GB/{account.storage.limit}GB</span>
                </div>
              </div>
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium truncate">{account.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium">{account.city}, {account.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Billing:</span>
                  <span className="font-medium">{new Date(account.nextBilling).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Features</div>
                <div className="flex flex-wrap gap-1">
                  {account.features.slice(0, 3).map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                  {account.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{account.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <SnowButton size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </SnowButton>
                <SnowButton size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </SnowButton>
                <SnowButton size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </SnowButton>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Account Summary
          </SnowCardTitle>
          <SnowCardDescription>Overview of enterprise account distribution and performance</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Plan Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enterprise:</span>
                  <span className="font-medium">{accounts.filter(a => a.plan === 'enterprise').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Premium:</span>
                  <span className="font-medium">{accounts.filter(a => a.plan === 'premium').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Professional:</span>
                  <span className="font-medium">{accounts.filter(a => a.plan === 'professional').length}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{accounts.filter(a => a.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trial:</span>
                  <span className="font-medium text-blue-600">{accounts.filter(a => a.status === 'trial').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Suspended:</span>
                  <span className="font-medium text-red-600">{accounts.filter(a => a.status === 'suspended').length}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Revenue Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Monthly:</span>
                  <span className="font-medium">{formatCurrency(accounts.reduce((sum, a) => sum + a.monthlyRevenue, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average/Account:</span>
                  <span className="font-medium">{formatCurrency(accounts.reduce((sum, a) => sum + a.monthlyRevenue, 0) / accounts.length)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Revenue:</span>
                  <span className="font-medium">{formatCurrency(accounts.filter(a => a.status === 'active').reduce((sum, a) => sum + a.monthlyRevenue, 0))}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Usage Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Users:</span>
                  <span className="font-medium">{accounts.reduce((sum, a) => sum + a.users, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Users/Account:</span>
                  <span className="font-medium">{Math.round(accounts.reduce((sum, a) => sum + a.users, 0) / accounts.length)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total API Calls:</span>
                  <span className="font-medium">{accounts.reduce((sum, a) => sum + a.apiUsage.requests, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



