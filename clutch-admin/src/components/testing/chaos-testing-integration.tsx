"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  AlertTriangle, 
  Target, 
  Activity,
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
  XCircle2,
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
  TestTube,
  Bug,
  Shield,
  Wrench,
  Trash2,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';

interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  type: 'network' | 'cpu' | 'memory' | 'disk' | 'service' | 'database' | 'api' | 'custom';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target: {
    service: string;
    environment: 'development' | 'staging' | 'production';
    region: string;
    instances: number;
  };
  parameters: {
    duration: number; // minutes
    intensity: number; // 0-100
    frequency: number; // events per minute
    scope: 'single' | 'multiple' | 'all';
  };
  schedule: {
    startTime: string;
    endTime: string;
    timezone: string;
    recurrence?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  metrics: {
    metric: string;
    baseline: number;
    current: number;
    threshold: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
  results: {
    success: boolean;
    duration: number;
    impact: {
      users: number;
      revenue: number;
      downtime: number;
      errors: number;
    };
    recovery: {
      time: number;
      method: string;
      automated: boolean;
    };
    lessons: string[];
  };
  safety: {
    autoStop: boolean;
    maxDuration: number;
    rollbackTriggers: string[];
    monitoring: boolean;
  };
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

interface ChaosTestingIntegrationProps {
  className?: string;
}

export default function ChaosTestingIntegration({ className }: ChaosTestingIntegrationProps) {
  const [experiments, setExperiments] = useState<ChaosExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ChaosExperiment | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadChaosTestingData = async () => {
      try {
        const data = await productionApi.getChaosExperiments();
        setExperiments(data);
        if (data.length > 0) {
          setSelectedExperiment(data[0]);
        }
      } catch (error) {
        console.error('Failed to load chaos experiments:', error);
        // Fallback to empty array if API fails
        setExperiments([]);
      }
    };

    loadChaosTestingData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setExperiments(prev => prev.map(experiment => {
        if (experiment.status === 'running') {
          // Simulate changing metrics during running experiments
          return {
            ...experiment,
            metrics: experiment.metrics.map(metric => ({
              ...metric,
              current: metric.current + (Math.random() - 0.5) * 10
            }))
          };
        }
        return experiment;
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'memory': return <HardDrive className="h-4 w-4" />;
      case 'disk': return <Database className="h-4 w-4" />;
      case 'service': return <Server className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'custom': return <Wrench className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExperiments = experiments.filter(experiment => {
    const typeMatch = filterType === 'all' || experiment.type === filterType;
    const statusMatch = filterStatus === 'all' || experiment.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const runningExperiments = experiments.filter(e => e.status === 'running').length;
  const scheduledExperiments = experiments.filter(e => e.status === 'scheduled').length;
  const completedExperiments = experiments.filter(e => e.status === 'completed').length;
  const failedExperiments = experiments.filter(e => e.status === 'failed').length;
  const totalImpact = experiments.reduce((sum, e) => sum + e.results.impact.revenue, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Chaos Testing Integration
              </CardTitle>
              <CardDescription>
                Outage simulation and system resilience testing
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
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
          {/* Experiment Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{runningExperiments}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{scheduledExperiments}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedExperiments}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedExperiments}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Safety Status */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Chaos Testing Safety</h4>
                <p className="text-sm text-muted-foreground">
                  Automated safety controls and monitoring for chaos experiments
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {experiments.filter(e => e.safety.autoStop).length}/{experiments.length}
                </div>
                <div className="text-sm text-muted-foreground">auto-stop enabled</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(experiments.filter(e => e.safety.autoStop).length / experiments.length) * 100} className="h-2" />
            </div>
          </div>

          {/* Chaos Experiments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Chaos Experiments</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'network', 'cpu', 'memory', 'disk', 'service', 'database', 'api', 'custom'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled'].map((status) => (
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
              {filteredExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedExperiment?.id === experiment.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedExperiment(experiment)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(experiment.type)}
                      <div>
                        <div className="font-medium">{experiment.name}</div>
                        <div className="text-sm text-muted-foreground">{experiment.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(experiment.severity)}>
                        {experiment.severity}
                      </Badge>
                      <Badge className={getStatusColor(experiment.status)}>
                        {experiment.status}
                      </Badge>
                      <Badge className={getEnvironmentColor(experiment.target.environment)}>
                        {experiment.target.environment}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Target: {experiment.target.service}</span>
                    <span>Duration: {experiment.parameters.duration}min</span>
                    <span>Intensity: {experiment.parameters.intensity}%</span>
                    <span>Created: {new Date(experiment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Experiment Details */}
          {selectedExperiment && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Experiment Details - {selectedExperiment.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Experiment Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedExperiment.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedExperiment.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedExperiment.severity)}>
                            {selectedExperiment.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedExperiment.status)}>
                            {selectedExperiment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Created By:</span>
                          <span className="font-medium">{selectedExperiment.createdBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created At:</span>
                          <span className="font-medium">{new Date(selectedExperiment.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Target Configuration</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{selectedExperiment.target.service}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Environment:</span>
                          <Badge className={getEnvironmentColor(selectedExperiment.target.environment)}>
                            {selectedExperiment.target.environment}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Region:</span>
                          <span className="font-medium">{selectedExperiment.target.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instances:</span>
                          <span className="font-medium">{selectedExperiment.target.instances}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Parameters</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedExperiment.parameters.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Intensity:</span>
                          <span className="font-medium">{selectedExperiment.parameters.intensity}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-medium">{selectedExperiment.parameters.frequency} events/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scope:</span>
                          <span className="font-medium">{selectedExperiment.parameters.scope}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Performance Metrics</h5>
                    <div className="space-y-2">
                      {selectedExperiment.metrics.map((metric) => (
                        <div key={metric.metric} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{metric.metric}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getMetricStatusColor(metric.status)}`}>
                                {metric.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Baseline: {metric.baseline}</span>
                            <span>Current: {metric.current}</span>
                            <span>Threshold: {metric.threshold}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Experiment Results</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Success:</span>
                        <Badge className={selectedExperiment.results.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExperiment.results.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{selectedExperiment.results.duration} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Impact Assessment</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Users Affected:</span>
                          <span className="font-medium">{formatNumber(selectedExperiment.results.impact.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedExperiment.results.impact.revenue)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Downtime:</span>
                          <span className="font-medium">{selectedExperiment.results.impact.downtime} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Errors:</span>
                          <span className="font-medium">{selectedExperiment.results.impact.errors}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Recovery Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Recovery Time:</span>
                        <span className="font-medium">{selectedExperiment.results.recovery.time} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recovery Method:</span>
                        <span className="font-medium">{selectedExperiment.results.recovery.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Automated:</span>
                        <Badge className={selectedExperiment.results.recovery.automated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedExperiment.results.recovery.automated ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedExperiment.results.lessons.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Lessons Learned</h5>
                      <div className="space-y-1">
                        {selectedExperiment.results.lessons.map((lesson, index) => (
                          <div key={index} className="p-2 border rounded-lg text-sm">
                            • {lesson}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Safety Configuration</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto Stop:</span>
                        <Badge className={selectedExperiment.safety.autoStop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExperiment.safety.autoStop ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Duration:</span>
                        <span className="font-medium">{selectedExperiment.safety.maxDuration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monitoring:</span>
                        <Badge className={selectedExperiment.safety.monitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedExperiment.safety.monitoring ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Rollback Triggers</h5>
                    <div className="space-y-1">
                      {selectedExperiment.safety.rollbackTriggers.map((trigger, index) => (
                        <div key={index} className="p-2 border rounded-lg text-sm">
                          • {trigger}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Schedule Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Start Time:</span>
                        <span className="font-medium">{new Date(selectedExperiment.schedule.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Time:</span>
                        <span className="font-medium">{new Date(selectedExperiment.schedule.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timezone:</span>
                        <span className="font-medium">{selectedExperiment.schedule.timezone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recurrence:</span>
                        <span className="font-medium">{selectedExperiment.schedule.recurrence || 'Once'}</span>
                      </div>
                      {selectedExperiment.lastRun && (
                        <div className="flex justify-between">
                          <span>Last Run:</span>
                          <span className="font-medium">{new Date(selectedExperiment.lastRun).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedExperiment.nextRun && (
                        <div className="flex justify-between">
                          <span>Next Run:</span>
                          <span className="font-medium">{new Date(selectedExperiment.nextRun).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Start Experiment
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Experiment
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
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
