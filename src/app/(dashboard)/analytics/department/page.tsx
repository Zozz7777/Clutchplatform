'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  ShoppingCart,
  Megaphone,
  Settings
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export default function DepartmentAnalyticsPage() {
  const {
    departmentAnalytics,
    fetchHRAnalytics,
    fetchFinanceAnalytics,
    fetchSalesAnalytics,
    fetchMarketingAnalytics,
    fetchOperationsAnalytics,
    isLoading
  } = useStore()

  const [selectedDepartment, setSelectedDepartment] = useState('hr')

  useEffect(() => {
    fetchHRAnalytics()
    fetchFinanceAnalytics()
    fetchSalesAnalytics()
    fetchMarketingAnalytics()
    fetchOperationsAnalytics()
  }, [])

  const departments = [
    { id: 'hr', name: 'Human Resources', icon: Users, color: 'text-blue-600' },
    { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-green-600' },
    { id: 'sales', name: 'Sales', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'marketing', name: 'Marketing', icon: Megaphone, color: 'text-orange-600' },
    { id: 'operations', name: 'Operations', icon: Settings, color: 'text-red-600' }
  ]

  const mockAnalytics = {
    hr: {
      employeeMetrics: {
        totalEmployees: 89,
        activeEmployees: 87,
        newHires: 5,
        terminations: 2,
        turnoverRate: 8.5,
        averageTenure: 3.2
      },
      recruitmentMetrics: {
        openPositions: 12,
        applicationsReceived: 156,
        interviewsScheduled: 45,
        offersMade: 8,
        timeToHire: 23,
        costPerHire: 2500
      }
    },
    finance: {
      revenueMetrics: {
        totalRevenue: 2845000,
        monthlyRevenue: 285000,
        revenueGrowth: 12.5,
        profitMargin: 35.1
      },
      expenseMetrics: {
        totalExpenses: 1850000,
        monthlyExpenses: 185000,
        expenseGrowth: 8.2
      }
    },
    sales: {
      salesMetrics: {
        totalSales: 285000,
        monthlySales: 285000,
        salesGrowth: 15.2,
        averageDealSize: 28500
      },
      pipelineMetrics: {
        totalOpportunities: 45,
        pipelineValue: 1250000,
        conversionRate: 28.5,
        winRate: 65.2
      }
    },
    marketing: {
      campaignMetrics: {
        totalCampaigns: 8,
        activeCampaigns: 5,
        totalSpend: 45000,
        totalRevenue: 285000,
        roi: 533.3
      },
      leadMetrics: {
        totalLeads: 234,
        qualifiedLeads: 156,
        conversionRate: 66.7
      }
    },
    operations: {
      projectMetrics: {
        totalProjects: 156,
        activeProjects: 23,
        completedProjects: 133,
        successRate: 94.2,
        averageDuration: 45
      },
      resourceMetrics: {
        totalResources: 89,
        allocatedResources: 78,
        utilizationRate: 87.6
      }
    }
  }

  const analytics = departmentAnalytics || mockAnalytics
  const currentDept = analytics[selectedDepartment as keyof typeof analytics]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for each department
          </p>
        </div>
      </div>

      {/* Department Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {departments.map((dept) => {
          const Icon = dept.icon
          return (
            <SnowButton
              key={dept.id}
              variant={selectedDepartment === dept.id ? "default" : "outline"}
              onClick={() => setSelectedDepartment(dept.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Icon className={`h-4 w-4 ${selectedDepartment === dept.id ? 'text-white' : dept.color}`} />
              <span>{dept.name}</span>
            </SnowButton>
          )
        })}
      </div>

      {/* Department Analytics Content */}
      <motion.div
        key={selectedDepartment}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedDepartment === 'hr' && (
          <div className="space-y-6">
            {/* Employee Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Employees</SnowCardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.employeeMetrics.totalEmployees}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.employeeMetrics.activeEmployees} active
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">New Hires</SnowCardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold text-green-600">{currentDept.employeeMetrics.newHires}</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Turnover Rate</SnowCardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold text-red-600">{formatPercent(currentDept.employeeMetrics.turnoverRate)}</div>
                  <div className="text-xs text-muted-foreground">Annual rate</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Avg Tenure</SnowCardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.employeeMetrics.averageTenure} years</div>
                  <div className="text-xs text-muted-foreground">Company average</div>
                </SnowCardContent>
              </SnowCard>
            </div>

            {/* Recruitment Metrics */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Recruitment Metrics
                </SnowCardTitle>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Open Positions</div>
                    <div className="text-2xl font-bold">{currentDept.recruitmentMetrics.openPositions}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Applications</div>
                    <div className="text-2xl font-bold">{currentDept.recruitmentMetrics.applicationsReceived}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Time to Hire</div>
                    <div className="text-2xl font-bold">{currentDept.recruitmentMetrics.timeToHire} days</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Cost per Hire</div>
                    <div className="text-2xl font-bold">{formatCurrency(currentDept.recruitmentMetrics.costPerHire)}</div>
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        )}

        {selectedDepartment === 'finance' && (
          <div className="space-y-6">
            {/* Revenue Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Revenue</SnowCardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentDept.revenueMetrics.totalRevenue)}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {formatPercent(currentDept.revenueMetrics.revenueGrowth)}
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Monthly Revenue</SnowCardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentDept.revenueMetrics.monthlyRevenue)}</div>
                  <div className="text-xs text-muted-foreground">Current month</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Profit Margin</SnowCardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.revenueMetrics.profitMargin)}</div>
                  <div className="text-xs text-muted-foreground">Gross margin</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Monthly Expenses</SnowCardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(currentDept.expenseMetrics.monthlyExpenses)}</div>
                  <div className="flex items-center text-xs text-red-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {formatPercent(currentDept.expenseMetrics.expenseGrowth)}
                  </div>
                </SnowCardContent>
              </SnowCard>
            </div>
          </div>
        )}

        {selectedDepartment === 'sales' && (
          <div className="space-y-6">
            {/* Sales Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Sales</SnowCardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentDept.salesMetrics.totalSales)}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {formatPercent(currentDept.salesMetrics.salesGrowth)}
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Avg Deal Size</SnowCardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentDept.salesMetrics.averageDealSize)}</div>
                  <div className="text-xs text-muted-foreground">Per deal</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Pipeline Value</SnowCardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentDept.pipelineMetrics.pipelineValue)}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.pipelineMetrics.totalOpportunities} opportunities
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Win Rate</SnowCardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.pipelineMetrics.winRate)}</div>
                  <div className="text-xs text-muted-foreground">Conversion rate</div>
                </SnowCardContent>
              </SnowCard>
            </div>
          </div>
        )}

        {selectedDepartment === 'marketing' && (
          <div className="space-y-6">
            {/* Campaign Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Campaigns</SnowCardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.campaignMetrics.totalCampaigns}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.campaignMetrics.activeCampaigns} active
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Campaign ROI</SnowCardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.campaignMetrics.roi)}</div>
                  <div className="text-xs text-muted-foreground">Return on investment</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Leads</SnowCardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.leadMetrics.totalLeads}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.leadMetrics.qualifiedLeads} qualified
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Lead Conversion</SnowCardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.leadMetrics.conversionRate)}</div>
                  <div className="text-xs text-muted-foreground">Qualified to sales</div>
                </SnowCardContent>
              </SnowCard>
            </div>
          </div>
        )}

        {selectedDepartment === 'operations' && (
          <div className="space-y-6">
            {/* Project Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Total Projects</SnowCardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.projectMetrics.totalProjects}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.projectMetrics.activeProjects} active
                  </div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Success Rate</SnowCardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.projectMetrics.successRate)}</div>
                  <div className="text-xs text-muted-foreground">Project completion</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Avg Duration</SnowCardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{currentDept.projectMetrics.averageDuration} days</div>
                  <div className="text-xs text-muted-foreground">Per project</div>
                </SnowCardContent>
              </SnowCard>

              <SnowCard>
                <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <SnowCardTitle className="text-sm font-medium">Resource Utilization</SnowCardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </SnowCardHeader>
                <SnowCardContent>
                  <div className="text-2xl font-bold">{formatPercent(currentDept.resourceMetrics.utilizationRate)}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentDept.resourceMetrics.allocatedResources}/{currentDept.resourceMetrics.totalResources} allocated
                  </div>
                </SnowCardContent>
              </SnowCard>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

