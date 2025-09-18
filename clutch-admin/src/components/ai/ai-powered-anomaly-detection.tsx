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

interface AnomalyDetection {
  id: string;
  name: string;
  type: 'performance' | 'security' | 'business' | 'infrastructure' | 'user_behavior' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  confidence: number; // 0-100
  impact: {
    users: number;
    revenue: number;
    services: number;
    regions: number;
    duration: number; // hours
  };
  metrics: {
    name: string;
    value: number;
    threshold: number;
    deviation: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  patterns: {
    id: string;
    name: string;
    description: string;
    frequency: number;
    lastSeen: string;
    correlation: number;
  }[];
  recommendations: {
    id: string;
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    effort: number;
    timeframe: number; // hours
  }[];
  timeline: {
    timestamp: string;
    event: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    details: string;
  }[];
  lastUpdated: string;
  nextCheck: string;
}

interface AIPoweredAnomalyDetectionProps {
  className?: string;
}

export default function AIPoweredAnomalyDetection({ className }: AIPoweredAnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadAnomalyData = () => {
      const mockAnomalies: AnomalyDetection[] = [
        {
          id: 'anomaly-001',
          name: 'Unusual API Response Time Spike',
          type: 'performance',
          severity: 'high',
          status: 'detected',
          confidence: 92,
          impact: {
            users: 15000,
            revenue: 45000,
            services: 8,
            regions: 3,
            duration: 2
          },
          metrics: [
            {
              name: 'API Response Time',
              value: 2500,
              threshold: 500,
              deviation: 400,
              trend: 'up'
            },
            {
              name: 'Error Rate',
              value: 8.5,
              threshold: 2.0,
              deviation: 325,
              trend: 'up'
            },
            {
              name: 'Throughput',
              value: 1200,
              threshold: 2000,
              deviation: -40,
              trend: 'down'
            }
          ],
          patterns: [
            {
              id: 'pattern-1',
              name: 'Database Connection Pool Exhaustion',
              description: 'High correlation with database connection pool usage',
              frequency: 85,
              lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              correlation: 0.92
            },
            {
              id: 'pattern-2',
              name: 'Memory Leak Pattern',
              description: 'Gradual memory increase over time',
              frequency: 70,
              lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              correlation: 0.78
            }
          ],
          recommendations: [
            {
              id: 'rec-1',
              action: 'Scale database connection pool',
              priority: 'high',
              impact: 85,
              effort: 30,
              timeframe: 2
            },
            {
              id: 'rec-2',
              action: 'Implement connection pooling optimization',
              priority: 'medium',
              impact: 70,
              effort: 120,
              timeframe: 8
            },
            {
              id: 'rec-3',
              action: 'Add memory monitoring alerts',
              priority: 'medium',
              impact: 60,
              effort: 60,
              timeframe: 4
            }
          ],
          timeline: [
            {
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              event: 'Anomaly detected',
              severity: 'warning',
              details: 'API response time exceeded threshold'
            },
            {
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
              event: 'Pattern analysis completed',
              severity: 'info',
              details: 'Database connection pool exhaustion identified'
            },
            {
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              event: 'Recommendations generated',
              severity: 'info',
              details: '3 actionable recommendations provided'
            }
          ],
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        },
        {
          id: 'anomaly-002',
          name: 'Suspicious User Login Pattern',
          type: 'security',
          severity: 'critical',
          status: 'investigating',
          confidence: 96,
          impact: {
            users: 500,
            revenue: 0,
            services: 1,
            regions: 1,
            duration: 1
          },
          metrics: [
            {
              name: 'Failed Login Attempts',
              value: 150,
              threshold: 10,
              deviation: 1400,
              trend: 'up'
            },
            {
              name: 'Geographic Anomaly Score',
              value: 95,
              threshold: 30,
              deviation: 217,
              trend: 'up'
            },
            {
              name: 'Time-based Anomaly Score',
              value: 88,
              threshold: 25,
              deviation: 252,
              trend: 'up'
            }
          ],
          patterns: [
            {
              id: 'pattern-1',
              name: 'Brute Force Attack Pattern',
              description: 'Multiple failed login attempts from same IP',
              frequency: 95,
              lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              correlation: 0.96
            },
            {
              id: 'pattern-2',
              name: 'Geographic Anomaly',
              description: 'Login attempts from unusual geographic location',
              frequency: 80,
              lastSeen: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
              correlation: 0.85
            }
          ],
          recommendations: [
            {
              id: 'rec-1',
              action: 'Block suspicious IP addresses',
              priority: 'critical',
              impact: 95,
              effort: 5,
              timeframe: 0.5
            },
            {
              id: 'rec-2',
              action: 'Enable additional authentication factors',
              priority: 'high',
              impact: 80,
              effort: 30,
              timeframe: 2
            },
            {
              id: 'rec-3',
              action: 'Review user account security',
              priority: 'medium',
              impact: 70,
              effort: 60,
              timeframe: 4
            }
          ],
          timeline: [
            {
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              event: 'Security anomaly detected',
              severity: 'critical',
              details: 'Suspicious login pattern identified'
            },
            {
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              event: 'IP address flagged',
              severity: 'warning',
              details: 'Multiple failed attempts from same IP'
            },
            {
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              event: 'Investigation started',
              severity: 'info',
              details: 'Security team notified and investigating'
            }
          ],
          lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 3 * 60 * 1000).toISOString()
        },
        {
          id: 'anomaly-003',
          name: 'Revenue Drop Anomaly',
          type: 'business',
          severity: 'high',
          status: 'detected',
          confidence: 88,
          impact: {
            users: 25000,
            revenue: 125000,
            services: 12,
            regions: 5,
            duration: 6
          },
          metrics: [
            {
              name: 'Daily Revenue',
              value: 45000,
              threshold: 65000,
              deviation: -31,
              trend: 'down'
            },
            {
              name: 'Conversion Rate',
              value: 2.1,
              threshold: 3.5,
              deviation: -40,
              trend: 'down'
            },
            {
              name: 'Customer Acquisition Cost',
              value: 85,
              threshold: 60,
              deviation: 42,
              trend: 'up'
            }
          ],
          patterns: [
            {
              id: 'pattern-1',
              name: 'Seasonal Revenue Drop',
              description: 'Unusual revenue decline for this time of year',
              frequency: 75,
              lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              correlation: 0.88
            },
            {
              id: 'pattern-2',
              name: 'Competitor Price Impact',
              description: 'Correlation with competitor pricing changes',
              frequency: 65,
              lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              correlation: 0.72
            }
          ],
          recommendations: [
            {
              id: 'rec-1',
              action: 'Implement dynamic pricing strategy',
              priority: 'high',
              impact: 80,
              effort: 180,
              timeframe: 12
            },
            {
              id: 'rec-2',
              action: 'Launch promotional campaign',
              priority: 'medium',
              impact: 70,
              effort: 120,
              timeframe: 8
            },
            {
              id: 'rec-3',
              action: 'Analyze competitor pricing',
              priority: 'medium',
              impact: 60,
              effort: 90,
              timeframe: 6
            }
          ],
          timeline: [
            {
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              event: 'Revenue anomaly detected',
              severity: 'warning',
              details: 'Daily revenue below expected threshold'
            },
            {
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              event: 'Pattern analysis completed',
              severity: 'info',
              details: 'Seasonal and competitive factors identified'
            },
            {
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              event: 'Recommendations generated',
              severity: 'info',
              details: '3 business strategy recommendations provided'
            }
          ],
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
      ];

      setAnomalies(mockAnomalies);
      setSelectedAnomaly(mockAnomalies[0]);
    };

    loadAnomalyData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setAnomalies(prev => prev.map(anomaly => ({
        ...anomaly,
        confidence: Math.max(0, Math.min(100, anomaly.confidence + (Math.random() - 0.5) * 2))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'infrastructure': return 'bg-orange-100 text-orange-800';
      case 'user_behavior': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-red-600';
    if (confidence >= 80) return 'text-orange-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const typeMatch = filterType === 'all' || anomaly.type === filterType;
    const severityMatch = filterSeverity === 'all' || anomaly.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || anomaly.status === filterStatus;
    return typeMatch && severityMatch && statusMatch;
  });

  const totalUsers = anomalies.reduce((sum, anomaly) => sum + anomaly.impact.users, 0);
  const totalRevenue = anomalies.reduce((sum, anomaly) => sum + anomaly.impact.revenue, 0);
  const totalServices = anomalies.reduce((sum, anomaly) => sum + anomaly.impact.services, 0);
  const totalRegions = anomalies.reduce((sum, anomaly) => sum + anomaly.impact.regions, 0);
  const avgConfidence = anomalies.length > 0 
    ? Math.round(anomalies.reduce((sum, anomaly) => sum + anomaly.confidence, 0) / anomalies.length)
    : 0;
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Anomaly Detection
              </CardTitle>
              <CardDescription>
                Intelligent system monitoring with pattern recognition and predictive alerts
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
          {/* Anomaly Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatNumber(totalUsers)}</div>
              <div className="text-sm text-muted-foreground">Users Affected</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue Impact</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{criticalAnomalies}</div>
              <div className="text-sm text-muted-foreground">Critical Anomalies</div>
            </div>
          </div>

          {/* AI Anomaly Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">AI-Powered Anomaly Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Intelligent system monitoring with pattern recognition, predictive alerts, and automated recommendations
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {anomalies.length}
                </div>
                <div className="text-sm text-muted-foreground">anomalies detected</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgConfidence / 100) * 100} className="h-2" />
            </div>
          </div>

          {/* Anomaly Detection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Detected Anomalies</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'performance', 'security', 'business', 'infrastructure', 'user_behavior', 'financial'].map((type) => (
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
                <span className="text-sm ml-4">Status:</span>
                {['all', 'detected', 'investigating', 'resolved', 'false_positive'].map((status) => (
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
              {filteredAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnomaly?.id === anomaly.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Brain className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{anomaly.name}</div>
                        <div className="text-sm text-muted-foreground">{anomaly.type} anomaly</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(anomaly.type)}>
                        {anomaly.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                      <Badge className={getStatusColor(anomaly.status)}>
                        {anomaly.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        {anomaly.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Users: {formatNumber(anomaly.impact.users)}</span>
                    <span>Revenue: {formatCurrency(anomaly.impact.revenue)}</span>
                    <span>Services: {anomaly.impact.services}</span>
                    <span>Duration: {anomaly.impact.duration}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Anomaly Details */}
          {selectedAnomaly && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Anomaly Details - {selectedAnomaly.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Anomaly Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedAnomaly.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getTypeColor(selectedAnomaly.type)}>
                            {selectedAnomaly.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                            {selectedAnomaly.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedAnomaly.status)}>
                            {selectedAnomaly.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(selectedAnomaly.confidence)}`}>
                            {selectedAnomaly.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Users Affected:</span>
                          <span className="font-medium">{formatNumber(selectedAnomaly.impact.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedAnomaly.impact.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Services Affected:</span>
                          <span className="font-medium">{selectedAnomaly.impact.services}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Regions Affected:</span>
                          <span className="font-medium">{selectedAnomaly.impact.regions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedAnomaly.impact.duration} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Anomaly Metrics</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.metrics.map((metric, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(metric.trend)}
                              <span className="text-sm font-medium">{metric.deviation}% deviation</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Current: {metric.value}</div>
                              <div>Threshold: {metric.threshold}</div>
                            </div>
                            <div>
                              <div>Deviation: {metric.deviation}%</div>
                              <div>Trend: {metric.trend}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="patterns" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Detected Patterns</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.patterns.map((pattern) => (
                        <div key={pattern.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{pattern.name}</span>
                            <span className="text-sm font-medium">{pattern.correlation * 100}% correlation</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {pattern.description}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Frequency: {pattern.frequency}%</div>
                              <div>Last Seen: {new Date(pattern.lastSeen).toLocaleString()}</div>
                            </div>
                            <div>
                              <div>Correlation: {pattern.correlation * 100}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">AI Recommendations</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.recommendations.map((recommendation) => (
                        <div key={recommendation.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{recommendation.action}</span>
                            <Badge className={getSeverityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Impact: {recommendation.impact}%</div>
                              <div>Effort: {recommendation.effort} minutes</div>
                            </div>
                            <div>
                              <div>Timeframe: {recommendation.timeframe} hours</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Anomaly Timeline</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.timeline.map((event, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{event.event}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.details}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Run Analysis
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
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
