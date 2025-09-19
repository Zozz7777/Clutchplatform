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
  type: 'payment_fraud' | 'account_takeover' | 'identity_theft' | 'chargeback' | 'suspicious_activity' | 'device_fraud';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
  title: string;
  description: string;
  detectedAt: string;
  lastUpdated: string;
  riskScore: number; // 0-100
  confidence: number; // 0-100
  affectedUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountAge: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    merchant: string;
    location: string;
    timestamp: string;
  };
  device?: {
    id: string;
    type: string;
    os: string;
    browser: string;
    ip: string;
    location: string;
    isNew: boolean;
  };
  indicators: {
    type: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    weight: number;
  }[];
  actions: {
    id: string;
    type: 'freeze_account' | 'block_transaction' | 'require_verification' | 'flag_for_review' | 'notify_user' | 'escalate_to_team';
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp: string;
    automated: boolean;
  }[];
  escalation: {
    level: number;
    assignedTo: string;
    escalatedAt: string;
    reason: string;
    nextReview: string;
  };
  impact: {
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
  category: 'payment' | 'account' | 'device' | 'behavioral' | 'geographic';
  severity: 'critical' | 'high' | 'medium' | 'low';
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
      console.error('Failed to load fraud data:', error);
      setFraudEvents([]);
      setFraudRules([]);
    }
  };

  useEffect(() => {

    loadFraudData();
  }, []);

  // Keep mock data as fallback for development
  const getMockFraudEvents = (): FraudEvent[] => [
        {
          id: 'fraud-001',
          type: 'payment_fraud',
          severity: 'critical',
          status: 'escalated',
          title: 'Suspicious High-Value Transaction',
          description: 'Multiple high-value transactions from new device in different location',
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          riskScore: 95,
          confidence: 92,
          affectedUser: {
            id: 'user-001',
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+1-555-0123',
            accountAge: 45,
            riskLevel: 'medium'
          },
          transaction: {
            id: 'txn-001',
            amount: 2500,
            currency: 'USD',
            method: 'credit_card',
            merchant: 'Electronics Store',
            location: 'New York, NY',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          device: {
            id: 'device-001',
            type: 'mobile',
            os: 'iOS 15.0',
            browser: 'Safari',
            ip: '192.168.1.100',
            location: 'Miami, FL',
            isNew: true
          },
          indicators: [
            {
              type: 'unusual_location',
              description: 'Transaction from location not in user history',
              severity: 'high',
              weight: 0.3
            },
            {
              type: 'new_device',
              description: 'Transaction from new, unregistered device',
              severity: 'high',
              weight: 0.25
            },
            {
              type: 'high_value',
              description: 'Transaction amount significantly higher than usual',
              severity: 'medium',
              weight: 0.2
            },
            {
              type: 'velocity',
              description: 'Multiple transactions in short time period',
              severity: 'critical',
              weight: 0.25
            }
          ],
          actions: [
            {
              id: 'action-001',
              type: 'block_transaction',
              description: 'Blocked suspicious transaction',
              status: 'completed',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-002',
              type: 'freeze_account',
              description: 'Temporarily frozen user account',
              status: 'completed',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-003',
              type: 'escalate_to_team',
              description: 'Escalated to fraud investigation team',
              status: 'completed',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              automated: false
            }
          ],
          escalation: {
            level: 2,
            assignedTo: 'Sarah Johnson',
            escalatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            reason: 'High risk score with multiple fraud indicators',
            nextReview: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          },
          impact: {
            financial: 2500,
            reputation: 75,
            operational: 60,
            customer: 85
          }
        },
        {
          id: 'fraud-002',
          type: 'account_takeover',
          severity: 'high',
          status: 'investigating',
          title: 'Potential Account Takeover Attempt',
          description: 'Login attempts from multiple locations with different devices',
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          riskScore: 78,
          confidence: 85,
          affectedUser: {
            id: 'user-002',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@email.com',
            phone: '+1-555-0124',
            accountAge: 120,
            riskLevel: 'low'
          },
          device: {
            id: 'device-002',
            type: 'desktop',
            os: 'Windows 11',
            browser: 'Chrome',
            ip: '203.0.113.42',
            location: 'Los Angeles, CA',
            isNew: true
          },
          indicators: [
            {
              type: 'multiple_locations',
              description: 'Login attempts from 3 different locations',
              severity: 'high',
              weight: 0.4
            },
            {
              type: 'device_fingerprint',
              description: 'Device fingerprint mismatch',
              severity: 'medium',
              weight: 0.3
            },
            {
              type: 'login_pattern',
              description: 'Unusual login time pattern',
              severity: 'medium',
              weight: 0.3
            }
          ],
          actions: [
            {
              id: 'action-004',
              type: 'require_verification',
              description: 'Required additional verification',
              status: 'completed',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-005',
              type: 'notify_user',
              description: 'Sent security alert to user',
              status: 'completed',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              automated: true
            }
          ],
          escalation: {
            level: 1,
            assignedTo: 'Mike Chen',
            escalatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            reason: 'Multiple suspicious login attempts',
            nextReview: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
          },
          impact: {
            financial: 0,
            reputation: 60,
            operational: 40,
            customer: 70
          }
        },
        {
          id: 'fraud-003',
          type: 'chargeback',
          severity: 'medium',
          status: 'resolved',
          title: 'Chargeback Dispute',
          description: 'Customer disputed transaction claiming unauthorized use',
          detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          riskScore: 45,
          confidence: 70,
          affectedUser: {
            id: 'user-003',
            name: 'David Kim',
            email: 'david.kim@email.com',
            phone: '+1-555-0125',
            accountAge: 30,
            riskLevel: 'medium'
          },
          transaction: {
            id: 'txn-002',
            amount: 150,
            currency: 'USD',
            method: 'debit_card',
            merchant: 'Online Store',
            location: 'San Francisco, CA',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          },
          indicators: [
            {
              type: 'chargeback_pattern',
              description: 'First chargeback for this user',
              severity: 'low',
              weight: 0.5
            },
            {
              type: 'transaction_legitimacy',
              description: 'Transaction appears legitimate based on history',
              severity: 'low',
              weight: 0.5
            }
          ],
          actions: [
            {
              id: 'action-006',
              type: 'flag_for_review',
              description: 'Flagged for manual review',
              status: 'completed',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              automated: true
            },
            {
              id: 'action-007',
              type: 'escalate_to_team',
              description: 'Escalated to dispute resolution team',
              status: 'completed',
              timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
              automated: false
            }
          ],
          escalation: {
            level: 1,
            assignedTo: 'Lisa Wang',
            escalatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
            reason: 'Standard chargeback dispute process',
            nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          impact: {
            financial: 150,
            reputation: 30,
            operational: 20,
            customer: 40
          }
        }
      ];

      const mockFraudRules: FraudRule[] = [
        {
          id: 'rule-001',
          name: 'High-Value Transaction Alert',
          description: 'Alert for transactions above $1000 from new devices',
          category: 'payment',
          severity: 'high',
          isActive: true,
          threshold: 1000,
          conditions: ['amount > 1000', 'new_device = true'],
          actions: ['block_transaction', 'require_verification'],
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          triggerCount: 15,
          falsePositiveRate: 12
        },
        {
          id: 'rule-002',
          name: 'Multiple Location Login',
          description: 'Alert for login attempts from multiple locations',
          category: 'account',
          severity: 'medium',
          isActive: true,
          threshold: 3,
          conditions: ['location_count > 3', 'time_window < 1h'],
          actions: ['require_verification', 'notify_user'],
          lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          triggerCount: 8,
          falsePositiveRate: 25
        },
        {
          id: 'rule-003',
          name: 'Velocity Check',
          description: 'Alert for multiple transactions in short time',
          category: 'behavioral',
          severity: 'critical',
          isActive: true,
          threshold: 5,
          conditions: ['transaction_count > 5', 'time_window < 10m'],
          actions: ['freeze_account', 'escalate_to_team'],
          lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          triggerCount: 3,
          falsePositiveRate: 8
        }
      ];

      setFraudEvents(getMockFraudEvents());
      setFraudRules(getMockFraudRules());
      setSelectedEvent(getMockFraudEvents()[0]);
    };

    loadFraudData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setFraudEvents(prev => prev.map(event => ({
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
      case 'detected': return 'bg-destructive/10 text-red-800';
      case 'investigating': return 'bg-warning/10 text-yellow-800';
      case 'escalated': return 'bg-warning/10 text-orange-800';
      case 'resolved': return 'bg-success/10 text-green-800';
      case 'false_positive': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_fraud': return <CreditCard className="h-4 w-4" />;
      case 'account_takeover': return <User className="h-4 w-4" />;
      case 'identity_theft': return <Shield className="h-4 w-4" />;
      case 'chargeback': return <DollarSign className="h-4 w-4" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4" />;
      case 'device_fraud': return <Smartphone className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'freeze_account': return <Lock className="h-4 w-4" />;
      case 'block_transaction': return <XCircle className="h-4 w-4" />;
      case 'require_verification': return <Shield className="h-4 w-4" />;
      case 'flag_for_review': return <Flag className="h-4 w-4" />;
      case 'notify_user': return <Bell className="h-4 w-4" />;
      case 'escalate_to_team': return <ArrowUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-yellow-800';
      case 'in_progress': return 'bg-primary/10 text-blue-800';
      case 'completed': return 'bg-success/10 text-green-800';
      case 'failed': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleEventStatusUpdate = (eventId: string, newStatus: string) => {
    setFraudEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, status: newStatus as string } : event
    ));
  };

  const handleActionUpdate = (eventId: string, actionId: string, newStatus: string) => {
    setFraudEvents(prev => prev.map(event =>
      event.id === eventId
        ? {
            ...event,
            actions: event.actions.map(action =>
              action.id === actionId ? { ...action, status: newStatus as string } : action
            )
          }
        : event
    ));
  };

  const filteredEvents = fraudEvents.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  const criticalEvents = fraudEvents.filter(event => event.severity === 'critical').length;
  const activeEvents = fraudEvents.filter(event => event.status !== 'resolved' && event.status !== 'false_positive').length;
  const totalFinancialImpact = fraudEvents.reduce((sum, event) => sum + event.impact.financial, 0);
  const avgRiskScore = fraudEvents.length > 0 
    ? Math.round(fraudEvents.reduce((sum, event) => sum + event.riskScore, 0) / fraudEvents.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Fraud Escalation Workflow
              </CardTitle>
              <CardDescription>
                Auto-freeze and escalation system for fraud detection and response
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-green-800' : ''}
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
          {/* Fraud Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalEvents}</div>
              <div className="text-sm text-muted-foreground">Critical Events</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{activeEvents}</div>
              <div className="text-sm text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgRiskScore}</div>
              <div className="text-sm text-muted-foreground">Avg Risk Score</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalFinancialImpact)}</div>
              <div className="text-sm text-muted-foreground">Financial Impact</div>
            </div>
          </div>

          {/* Fraud Rules */}
          <div>
            <h4 className="font-medium mb-3">Active Fraud Rules</h4>
            <div className="space-y-2">
              {fraudRules.map((rule) => (
                <div key={rule.id} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Threshold: {rule.threshold}</span>
                      <span className="text-sm font-medium">Triggers: {rule.triggerCount}</span>
                      <span className="text-sm font-medium">FP Rate: {rule.falsePositiveRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Fraud Events</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'payment_fraud', 'account_takeover', 'identity_theft', 'chargeback', 'suspicious_activity', 'device_fraud'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Severity:</span>
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
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {event.riskScore}% risk
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>User: {event.affectedUser.name}</span>
                    <span>Financial Impact: {formatCurrency(event.impact.financial)}</span>
                    <span>Detected: {new Date(event.detectedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Event Details - {selectedEvent.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="indicators">Indicators</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="escalation">Escalation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Event Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedEvent.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedEvent.severity)}>
                            {selectedEvent.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedEvent.status)}>
                            {selectedEvent.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Score:</span>
                          <span className="font-medium">{selectedEvent.riskScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedEvent.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Detected:</span>
                          <span className="font-medium">{new Date(selectedEvent.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Affected User</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedEvent.affectedUser.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedEvent.affectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-medium">{selectedEvent.affectedUser.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Age:</span>
                          <span className="font-medium">{selectedEvent.affectedUser.accountAge} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <Badge className={getSeverityColor(selectedEvent.affectedUser.riskLevel)}>
                            {selectedEvent.affectedUser.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.transaction && (
                    <div>
                      <h5 className="font-medium mb-2">Transaction Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">{formatCurrency(selectedEvent.transaction.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="font-medium">{selectedEvent.transaction.method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Merchant:</span>
                            <span className="font-medium">{selectedEvent.transaction.merchant}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{selectedEvent.transaction.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timestamp:</span>
                            <span className="font-medium">{new Date(selectedEvent.transaction.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.device && (
                    <div>
                      <h5 className="font-medium mb-2">Device Information</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium">{selectedEvent.device.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>OS:</span>
                            <span className="font-medium">{selectedEvent.device.os}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Browser:</span>
                            <span className="font-medium">{selectedEvent.device.browser}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>IP:</span>
                            <span className="font-medium">{selectedEvent.device.ip}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">{selectedEvent.device.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>New Device:</span>
                            <span className="font-medium">{selectedEvent.device.isNew ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="indicators" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Fraud Indicators</h5>
                    <div className="space-y-2">
                      {selectedEvent.indicators.map((indicator, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{indicator.type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(indicator.severity)}>
                                {indicator.severity}
                              </Badge>
                              <span className="text-sm font-medium">Weight: {indicator.weight}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{indicator.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Actions Taken</h5>
                    <div className="space-y-2">
                      {selectedEvent.actions.map((action) => (
                        <div key={action.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getActionIcon(action.type)}
                              <span className="font-medium">{action.description}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getActionStatusColor(action.status)}>
                                {action.status}
                              </Badge>
                              {action.automated && (
                                <Badge variant="outline" className="text-xs">
                                  Automated
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(action.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="escalation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Escalation Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{selectedEvent.escalation.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned To:</span>
                        <span className="font-medium">{selectedEvent.escalation.assignedTo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escalated At:</span>
                        <span className="font-medium">{new Date(selectedEvent.escalation.escalatedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Review:</span>
                        <span className="font-medium">{new Date(selectedEvent.escalation.nextReview).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Reason:</span>
                      <p className="text-sm text-muted-foreground mt-1">{selectedEvent.escalation.reason}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  False Positive
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
