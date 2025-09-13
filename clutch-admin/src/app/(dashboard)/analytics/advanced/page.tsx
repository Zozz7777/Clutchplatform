'use client'

import React, { useState, useEffect } from 'react'
import { AdvancedAnalytics } from '@/components/advanced/advanced-analytics'
import { RealTimeNotifications } from '@/components/advanced/real-time-notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Bell,
  Settings,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Target,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdvancedAnalyticsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true)
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data Refreshed', {
        description: 'All analytics data has been updated'
      })
    } catch (error) {
      toast.error('Refresh Failed', {
        description: 'Failed to refresh analytics data'
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Export all analytics
  const exportAllAnalytics = async () => {
    try {
      toast.success('Export Started', {
        description: 'All analytics data is being exported'
      })
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Failed to export analytics data'
      })
    }
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">
            Comprehensive insights and real-time monitoring for your platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {showNotifications ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showNotifications ? 'Hide Notifications' : 'Show Notifications'}
          </Button>
          <Button
            variant="outline"
            onClick={refreshAllData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportAllAnalytics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$125,000</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">245ms</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+5ms</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.8%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+0.1%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Dashboard */}
        <div className="lg:col-span-2">
          <AdvancedAnalytics />
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="lg:col-span-1">
            <RealTimeNotifications />
          </div>
        )}
      </div>

      {/* Additional Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Critical metrics for platform health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Conversion Rate</p>
                      <p className="text-sm text-gray-600">User signup to active</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">15.2%</p>
                      <p className="text-sm text-green-600">+2.1%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Average Session</p>
                      <p className="text-sm text-gray-600">Time spent on platform</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">8m 32s</p>
                      <p className="text-sm text-blue-600">+45s</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Bounce Rate</p>
                      <p className="text-sm text-gray-600">Single page sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">23.4%</p>
                      <p className="text-sm text-red-600">-1.2%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Real-time Activity
                </CardTitle>
                <CardDescription>
                  Live platform activity and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New user registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">User</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment processed</p>
                      <p className="text-xs text-gray-500">5 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Payment</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">System maintenance</p>
                      <p className="text-xs text-gray-500">10 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">System</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">API rate limit hit</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">API</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">245ms</div>
                  <div className="text-sm text-gray-600">Average Response Time</div>
                  <div className="text-xs text-green-600 mt-1">↓ 5ms from last week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">99.8%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="text-xs text-blue-600 mt-1">↑ 0.1% from last week</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">0.2%</div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                  <div className="text-xs text-orange-600 mt-1">↓ 0.1% from last week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>
                User behavior, demographics, and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">User Demographics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">18-24 years</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">25-34 years</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">35-44 years</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">45+ years</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Device Usage</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mobile</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Desktop</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tablet</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and revenue optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Revenue Sources</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subscriptions</span>
                      <span className="text-sm font-medium">$75,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">One-time Payments</span>
                      <span className="text-sm font-medium">$35,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Commissions</span>
                      <span className="text-sm font-medium">$15,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Growth Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monthly Growth</span>
                      <span className="text-sm font-medium text-green-600">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer LTV</span>
                      <span className="text-sm font-medium">$1,250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Churn Rate</span>
                      <span className="text-sm font-medium text-red-600">2.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent recommendations and predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-blue-900">Peak Usage Prediction</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on historical data, expect 25% higher traffic between 2-4 PM today.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">Prediction</Badge>
                        <span className="text-xs text-blue-600">85% confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-green-900">Optimization Opportunity</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Reducing API response time by 50ms could increase conversion by 3.2%.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">Optimization</Badge>
                        <span className="text-xs text-green-600">High impact</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-yellow-900">User Behavior Insight</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Users who complete onboarding in under 5 minutes have 40% higher retention.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">Behavior</Badge>
                        <span className="text-xs text-yellow-600">Actionable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
