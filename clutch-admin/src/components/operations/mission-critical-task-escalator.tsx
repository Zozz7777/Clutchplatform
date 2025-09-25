"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
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

interface MissionCriticalTask {
  id: string;
  name: string;
  description: string;
  type: 'revenue_blocking' | 'security_critical' | 'compliance_urgent' | 'customer_impact' | 'system_failure' | 'data_loss';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'pending' | 'in_progress' | 'escalated' | 'resolved' | 'cancelled';
  impact: {
    revenue: number;
    users: number;
    services: number;
    regions: number;
    duration: number; // hours
  };
  escalation: {
    level: number; // 1-5
    currentOwner: string;
    escalationPath: {
      level: number;
      owner: string;
      role: string;
      escalationTime: number; // minutes
    }[];
    nextEscalation?: string;
    escalationHistory: {
      timestamp: string;
      level: number;
      owner: string;
      reason: string;
    }[];
  };
  dependencies: {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    blocker: boolean;
  }[];
  timeline: {
    created: string;
    due: string;
    lastUpdated: string;
    estimatedResolution: string;
  };
  metrics: {
    sla: number; // percentage
    responseTime: number; // minutes
    resolutionTime: number; // hours
    escalationCount: number;
  };
  lastUpdated: string;
  nextCheck: string;
}

interface MissionCriticalTaskEscalatorProps {
  className?: string;
}

