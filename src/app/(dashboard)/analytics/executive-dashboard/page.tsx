'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Briefcase, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export default function ExecutiveDashboardPage() {
  const {
    executiveDashboard,
    businessAlerts,
    fetchExecutiveDashboard,
    fetchKeyPerformanceIndicators,
    fetchBusinessTrends,
    fetchBusinessAlerts,
    markAlertAsRead,
    isLoading
  } = useStore()

  const [selectedPeriod, setSelectedPeriod] = useState('12months')

  useEffect(() => {
    fetchExecutiveDashboard()
    fetchKeyPerformanceIndicators()
    fetchBusinessTrends(selectedPeriod)
    fetchBusinessAlerts()
  }, [selectedPeriod])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      case 'high':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
    }
  }

  const mockDashboard = {
    overview: {
      totalRevenue: 2845000,
      totalCustomers: 1247,
      totalEmployees: 89,
      totalProjects: 156,
      revenueGrowth: 12.5,
      customerGrowth: 8.3,
      employeeGrowth: 5.2,
      projectSuccessRate: 94.2
    },
    kpis: {
      financial: {
        monthlyRevenue: 285000,
        monthlyExpenses: 185000,
        profitMargin: 35.1,
        cashFlow: 125000,
        outstandingInvoices: 45000,
        averagePaymentTime: 28
      },
      operational: {
        projectCompletionRate: 94.2,
        averageProjectDuration: 45,
        resourceUtilization: 87.5,
        taskCompletionRate: 91.8,
        customerSatisfaction: 4.7,
        employeeProductivity: 88.3
      },
      customer: {
        customerAcquisitionCost: 1250,
        customerLifetimeValue: 8500,
        customerRetentionRate: 92.1,
        averageOrderValue: 2850,
        customerSatisfactionScore: 4.7,
        netPromoterScore: 72
      },
      employee: {
        employeeTurnoverRate: 8.5,
        averageTimeToHire: 23,
        employeeSatisfaction: 4.6,
        trainingCompletionRate: 94.8,
        performanceRating: 4.3,
        absenteeismRate: 2.1
      }
    },
    trends: {
      revenue: [
        { date: '2024-01', value: 250000, change: 15000, changePercent: 6.4 },
        { date: '2024-02', value: 265000, change: 15000, changePercent: 6.0 },
        { date: '2024-03', value: 280000, change: 15000, changePercent: 5.7 },
        { date: '2024-04', value: 285000, change: 5000, changePercent: 1.8 }
      ],
      customers: [
        { date: '2024-01', value: 1150, change: 50, changePercent: 4.5 },
        { date: '2024-02', value: 1180, change: 30, changePercent: 2.6 },
        { date: '2024-03', value: 1215, change: 35, changePercent: 3.0 },
        { date: '2024-04', value: 1247, change: 32, changePercent: 2.6 }
      ]
    }
  }

  const mockAlerts = [
    {
      id: '1',
      type: 'warning',
      title: 'High Resource Utilization',
      message: 'Resource utilization has reached 87.5%, consider scaling up.',
      severity: 'medium',
      category: 'operational',
      timestamp: new Date('2024-04-15T10:30:00'),
      isRead: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'success',
      title: 'Revenue Target Achieved',
      message: 'Monthly revenue target exceeded by 12.5%.',
      severity: 'low',
      category: 'financial',
      timestamp: new Date('2024-04-14T16:45:00'),
      isRead: false,
      actionRequired: false
    },
    {
      id: '3',
      type: 'error',
      title: 'Customer Churn Alert',
      message: 'Customer churn rate increased to 7.9% this month.',
      severity: 'high',
      category: 'customer',
      timestamp: new Date('2024-04-13T09:15:00'),
      isRead: false,
      actionRequired: true
    }
  ]

  const dashboard = executiveDashboard || mockDashboard
  const alerts = businessAlerts.length > 0 ? businessAlerts : mockAlerts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of business performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod('3months')}
            className={selectedPeriod === '3months' ? 'bg-primary text-primary-foreground' : ''}
          >
            3M
          </SnowButton>
          <SnowButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod('6months')}
            className={selectedPeriod === '6months' ? 'bg-primary text-primary-foreground' : ''}
          >
            6M
          </SnowButton>
          <SnowButton
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod('12months')}
            className={selectedPeriod === '12months' ? 'bg-primary text-primary-foreground' : ''}
          >
            12M
          </SnowButton>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SnowCard>
            <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SnowCardTitle className="text-sm font-medium">Total Revenue</SnowCardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboard.overview.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboard.overview.revenueGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                {formatPercent(Math.abs(dashboard.overview.revenueGrowth))} from last month
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SnowCard>
            <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SnowCardTitle className="text-sm font-medium">Total Customers</SnowCardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboard.overview.totalCustomers)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboard.overview.customerGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                {formatPercent(Math.abs(dashboard.overview.customerGrowth))} from last month
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SnowCard>
            <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SnowCardTitle className="text-sm font-medium">Total Employees</SnowCardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboard.overview.totalEmployees)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {dashboard.overview.employeeGrowth > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                {formatPercent(Math.abs(dashboard.overview.employeeGrowth))} from last month
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <SnowCard>
            <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SnowCardTitle className="text-sm font-medium">Project Success Rate</SnowCardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-2xl font-bold">{formatPercent(dashboard.overview.projectSuccessRate)}</div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(dashboard.overview.totalProjects)} total projects
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial KPIs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial KPIs
              </SnowCardTitle>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Monthly Revenue</span>
                <span className="font-medium">{formatCurrency(dashboard.kpis.financial.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Profit Margin</span>
                <span className="font-medium">{formatPercent(dashboard.kpis.financial.profitMargin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cash Flow</span>
                <span className="font-medium">{formatCurrency(dashboard.kpis.financial.cashFlow)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Outstanding Invoices</span>
                <span className="font-medium">{formatCurrency(dashboard.kpis.financial.outstandingInvoices)}</span>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        {/* Operational KPIs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Operational KPIs
              </SnowCardTitle>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Project Completion</span>
                <span className="font-medium">{formatPercent(dashboard.kpis.operational.projectCompletionRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resource Utilization</span>
                <span className="font-medium">{formatPercent(dashboard.kpis.operational.resourceUtilization)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-medium">{dashboard.kpis.operational.customerSatisfaction}/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Employee Productivity</span>
                <span className="font-medium">{formatPercent(dashboard.kpis.operational.employeeProductivity)}</span>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>

        {/* Customer KPIs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer KPIs
              </SnowCardTitle>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Customer Retention</span>
                <span className="font-medium">{formatPercent(dashboard.kpis.customer.customerRetentionRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lifetime Value</span>
                <span className="font-medium">{formatCurrency(dashboard.kpis.customer.customerLifetimeValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Order Value</span>
                <span className="font-medium">{formatCurrency(dashboard.kpis.customer.averageOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Net Promoter Score</span>
                <span className="font-medium">{dashboard.kpis.customer.netPromoterScore}</span>
              </div>
            </SnowCardContent>
          </SnowCard>
        </motion.div>
      </div>

      {/* Business Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Business Trends
            </SnowCardTitle>
            <SnowCardDescription>
              Revenue and customer growth over the selected period
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {dashboard.trends.revenue.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{trend.date}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(trend.value)}</div>
                    <div className={`text-sm flex items-center ${
                      trend.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend.changePercent > 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(Math.abs(trend.changePercent))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </motion.div>

      {/* Business Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Business Alerts
            </SnowCardTitle>
            <SnowCardDescription>
              Important notifications and alerts requiring attention
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} ${
                    !alert.isRead ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {!alert.isRead && (
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => markAlertAsRead(alert.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Mark as read
                      </SnowButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </motion.div>
    </div>
  )
}

