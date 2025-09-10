'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { handleApiError, logError } from '@/utils/errorHandler'
import { validateArrayResponse, validateFleetData } from '@/utils/dataValidator'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { 
  MapPin, 
  Clock, 
  Car, 
  Users, 
  Fuel, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Route,
  Navigation
} from 'lucide-react'

interface FleetRoute {
  _id: string
  name: string
  startLocation: string
  endLocation: string
  distance: number
  estimatedTime: number
  status: string
  assignedVehicle: string
  assignedDriver: string
  stops: number
  fuelCost: number
  lastUsed: string
}

export default function FleetRoutesPage() {
  const [routes, setRoutes] = useState<FleetRoute[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<FleetRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadRoutesData()
  }, [currentPage, statusFilter])

  useEffect(() => {
    filterRoutes()
  }, [routes, searchQuery, statusFilter])

  const loadRoutesData = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await apiClient.getFleetRoutes(params)
      const validation = validateArrayResponse(response, [])
      
      if (validation.isValid) {
        // Validate and transform fleet data
        const validatedData = (validation.data || []).map(route => validateFleetData(route))
        setRoutes(validatedData)
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        const errorMessage = handleApiError(new Error(validation.error || 'Failed to load routes data'), 'load routes data')
        toast.error(errorMessage)
        setRoutes([])
        logError(new Error(validation.error), 'loadRoutesData', { response, params })
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'load routes data')
      toast.error(errorMessage)
      setRoutes([])
      logError(error, 'loadRoutesData')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRoutes = () => {
    let filtered = routes

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.endLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(route => route.status === statusFilter)
    }

    setFilteredRoutes(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Routes</h1>
          <p className="text-muted-foreground">
            Manage and optimize fleet routes and navigation
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Navigation className="mr-2 h-4 w-4" />
            Optimize Routes
          </SnowButton>
          <SnowButton>
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Routes</SnowCardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">
              Active fleet routes
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Distance</SnowCardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">
              {routes.reduce((total, route) => total + route.distance, 0)} km
            </div>
            <p className="text-xs text-muted-foreground">
              Combined route distance
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Vehicles</SnowCardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">
              {new Set(routes.map(route => route.assignedVehicle)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicles in use
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Fuel Cost</SnowCardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(routes.reduce((total, route) => total + route.fuelCost, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated fuel costs
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Fleet Routes</SnowCardTitle>
          <SnowCardDescription>
            View and manage all fleet routes and assignments
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <SnowInput
                  placeholder="Search routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <SnowButton
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </SnowButton>
              <SnowButton
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('active')}
              >
                Active
              </SnowButton>
              <SnowButton
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('inactive')}
              >
                Inactive
              </SnowButton>
              <SnowButton
                variant={statusFilter === 'maintenance' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('maintenance')}
              >
                Maintenance
              </SnowButton>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm bg-muted/50">
                  <div className="col-span-3">Route</div>
                  <div className="col-span-2">Distance</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Vehicle & Driver</div>
                  <div className="col-span-1">Stops</div>
                  <div className="col-span-1">Fuel Cost</div>
                  <div className="col-span-1">Status</div>
                </div>
                
                {filteredRoutes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No routes found
                  </div>
                ) : (
                  filteredRoutes.map((route) => (
                    <div key={route._id} className="grid grid-cols-12 gap-4 p-4 border-t items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {route.startLocation} â†’ {route.endLocation}
                        </div>
                      </div>
                      <div className="col-span-2 text-sm">{route.distance} km</div>
                      <div className="col-span-2 text-sm">{formatTime(route.estimatedTime)}</div>
                      <div className="col-span-2">
                        <div className="text-sm font-medium">{route.assignedVehicle}</div>
                        <div className="text-xs text-muted-foreground">{route.assignedDriver}</div>
                      </div>
                      <div className="col-span-1 text-sm">{route.stops}</div>
                      <div className="col-span-1 text-sm">{formatCurrency(route.fuelCost)}</div>
                      <div className="col-span-1">
                        <Badge className={getStatusColor(route.status)}>
                          {route.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <SnowButton
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </SnowButton>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <SnowButton
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </SnowButton>
                </div>
              )}
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



