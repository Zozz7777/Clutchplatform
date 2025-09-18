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
  TestTube,
  Bug,
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
  Zap,
  Network,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitBranch as BranchIcon,
  Search,
  Filter as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AlertOctagon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon2,
  RotateCcw as RollbackIcon2,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  ToggleLeft as ToggleLeftIcon,
  ToggleRight as ToggleRightIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  Brain as BrainIcon,
  Calculator as CalculatorIcon,
  PieChart as PieChartIcon2,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon2,
  TestTube as TestTubeIcon,
  Bug as BugIcon,
  Shield as ShieldIcon,
  Wrench as WrenchIcon,
  Trash2 as Trash2Icon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  X as XIcon,
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  Building as BuildingIcon,
  Car as CarIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  CreditCard as CreditCardIcon,
  Zap as ZapIcon,
  Network as NetworkIcon,
  GitBranch as GitBranchIcon,
  GitCommit as GitCommitIcon,
  GitMerge as GitMergeIcon,
  GitPullRequest as GitPullRequestIcon,
  GitBranch as BranchIcon2
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ConfidenceInterval {
  id: string;
  name: string;
  type: 'revenue' | 'users' | 'performance' | 'cost' | 'capacity' | 'risk' | 'conversion' | 'retention';
  metric: string;
  currentValue: number;
  confidenceLevel: number; // 0-100
  interval: {
    lower: number;
    upper: number;
    width: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  factors: {
    name: string;
    impact: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  historical: {
    date: string;
    value: number;
    confidence: number;
  }[];
  predictions: {
    date: string;
    value: number;
    confidence: number;
    scenario: 'optimistic' | 'realistic' | 'pessimistic';
  }[];
  lastUpdated: string;
  nextUpdate: string;
}

interface ConfidenceIntervalsProps {
  className?: string;
}

export default function ConfidenceIntervals({ className }: ConfidenceIntervalsProps) {
  const [intervals, setIntervals] = useState<ConfidenceInterval[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<ConfidenceInterval | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  useEffect(() => {
    const loadConfidenceIntervalData = () => {
      const mockIntervals: ConfidenceInterval[] = [
        {
          id: 'interval-001',
          name: 'Monthly Recurring Revenue',
          type: 'revenue',
          metric: 'MRR',
          currentValue: 2500000,
          confidenceLevel: 85,
          interval: {
            lower: 2200000,
            upper: 2800000,
            width: 600000
          },
          scenarios: {
            optimistic: 3200000,
            realistic: 2500000,
            pessimistic: 1800000
          },
          factors: [
            {
              name: 'Customer Acquisition Rate',
              impact: 0.4,
              confidence: 80,
              trend: 'up'
            },
            {
              name: 'Churn Rate',
              impact: -0.3,
              confidence: 75,
              trend: 'down'
            },
            {
              name: 'Average Revenue Per User',
              impact: 0.2,
              confidence: 90,
              trend: 'up'
            },
            {
              name: 'Market Conditions',
              impact: 0.1,
              confidence: 60,
              trend: 'stable'
            }
          ],
          historical: [
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2400000,
              confidence: 82
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2300000,
              confidence: 78
            },
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2200000,
              confidence: 75
            }
          ],
          predictions: [
            {
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2600000,
              confidence: 85,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2700000,
              confidence: 80,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 2800000,
              confidence: 75,
              scenario: 'realistic'
            }
          ],
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'interval-002',
          name: 'User Growth Rate',
          type: 'users',
          metric: 'Monthly Active Users',
          currentValue: 150000,
          confidenceLevel: 78,
          interval: {
            lower: 130000,
            upper: 170000,
            width: 40000
          },
          scenarios: {
            optimistic: 200000,
            realistic: 150000,
            pessimistic: 100000
          },
          factors: [
            {
              name: 'Marketing Campaign Effectiveness',
              impact: 0.5,
              confidence: 70,
              trend: 'up'
            },
            {
              name: 'User Retention Rate',
              impact: 0.3,
              confidence: 85,
              trend: 'up'
            },
            {
              name: 'Viral Coefficient',
              impact: 0.2,
              confidence: 60,
              trend: 'stable'
            }
          ],
          historical: [
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 145000,
              confidence: 75
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 140000,
              confidence: 72
            },
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 135000,
              confidence: 70
            }
          ],
          predictions: [
            {
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 155000,
              confidence: 78,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 160000,
              confidence: 75,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 165000,
              confidence: 72,
              scenario: 'realistic'
            }
          ],
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'interval-003',
          name: 'System Performance',
          type: 'performance',
          metric: 'Response Time (ms)',
          currentValue: 200,
          confidenceLevel: 90,
          interval: {
            lower: 150,
            upper: 250,
            width: 100
          },
          scenarios: {
            optimistic: 120,
            realistic: 200,
            pessimistic: 300
          },
          factors: [
            {
              name: 'Server Load',
              impact: 0.6,
              confidence: 95,
              trend: 'stable'
            },
            {
              name: 'Database Performance',
              impact: 0.3,
              confidence: 85,
              trend: 'up'
            },
            {
              name: 'Network Latency',
              impact: 0.1,
              confidence: 70,
              trend: 'stable'
            }
          ],
          historical: [
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 195,
              confidence: 88
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 190,
              confidence: 85
            },
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 185,
              confidence: 82
            }
          ],
          predictions: [
            {
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              value: 205,
              confidence: 90,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              value: 210,
              confidence: 85,
              scenario: 'realistic'
            },
            {
              date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              value: 215,
              confidence: 80,
              scenario: 'realistic'
            }
          ],
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setIntervals(mockIntervals);
      setSelectedInterval(mockIntervals[0]);
    };

    loadConfidenceIntervalData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIntervals(prev => prev.map(interval => ({
        ...interval,
        confidenceLevel: Math.max(0, Math.min(100, interval.confidenceLevel + (Math.random() - 0.5) * 2))
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
      case 'conversion': return 'bg-indigo-100 text-indigo-800';
      case 'retention': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    if (confidence >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'text-green-600';
      case 'realistic': return 'text-blue-600';
      case 'pessimistic': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredIntervals = intervals.filter(interval => {
    const typeMatch = filterType === 'all' || interval.type === filterType;
    const confidenceMatch = filterConfidence === 'all' || 
      (filterConfidence === 'high' && interval.confidenceLevel >= 80) ||
      (filterConfidence === 'medium' && interval.confidenceLevel >= 60 && interval.confidenceLevel < 80) ||
      (filterConfidence === 'low' && interval.confidenceLevel < 60);
    return typeMatch && confidenceMatch;
  });

  const totalCurrent = intervals.reduce((sum, i) => sum + i.currentValue, 0);
  const totalLower = intervals.reduce((sum, i) => sum + i.interval.lower, 0);
  const totalUpper = intervals.reduce((sum, i) => sum + i.interval.upper, 0);
  const avgConfidence = intervals.length > 0 
    ? Math.round(intervals.reduce((sum, i) => sum + i.confidenceLevel, 0) / intervals.length)
    : 0;
  const totalWidth = intervals.reduce((sum, i) => sum + i.interval.width, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Confidence Intervals
              </CardTitle>
              <CardDescription>
                Dynamic scenario display with statistical confidence modeling
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
          {/* Interval Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCurrent)}</div>
              <div className="text-sm text-muted-foreground">Current Value</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalLower)}</div>
              <div className="text-sm text-muted-foreground">Lower Bound</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalUpper)}</div>
              <div className="text-sm text-muted-foreground">Upper Bound</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>

          {/* Confidence Overview */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Confidence Interval Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Statistical confidence modeling with dynamic scenario display and predictive analytics
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {intervals.length}
                </div>
                <div className="text-sm text-muted-foreground">intervals monitored</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgConfidence / 100) * 100} className="h-2" />
            </div>
          </div>

          {/* Confidence Intervals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Confidence Intervals</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'revenue', 'users', 'performance', 'cost', 'capacity', 'risk', 'conversion', 'retention'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
                <span className="text-sm ml-4">Confidence:</span>
                {['all', 'high', 'medium', 'low'].map((confidence) => (
                  <Button
                    key={confidence}
                    variant={filterConfidence === confidence ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterConfidence(confidence)}
                  >
                    {confidence}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredIntervals.map((interval) => (
                <div
                  key={interval.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInterval?.id === interval.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedInterval(interval)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{interval.name}</div>
                        <div className="text-sm text-muted-foreground">{interval.metric}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(interval.type)}>
                        {interval.type}
                      </Badge>
                      <div className="text-sm font-medium">
                        {interval.confidenceLevel}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Current: {formatCurrency(interval.currentValue)}</span>
                    <span>Lower: {formatCurrency(interval.interval.lower)}</span>
                    <span>Upper: {formatCurrency(interval.interval.upper)}</span>
                    <span>Width: {formatCurrency(interval.interval.width)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Interval Details */}
          {selectedInterval && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Interval Details - {selectedInterval.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="factors">Factors</TabsTrigger>
                  <TabsTrigger value="historical">Historical</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Interval Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedInterval.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getTypeColor(selectedInterval.type)}>
                            {selectedInterval.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Metric:</span>
                          <span className="font-medium">{selectedInterval.metric}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Level:</span>
                          <span className={`font-medium ${getConfidenceColor(selectedInterval.confidenceLevel)}`}>
                            {selectedInterval.confidenceLevel}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Interval Values</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Value:</span>
                          <span className="font-medium">{formatCurrency(selectedInterval.currentValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lower Bound:</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedInterval.interval.lower)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upper Bound:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(selectedInterval.interval.upper)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interval Width:</span>
                          <span className="font-medium">{formatCurrency(selectedInterval.interval.width)}</span>
                        </div>
                      </div>
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
                          {formatCurrency(selectedInterval.scenarios.optimistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="font-medium text-blue-600 mb-1">Realistic</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedInterval.scenarios.realistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="font-medium text-red-600 mb-1">Pessimistic</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(selectedInterval.scenarios.pessimistic)}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="factors" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Impact Factors</h5>
                    <div className="space-y-2">
                      {selectedInterval.factors.map((factor, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{factor.name}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(factor.trend)}
                              <span className="text-sm font-medium">{factor.impact * 100}% impact</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Impact: {factor.impact * 100}%</div>
                              <div>Confidence: {factor.confidence}%</div>
                            </div>
                            <div>
                              <div>Trend: {factor.trend}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="historical" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Historical Data</h5>
                    <div className="space-y-2">
                      {selectedInterval.historical.map((data, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{formatCurrency(data.value)}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(data.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {data.confidence}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Future Predictions</h5>
                    <div className="space-y-2">
                      {selectedInterval.predictions.map((prediction, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{formatCurrency(prediction.value)}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getScenarioColor(prediction.scenario)}>
                                {prediction.scenario}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(prediction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {prediction.confidence}%
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
