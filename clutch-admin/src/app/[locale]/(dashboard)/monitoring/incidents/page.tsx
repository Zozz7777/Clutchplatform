'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  MessageSquare,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'

export default function IncidentManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const incidentMetrics = [
    {
      name: 'Active Incidents',
      value: '3',
      change: '-2',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'Resolved Today',
      value: '12',
      change: '+3',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Avg Resolution Time',
      value: '2.3h',
      change: '-0.5h',
      trend: 'down',
      status: 'good'
    },
    {
      name: 'MTTR',
      value: '1.8h',
      change: '-0.3h',
      trend: 'down',
      status: 'good'
    }
  ]

  const incidents = [
    {
      id: 'INC-2024-001',
      title: 'API Gateway High Response Time',
      description: 'API Gateway experiencing increased response times affecting user experience',
      status: 'investigating',
      priority: 'high',
      severity: 'P2',
      assignee: 'Sarah Johnson',
      reporter: 'System Monitor',
      createdAt: '2 hours ago',
      updatedAt: '30 minutes ago',
      affectedServices: ['API Gateway', 'Authentication'],
      impact: 'Users experiencing slow API responses'
    },
    {
      id: 'INC-2024-002',
      title: 'Database Connection Pool Exhaustion',
      description: 'Database connection pool reaching maximum capacity',
      status: 'in_progress',
      priority: 'critical',
      severity: 'P1',
      assignee: 'Tom Brown',
      reporter: 'Database Monitor',
      createdAt: '4 hours ago',
      updatedAt: '1 hour ago',
      affectedServices: ['Database', 'API Gateway'],
      impact: 'Some users unable to access the system'
    },
    {
      id: 'INC-2024-003',
      title: 'Mobile App Push Notifications Failing',
      description: 'Push notifications not being delivered to mobile app users',
      status: 'resolved',
      priority: 'medium',
      severity: 'P3',
      assignee: 'Emily Davis',
      reporter: 'Mobile Team',
      createdAt: '1 day ago',
      updatedAt: '2 hours ago',
      affectedServices: ['Mobile App', 'Push Service'],
      impact: 'Users not receiving important notifications'
    }
  ]

  const incidentTimeline = [
    {
      id: 1,
      incidentId: 'INC-2024-001',
      action: 'Incident created',
      user: 'System Monitor',
      timestamp: '2 hours ago',
      type: 'created'
    },
    {
      id: 2,
      incidentId: 'INC-2024-001',
      action: 'Assigned to Sarah Johnson',
      user: 'System Admin',
      timestamp: '1 hour 45 minutes ago',
      type: 'assigned'
    },
    {
      id: 3,
      incidentId: 'INC-2024-001',
      action: 'Status changed to Investigating',
      user: 'Sarah Johnson',
      timestamp: '1 hour 30 minutes ago',
      type: 'status_change'
    },
    {
      id: 4,
      incidentId: 'INC-2024-001',
      action: 'Added comment: Checking API Gateway logs',
      user: 'Sarah Johnson',
      timestamp: '30 minutes ago',
      type: 'comment'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'investigating': return 'text-yellow-600 bg-yellow-100'
      case 'good': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P1': return 'text-red-600 bg-red-100'
      case 'P2': return 'text-orange-600 bg-orange-100'
      case 'P3': return 'text-yellow-600 bg-yellow-100'
      case 'P4': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Management</h1>
          <p className="text-muted-foreground">
            Track and manage system incidents and outages
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Incident Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {incidentMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {metric.change} from yesterday
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="investigating">Investigating</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{incident.title}</h3>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(incident.priority)}>
                      {incident.priority}
                    </Badge>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{incident.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>ID: {incident.id}</span>
                    <span>Assignee: {incident.assignee}</span>
                    <span>Reporter: {incident.reporter}</span>
                    <span>Created: {incident.createdAt}</span>
                    <span>Updated: {incident.updatedAt}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Affected Services</h4>
                  <div className="flex flex-wrap gap-1">
                    {incident.affectedServices.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Impact</h4>
                  <p className="text-sm text-muted-foreground">{incident.impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incident Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incident Activity</CardTitle>
          <CardDescription>
            Latest updates and actions on incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidentTimeline.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  event.type === 'created' ? 'bg-red-100' :
                  event.type === 'assigned' ? 'bg-blue-100' :
                  event.type === 'status_change' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {event.type === 'created' ? 
                    <AlertTriangle className="h-4 w-4 text-red-600" /> :
                    event.type === 'assigned' ? 
                    <Users className="h-4 w-4 text-blue-600" /> :
                    event.type === 'status_change' ? 
                    <Activity className="h-4 w-4 text-yellow-600" /> :
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.action}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {event.incidentId}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {event.user}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident Management Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Management Summary</CardTitle>
          <CardDescription>
            Key metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Resolution Rate</h3>
              <p className="text-sm text-muted-foreground">Incidents resolved</p>
              <p className="text-2xl font-bold text-green-600">94%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Avg Resolution Time</h3>
              <p className="text-sm text-muted-foreground">Mean time to resolve</p>
              <p className="text-2xl font-bold text-blue-600">2.3h</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Active Incidents</h3>
              <p className="text-sm text-muted-foreground">Currently open</p>
              <p className="text-2xl font-bold text-purple-600">3</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Incident Management Best Practices</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Maintain clear communication during incidents</li>
              <li>• Document all actions and decisions</li>
              <li>• Conduct post-incident reviews for learning</li>
              <li>• Implement preventive measures based on incident patterns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
