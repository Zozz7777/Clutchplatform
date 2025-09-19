"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  Target, 
  Activity,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Car,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  FileText,
  CreditCard,
  Building,
  Globe,
  TrendingUp,
  TrendingDown,
  Timer,
  Gauge,
  Cpu,
  Database,
  Server,
  Wifi,
  HardDrive,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Headphones,
  Mic,
  Video,
  Share2,
  Lock,
  Unlock
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CustomerCrisis {
  id: string;
  customerId: string;
  customerName: string;
  company: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'escalated' | 'resolved' | 'monitoring';
  type: 'churn_risk' | 'service_outage' | 'billing_dispute' | 'support_escalation' | 'contract_issue' | 'security_incident';
  title: string;
  description: string;
  detectedAt: string;
  lastUpdated: string;
  estimatedImpact: {
    revenue: number;
    reputation: number;
    churnProbability: number;
    customerSatisfaction: number;
  };
  stakeholders: {
    customer: {
      primary: string;
      secondary?: string;
      decisionMaker: string;
    };
    internal: {
      accountManager: string;
      technicalLead: string;
      executive: string;
      supportLead: string;
    };
  };
  timeline: {
    detected: string;
    acknowledged: string;
    escalated: string;
    resolution?: string;
    followUp?: string;
  };
  actions: {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'technical_fix' | 'escalation' | 'compensation' | 'contract_review';
    description: string;
    assignedTo: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate: string;
    completedAt?: string;
    outcome?: string;
  }[];
  communications: {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'chat';
    direction: 'inbound' | 'outbound';
    participant: string;
    summary: string;
    timestamp: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    followUpRequired: boolean;
  }[];
  metrics: {
    healthScore: number;
    satisfactionScore: number;
    engagementScore: number;
    riskScore: number;
  };
  resolution: {
    status: 'in_progress' | 'resolved' | 'escalated' | 'cancelled';
    summary?: string;
    rootCause?: string;
    preventiveMeasures?: string[];
    lessonsLearned?: string[];
    customerFeedback?: string;
  };
}

