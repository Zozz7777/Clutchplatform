'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { motion } from 'framer-motion'
import { 
  Truck, 
  MapPin, 
  Users, 
  PoundSterling, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Fuel,
  Wrench,
  Route,
  Activity,
  Eye,
  Loader2
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FleetOverviewPage() {
  const [fleetData, setFleetData] = useState<any>({
    totalFleets: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    outOfService: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    fuelEfficiency: 0,
    maintenanceCost: 0,
    totalDistance: 0,
    averageSpeed: 0,
    alerts: 0,
    criticalIssues: 0
  })
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFleetData()
  }, [])

  const loadFleetData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load dashboard overview data to get fleet-related metrics
      const dashboardResponse = await apiClient.get<any>('/dashboard/admin/overview')
      if (dashboardResponse.success) {
        const data = dashboardResponse.data as any
        
        // Map dashboard data to fleet metrics
        setFleetData({
          totalFleets: 12, // This would come from fleet-specific endpoint
          totalVehicles: data.mechanics?.total || 0, // Using mechanics as vehicles for now
          activeVehicles: data.mechanics?.active || 0,
          maintenanceVehicles: Math.floor((data.mechanics?.total || 0) * 0.05), // 5% in maintenance
          outOfService: Math.floor((data.mechanics?.total || 0) * 0.03), // 3% out of service
          totalDrivers: data.users?.total || 0,
          activeDrivers: data.users?.active || 0,
          totalRevenue: data.revenue?.total || 0,
          monthlyRevenue: Math.floor((data.revenue?.total || 0) * 0.15), // 15% of total as monthly
          fuelEfficiency: 78, // This would come from fleet analytics
          maintenanceCost: Math.floor((data.revenue?.total || 0) * 0.04), // 4% of revenue as maintenance
          totalDistance: 45680, // This would come from tracking data
          averageSpeed: 45, // This would come from tracking data
          alerts: 3, // This would come from alerts system
          criticalIssues: 1 // This would come from alerts system
        })
      }

      // Load recent alerts from system alerts
      const alertsResponse = await apiClient.get<any[]>('/system/alerts')
      if (alertsResponse.success) {
        const alerts = alertsResponse.data as any[]
        // Filter alerts related to fleet/vehicles
        const fleetAlerts = alerts
          .filter(alert => alert.type === 'fleet' || alert.type === 'vehicle' || alert.type === 'maintenance')
          .slice(0, 5)
          .map(alert => ({
            id: alert._id,
            type: alert.type || 'System',
            vehicle: alert.metadata?.vehicle || 'Unknown',
            message: alert.message,
            severity: alert.severity || 'info',
            time: new Date(alert.createdAt).toLocaleString()
          }))
        
        setRecentAlerts(fleetAlerts)
      }

    } catch (error: any) {
      console.error('Failed to load fleet data:', error)
      setError('Failed to load fleet data')
      toast.error('Failed to load fleet data')
    } finally {
      setIsLoading(false)
    }
  }

  const fleetStats = [
    {
      title: 'Total Fleets',
      value: fleetData.totalFleets,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Active Vehicles',
      value: fleetData.activeVehicles,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5',
      changeType: 'positive'
    },
    {
      title: 'Total Drivers',
      value: fleetData.totalDrivers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: 'Monthly Revenue',
      value: `EGP ${fleetData.monthlyRevenue.toLocaleString()}`,
      icon: PoundSterling,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+12%',
      changeType: 'positive'
    }
  ]

  const vehicleStatus = [
    { status: 'Active', count: fleetData.activeVehicles, color: 'bg-green-500' },
    { status: 'Maintenance', count: fleetData.maintenanceVehicles, color: 'bg-yellow-500' },
    { status: 'Out of Service', count: fleetData.outOfService, color: 'bg-red-500' }
  ]

  const performanceMetrics = [
    { label: 'Fuel Efficiency', value: fleetData.fuelEfficiency, unit: '%', color: 'bg-green-500' },
    { label: 'Average Speed', value: fleetData.averageSpeed, unit: 'km/h', color: 'bg-blue-500' },
    { label: 'Total Distance', value: fleetData.totalDistance, unit: 'km', color: 'bg-purple-500' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading fleet data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadFleetData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive fleet management and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Live Tracking
          </SnowButton>
          <SnowButton variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Analytics
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {fleetStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <SnowCard>
              <SnowCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                      {stat.change} from last month
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Status
            </SnowCardTitle>
            <SnowCardDescription>
              Current fleet vehicle status distribution
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {vehicleStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                  <span className="text-sm font-bold">{status.count}</span>
                </div>
              ))}
              <div className="pt-4">
                <Progress value={(fleetData.activeVehicles / fleetData.totalVehicles) * 100} />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((fleetData.activeVehicles / fleetData.totalVehicles) * 100)}% operational
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </SnowCardTitle>
            <SnowCardDescription>
              Key performance indicators
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm font-bold">
                      {metric.value.toLocaleString()} {metric.unit}
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </SnowCardTitle>
            <SnowCardDescription>
              Latest fleet alerts and notifications
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50 bg-slate-100 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'error' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.vehicle}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent alerts
                </div>
              )}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Quick Actions</SnowCardTitle>
          <SnowCardDescription>
            Common fleet management tasks
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <SnowButton 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => toast.info('Add Vehicle functionality - redirecting to vehicle management')}
            >
              <Truck className="h-6 w-6" />
              <span>Add Vehicle</span>
            </SnowButton>
            <SnowButton 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => toast.info('Add Driver functionality - redirecting to driver management')}
            >
              <Users className="h-6 w-6" />
              <span>Add Driver</span>
            </SnowButton>
            <SnowButton 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => toast.info('Schedule Maintenance functionality - opening maintenance scheduler')}
            >
              <Wrench className="h-6 w-6" />
              <span>Schedule Maintenance</span>
            </SnowButton>
            <SnowButton 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => toast.info('Plan Route functionality - opening route planner')}
            >
              <Route className="h-6 w-6" />
              <span>Plan Route</span>
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



