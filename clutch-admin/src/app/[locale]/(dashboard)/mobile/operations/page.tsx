'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Upload, 
  Download, 
  Users, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Globe,
  Target,
  MessageSquare
} from 'lucide-react'
import { useMobileOperationsDashboard } from '@/hooks/useMobileOperationsDashboard'
import { toast } from 'sonner'

export default function MobileOperationsPage() {
  // Use consolidated mobile operations dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    appMetrics,
    releases,
    notifications
  } = useMobileOperationsDashboard()

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load mobile operations data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mobile operations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Mobile Operations
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage mobile app releases, notifications, and performance
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            New Release
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Downloads</SnowCardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{appMetrics?.overview?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Users</SnowCardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{appMetrics?.overview?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Average Rating</SnowCardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{((appMetrics?.platform?.ios?.rating || 0) + (appMetrics?.platform?.android?.rating || 0)) / 2}</div>
            <p className="text-xs text-muted-foreground">
              Based on platform ratings
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Crash Rate</SnowCardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{appMetrics?.performance?.crashRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+2%</span> from last week
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Recent Releases</SnowCardTitle>
          <SnowCardDescription>Latest app releases and their status</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {releases.slice(0, 5).map((release) => (
              <div key={release.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Clutch App</p>
                    <p className="text-sm text-slate-600">v{release.version}</p>
                    <p className="text-xs text-slate-600">{release.platform}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant={release.status === 'live' ? 'default' : 'secondary'}>
                    {release.status}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Viewing release: ${release.version}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Editing release: ${release.version}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Push Notifications</SnowCardTitle>
          <SnowCardDescription>Recent push notification campaigns</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-600">Sent to {notification.recipients} users</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant={notification.type === 'push' ? 'default' : 'secondary'}>
                    {notification.type}
                  </Badge>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">{notification.openRate}% open rate</p>
                    <p className="text-xs text-slate-600">{notification.sentAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


