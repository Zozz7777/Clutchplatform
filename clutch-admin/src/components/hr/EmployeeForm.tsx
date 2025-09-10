'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  PoundSterling, 
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { handleApiError, logError } from '@/utils/errorHandler'
import { validateEmployeeData } from '@/utils/dataValidator'

// Available roles for selection
const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'hr_manager', label: 'HR Manager', description: 'HR management and employee oversight' },
  { value: 'fleet_manager', label: 'Fleet Manager', description: 'Fleet and vehicle management' },
  { value: 'enterprise_manager', label: 'Enterprise Manager', description: 'Enterprise and white-label management' },
  { value: 'sales_manager', label: 'Sales Manager', description: 'Sales and CRM management' },
  { value: 'finance_manager', label: 'Finance Manager', description: 'Financial operations and reporting' },
  { value: 'marketing_manager', label: 'Marketing Manager', description: 'Marketing and campaign management' },
  { value: 'legal_manager', label: 'Legal Manager', description: 'Legal and compliance management' },
  { value: 'analytics', label: 'Analytics', description: 'Data analysis and reporting' },
  { value: 'management', label: 'Management', description: 'General management access' },
  { value: 'cto', label: 'CTO', description: 'Technical leadership and oversight' },
  { value: 'operations', label: 'Operations', description: 'Operational management' },
  { value: 'sales_rep', label: 'Sales Representative', description: 'Sales operations' },
  { value: 'analyst', label: 'Analyst', description: 'Data analysis' },
  { value: 'super_admin', label: 'Super Admin', description: 'Complete system control' },
  { value: 'partner_manager', label: 'Partner Manager', description: 'Partner relationship management' },
  { value: 'hr', label: 'HR Staff', description: 'HR operations' },
  { value: 'fleet_admin', label: 'Fleet Admin', description: 'Fleet administration' },
  { value: 'driver', label: 'Driver', description: 'Driver operations' },
  { value: 'accountant', label: 'Accountant', description: 'Accounting operations' },
  { value: 'employee', label: 'Employee', description: 'Basic employee access' },
  { value: 'manager', label: 'Manager', description: 'Team management' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
]

interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  position: string
  manager?: string
  hireDate: string
  salary?: number
  status: 'active' | 'inactive' | 'pending'
  roles: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  skills: string[]
  notes?: string
}

