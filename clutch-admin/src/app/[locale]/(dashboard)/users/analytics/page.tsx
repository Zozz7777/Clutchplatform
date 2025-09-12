'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  UserPlus, 
  UserX, 
  Activity, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  Clock, 
  MapPin, 
  Smartphone, 
  Globe, 
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churned: number
  retention: number
  averageSessionTime: number
  lifetimeValue: number
  conversionRate: number
  userGrowth: number
  engagementRate: number
}

interface UserSegment {
  id: string
  name: string
  criteria: string
  userCount: number
  percentage: number
  averageLTV: number
  engagementScore: number
  churnRate: number
  color: string
}

interface UserJourney {
  stage: string
  users: number
  conversionRate: number
  averageTime: number
  dropoffRate: number
}

interface TopUser {
  id: string
  name: string
  email: string
  registrationDate: string
  lastActive: string
  totalSpent: number
  bookings: number
  rating: number
  platform: 'web' | 'ios' | 'android'
  userType: 'customer' | 'partner' | 'fleet'
  status: 'active' | 'inactive' | 'churned'
  lifetimeValue: number
  engagementScore: number
}

export default function UserAnalyticsPage() {
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    churned: 0,
    retention: 0,
    averageSessionTime: 0,
    lifetimeValue: 0,
    conversionRate: 0,
    userGrowth: 0,
    engagementRate: 0
  })

  const [userSegments, setUserSegments] = useState<UserSegment[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [searchTerm, setSearchTerm] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')

  useEffect(() => {
    loadUserAnalytics()
  }, [selectedPeriod])

  const loadUserAnalytics = async () => {
    try {
      setIsLoading(true)
      
      const [
        analyticsResponse,
        segmentsResponse,
        topUsersResponse
      ] = await Promise.all([
        apiClient.get<UserAnalytics>(`/users/analytics?period=${selectedPeriod}`),
        apiClient.get<UserSegment[]>(`/users/segments?period=${selectedPeriod}`),
        apiClient.get<TopUser[]>(`/users/top-users?period=${selectedPeriod}`)
      ])

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data)
      }

      if (segmentsResponse.success && segmentsResponse.data) {
        setUserSegments(segmentsResponse.data)
      }

      if (topUsersResponse.success && topUsersResponse.data) {
        setTopUsers(topUsersResponse.data)
      }
    } catch (error) {
      console.error('Failed to load user analytics:', error)
      toast.error('Failed to load user analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-yellow-500'
      case 'churned': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return 'ðŸ“±'
      case 'android': return 'ðŸ¤–'
      case 'web': return 'ðŸŒ'
      default: return 'ðŸ’»'
    }
  }

  // Sample data for charts
  const userGrowthData = [
    { name: 'Jan', newUsers: 2400, totalUsers: 115000, churn: 340 },
    { name: 'Feb', newUsers: 2800, totalUsers: 117600, churn: 280 },
    { name: 'Mar', newUsers: 3200, totalUsers: 120520, churn: 420 },
    { name: 'Apr', newUsers: 2900, totalUsers: 123000, churn: 380 },
    { name: 'May', newUsers: 3100, totalUsers: 125720, churn: 290 },
    { name: 'Jun', newUsers: 2800, totalUsers: 128230, churn: 450 }
  ]

  const engagementData = [
    { name: 'Week 1', sessions: 45000, avgTime: 8.2, bounceRate: 32 },
    { name: 'Week 2', sessions: 48500, avgTime: 8.8, bounceRate: 28 },
    { name: 'Week 3', sessions: 52000, avgTime: 9.1, bounceRate: 25 },
    { name: 'Week 4', sessions: 49800, avgTime: 8.5, bounceRate: 30 }
  ]

  const conversionFunnelData = [
    { name: 'Visitors', value: 125000, color: '#3B82F6' },
    { name: 'Sign-ups', value: 89500, color: '#10B981' },
    { name: 'First Booking', value: 45200, color: '#F59E0B' },
    { name: 'Repeat Users', value: 28900, color: '#EF4444' },
    { name: 'High-Value', value: 8950, color: '#8B5CF6' }
  ]

  const filteredUsers = topUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = segmentFilter === 'all' || user.userType === segmentFilter
    return matchesSearch && matchesSegment
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive user behavior analysis and lifecycle tracking
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <SnowButton variant="outline" onClick={loadUserAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton variant="default">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalUsers)}</p>
                <p className="text-blue-100 text-xs flex items-center">
                  <span className={getGrowthColor(analytics.userGrowth)}>
                    {getGrowthIcon(analytics.userGrowth)}
                    {Math.abs(analytics.userGrowth)}%
                  </span>
                  <span className="ml-1">growth</span>
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(analytics.activeUsers)}</p>
                <p className="text-green-100 text-xs">
                  {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg LTV</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.lifetimeValue)}</p>
                <p className="text-purple-100 text-xs">
                  {analytics.conversionRate}% conversion rate
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Retention Rate</p>
                <p className="text-2xl font-bold text-white">{analytics.retention}%</p>
                <p className="text-orange-100 text-xs">
                  {analytics.averageSessionTime}min avg session
                </p>
              </div>
              <Heart className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<BarChart3 className="h-5 w-5 text-blue-400" />}>
            User Segments
          </SnowCardTitle>
          <SnowCardDescription>Behavioral segmentation and performance metrics</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {userSegments.map((segment) => (
              <div key={segment.id} className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: segment.color }} />
                    <h4 className="font-semibold">{segment.name}</h4>
                  </div>
                  <Badge variant="outline">{segment.percentage}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{segment.criteria}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Users</p>
                    <p className="font-medium">{formatNumber(segment.userCount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg LTV</p>
                    <p className="font-medium">{formatCurrency(segment.averageLTV)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engagement</p>
                    <p className="font-medium">{segment.engagementScore}/100</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Churn Rate</p>
                    <p className="font-medium text-red-500">{segment.churnRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>User Growth Trends</SnowCardTitle>
            <SnowCardDescription>New user acquisition vs churn over time</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Chart component placeholder - integrate with your preferred charting library
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Conversion Funnel</SnowCardTitle>
            <SnowCardDescription>User journey from visitor to high-value customer</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Chart component placeholder - integrate with your preferred charting library
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Star className="h-5 w-5 text-yellow-400" />}>
            Top Users ({filteredUsers.length})
          </SnowCardTitle>
          <SnowCardDescription>High-value users and their engagement metrics</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 min-w-64">
              <SnowSearchInput
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white"
            >
              <option value="all">All User Types</option>
              <option value="customer">Customers</option>
              <option value="partner">Partners</option>
              <option value="fleet">Fleet Clients</option>
            </select>
          </div>

          <SnowTable>
            <SnowTableHeader>
              <SnowTableRow>
                <SnowTableHead>User</SnowTableHead>
                <SnowTableHead>Type</SnowTableHead>
                <SnowTableHead>Platform</SnowTableHead>
                <SnowTableHead>LTV</SnowTableHead>
                <SnowTableHead>Bookings</SnowTableHead>
                <SnowTableHead>Engagement</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableRow>
            </SnowTableHeader>
            <SnowTableBody>
              {filteredUsers.map((user) => (
                <SnowTableRow key={user.id}>
                  <SnowTableCell>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(user.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.userType}
                    </Badge>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPlatformIcon(user.platform)}</span>
                      <span className="capitalize">{user.platform}</span>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div>
                      <p className="font-medium">{formatCurrency(user.lifetimeValue)}</p>
                      <p className="text-sm text-slate-400">{formatCurrency(user.totalSpent)} spent</p>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div>
                      <p className="font-medium">{user.bookings}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{user.rating}</span>
                      </div>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${user.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-sm">{user.engagementScore}</span>
                    </div>
                  </SnowTableCell>
                  <SnowTableCell>
                    <Badge className={`${getStatusColor(user.status)} text-white`}>
                      {user.status}
                    </Badge>
                  </SnowTableCell>
                  <SnowTableCell>
                    <div className="flex space-x-2">
                      <SnowButton variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
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


