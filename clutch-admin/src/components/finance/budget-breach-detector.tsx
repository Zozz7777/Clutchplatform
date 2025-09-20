"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
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
  Activity,
  BarChart3,
  LineChart,
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
import { productionApi } from '@/lib/production-api';
import { useTranslations } from 'next-intl';

interface BudgetBreach {
  id: string;
  name: string;
  description: string;
  category: 'infrastructure' | 'marketing' | 'operations' | 'development' | 'support' | 'security' | 'compliance' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'monitoring' | 'alert' | 'breach' | 'resolved' | 'escalated';
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
    velocity: number; // spend per day
    projected: number; // projected total spend
  };
  timeline: {
    startDate: string;
    endDate: string;
    currentPeriod: string;
    lastUpdated: string;
  };
  alerts: {
    threshold: number;
    current: number;
    triggered: boolean;
    escalationLevel: number;
  }[];
  impact: {
    financial: number;
    operational: number;
    timeline: number;
    reputation: number;
  };
  mitigation: {
    strategy: string;
    cost: number;
    timeframe: number;
    effectiveness: number;
    status: 'planned' | 'in_progress' | 'completed' | 'failed';
  }[];
  lastUpdated: string;
  nextCheck: string;
}

interface BudgetBreachDetectorProps {
  className?: string;
}

