'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Car, 
  Fuel,
  Clock,
  MapPin,
  PoundSterling,
  Users
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function FleetAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFleetAnalyticsData()
  }, [])

  const loadFleetAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any>('/fleet/analytics')
      if (response.success && response.data) {
        setAnalytics(response.data as any)
      } else {
        setAnalytics({})
        if (!response.success) {
          toast.error('Failed to load fleet analytics')
          setError('Failed to load fleet analytics')
        }
      }
    } catch (error: any) {
      console.error('Failed to load fleet analytics data:', error)
      setAnalytics({})
      setError('Failed to load fleet analytics data')
      toast.error('Failed to load fleet analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString()} km`
  }

  const formatFuel = (fuel: number) => {
    return `${fuel.toLocaleString()} L`
  }

  const formatCurrency = (amount: number) => {
    return `EGP ${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Fleet Analytics
          </h1>
          <p className="text-slate-600 text-slate-600">
            Comprehensive insights into your fleet performance and operations
          </p>
        </div>
        <Select value="7d" onValueChange={() => {}}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<Car className="h-5 w-5" />}>Total Vehicles</SnowCardTitle>
            <SnowCardDescription>{analytics.activeVehicles || 0} active</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{analytics.totalVehicles || 0}</div>
          </SnowCardContent>
        </SnowCard>
        
        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<Users className="h-5 w-5" />}>Total Drivers</SnowCardTitle>
            <SnowCardDescription>{analytics.activeDrivers || 0} active</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{analytics.totalDrivers || 0}</div>
          </SnowCardContent>
        </SnowCard>
        
        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<MapPin className="h-5 w-5" />}>Total Distance</SnowCardTitle>
            <SnowCardDescription>This period</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{formatDistance(analytics.totalDistance || 0)}</div>
          </SnowCardContent>
        </SnowCard>
        
        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<PoundSterling className="h-5 w-5" />}>Total Cost</SnowCardTitle>
            <SnowCardDescription>This period</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{formatCurrency(analytics.totalCost || 0)}</div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<Fuel className="h-5 w-5 text-blue-600" />}>
              Fuel Analytics
            </SnowCardTitle>
            <SnowCardDescription>Fuel consumption and efficiency metrics</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Consumption</span>
              <span className="font-medium">{formatFuel(analytics.totalFuelConsumption || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Efficiency</span>
              <span className="font-medium">{analytics.fuelEfficiency || 0} km/L</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((analytics.fuelEfficiency || 0) / 6) * 100}%` }}
              ></div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<Clock className="h-5 w-5 text-green-600" />}>
              Performance Metrics
            </SnowCardTitle>
            <SnowCardDescription>Driver and vehicle performance indicators</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Avg Speed</span>
              <span className="font-medium">{analytics.averageSpeed || 0} km/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Driver Rating</span>
              <span className="font-medium">{analytics.driverPerformance || 0}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Utilization</span>
              <span className="font-medium">{formatPercentage(analytics.vehicleUtilization || 0)}</span>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle icon={<TrendingUp className="h-5 w-5 text-purple-600" />}>
              Maintenance Status
            </SnowCardTitle>
            <SnowCardDescription>Vehicle health and maintenance alerts</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Active Alerts</span>
              <span className="font-medium text-red-600">{analytics.maintenanceAlerts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Healthy Vehicles</span>
              <span className="font-medium text-green-600">{analytics.totalVehicles || 0 - (analytics.maintenanceAlerts || 0)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(((analytics.totalVehicles || 0) - (analytics.maintenanceAlerts || 0)) / (analytics.totalVehicles || 0)) * 100}%` }}
              ></div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Distance Trends</SnowCardTitle>
            <SnowCardDescription>Daily distance covered by fleet</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">
              <div className="text-3xl font-bold">
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Cost Analysis</SnowCardTitle>
            <SnowCardDescription>Fuel and maintenance costs breakdown</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">
              <div className="text-3xl font-bold">
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Key Insights</SnowCardTitle>
          <SnowCardDescription>AI-powered recommendations for fleet optimization</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Fuel Efficiency Improved</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your fleet's fuel efficiency has improved by 12% compared to last month. Consider implementing eco-driving training for drivers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Car className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">Vehicle Utilization High</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Vehicle utilization is at 85%, which is excellent. Consider adding more vehicles if demand continues to grow.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Maintenance Alerts</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                3 vehicles require immediate maintenance attention. Schedule service appointments to prevent breakdowns.
              </p>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


