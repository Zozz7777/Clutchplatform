'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  BarChart3,
  Activity,
  Building,
  Sparkles,
  Zap,
  ArrowUpRight
} from 'lucide-react'

export default function AnalyticsDepartmentPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEmployeesModal, setShowEmployeesModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadDepartmentData()
  }, [])

  const loadDepartmentData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/analytics/department')
      if (response.success && response.data) {
        setDepartments(response.data as any[])
      } else {
        setDepartments([])
        if (!response.success) {
          toast.error('Failed to load departments')
          setError('Failed to load departments')
        }
      }
    } catch (error: any) {
      console.error('Failed to load department data:', error)
      setError('Failed to load department data')
      setDepartments([])
      toast.error('Failed to load department data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDepartment = async (department: any) => {
    try {
      const response = await apiClient.get(`/analytics/department/${department.id}`)
      if (response.success) {
        setSelectedDepartment(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load department details')
      }
    } catch (error) {
      console.error('Failed to load department details:', error)
      toast.error('Failed to load department details')
    }
  }

  const handleEditDepartment = async (department: any) => {
    try {
      const response = await apiClient.get(`/analytics/department/${department.id}`)
      if (response.success) {
        setSelectedDepartment(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load department for editing')
      }
    } catch (error) {
      console.error('Failed to load department for editing:', error)
      toast.error('Failed to load department for editing')
    }
  }

  const handleManageEmployees = async (department: any) => {
    try {
      const response = await apiClient.get(`/analytics/department/${department.id}/employees`)
      if (response.success) {
        setSelectedDepartment({ ...department, employees: response.data })
        setShowEmployeesModal(true)
      } else {
        toast.error('Failed to load department employees')
      }
    } catch (error) {
      console.error('Failed to load department employees:', error)
      toast.error('Failed to load department employees')
    }
  }

  const handleDeleteDepartment = async (department: any) => {
    if (confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      try {
        const response = await apiClient.delete(`/analytics/department/${department.id}`)
        if (response.success) {
          toast.success('Department deleted successfully')
          loadDepartmentData() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete department')
        }
      } catch (error) {
        console.error('Failed to delete department:', error)
        toast.error('Failed to delete department')
      }
    }
  }

  const handleAddDepartment = async (departmentData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/analytics/department', departmentData)
      if (response.success) {
        toast.success('Department added successfully')
        setShowAddModal(false)
        loadDepartmentData()
      } else {
        toast.error(response.message || 'Failed to add department')
      }
    } catch (error: any) {
      console.error('Failed to add department:', error)
      toast.error('Failed to add department')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateDepartment = async (departmentData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/analytics/department/${selectedDepartment.id}`, departmentData)
      if (response.success) {
        toast.success('Department updated successfully')
        setShowEditModal(false)
        setSelectedDepartment(null)
        loadDepartmentData()
      } else {
        toast.error(response.message || 'Failed to update department')
      }
    } catch (error: any) {
      console.error('Failed to update department:', error)
      toast.error('Failed to update department')
    } finally {
      setIsFormLoading(false)
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-400'
    if (performance >= 80) return 'text-yellow-400'
    if (performance >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-slate-500'
      case 'restructuring': return 'bg-yellow-500'
      case 'closed': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'restructuring': return 'Restructuring'
      case 'closed': return 'Closed'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <Clock className="h-4 w-4" />
      case 'restructuring': return <AlertCircle className="h-4 w-4" />
      case 'closed': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getDepartmentIcon = (type: string) => {
    switch (type) {
      case 'engineering': return <Building className="h-4 w-4" />
      case 'marketing': return <Target className="h-4 w-4" />
      case 'sales': return <PoundSterling className="h-4 w-4" />
      case 'hr': return <Users className="h-4 w-4" />
      case 'finance': return <BarChart3 className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.manager?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || department.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalDepartments = departments.length
  const activeDepartments = departments.filter(d => d.status === 'active').length
  const totalEmployees = departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0)
  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0)
  const avgPerformance = departments.length > 0 
    ? departments.reduce((sum, d) => sum + (d.performance || 0), 0) / departments.length 
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">DEPARTMENT SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Department Analytics
                </h1>
                <p className="text-teal-100 max-w-2xl">
                  Comprehensive department performance and employee analytics
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-teal-500/20 border-teal-400/30 text-white hover:bg-teal-500/30">
                  <Building className="h-4 w-4 mr-2" />
                  Department Dashboard
                </SnowButton>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SnowCard key={i} variant="dark" className="animate-pulse">
              <SnowCardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/3"></div>
              </SnowCardContent>
            </SnowCard>
          ))}
        </div>
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-300">SYSTEM ERROR</span>
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Department Analytics
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load department data. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={loadDepartmentData}>
                <Zap className="h-4 w-4 mr-2" />
                Retry
              </SnowButton>
            </div>
          </div>
        </div>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Data</h3>
              <p className="text-slate-300 mb-4">{error}</p>
              <SnowButton onClick={loadDepartmentData} variant="default">
                Try Again
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">DEPARTMENT SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Department Analytics
              </h1>
              <p className="text-teal-100 max-w-2xl">
                Comprehensive department performance and employee analytics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-teal-500/20 border-teal-400/30 text-white hover:bg-teal-500/30">
                <Building className="h-4 w-4 mr-2" />
                Department Dashboard
              </SnowButton>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total Departments</p>
                <p className="text-2xl font-bold text-white">{totalDepartments}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-blue-200">+{activeDepartments} active</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Total Employees</p>
                <p className="text-2xl font-bold text-white">{totalEmployees}</p>
                <p className="text-xs text-green-200">Across all departments</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">Total Budget</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
                <p className="text-xs text-blue-200">Annual allocation</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <PoundSterling className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Avg Performance</p>
                <p className="text-2xl font-bold text-white">{avgPerformance.toFixed(1)}%</p>
                <p className="text-xs text-purple-200">Department efficiency</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard variant="dark">
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SnowSearchInput
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="restructuring">Restructuring</option>
                <option value="closed">Closed</option>
              </select>
              <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Building className="h-5 w-5" />}>
            Department Analytics
          </SnowCardTitle>
          <SnowCardDescription>
            Manage and monitor department performance and employee analytics
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredDepartments.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Department</SnowTableHead>
                  <SnowTableHead>Type</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Manager</SnowTableHead>
                  <SnowTableHead>Employees</SnowTableHead>
                  <SnowTableHead>Budget</SnowTableHead>
                  <SnowTableHead>Performance</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredDepartments.map((department) => (
                  <SnowTableRow key={department.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">{department.name}</div>
                        <div className="text-sm text-slate-400">{department.description}</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-slate-700 rounded">
                          {getDepartmentIcon(department.type)}
                        </div>
                        <span className="text-white capitalize">{department.type}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getStatusColor(department.status)}`}>
                          {getStatusIcon(department.status)}
                        </div>
                        <span className="text-white">{getStatusText(department.status)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{department.manager}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{department.employeeCount}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{formatCurrency(department.budget)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className={`font-medium ${getPerformanceColor(department.performance)}`}>
                        {department.performance}%
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex gap-1">
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDepartment(department)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageEmployees(department)}
                        >
                          <Users className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Departments Found</h3>
              <p className="text-slate-400 mb-4">No departments match your current search criteria. Try adjusting your filters or add a new department.</p>
              <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

