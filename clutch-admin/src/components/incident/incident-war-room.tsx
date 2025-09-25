"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity, 
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  Zap,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bell,
  BellOff,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'investigating' | 'mitigating' | 'resolved' | 'post-mortem';
  category: 'system' | 'security' | 'performance' | 'data' | 'service';
  impact: {
    affectedUsers: number;
    affectedServices: string[];
    revenueImpact: number;
    slaBreach: boolean;
  };
  timeline: {
    detected: string;
    acknowledged: string;
    investigating: string;
    mitigating: string;
    resolved?: string;
  };
  assignee: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  metrics: {
    mttr: number; // Mean Time To Resolution
    mttd: number; // Mean Time To Detection
    severity: number; // 1-10 scale
  };
  actions: {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignee: string;
    dueTime: string;
  }[];
  communications: {
    id: string;
    type: 'internal' | 'customer' | 'stakeholder';
    message: string;
    timestamp: string;
    author: string;
  }[];
}

interface IncidentWarRoomProps {
  className?: string;
}

export default function IncidentWarRoom({ className }: IncidentWarRoomProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [isWarRoomActive, setIsWarRoomActive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadIncidents = () => {
      const mockIncidents: Incident[] = [
        {
          id: 'INC-001',
          title: 'API Gateway Outage',
          description: 'Complete API gateway failure affecting all mobile app users',
          severity: 'critical',
          status: 'mitigating',
          category: 'system',
          impact: {
            affectedUsers: 15420,
            affectedServices: ['Mobile API', 'Payment Gateway', 'User Authentication'],
            revenueImpact: 25000,
            slaBreach: true
          },
          timeline: {
            detected: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            acknowledged: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
            investigating: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            mitigating: new Date(Date.now() - 20 * 60 * 1000).toISOString()
          },
          assignee: {
            id: 'eng-001',
            name: 'Sarah Chen',
            role: 'Senior Engineer',
            avatar: ''
          },
          metrics: {
            mttr: 45,
            mttd: 5,
            severity: 9
          },
          actions: [
            {
              id: 'act-001',
              description: 'Restart API gateway services',
              status: 'completed',
              assignee: 'Sarah Chen',
              dueTime: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
              id: 'act-002',
              description: 'Check database connectivity',
              status: 'in_progress',
              assignee: 'Mike Rodriguez',
              dueTime: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            },
            {
              id: 'act-003',
              description: 'Notify affected customers',
              status: 'pending',
              assignee: 'Customer Success Team',
              dueTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            }
          ],
          communications: [
            {
              id: 'comm-001',
              type: 'internal',
              message: 'Critical incident detected - API gateway completely down',
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              author: 'Monitoring System'
            },
            {
              id: 'comm-002',
              type: 'internal',
              message: 'Incident acknowledged by on-call engineer',
              timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
              author: 'Sarah Chen'
            },
            {
              id: 'comm-003',
              type: 'customer',
              message: 'We are experiencing technical difficulties. Our team is working to resolve this issue.',
              timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
              author: 'Customer Success Team'
            }
          ]
        },
        {
          id: 'INC-002',
          title: 'Payment Processing Delays',
          description: 'Payment gateway experiencing 30% slower response times',
          severity: 'high',
          status: 'investigating',
          category: 'performance',
          impact: {
            affectedUsers: 3200,
            affectedServices: ['Payment Gateway', 'Billing System'],
            revenueImpact: 8500,
            slaBreach: false
          },
          timeline: {
            detected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            acknowledged: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            investigating: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            mitigating: ''
          },
          assignee: {
            id: 'eng-002',
            name: 'Alex Kim',
            role: 'DevOps Engineer',
            avatar: ''
          },
          metrics: {
            mttr: 120,
            mttd: 15,
            severity: 7
          },
          actions: [
            {
              id: 'act-004',
              description: 'Analyze payment gateway logs',
              status: 'in_progress',
              assignee: 'Alex Kim',
              dueTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            },
            {
              id: 'act-005',
              description: 'Check third-party payment provider status',
              status: 'pending',
              assignee: 'Alex Kim',
              dueTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            }
          ],
          communications: [
            {
              id: 'comm-004',
              type: 'internal',
              message: 'Payment processing delays detected - investigating root cause',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              author: 'Monitoring System'
            }
          ]
        }
      ];

      setIncidents(mockIncidents);
      setActiveIncident(mockIncidents[0]);
    };

    loadIncidents();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-destructive/10 text-destructive';
      case 'investigating': return 'bg-warning/10 text-warning';
      case 'mitigating': return 'bg-warning/10 text-warning';
      case 'resolved': return 'bg-success/10 text-success';
      case 'post-mortem': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Activity className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <TrendingDown className="h-4 w-4" />;
      case 'data': return <Target className="h-4 w-4" />;
      case 'service': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getCommunicationTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-primary/10 text-primary';
      case 'customer': return 'bg-success/10 text-success';
      case 'stakeholder': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleActionUpdate = (actionId: string, newStatus: string) => {
    if (!activeIncident) return;

    const updatedIncident = {
      ...activeIncident,
      actions: activeIncident.actions.map(action =>
        action.id === actionId ? { ...action, status: newStatus as string } : action
      )
    };

    setActiveIncident(updatedIncident);
    setIncidents(prev => prev.map(incident =>
      incident.id === activeIncident.id ? updatedIncident : incident
    ));
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!activeIncident) return;

    const updatedIncident = {
      ...activeIncident,
      status: newStatus as string,
      timeline: {
        ...activeIncident.timeline,
        [newStatus]: new Date().toISOString()
      }
    };

    setActiveIncident(updatedIncident);
    setIncidents(prev => prev.map(incident =>
      incident.id === activeIncident.id ? updatedIncident : incident
    ));
  };

  const criticalIncidents = incidents.filter(inc => inc.severity === 'critical').length;
  const activeIncidents = incidents.filter(inc => inc.status !== 'resolved').length;
  const totalRevenueImpact = incidents.reduce((sum, inc) => sum + inc.impact.revenueImpact, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Incident War Room
              </CardTitle>
              <CardDescription>
                Major incident response and crisis management
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWarRoomActive(!isWarRoomActive)}
                className={isWarRoomActive ? 'bg-destructive/10 text-destructive' : ''}
              >
                {isWarRoomActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isWarRoomActive ? 'War Room Active' : 'Activate War Room'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Crisis Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalIncidents}</div>
              <div className="text-sm text-muted-foreground">Critical Incidents</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{activeIncidents}</div>
              <div className="text-sm text-muted-foreground">Active Incidents</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenueImpact)}</div>
              <div className="text-sm text-muted-foreground">Revenue Impact</div>
            </div>
          </div>

          {/* Active Incident Focus */}
          {activeIncident && (
            <div className={`p-4 border-2 rounded-[0.625rem] ${
              activeIncident.severity === 'critical' ? 'border-red-200 bg-destructive/10' :
              activeIncident.severity === 'high' ? 'border-orange-200 bg-warning/10' :
              'border-yellow-200 bg-warning/10'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{activeIncident.title}</h3>
                  <p className="text-sm text-muted-foreground">{activeIncident.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(activeIncident.severity)}>
                    {activeIncident.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(activeIncident.status)}>
                    {activeIncident.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-destructive">{formatNumber(activeIncident.impact.affectedUsers)}</div>
                  <div className="text-xs text-muted-foreground">Affected Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">{activeIncident.impact.affectedServices.length}</div>
                  <div className="text-xs text-muted-foreground">Affected Services</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{formatCurrency(activeIncident.impact.revenueImpact)}</div>
                  <div className="text-xs text-muted-foreground">Revenue Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{activeIncident.metrics.mttr}m</div>
                  <div className="text-xs text-muted-foreground">MTTR</div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Update Status:</span>
                {['investigating', 'mitigating', 'resolved'].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={activeIncident.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Incident Details */}
          {activeIncident && (
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-3">
                  {activeIncident.actions.map((action) => (
                    <div key={action.id} className="p-3 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">{action.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getActionStatusColor(action.status)}>
                            {action.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(action.dueTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Assignee: {action.assignee}</span>
                        <div className="flex gap-1">
                          {['pending', 'in_progress', 'completed'].map((status) => (
                            <Button
                              key={status}
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionUpdate(action.id, status)}
                              disabled={action.status === status}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(activeIncident.timeline).map(([stage, timestamp]) => (
                    timestamp && (
                      <div key={stage} className="flex items-center gap-3 p-3 border rounded-[0.625rem]">
                        <div className={`w-3 h-3 rounded-full ${
                          stage === 'resolved' ? 'bg-success/100' :
                          stage === 'mitigating' ? 'bg-warning/100' :
                          stage === 'investigating' ? 'bg-warning/100' :
                          'bg-destructive/100'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium capitalize">{stage}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <div className="space-y-3">
                  {activeIncident.communications.map((comm) => (
                    <div key={comm.id} className="p-3 border rounded-[0.625rem]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{comm.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCommunicationTypeColor(comm.type)}>
                            {comm.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comm.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{comm.message}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* All Incidents List */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">All Incidents</h4>
            <div className="space-y-2">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    activeIncident?.id === incident.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveIncident(incident)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(incident.category)}
                      <div>
                        <div className="font-medium">{incident.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(incident.impact.affectedUsers)} users affected
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


