"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
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
  CreditCard,
  Network,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitBranch as BranchIcon
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface DependencyForecast {
  id: string;
  name: string;
  type: 'revenue' | 'users' | 'performance' | 'cost' | 'capacity' | 'risk';
  dependencies: {
    service: string;
    impact: number;
    type: 'critical' | 'important' | 'optional';
    status: 'healthy' | 'degraded' | 'down';
  }[];
  forecast: {
    current: number;
    predicted: number;
    confidence: number;
    timeframe: number; // days
    scenarios: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
  };
  impact: {
    direct: number;
    indirect: number;
    cascading: number;
    total: number;
  };
  triggers: {
    condition: string;
    threshold: number;
    metric: string;
  }[];
  lastUpdated: string;
}

interface DependencyAwareForecastsProps {
  className?: string;
}

export default function DependencyAwareForecasts({ className }: DependencyAwareForecastsProps) {
  const [forecasts, setForecasts] = useState<DependencyForecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<DependencyForecast | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('all');

  useEffect(() => {
    const loadDependencyForecastData = () => {
      const mockForecasts: DependencyForecast[] = [
        {
          id: 'forecast-001',
          name: 'Revenue Growth Forecast',
          type: 'revenue',
          dependencies: [
            {
              service: 'Payment Gateway',
              impact: 95,
              type: 'critical',
              status: 'healthy'
            },
            {
              service: 'User Authentication',
              impact: 80,
              type: 'critical',
              status: 'healthy'
            },
            {
              service: 'Recommendation Engine',
              impact: 60,
              type: 'important',
              status: 'healthy'
            },
            {
              service: 'Analytics Service',
              impact: 30,
              type: 'optional',
              status: 'healthy'
            }
          ],
          forecast: {
            current: 2500000,
            predicted: 3200000,
            confidence: 88,
            timeframe: 90,
            scenarios: {
              optimistic: 3800000,
              realistic: 3200000,
              pessimistic: 2800000
            }
          },
          impact: {
            direct: 85,
            indirect: 10,
            cascading: 5,
            total: 100
          },
          triggers: [
            {
              condition: 'payment_success_rate < 95%',
              threshold: 95,
              metric: 'payment_success_rate'
            },
            {
              condition: 'user_retention_rate < 80%',
              threshold: 80,
              metric: 'user_retention_rate'
            }
          ],
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'forecast-002',
          name: 'User Growth Forecast',
          type: 'users',
          dependencies: [
            {
              service: 'User Registration',
              impact: 90,
              type: 'critical',
              status: 'healthy'
            },
            {
              service: 'Email Service',
              impact: 70,
              type: 'important',
              status: 'healthy'
            },
            {
              service: 'Social Login',
              impact: 50,
              type: 'important',
              status: 'healthy'
            }
          ],
          forecast: {
            current: 150000,
            predicted: 220000,
            confidence: 82,
            timeframe: 60,
            scenarios: {
              optimistic: 260000,
              realistic: 220000,
              pessimistic: 180000
            }
          },
          impact: {
            direct: 90,
            indirect: 8,
            cascading: 2,
            total: 100
          },
          triggers: [
            {
              condition: 'registration_success_rate < 90%',
              threshold: 90,
              metric: 'registration_success_rate'
            },
            {
              condition: 'email_delivery_rate < 95%',
              threshold: 95,
              metric: 'email_delivery_rate'
            }
          ],
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'forecast-003',
          name: 'Performance Forecast',
          type: 'performance',
          dependencies: [
            {
              service: 'API Gateway',
              impact: 85,
              type: 'critical',
              status: 'healthy'
            },
            {
              service: 'Database Cluster',
              impact: 90,
              type: 'critical',
              status: 'healthy'
            },
            {
              service: 'CDN',
              impact: 60,
              type: 'important',
              status: 'healthy'
            }
          ],
          forecast: {
            current: 200,
            predicted: 150,
            confidence: 75,
            timeframe: 30,
            scenarios: {
              optimistic: 120,
              realistic: 150,
              pessimistic: 180
            }
          },
          impact: {
            direct: 80,
            indirect: 15,
            cascading: 5,
            total: 100
          },
          triggers: [
            {
              condition: 'response_time > 500ms',
              threshold: 500,
              metric: 'response_time'
            },
            {
              condition: 'database_connection_pool > 80%',
              threshold: 80,
              metric: 'database_connection_pool'
            }
          ],
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setForecasts(mockForecasts);
      setSelectedForecast(mockForecasts[0]);
    };

    loadDependencyForecastData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setForecasts(prev => prev.map(forecast => ({
        ...forecast,
        forecast: {
          ...forecast.forecast,
          predicted: forecast.forecast.predicted + (Math.random() - 0.5) * 10000
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'users': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'cost': return 'bg-red-100 text-red-800';
      case 'capacity': return 'bg-purple-100 text-purple-800';
      case 'risk': return 'bg-yellow-100 text-yellow-800';
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    if (confidence >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredForecasts = forecasts.filter(forecast => {
    const typeMatch = filterType === 'all' || forecast.type === filterType;
    const timeframeMatch = filterTimeframe === 'all' || 
      (filterTimeframe === 'short' && forecast.forecast.timeframe <= 30) ||
      (filterTimeframe === 'medium' && forecast.forecast.timeframe > 30 && forecast.forecast.timeframe <= 90) ||
      (filterTimeframe === 'long' && forecast.forecast.timeframe > 90);
    return typeMatch && timeframeMatch;
  });

  const totalCurrent = forecasts.reduce((sum, f) => sum + f.forecast.current, 0);
  const totalPredicted = forecasts.reduce((sum, f) => sum + f.forecast.predicted, 0);
  const avgConfidence = forecasts.length > 0 
    ? Math.round(forecasts.reduce((sum, f) => sum + f.forecast.confidence, 0) / forecasts.length)
    : 0;
  const totalDependencies = forecasts.reduce((sum, f) => sum + f.dependencies.length, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Dependency-Aware Forecasts
              </CardTitle>
              <CardDescription>
                Real-time impact forecasting with dependency analysis
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
          {/* Forecast Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrent)}</div>
              <div className="text-sm text-muted-foreground">Current Value</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPredicted)}</div>
              <div className="text-sm text-muted-foreground">Predicted Value</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{totalDependencies}</div>
              <div className="text-sm text-muted-foreground">Total Dependencies</div>
            </div>
          </div>

          {/* Dependency Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dependency-Aware Forecasting</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time impact forecasting with comprehensive dependency analysis and scenario planning
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {forecasts.length}
                </div>
                <div className="text-sm text-muted-foreground">forecasts active</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgConfidence / 100) * 100} className="h-2" />
            </div>
          </div>

          {/* Dependency Forecasts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Dependency Forecasts</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'revenue', 'users', 'performance', 'cost', 'capacity', 'risk'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
                <span className="text-sm ml-4">Timeframe:</span>
                {['all', 'short', 'medium', 'long'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={filterTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTimeframe(timeframe)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredForecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedForecast?.id === forecast.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedForecast(forecast)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Network className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{forecast.name}</div>
                        <div className="text-sm text-muted-foreground">{forecast.type} forecast</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(forecast.type)}>
                        {forecast.type}
                      </Badge>
                      <div className="text-sm font-medium">
                        {forecast.forecast.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Current: {formatCurrency(forecast.forecast.current)}</span>
                    <span>Predicted: {formatCurrency(forecast.forecast.predicted)}</span>
                    <span>Dependencies: {forecast.dependencies.length}</span>
                    <span>Timeframe: {forecast.forecast.timeframe} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Forecast Details */}
          {selectedForecast && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Forecast Details - {selectedForecast.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="triggers">Triggers</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Forecast Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedForecast.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getTypeColor(selectedForecast.type)}>
                            {selectedForecast.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(selectedForecast.forecast.confidence)}`}>
                            {selectedForecast.forecast.confidence}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeframe:</span>
                          <span className="font-medium">{selectedForecast.forecast.timeframe} days</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Forecast Values</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current:</span>
                          <span className="font-medium">{formatCurrency(selectedForecast.forecast.current)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Predicted:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(selectedForecast.forecast.predicted)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth:</span>
                          <span className="font-medium text-green-600">
                            {((selectedForecast.forecast.predicted - selectedForecast.forecast.current) / selectedForecast.forecast.current * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Impact Analysis</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Direct Impact:</span>
                          <span className="font-medium">{selectedForecast.impact.direct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Indirect Impact:</span>
                          <span className="font-medium">{selectedForecast.impact.indirect}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Cascading Impact:</span>
                          <span className="font-medium">{selectedForecast.impact.cascading}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Impact:</span>
                          <span className="font-medium">{selectedForecast.impact.total}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Service Dependencies</h5>
                    <div className="space-y-2">
                      {selectedForecast.dependencies.map((dependency, index) => (
                        <div key={index} className="p-3 border rounded-lg">
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

                <TabsContent value="scenarios" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Scenario Analysis</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 border rounded-lg text-center">
                        <div className="font-medium text-green-600 mb-1">Optimistic</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedForecast.forecast.scenarios.optimistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="font-medium text-blue-600 mb-1">Realistic</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedForecast.forecast.scenarios.realistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="font-medium text-red-600 mb-1">Pessimistic</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(selectedForecast.forecast.scenarios.pessimistic)}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="triggers" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Early Warning Triggers</h5>
                    <div className="space-y-2">
                      {selectedForecast.triggers.map((trigger, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{trigger.condition}</span>
                            <span className="text-sm font-medium">Threshold: {trigger.threshold}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Metric: {trigger.metric}
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
