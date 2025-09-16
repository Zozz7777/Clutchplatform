'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  PieChart, 
  LineChart,
  Table,
  Gauge,
  Calendar,
  Download,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Clock,
  Mail,
  Share2,
  Filter,
  Database,
  FileText,
  Layout,
  Zap
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'

export default function CustomReportsPage() {
  const {
    customReporting,
    fetchCustomReports,
    fetchReportTemplates,
    fetchCustomDashboards,
    fetchReportSchedules,
    fetchDataSources,
    fetchVisualizationTypes,
    createCustomReport,
    updateCustomReport,
    deleteCustomReport,
    createCustomDashboard,
    updateCustomDashboard,
    deleteCustomDashboard,
    createReportSchedule,
    updateReportSchedule,
    deleteReportSchedule,
    exportReport,
    generateReport,
    isLoading
  } = useStore()

  const [selectedTab, setSelectedTab] = useState('reports')
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [showCreateDashboard, setShowCreateDashboard] = useState(false)
  const [showScheduleReport, setShowScheduleReport] = useState(false)

  useEffect(() => {
    fetchCustomReports()
    fetchReportTemplates()
    fetchCustomDashboards()
    fetchReportSchedules()
    fetchDataSources()
    fetchVisualizationTypes()
  }, [])

  const mockCustomReporting = {
    reportBuilder: {
      templates: [
        {
          id: '1',
          name: 'Monthly Revenue Report',
          description: 'Comprehensive monthly revenue analysis with trends and forecasts',
          category: 'financial',
          dataSources: ['revenue', 'customers', 'products'],
          visualizations: [
            { type: 'line-chart', title: 'Revenue Trend', dataSource: 'revenue' },
            { type: 'bar-chart', title: 'Revenue by Product', dataSource: 'products' }
          ],
          isPublic: true,
          createdBy: 'John Doe',
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Customer Analytics Dashboard',
          description: 'Customer behavior and engagement metrics',
          category: 'customer',
          dataSources: ['customers', 'interactions', 'sales'],
          visualizations: [
            { type: 'pie-chart', title: 'Customer Segments', dataSource: 'customers' },
            { type: 'table', title: 'Customer List', dataSource: 'customers' }
          ],
          isPublic: true,
          createdBy: 'Jane Smith',
          createdAt: new Date('2024-02-20')
        }
      ],
      dataSources: [
        { id: '1', name: 'Revenue Data', type: 'database', connection: 'postgresql://revenue' },
        { id: '2', name: 'Customer Data', type: 'database', connection: 'postgresql://customers' },
        { id: '3', name: 'Sales Data', type: 'api', connection: 'api://sales' }
      ],
      visualizations: ['line-chart', 'bar-chart', 'pie-chart', 'table', 'gauge', 'heatmap']
    },
    dashboards: [
      {
        id: '1',
        name: 'Executive Overview',
        description: 'High-level business metrics for executives',
        layout: { columns: 3, rows: 2, grid: [] },
        widgets: [
          { id: '1', type: 'gauge', title: 'Revenue Target', config: { dataSource: 'revenue' } },
          { id: '2', type: 'line-chart', title: 'Growth Trend', config: { dataSource: 'revenue' } }
        ],
        isPublic: true,
        createdBy: 'Admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-04-15')
      }
    ],
    scheduling: [
      {
        id: '1',
        reportId: '1',
        name: 'Weekly Revenue Report',
        frequency: 'weekly',
        time: '09:00',
        dayOfWeek: 1,
        recipients: ['executives@clutch.com'],
        format: 'pdf',
        isActive: true,
        lastRun: new Date('2024-04-15T09:00:00'),
        nextRun: new Date('2024-04-22T09:00:00')
      }
    ]
  }

  const reporting = customReporting || mockCustomReporting

  const visualizationIcons = {
    'line-chart': LineChart,
    'bar-chart': BarChart3,
    'pie-chart': PieChart,
    'table': Table,
    'gauge': Gauge
  }

  const getVisualizationIcon = (type: string) => {
    const Icon = visualizationIcons[type as keyof typeof visualizationIcons] || BarChart3
    return <Icon className="h-4 w-4" />
  }

  const handleExportReport = async (id: string, format: 'pdf' | 'excel' | 'csv') => {
    await exportReport(id, format)
  }

  const handleGenerateReport = async (reportData: any) => {
    await generateReport(reportData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reporting</h1>
          <p className="text-muted-foreground">
            Create, manage, and schedule custom reports and dashboards
          </p>
        </div>
        <div className="flex space-x-2">
          <SnowButton onClick={() => setShowCreateReport(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </SnowButton>
          <SnowButton onClick={() => setShowCreateDashboard(true)} variant="outline">
            <Layout className="h-4 w-4 mr-2" />
            Create Dashboard
          </SnowButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { id: 'reports', name: 'Reports', icon: FileText },
          { id: 'dashboards', name: 'Dashboards', icon: Layout },
          { id: 'schedules', name: 'Schedules', icon: Calendar },
          { id: 'builder', name: 'Report Builder', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <SnowButton
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "ghost"}
              onClick={() => setSelectedTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </SnowButton>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {selectedTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Templates */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reporting.reportBuilder.templates.map((template) => (
                <SnowCard key={template.id} className="hover:shadow-lg transition-shadow">
                  <SnowCardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <SnowCardTitle className="text-lg">{template.name}</SnowCardTitle>
                        <SnowCardDescription className="mt-2">{template.description}</SnowCardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </SnowCardHeader>
                  <SnowCardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Visualizations:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.visualizations.map((viz, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs bg-muted px-2 py-1 rounded">
                              {getVisualizationIcon(viz.type)}
                              <span>{viz.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {template.createdBy}</span>
                        <span>{template.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <SnowButton size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </SnowButton>
                        <SnowButton size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </SnowButton>
                        <SnowButton size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </SnowButton>
                      </div>
                    </div>
                  </SnowCardContent>
                </SnowCard>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'dashboards' && (
          <div className="space-y-6">
            {/* Custom Dashboards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reporting.dashboards.map((dashboard) => (
                <SnowCard key={dashboard.id} className="hover:shadow-lg transition-shadow">
                  <SnowCardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <SnowCardTitle className="text-lg">{dashboard.name}</SnowCardTitle>
                        <SnowCardDescription className="mt-2">{dashboard.description}</SnowCardDescription>
                      </div>
                      <Badge variant={dashboard.isPublic ? "default" : "secondary"}>
                        {dashboard.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </SnowCardHeader>
                  <SnowCardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Widgets:</div>
                        <div className="flex flex-wrap gap-2">
                          {dashboard.widgets.map((widget) => (
                            <div key={widget.id} className="flex items-center space-x-1 text-xs bg-muted px-2 py-1 rounded">
                              {getVisualizationIcon(widget.type)}
                              <span>{widget.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {dashboard.createdBy}</span>
                        <span>Updated {dashboard.updatedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <SnowButton size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </SnowButton>
                        <SnowButton size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </SnowButton>
                        <SnowButton size="sm" variant="outline">
                          <Share2 className="h-3 w-3" />
                        </SnowButton>
                      </div>
                    </div>
                  </SnowCardContent>
                </SnowCard>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'schedules' && (
          <div className="space-y-6">
            {/* Report Schedules */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Scheduled Reports</h2>
              <SnowButton onClick={() => setShowScheduleReport(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Report
              </SnowButton>
            </div>
            
            <div className="space-y-4">
              {reporting.scheduling.map((schedule) => (
                <SnowCard key={schedule.id}>
                  <SnowCardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.frequency} at {schedule.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Next: {schedule.nextRun.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <SnowButton size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </SnowButton>
                          <SnowButton size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </SnowButton>
                        </div>
                      </div>
                    </div>
                  </SnowCardContent>
                </SnowCard>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'builder' && (
          <div className="space-y-6">
            {/* Report Builder */}
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Report Builder
                </SnowCardTitle>
                <SnowCardDescription>
                  Create custom reports with drag-and-drop visualization builder
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Data Sources */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Data Sources
                    </h3>
                    <div className="space-y-2">
                      {reporting.reportBuilder.dataSources.map((source) => (
                        <div key={source.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-muted-foreground">{source.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visualization Types */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Visualization Types
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {reporting.reportBuilder.visualizations.map((viz) => (
                        <div key={viz} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer text-center">
                          <div className="flex justify-center mb-2">
                            {getVisualizationIcon(viz)}
                          </div>
                          <div className="text-sm font-medium">{viz.replace('-', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <SnowButton className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Building Report
                  </SnowButton>
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        )}
      </motion.div>

      {/* Create Report Modal */}
      <Modal
        isOpen={showCreateReport}
        onClose={() => setShowCreateReport(false)}
        title="Create Custom Report"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report Name</label>
            <SnowInput placeholder="Enter report name" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <SnowInput placeholder="Enter report description" />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select className="w-full p-2 border rounded-md">
              <option>Financial</option>
              <option>Customer</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Operations</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <SnowButton variant="outline" onClick={() => setShowCreateReport(false)}>
              Cancel
            </SnowButton>
            <SnowButton onClick={() => setShowCreateReport(false)}>
              Create Report
            </SnowButton>
          </div>
        </div>
      </Modal>

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={showCreateDashboard}
        onClose={() => setShowCreateDashboard(false)}
        title="Create Custom Dashboard"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Dashboard Name</label>
            <SnowInput placeholder="Enter dashboard name" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <SnowInput placeholder="Enter dashboard description" />
          </div>
          <div>
            <label className="text-sm font-medium">Layout</label>
            <select className="w-full p-2 border rounded-md">
              <option>2x2 Grid</option>
              <option>3x2 Grid</option>
              <option>4x3 Grid</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <SnowButton variant="outline" onClick={() => setShowCreateDashboard(false)}>
              Cancel
            </SnowButton>
            <SnowButton onClick={() => setShowCreateDashboard(false)}>
              Create Dashboard
            </SnowButton>
          </div>
        </div>
      </Modal>

      {/* Schedule Report Modal */}
      <Modal
        isOpen={showScheduleReport}
        onClose={() => setShowScheduleReport(false)}
        title="Schedule Report"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report</label>
            <select className="w-full p-2 border rounded-md">
              <option>Monthly Revenue Report</option>
              <option>Customer Analytics Dashboard</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Schedule Name</label>
            <SnowInput placeholder="Enter schedule name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <select className="w-full p-2 border rounded-md">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <SnowInput type="time" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Recipients</label>
            <SnowInput placeholder="Enter email addresses" />
          </div>
          <div className="flex justify-end space-x-2">
            <SnowButton variant="outline" onClick={() => setShowScheduleReport(false)}>
              Cancel
            </SnowButton>
            <SnowButton onClick={() => setShowScheduleReport(false)}>
              Schedule Report
            </SnowButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

