"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  AlertTriangle, 
  Target, 
  Activity,
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
  GitBranch as BranchIcon2,
  Flag,
  AlertCircle as AlertCircleIcon2,
  CheckCircle as CheckCircleIcon2,
  XCircle as XCircleIcon2,
  Info as InfoIcon3,
  RotateCcw as RollbackIcon3,
  Power as PowerIcon2,
  PowerOff as PowerOffIcon2,
  ToggleLeft as ToggleLeftIcon2,
  ToggleRight as ToggleRightIcon2,
  Monitor as MonitorIcon2,
  Smartphone as SmartphoneIcon2,
  Laptop as LaptopIcon2,
  Tablet as TabletIcon2,
  Brain as BrainIcon2,
  Calculator as CalculatorIcon2,
  PieChart as PieChartIcon3,
  BarChart as BarChartIcon2,
  LineChart as LineChartIcon3,
  TestTube as TestTubeIcon2,
  Bug as BugIcon2,
  Shield as ShieldIcon2,
  Wrench as WrenchIcon2,
  Trash2 as Trash2Icon2,
  Plus as PlusIcon2,
  Edit as EditIcon2,
  Save as SaveIcon2,
  X as XIcon2,
  MapPin as MapPinIcon2,
  Globe as GlobeIcon2,
  Building as BuildingIcon2,
  Car as CarIcon2,
  Phone as PhoneIcon2,
  Mail as MailIcon2,
  Calendar as CalendarIcon2,
  Star as StarIcon2,
  Heart as HeartIcon2,
  MessageSquare as MessageSquareIcon2,
  FileText as FileTextIcon2,
  CreditCard as CreditCardIcon2,
  Zap as ZapIcon2,
  Network as NetworkIcon2,
  GitBranch as GitBranchIcon2,
  GitCommit as GitCommitIcon2,
  GitMerge as GitMergeIcon2,
  GitPullRequest as GitPullRequestIcon2,
  GitBranch as BranchIcon3
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ProjectRisk {
  id: string;
  name: string;
  description: string;
  category: 'infrastructure' | 'security' | 'compliance' | 'financial' | 'operational' | 'technical' | 'market' | 'regulatory';
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'extreme';
  probability: number; // 0-100
  impact: {
    financial: number;
    operational: number;
    reputational: number;
    regulatory: number;
    total: number;
  };
  mitigation: {
    strategy: string;
    effectiveness: number;
    cost: number;
    timeframe: number; // days
    status: 'planned' | 'in_progress' | 'completed' | 'failed';
  }[];
  dependencies: {
    id: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    correlation: number;
  }[];
  timeline: {
    identified: string;
    lastAssessed: string;
    nextReview: string;
    targetResolution: string;
  };
  metrics: {
    riskScore: number; // 0-100
    trend: 'improving' | 'stable' | 'deteriorating';
    velocity: number; // risk change per day
    exposure: number; // total exposure value
  };
  lastUpdated: string;
  nextUpdate: string;
}

interface PortfolioRiskDashboardProps {
  className?: string;
}