interface EmployeeFormProps {
  employee?: any
  onSave: (data: EmployeeFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function EmployeeForm({ employee, onSave, onCancel, isLoading = false }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    manager: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0,
    status: 'active',
    roles: ['employee'],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    skills: [],
    notes: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [departments, setDepartments] = useState<any[]>([])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    loadDepartments()
    if (employee) {
      setFormData({
        firstName: employee.firstName || employee.basicInfo?.firstName || '',
        lastName: employee.lastName || employee.basicInfo?.lastName || '',
        email: employee.email || employee.basicInfo?.email || '',
        phone: employee.phone || employee.basicInfo?.phone || '',
        department: employee.department || employee.employment?.department || '',
        position: employee.position || employee.employment?.position || '',
        manager: employee.manager || '',
        hireDate: employee.hireDate || employee.employment?.hireDate ? 
          new Date(employee.hireDate || employee.employment?.hireDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        salary: employee.salary || 0,
        status: employee.status || 'active',
        roles: employee.roles || [employee.role || 'employee'],
        emergencyContact: employee.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        address: employee.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        skills: employee.skills || [],
        notes: employee.notes || ''
      })
    }
  }, [employee])

  const loadDepartments = async () => {
    try {
      const response = await apiClient.getDepartments()
      if (response.success && response.data) {
        setDepartments(response.data)
      } else {
        const errorMessage = handleApiError(new Error(response.message || 'Failed to load departments'), 'load departments')
        toast.error(errorMessage)
        logError(new Error(response.message), 'loadDepartments', { response })
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'load departments')
      toast.error(errorMessage)
      logError(error, 'loadDepartments')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.department) {
      newErrors.department = 'Department is required'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required'
    }

    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required'
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be selected'
    }

    if (formData.salary && formData.salary < 0) {
      newErrors.salary = 'Salary cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    } else {
      toast.error('Please fix the errors in the form')
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const getRoleDescription = (role: string) => {
    const roleInfo = AVAILABLE_ROLES.find(r => r.value === role)
    return roleInfo?.description || 'No description available'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-8 text-white shadow-2xl">
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
                {employee ? 'Edit Employee' : 'Add New Employee'}
              </h1>
              <p className="text-purple-100 max-w-2xl">
                {employee ? 'Update employee information and roles' : 'Create a new employee with assigned roles and permissions'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-purple-500/20 border-purple-400/30 text-white hover:bg-purple-500/30">
                <User className="h-4 w-4 mr-2" />
                Employee Management
              </SnowButton>
            </div>
          </div>
        </div>
      </div>

      <SnowCard variant="dark">
        <SnowCardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-white font-medium">First Name *</Label>
                  <SnowInput
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    error={errors.firstName || undefined}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-white font-medium">Last Name *</Label>
                  <SnowInput
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    error={errors.lastName || undefined}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-white font-medium">Email *</Label>
                  <SnowInput
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email || undefined}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-white font-medium">Phone</Label>
                  <SnowInput
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Briefcase className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Employment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-white font-medium">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger className={`bg-slate-800 border-slate-700 text-white ${errors.department ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept.name} className="text-white hover:bg-slate-700">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="position" className="text-white font-medium">Position *</Label>
                  <SnowInput
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    error={errors.position || undefined}
                  />
                  {errors.position && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.position}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="hireDate" className="text-white font-medium">Hire Date *</Label>
                  <SnowInput
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                    error={errors.hireDate || undefined}
                  />
                  {errors.hireDate && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.hireDate}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="salary" className="text-white font-medium">Salary (EGP)</Label>
                  <SnowInput
                    id="salary"
                    type="number"
                    value={formData.salary?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                    error={errors.salary || undefined}
                  />
                  {errors.salary && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      {errors.salary}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="status" className="text-white font-medium">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active" className="text-white hover:bg-slate-700">Active</SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inactive</SelectItem>
                      <SelectItem value="pending" className="text-white hover:bg-slate-700">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Role Assignment</h3>
              </div>
              
              {errors.roles && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  {errors.roles}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role.value} className="flex items-start space-x-3 p-4 border border-slate-700 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Checkbox
                      id={role.value}
                      checked={formData.roles.includes(role.value)}
                      onCheckedChange={() => handleRoleToggle(role.value)}
                      className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <div className="space-y-1">
                      <Label htmlFor={role.value} className="text-sm font-medium cursor-pointer text-white">
                        {role.label}
                      </Label>
                      <p className="text-xs text-slate-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {formData.roles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-white font-medium">Selected Roles ({formData.roles.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {AVAILABLE_ROLES.find(r => r.value === role)?.label || role}
                        <SnowButton
                          type="button"
                          onClick={() => handleRoleToggle(role)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </SnowButton>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Skills</h3>
              </div>
              
              <div className="flex gap-3">
                <SnowInput
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1"
                />
                <SnowButton type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </SnowButton>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-500/20 text-green-400 border-green-500/30">
                      {skill}
                      <SnowButton
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </SnowButton>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Emergency Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="emergencyName" className="text-white font-medium">Contact Name</Label>
                  <SnowInput
                    id="emergencyName"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emergencyPhone" className="text-white font-medium">Contact Phone</Label>
                  <SnowInput
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emergencyRelationship" className="text-white font-medium">Relationship</Label>
                  <SnowInput
                    id="emergencyRelationship"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, relationship: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Address</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="street" className="text-white font-medium">Street Address</Label>
                  <SnowInput
                    id="street"
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, street: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="text-white font-medium">City</Label>
                  <SnowInput
                    id="city"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, city: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="state" className="text-white font-medium">State/Province</Label>
                  <SnowInput
                    id="state"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, state: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="zipCode" className="text-white font-medium">ZIP/Postal Code</Label>
                  <SnowInput
                    id="zipCode"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, zipCode: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="country" className="text-white font-medium">Country</Label>
                  <SnowInput
                    id="country"
                    value={formData.address?.country || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, country: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Additional Notes</h3>
              </div>
              <Textarea
                placeholder="Any additional notes about the employee..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-slate-500 focus:ring-slate-500"
              />
            </div>
            <div className="flex justify-end space-x-4 pt-8">
              <SnowButton type="button" variant="outline" onClick={onCancel}>
                Cancel
              </SnowButton>
              <SnowButton type="submit" variant="default"  loading={isLoading}>
                {isLoading ? 'Saving...' : (employee ? 'Update Employee' : 'Create Employee')}
              </SnowButton>
            </div>
          </form>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}