export default function MissionCriticalTaskEscalator({ className }: MissionCriticalTaskEscalatorProps) {
  const [tasks, setTasks] = useState<MissionCriticalTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MissionCriticalTask | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadTaskData = () => {
      const mockTasks: MissionCriticalTask[] = [
        {
          id: 'task-001',
          name: 'Payment Gateway Outage',
          description: 'Critical payment processing system is down, blocking all revenue transactions',
          type: 'revenue_blocking',
          priority: 'emergency',
          status: 'escalated',
          impact: {
            revenue: 50000,
            users: 25000,
            services: 3,
            regions: 5,
            duration: 2
          },
          escalation: {
            level: 4,
            currentOwner: 'CTO',
            escalationPath: [
              {
                level: 1,
                owner: 'Support Team',
                role: 'L1 Support',
                escalationTime: 15
              },
              {
                level: 2,
                owner: 'Engineering Team',
                role: 'L2 Engineering',
                escalationTime: 30
              },
              {
                level: 3,
                owner: 'Senior Engineering',
                role: 'L3 Senior Engineer',
                escalationTime: 60
              },
              {
                level: 4,
                owner: 'CTO',
                role: 'Executive',
                escalationTime: 120
              },
              {
                level: 5,
                owner: 'CEO',
                role: 'C-Level',
                escalationTime: 240
              }
            ],
            nextEscalation: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            escalationHistory: [
              {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                level: 1,
                owner: 'Support Team',
                reason: 'Initial ticket creation'
              },
              {
                timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                level: 2,
                owner: 'Engineering Team',
                reason: 'L1 unable to resolve'
              },
              {
                timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                level: 3,
                owner: 'Senior Engineering',
                reason: 'Complex system issue'
              },
              {
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                level: 4,
                owner: 'CTO',
                reason: 'Revenue impact critical'
              }
            ]
          },
          dependencies: [
            {
              id: 'dep-1',
              name: 'Database connectivity',
              status: 'completed',
              blocker: false
            },
            {
              id: 'dep-2',
              name: 'Third-party API access',
              status: 'in_progress',
              blocker: true
            },
            {
              id: 'dep-3',
              name: 'Security clearance',
              status: 'pending',
              blocker: false
            }
          ],
          timeline: {
            created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            due: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            estimatedResolution: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            sla: 95,
            responseTime: 5,
            resolutionTime: 3,
            escalationCount: 4
          },
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        },
        {
          id: 'task-002',
          name: 'Security Breach Investigation',
          description: 'Potential unauthorized access detected in production systems',
          type: 'security_critical',
          priority: 'critical',
          status: 'in_progress',
          impact: {
            revenue: 0,
            users: 100000,
            services: 15,
            regions: 8,
            duration: 4
          },
          escalation: {
            level: 3,
            currentOwner: 'Security Team Lead',
            escalationPath: [
              {
                level: 1,
                owner: 'Security Analyst',
                role: 'L1 Security',
                escalationTime: 10
              },
              {
                level: 2,
                owner: 'Security Engineer',
                role: 'L2 Security',
                escalationTime: 20
              },
              {
                level: 3,
                owner: 'Security Team Lead',
                role: 'L3 Security Lead',
                escalationTime: 40
              },
              {
                level: 4,
                owner: 'CISO',
                role: 'Security Executive',
                escalationTime: 80
              },
              {
                level: 5,
                owner: 'CEO',
                role: 'C-Level',
                escalationTime: 160
              }
            ],
            nextEscalation: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            escalationHistory: [
              {
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                level: 1,
                owner: 'Security Analyst',
                reason: 'Initial security alert'
              },
              {
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                level: 2,
                owner: 'Security Engineer',
                reason: 'Confirmed security incident'
              },
              {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                level: 3,
                owner: 'Security Team Lead',
                reason: 'Escalated for investigation'
              }
            ]
          },
          dependencies: [
            {
              id: 'dep-1',
              name: 'Forensic analysis',
              status: 'in_progress',
              blocker: false
            },
            {
              id: 'dep-2',
              name: 'Legal consultation',
              status: 'pending',
              blocker: false
            },
            {
              id: 'dep-3',
              name: 'Customer notification',
              status: 'pending',
              blocker: true
            }
          ],
          timeline: {
            created: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            due: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            estimatedResolution: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            sla: 98,
            responseTime: 2,
            resolutionTime: 6,
            escalationCount: 3
          },
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        },
        {
          id: 'task-003',
          name: 'GDPR Compliance Violation',
          description: 'Customer data processing without proper consent detected',
          type: 'compliance_urgent',
          priority: 'high',
          status: 'pending',
          impact: {
            revenue: 25000,
            users: 5000,
            services: 2,
            regions: 3,
            duration: 8
          },
          escalation: {
            level: 2,
            currentOwner: 'Compliance Team',
            escalationPath: [
              {
                level: 1,
                owner: 'Compliance Analyst',
                role: 'L1 Compliance',
                escalationTime: 30
              },
              {
                level: 2,
                owner: 'Compliance Team',
                role: 'L2 Compliance',
                escalationTime: 60
              },
              {
                level: 3,
                owner: 'Legal Team',
                role: 'L3 Legal',
                escalationTime: 120
              },
              {
                level: 4,
                owner: 'General Counsel',
                role: 'Legal Executive',
                escalationTime: 240
              },
              {
                level: 5,
                owner: 'CEO',
                role: 'C-Level',
                escalationTime: 480
              }
            ],
            nextEscalation: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            escalationHistory: [
              {
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                level: 1,
                owner: 'Compliance Analyst',
                reason: 'Initial compliance violation detected'
              },
              {
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                level: 2,
                owner: 'Compliance Team',
                reason: 'Escalated for legal review'
              }
            ]
          },
          dependencies: [
            {
              id: 'dep-1',
              name: 'Data audit',
              status: 'pending',
              blocker: false
            },
            {
              id: 'dep-2',
              name: 'Legal review',
              status: 'pending',
              blocker: true
            },
            {
              id: 'dep-3',
              name: 'Remediation plan',
              status: 'pending',
              blocker: false
            }
          ],
          timeline: {
            created: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            due: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
            lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            estimatedResolution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          },
          metrics: {
            sla: 90,
            responseTime: 15,
            resolutionTime: 8,
            escalationCount: 2
          },
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          nextCheck: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      ];

      setTasks(mockTasks);
      setSelectedTask(mockTasks[0]);
    };

    loadTaskData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => ({
        ...task,
        escalation: {
          ...task.escalation,
          level: Math.min(5, task.escalation.level + (Math.random() > 0.95 ? 1 : 0))
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue_blocking': return 'bg-destructive/10 text-destructive';
      case 'security_critical': return 'bg-warning/10 text-warning';
      case 'compliance_urgent': return 'bg-warning/10 text-warning';
      case 'customer_impact': return 'bg-primary/10 text-blue-800';
      case 'system_failure': return 'bg-primary/10 text-purple-800';
      case 'data_loss': return 'bg-pink-100 text-pink-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'emergency': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'in_progress': return 'bg-primary/10 text-blue-800';
      case 'escalated': return 'bg-destructive/10 text-destructive';
      case 'resolved': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getEscalationLevelColor = (level: number) => {
    if (level >= 4) return 'text-destructive';
    if (level >= 3) return 'text-warning';
    if (level >= 2) return 'text-warning';
    return 'text-success';
  };

  const filteredTasks = tasks.filter(task => {
    const typeMatch = filterType === 'all' || task.type === filterType;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    return typeMatch && priorityMatch && statusMatch;
  });

  const totalRevenue = tasks.reduce((sum, task) => sum + task.impact.revenue, 0);
  const totalUsers = tasks.reduce((sum, task) => sum + task.impact.users, 0);
  const totalServices = tasks.reduce((sum, task) => sum + task.impact.services, 0);
  const totalRegions = tasks.reduce((sum, task) => sum + task.impact.regions, 0);
  const avgEscalationLevel = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, task) => sum + task.escalation.level, 0) / tasks.length)
    : 0;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'emergency').length;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Mission-Critical Task Escalator
              </CardTitle>
              <CardDescription>
                Revenue-blocking task escalation with automated workflow management
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
          {/* Task Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue at Risk</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{formatNumber(totalUsers)}</div>
              <div className="text-sm text-muted-foreground">Users Affected</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{avgEscalationLevel}</div>
              <div className="text-sm text-muted-foreground">Avg Escalation Level</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{criticalTasks}</div>
              <div className="text-sm text-muted-foreground">Critical Tasks</div>
            </div>
          </div>

          {/* Escalation Overview */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Mission-Critical Task Escalation</h4>
                <p className="text-sm text-muted-foreground">
                  Automated escalation workflow for revenue-blocking tasks with intelligent routing and SLA management
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-destructive">
                  {tasks.length}
                </div>
                <div className="text-sm text-muted-foreground">tasks monitored</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgEscalationLevel / 5) * 100} className="h-2" />
            </div>
          </div>

          {/* Mission-Critical Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Mission-Critical Tasks</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'revenue_blocking', 'security_critical', 'compliance_urgent', 'customer_impact', 'system_failure', 'data_loss'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Priority:</span>
                {['all', 'low', 'medium', 'high', 'critical', 'emergency'].map((priority) => (
                  <Button
                    key={priority}
                    variant={filterPriority === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPriority(priority)}
                  >
                    {priority}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'pending', 'in_progress', 'escalated', 'resolved', 'cancelled'].map((status) => (
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
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedTask?.id === task.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Flag className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(task.type)}>
                        {task.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        Level {task.escalation.level}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Revenue: {formatCurrency(task.impact.revenue)}</span>
                    <span>Users: {formatNumber(task.impact.users)}</span>
                    <span>Services: {task.impact.services}</span>
                    <span>Duration: {task.impact.duration}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Task Details */}
          {selectedTask && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Task Details - {selectedTask.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="escalation">Escalation</TabsTrigger>
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Task Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedTask.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getTypeColor(selectedTask.type)}>
                            {selectedTask.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge className={getPriorityColor(selectedTask.priority)}>
                            {selectedTask.priority}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedTask.status)}>
                            {selectedTask.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Owner:</span>
                          <span className="font-medium">{selectedTask.escalation.currentOwner}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedTask.impact.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Users Affected:</span>
                          <span className="font-medium">{formatNumber(selectedTask.impact.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Services Affected:</span>
                          <span className="font-medium">{selectedTask.impact.services}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Regions Affected:</span>
                          <span className="font-medium">{selectedTask.impact.regions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedTask.impact.duration} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="escalation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Escalation Path</h5>
                    <div className="space-y-2">
                      {selectedTask.escalation.escalationPath.map((level, index) => (
                        <div key={index} className={`p-3 border rounded-[0.625rem] ${
                          level.level === selectedTask.escalation.level ? 'border-blue-500 bg-primary/10' : ''
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Level {level.level}: {level.owner}</span>
                            <span className="text-sm text-muted-foreground">{level.role}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Escalation Time: {level.escalationTime} minutes
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Escalation History</h5>
                    <div className="space-y-2">
                      {selectedTask.escalation.escalationHistory.map((event, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Level {event.level}: {event.owner}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Task Dependencies</h5>
                    <div className="space-y-2">
                      {selectedTask.dependencies.map((dependency) => (
                        <div key={dependency.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dependency.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(dependency.status)}>
                                {dependency.status.replace('_', ' ')}
                              </Badge>
                              {dependency.blocker && (
                                <Badge className="bg-destructive/10 text-destructive">
                                  Blocker
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Task Timeline</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">{new Date(selectedTask.timeline.created).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due:</span>
                        <span className="font-medium">{new Date(selectedTask.timeline.due).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-medium">{new Date(selectedTask.timeline.lastUpdated).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Resolution:</span>
                        <span className="font-medium">{new Date(selectedTask.timeline.estimatedResolution).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Task Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>SLA:</span>
                        <span className="font-medium">{selectedTask.metrics.sla}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">{selectedTask.metrics.responseTime} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolution Time:</span>
                        <span className="font-medium">{selectedTask.metrics.resolutionTime} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escalation Count:</span>
                        <span className="font-medium">{selectedTask.metrics.escalationCount}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Escalate Task
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


