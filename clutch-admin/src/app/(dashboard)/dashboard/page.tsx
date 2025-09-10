'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2,
  Car,
  PoundSterling, 
  Activity,
  MapPin,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Globe,
  Shield,
  Database,
  Zap,
  Target,
  Rocket,
  Cpu,
  Wifi,
  Server,
  HardDrive,
  Network,
  Gauge,
  Eye,
  Brain,
  Sparkles
} from 'lucide-react'
// Legacy components removed - using SnowUI components only
import { Badge } from '@/components/ui/badge'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { useAuthStore } from '@/store'
import { clutchApi } from '@/lib/api-service'
import { useConsolidatedDashboard } from '@/hooks/useConsolidatedDashboard'
import { useResponsive } from '@/hooks/useResponsive'

// Define types for platform services
interface PlatformService {
  id: string
  name: string
  status: 'online' | 'offline' | 'maintenance' | 'warning'
  icon?: string | React.ComponentType
  description?: string
  uptime?: string
  responseTime?: string
  performance?: number
}

// Define types for activity logs
interface ActivityLog {
  id: string
  type: string
  message: string
  timestamp: string
  user?: string
  details?: any
  status?: 'success' | 'warning' | 'error' | 'info'
  action?: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const responsive = useResponsive()

  // Use consolidated dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    metrics,
    recentOrders,
    activityLogs,
    platformServices,
    systemStatus,
    realTimeData
  } = useConsolidatedDashboard()

  // Map consolidated data to expected format
  const recentActivity = activityLogs || []
  const platformStatus: PlatformService[] = (platformServices || []).map(service => ({
    id: service.name,
    name: service.name,
    status: service.status as 'online' | 'offline' | 'maintenance' | 'warning',
    uptime: service.uptime,
    description: `Service status: ${service.status}`
  }))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-red-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary/60 animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Initializing Clutch Platform...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 bg-red-500/20 rounded-full animate-ping"></div>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SnowCard variant="primary" size="lg" className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent"></div>
        <SnowCardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                  <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">SYSTEM ONLINE</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">AI ENABLED</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Clutch Admin Dashboard
                </h1>
                <p className="text-slate-700 max-w-2xl">
                  Welcome back, <span className="font-semibold text-primary">{user?.fullName || 'Administrator'}</span>. 
                  Monitor your platform operations and manage your business efficiently.
                </p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div className="flex items-center justify-end space-x-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-slate-600 text-slate-600">REAL-TIME</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="elevated" className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-slate-600">Total Users</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {metrics?.users?.total?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+12%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">vs last month</span>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard variant="elevated" className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-slate-600">Active Drivers</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {realTimeData?.activeDrivers?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+8%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">vs last month</span>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard variant="elevated" className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-slate-600">Total Partners</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {metrics?.partners?.total?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+15%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">vs last month</span>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard variant="elevated" className="group relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <PoundSterling className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 text-slate-600">Monthly Revenue</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(metrics?.revenue?.monthly || 0)}
                </div>
                <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm font-medium">-2%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">vs last month</span>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <SnowCard className="lg:col-span-1" variant="elevated">
          <SnowCardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <SnowCardTitle>Platform Services</SnowCardTitle>
            </div>
            <SnowCardDescription>Real-time system status monitoring</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {platformStatus.map((service: PlatformService, index: number) => {
                const getIconComponent = (iconName: string) => {
                  switch (iconName) {
                    case 'database': return Database
                    case 'network': return Network
                    case 'shield': return Shield
                    case 'brain': return Brain
                    default: return Server
                  }
                }
                const IconComponent = typeof service.icon === 'string' ? getIconComponent(service.icon) : (service.icon || Server)
                
                return (
                  <div key={service.id || index} className="group relative">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 bg-slate-100/50 border border-slate-200 border-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-600 transition-colors shadow-sm">
                          <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{service.name}</p>
                          <p className="text-xs text-slate-500 text-slate-600">{service.performance}% performance</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          {service.status}
                        </Badge>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${service.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard className="lg:col-span-2" variant="elevated">
          <SnowCardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <SnowCardTitle>Live Activity Feed</SnowCardTitle>
            </div>
            <SnowCardDescription>Real-time platform events and system updates</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index: number) => (
                  <div key={activity.id || index} className="group relative">
                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 bg-slate-100/50 border border-slate-200 border-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-600 transition-colors shadow-sm">
                          {getStatusIcon(activity.status || 'info')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                        <p className="text-xs text-slate-500 text-slate-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-slate-600" />
                  </div>
                  <p className="text-slate-600 text-slate-600 font-medium">No recent activity</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Activity will appear here when available</p>
                </div>
              )}
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard className="lg:col-span-1" variant="elevated">
          <SnowCardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <SnowCardTitle>Quick Actions</SnowCardTitle>
            </div>
            <SnowCardDescription>Rapid access to key functions</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-3">
              <SnowButton className="w-full justify-start" variant="ghost">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </SnowButton>
              <SnowButton className="w-full justify-start" variant="ghost">
                <Building2 className="h-4 w-4 mr-2" />
                Partner Management
              </SnowButton>
              <SnowButton className="w-full justify-start" variant="ghost">
                <Car className="h-4 w-4 mr-2" />
                Fleet Overview
              </SnowButton>
              <SnowButton className="w-full justify-start" variant="ghost">
                <Shield className="h-4 w-4 mr-2" />
                Security Center
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard variant="elevated" className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
          <SnowCardHeader className="border-b border-slate-700">
            <SnowCardTitle className="flex items-center text-white">
              <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              Platform Alerts
            </SnowCardTitle>
            <SnowCardDescription className="text-slate-300">Critical system notifications</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-white">Security Alerts</span>
                </div>
                <Badge className="bg-red-500 text-white">3</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/15 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-white">Pending Orders</span>
                </div>
                <Badge className="bg-yellow-500 text-white">{metrics?.orders?.pending || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/15 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-white">Completed Today</span>
                </div>
                <Badge className="bg-green-500 text-white">{metrics?.orders?.completed?.toLocaleString() || '0'}</Badge>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard variant="elevated" className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
          <SnowCardHeader className="border-b border-slate-700">
            <SnowCardTitle className="flex items-center text-white">
              <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                <Gauge className="h-5 w-5 text-green-600" />
              </div>
              System Health
            </SnowCardTitle>
            <SnowCardDescription className="text-slate-300">Platform performance metrics</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{systemStatus?.[0]?.value || 0}%</span>
                  </div>
                  <div 
                    className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-green-500 animate-spin"
                    style={{ 
                      background: `conic-gradient(from 0deg, #10b981 ${(systemStatus?.[0]?.value || 0) * 3.6}deg, transparent 0deg)`
                    }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Overall Health</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">API Response</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">98.5%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Uptime</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">99.9%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}


