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
import { productionApi } from '@/lib/production-api';

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
    const loadConfidenceIntervalData = async () => {
      try {
        const data = await productionApi.getConfidenceIntervals();
        setIntervals(data);
        if (data.length > 0) {
          setSelectedInterval(data[0]);
        }
      } catch (error) {
        // Failed to load confidence intervals
        // Fallback to empty array if API fails
        setIntervals([]);
      }
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
      case 'revenue': return 'bg-success/10 text-green-800';
      case 'users': return 'bg-primary/10 text-blue-800';
      case 'performance': return 'bg-warning/10 text-orange-800';
      case 'cost': return 'bg-destructive/10 text-red-800';
      case 'capacity': return 'bg-primary/10 text-purple-800';
      case 'risk': return 'bg-warning/10 text-yellow-800';
      case 'conversion': return 'bg-indigo-100 text-indigo-800';
      case 'retention': return 'bg-pink-100 text-pink-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'text-success';
      case 'realistic': return 'text-primary';
      case 'pessimistic': return 'text-destructive';
      default: return 'text-muted-foreground';
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
          {/* Interval Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalCurrent)}</div>
              <div className="text-sm text-muted-foreground">Current Value</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalLower)}</div>
              <div className="text-sm text-muted-foreground">Lower Bound</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalUpper)}</div>
              <div className="text-sm text-muted-foreground">Upper Bound</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>

          {/* Confidence Overview */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Confidence Interval Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Statistical confidence modeling with dynamic scenario display and predictive analytics
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-success">
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
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedInterval?.id === interval.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
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
                          <span className="font-medium text-success">{formatCurrency(selectedInterval.interval.lower)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upper Bound:</span>
                          <span className="font-medium text-primary">{formatCurrency(selectedInterval.interval.upper)}</span>
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
                      <div className="p-3 border rounded-[0.625rem] text-center">
                        <div className="font-medium text-success mb-1">Optimistic</div>
                        <div className="text-2xl font-bold text-success">
                          {formatCurrency(selectedInterval.scenarios.optimistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-[0.625rem] text-center">
                        <div className="font-medium text-primary mb-1">Realistic</div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(selectedInterval.scenarios.realistic)}
                        </div>
                      </div>
                      <div className="p-3 border rounded-[0.625rem] text-center">
                        <div className="font-medium text-destructive mb-1">Pessimistic</div>
                        <div className="text-2xl font-bold text-destructive">
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
                        <div key={index} className="p-3 border rounded-[0.625rem]">
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
                        <div key={index} className="p-3 border rounded-[0.625rem]">
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
                        <div key={index} className="p-3 border rounded-[0.625rem]">
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


