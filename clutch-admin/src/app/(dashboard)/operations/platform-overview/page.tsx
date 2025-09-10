'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Smartphone, 
  Globe, 
  PoundSterling, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  Zap, 
  Database, 
  Server, 
  Network, 
  Shield, 
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  Car,
  Wrench
} from 'lucide-react'
import { usePlatformOverview } from '@/hooks/usePlatformOverview'
import { toast } from 'sonner'

interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  totalPartners: number
  activePartners: number
  totalFleetClients: number
  activeFleetClients: number
  totalRevenue: number
  monthlyRevenue: number
  bookingsToday: number
  bookingsTotal: number
  systemHealth: number
  apiHealth: number
  userGrowth: number
  revenueGrowth: number
  partnerGrowth: number
}

interface AppMetrics {
  customerApp: {
    downloads: number
    activeUsers: number
    rating: number
    crashes: number
    version: string
  }
  partnerApp: {
    downloads: number
    activeUsers: number
    rating: number
    crashes: number
    version: string
  }
  fleetApp: {
    downloads: number
    activeUsers: number
    rating: number
    crashes: number
    version: string
  }
}

interface SystemStatus {
  name: string
  status: 'online' | 'warning' | 'offline'
  uptime: number
  responseTime: number
  lastChecked: string
}

export default function PlatformOverviewPage() {
  // Use consolidated platform overview hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    platformMetrics: metrics,
    appMetrics,
    systemStatus
  } = usePlatformOverview()

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load platform overview data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights across the entire Clutch ecosystem
          </p>
        </div>
        <div className="flex gap-3">
          <p className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          </p>
          <SnowButton variant="outline" onClick={refreshData} disabled={isLoading}>
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
                <p className="text-sm font-medium text-blue-300">Total Users</p>
                <p className="text-2xl font-bold text-white">{metrics?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-blue-100 text-xs">
                  <span className="font-medium text-green-400">+{metrics?.userGrowth || 0}%</span> from last month
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
                <p className="text-sm font-medium text-green-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                <p className="text-green-100 text-xs">
                  <span className="font-medium text-green-400">+{metrics?.revenueGrowth || 0}%</span> from last month
                </p>
              </div>
              <PoundSterling className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Total Orders</p>
                <p className="text-2xl font-bold text-white">{metrics?.totalOrders?.toLocaleString() || '0'}</p>
                <p className="text-purple-100 text-xs">
                  <span className="font-medium text-green-400">+{metrics?.orderGrowth || 0}%</span> from last month
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Completed Orders</p>
                <p className="text-2xl font-bold text-white">{metrics?.completedOrders?.toLocaleString() || '0'}</p>
                <p className="text-orange-100 text-xs">
                  <span className="font-medium text-green-400">+{metrics?.orderGrowth || 0}%</span> from last month
                </p>
              </div>
              <Car className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Smartphone className="h-5 w-5 text-blue-400" />}>
            Mobile Apps Performance
          </SnowCardTitle>
          <SnowCardDescription>Real-time metrics from our mobile applications</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Mobile App</h4>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Downloads:</span>
                  <span className="font-medium">{formatNumber(appMetrics?.mobileApp?.downloads || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-medium">{formatNumber(appMetrics?.mobileApp?.activeUsers || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-medium">{appMetrics?.mobileApp?.rating || 0}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crashes (24h):</span>
                  <span className="font-medium text-red-500">{appMetrics?.mobileApp?.crashes || 0}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Web App</h4>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions:</span>
                  <span className="font-medium">{formatNumber(appMetrics?.webApp?.sessions || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page Views:</span>
                  <span className="font-medium">{formatNumber(appMetrics?.webApp?.pageViews || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bounce Rate:</span>
                  <span className="font-medium">{appMetrics?.webApp?.bounceRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Session:</span>
                  <span className="font-medium">{Math.round(appMetrics?.webApp?.avgSessionDuration || 0)}m</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">API</h4>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests:</span>
                  <span className="font-medium">{formatNumber(appMetrics?.api?.requests || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time:</span>
                  <span className="font-medium">{appMetrics?.api?.responseTime || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Rate:</span>
                  <span className="font-medium">{appMetrics?.api?.errorRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{appMetrics?.api?.uptime || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<Server className="h-5 w-5 text-green-400" />}>
              System Health Monitor
            </SnowCardTitle>
            <SnowCardDescription>Real-time status of all platform services</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 bg-slate-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                    <div>
                      <p className="font-medium">{system.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {system.value}{system.unit} â€¢ {system.status}
                      </p>
                    </div>
                  </div>
                  <Badge variant={system.status === 'online' ? 'default' : system.status === 'warning' ? 'destructive' : 'secondary'}>
                    {system.status}
                  </Badge>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<Activity className="h-5 w-5 text-purple-400" />}>
              Platform Activity
            </SnowCardTitle>
            <SnowCardDescription>Recent platform-wide activities and alerts</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System deployment successful</p>
                  <p className="text-xs text-muted-foreground">Customer App v2.1.4 deployed â€¢ 5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">High API response time detected</p>
                  <p className="text-xs text-muted-foreground">Fleet Management API â€¢ 12 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">User milestone reached</p>
                  <p className="text-xs text-muted-foreground">50,000 registered users â€¢ 1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New enterprise client onboarded</p>
                  <p className="text-xs text-muted-foreground">FleetCorp Industries â€¢ 2 hours ago</p>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle icon={<Zap className="h-5 w-5 text-orange-400" />}>
            Platform Operations
          </SnowCardTitle>
          <SnowCardDescription>Quick access to critical platform operations</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Users className="h-6 w-6 mb-2 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">User Management</p>
                <p className="text-xs text-muted-foreground">Manage all platform users</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Smartphone className="h-6 w-6 mb-2 text-green-500" />
              <div className="text-left">
                <p className="font-medium">App Releases</p>
                <p className="text-xs text-muted-foreground">Deploy mobile app updates</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Shield className="h-6 w-6 mb-2 text-red-500" />
              <div className="text-left">
                <p className="font-medium">Security Center</p>
                <p className="text-xs text-muted-foreground">Monitor security events</p>
              </div>
            </SnowButton>
            
            <SnowButton variant="outline" className="h-auto p-4 flex-col items-start">
              <Brain className="h-6 w-6 mb-2 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">AI Dashboard</p>
                <p className="text-xs text-muted-foreground">Manage ML models</p>
              </div>
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


