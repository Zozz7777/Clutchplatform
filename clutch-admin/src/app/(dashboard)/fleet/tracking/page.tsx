'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  Search, 
  Filter, 
  RefreshCw, 
  Play, 
  Square, 
  Navigation, 
  Fuel, 
  AlertTriangle,
  Gauge
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface FleetVehicle {
  id: string
  name: string
  plateNumber: string
  driver: string
  status: 'active' | 'idle' | 'maintenance' | 'offline'
  location: {
    lat: number
    lng: number
    address: string
  }
  speed: number
  fuel: number
  lastUpdate: string
  route: {
    start: string
    end: string
    progress: number
  }
}

export default function FleetTrackingPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isTracking, setIsTracking] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

  // Default vehicles data
  const defaultVehicles: FleetVehicle[] = []

  useEffect(() => {
    loadFleetData()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchQuery, statusFilter])

  const loadFleetData = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getFleetVehicles()
      if (response.success) {
        setVehicles(response.data || defaultVehicles)
      } else {
        setVehicles(defaultVehicles)
        toast.error('Failed to load fleet data')
      }
    } catch (error: any) {
      console.error('Failed to load fleet data:', error)
      setVehicles(defaultVehicles)
      toast.error('Failed to load fleet data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    setFilteredVehicles(filtered)
  }

  const startTracking = async () => {
    try {
      const response = await apiClient.post('/fleet/tracking/start', {})
      if (response.success) {
        setIsTracking(true)
        toast.success('Real-time tracking started')
      } else {
        toast.error('Failed to start tracking')
      }
    } catch (error: any) {
      console.error('Failed to start tracking:', error)
      toast.error('Failed to start tracking')
    }
  }

  const stopTracking = async () => {
    try {
      const response = await apiClient.post('/fleet/tracking/stop', {})
      if (response.success) {
        setIsTracking(false)
        toast.success('Real-time tracking stopped')
      } else {
        toast.error('Failed to stop tracking')
      }
    } catch (error: any) {
      console.error('Failed to stop tracking:', error)
      toast.error('Failed to stop tracking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatSpeed = (speed: number) => {
    return `${speed} km/h`
  }

  const formatFuel = (fuel: number) => {
    return `${fuel}%`
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Fleet Tracking
          </h1>
          <p className="text-slate-600 text-slate-600">
            Real-time GPS tracking and monitoring of your fleet vehicles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton
            variant={isTracking ? "destructive" : "default"}
            onClick={isTracking ? stopTracking : startTracking}
            className="flex items-center gap-2"
          >
            {isTracking ? (
              <>
                <Square className="h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Tracking
              </>
            )}
          </SnowButton>
          <SnowButton
            variant="outline"
            onClick={loadFleetData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
        </div>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search vehicles, drivers, or plate numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Active</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Maintenance</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Avg Speed</p>
                <p className="text-2xl font-bold">
                  {Math.round(vehicles.reduce((acc, v) => acc + v.speed, 0) / vehicles.length)} km/h
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <SnowCard 
            key={vehicle.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedVehicle === vehicle.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedVehicle(vehicle.id)}
          >
            <SnowCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <SnowCardTitle className="text-lg">{vehicle.name}</SnowCardTitle>
                  <SnowCardDescription>{vehicle.plateNumber}</SnowCardDescription>
                </div>
                <Badge className={getStatusColor(vehicle.status)}>
                  {vehicle.status}
                </Badge>
              </div>
            </SnowCardHeader>
            <SnowCardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span>{vehicle.driver}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="truncate">{vehicle.location.address}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-slate-400" />
                  <span>{formatSpeed(vehicle.speed)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="h-4 w-4 text-slate-400" />
                  <span>{formatFuel(vehicle.fuel)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Last update: {formatTime(vehicle.lastUpdate)}</span>
              </div>
              
              {vehicle.route && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{vehicle.route.start}</span>
                    <span>{vehicle.route.end}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${vehicle.route.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>

      {filteredVehicles.length === 0 && !isLoading && (
        <SnowCard>
          <SnowCardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



