'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { useProjectsStore } from '@/store'
import { formatDate } from '@/lib/utils'
import {
  Briefcase, Plus, Search, Filter, MoreHorizontal, Users, Calendar, Clock, CheckCircle, AlertCircle, Play, Pause, StopCircle, Settings, Edit, Trash2, BarChart3, Target, TrendingUp,
} from 'lucide-react'

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects } = useProjectsStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [priorityFilter, setPriorityFilter] = React.useState('all')

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'on_hold':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Briefcase className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'on_hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const totalProjects = filteredProjects.length
  const activeProjects = filteredProjects.filter(project => project.status === 'active').length
  const completedProjects = filteredProjects.filter(project => project.status === 'completed').length
  const averageProgress = totalProjects > 0 
    ? filteredProjects.reduce((sum, project) => sum + (project.progress || 0), 0) / totalProjects 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all projects</p>
        </div>
        <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Projects</SnowCardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Projects</SnowCardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Completed</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Avg Progress</SnowCardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{averageProgress.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Filters</SnowCardTitle>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SnowInput
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <SnowCard className="h-full hover:shadow-lg transition-shadow">
              <SnowCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <SnowCardTitle className="text-lg">{project.name}</SnowCardTitle>
                      <SnowCardDescription>{project.client}</SnowCardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    {getStatusIcon(project.status)}
                  </div>
                </div>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                <div className="space-y-2">
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Started: {formatDate(project.startDate)}</span>
                  </div>
                  {project.endDate && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(project.endDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-clutch-red to-clutch-red-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Team:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{project.teamSize || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span className="font-medium">{project.taskCount || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <SnowButton variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Details
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </SnowButton>
                </div>
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

