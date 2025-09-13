'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { analyticsApi } from '@/lib/real-api-service'
import { toast } from 'sonner'

interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    growth: number
    chart: Array<{ date: string; revenue: number; orders: number }>
  }
  users: {
    total: number
    active: number
    new: number
    growth: number
    chart: Array<{ date: string; total: number; active: number; new: number }>
  }
  performance: {
    responseTime: number
    uptime: number
    errorRate: number
    chart: Array<{ time: string; responseTime: number; uptime: number; errors: number }>
  }
  demographics: {
    ageGroups: Array<{ name: string; value: number; color: string }>
    locations: Array<{ name: string; value: number; color: string }>
    devices: Array<{ name: string; value: number; color: string }>
  }
}

interface AdvancedAnalyticsProps {
  className?: string
}

const COLORS = ['#ED1B24', '#3B82F6', '#059669', '#D97706', '#DC2626', '#0284C7', '#8B5CF6', '#F59E0B']

export function AdvancedAnalytics({ className }: AdvancedAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showDetails, setShowDetails] = useState(true)

  // Load analytics data
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await analyticsApi.getAnalytics({ period: timeRange })
      
      if (response.success && response.data) {
        setData(response.data as any)
      } else {
        console.error('Failed to load analytics:', response.message)
        toast.error('Failed to load analytics', {
          description: response.message || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Analytics loading error:', error)
      toast.error('Analytics Error', {
        description: 'Failed to load analytics data'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Export analytics data
  const exportAnalytics = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const success = await analyticsApi.exportAnalytics(format, { period: timeRange })
      if (success) {
        toast.success('Export started', {
          description: `Your analytics data is being exported as ${format.toUpperCase()}`
        })
      } else {
        toast.error('Export failed', {
          description: 'Failed to export analytics data'
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Please try again'
      })
    }
  }

  // Initial load
  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    revenue: {
      total: 125000,
      monthly: 45000,
      growth: 12.5,
      chart: [
        { date: '2024-01', revenue: 35000, orders: 420 },
        { date: '2024-02', revenue: 38000, orders: 450 },
        { date: '2024-03', revenue: 42000, orders: 480 },
        { date: '2024-04', revenue: 45000, orders: 520 },
        { date: '2024-05', revenue: 48000, orders: 550 },
        { date: '2024-06', revenue: 45000, orders: 520 }
      ]
    },
    users: {
      total: 1250,
      active: 890,
      new: 120,
      growth: 8.3,
      chart: [
        { date: '2024-01', total: 1100, active: 780, new: 95 },
        { date: '2024-02', total: 1150, active: 820, new: 105 },
        { date: '2024-03', total: 1180, active: 840, new: 110 },
        { date: '2024-04', total: 1210, active: 860, new: 115 },
        { date: '2024-05', total: 1230, active: 875, new: 118 },
        { date: '2024-06', total: 1250, active: 890, new: 120 }
      ]
    },
    performance: {
      responseTime: 245,
      uptime: 99.8,
      errorRate: 0.2,
      chart: [
        { time: '00:00', responseTime: 200, uptime: 100, errors: 0 },
        { time: '04:00', responseTime: 180, uptime: 100, errors: 0 },
        { time: '08:00', responseTime: 250, uptime: 99.9, errors: 1 },
        { time: '12:00', responseTime: 300, uptime: 99.8, errors: 2 },
        { time: '16:00', responseTime: 280, uptime: 99.9, errors: 1 },
        { time: '20:00', responseTime: 220, uptime: 100, errors: 0 }
      ]
    },
    demographics: {
      ageGroups: [
        { name: '18-24', value: 25, color: COLORS[0] },
        { name: '25-34', value: 35, color: COLORS[1] },
        { name: '35-44', value: 20, color: COLORS[2] },
        { name: '45-54', value: 15, color: COLORS[3] },
        { name: '55+', value: 5, color: COLORS[4] }
      ],
      locations: [
        { name: 'North America', value: 40, color: COLORS[0] },
        { name: 'Europe', value: 30, color: COLORS[1] },
        { name: 'Asia', value: 20, color: COLORS[2] },
        { name: 'Other', value: 10, color: COLORS[3] }
      ],
      devices: [
        { name: 'Mobile', value: 60, color: COLORS[0] },
        { name: 'Desktop', value: 30, color: COLORS[1] },
        { name: 'Tablet', value: 10, color: COLORS[2] }
      ]
    }
  }

  const analyticsData = data || mockData

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Advanced Analytics</CardTitle>
            <Badge variant="outline" className="ml-2">
              {timeRange}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAnalytics}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportAnalytics('csv')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Comprehensive analytics and insights for your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${analyticsData.revenue.total.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">
                          +{analyticsData.revenue.growth}%
                        </span>
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
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.users.total.toLocaleString()}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">
                          +{analyticsData.users.growth}%
                        </span>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.performance.responseTime}ms
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">-5ms</span>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.performance.uptime}%
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+0.1%</span>
                      </div>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.revenue.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ED1B24"
                      fill="#ED1B24"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.revenue.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#ED1B24" />
                    <Bar dataKey="orders" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>User acquisition and activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.users.chart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="active" stroke="#059669" strokeWidth={2} />
                      <Line type="monotone" dataKey="new" stroke="#ED1B24" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                  <CardDescription>Age group distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.demographics.ageGroups}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.demographics.ageGroups.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData.performance.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="responseTime" stroke="#ED1B24" strokeWidth={2} />
                    <Line type="monotone" dataKey="uptime" stroke="#059669" strokeWidth={2} />
                    <Line type="monotone" dataKey="errors" stroke="#DC2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