export default function BudgetBreachDetector({ className }: BudgetBreachDetectorProps) {
  const [breaches, setBreaches] = useState<BudgetBreach[]>([]);
  const [selectedBreach, setSelectedBreach] = useState<BudgetBreach | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadBudgetBreachData = async () => {
      try {
        // This would typically call a budget breach API
        // For now, we'll use mock data that simulates real budget monitoring
        const mockBreaches: BudgetBreach[] = [
          {
            id: 'breach-001',
            name: 'Cloud Infrastructure Costs',
            description: 'AWS and Azure spending exceeding allocated budget',
            category: 'infrastructure',
            severity: 'high',
            status: 'breach',
            budget: {
              allocated: 50000,
              spent: 52000,
              remaining: -2000,
              percentage: 104,
              velocity: 2500,
              projected: 75000
            },
            timeline: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              currentPeriod: 'Q1 2024',
              lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            alerts: [
              {
                threshold: 80,
                current: 104,
                triggered: true,
                escalationLevel: 3
              },
              {
                threshold: 90,
                current: 104,
                triggered: true,
                escalationLevel: 2
              },
              {
                threshold: 100,
                current: 104,
                triggered: true,
                escalationLevel: 1
              }
            ],
          impact: {
            financial: budget.impact?.financial || 0,
            operational: budget.impact?.operational || 0,
            reputational: budget.impact?.reputational || 0,
            compliance: budget.impact?.compliance || 0
          },
          mitigation: {
            actions: budget.mitigation?.actions || [],
            estimatedSavings: budget.mitigation?.estimatedSavings || 0,
            timeframe: budget.mitigation?.timeframe || 0,
            effectiveness: budget.mitigation?.effectiveness || 0,
            status: budget.mitigation?.status || 'pending'
          },
          lastUpdated: budget.lastUpdated || new Date().toISOString(),
          nextCheck: budget.nextCheck || new Date().toISOString()
        }));
            severity: 'medium',
            status: 'alert',
            budget: {
              allocated: 25000,
              spent: 20000,
              remaining: 5000,
              percentage: 80,
              velocity: 1000,
              projected: 30000
            },
            timeline: {
              startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              currentPeriod: 'Q1 2024',
              lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            },
            alerts: [
              {
                threshold: 80,
                current: 80,
                triggered: true,
                escalationLevel: 1
              },
              {
                threshold: 90,
                current: 80,
                triggered: false,
                escalationLevel: 0
              },
              {
                threshold: 100,
                current: 80,
                triggered: false,
                escalationLevel: 0
              }
            ],
            impact: {
              financial: 5000,
              operational: 50,
              timeline: 30,
              reputation: 20
            },
            mitigation: [
              {
                strategy: 'Reduce ad spend',
                cost: 0,
                timeframe: 1,
                effectiveness: 70,
                status: 'in_progress'
              },
              {
                strategy: 'Optimize targeting',
                cost: 2000,
                timeframe: 5,
                effectiveness: 85,
                status: 'planned'
              }
            ],
            lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            nextCheck: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'breach-003',
            name: 'Development Team Costs',
            description: 'Software development and contractor expenses',
            category: 'development',
            severity: 'low',
            status: 'monitoring',
            budget: {
              allocated: 100000,
              spent: 75000,
              remaining: 25000,
              percentage: 75,
              velocity: 2000,
              projected: 95000
            },
            timeline: {
              startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              currentPeriod: 'Q1 2024',
              lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            },
            alerts: [
              {
                threshold: 80,
                current: 75,
                triggered: false,
                escalationLevel: 0
              },
              {
                threshold: 90,
                current: 75,
                triggered: false,
                escalationLevel: 0
              },
              {
                threshold: 100,
                current: 75,
                triggered: false,
                escalationLevel: 0
              }
            ],
            impact: {
              financial: 0,
              operational: 25,
              timeline: 15,
              reputation: 10
            },
            mitigation: [
              {
                strategy: 'Monitor spending velocity',
                cost: 0,
                timeframe: 0,
                effectiveness: 100,
                status: 'completed'
              }
            ],
            lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            nextCheck: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          }
        ];

        setBreaches(transformedBreaches);
        if (transformedBreaches.length > 0) {
          setSelectedBreach(transformedBreaches[0]);
        }
      } catch (error) {
        // Failed to load budget breach data
        // Fallback to empty array if API fails
        setBreaches([]);
      }
    };

    loadBudgetBreachData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setBreaches(prev => prev.map(breach => ({
        ...breach,
        budget: {
          ...breach.budget,
          spent: breach.budget.spent + (breach.budget.velocity / 24), // Simulate hourly spend
          percentage: Math.min(120, ((breach.budget.spent + (breach.budget.velocity / 24)) / breach.budget.allocated) * 100)
        }
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure': return 'bg-info/10 text-info';
      case 'marketing': return 'bg-success/10 text-success';
      case 'operations': return 'bg-warning/10 text-warning';
      case 'development': return 'bg-primary/10 text-primary';
      case 'support': return 'bg-warning/10 text-warning';
      case 'security': return 'bg-destructive/10 text-destructive';
      case 'compliance': return 'bg-primary/10 text-primary';
      case 'other': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'emergency': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monitoring': return 'bg-info/10 text-info';
      case 'alert': return 'bg-warning/10 text-warning';
      case 'breach': return 'bg-destructive/10 text-destructive';
      case 'resolved': return 'bg-success/10 text-success';
      case 'escalated': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMitigationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'in_progress': return 'bg-info/10 text-info';
      case 'planned': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredBreaches = breaches.filter(breach => {
    const categoryMatch = filterCategory === 'all' || breach.category === filterCategory;
    const severityMatch = filterSeverity === 'all' || breach.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || breach.status === filterStatus;
    return categoryMatch && severityMatch && statusMatch;
  });

  const totalAllocated = breaches.reduce((sum, breach) => sum + breach.budget.allocated, 0);
  const totalSpent = breaches.reduce((sum, breach) => sum + breach.budget.spent, 0);
  const totalRemaining = breaches.reduce((sum, breach) => sum + breach.budget.remaining, 0);
  const avgVelocity = breaches.length > 0 
    ? Math.round(breaches.reduce((sum, breach) => sum + breach.budget.velocity, 0) / breaches.length)
    : 0;
  const criticalBreaches = breaches.filter(b => b.severity === 'critical' || b.severity === 'emergency').length;
  const activeBreaches = breaches.filter(b => b.status === 'breach' || b.status === 'alert').length;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Budget Breach Detector
              </CardTitle>
              <CardDescription>
                Real-time budget monitoring with spend velocity alerts and breach prevention
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-success' : ''}
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
          {/* Budget Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-info/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-info">{formatCurrency(totalAllocated)}</div>
              <div className="text-sm text-muted-foreground">Total Allocated</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalSpent)}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalRemaining)}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{activeBreaches}</div>
              <div className="text-sm text-muted-foreground">Active Breaches</div>
            </div>
          </div>

          {/* Budget Breach Overview */}
          <div className="p-4 bg-gradient-to-r from-destructive/10 to-warning/10 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Budget Breach Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time budget tracking with velocity-based alerts and automated breach prevention
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-destructive">
                  {breaches.length}
                </div>
                <div className="text-sm text-muted-foreground">budgets monitored</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(totalSpent / totalAllocated) * 100} className="h-2" />
            </div>
          </div>

          {/* Budget Breaches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Budget Breaches</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'infrastructure', 'marketing', 'operations', 'development', 'support', 'security', 'compliance', 'other'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
                <span className="text-sm ml-4">Severity:</span>
                {['all', 'low', 'medium', 'high', 'critical', 'emergency'].map((severity) => (
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
                {['all', 'monitoring', 'alert', 'breach', 'resolved', 'escalated'].map((status) => (
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
              {filteredBreaches.map((breach) => (
                <div
                  key={breach.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedBreach?.id === breach.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBreach(breach)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{breach.name}</div>
                        <div className="text-sm text-muted-foreground">{breach.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(breach.category)}>
                        {breach.category}
                      </Badge>
                      <Badge className={getSeverityColor(breach.severity)}>
                        {breach.severity}
                      </Badge>
                      <Badge className={getStatusColor(breach.status)}>
                        {breach.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {breach.budget.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Spent: {formatCurrency(breach.budget.spent)}</span>
                    <span>Allocated: {formatCurrency(breach.budget.allocated)}</span>
                    <span>Velocity: {formatCurrency(breach.budget.velocity)}/day</span>
                    <span>Projected: {formatCurrency(breach.budget.projected)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Breach Details */}
          {selectedBreach && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Breach Details - {selectedBreach.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                  <TabsTrigger value="impact">Impact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Breach Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedBreach.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <Badge className={getCategoryColor(selectedBreach.category)}>
                            {selectedBreach.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedBreach.severity)}>
                            {selectedBreach.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedBreach.status)}>
                            {selectedBreach.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Period:</span>
                          <span className="font-medium">{selectedBreach.timeline.currentPeriod}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Budget Status</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Allocated:</span>
                          <span className="font-medium">{formatCurrency(selectedBreach.budget.allocated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Spent:</span>
                          <span className="font-medium">{formatCurrency(selectedBreach.budget.spent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-medium">{formatCurrency(selectedBreach.budget.remaining)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Percentage:</span>
                          <span className="font-medium">{selectedBreach.budget.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocity:</span>
                          <span className="font-medium">{formatCurrency(selectedBreach.budget.velocity)}/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="budget" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Budget Analysis</h5>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget Utilization</span>
                          <span>{selectedBreach.budget.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={selectedBreach.budget.percentage} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Spending Velocity</div>
                          <div className="text-muted-foreground">{formatCurrency(selectedBreach.budget.velocity)} per day</div>
                        </div>
                        <div>
                          <div className="font-medium">Projected Total</div>
                          <div className="text-muted-foreground">{formatCurrency(selectedBreach.budget.projected)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Alert Thresholds</h5>
                    <div className="space-y-2">
                      {selectedBreach.alerts.map((alert, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{alert.threshold}% Threshold</span>
                            <Badge className={alert.triggered ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>
                              {alert.triggered ? 'Triggered' : 'Normal'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current: {alert.current.toFixed(1)}% | Escalation Level: {alert.escalationLevel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mitigation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                    <div className="space-y-2">
                      {selectedBreach.mitigation.map((strategy, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{strategy.strategy}</span>
                            <Badge className={getMitigationStatusColor(strategy.status)}>
                              {strategy.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Cost: {formatCurrency(strategy.cost)}</div>
                              <div>Timeframe: {strategy.timeframe} days</div>
                            </div>
                            <div>
                              <div>Effectiveness: {strategy.effectiveness}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Impact Assessment</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Financial Impact:</span>
                        <span className="font-medium">{formatCurrency(selectedBreach.impact.financial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operational Impact:</span>
                        <span className="font-medium">{selectedBreach.impact.operational}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeline Impact:</span>
                        <span className="font-medium">{selectedBreach.impact.timeline}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reputation Impact:</span>
                        <span className="font-medium">{selectedBreach.impact.reputation}%</span>
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
