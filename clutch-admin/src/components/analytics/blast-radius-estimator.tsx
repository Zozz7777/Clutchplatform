"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  AlertTriangle, 
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
  Zap,
  Shield,
  Wrench,
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
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface FailureImpact {
  id: string;
  service: string;
  component: string;
  failureType: 'outage' | 'degradation' | 'latency' | 'error_rate' | 'data_loss' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  blastRadius: {
    direct: {
      users: number;
      revenue: number;
      services: number;
      regions: number;
    };
    indirect: {
      users: number;
      revenue: number;
      services: number;
      regions: number;
    };
    cascading: {
      users: number;
      revenue: number;
      services: number;
      regions: number;
    };
    total: {
      users: number;
      revenue: number;
      services: number;
      regions: number;
    };
  };
  dependencies: {
    service: string;
    type: 'critical' | 'important' | 'optional';
    impact: number;
    status: 'healthy' | 'degraded' | 'down';
  }[];
  timeline: {
    detection: number; // minutes
    response: number; // minutes
    recovery: number; // minutes
    total: number; // minutes
  };
  mitigation: {
    strategy: string;
    effectiveness: number;
    cost: number;
    timeToImplement: number;
  }[];
  confidence: number;
  lastUpdated: string;
}

interface BlastRadiusEstimatorProps {
  className?: string;
}

