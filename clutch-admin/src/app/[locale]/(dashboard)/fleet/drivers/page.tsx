'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  licenseNumber: string
  status: 'active' | 'inactive' | 'suspended'
  rating: number
  totalTrips: number
  totalDistance: number
  joinDate: string
  vehicle: string
  location: string
}

export default function FleetDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadDrivers()
  }, [])

  useEffect(() => {
    filterDrivers()
  }, [drivers, searchQuery, statusFilter])

  const loadDrivers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/fleet/drivers')
      if (response.success && response.data) {
        setDrivers(response.data as any[])
      } else {
        setDrivers([])
        if (!response.success) {
          toast.error('Failed to load drivers')
          setError('Failed to load drivers')
        }
      }
    } catch (error: any) {
      console.error('Failed to load drivers:', error)
      setError('Failed to load drivers')
      setDrivers([])
      toast.error('Failed to load drivers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDriver = async (driver: any) => {
    try {
      const response = await apiClient.get(`/fleet/drivers/${driver._id}`)
      if (response.success) {
        setSelectedDriver(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load driver details')
      }
    } catch (error) {
      console.error('Failed to load driver details:', error)
      toast.error('Failed to load driver details')
    }
  }

  const handleEditDriver = async (driver: any) => {
    try {
      const response = await apiClient.get(`/fleet/drivers/${driver._id}`)
      if (response.success) {
        setSelectedDriver(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load driver for editing')
      }
    } catch (error) {
      console.error('Failed to load driver for editing:', error)
      toast.error('Failed to load driver for editing')
    }
  }

  const handleDeleteDriver = async (driver: any) => {
    if (confirm(`Are you sure you want to delete the driver "${driver.name}"?`)) {
      try {
        const response = await apiClient.delete(`/fleet/drivers/${driver._id}`)
        if (response.success) {
          toast.success('Driver deleted successfully')
          loadDrivers() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete driver')
        }
      } catch (error) {
        console.error('Failed to delete driver:', error)
        toast.error('Failed to delete driver')
      }
    }
  }

  const handleToggleDriverStatus = async (driver: any) => {
    try {
      const newStatus = driver.status === 'active' ? 'inactive' : 'active'
      const response = await apiClient.put(`/fleet/drivers/${driver._id}/status`, { status: newStatus })
      if (response.success) {
        toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
        loadDrivers() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to update driver status')
      }
    } catch (error) {
      console.error('Failed to update driver status:', error)
      toast.error('Failed to update driver status')
    }
  }

  const handleAddDriver = async (driverData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/fleet/drivers', driverData)
      if (response.success) {
        toast.success('Driver added successfully')
        setShowAddModal(false)
        loadDrivers()
      } else {
        toast.error(response.message || 'Failed to add driver')
      }
    } catch (error: any) {
      console.error('Failed to add driver:', error)
      toast.error('Failed to add driver')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateDriver = async (driverData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/fleet/drivers/${selectedDriver._id}`, driverData)
      if (response.success) {
        toast.success('Driver updated successfully')
        setShowEditModal(false)
        setSelectedDriver(null)
        loadDrivers()
      } else {
        toast.error(response.message || 'Failed to update driver')
      }
    } catch (error: any) {
      console.error('Failed to update driver:', error)
      toast.error('Failed to update driver')
    } finally {
      setIsFormLoading(false)
    }
  }

  const filterDrivers = () => {
    const filtered = drivers.filter(driver => {
      const matchesSearch = driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           driver.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           driver.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = statusFilter === 'all' || driver.status === statusFilter
      return matchesSearch && matchesFilter
    })
    setFilteredDrivers(filtered)
  }

  // Calculate metrics
  const totalDrivers = drivers.length
  const activeDrivers = drivers.filter(d => d.status === 'active').length
  const suspendedDrivers = drivers.filter(d => d.status === 'suspended').length
  const avgRating = drivers.length > 0 
    ? drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length 
    : 0
  const totalDistance = drivers.reduce((sum, d) => sum + (d.totalDistance || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString()} km`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Fleet Drivers
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage your fleet drivers and their performance
          </p>
        </div>
        <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </SnowButton>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search drivers by name, email, or license..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Total Drivers</p>
                <p className="text-2xl font-bold">{totalDrivers}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Active</p>
                <p className="text-2xl font-bold">{activeDrivers}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {avgRating.toFixed(1)}
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Total Distance</p>
                <p className="text-2xl font-bold">
                  {formatDistance(totalDistance)}
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <SnowCard key={driver.id} className="hover:shadow-lg transition-shadow">
            <SnowCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <SnowCardTitle className="text-lg">{driver.name}</SnowCardTitle>
                  <SnowCardDescription>{driver.licenseNumber}</SnowCardDescription>
                </div>
                <Badge className={getStatusColor(driver.status)}>
                  {driver.status}
                </Badge>
              </div>
            </SnowCardHeader>
            <SnowCardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{driver.email}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{driver.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="truncate">{driver.location}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-slate-400" />
                  <span>{driver.rating} rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{driver.totalTrips} trips</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span>Vehicle: {driver.vehicle}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Joined: {formatDate(driver.joinDate)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <SnowButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View
                </SnowButton>
                <div className="flex items-center space-x-1">
                  <SnowButton variant="outline" size="sm" className="flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </SnowButton>
                  <SnowButton variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>

      {filteredDrivers.length === 0 && !isLoading && (
        <SnowCard>
          <SnowCardContent className="p-8 text-center">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No drivers found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



