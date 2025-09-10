'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Wrench, 
  Car, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Edit,
  Eye
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicleName: string
  type: 'scheduled' | 'emergency' | 'repair' | 'inspection'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  description: string
  cost: number
  scheduledDate: string
  completedDate?: string
  technician: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export default function FleetMaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  const loadMaintenanceData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/fleet/maintenance')
      if (response.success && response.data) {
        setMaintenanceRecords(response.data as MaintenanceRecord[])
      } else {
        setMaintenanceRecords([])
        if (!response.success) {
          toast.error('Failed to load maintenance records')
          setError('Failed to load maintenance records')
        }
      }
    } catch (error: any) {
      console.error('Failed to load maintenance data:', error)
      setMaintenanceRecords([])
      setError('Failed to load maintenance data')
      toast.error('Failed to load maintenance data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = maintenanceRecords

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.technician.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(record => record.status === filter)
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(record => record.type === filter)
    }

    return filtered
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'repair':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'inspection':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return `EGP ${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Fleet Maintenance
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage vehicle maintenance schedules and repairs
          </p>
        </div>
        <SnowButton className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </SnowButton>
      </div>
      <SnowCard>
        <SnowCardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <SnowInput
                  placeholder="Search vehicles, descriptions, or technicians..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Total Records</p>
                <p className="text-2xl font-bold">{maintenanceRecords.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Pending</p>
                <p className="text-2xl font-bold">{maintenanceRecords.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Completed</p>
                <p className="text-2xl font-bold">{maintenanceRecords.filter(r => r.status === 'completed').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 text-slate-600">Critical</p>
                <p className="text-2xl font-bold">{maintenanceRecords.filter(r => r.priority === 'critical').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filterRecords().map((record) => (
          <SnowCard key={record.id} className="hover:shadow-lg transition-shadow">
            <SnowCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <SnowCardTitle className="text-lg">{record.vehicleName}</SnowCardTitle>
                  <SnowCardDescription>{record.description}</SnowCardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                  <Badge className={getTypeColor(record.type)}>
                    {record.type}
                  </Badge>
                </div>
              </div>
            </SnowCardHeader>
            <SnowCardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Technician:</span>
                <span>{record.technician}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Scheduled:</span>
                <span>{formatDate(record.scheduledDate)}</span>
              </div>
              
              {record.completedDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Completed:</span>
                  <span>{formatDate(record.completedDate)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Cost:</span>
                <span className="font-medium">{formatCurrency(record.cost)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Priority:</span>
                <span className={`font-medium ${getPriorityColor(record.priority)}`}>
                  {record.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <SnowButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View
                </SnowButton>
                <SnowButton variant="outline" size="sm" className="flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  Edit
                </SnowButton>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>

      {filterRecords().length === 0 && !isLoading && (
        <SnowCard>
          <SnowCardContent className="p-8 text-center">
            <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No maintenance records found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



