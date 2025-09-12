'use client'

import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  MailPlus,
  FolderPlus,
  Archive,
  Trash2 as TrashIcon,
  Inbox,
  Send,
  Star,
  Calendar,
  Bell,
  Lock,
  Unlock,
  Database,
  Server,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowInput } from '@/components/ui/snow-input'
import { useAuthStore } from '@/store'

// Types
interface EmailStats {
  totalEmails: number
  totalAccounts: number
  emailsToday: number
  storageUsed: number
  activeUsers: number
  spamBlocked: number
  emailsSent: number
  emailsReceived: number
  averageResponseTime: number
  uptime: number
}

interface EmailAccount {
  id: string
  userId: string
  emailAddress: string
  displayName: string
  status: 'active' | 'inactive' | 'suspended'
  storageUsed: number
  storageLimit: number
  lastLogin: string
  createdAt: string
  isAdmin: boolean
  emailCount: number
}

interface SystemHealth {
  smtp: 'operational' | 'degraded' | 'down'
  imap: 'operational' | 'degraded' | 'down'
  database: 'operational' | 'degraded' | 'down'
  storage: 'operational' | 'degraded' | 'down'
  overall: 'operational' | 'degraded' | 'down'
}

// API Base URL
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1/clutch-email'

// Mock Data
const mockStats: EmailStats = {
  totalEmails: 1250,
  totalAccounts: 45,
  emailsToday: 23,
  storageUsed: 1073741824, // 1GB in bytes
  activeUsers: 38,
  spamBlocked: 156,
  emailsSent: 89,
  emailsReceived: 134,
  averageResponseTime: 2.3,
  uptime: 99.9
}

const mockAccounts: EmailAccount[] = [
  {
    id: '1',
    userId: 'user1',
    emailAddress: 'admin@clutch.com',
    displayName: 'Admin User',
    status: 'active',
    storageUsed: 268435456, // 256MB
    storageLimit: 1073741824, // 1GB
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    isAdmin: true,
    emailCount: 125
  },
  {
    id: '2',
    userId: 'user2',
    emailAddress: 'john.doe@clutch.com',
    displayName: 'John Doe',
    status: 'active',
    storageUsed: 134217728, // 128MB
    storageLimit: 1073741824, // 1GB
    lastLogin: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    isAdmin: false,
    emailCount: 89
  },
  {
    id: '3',
    userId: 'user3',
    emailAddress: 'jane.smith@clutch.com',
    displayName: 'Jane Smith',
    status: 'active',
    storageUsed: 209715200, // 200MB
    storageLimit: 1073741824, // 1GB
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    isAdmin: false,
    emailCount: 67
  }
]

const mockSystemHealth: SystemHealth = {
  smtp: 'operational',
  imap: 'operational',
  database: 'operational',
  storage: 'operational',
  overall: 'operational'
}

// Email Management Service
class EmailManagementService {
  private getAuthHeaders: () => HeadersInit

  constructor() {
    this.getAuthHeaders = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  }

  // Get email statistics
  async getStats(): Promise<EmailStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Get email accounts
  async getAccounts(): Promise<EmailAccount[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Create email account
  async createAccount(accountData: {
    userId: string
    emailAddress: string
    displayName: string
    password: string
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(accountData)
    })
    return response.json()
  }

