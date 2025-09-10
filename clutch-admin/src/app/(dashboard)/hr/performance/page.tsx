'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  Plus,
  AlertCircle
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

// Default data for performance
const defaultPerformanceData: any[] = []
const defaultPerformanceSummary = {
  totalEmployees: 0,
  averageScore: 0,
  exceedsExpectations: 0,
  meetsExpectations: 0,
  needsImprovement: 0,
  reviewsCompleted: 0,
  reviewsPending: 0
}

export default function PerformancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [performanceSummary, setPerformanceSummary] = useState<any>(defaultPerformanceSummary)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Load performance data
      const performanceResponse = await apiClient.get('/hr/performance')
      if (performanceResponse.success && performanceResponse.data) {
        setPerformanceData(performanceResponse.data as any[])
      }

      // Load performance summary
      const summaryResponse = await apiClient.get('/hr/performance/summary')
      if (summaryResponse.success && summaryResponse.data) {
        setPerformanceSummary(summaryResponse.data as any)
      }
    } catch (error: any) {
      console.error('Failed to load performance data:', error)
      setError('Failed to load performance data')
      setPerformanceData(defaultPerformanceData)
      setPerformanceSummary(defaultPerformanceSummary)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPerformance = performanceData.filter(performance =>
    performance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performance.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Exceeds Expectations':
        return 'bg-green-100 text-green-800'
      case 'Meets Expectations':
        return 'bg-blue-100 text-blue-800'
      case 'Needs Improvement':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
          <p className="text-muted-foreground">
            Track employee performance, goals, and reviews
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </SnowButton>
          <SnowButton>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Review
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Average Score</SnowCardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
                            <div className="text-2xl font-bold">{performanceSummary.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              +2.3 from last quarter
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Exceeds Expectations</SnowCardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
                            <div className="text-2xl font-bold">{performanceSummary.exceedsExpectations}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((performanceSummary.exceedsExpectations / performanceSummary.totalEmployees) * 100)}% of employees
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Reviews Completed</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
                            <div className="text-2xl font-bold">{performanceSummary.reviewsCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  {performanceSummary.reviewsPending} pending
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Needs Improvement</SnowCardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
                            <div className="text-2xl font-bold">{performanceSummary.needsImprovement}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((performanceSummary.needsImprovement / performanceSummary.totalEmployees) * 100)}% of employees
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Employee Performance</SnowCardTitle>
              <SnowCardDescription>
                Current performance scores and metrics
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <SnowInput
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <SnowButton variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </SnowButton>
                <SnowButton variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </SnowButton>
              </div>
              <div className="space-y-4">
                {filteredPerformance.map((performance) => (
                  <SnowCard key={performance.id}>
                    <SnowCardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{performance.employeeName}</h3>
                            <p className="text-sm text-muted-foreground">{performance.position}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                ID: {performance.employeeId}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {performance.department}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{performance.overallScore}</div>
                            <div className="text-xs text-muted-foreground">
                              Overall Score
                            </div>
                          </div>
                          <Badge className={getStatusColor(performance.status)}>
                            {performance.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <SnowButton variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </SnowButton>
                            <SnowButton variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </SnowButton>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Productivity</span>
                            <span>{performance.metrics.productivity}%</span>
                          </div>
                          <Progress value={performance.metrics.productivity} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quality</span>
                            <span>{performance.metrics.quality}%</span>
                          </div>
                          <Progress value={performance.metrics.quality} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Teamwork</span>
                            <span>{performance.metrics.teamwork}%</span>
                          </div>
                          <Progress value={performance.metrics.teamwork} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Leadership</span>
                            <span>{performance.metrics.leadership}%</span>
                          </div>
                          <Progress value={performance.metrics.leadership} className="h-2" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>Goals: {performance.goalsCompleted}/{performance.goals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Next Review: {performance.nextReview}</span>
                        </div>
                      </div>
                    </SnowCardContent>
                  </SnowCard>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Performance Reviews</SnowCardTitle>
              <SnowCardDescription>
                Schedule and manage employee performance reviews
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming reviews scheduled</p>
                <SnowButton className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Review
                </SnowButton>
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>Goal Management</SnowCardTitle>
              <SnowCardDescription>
                Track employee goals and objectives
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active goals to display</p>
                <SnowButton className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </SnowButton>
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}