interface WarRoomSession {
  id: string;
  crisisId: string;
  startTime: string;
  endTime?: string;
  participants: {
    name: string;
    role: string;
    status: 'active' | 'away' | 'offline';
    lastActivity: string;
  }[];
  agenda: string[];
  decisions: {
    id: string;
    description: string;
    madeBy: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  nextSteps: {
    id: string;
    action: string;
    assignedTo: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

interface CustomerHealthWarRoomProps {
  className?: string;
}

export default function CustomerHealthWarRoom({ className }: CustomerHealthWarRoomProps) {
  const [crises, setCrises] = useState<CustomerCrisis[]>([]);
  const [warRoomSessions, setWarRoomSessions] = useState<WarRoomSession[]>([]);
  const [selectedCrisis, setSelectedCrisis] = useState<CustomerCrisis | null>(null);
  const [isWarRoomActive, setIsWarRoomActive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadCustomerCrisisData = () => {
      const mockCrises: CustomerCrisis[] = [
        {
          id: 'crisis-001',
          customerId: 'customer-001',
          customerName: 'TechCorp Solutions',
          company: 'TechCorp Solutions Inc.',
          severity: 'critical',
          status: 'active',
          type: 'churn_risk',
          title: 'Critical Churn Risk - Enterprise Customer',
          description: 'High-value enterprise customer showing severe signs of churn with multiple escalations',
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          estimatedImpact: {
            revenue: 540000,
            reputation: 85,
            churnProbability: 78,
            customerSatisfaction: 2.1
          },
          stakeholders: {
            customer: {
              primary: 'Sarah Johnson (CTO)',
              secondary: 'Mike Chen (IT Director)',
              decisionMaker: 'David Wilson (CEO)'
            },
            internal: {
              accountManager: 'Jennifer Martinez',
              technicalLead: 'Alex Thompson',
              executive: 'Lisa Wang (VP Customer Success)',
              supportLead: 'Michael Davis'
            }
          },
          timeline: {
            detected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            acknowledged: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            escalated: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          actions: [
            {
              id: 'action-001',
              type: 'call',
              description: 'Emergency call with CTO to understand concerns',
              assignedTo: 'Jennifer Martinez',
              status: 'completed',
              priority: 'critical',
              dueDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              completedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              outcome: 'Identified key issues: performance problems and lack of support'
            },
            {
              id: 'action-002',
              type: 'technical_fix',
              description: 'Deploy performance improvements immediately',
              assignedTo: 'Alex Thompson',
              status: 'in_progress',
              priority: 'critical',
              dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'action-003',
              type: 'meeting',
              description: 'Executive meeting with CEO to discuss relationship',
              assignedTo: 'Lisa Wang',
              status: 'pending',
              priority: 'high',
              dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
            }
          ],
          communications: [
            {
              id: 'comm-001',
              type: 'call',
              direction: 'outbound',
              participant: 'Sarah Johnson (CTO)',
              summary: 'Discussed performance issues and support concerns. Customer frustrated with recent outages.',
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              sentiment: 'negative',
              followUpRequired: true
            },
            {
              id: 'comm-002',
              type: 'email',
              direction: 'outbound',
              participant: 'David Wilson (CEO)',
              summary: 'Sent executive summary of issues and proposed resolution plan',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              sentiment: 'neutral',
              followUpRequired: true
            }
          ],
          metrics: {
            healthScore: 25,
            satisfactionScore: 2.1,
            engagementScore: 15,
            riskScore: 85
          },
          resolution: {
            status: 'in_progress',
            rootCause: 'Performance degradation and inadequate support response',
            preventiveMeasures: [
              'Implement proactive monitoring',
              'Increase support coverage',
              'Regular executive check-ins'
            ]
          }
        },
        {
          id: 'crisis-002',
          customerId: 'customer-002',
          customerName: 'Global Manufacturing',
          company: 'Global Manufacturing Corp.',
          severity: 'high',
          status: 'escalated',
          type: 'service_outage',
          title: 'Service Outage Affecting Production',
          description: 'Critical service outage impacting customer\'s production line operations',
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          estimatedImpact: {
            revenue: 25000,
            reputation: 60,
            churnProbability: 35,
            customerSatisfaction: 3.2
          },
          stakeholders: {
            customer: {
              primary: 'Lisa Wang (VP Operations)',
              decisionMaker: 'Robert Kim (COO)'
            },
            internal: {
              accountManager: 'Alex Thompson',
              technicalLead: 'Michael Davis',
              executive: 'Jennifer Martinez (VP Engineering)',
              supportLead: 'Sarah Johnson'
            }
          },
          timeline: {
            detected: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            acknowledged: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            escalated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            resolution: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          actions: [
            {
              id: 'action-004',
              type: 'technical_fix',
              description: 'Restore service functionality',
              assignedTo: 'Michael Davis',
              status: 'completed',
              priority: 'critical',
              dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              outcome: 'Service restored, root cause identified and fixed'
            },
            {
              id: 'action-005',
              type: 'call',
              description: 'Post-incident review call with customer',
              assignedTo: 'Alex Thompson',
              status: 'pending',
              priority: 'high',
              dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
            }
          ],
          communications: [
            {
              id: 'comm-003',
              type: 'call',
              direction: 'inbound',
              participant: 'Lisa Wang (VP Operations)',
              summary: 'Reported service outage affecting production line. Urgent resolution needed.',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              sentiment: 'negative',
              followUpRequired: true
            }
          ],
          metrics: {
            healthScore: 45,
            satisfactionScore: 3.2,
            engagementScore: 40,
            riskScore: 65
          },
          resolution: {
            status: 'resolved',
            summary: 'Service restored within 3.5 hours. Root cause was database connection pool exhaustion.',
            rootCause: 'Database connection pool exhaustion due to increased load',
            preventiveMeasures: [
              'Implement connection pool monitoring',
              'Add auto-scaling for database connections',
              'Create runbook for similar incidents'
            ],
            lessonsLearned: [
              'Need better capacity planning',
              'Improve monitoring for connection pools',
              'Faster escalation procedures needed'
            ]
          }
        }
      ];

      const mockWarRoomSessions: WarRoomSession[] = [
        {
          id: 'session-001',
          crisisId: 'crisis-001',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          participants: [
            {
              name: 'Jennifer Martinez',
              role: 'Account Manager',
              status: 'active',
              lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString()
            },
            {
              name: 'Alex Thompson',
              role: 'Technical Lead',
              status: 'active',
              lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString()
            },
            {
              name: 'Lisa Wang',
              role: 'VP Customer Success',
              status: 'away',
              lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            },
            {
              name: 'Michael Davis',
              role: 'Support Lead',
              status: 'active',
              lastActivity: new Date(Date.now() - 30 * 1000).toISOString()
            }
          ],
          agenda: [
            'Review customer concerns and impact assessment',
            'Technical solution deployment status',
            'Executive escalation plan',
            'Communication strategy with customer'
          ],
          decisions: [
            {
              id: 'decision-001',
              description: 'Deploy performance improvements immediately',
              madeBy: 'Alex Thompson',
              timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
              status: 'approved'
            },
            {
              id: 'decision-002',
              description: 'Schedule executive meeting with customer CEO',
              madeBy: 'Lisa Wang',
              timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
              status: 'approved'
            }
          ],
          nextSteps: [
            {
              id: 'step-001',
              action: 'Deploy technical fixes',
              assignedTo: 'Alex Thompson',
              dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
              priority: 'critical'
            },
            {
              id: 'step-002',
              action: 'Schedule executive meeting',
              assignedTo: 'Lisa Wang',
              dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
              priority: 'high'
            }
          ]
        }
      ];

      setCrises(mockCrises);
      setWarRoomSessions(mockWarRoomSessions);
      setSelectedCrisis(mockCrises[0]);
    };

    loadCustomerCrisisData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCrises(prev => prev.map(crisis => ({
        ...crisis,
        lastUpdated: new Date().toISOString(),
        metrics: {
          ...crisis.metrics,
          healthScore: Math.max(0, Math.min(100, crisis.metrics.healthScore + (Math.random() - 0.5) * 2))
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-red-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive/10 text-red-800';
      case 'escalated': return 'bg-warning/10 text-orange-800';
      case 'resolved': return 'bg-success/10 text-green-800';
      case 'monitoring': return 'bg-primary/10 text-blue-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'churn_risk': return <UserX className="h-4 w-4" />;
      case 'service_outage': return <AlertTriangle className="h-4 w-4" />;
      case 'billing_dispute': return <CreditCard className="h-4 w-4" />;
      case 'support_escalation': return <MessageSquare className="h-4 w-4" />;
      case 'contract_issue': return <FileText className="h-4 w-4" />;
      case 'security_incident': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-yellow-800';
      case 'in_progress': return 'bg-primary/10 text-blue-800';
      case 'completed': return 'bg-success/10 text-green-800';
      case 'cancelled': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-muted text-gray-800';
      case 'medium': return 'bg-primary/10 text-blue-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'critical': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'neutral': return 'text-primary';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-green-800';
      case 'away': return 'bg-warning/10 text-yellow-800';
      case 'offline': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const filteredCrises = crises.filter(crisis => {
    const severityMatch = filterSeverity === 'all' || crisis.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || crisis.status === filterStatus;
    return severityMatch && statusMatch;
  });

  const activeCrises = crises.filter(crisis => crisis.status === 'active').length;
  const escalatedCrises = crises.filter(crisis => crisis.status === 'escalated').length;
  const resolvedCrises = crises.filter(crisis => crisis.status === 'resolved').length;
  const totalRevenueAtRisk = crises.reduce((sum, crisis) => sum + crisis.estimatedImpact.revenue, 0);
  const avgChurnProbability = crises.length > 0 
    ? Math.round(crises.reduce((sum, crisis) => sum + crisis.estimatedImpact.churnProbability, 0) / crises.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Health War Room
              </CardTitle>
              <CardDescription>
                Client crises management and emergency response coordination
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWarRoomActive(!isWarRoomActive)}
                className={isWarRoomActive ? 'bg-destructive/10 text-red-800' : ''}
              >
                {isWarRoomActive ? <Users className="h-4 w-4 mr-2" /> : <UserX className="h-4 w-4 mr-2" />}
                {isWarRoomActive ? 'War Room Active' : 'Start War Room'}
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
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{activeCrises}</div>
              <div className="text-sm text-muted-foreground">Active Crises</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{escalatedCrises}</div>
              <div className="text-sm text-muted-foreground">Escalated</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{resolvedCrises}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenueAtRisk)}</div>
              <div className="text-sm text-muted-foreground">Revenue at Risk</div>
            </div>
          </div>

          {/* War Room Status */}
          {isWarRoomActive && (
            <div className="p-4 bg-destructive/10 border border-red-200 rounded-[0.625rem]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">War Room Active</h4>
                  <p className="text-sm text-destructive">
                    Emergency response team is actively managing customer crises
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-800">
                    {warRoomSessions.filter(session => !session.endTime).length} Active Sessions
                  </div>
                  <div className="text-sm text-destructive">
                    Started: {new Date(warRoomSessions[0]?.startTime || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Crises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Customer Crises</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Severity:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'active', 'escalated', 'resolved', 'monitoring'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredCrises.map((crisis) => (
                <div
                  key={crisis.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedCrisis?.id === crisis.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCrisis(crisis)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(crisis.type)}
                      <div>
                        <div className="font-medium">{crisis.title}</div>
                        <div className="text-sm text-muted-foreground">{crisis.customerName} • {crisis.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(crisis.severity)}>
                        {crisis.severity}
                      </Badge>
                      <Badge className={getStatusColor(crisis.status)}>
                        {crisis.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {crisis.estimatedImpact.churnProbability}% churn risk
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Revenue at Risk: {formatCurrency(crisis.estimatedImpact.revenue)}</span>
                    <span>Health Score: {crisis.metrics.healthScore}%</span>
                    <span>Actions: {crisis.actions.length}</span>
                    <span>Detected: {new Date(crisis.detectedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Crisis Details */}
          {selectedCrisis && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Crisis Details - {selectedCrisis.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                  <TabsTrigger value="warroom">War Room</TabsTrigger>
                  <TabsTrigger value="resolution">Resolution</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Crisis Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Customer:</span>
                          <span className="font-medium">{selectedCrisis.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Company:</span>
                          <span className="font-medium">{selectedCrisis.company}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedCrisis.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedCrisis.severity)}>
                            {selectedCrisis.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedCrisis.status)}>
                            {selectedCrisis.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Detected:</span>
                          <span className="font-medium">{new Date(selectedCrisis.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue at Risk:</span>
                          <span className="font-medium">{formatCurrency(selectedCrisis.estimatedImpact.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Churn Probability:</span>
                          <span className="font-medium">{selectedCrisis.estimatedImpact.churnProbability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputation Impact:</span>
                          <span className="font-medium">{selectedCrisis.estimatedImpact.reputation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Satisfaction:</span>
                          <span className="font-medium">{selectedCrisis.estimatedImpact.customerSatisfaction}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Stakeholders</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h6 className="font-medium mb-2">Customer</h6>
                        <div className="space-y-1">
                          <div>Primary: {selectedCrisis.stakeholders.customer.primary}</div>
                          {selectedCrisis.stakeholders.customer.secondary && (
                            <div>Secondary: {selectedCrisis.stakeholders.customer.secondary}</div>
                          )}
                          <div>Decision Maker: {selectedCrisis.stakeholders.customer.decisionMaker}</div>
                        </div>
                      </div>
                      <div>
                        <h6 className="font-medium mb-2">Internal</h6>
                        <div className="space-y-1">
                          <div>Account Manager: {selectedCrisis.stakeholders.internal.accountManager}</div>
                          <div>Technical Lead: {selectedCrisis.stakeholders.internal.technicalLead}</div>
                          <div>Executive: {selectedCrisis.stakeholders.internal.executive}</div>
                          <div>Support Lead: {selectedCrisis.stakeholders.internal.supportLead}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Action Items</h5>
                    <div className="space-y-2">
                      {selectedCrisis.actions.map((action) => (
                        <div key={action.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{action.description}</span>
                              <Badge className={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getActionStatusColor(action.status)}>
                                {action.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium">Due: {new Date(action.dueDate).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Assigned to: {action.assignedTo}
                            {action.outcome && (
                              <div className="mt-1">
                                <strong>Outcome:</strong> {action.outcome}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Communication History</h5>
                    <div className="space-y-2">
                      {selectedCrisis.communications.map((comm) => (
                        <div key={comm.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comm.type} with {comm.participant}</span>
                              <Badge className={comm.direction === 'inbound' ? 'bg-primary/10 text-blue-800' : 'bg-success/10 text-green-800'}>
                                {comm.direction}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getSentimentColor(comm.sentiment)}`}>
                                {comm.sentiment}
                              </span>
                              <span className="text-sm font-medium">{new Date(comm.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{comm.summary}</p>
                          {comm.followUpRequired && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                Follow-up Required
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="warroom" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">War Room Session</h5>
                    {warRoomSessions.find(session => session.crisisId === selectedCrisis.id) ? (
                      <div className="space-y-4">
                        <div className="p-3 border rounded-[0.625rem]">
                          <h6 className="font-medium mb-2">Participants</h6>
                          <div className="grid grid-cols-2 gap-2">
                            {warRoomSessions.find(session => session.crisisId === selectedCrisis.id)?.participants.map((participant, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Badge className={getParticipantStatusColor(participant.status)}>
                                  {participant.status}
                                </Badge>
                                <span>{participant.name} ({participant.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 border rounded-[0.625rem]">
                          <h6 className="font-medium mb-2">Decisions Made</h6>
                          <div className="space-y-2">
                            {warRoomSessions.find(session => session.crisisId === selectedCrisis.id)?.decisions.map((decision) => (
                              <div key={decision.id} className="text-sm">
                                <div className="flex items-center justify-between">
                                  <span>{decision.description}</span>
                                  <Badge className={decision.status === 'approved' ? 'bg-success/10 text-green-800' : 'bg-warning/10 text-yellow-800'}>
                                    {decision.status}
                                  </Badge>
                                </div>
                                <div className="text-muted-foreground">
                                  By: {decision.madeBy} • {new Date(decision.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No active war room session for this crisis
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resolution" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Resolution Status</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={getStatusColor(selectedCrisis.resolution.status)}>
                          {selectedCrisis.resolution.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {selectedCrisis.resolution.summary && (
                        <div>
                          <span className="font-medium">Summary:</span>
                          <p className="text-muted-foreground mt-1">{selectedCrisis.resolution.summary}</p>
                        </div>
                      )}
                      {selectedCrisis.resolution.rootCause && (
                        <div>
                          <span className="font-medium">Root Cause:</span>
                          <p className="text-muted-foreground mt-1">{selectedCrisis.resolution.rootCause}</p>
                        </div>
                      )}
                      {selectedCrisis.resolution.preventiveMeasures && (
                        <div>
                          <span className="font-medium">Preventive Measures:</span>
                          <ul className="text-muted-foreground mt-1 list-disc list-inside">
                            {selectedCrisis.resolution.preventiveMeasures.map((measure, index) => (
                              <li key={index}>{measure}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Start War Room
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
                <Button size="sm" variant="outline">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
