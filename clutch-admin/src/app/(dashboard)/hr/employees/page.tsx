'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Building,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import SimpleChart from '@/components/charts/simple-chart'
import { toast } from 'sonner'

// Employee Card Component
const EmployeeCard = ({ employee, index }: { employee: any, index: number }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'engineering':
        return 'clutch-blue'
      case 'sales':
        return 'clutch-green'
      case 'marketing':
        return 'clutch-purple'
      case 'hr':
        return 'clutch-orange'
      case 'finance':
        return 'clutch-red'
      default:
        return 'clutch-gray'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <SnowCard className="transition-all duration-200 hover:shadow-lg">
        <SnowCardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-clutch-red-500 to-clutch-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {employee.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-clutch-gray-900">{employee.name}</h3>
                <p className="text-sm text-clutch-gray-600">{employee.position}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(employee.status)} border`}>
                {employee.status}
              </Badge>
              <SnowButton variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </SnowButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-clutch-gray-400" />
              <span className="text-sm text-clutch-gray-600">{employee.department}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-clutch-gray-400" />
              <span className="text-sm text-clutch-gray-600">{employee.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-clutch-gray-400" />
              <span className="text-sm text-clutch-gray-600">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-clutch-gray-400" />
              <span className="text-sm text-clutch-gray-600">{employee.phone}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-clutch-gray-500">Experience</p>
                <p className="text-sm font-semibold text-clutch-gray-900">{employee.experience}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-clutch-gray-500">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-clutch-gray-900">{employee.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SnowButton variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </SnowButton>
              <SnowButton variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </motion.div>
  )
}

// HR Metrics Component
const HRMetrics = () => {
  const metrics = [
    { title: 'Total Employees', value: 245, change: 5.2, trend: 'up', icon: Users, color: 'clutch-blue' },
    { title: 'New Hires', value: 12, change: 15.3, trend: 'up', icon: UserPlus, color: 'clutch-green' },
    { title: 'Departures', value: 3, change: -25.0, trend: 'down', icon: TrendingDown, color: 'clutch-red' },
    { title: 'Active Projects', value: 18, change: 8.7, trend: 'up', icon: Target, color: 'clutch-purple' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <SnowCard className={`transition-all duration-200 hover:shadow-lg border-l-4 border-l-${metric.color}-500`}>
            <SnowCardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <metric.icon className={`h-5 w-5 text-${metric.color}-500`} />
                <p className="text-sm font-medium text-clutch-gray-600">{metric.title}</p>
              </div>
              
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-clutch-gray-900">
                  {formatNumber(metric.value)}
                </h3>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>
      ))}
    </div>
  )
}

export default function HREmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Mock employee data
  const employees = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'New York',
      email: 'sarah.johnson@clutch.com',
      phone: '+1 (555) 123-4567',
      status: 'Active',
      experience: '5 years',
      rating: 4.8,
      joinDate: '2022-03-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'Sales Manager',
      department: 'Sales',
      location: 'San Francisco',
      email: 'michael.chen@clutch.com',
      phone: '+1 (555) 234-5678',
      status: 'Active',
      experience: '7 years',
      rating: 4.9,
      joinDate: '2021-08-22'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      position: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Los Angeles',
      email: 'emily.rodriguez@clutch.com',
      phone: '+1 (555) 345-6789',
      status: 'On Leave',
      experience: '3 years',
      rating: 4.6,
      joinDate: '2023-01-10'
    },
    {
      id: 4,
      name: 'David Thompson',
      position: 'HR Director',
      department: 'HR',
      location: 'Chicago',
      email: 'david.thompson@clutch.com',
      phone: '+1 (555) 456-7890',
      status: 'Active',
      experience: '10 years',
      rating: 4.7,
      joinDate: '2020-05-18'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      position: 'Financial Analyst',
      department: 'Finance',
      location: 'Boston',
      email: 'lisa.wang@clutch.com',
      phone: '+1 (555) 567-8901',
      status: 'Active',
      experience: '4 years',
      rating: 4.9,
      joinDate: '2022-11-03'
    },
    {
      id: 6,
      name: 'James Wilson',
      position: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Seattle',
      email: 'james.wilson@clutch.com',
      phone: '+1 (555) 678-9012',
      status: 'Active',
      experience: '6 years',
      rating: 4.8,
      joinDate: '2021-12-07'
    }
  ]

  const departments = ['all', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance']
  const statuses = ['all', 'Active', 'Inactive', 'On Leave']

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Employee data refreshed')
  }

  const handleExport = () => {
    toast.success('Exporting employee data...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-clutch-gray-900">Employee Management</h1>
          <p className="text-clutch-gray-600 mt-1">
            Manage your workforce and track employee performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <SnowButton
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </SnowButton>
          <SnowButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </SnowButton>
          <SnowButton>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </SnowButton>
        </div>
      </motion.div>

      {/* HR Metrics */}
      <HRMetrics />

      {/* Filters and Search */}
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-clutch-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-clutch-gray-300 rounded-lg focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-clutch-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-clutch-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee, index) => (
          <EmployeeCard key={employee.id} employee={employee} index={index} />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <SnowCard>
          <SnowCardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-clutch-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-clutch-gray-900 mb-2">No employees found</h3>
            <p className="text-clutch-gray-600 mb-4">
              Try adjusting your search criteria or add a new employee.
            </p>
            <SnowButton>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}