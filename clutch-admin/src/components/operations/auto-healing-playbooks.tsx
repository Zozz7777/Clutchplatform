"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  AlertTriangle, 
  Target, 
  Activity,
  BarChart3,
  LineChart,
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
  DollarSign,
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
  Tablet,
  Brain,
  Calculator,
  PieChart as PieChartIcon,
  BarChart,
  LineChart as LineChartIcon,
  Zap,
  Shield,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  MapPin,
  Globe,
  Building,
  Car,
  Phone,
  Mail,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  FileText,
  CreditCard,
  Stethoscope,
  Heart as HeartIcon,
  Activity as ActivityIcon
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface HealingPlaybook {
  id: string;
  name: string;
  description: string;
  trigger: {
    condition: string;
    threshold: number;
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'testing' | 'failed';
  steps: {
    id: string;
    name: string;
    type: 'restart' | 'scale' | 'rollback' | 'cache_clear' | 'database_repair' | 'network_fix' | 'custom';
    order: number;
    timeout: number;
    retryCount: number;
    successCondition: string;
    failureAction: 'continue' | 'stop' | 'rollback';
  }[];
  metrics: {
    successRate: number;
    avgExecutionTime: number;
    totalExecutions: number;
    lastExecution?: string;
    lastSuccess?: string;
    lastFailure?: string;
  };
  scope: {
    services: string[];
    environments: string[];
    regions: string[];
  };
  safety: {
    maxExecutions: number;
    cooldownPeriod: number;
    rollbackEnabled: boolean;
    approvalRequired: boolean;
  };
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface AutoHealingPlaybooksProps {
  className?: string;
}

export default function AutoHealingPlaybooks({ className }: AutoHealingPlaybooksProps) {
  const [playbooks, setPlaybooks] = useState<HealingPlaybook[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<HealingPlaybook | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadAutoHealingData = () => {
      const mockPlaybooks: HealingPlaybook[] = [
        {
          id: 'playbook-001',
          name: 'Database Connection Pool Recovery',
          description: 'Automatically recover from database connection pool exhaustion',
          trigger: {
            condition: 'connection_pool_usage > 90%',
            threshold: 90,
            metric: 'connection_pool_usage',
            operator: 'greater_than'
          },
          severity: 'high',
          status: 'active',
          steps: [
            {
              id: 'step-1',
              name: 'Clear connection pool',
              type: 'database_repair',
              order: 1,
              timeout: 30,
              retryCount: 3,
              successCondition: 'connection_pool_usage < 70%',
              failureAction: 'continue'
            },
            {
              id: 'step-2',
              name: 'Restart database service',
              type: 'restart',
              order: 2,
              timeout: 60,
              retryCount: 2,
              successCondition: 'database_status = healthy',
              failureAction: 'rollback'
            },
            {
              id: 'step-3',
              name: 'Scale database instances',
              type: 'scale',
              order: 3,
              timeout: 120,
              retryCount: 1,
              successCondition: 'connection_pool_usage < 50%',
              failureAction: 'stop'
            }
          ],
          metrics: {
            successRate: 85,
            avgExecutionTime: 180,
            totalExecutions: 24,
            lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastSuccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastFailure: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          scope: {
            services: ['User Database', 'Payment Database', 'Analytics Database'],
            environments: ['staging', 'production'],
            regions: ['us-east-1', 'us-west-2', 'eu-west-1']
          },
          safety: {
            maxExecutions: 5,
            cooldownPeriod: 300,
            rollbackEnabled: true,
            approvalRequired: false
          },
          createdBy: 'Database Team',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'playbook-002',
          name: 'API Gateway Circuit Breaker',
          description: 'Automatically handle API gateway failures with circuit breaker pattern',
          trigger: {
            condition: 'error_rate > 5%',
            threshold: 5,
            metric: 'error_rate',
            operator: 'greater_than'
          },
          severity: 'critical',
          status: 'active',
          steps: [
            {
              id: 'step-1',
              name: 'Activate circuit breaker',
              type: 'custom',
              order: 1,
              timeout: 10,
              retryCount: 1,
              successCondition: 'circuit_breaker_status = open',
              failureAction: 'continue'
            },
            {
              id: 'step-2',
              name: 'Route traffic to backup',
              type: 'network_fix',
              order: 2,
              timeout: 30,
              retryCount: 2,
              successCondition: 'backup_traffic_routing = active',
              failureAction: 'rollback'
            },
            {
              id: 'step-3',
              name: 'Scale backup instances',
              type: 'scale',
              order: 3,
              timeout: 60,
              retryCount: 1,
              successCondition: 'backup_capacity > 100%',
              failureAction: 'stop'
            }
          ],
          metrics: {
            successRate: 92,
            avgExecutionTime: 95,
            totalExecutions: 18,
            lastExecution: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            lastSuccess: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            lastFailure: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          scope: {
            services: ['API Gateway', 'Load Balancer', 'Backup API'],
            environments: ['production'],
            regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
          },
          safety: {
            maxExecutions: 3,
            cooldownPeriod: 600,
            rollbackEnabled: true,
            approvalRequired: true
          },
          createdBy: 'Platform Team',
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'playbook-003',
          name: 'Memory Leak Recovery',
          description: 'Automatically recover from memory leaks in application services',
          trigger: {
            condition: 'memory_usage > 85%',
            threshold: 85,
            metric: 'memory_usage',
            operator: 'greater_than'
          },
          severity: 'medium',
          status: 'testing',
          steps: [
            {
              id: 'step-1',
              name: 'Clear application cache',
              type: 'cache_clear',
              order: 1,
              timeout: 20,
              retryCount: 2,
              successCondition: 'memory_usage < 70%',
              failureAction: 'continue'
            },
            {
              id: 'step-2',
              name: 'Restart application service',
              type: 'restart',
              order: 2,
              timeout: 45,
              retryCount: 1,
              successCondition: 'memory_usage < 60%',
              failureAction: 'rollback'
            }
          ],
          metrics: {
            successRate: 78,
            avgExecutionTime: 65,
            totalExecutions: 12,
            lastExecution: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            lastSuccess: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            lastFailure: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          scope: {
            services: ['User Service', 'Payment Service', 'Notification Service'],
            environments: ['staging'],
            regions: ['us-east-1', 'us-west-2']
          },
          safety: {
            maxExecutions: 10,
            cooldownPeriod: 180,
            rollbackEnabled: true,
            approvalRequired: false
          },
          createdBy: 'Application Team',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setPlaybooks(mockPlaybooks);
      setSelectedPlaybook(mockPlaybooks[0]);
    };

    loadAutoHealingData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setPlaybooks(prev => prev.map(playbook => ({
        ...playbook,
        metrics: {
          ...playbook.metrics,
          successRate: Math.min(100, playbook.metrics.successRate + (Math.random() - 0.5) * 2)
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-green-800';
      case 'inactive': return 'bg-muted text-gray-800';
      case 'testing': return 'bg-warning/10 text-yellow-800';
      case 'failed': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
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

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'restart': return <RotateCcw className="h-4 w-4" />;
      case 'scale': return <TrendingUp className="h-4 w-4" />;
      case 'rollback': return <ArrowDown className="h-4 w-4" />;
      case 'cache_clear': return <Trash2 className="h-4 w-4" />;
      case 'database_repair': return <Database className="h-4 w-4" />;
      case 'network_fix': return <Wifi className="h-4 w-4" />;
      case 'custom': return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 80) return 'text-warning';
    if (rate >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const filteredPlaybooks = playbooks.filter(playbook => {
    const typeMatch = filterType === 'all' || playbook.trigger.metric === filterType;
    const statusMatch = filterStatus === 'all' || playbook.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const activePlaybooks = playbooks.filter(p => p.status === 'active').length;
  const totalExecutions = playbooks.reduce((sum, p) => sum + p.metrics.totalExecutions, 0);
  const avgSuccessRate = playbooks.length > 0 
    ? Math.round(playbooks.reduce((sum, p) => sum + p.metrics.successRate, 0) / playbooks.length)
    : 0;
  const totalServices = playbooks.reduce((sum, p) => sum + p.scope.services.length, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Auto-Healing Playbooks
              </CardTitle>
              <CardDescription>
                System recovery automation and incident response
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
          {/* Playbook Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{activePlaybooks}</div>
              <div className="text-sm text-muted-foreground">Active Playbooks</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{totalExecutions}</div>
              <div className="text-sm text-muted-foreground">Total Executions</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgSuccessRate}%</div>
              <div className="text-sm text-muted-foreground">Avg Success Rate</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{totalServices}</div>
              <div className="text-sm text-muted-foreground">Protected Services</div>
            </div>
          </div>

          {/* Auto-Healing Overview */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Healing System</h4>
                <p className="text-sm text-muted-foreground">
                  Automated incident response and system recovery with intelligent playbooks
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-success">
                  {avgSuccessRate}%
                </div>
                <div className="text-sm text-muted-foreground">success rate</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgSuccessRate} className="h-2" />
            </div>
          </div>

          {/* Healing Playbooks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Healing Playbooks</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'connection_pool_usage', 'error_rate', 'memory_usage', 'cpu_usage', 'disk_usage', 'response_time'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'active', 'inactive', 'testing', 'failed'].map((status) => (
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
              {filteredPlaybooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedPlaybook?.id === playbook.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPlaybook(playbook)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{playbook.name}</div>
                        <div className="text-sm text-muted-foreground">{playbook.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(playbook.severity)}>
                        {playbook.severity}
                      </Badge>
                      <Badge className={getStatusColor(playbook.status)}>
                        {playbook.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {playbook.metrics.successRate.toFixed(0)}% success
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Trigger: {playbook.trigger.condition}</span>
                    <span>Executions: {playbook.metrics.totalExecutions}</span>
                    <span>Avg Time: {playbook.metrics.avgExecutionTime}s</span>
                    <span>Services: {playbook.scope.services.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Playbook Details */}
          {selectedPlaybook && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Playbook Details - {selectedPlaybook.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Playbook Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedPlaybook.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedPlaybook.severity)}>
                            {selectedPlaybook.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedPlaybook.status)}>
                            {selectedPlaybook.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Created By:</span>
                          <span className="font-medium">{selectedPlaybook.createdBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created At:</span>
                          <span className="font-medium">{new Date(selectedPlaybook.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Trigger Configuration</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Condition:</span>
                          <span className="font-medium">{selectedPlaybook.trigger.condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Threshold:</span>
                          <span className="font-medium">{selectedPlaybook.trigger.threshold}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Metric:</span>
                          <span className="font-medium">{selectedPlaybook.trigger.metric}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operator:</span>
                          <span className="font-medium">{selectedPlaybook.trigger.operator.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Scope</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Services ({selectedPlaybook.scope.services.length})</div>
                        <div className="space-y-1">
                          {selectedPlaybook.scope.services.map((service, index) => (
                            <div key={index} className="text-muted-foreground">• {service}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Environments ({selectedPlaybook.scope.environments.length})</div>
                        <div className="space-y-1">
                          {selectedPlaybook.scope.environments.map((env, index) => (
                            <div key={index} className="text-muted-foreground">• {env}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Regions ({selectedPlaybook.scope.regions.length})</div>
                        <div className="space-y-1">
                          {selectedPlaybook.scope.regions.map((region, index) => (
                            <div key={index} className="text-muted-foreground">• {region}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Healing Steps</h5>
                    <div className="space-y-2">
                      {selectedPlaybook.steps.map((step) => (
                        <div key={step.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStepTypeIcon(step.type)}
                              <span className="font-medium">{step.name}</span>
                            </div>
                            <Badge variant="outline">Step {step.order}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Type: {step.type.replace('_', ' ')}</div>
                              <div>Timeout: {step.timeout}s</div>
                            </div>
                            <div>
                              <div>Retries: {step.retryCount}</div>
                              <div>Failure Action: {step.failureAction}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <div className="font-medium">Success Condition:</div>
                            <div className="text-muted-foreground">{step.successCondition}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Performance Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className={`font-medium ${getSuccessRateColor(selectedPlaybook.metrics.successRate)}`}>
                          {selectedPlaybook.metrics.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Execution Time:</span>
                        <span className="font-medium">{selectedPlaybook.metrics.avgExecutionTime} seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Executions:</span>
                        <span className="font-medium">{selectedPlaybook.metrics.totalExecutions}</span>
                      </div>
                      {selectedPlaybook.metrics.lastExecution && (
                        <div className="flex justify-between">
                          <span>Last Execution:</span>
                          <span className="font-medium">{new Date(selectedPlaybook.metrics.lastExecution).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPlaybook.metrics.lastSuccess && (
                        <div className="flex justify-between">
                          <span>Last Success:</span>
                          <span className="font-medium">{new Date(selectedPlaybook.metrics.lastSuccess).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPlaybook.metrics.lastFailure && (
                        <div className="flex justify-between">
                          <span>Last Failure:</span>
                          <span className="font-medium">{new Date(selectedPlaybook.metrics.lastFailure).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Safety Configuration</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Executions:</span>
                        <span className="font-medium">{selectedPlaybook.safety.maxExecutions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cooldown Period:</span>
                        <span className="font-medium">{selectedPlaybook.safety.cooldownPeriod} seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rollback Enabled:</span>
                        <Badge className={selectedPlaybook.safety.rollbackEnabled ? 'bg-success/10 text-green-800' : 'bg-destructive/10 text-red-800'}>
                          {selectedPlaybook.safety.rollbackEnabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Approval Required:</span>
                        <Badge className={selectedPlaybook.safety.approvalRequired ? 'bg-warning/10 text-yellow-800' : 'bg-success/10 text-green-800'}>
                          {selectedPlaybook.safety.approvalRequired ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Execute Playbook
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Playbook
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


