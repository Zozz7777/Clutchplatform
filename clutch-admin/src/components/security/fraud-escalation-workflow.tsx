"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Unlock, 
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
  Clock,
  Users,
  Car,
  DollarSign,
  Activity,
  Zap,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  User,
  MapPin,
  CreditCard,
  Smartphone,
  Flag
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface FraudEvent {
  id: string;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  detectedAt: string;
  lastUpdated: string;
  riskScore: number;
  confidence: number;
  affectedUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountAge: number;
    riskLevel: string;
  };
  transaction: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    merchant: string;
    location: {
      country: string;
      city: string;
      coordinates: { lat: number; lng: number };
    };
  };
  device: {
    id: string;
    type: string;
    os: string;
    browser: string;
    fingerprint: string;
    isNew: boolean;
    location: {
      country: string;
      city: string;
      coordinates: { lat: number; lng: number };
    };
  };
  impact: {
    financial: number;
    reputation: number;
    operational: number;
    customer: number;
  };
  actions: {
    id: string;
    type: string;
    status: string;
    timestamp: string;
    performedBy: string;
    details: string;
  }[];
  escalation: {
    level: number;
    escalatedAt: string;
    escalatedBy: string;
    reason: string;
    nextReview: string;
  };
  evidence: {
    type: string;
    description: string;
    confidence: number;
  }[];
  tags: string[];
  notes: string;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  };
  priority: string;
  estimatedResolution: string;
  relatedEvents: string[];
  falsePositiveProbability: number;
  recommendedActions: string[];
  complianceFlags: string[];
  riskFactors: {
    financial: number;
    reputation: number;
    operational: number;
    customer: number;
  };
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  isActive: boolean;
  threshold: number;
  conditions: string[];
  actions: string[];
  lastTriggered: string;
  triggerCount: number;
  falsePositiveRate: number;
}

interface FraudEscalationWorkflowProps {
  className?: string;
}

export default function FraudEscalationWorkflow({ className }: FraudEscalationWorkflowProps) {
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>([]);
  const [fraudRules, setFraudRules] = useState<FraudRule[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FraudEvent | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const loadFraudData = async () => {
    try {
      // Load fraud events from API
      const eventsResponse = await fetch('/api/v1/admin/fraud/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setFraudEvents(eventsData.data || []);
      } else {
        setFraudEvents([]);
      }

      // Load fraud rules from API
      const rulesResponse = await fetch('/api/v1/admin/fraud/rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setFraudRules(rulesData.data || []);
      } else {
        setFraudRules([]);
      }
    } catch (error) {
      // Error handled by API service
      setFraudEvents([]);
      setFraudRules([]);
    }
  };

  useEffect(() => {
    loadFraudData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setFraudEvents((prev: FraudEvent[]) => prev.map((event: FraudEvent) => ({
        ...event,
        lastUpdated: new Date().toISOString()
      })));
    }, 30000);

    return () => clearInterval(interval);
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
      case 'new': return 'bg-primary/100';
      case 'investigating': return 'bg-warning/100';
      case 'escalated': return 'bg-destructive/100';
      case 'resolved': return 'bg-success/100';
      case 'false_positive': return 'bg-muted/100';
      case 'failed': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleEventStatusUpdate = (eventId: string, newStatus: string) => {
    setFraudEvents((prev: FraudEvent[]) => prev.map((event: FraudEvent) =>
      event.id === eventId ? { ...event, status: newStatus as any } : event
    ));
  };

  const handleActionUpdate = (eventId: string, actionId: string, newStatus: string) => {
    setFraudEvents((prev: FraudEvent[]) => prev.map((event: FraudEvent) =>
      event.id === eventId
        ? {
            ...event,
            actions: event.actions.map((action: any) =>
              action.id === actionId ? { ...action, status: newStatus as any } : action
            )
          }
        : event
    ));
  };

  const filteredEvents = fraudEvents.filter((event: FraudEvent) => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  const criticalEvents = fraudEvents.filter((event: FraudEvent) => event.severity === 'critical').length;
  const activeEvents = fraudEvents.filter((event: FraudEvent) => event.status !== 'resolved' && event.status !== 'false_positive').length;
  const totalFinancialImpact = fraudEvents.reduce((sum: number, event: FraudEvent) => sum + event.impact.financial, 0);
  const avgRiskScore = fraudEvents.length > 0 
    ? Math.round(fraudEvents.reduce((sum: number, event: FraudEvent) => sum + event.riskScore, 0) / fraudEvents.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fraud Detection & Escalation
              </CardTitle>
              <CardDescription>
                Real-time fraud monitoring and automated escalation workflow
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isMonitoring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isMonitoring ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Activity className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being investigated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Impact</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalFinancialImpact)}</div>
                <p className="text-xs text-muted-foreground">
                  Total at risk
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgRiskScore}</div>
                <p className="text-xs text-muted-foreground">
                  Out of 100
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-4">
            <TabsList>
              <TabsTrigger value="events">Fraud Events</TabsTrigger>
              <TabsTrigger value="rules">Detection Rules</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="payment_fraud">Payment Fraud</option>
                      <option value="account_takeover">Account Takeover</option>
                      <option value="identity_theft">Identity Theft</option>
                    </select>
                  </div>
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No fraud events found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEvents.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-destructive">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(event.severity)}>
                                {event.severity}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                              <Badge variant="outline">
                                Risk: {event.riskScore}%
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="font-medium mb-2">Affected User</h4>
                            <div className="text-sm text-muted-foreground">
                              <p>{event.affectedUser.name}</p>
                              <p>{event.affectedUser.email}</p>
                              <p>Account Age: {event.affectedUser.accountAge} days</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Transaction Details</h4>
                            <div className="text-sm text-muted-foreground">
                              <p>Amount: {formatCurrency(event.transaction.amount)}</p>
                              <p>Method: {event.transaction.method}</p>
                              <p>Merchant: {event.transaction.merchant}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Device Info</h4>
                            <div className="text-sm text-muted-foreground">
                              <p>Type: {event.device.type}</p>
                              <p>OS: {event.device.os}</p>
                              <p>New Device: {event.device.isNew ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Detection Rules</h3>
                <p className="text-muted-foreground">
                  Configure fraud detection rules and thresholds
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  View fraud detection analytics and trends
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


