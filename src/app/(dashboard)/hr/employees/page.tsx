'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { useHRStore } from '@/store'
import { formatDate } from '@/lib/utils'
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'

export default function EmployeesPage() {
  const { employees, isLoading, fetchEmployees } = useHRStore()
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clutch-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Employees
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark hover:from-clutch-red-dark hover:to-clutch-red">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SnowCard>
            <SnowCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SnowCard>
            <SnowCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{employees.filter(e => e.isActive).length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SnowCard>
            <SnowCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">{new Set(employees.map(e => e.department)).size}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SnowCard>
            <SnowCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <SnowInput
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <SnowButton variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </motion.div>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Employee List</SnowCardTitle>
            <SnowCardDescription>
              {filteredEmployees.length} employees found
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {filteredEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-clutch-red to-clutch-red-dark flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {employee.email}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {employee.department}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {employee.role}
                        </span>
                        {employee.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SnowButton variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </SnowButton>
                    <SnowButton variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </SnowButton>
                    <SnowButton variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </SnowButton>
                    <SnowButton variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </motion.div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </motion.div>
    </div>
  )
}

