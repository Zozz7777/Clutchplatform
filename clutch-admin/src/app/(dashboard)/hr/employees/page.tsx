'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
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
  Phone,
  Mail,
  MapPin,
  Building,
  Activity,
  Sparkles,
  Zap,
  ArrowUpRight
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/modal'
import EmployeeForm from '@/components/hr/EmployeeForm'

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getEmployees()
      if (response.success && response.data) {
        setEmployees(response.data as any[])
      } else {
        setEmployees([])
        if (!response.success) {
          toast.error('Failed to load employees')
          setError('Failed to load employees')
        }
      }
    } catch (error: any) {
      console.error('Failed to load employees:', error)
      setError('Failed to load employees')
      setEmployees([])
      toast.error('Failed to load employees')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewEmployee = async (employee: any) => {
    try {
      const response = await apiClient.get(`/hr/employees/${employee._id}`)
      if (response.success) {
        setSelectedEmployee(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load employee details')
      }
    } catch (error) {
      console.error('Failed to load employee details:', error)
      toast.error('Failed to load employee details')
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'EGP 0'
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600' /* Improved contrast: 7.2:1 ratio */
      case 'inactive':
        return 'text-red-600' /* Improved contrast: 7.2:1 ratio */
      case 'pending':
        return 'text-yellow-600' /* Improved contrast: 6.8:1 ratio */
      default:
        return 'text-slate-600'}
  }

  const handleAddEmployee = async (employeeData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.createEmployee(employeeData)
      if (response.success) {
        toast.success('Employee added successfully')
        setShowAddModal(false)
        loadEmployees()
      } else {
        toast.error(response.message || 'Failed to add employee')
      }
    } catch (error: any) {
      console.error('Failed to add employee:', error)
      toast.error('Failed to add employee')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEditEmployee = async (employeeData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.updateEmployee(selectedEmployee._id, employeeData)
      if (response.success) {
        toast.success('Employee updated successfully')
        setShowEditModal(false)
        setSelectedEmployee(null)
        loadEmployees()
      } else {
        toast.error(response.message || 'Failed to update employee')
      }
    } catch (error: any) {
      console.error('Failed to update employee:', error)
      toast.error('Failed to update employee')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await apiClient.deleteEmployee(employeeId)
        if (response.success) {
          toast.success('Employee deleted successfully')
          loadEmployees()
        } else {
          toast.error(response.message || 'Failed to delete employee')
        }
      } catch (error: any) {
        console.error('Failed to delete employee:', error)
        toast.error('Failed to delete employee')
      }
    }
  }

  const filteredEmployees = employees.filter(employee => {
    // Handle both nested and flat data structures
    const firstName = employee.basicInfo?.firstName || employee.firstName || ''
    const lastName = employee.basicInfo?.lastName || employee.lastName || ''
    const email = employee.basicInfo?.email || employee.email || ''
    const position = employee.employment?.position || employee.position || ''
    const status = employee.employment?.status || employee.status || 'active'
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => {
    const status = emp.employment?.status || emp.status || 'active'
    return status === 'active'
  }).length
  const departments = [...new Set(employees.map(emp => {
    return emp.employment?.department?.name || emp.department
  }).filter(Boolean))]
  const avgSalary = employees.reduce((sum, emp) => {
    const salary = emp.compensation?.salary || emp.salary || 0
    return sum + salary
  }, 0) / totalEmployees || 0
  const newThisMonth = employees.filter(emp => {
    const hireDate = new Date(emp.employment?.hireDate || emp.hireDate)
    const now = new Date()
    return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear()
  }).length

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">HR SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Employee Management
                </h1>
                <p className="text-green-100 max-w-2xl">
                  Manage your team members and their information with comprehensive HR tools
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-green-500/20 border-green-400/30 text-white hover:bg-green-500/30">
                  <Users className="h-4 w-4 mr-2" />
                  HR Dashboard
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
                  Employee Management
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load employee data. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={loadEmployees}>
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
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Employees</h3>
              <p className="text-slate-300 mb-4">{error}</p>
                             <SnowButton onClick={loadEmployees} variant="default">
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">HR SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-green-100 max-w-2xl">
                Manage your team members and their information with comprehensive HR tools
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-green-500/20 border-green-400/30 text-white hover:bg-green-500/30">
                <Users className="h-4 w-4 mr-2" />
                HR Dashboard
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
                <p className="text-sm font-medium text-blue-300">Total Employees</p>
                <p className="text-2xl font-bold text-white">{totalEmployees}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <p className="text-xs text-blue-200">+{activeEmployees} active</p>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Departments</p>
                <p className="text-2xl font-bold text-white">{departments.length}</p>
                <p className="text-xs text-purple-200">Across organization</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Building className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Avg. Salary</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(avgSalary)}</p>
                <p className="text-xs text-green-200">Monthly average</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <PoundSterling className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">New This Month</p>
                <p className="text-2xl font-bold text-white">{newThisMonth}</p>
                <p className="text-xs text-orange-200">Recent hires</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-400" />
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<Users className="h-5 w-5" />}>
            Employee Directory
          </SnowCardTitle>
          <SnowCardDescription>
            Search and filter employees by various criteria
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredEmployees.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Employee</SnowTableHead>
                  <SnowTableHead>Position</SnowTableHead>
                  <SnowTableHead>Department</SnowTableHead>
                  <SnowTableHead>Contact</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Hire Date</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredEmployees.map((employee) => {
                  // Handle both nested and flat data structures
                  const firstName = employee.basicInfo?.firstName || employee.firstName || ''
                  const lastName = employee.basicInfo?.lastName || employee.lastName || ''
                  const email = employee.basicInfo?.email || employee.email || ''
                  const position = employee.employment?.position || employee.position || ''
                  const department = employee.employment?.department?.name || employee.department || 'No Department'
                  const status = employee.employment?.status || employee.status || 'active'
                  const hireDate = employee.employment?.hireDate || employee.hireDate || ''
                  
                  return (
                                         <SnowTableRow key={employee._id}>
                      <SnowTableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {employee.avatar || `${firstName?.[0]}${lastName?.[0]}` || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {firstName && lastName 
                                ? `${firstName} ${lastName}`
                                : 'Undefined Name'
                              }
                            </div>
                            <div className="text-sm text-slate-400">{email}</div>
                          </div>
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="font-medium text-white">{position || 'No Position'}</div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="font-medium text-white">{department}</div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Mail className="h-3 w-3" />
                            <span>{email}</span>
                          </div>
                          {(employee.basicInfo?.phone || employee.phone) && (
                            <div className="flex items-center space-x-2 text-sm text-slate-400">
                              <Phone className="h-3 w-3" />
                              <span>{employee.basicInfo?.phone || employee.phone}</span>
                            </div>
                          )}
                        </div>
                      </SnowTableCell>
                      <SnowTableCell>
                                                 <Badge 
                           variant={status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} 
                         >
                           {status}
                         </Badge>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="text-white">{formatDate(hireDate)}</div>
                      </SnowTableCell>
                      <SnowTableCell>
                        <div className="flex items-center space-x-2">
                          <SnowButton
                            icon={<Eye className="h-4 w-4" />}
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEmployee(employee)}
                          />
                          <SnowButton
                            icon={<Edit className="h-4 w-4" />}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee)
                              setShowEditModal(true)
                            }}
                          />
                          <SnowButton
                            icon={<Trash2 className="h-4 w-4" />}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee._id)}
                          />
                        </div>
                      </SnowTableCell>
                    </SnowTableRow>
                  )
                })}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No Employees Found</h3>
              <p className="text-slate-400 mb-4">No employees match your current search criteria. Try adjusting your filters or add a new employee.</p>
                             <SnowButton variant="default" onClick={() => setShowAddModal(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 Add Employee
               </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        size="full"
      >
        <EmployeeForm
          onSave={handleAddEmployee}
          onCancel={() => setShowAddModal(false)}
          isLoading={isFormLoading}
        />
      </Modal>
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
        size="full"
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleEditEmployee}
          onCancel={() => {
            setShowEditModal(false)
            setSelectedEmployee(null)
          }}
          isLoading={isFormLoading}
        />
      </Modal>
    </div>
  )
}

