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
  Target, 
  Activity,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  RefreshCw,
  Brain,
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
  Unlock,
  Scale,
  Award,
  BookOpen,
  Clipboard,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info as InfoIcon,
  RotateCcw as RollbackIcon,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ModelDeployment {
  id: string;
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deployed' | 'rolling_back' | 'rolled_back' | 'failed' | 'monitoring';
  accuracy: number;
  performance: {
    latency: number;
    throughput: number;
    errorRate: number;
    resourceUsage: number;
  };
  metrics: {
    metric: string;
    current: number;
    baseline: number;
    threshold: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
  }[];
  safetyChecks: {
    accuracy: boolean;
    performance: boolean;
    bias: boolean;
    compliance: boolean;
    dataQuality: boolean;
    lastCheck: string;
  };
  rollbackTriggers: {
    id: string;
    type: 'accuracy_drop' | 'performance_degradation' | 'error_spike' | 'bias_increase' | 'compliance_violation';
    threshold: number;
    current: number;
    triggered: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }[];
  rollbackHistory: {
    id: string;
    timestamp: string;
    reason: string;
    triggeredBy: string;
    previousVersion: string;
    rollbackVersion: string;
    duration: number;
    impact: {
      users: number;
      revenue: number;
      downtime: number;
    };
    status: 'successful' | 'failed' | 'partial';
  }[];
  deployment: {
    deployedAt: string;
    deployedBy: string;
    previousVersion?: string;
    canaryPercentage: number;
    fullDeployment: boolean;
  };
}

interface SafetyRule {
  id: string;
  name: string;
  description: string;
  type: 'accuracy' | 'performance' | 'bias' | 'compliance' | 'error_rate';
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  autoRollback: boolean;
  gracePeriod: number; // minutes
  lastTriggered: string;
  triggerCount: number;
  effectiveness: number; // 0-100
}

interface AutoRollbackSafetyProps {
  className?: string;
}