export default function PortfolioRiskDashboard({ className }: PortfolioRiskDashboardProps) {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');

  useEffect(() => {
    const loadRiskData = () => {
      const mockRisks: ProjectRisk[] = [
        {
          id: 'risk-001',
          name: 'Cloud Infrastructure Dependency',
          description: 'Single point of failure in cloud infrastructure affecting multiple services',
          category: 'infrastructure',
          riskLevel: 'high',
          probability: 75,
          impact: {
            financial: 500000,
            operational: 80,
            reputational: 60,
            regulatory: 20,
            total: 85
          },
          mitigation: [
            {
              strategy: 'Multi-cloud deployment',
              effectiveness: 90,
              cost: 200000,
              timeframe: 90,
              status: 'in_progress'
            },
            {
              strategy: 'Disaster recovery planning',
              effectiveness: 80,
              cost: 100000,
              timeframe: 60,
              status: 'planned'
            },
            {
              strategy: 'Infrastructure monitoring',
              effectiveness: 70,
              cost: 50000,
              timeframe: 30,
              status: 'completed'
            }
          ],
          dependencies: [
            {
              id: 'dep-1',
              name: 'Database Cluster',
              riskLevel: 'high',
              correlation: 0.85
            },
            {
              id: 'dep-2',
              name: 'CDN Services',
              riskLevel: 'medium',
              correlation: 0.60
            },
            {
              id: 'dep-3',
              name: 'Load Balancers',
              riskLevel: 'high',
              correlation: 0.90
            }
          ],
          timeline: {
            identified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastAssessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            targetResolution: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            riskScore: 85,
            trend: 'deteriorating',
            velocity: 2.5,
            exposure: 500000
          },
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'risk-002',
          name: 'Data Privacy Compliance',
          description: 'GDPR compliance gaps in data processing and storage systems',
          category: 'compliance',
          riskLevel: 'critical',
          probability: 60,
          impact: {
            financial: 1000000,
            operational: 70,
            reputational: 90,
            regulatory: 95,
            total: 88
          },
          mitigation: [
            {
              strategy: 'Data encryption implementation',
              effectiveness: 85,
              cost: 300000,
              timeframe: 120,
              status: 'in_progress'
            },
            {
              strategy: 'Privacy policy updates',
              effectiveness: 70,
              cost: 50000,
              timeframe: 30,
              status: 'completed'
            },
            {
              strategy: 'Staff training program',
              effectiveness: 60,
              cost: 75000,
              timeframe: 60,
              status: 'planned'
            }
          ],
          dependencies: [
            {
              id: 'dep-1',
              name: 'Data Processing Systems',
              riskLevel: 'critical',
              correlation: 0.95
            },
            {
              id: 'dep-2',
              name: 'User Consent Management',
              riskLevel: 'high',
              correlation: 0.80
            },
            {
              id: 'dep-3',
              name: 'Legal Framework',
              riskLevel: 'medium',
              correlation: 0.65
            }
          ],
          timeline: {
            identified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            lastAssessed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            targetResolution: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            riskScore: 88,
            trend: 'stable',
            velocity: 0.5,
            exposure: 1000000
          },
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'risk-003',
          name: 'Market Competition',
          description: 'Increased competition from new market entrants affecting market share',
          category: 'market',
          riskLevel: 'medium',
          probability: 80,
          impact: {
            financial: 750000,
            operational: 50,
            reputational: 40,
            regulatory: 10,
            total: 65
          },
          mitigation: [
            {
              strategy: 'Product differentiation',
              effectiveness: 75,
              cost: 400000,
              timeframe: 180,
              status: 'in_progress'
            },
            {
              strategy: 'Customer retention program',
              effectiveness: 70,
              cost: 200000,
              timeframe: 90,
              status: 'planned'
            },
            {
              strategy: 'Market expansion',
              effectiveness: 60,
              cost: 500000,
              timeframe: 365,
              status: 'planned'
            }
          ],
          dependencies: [
            {
              id: 'dep-1',
              name: 'Product Development',
              riskLevel: 'medium',
              correlation: 0.70
            },
            {
              id: 'dep-2',
              name: 'Marketing Strategy',
              riskLevel: 'medium',
              correlation: 0.65
            },
            {
              id: 'dep-3',
              name: 'Customer Base',
              riskLevel: 'low',
              correlation: 0.45
            }
          ],
          timeline: {
            identified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            lastAssessed: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            targetResolution: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            riskScore: 65,
            trend: 'improving',
            velocity: -1.2,
            exposure: 750000
          },
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          nextUpdate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setRisks(mockRisks);
      setSelectedRisk(mockRisks[0]);
    };

    loadRiskData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setRisks(prev => prev.map(risk => ({
        ...risk,
        probability: Math.max(0, Math.min(100, risk.probability + (Math.random() - 0.5) * 2))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-orange-100 text-orange-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'market': return 'bg-pink-100 text-pink-800';
      case 'regulatory': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMitigationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRisks = risks.filter(risk => {
    const categoryMatch = filterCategory === 'all' || risk.category === filterCategory;
    const riskLevelMatch = filterRiskLevel === 'all' || risk.riskLevel === filterRiskLevel;
    return categoryMatch && riskLevelMatch;
  });

  const totalExposure = risks.reduce((sum, risk) => sum + risk.metrics.exposure, 0);
  const avgRiskScore = risks.length > 0 
    ? Math.round(risks.reduce((sum, risk) => sum + risk.metrics.riskScore, 0) / risks.length)
    : 0;
  const criticalRisks = risks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'extreme').length;
  const totalMitigations = risks.reduce((sum, risk) => sum + risk.mitigation.length, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Risk Dashboard
              </CardTitle>
              <CardDescription>
                Aggregate project risk analysis with comprehensive mitigation tracking
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
          {/* Risk Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExposure)}</div>
              <div className="text-sm text-muted-foreground">Total Exposure</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{avgRiskScore}</div>
              <div className="text-sm text-muted-foreground">Avg Risk Score</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{criticalRisks}</div>
              <div className="text-sm text-muted-foreground">Critical Risks</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalMitigations}</div>
              <div className="text-sm text-muted-foreground">Mitigation Strategies</div>
            </div>
          </div>

          {/* Portfolio Risk Overview */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Portfolio Risk Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive risk assessment across all projects with mitigation tracking and exposure analysis
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">
                  {risks.length}
                </div>
                <div className="text-sm text-muted-foreground">risks monitored</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgRiskScore / 100) * 100} className="h-2" />
            </div>
          </div>

          {/* Portfolio Risks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Portfolio Risks</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'infrastructure', 'security', 'compliance', 'financial', 'operational', 'technical', 'market', 'regulatory'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
                <span className="text-sm ml-4">Risk Level:</span>
                {['all', 'low', 'medium', 'high', 'critical', 'extreme'].map((riskLevel) => (
                  <Button
                    key={riskLevel}
                    variant={filterRiskLevel === riskLevel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRiskLevel(riskLevel)}
                  >
                    {riskLevel}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredRisks.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRisk?.id === risk.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRisk(risk)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{risk.name}</div>
                        <div className="text-sm text-muted-foreground">{risk.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(risk.category)}>
                        {risk.category}
                      </Badge>
                      <Badge className={getRiskLevelColor(risk.riskLevel)}>
                        {risk.riskLevel}
                      </Badge>
                      <div className="text-sm font-medium">
                        {risk.probability}% probability
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Exposure: {formatCurrency(risk.metrics.exposure)}</span>
                    <span>Risk Score: {risk.metrics.riskScore}</span>
                    <span>Trend: {risk.metrics.trend}</span>
                    <span>Mitigations: {risk.mitigation.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Risk Details */}
          {selectedRisk && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Risk Details - {selectedRisk.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Risk Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedRisk.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <Badge className={getCategoryColor(selectedRisk.category)}>
                            {selectedRisk.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <Badge className={getRiskLevelColor(selectedRisk.riskLevel)}>
                            {selectedRisk.riskLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Probability:</span>
                          <span className="font-medium">{selectedRisk.probability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Score:</span>
                          <span className={`font-medium ${getRiskScoreColor(selectedRisk.metrics.riskScore)}`}>
                            {selectedRisk.metrics.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Financial Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedRisk.impact.financial)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operational Impact:</span>
                          <span className="font-medium">{selectedRisk.impact.operational}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputational Impact:</span>
                          <span className="font-medium">{selectedRisk.impact.reputational}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Regulatory Impact:</span>
                          <span className="font-medium">{selectedRisk.impact.regulatory}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Impact:</span>
                          <span className="font-medium">{selectedRisk.impact.total}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mitigation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                    <div className="space-y-2">
                      {selectedRisk.mitigation.map((strategy, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{strategy.strategy}</span>
                            <Badge className={getMitigationStatusColor(strategy.status)}>
                              {strategy.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Effectiveness: {strategy.effectiveness}%</div>
                              <div>Cost: {formatCurrency(strategy.cost)}</div>
                            </div>
                            <div>
                              <div>Timeframe: {strategy.timeframe} days</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Dependencies</h5>
                    <div className="space-y-2">
                      {selectedRisk.dependencies.map((dependency) => (
                        <div key={dependency.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dependency.name}</span>
                            <Badge className={getRiskLevelColor(dependency.riskLevel)}>
                              {dependency.riskLevel}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Correlation: {dependency.correlation * 100}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Timeline</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Identified:</span>
                        <span className="font-medium">{new Date(selectedRisk.timeline.identified).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Assessed:</span>
                        <span className="font-medium">{new Date(selectedRisk.timeline.lastAssessed).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Review:</span>
                        <span className="font-medium">{new Date(selectedRisk.timeline.nextReview).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Resolution:</span>
                        <span className="font-medium">{new Date(selectedRisk.timeline.targetResolution).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className={`font-medium ${getRiskScoreColor(selectedRisk.metrics.riskScore)}`}>
                          {selectedRisk.metrics.riskScore}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(selectedRisk.metrics.trend)}
                          <span className="font-medium">{selectedRisk.metrics.trend}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Velocity:</span>
                        <span className="font-medium">{selectedRisk.metrics.velocity} per day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exposure:</span>
                        <span className="font-medium">{formatCurrency(selectedRisk.metrics.exposure)}</span>
                      </div>
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