  // Update email account
  async updateAccount(accountId: string, updates: Partial<EmailAccount>): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  // Delete email account
  async deleteAccount(accountId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Get system health
  async getHealth(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }
}

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'red' 
}: {
  title: string
  value: string | number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400'
    if (trend === 'down') return 'text-red-600 dark:text-red-400'
    return 'text-slate-600 text-slate-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  return (
    <SnowCard>
      <SnowCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 text-slate-600">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1">{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// System Health Component
const SystemHealthCard = ({ health }: { health: SystemHealth }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-emerald-600 dark:text-emerald-400'
      case 'degraded': return 'text-amber-600 dark:text-amber-400'
      case 'down': return 'text-red-600 dark:text-red-400'
      default: return 'text-slate-600 text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      case 'down': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          System Health
        </SnowCardTitle>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <span className="text-sm">SMTP Server</span>
            </div>
            <div className={`flex items-center ${getStatusColor(health.smtp)}`}>
              {getStatusIcon(health.smtp)}
              <span className="ml-1 text-sm capitalize">{health.smtp}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              <span className="text-sm">IMAP Server</span>
            </div>
            <div className={`flex items-center ${getStatusColor(health.imap)}`}>
              {getStatusIcon(health.imap)}
              <span className="ml-1 text-sm capitalize">{health.imap}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              <span className="text-sm">Database</span>
            </div>
            <div className={`flex items-center ${getStatusColor(health.database)}`}>
              {getStatusIcon(health.database)}
              <span className="ml-1 text-sm capitalize">{health.database}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Archive className="h-4 w-4 mr-2" />
              <span className="text-sm">Storage</span>
            </div>
            <div className={`flex items-center ${getStatusColor(health.storage)}`}>
              {getStatusIcon(health.storage)}
              <span className="ml-1 text-sm capitalize">{health.storage}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Status</span>
              <div className={`flex items-center ${getStatusColor(health.overall)}`}>
                {getStatusIcon(health.overall)}
                <span className="ml-1 font-medium capitalize">{health.overall}</span>
              </div>
            </div>
          </div>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Account Management Component
const AccountManagement = ({ accounts }: { accounts: EmailAccount[] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.emailAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || account.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'inactive': return 'bg-slate-100 text-slate-700 bg-slate-100 text-slate-700'
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-slate-100 text-slate-700 bg-slate-100 text-slate-700'
    }
  }

  return (
    <SnowCard>
      <SnowCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <SnowCardTitle>Email Accounts</SnowCardTitle>
            <SnowCardDescription>
              Manage email accounts and user access
            </SnowCardDescription>
          </div>
          <SnowButton>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Account
          </SnowButton>
        </div>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <SnowInput
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white bg-slate-100 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Account</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Storage</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Emails</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="border-b border-slate-100 border-slate-200 hover:bg-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {account.displayName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {account.emailAddress}
                      </p>
                      {account.isAdmin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {formatStorage(account.storageUsed)} / {formatStorage(account.storageLimit)}
                      </p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(account.storageUsed / account.storageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-900 dark:text-slate-100">
                      {account.emailCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-500 dark:text-slate-500">
                      {new Date(account.lastLogin).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <SnowButton variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Quick Actions Component
const QuickActions = () => {
  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle>Quick Actions</SnowCardTitle>
        <SnowCardDescription>
          Common administrative tasks
        </SnowCardDescription>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SnowButton variant="outline" className="flex-col h-auto py-4">
            <UserPlus className="h-6 w-6 mb-2" />
            <span className="text-sm">Add User</span>
          </SnowButton>
          <SnowButton variant="outline" className="flex-col h-auto py-4">
            <MailPlus className="h-6 w-6 mb-2" />
            <span className="text-sm">Bulk Email</span>
          </SnowButton>
          <SnowButton variant="outline" className="flex-col h-auto py-4">
            <FolderPlus className="h-6 w-6 mb-2" />
            <span className="text-sm">Create Folder</span>
          </SnowButton>
          <SnowButton variant="outline" className="flex-col h-auto py-4">
            <Download className="h-6 w-6 mb-2" />
            <span className="text-sm">Export Data</span>
          </SnowButton>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    {
      id: '1',
      type: 'account_created',
      message: 'New email account created for john.doe@clutch.com',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'Admin User'
    },
    {
      id: '2',
      type: 'email_sent',
      message: 'Bulk email campaign sent to 150 recipients',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'Marketing Team'
    },
    {
      id: '3',
      type: 'storage_warning',
      message: 'Storage usage warning for jane.smith@clutch.com (85% full)',
      timestamp: '2024-01-15T08:45:00Z',
      user: 'System'
    },
    {
      id: '4',
      type: 'login_failed',
      message: 'Failed login attempt for unknown user',
      timestamp: '2024-01-15T08:30:00Z',
      user: 'Security System'
    },
    {
      id: '5',
      type: 'backup_completed',
      message: 'Daily email backup completed successfully',
      timestamp: '2024-01-15T02:00:00Z',
      user: 'System'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'account_created': return <UserPlus className="h-4 w-4" />
      case 'email_sent': return <Send className="h-4 w-4" />
      case 'storage_warning': return <AlertTriangle className="h-4 w-4" />
      case 'login_failed': return <Shield className="h-4 w-4" />
      case 'backup_completed': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'account_created': return 'text-emerald-600 dark:text-emerald-400'
      case 'email_sent': return 'text-blue-600 dark:text-blue-400'
      case 'storage_warning': return 'text-amber-600 dark:text-amber-400'
      case 'login_failed': return 'text-red-600 dark:text-red-400'
      case 'backup_completed': return 'text-emerald-600 dark:text-emerald-400'
      default: return 'text-slate-600 text-slate-600'
    }
  }

  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle>Recent Activity</SnowCardTitle>
        <SnowCardDescription>
          Latest system activities and events
        </SnowCardDescription>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {activity.message}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {activity.user}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Storage Analytics Component
const StorageAnalytics = ({ stats, formattedStorage }: { stats: EmailStats; formattedStorage: string }) => {
  const storageData = [
    { label: 'Emails', value: 45, color: 'bg-red-500' },
    { label: 'Attachments', value: 30, color: 'bg-blue-500' },
    { label: 'System', value: 15, color: 'bg-amber-500' },
    { label: 'Backups', value: 10, color: 'bg-emerald-500' }
  ]

  return (
    <SnowCard>
      <SnowCardHeader>
        <SnowCardTitle>Storage Analytics</SnowCardTitle>
        <SnowCardDescription>
          Storage usage breakdown and trends
        </SnowCardDescription>
      </SnowCardHeader>
      <SnowCardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Total Storage Used
            </span>
            <span className="text-lg font-semibold text-slate-900">
              {formattedStorage}
            </span>
          </div>
          
          <div className="space-y-3">
            {storageData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-slate-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Storage Growth (30 days)
              </span>
              <span className="text-emerald-600 font-medium">
                +12.5%
              </span>
            </div>
          </div>
        </div>
      </SnowCardContent>
    </SnowCard>
  )
}

// Main Email Management Page
export default function EmailManagementPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<EmailStats>(mockStats)
  const [accounts, setAccounts] = useState<EmailAccount[]>(mockAccounts)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(mockSystemHealth)
  const [isLoading, setIsLoading] = useState(false)
  const [emailService] = useState(() => new EmailManagementService())

  // Helper functions
  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const formatStorageForAnalytics = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // In production, these would call the actual APIs
      // const [statsData, accountsData, healthData] = await Promise.all([
      //   emailService.getStats(),
      //   emailService.getAccounts(),
      //   emailService.getHealth()
      // ])
      // setStats(statsData)
      // setAccounts(accountsData)
      // setSystemHealth(healthData)
      
      // For now, use mock data
      console.log('Loading email management data...')
    } catch (error) {
      console.error('Failed to load email management data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Email Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage email accounts, monitor system health, and view statistics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <SnowButton variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </SnowButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Emails"
          value={stats.totalEmails.toLocaleString()}
          icon={Mail}
          trend="up"
          trendValue="+12% this week"
          color="red"
        />
        <StatsCard
          title="Active Accounts"
          value={stats.activeUsers}
          icon={Users}
          trend="up"
          trendValue="+3 this month"
          color="blue"
        />
        <StatsCard
          title="Storage Used"
          value={formatStorage(stats.storageUsed)}
          icon={HardDrive}
          trend="neutral"
          trendValue="85% capacity"
          color="amber"
        />
        <StatsCard
          title="System Uptime"
          value={`${stats.uptime}%`}
          icon={CheckCircle}
          trend="up"
          trendValue="+0.1% this month"
          color="emerald"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <SystemHealthCard health={systemHealth} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Email Activity</SnowCardTitle>
              <SnowCardDescription>
                Recent email activity and performance metrics
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.emailsToday}
                  </p>
                  <p className="text-sm text-slate-600 text-slate-600">
                    Emails Today
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.emailsSent}
                  </p>
                  <p className="text-sm text-slate-600 text-slate-600">
                    Sent Today
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.emailsReceived}
                  </p>
                  <p className="text-sm text-slate-600 text-slate-600">
                    Received Today
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.spamBlocked}
                  </p>
                  <p className="text-sm text-slate-600 text-slate-600">
                    Spam Blocked
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200 border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 text-slate-600">
                      Average Response Time
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {stats.averageResponseTime}s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 text-slate-600">
                      Total Accounts
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {stats.totalAccounts}
                    </p>
                  </div>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </div>
        
        <StorageAnalytics stats={stats} formattedStorage={formatStorageForAnalytics(stats.storageUsed)} />
      </div>
      <RecentActivity />
      <AccountManagement accounts={accounts} />
    </div>
  )
}