export default function BlastRadiusEstimator({ className }: BlastRadiusEstimatorProps) {
  const [failureImpacts, setFailureImpacts] = useState<FailureImpact[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<FailureImpact | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadBlastRadiusData = () => {
      const mockFailureImpacts: FailureImpact[] = [
        {
          id: 'impact-001',
          service: 'Payment Gateway',
          component: 'Transaction Processor',
          failureType: 'outage',
          severity: 'critical',
          blastRadius: {
            direct: {
              users: 15000,
              revenue: 45000,
              services: 3,
              regions: 2
            },
            indirect: {
              users: 8500,
              revenue: 25000,
              services: 5,
              regions: 1
            },
            cascading: {
              users: 12000,
              revenue: 18000,
              services: 8,
              regions: 3
            },
            total: {
              users: 35500,
              revenue: 88000,
              services: 16,
              regions: 6
            }
          },
          dependencies: [
            {
              service: 'User Authentication',
              type: 'critical',
              impact: 95,
              status: 'healthy'
            },
            {
              service: 'Database Cluster',
              type: 'critical',
              impact: 90,
              status: 'healthy'
            },
            {
              service: 'Notification Service',
              type: 'important',
              impact: 60,
              status: 'healthy'
            },
            {
              service: 'Analytics Service',
              type: 'optional',
              impact: 20,
              status: 'healthy'
            }
          ],
          timeline: {
            detection: 2,
            response: 5,
            recovery: 45,
            total: 52
          },
          mitigation: [
            {
              strategy: 'Failover to backup payment processor',
              effectiveness: 85,
              cost: 5000,
              timeToImplement: 10
            },
            {
              strategy: 'Circuit breaker activation',
              effectiveness: 70,
              cost: 2000,
              timeToImplement: 5
            },
            {
              strategy: 'Manual payment processing',
              effectiveness: 40,
              cost: 15000,
              timeToImplement: 30
            }
          ],
          confidence: 92,
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'impact-002',
          service: 'User Database',
          component: 'Primary Database',
          failureType: 'degradation',
          severity: 'high',
          blastRadius: {
            direct: {
              users: 25000,
              revenue: 35000,
              services: 8,
              regions: 3
            },
            indirect: {
              users: 15000,
              revenue: 20000,
              services: 12,
              regions: 2
            },
            cascading: {
              users: 8000,
              revenue: 12000,
              services: 6,
              regions: 1
            },
            total: {
              users: 48000,
              revenue: 67000,
              services: 26,
              regions: 6
            }
          },
          dependencies: [
            {
              service: 'Authentication Service',
              type: 'critical',
              impact: 98,
              status: 'degraded'
            },
            {
              service: 'Profile Service',
              type: 'critical',
              impact: 95,
              status: 'degraded'
            },
            {
              service: 'Recommendation Engine',
              type: 'important',
              impact: 70,
              status: 'healthy'
            }
          ],
          timeline: {
            detection: 5,
            response: 8,
            recovery: 120,
            total: 133
          },
          mitigation: [
            {
              strategy: 'Database read replica activation',
              effectiveness: 90,
              cost: 8000,
              timeToImplement: 15
            },
            {
              strategy: 'Query optimization and caching',
              effectiveness: 75,
              cost: 3000,
              timeToImplement: 20
            }
          ],
          confidence: 88,
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      setFailureImpacts(mockFailureImpacts);
      setSelectedImpact(mockFailureImpacts[0]);
    };

    loadBlastRadiusData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setFailureImpacts(prev => prev.map(impact => ({
        ...impact,
        blastRadius: {
          ...impact.blastRadius,
          total: {
            ...impact.blastRadius.total,
            users: impact.blastRadius.total.users + Math.floor((Math.random() - 0.5) * 100)
          }
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFailureTypeColor = (type: string) => {
    switch (type) {
      case 'outage': return 'bg-red-100 text-red-800';
      case 'degradation': return 'bg-orange-100 text-orange-800';
      case 'latency': return 'bg-yellow-100 text-yellow-800';
      case 'error_rate': return 'bg-purple-100 text-purple-800';
      case 'data_loss': return 'bg-red-100 text-red-800';
      case 'security_breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'optional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredImpacts = failureImpacts.filter(impact => {
    const typeMatch = filterType === 'all' || impact.failureType === filterType;
    const severityMatch = filterSeverity === 'all' || impact.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  const totalUsers = failureImpacts.reduce((sum, impact) => sum + impact.blastRadius.total.users, 0);
  const totalRevenue = failureImpacts.reduce((sum, impact) => sum + impact.blastRadius.total.revenue, 0);
  const totalServices = failureImpacts.reduce((sum, impact) => sum + impact.blastRadius.total.services, 0);
  const totalRegions = failureImpacts.reduce((sum, impact) => sum + impact.blastRadius.total.regions, 0);
  const avgConfidence = failureImpacts.length > 0 
    ? Math.round(failureImpacts.reduce((sum, impact) => sum + impact.confidence, 0) / failureImpacts.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Blast Radius Estimator
              </CardTitle>
              <CardDescription>
                Failure impact prediction and dependency analysis
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
          {/* Impact Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-red-600">{formatNumber(totalUsers)}</div>
              <div className="text-sm text-muted-foreground">Total Users Affected</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue at Risk</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-yellow-600">{totalServices}</div>
              <div className="text-sm text-muted-foreground">Services Impacted</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-purple-600">{totalRegions}</div>
              <div className="text-sm text-muted-foreground">Regions Affected</div>
            </div>
          </div>

          {/* Blast Radius Overview */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Blast Radius Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Failure impact prediction with dependency mapping and mitigation strategies
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">
                  {avgConfidence}%
                </div>
                <div className="text-sm text-muted-foreground">avg confidence</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgConfidence} className="h-2" />
            </div>
          </div>

          {/* Failure Impacts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Failure Impact Analysis</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'outage', 'degradation', 'latency', 'error_rate', 'data_loss', 'security_breach'].map((type) => (
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
                {['all', 'low', 'medium', 'high', 'critical'].map((severity) => (
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
              {filteredImpacts.map((impact) => (
                <div
                  key={impact.id}
                  className={`p-3 border rounded-lg-lg cursor-pointer transition-colors ${
                    selectedImpact?.id === impact.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedImpact(impact)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{impact.service} - {impact.component}</div>
                        <div className="text-sm text-muted-foreground">{impact.failureType.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getFailureTypeColor(impact.failureType)}>
                        {impact.failureType.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(impact.severity)}>
                        {impact.severity}
                      </Badge>
                      <div className="text-sm font-medium">
                        {formatNumber(impact.blastRadius.total.users)} users
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Revenue: {formatCurrency(impact.blastRadius.total.revenue)}</span>
                    <span>Services: {impact.blastRadius.total.services}</span>
                    <span>Regions: {impact.blastRadius.total.regions}</span>
                    <span>Confidence: {impact.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Impact Details */}
          {selectedImpact && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Impact Details - {selectedImpact.service}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Service Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{selectedImpact.service}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Component:</span>
                          <span className="font-medium">{selectedImpact.component}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failure Type:</span>
                          <Badge className={getFailureTypeColor(selectedImpact.failureType)}>
                            {selectedImpact.failureType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedImpact.severity)}>
                            {selectedImpact.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedImpact.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Blast Radius</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Direct Users:</span>
                          <span className="font-medium">{formatNumber(selectedImpact.blastRadius.direct.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Indirect Users:</span>
                          <span className="font-medium">{formatNumber(selectedImpact.blastRadius.indirect.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cascading Users:</span>
                          <span className="font-medium">{formatNumber(selectedImpact.blastRadius.cascading.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <span className="font-medium text-red-600">{formatNumber(selectedImpact.blastRadius.total.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-medium text-red-600">{formatCurrency(selectedImpact.blastRadius.total.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Service Dependencies</h5>
                    <div className="space-y-2">
                      {selectedImpact.dependencies.map((dependency, index) => (
                        <div key={index} className="p-3 border rounded-lg-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dependency.service}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getDependencyTypeColor(dependency.type)}>
                                {dependency.type}
                              </Badge>
                              <span className={`text-sm font-medium ${getStatusColor(dependency.status)}`}>
                                {dependency.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Impact: {dependency.impact}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Recovery Timeline</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Detection Time:</span>
                        <span className="font-medium">{selectedImpact.timeline.detection} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">{selectedImpact.timeline.response} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recovery Time:</span>
                        <span className="font-medium">{selectedImpact.timeline.recovery} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Downtime:</span>
                        <span className="font-medium text-red-600">{selectedImpact.timeline.total} minutes</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mitigation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                    <div className="space-y-2">
                      {selectedImpact.mitigation.map((strategy, index) => (
                        <div key={index} className="p-3 border rounded-lg-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{strategy.strategy}</span>
                            <span className="text-sm font-medium">{strategy.effectiveness}% effective</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Cost: {formatCurrency(strategy.cost)}</span>
                            <span>Time: {strategy.timeToImplement} minutes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
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
