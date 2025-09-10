'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { handleApiError, logError } from '@/utils/errorHandler'
import { validateArrayResponse, validateObjectResponse } from '@/utils/dataValidator'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
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
  CreditCard,
  Banknote,
  Wallet,
  Receipt,
  Activity,
  Upload,
  Download
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<any[]>([])
  const [payrollSummary, setPayrollSummary] = useState<any>({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    pendingPayments: 0,
    processedPayments: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadPayrollData()
    loadPayrollSummary()
  }, [currentPage, selectedStatus])

  const loadPayrollData = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      }
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus
      }

      const response = await apiClient.getPayroll(params)
      const validation = validateArrayResponse(response, [])
      
      if (validation.isValid) {
        setPayrollData(validation.data || [])
        setTotalPages(response.pagination?.totalPages || 1)
      } else {
        const errorMessage = handleApiError(new Error(validation.error || 'Failed to load payroll data'), 'load payroll data')
        toast.error(errorMessage)
        setPayrollData([])
        logError(new Error(validation.error), 'loadPayrollData', { response, params })
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'load payroll data')
      toast.error(errorMessage)
      setPayrollData([])
      logError(error, 'loadPayrollData')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPayrollSummary = async () => {
    try {
      const response = await apiClient.getPayrollSummary()
      const validation = validateObjectResponse(response, {
        totalEmployees: 0,
        totalPayroll: 0,
        averageSalary: 0,
        pendingPayments: 0,
        processedPayments: 0
      })
      
      if (validation.isValid) {
        setPayrollSummary(validation.data)
      } else {
        logError(new Error(validation.error), 'loadPayrollSummary', { response })
      }
    } catch (error: any) {
      logError(error, 'loadPayrollSummary')
    }
  }

  const filteredPayroll = payrollData.filter(payroll =>
    payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage employee salaries, bonuses, and payments
          </p>
        </div>
                 <div className="flex gap-2">
           <SnowButton variant="outline">
             <Upload className="mr-2 h-4 w-4" />
             Import Data
           </SnowButton>
           <SnowButton>
             <Download className="mr-2 h-4 w-4" />
             Export Payroll
           </SnowButton>
         </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<PoundSterling className="h-5 w-5" />}>Total Payroll</SnowCardTitle>
            <SnowCardDescription>This month's total payroll</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{formatCurrency(payrollSummary.totalPayroll)}</div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<Users className="h-5 w-5" />}>Total Employees</SnowCardTitle>
            <SnowCardDescription>Active employees</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{payrollSummary.totalEmployees}</div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<PoundSterling className="h-5 w-5" />}>Average Salary</SnowCardTitle>
            <SnowCardDescription>Monthly average</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{formatCurrency(payrollSummary.averageSalary)}</div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardHeader>
            <SnowCardTitle icon={<Clock className="h-5 w-5" />}>Pending Payments</SnowCardTitle>
            <SnowCardDescription>Awaiting processing</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-3xl font-bold">{payrollSummary.pendingPayments}</div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Payroll Records</SnowCardTitle>
          <SnowCardDescription>
            View and manage employee payroll information
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <SnowInput
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <SnowButton
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </SnowButton>
              <SnowButton
                variant={selectedStatus === 'paid' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('paid')}
              >
                Paid
              </SnowButton>
              <SnowButton
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('pending')}
              >
                Pending
              </SnowButton>
              <SnowButton
                variant={selectedStatus === 'processing' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('processing')}
              >
                Processing
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
                  <div className="col-span-3">Employee</div>
                  <div className="col-span-2">Position</div>
                  <div className="col-span-2">Base Salary</div>
                  <div className="col-span-1">Bonus</div>
                  <div className="col-span-1">Deductions</div>
                  <div className="col-span-2">Net Pay</div>
                  <div className="col-span-1">Status</div>
                </div>
                
                {filteredPayroll.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No payroll records found
                  </div>
                ) : (
                  filteredPayroll.map((payroll) => (
                    <div key={payroll._id} className="grid grid-cols-12 gap-4 p-4 border-t items-center">
                      <div className="col-span-3">
                        <div className="font-medium">{payroll.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{payroll.employeeId}</div>
                      </div>
                      <div className="col-span-2 text-sm">{payroll.position}</div>
                      <div className="col-span-2 text-sm">{formatCurrency(payroll.baseSalary)}</div>
                      <div className="col-span-1 text-sm">{formatCurrency(payroll.bonus || 0)}</div>
                      <div className="col-span-1 text-sm">{formatCurrency(payroll.deductions || 0)}</div>
                      <div className="col-span-2 font-medium">{formatCurrency(payroll.netPay)}</div>
                      <div className="col-span-1">
                        <Badge className={getStatusColor(payroll.status)}>
                          {payroll.status}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Payroll</SnowCardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-green-600">{payrollSummary.processedPayments}</span> processed
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Employees</SnowCardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{payrollSummary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-green-600">{payrollSummary.processedPayments}</span> processed
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Average Salary</SnowCardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.averageSalary)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Payment Status</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{payrollSummary.processedPayments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-green-600">{payrollSummary.processedPayments}</span> processed,{' '}
              <span className="font-medium text-yellow-600">{payrollSummary.pendingPayments}</span> pending
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}



