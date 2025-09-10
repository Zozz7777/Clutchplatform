'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
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
  Folder,
  Activity
} from 'lucide-react'
import { clutchApi } from '@/lib/api-service'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { handleApiError, logError } from '@/utils/errorHandler'
import { validateArrayResponse } from '@/utils/dataValidator'

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getProjects()
      const validation = validateArrayResponse(response, [])
      
      if (validation.isValid) {
        setProjects(validation.data || [])
      } else {
        setProjects([])
        const errorMessage = handleApiError(new Error(validation.error || 'Failed to load projects'), 'load projects')
        setError(errorMessage)
        toast.error(errorMessage)
        logError(new Error(validation.error), 'loadProjects', { response })
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'load projects')
      setError(errorMessage)
      setProjects([])
      toast.error(errorMessage)
      logError(error, 'loadProjects')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    if (!amount || isNaN(amount)) return `${currency} 0`
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: currency,
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
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'planning':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'paused':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-red-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.manager || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || project.status === filter
    return matchesSearch && matchesFilter
  })

  const handleAddProject = async () => {
    try {
      // Create a new project through API
      const newProject = {
        name: 'New Project',
        description: 'Project description',
        status: 'planning',
        priority: 'medium',
        client: 'Client Name',
        manager: 'Project Manager',
        budget: 10000,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      // Try to create via API first
      try {
        const response = await apiClient.post('/projects', newProject)
        if (response.success) {
          toast.success('Project created successfully')
          loadProjects() // Reload projects
          return
        }
      } catch (apiError) {
        console.error('API error for project creation:', apiError)
      }
      
      toast.error('Failed to create project')
    } catch (error) {
      console.error('Failed to add project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleEditProject = async (projectId: string) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      if (response.success) {
        toast.success(`Edit project ${projectId}`)
        // TODO: Open edit modal with project data
      } else {
        toast.error('Failed to load project details')
      }
    } catch (error) {
      console.error('Failed to edit project:', error)
      toast.error('Failed to edit project')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await apiClient.delete(`/projects/${projectId}`)
        if (response.success) {
          toast.success('Project deleted successfully')
          loadProjects() // Reload the list
        } else {
          toast.error('Failed to delete project')
        }
      } catch (error) {
        console.error('Failed to delete project:', error)
        toast.error('Failed to delete project')
      }
    }
  }

  const handleViewProject = async (projectId: string) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`)
      if (response.success) {
        toast.success(`Viewing project ${projectId}`)
        // TODO: Open view modal with project data
      } else {
        toast.error('Failed to load project details')
      }
    } catch (error) {
      console.error('Failed to view project:', error)
      toast.error('Failed to view project')
    }
  }

  const getProjectStats = () => {
    const stats = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      planning: projects.filter(p => p.status === 'planning').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0)
    }
    return stats
  }

  const projectStats = getProjectStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clutch-red"></div>
          <span>Loading projects...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading projects: {error}</p>
          <SnowButton onClick={loadProjects}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <SnowButton onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </SnowButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Projects</SnowCardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">In Progress</SnowCardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{projectStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Completed</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Budget</SnowCardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectStats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(projectStats.totalSpent)} spent
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Project Directory</SnowCardTitle>
          <SnowCardDescription>
            Search and filter projects by various criteria
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <SnowInput
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <SnowButton
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </SnowButton>
              <SnowButton
                variant={filter === 'planning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('planning')}
              >
                Planning
              </SnowButton>
              <SnowButton
                variant={filter === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('in_progress')}
              >
                In Progress
              </SnowButton>
              <SnowButton
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </SnowButton>
            </div>
          </div>
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No projects found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by creating your first project'
                  }
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <SnowCard key={project.id} className="hover:shadow-md transition-shadow">
                  <SnowCardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{project.name || 'Untitled Project'}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(project.status)}
                            <Badge className={getStatusColor(project.status)}>
                              {project.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                            <Badge className={getPriorityColor(project.priority)}>
                              {project.priority || 'Medium'}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {project.description || 'No description available'}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Client:</span>
                            <p className="font-medium">{project.client || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Manager:</span>
                            <p className="font-medium">{project.manager || 'Unassigned'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Budget:</span>
                            <p className="font-medium">
                              {formatCurrency(project.budget || 0, project.currency)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Progress:</span>
                            <p className="font-medium">{project.progress || 0}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Start: {formatDate(project.startDate)}</span>
                          </div>
                          {project.endDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>End: {formatDate(project.endDate)}</span>
                            </div>
                          )}
                          {project.team && project.team.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{project.team.length} team members</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProject(project.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </div>
                    {project.progress !== undefined && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-clutch-red h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </SnowCardContent>
                </SnowCard>
              ))
            )}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}




