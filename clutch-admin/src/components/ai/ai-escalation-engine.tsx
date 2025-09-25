"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
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
  Users,
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
  HardDrive
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface SLA {
  id: string;
  name: string;
  service: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical' | 'breach';
  breachProbability: number; // 0-100
  timeToBreach: number; // minutes
  lastBreach: string;
  escalationLevel: number;
  assignedTeam: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  action: string;
  escalationLevel: number;
  isActive: boolean;
  lastTriggered: string;
  triggerCount: number;
  effectiveness: number; // 0-100
}

interface EscalationEvent {
  id: string;
  slaId: string;
  ruleId: string;
  type: 'predicted_breach' | 'actual_breach' | 'recovery' | 'escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  predictedAt: string;
  actualAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
  assignedTo: string;
  escalationLevel: number;
  actions: {
    id: string;
    type: 'notification' | 'auto_fix' | 'escalate' | 'alert' | 'schedule_review';
    description: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: string;
    automated: boolean;
  }[];
  impact: {
    users: number;
    revenue: number;
    reputation: number;
    operational: number;
  };
  confidence: number; // 0-100
  falsePositive: boolean;
}

interface AIEscalationEngineProps {
  className?: string;
}

export default function AIEscalationEngine({ className }: AIEscalationEngineProps) {
  const [slas, setSlas] = useState<SLA[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [escalationEvents, setEscalationEvents] = useState<EscalationEvent[]>([]);
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterService, setFilterService] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadAIEscalationData = () => {
      const mockSLAs: SLA[] = [
        {
          id: 'sla-001',
          name: 'API Response Time',
          service: 'API Gateway',
          metric: 'Response Time',
          target: 200,
          current: 185,
          unit: 'ms',
          status: 'healthy',
          breachProbability: 15,
          timeToBreach: 45,
          lastBreach: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 1,
          assignedTeam: 'Platform Engineering',
          priority: 'high'
        },
        {
          id: 'sla-002',
          name: 'Database Uptime',
          service: 'Database',
          metric: 'Uptime',
          target: 99.9,
          current: 99.95,
          unit: '%',
          status: 'healthy',
          breachProbability: 5,
          timeToBreach: 120,
          lastBreach: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 1,
          assignedTeam: 'Database Team',
          priority: 'critical'
        },
        {
          id: 'sla-003',
          name: 'Customer Support Response',
          service: 'Support',
          metric: 'Response Time',
          target: 2,
          current: 2.5,
          unit: 'hours',
          status: 'warning',
          breachProbability: 65,
          timeToBreach: 15,
          lastBreach: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 2,
          assignedTeam: 'Customer Success',
          priority: 'medium'
        },
        {
          id: 'sla-004',
          name: 'Payment Processing',
          service: 'Payments',
          metric: 'Success Rate',
          target: 99.5,
          current: 98.8,
          unit: '%',
          status: 'critical',
          breachProbability: 85,
          timeToBreach: 8,
          lastBreach: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 3,
          assignedTeam: 'Payment Engineering',
          priority: 'critical'
        },
        {
          id: 'sla-005',
          name: 'Fleet Availability',
          service: 'Fleet Management',
          metric: 'Vehicle Availability',
          target: 95,
          current: 92,
          unit: '%',
          status: 'warning',
          breachProbability: 45,
          timeToBreach: 30,
          lastBreach: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          escalationLevel: 2,
          assignedTeam: 'Fleet Operations',
          priority: 'high'
        }
      ];

      const mockEscalationRules: EscalationRule[] = [
        {
          id: 'rule-001',
          name: 'Response Time Breach Prediction',
          condition: 'response_time > 180ms AND trend_increasing',
          threshold: 80,
          action: 'auto_scale_instances',
          escalationLevel: 2,
          isActive: true,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          triggerCount: 12,
          effectiveness: 85
        },
        {
          id: 'rule-002',
          name: 'Database Performance Degradation',
          condition: 'cpu_usage > 85% OR memory_usage > 90%',
          threshold: 70,
          action: 'escalate_to_dba_team',
          escalationLevel: 3,
          isActive: true,
          lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          triggerCount: 8,
          effectiveness: 92
        },
        {
          id: 'rule-003',
          name: 'Support Queue Overflow',
          condition: 'queue_length > 50 AND avg_response_time > 1.5h',
          threshold: 60,
          action: 'notify_support_manager',
          escalationLevel: 2,
          isActive: true,
          lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          triggerCount: 5,
          effectiveness: 78
        },
        {
          id: 'rule-004',
          name: 'Payment Failure Spike',
          condition: 'failure_rate > 2% AND volume > 1000',
          threshold: 90,
          action: 'escalate_to_payment_team',
          escalationLevel: 4,
          isActive: true,
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          triggerCount: 3,
          effectiveness: 95
        }
      ];

      const mockEscalationEvents: EscalationEvent[] = [
        {
          id: 'event-001',
          slaId: 'sla-001',
          ruleId: 'rule-001',
          type: 'predicted_breach',
          severity: 'medium',
          status: 'in_progress',
          predictedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Platform Engineering',
          escalationLevel: 2,
          actions: [
            {
              id: 'action-001',
              type: 'auto_fix',
              description: 'Auto-scaled API instances',
              status: 'completed',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-002',
              type: 'notification',
              description: 'Notified Platform Engineering team',
              status: 'completed',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              automated: true
            }
          ],
          impact: {
            users: 1500,
            revenue: 2500,
            reputation: 20,
            operational: 30
          },
          confidence: 78,
          falsePositive: false
        },
        {
          id: 'event-002',
          slaId: 'sla-004',
          ruleId: 'rule-004',
          type: 'actual_breach',
          severity: 'critical',
          status: 'escalated',
          predictedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          actualAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          escalatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          assignedTo: 'Payment Engineering',
          escalationLevel: 4,
          actions: [
            {
              id: 'action-003',
              type: 'escalate',
              description: 'Escalated to Payment Engineering team',
              status: 'completed',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-004',
              type: 'alert',
              description: 'Alerted CTO and VP Engineering',
              status: 'completed',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              automated: true
            }
          ],
          impact: {
            users: 5000,
            revenue: 15000,
            reputation: 80,
            operational: 90
          },
          confidence: 95,
          falsePositive: false
        },
        {
          id: 'event-003',
          slaId: 'sla-003',
          ruleId: 'rule-003',
          type: 'predicted_breach',
          severity: 'medium',
          status: 'resolved',
          predictedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Customer Success',
          escalationLevel: 2,
          actions: [
            {
              id: 'action-005',
              type: 'notification',
              description: 'Notified Support Manager',
              status: 'completed',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-006',
              type: 'auto_fix',
              description: 'Auto-assigned additional support agents',
              status: 'completed',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              automated: true
            }
          ],
          impact: {
            users: 800,
            revenue: 1200,
            reputation: 15,
            operational: 25
          },
          confidence: 82,
          falsePositive: false
        }
      ];

      setSlas(mockSLAs);
      setEscalationRules(mockEscalationRules);
      setEscalationEvents(mockEscalationEvents);
      setSelectedSLA(mockSLAs[0]);
    };

    loadAIEscalationData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSlas(prev => prev.map(sla => {
        // Simulate changing breach probability and time to breach
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        return {
          ...sla,
          breachProbability: Math.max(0, Math.min(100, sla.breachProbability + variation * 10)),
          timeToBreach: Math.max(0, sla.timeToBreach + (Math.random() - 0.5) * 10)
        };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-warning/10 text-warning';
      case 'breach': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-muted text-muted-foreground';
      case 'medium': return 'bg-primary/10 text-primary';
      case 'high': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'in_progress': return 'bg-primary/10 text-primary';
      case 'resolved': return 'bg-success/10 text-success';
      case 'escalated': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'api gateway': return <Server className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'support': return <MessageSquare className="h-4 w-4" />;
      case 'payments': return <CreditCard className="h-4 w-4" />;
      case 'fleet management': return <Car className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'auto_fix': return <Zap className="h-4 w-4" />;
      case 'escalate': return <ArrowUp className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'schedule_review': return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getBreachProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-destructive';
    if (probability >= 60) return 'text-warning';
    if (probability >= 40) return 'text-warning';
    return 'text-success';
  };

  const filteredSLAs = slas.filter(sla => {
    const serviceMatch = filterService === 'all' || sla.service === filterService;
    const statusMatch = filterStatus === 'all' || sla.status === filterStatus;
    return serviceMatch && statusMatch;
  });

  const healthySLAs = slas.filter(sla => sla.status === 'healthy').length;
  const warningSLAs = slas.filter(sla => sla.status === 'warning').length;
  const criticalSLAs = slas.filter(sla => sla.status === 'critical' || sla.status === 'breach').length;
  const avgBreachProbability = slas.length > 0 
    ? Math.round(slas.reduce((sum, sla) => sum + sla.breachProbability, 0) / slas.length)
    : 0;
  const activeEvents = escalationEvents.filter(event => event.status === 'in_progress' || event.status === 'pending').length;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Escalation Engine
              </CardTitle>
              <CardDescription>
                SLA breach prediction and automated escalation system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-success' : ''}
              >
                {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
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
          {/* SLA Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{healthySLAs}</div>
              <div className="text-sm text-muted-foreground">Healthy SLAs</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{warningSLAs}</div>
              <div className="text-sm text-muted-foreground">Warning SLAs</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalSLAs}</div>
              <div className="text-sm text-muted-foreground">Critical SLAs</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{activeEvents}</div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>
          </div>

          {/* Breach Probability Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Average Breach Probability</h4>
                <p className="text-sm text-muted-foreground">
                  AI-predicted likelihood of SLA breaches across all services
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getBreachProbabilityColor(avgBreachProbability)}`}>
                  {avgBreachProbability}%
                </div>
                <div className="text-sm text-muted-foreground">breach risk</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgBreachProbability} className="h-2" />
            </div>
          </div>

          {/* SLA Monitoring */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">SLA Monitoring</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Service:</span>
                {['all', 'API Gateway', 'Database', 'Support', 'Payments', 'Fleet Management'].map((service) => (
                  <Button
                    key={service}
                    variant={filterService === service ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterService(service)}
                  >
                    {service}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'healthy', 'warning', 'critical', 'breach'].map((status) => (
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
              {filteredSLAs.map((sla) => (
                <div
                  key={sla.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedSLA?.id === sla.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedSLA(sla)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(sla.service)}
                      <div>
                        <div className="font-medium">{sla.name}</div>
                        <div className="text-sm text-muted-foreground">{sla.service} • {sla.metric}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(sla.status)}>
                        {sla.status}
                      </Badge>
                      <Badge className={getPriorityColor(sla.priority)}>
                        {sla.priority}
                      </Badge>
                      <div className={`text-sm font-medium ${getBreachProbabilityColor(sla.breachProbability)}`}>
                        {sla.breachProbability}% breach risk
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Current: {sla.current}{sla.unit} / Target: {sla.target}{sla.unit}</span>
                    <span>Time to Breach: {sla.timeToBreach} min</span>
                    <span>Team: {sla.assignedTeam}</span>
                    <span>Level: {sla.escalationLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation Events */}
          <div>
            <h4 className="font-medium mb-3">Recent Escalation Events</h4>
            <div className="space-y-2">
              {escalationEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.type.replace('_', ' ')}</span>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">{event.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Assigned: {event.assignedTo}</span>
                    <span>Impact: {formatCurrency(event.impact.revenue)} revenue</span>
                    <span>Users: {formatNumber(event.impact.users)}</span>
                    <span>Predicted: {new Date(event.predictedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected SLA Details */}
          {selectedSLA && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">SLA Details - {selectedSLA.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="escalation">Escalation</TabsTrigger>
                  <TabsTrigger value="rules">Rules</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">SLA Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{selectedSLA.service}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Metric:</span>
                          <span className="font-medium">{selectedSLA.metric}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-medium">{selectedSLA.target}{selectedSLA.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current:</span>
                          <span className="font-medium">{selectedSLA.current}{selectedSLA.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedSLA.status)}>
                            {selectedSLA.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge className={getPriorityColor(selectedSLA.priority)}>
                            {selectedSLA.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">AI Predictions</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Breach Probability:</span>
                          <span className={`font-medium ${getBreachProbabilityColor(selectedSLA.breachProbability)}`}>
                            {selectedSLA.breachProbability}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to Breach:</span>
                          <span className="font-medium">{selectedSLA.timeToBreach} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Escalation Level:</span>
                          <span className="font-medium">{selectedSLA.escalationLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assigned Team:</span>
                          <span className="font-medium">{selectedSLA.assignedTeam}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Breach:</span>
                          <span className="font-medium">{new Date(selectedSLA.lastBreach).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="escalation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Escalation Rules</h5>
                    <div className="space-y-2">
                      {escalationRules.filter(rule => rule.isActive).map((rule) => (
                        <div key={rule.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rule.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Level {rule.escalationLevel}</span>
                              <span className="text-sm font-medium">{rule.effectiveness}% effective</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Condition: {rule.condition}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Action: {rule.action} • Triggers: {rule.triggerCount} • Last: {new Date(rule.lastTriggered).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">All Escalation Rules</h5>
                    <div className="space-y-2">
                      {escalationRules.map((rule) => (
                        <div key={rule.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rule.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={rule.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <span className="text-sm font-medium">Level {rule.escalationLevel}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Condition: {rule.condition}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Action: {rule.action} • Threshold: {rule.threshold}% • Effectiveness: {rule.effectiveness}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Escalation History</h5>
                    <div className="space-y-2">
                      {escalationEvents.filter(event => event.slaId === selectedSLA.id).map((event) => (
                        <div key={event.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.type.replace('_', ' ')}</span>
                              <Badge className={getSeverityColor(event.severity)}>
                                {event.severity}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getEventStatusColor(event.status)}>
                                {event.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium">{event.confidence}% confidence</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Assigned: {event.assignedTo} • Level: {event.escalationLevel}
                          </div>
                          <div className="space-y-1">
                            {event.actions.map((action) => (
                              <div key={action.id} className="flex items-center gap-2 text-sm">
                                {getActionIcon(action.type)}
                                <span>{action.description}</span>
                                <Badge className={action.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                                  {action.status}
                                </Badge>
                                {action.automated && (
                                  <Badge variant="outline" className="text-xs">
                                    Automated
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Rules
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


