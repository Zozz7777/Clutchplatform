'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Calendar,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: string;
  endTime?: string;
  duration?: string;
  affectedUsers: number;
  assignee: string;
  updates: number;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Database Connection Timeout',
      description: 'Users experiencing slow response times due to database connection issues',
      status: 'investigating',
      severity: 'high',
      startTime: '2024-01-15T14:30:00Z',
      affectedUsers: 1250,
      assignee: 'John Smith',
      updates: 3
    },
    {
      id: '2',
      title: 'API Rate Limiting Issues',
      description: 'Some API endpoints returning 429 errors unexpectedly',
      status: 'resolved',
      severity: 'medium',
      startTime: '2024-01-15T10:15:00Z',
      endTime: '2024-01-15T11:45:00Z',
      duration: '1h 30m',
      affectedUsers: 450,
      assignee: 'Sarah Johnson',
      updates: 5
    },
    {
      id: '3',
      title: 'Email Service Outage',
      description: 'Email notifications not being sent to users',
      status: 'closed',
      severity: 'low',
      startTime: '2024-01-14T16:20:00Z',
      endTime: '2024-01-14T17:10:00Z',
      duration: '50m',
      affectedUsers: 200,
      assignee: 'Mike Wilson',
      updates: 2
    }
  ]);

  const [stats] = useState({
    totalIncidents: 24,
    openIncidents: 1,
    resolvedToday: 3,
    averageResolutionTime: '2h 15m',
    mttr: '1h 45m'
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-primary" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-warning/100">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-warning/100">Medium</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-primary/100">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'investigating':
        return <Badge variant="default" className="bg-warning/100">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-success/100">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'investigating':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Incident Management</h1>
          <p className="text-muted-foreground font-sans">
            Track and manage system incidents and outages
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground font-sans">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Open</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Incidents resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.averageResolutionTime}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Time to resolve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">MTTR</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.mttr}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Mean time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(incident.severity)}
                      <div>
                        <CardTitle className="font-sans">{incident.title}</CardTitle>
                        <CardDescription className="font-sans">
                          {incident.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Start Time</p>
                      <p className="text-sm font-sans">
                        {new Date(incident.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Duration</p>
                      <p className="text-sm font-sans">
                        {incident.duration || 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Affected Users</p>
                      <p className="text-sm font-sans">
                        {incident.affectedUsers.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Assignee</p>
                      <p className="text-sm font-sans">
                        {incident.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-sans">{incident.updates} updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Incident Timeline</CardTitle>
              <CardDescription className="font-sans">
                Recent incident activity and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: '2024-01-15T14:30:00Z',
                    event: 'Incident Created',
                    incident: 'Database Connection Timeout',
                    user: 'System',
                    type: 'created'
                  },
                  {
                    time: '2024-01-15T14:35:00Z',
                    event: 'Status Changed',
                    incident: 'Database Connection Timeout',
                    user: 'John Smith',
                    type: 'status',
                    details: 'Status changed to Investigating'
                  },
                  {
                    time: '2024-01-15T11:45:00Z',
                    event: 'Incident Resolved',
                    incident: 'API Rate Limiting Issues',
                    user: 'Sarah Johnson',
                    type: 'resolved'
                  },
                  {
                    time: '2024-01-15T10:15:00Z',
                    event: 'Incident Created',
                    incident: 'API Rate Limiting Issues',
                    user: 'System',
                    type: 'created'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-[0.625rem]">
                    <div className="flex-shrink-0 mt-1">
                      {event.type === 'created' && <Plus className="h-4 w-4 text-primary" />}
                      {event.type === 'status' && <Edit className="h-4 w-4 text-warning" />}
                      {event.type === 'resolved' && <CheckCircle className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium font-sans">{event.event}</h3>
                        <span className="text-sm text-muted-foreground font-sans">
                          {new Date(event.time).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans">
                        {event.incident} • {event.user}
                      </p>
                      {event.details && (
                        <p className="text-sm font-sans mt-1">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Incident Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'Jan 2024', incidents: 24, resolved: 22, avgTime: '2h 15m' },
                    { month: 'Dec 2023', incidents: 18, resolved: 18, avgTime: '1h 45m' },
                    { month: 'Nov 2023', incidents: 31, resolved: 29, avgTime: '3h 20m' }
                  ].map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-sans">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-sans">{month.incidents} incidents</p>
                          <p className="text-xs text-muted-foreground font-sans">
                            {month.resolved} resolved
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-sans">{month.avgTime}</p>
                          <p className="text-xs text-muted-foreground font-sans">
                            avg resolution
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { severity: 'Critical', count: 2, percentage: 8.3 },
                    { severity: 'High', count: 5, percentage: 20.8 },
                    { severity: 'Medium', count: 12, percentage: 50.0 },
                    { severity: 'Low', count: 5, percentage: 20.8 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sans">{item.severity}</span>
                        <span className="text-sm font-sans">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.severity === 'Critical' ? 'bg-destructive/100' :
                            item.severity === 'High' ? 'bg-warning/100' :
                            item.severity === 'Medium' ? 'bg-warning/100' : 'bg-primary/100'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