export default function AutoRollbackSafety({ className }: AutoRollbackSafetyProps) {
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [safetyRules, setSafetyRules] = useState<SafetyRule[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<ModelDeployment | null>(null);
  const [isSafetyEnabled, setIsSafetyEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadAutoRollbackData = () => {
      const mockDeployments: ModelDeployment[] = [
        {
          id: 'deployment-001',
          name: 'Customer Churn Predictor',
          version: 'v2.1.3',
          environment: 'production',
          status: 'monitoring',
          accuracy: 87.5,
          performance: {
            latency: 45,
            throughput: 1000,
            errorRate: 0.8,
            resourceUsage: 65
          },
          metrics: [
            {
              metric: 'Accuracy',
              current: 87.5,
              baseline: 88.2,
              threshold: 85.0,
              status: 'healthy',
              trend: 'stable'
            },
            {
              metric: 'Latency',
              current: 45,
              baseline: 42,
              threshold: 50,
              status: 'healthy',
              trend: 'stable'
            },
            {
              metric: 'Error Rate',
              current: 0.8,
              baseline: 0.5,
              threshold: 1.0,
              status: 'warning',
              trend: 'declining'
            },
            {
              metric: 'Bias Score',
              current: 15,
              baseline: 12,
              threshold: 20,
              status: 'healthy',
              trend: 'stable'
            }
          ],
          safetyChecks: {
            accuracy: true,
            performance: true,
            bias: true,
            compliance: true,
            dataQuality: true,
            lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          rollbackTriggers: [
            {
              id: 'trigger-001',
              type: 'accuracy_drop',
              threshold: 85.0,
              current: 87.5,
              triggered: false,
              severity: 'high',
              description: 'Model accuracy drops below 85%'
            },
            {
              id: 'trigger-002',
              type: 'performance_degradation',
              threshold: 50,
              current: 45,
              triggered: false,
              severity: 'medium',
              description: 'Latency exceeds 50ms'
            },
            {
              id: 'trigger-003',
              type: 'error_spike',
              threshold: 1.0,
              current: 0.8,
              triggered: false,
              severity: 'high',
              description: 'Error rate exceeds 1%'
            },
            {
              id: 'trigger-004',
              type: 'bias_increase',
              threshold: 20,
              current: 15,
              triggered: false,
              severity: 'medium',
              description: 'Bias score exceeds 20%'
            }
          ],
          rollbackHistory: [
            {
              id: 'rollback-001',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              reason: 'Accuracy dropped below threshold',
              triggeredBy: 'Auto-Rollback System',
              previousVersion: 'v2.1.2',
              rollbackVersion: 'v2.1.1',
              duration: 3,
              impact: {
                users: 5000,
                revenue: 2500,
                downtime: 3
              },
              status: 'successful'
            }
          ],
          deployment: {
            deployedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            deployedBy: 'Dr. Sarah Chen',
            previousVersion: 'v2.1.2',
            canaryPercentage: 100,
            fullDeployment: true
          }
        },
        {
          id: 'deployment-002',
          name: 'Dynamic Pricing Engine',
          version: 'v1.4.2',
          environment: 'production',
          status: 'deployed',
          accuracy: 92.3,
          performance: {
            latency: 25,
            throughput: 2000,
            errorRate: 0.3,
            resourceUsage: 45
          },
          metrics: [
            {
              metric: 'Accuracy',
              current: 92.3,
              baseline: 91.8,
              threshold: 90.0,
              status: 'healthy',
              trend: 'improving'
            },
            {
              metric: 'Latency',
              current: 25,
              baseline: 28,
              threshold: 30,
              status: 'healthy',
              trend: 'improving'
            },
            {
              metric: 'Error Rate',
              current: 0.3,
              baseline: 0.4,
              threshold: 0.5,
              status: 'healthy',
              trend: 'improving'
            },
            {
              metric: 'Bias Score',
              current: 8,
              baseline: 10,
              threshold: 15,
              status: 'healthy',
              trend: 'improving'
            }
          ],
          safetyChecks: {
            accuracy: true,
            performance: true,
            bias: true,
            compliance: true,
            dataQuality: true,
            lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          },
          rollbackTriggers: [
            {
              id: 'trigger-005',
              type: 'accuracy_drop',
              threshold: 90.0,
              current: 92.3,
              triggered: false,
              severity: 'high',
              description: 'Model accuracy drops below 90%'
            },
            {
              id: 'trigger-006',
              type: 'performance_degradation',
              threshold: 30,
              current: 25,
              triggered: false,
              severity: 'medium',
              description: 'Latency exceeds 30ms'
            }
          ],
          rollbackHistory: [],
          deployment: {
            deployedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            deployedBy: 'Dr. Michael Rodriguez',
            canaryPercentage: 100,
            fullDeployment: true
          }
        },
        {
          id: 'deployment-003',
          name: 'Fraud Detection System',
          version: 'v3.0.1',
          environment: 'staging',
          status: 'rolling_back',
          accuracy: 94.8,
          performance: {
            latency: 15,
            throughput: 5000,
            errorRate: 0.1,
            resourceUsage: 80
          },
          metrics: [
            {
              metric: 'Accuracy',
              current: 94.8,
              baseline: 95.2,
              threshold: 94.0,
              status: 'healthy',
              trend: 'stable'
            },
            {
              metric: 'Latency',
              current: 15,
              baseline: 12,
              threshold: 20,
              status: 'healthy',
              trend: 'stable'
            },
            {
              metric: 'Error Rate',
              current: 0.1,
              baseline: 0.05,
              threshold: 0.2,
              status: 'warning',
              trend: 'declining'
            },
            {
              metric: 'Bias Score',
              current: 25,
              baseline: 20,
              threshold: 30,
              status: 'warning',
              trend: 'declining'
            }
          ],
          safetyChecks: {
            accuracy: true,
            performance: true,
            bias: false,
            compliance: true,
            dataQuality: true,
            lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString()
          },
          rollbackTriggers: [
            {
              id: 'trigger-007',
              type: 'bias_increase',
              threshold: 30,
              current: 25,
              triggered: false,
              severity: 'high',
              description: 'Bias score exceeds 30%'
            },
            {
              id: 'trigger-008',
              type: 'error_spike',
              threshold: 0.2,
              current: 0.1,
              triggered: false,
              severity: 'medium',
              description: 'Error rate exceeds 0.2%'
            }
          ],
          rollbackHistory: [
            {
              id: 'rollback-002',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              reason: 'Bias score approaching threshold',
              triggeredBy: 'Auto-Rollback System',
              previousVersion: 'v3.0.1',
              rollbackVersion: 'v2.9.8',
              duration: 2,
              impact: {
                users: 1000,
                revenue: 500,
                downtime: 2
              },
              status: 'successful'
            }
          ],
          deployment: {
            deployedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            deployedBy: 'Dr. Lisa Wang',
            previousVersion: 'v2.9.8',
            canaryPercentage: 50,
            fullDeployment: false
          }
        }
      ];

      const mockSafetyRules: SafetyRule[] = [
        {
          id: 'rule-001',
          name: 'Accuracy Drop Protection',
          description: 'Automatically rollback if model accuracy drops below threshold',
          type: 'accuracy',
          threshold: 85.0,
          operator: 'less_than',
          severity: 'high',
          isActive: true,
          autoRollback: true,
          gracePeriod: 5,
          lastTriggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          triggerCount: 3,
          effectiveness: 95
        },
        {
          id: 'rule-002',
          name: 'Performance Degradation',
          description: 'Rollback if latency exceeds acceptable limits',
          type: 'performance',
          threshold: 50,
          operator: 'greater_than',
          severity: 'medium',
          isActive: true,
          autoRollback: true,
          gracePeriod: 10,
          lastTriggered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          triggerCount: 1,
          effectiveness: 88
        },
        {
          id: 'rule-003',
          name: 'Bias Increase Alert',
          description: 'Rollback if bias score exceeds acceptable limits',
          type: 'bias',
          threshold: 20,
          operator: 'greater_than',
          severity: 'high',
          isActive: true,
          autoRollback: true,
          gracePeriod: 15,
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          triggerCount: 2,
          effectiveness: 92
        },
        {
          id: 'rule-004',
          name: 'Error Rate Spike',
          description: 'Rollback if error rate spikes above threshold',
          type: 'error_rate',
          threshold: 1.0,
          operator: 'greater_than',
          severity: 'critical',
          isActive: true,
          autoRollback: true,
          gracePeriod: 2,
          lastTriggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          triggerCount: 1,
          effectiveness: 98
        }
      ];

      setDeployments(mockDeployments);
      setSafetyRules(mockSafetyRules);
      setSelectedDeployment(mockDeployments[0]);
    };

    loadAutoRollbackData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDeployments(prev => prev.map(deployment => ({
        ...deployment,
        metrics: deployment.metrics.map(metric => ({
          ...metric,
          current: metric.current + (Math.random() - 0.5) * 0.1
        }))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-success/10 text-green-800';
      case 'rolling_back': return 'bg-warning/10 text-orange-800';
      case 'rolled_back': return 'bg-destructive/10 text-red-800';
      case 'failed': return 'bg-destructive/10 text-red-800';
      case 'monitoring': return 'bg-primary/10 text-blue-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'bg-primary/10 text-blue-800';
      case 'staging': return 'bg-warning/10 text-yellow-800';
      case 'production': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-green-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'critical': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-success" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Minus className="h-4 w-4 text-primary" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRollbackStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'bg-success/10 text-green-800';
      case 'failed': return 'bg-destructive/10 text-red-800';
      case 'partial': return 'bg-warning/10 text-yellow-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const filteredDeployments = deployments.filter(deployment => {
    const environmentMatch = filterEnvironment === 'all' || deployment.environment === filterEnvironment;
    const statusMatch = filterStatus === 'all' || deployment.status === filterStatus;
    return environmentMatch && statusMatch;
  });

  const productionDeployments = deployments.filter(d => d.environment === 'production').length;
  const activeRollbacks = deployments.filter(d => d.status === 'rolling_back').length;
  const totalRollbacks = deployments.reduce((sum, d) => sum + d.rollbackHistory.length, 0);
  const avgAccuracy = deployments.length > 0 
    ? Math.round(deployments.reduce((sum, d) => sum + d.accuracy, 0) / deployments.length * 10) / 10
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Auto-Rollback Safety Switch
              </CardTitle>
              <CardDescription>
                Model accuracy monitoring and automated rollback system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSafetyEnabled(!isSafetyEnabled)}
                className={isSafetyEnabled ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}
              >
                {isSafetyEnabled ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />}
                {isSafetyEnabled ? 'Safety Enabled' : 'Safety Disabled'}
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
          {/* Safety Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{productionDeployments}</div>
              <div className="text-sm text-muted-foreground">Production Models</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{activeRollbacks}</div>
              <div className="text-sm text-muted-foreground">Active Rollbacks</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{totalRollbacks}</div>
              <div className="text-sm text-muted-foreground">Total Rollbacks</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgAccuracy}%</div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </div>
          </div>

          {/* Safety Status */}
          <div className={`p-4 border rounded-[0.625rem] ${isSafetyEnabled ? 'bg-success/10 border-green-200' : 'bg-destructive/10 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isSafetyEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  Auto-Rollback Safety {isSafetyEnabled ? 'Enabled' : 'Disabled'}
                </h4>
                <p className={`text-sm ${isSafetyEnabled ? 'text-success' : 'text-destructive'}`}>
                  {isSafetyEnabled 
                    ? 'Models are protected by automated rollback triggers'
                    : 'Models are not protected - manual intervention required'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${isSafetyEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  {safetyRules.filter(rule => rule.isActive).length} Active Rules
                </div>
                <div className={`text-sm ${isSafetyEnabled ? 'text-success' : 'text-destructive'}`}>
                  {isSafetyEnabled ? 'Monitoring Active' : 'Monitoring Disabled'}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Rules */}
          <div>
            <h4 className="font-medium mb-3">Safety Rules</h4>
            <div className="space-y-2">
              {safetyRules.map((rule) => (
                <div key={rule.id} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={rule.isActive ? 'bg-success/10 text-green-800' : 'bg-muted text-gray-800'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className={rule.autoRollback ? 'bg-primary/10 text-blue-800' : 'bg-warning/10 text-yellow-800'}>
                        {rule.autoRollback ? 'Auto-Rollback' : 'Alert Only'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Threshold: {rule.threshold} • Grace Period: {rule.gracePeriod}min</span>
                    <span>Triggers: {rule.triggerCount} • Effectiveness: {rule.effectiveness}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Deployments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Model Deployments</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Environment:</span>
                {['all', 'development', 'staging', 'production'].map((env) => (
                  <Button
                    key={env}
                    variant={filterEnvironment === env ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEnvironment(env)}
                  >
                    {env}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'deployed', 'rolling_back', 'rolled_back', 'failed', 'monitoring'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredDeployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedDeployment?.id === deployment.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDeployment(deployment)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Brain className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{deployment.name}</div>
                        <div className="text-sm text-muted-foreground">v{deployment.version} • {deployment.environment}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        {deployment.accuracy}% accuracy
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Latency: {deployment.performance.latency}ms</span>
                    <span>Error Rate: {deployment.performance.errorRate}%</span>
                    <span>Rollbacks: {deployment.rollbackHistory.length}</span>
                    <span>Deployed: {new Date(deployment.deployment.deployedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Deployment Details */}
          {selectedDeployment && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Deployment Details - {selectedDeployment.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="triggers">Rollback Triggers</TabsTrigger>
                  <TabsTrigger value="history">Rollback History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Deployment Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{selectedDeployment.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Environment:</span>
                          <Badge className={getEnvironmentColor(selectedDeployment.environment)}>
                            {selectedDeployment.environment}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedDeployment.status)}>
                            {selectedDeployment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">{selectedDeployment.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deployed By:</span>
                          <span className="font-medium">{selectedDeployment.deployment.deployedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deployed At:</span>
                          <span className="font-medium">{new Date(selectedDeployment.deployment.deployedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Performance Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span className="font-medium">{selectedDeployment.performance.latency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="font-medium">{formatNumber(selectedDeployment.performance.throughput)} req/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span className="font-medium">{selectedDeployment.performance.errorRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resource Usage:</span>
                          <span className="font-medium">{selectedDeployment.performance.resourceUsage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Safety Checks</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <Badge className={selectedDeployment.safetyChecks.accuracy ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                            {selectedDeployment.safetyChecks.accuracy ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Performance:</span>
                          <Badge className={selectedDeployment.safetyChecks.performance ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                            {selectedDeployment.safetyChecks.performance ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Bias:</span>
                          <Badge className={selectedDeployment.safetyChecks.bias ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                            {selectedDeployment.safetyChecks.bias ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance:</span>
                          <Badge className={selectedDeployment.safetyChecks.compliance ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                            {selectedDeployment.safetyChecks.compliance ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Data Quality:</span>
                          <Badge className={selectedDeployment.safetyChecks.dataQuality ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                            {selectedDeployment.safetyChecks.dataQuality ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Check:</span>
                          <span className="font-medium">{new Date(selectedDeployment.safetyChecks.lastCheck).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Model Metrics</h5>
                    <div className="space-y-2">
                      {selectedDeployment.metrics.map((metric) => (
                        <div key={metric.metric} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{metric.metric}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(metric.trend)}
                              <span className={`text-sm font-medium ${getMetricStatusColor(metric.status)}`}>
                                {metric.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Current: {metric.current}</span>
                            <span>Baseline: {metric.baseline}</span>
                            <span>Threshold: {metric.threshold}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="triggers" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Rollback Triggers</h5>
                    <div className="space-y-2">
                      {selectedDeployment.rollbackTriggers.map((trigger) => (
                        <div key={trigger.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{trigger.description}</span>
                              <Badge className={getSeverityColor(trigger.severity)}>
                                {trigger.severity}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Current: {trigger.current}</span>
                              <span className="text-sm font-medium">Threshold: {trigger.threshold}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type: {trigger.type.replace('_', ' ')} • 
                            Triggered: {trigger.triggered ? 'Yes' : 'No'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Rollback History</h5>
                    {selectedDeployment.rollbackHistory.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDeployment.rollbackHistory.map((rollback) => (
                          <div key={rollback.id} className="p-3 border rounded-[0.625rem]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{rollback.reason}</span>
                                <Badge className={getRollbackStatusColor(rollback.status)}>
                                  {rollback.status}
                                </Badge>
                              </div>
                              <span className="text-sm font-medium">
                                {new Date(rollback.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              Triggered by: {rollback.triggeredBy} • 
                              Duration: {rollback.duration} minutes
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Impact: {formatNumber(rollback.impact.users)} users, {formatCurrency(rollback.impact.revenue)} revenue, {rollback.impact.downtime}min downtime
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No rollback history for this deployment
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <RollbackIcon className="h-4 w-4 mr-2" />
                  Manual Rollback
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
                  Refresh Metrics
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


