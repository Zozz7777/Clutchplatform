'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Tablet,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Wifi,
  Activity,
  Plus,
  Edit,
  RefreshCw,
  XCircle,
  Trash2
} from 'lucide-react'


interface UserSession {
  _id: string
  userId: string
  userName: string
  userEmail: string
  deviceType: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  location: string
  status: string
  lastActivity: string
  loginTime: string
  isCurrentSession: boolean
  userAgent: string
  sessionDuration: number
}

interface SecurityMetric {
  metric: string
  value: number
  change: number
  changePercent: number
  trend: string
}

export default function SecuritySessionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDevice, setSelectedDevice] = useState('all')
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  
  const queryClient = useQueryClient()

  // Fetch sessions with React Query
  const { data: sessionsResponse, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['security-sessions', selectedStatus, selectedDevice, searchTerm],
    queryFn: () => apiClient.get(`/security/sessions?status=${selectedStatus}&device=${selectedDevice}&search=${encodeURIComponent(searchTerm)}`),
    staleTime: 30 * 1000, // 30 seconds
  })

  // Fetch security metrics
  const { data: metricsResponse, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: () => apiClient.get('/security/metrics'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const sessions: UserSession[] = Array.isArray(sessionsResponse) ? sessionsResponse : (sessionsResponse?.data as UserSession[]) || []
  const metrics: SecurityMetric[] = Array.isArray(metricsResponse) ? metricsResponse : (metricsResponse?.data as SecurityMetric[]) || []

  // Mutations for session actions
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.put(`/security/sessions/${sessionId}/revoke`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-sessions'] })
      toast.success('Session revoked successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session')
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.delete(`/security/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-sessions'] })
      toast.success('Session deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete session')
    },
  })

  const handleViewSession = (session: UserSession) => {
    setSelectedSession(session)
    setShowViewModal(true)
  }

  const handleRevokeSession = (session: UserSession) => {
    if (confirm(`Are you sure you want to revoke this session?`)) {
      revokeSessionMutation.mutate(session._id)
    }
  }

  const handleDeleteSession = (session: UserSession) => {
    if (confirm(`Are you sure you want to delete this session? This action cannot be undone.`)) {
      deleteSessionMutation.mutate(session._id)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Laptop className="h-4 w-4" />
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspicious': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'suspicious': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'inactive': return <Clock className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-red-500" />
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
  }

  const handleDeviceFilter = (device: string) => {
    setSelectedDevice(device)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage user sessions and security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Security Report
          </Button>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Live Monitor
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric: SecurityMetric) => (
          <Card key={metric.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change > 0 ? '+' : ''}{metric.change} ({metric.changePercent}%) from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Monitor user sessions and security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('all')}
              >
                All Status
              </Button>
              <Button
                variant={selectedStatus === 'active' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={selectedStatus === 'suspicious' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('suspicious')}
              >
                Suspicious
              </Button>
              <Button
                variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => handleStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedDevice === 'all' ? 'default' : 'outline'}
                onClick={() => handleDeviceFilter('all')}
              >
                All Devices
              </Button>
              <Button
                variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                onClick={() => handleDeviceFilter('desktop')}
              >
                Desktop
              </Button>
              <Button
                variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                onClick={() => handleDeviceFilter('mobile')}
              >
                Mobile
              </Button>
            </div>
          </div>
          {sessionsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sessionsError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load sessions: {sessionsError.message}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm bg-muted/50">
                  <div className="col-span-2">User</div>
                  <div className="col-span-2">Device</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Session Info</div>
                  <div className="col-span-2">Activity</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No sessions found
                  </div>
                ) : (
                  sessions.map((session: UserSession) => (
                    <div key={session._id} className="grid grid-cols-12 gap-4 p-4 border-t items-center">
                      <div className="col-span-2">
                        <div className="font-medium">{session.userName}</div>
                        <div className="text-sm text-muted-foreground">{session.userEmail}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <div>
                            <div className="text-sm font-medium">{session.deviceName}</div>
                            <div className="text-xs text-muted-foreground">{session.browser} on {session.os}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{session.location}</div>
                            <div className="text-xs text-muted-foreground">{session.ipAddress}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">Duration: {formatDuration(session.sessionDuration)}</div>
                        <div className="text-xs text-muted-foreground">
                          Login: {formatDate(session.loginTime)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">Last: {formatDate(session.lastActivity)}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.isCurrentSession ? 'Current Session' : 'Previous Session'}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(session.status)}
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSession(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session)}
                            disabled={revokeSessionMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session)}
                            disabled={deleteSessionMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Detailed information about this user session
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">User Information</h4>
                  <p className="text-sm text-muted-foreground">{selectedSession.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.userEmail}</p>
                </div>
                <div>
                  <h4 className="font-medium">Device Information</h4>
                  <p className="text-sm text-muted-foreground">{selectedSession.deviceName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.browser} on {selectedSession.os}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedSession.location}</p>
                  <p className="text-sm text-muted-foreground">IP: {selectedSession.ipAddress}</p>
                </div>
                <div>
                  <h4 className="font-medium">Session Status</h4>
                  <Badge className={getStatusColor(selectedSession.status)}>
                    {selectedSession.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Activity Timeline</h4>
                <p className="text-sm text-muted-foreground">Login: {formatDate(selectedSession.loginTime)}</p>
                <p className="text-sm text-muted-foreground">Last Activity: {formatDate(selectedSession.lastActivity)}</p>
                <p className="text-sm text-muted-foreground">Duration: {formatDuration(selectedSession.sessionDuration)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



