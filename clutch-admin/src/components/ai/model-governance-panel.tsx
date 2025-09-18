"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  Target, 
  Activity,
  Zap,
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
  Info as InfoIcon
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface AIModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision' | 'recommendation';
  purpose: string;
  version: string;
  status: 'development' | 'testing' | 'production' | 'deprecated' | 'retired';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  lastDeployed: string;
  trainingData: {
    size: number;
    sources: string[];
    lastUpdated: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  performance: {
    latency: number;
    throughput: number;
    resourceUsage: number;
    errorRate: number;
  };
  bias: {
    overall: number; // 0-100 (lower is better)
    demographic: {
      gender: number;
      age: number;
      ethnicity: number;
      location: number;
    };
    fairness: {
      equalizedOdds: number;
      demographicParity: number;
      equalOpportunity: number;
    };
    lastAssessment: string;
  };
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    sox: boolean;
    hipaa: boolean;
    iso27001: boolean;
    lastAudit: string;
    auditScore: number;
  };
  governance: {
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
    approver: string;
    approvalDate?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    documentation: string[];
    monitoring: boolean;
    alerts: boolean;
  };
  impact: {
    businessValue: number;
    usersAffected: number;
    revenueImpact: number;
    riskScore: number;
  };
}

interface BiasAlert {
  id: string;
  modelId: string;
  type: 'demographic_bias' | 'fairness_violation' | 'accuracy_drop' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  detectedAt: string;
  lastUpdated: string;
  metrics: {
    metric: string;
    value: number;
    threshold: number;
    impact: 'low' | 'medium' | 'high';
  }[];
  actions: {
    id: string;
    type: 'retrain' | 'adjust_threshold' | 'investigate' | 'rollback' | 'document';
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo: string;
    dueDate: string;
  }[];
}

interface ModelGovernancePanelProps {
  className?: string;
}

export default function ModelGovernancePanel({ className }: ModelGovernancePanelProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [biasAlerts, setBiasAlerts] = useState<BiasAlert[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadModelGovernanceData = () => {
      const mockModels: AIModel[] = [
        {
          id: 'model-001',
          name: 'Customer Churn Predictor',
          type: 'classification',
          purpose: 'Predict customer churn probability',
          version: 'v2.1.3',
          status: 'production',
          accuracy: 87.5,
          precision: 85.2,
          recall: 89.1,
          f1Score: 87.1,
          lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastDeployed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            size: 150000,
            sources: ['Customer Database', 'Support Tickets', 'Usage Analytics'],
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            quality: 'good'
          },
          performance: {
            latency: 45,
            throughput: 1000,
            resourceUsage: 65,
            errorRate: 0.8
          },
          bias: {
            overall: 15,
            demographic: {
              gender: 12,
              age: 18,
              ethnicity: 22,
              location: 14
            },
            fairness: {
              equalizedOdds: 0.85,
              demographicParity: 0.78,
              equalOpportunity: 0.82
            },
            lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          compliance: {
            gdpr: true,
            ccpa: true,
            sox: false,
            hipaa: false,
            iso27001: true,
            lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            auditScore: 92
          },
          governance: {
            approvalStatus: 'approved',
            approver: 'Dr. Sarah Chen',
            approvalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'medium',
            documentation: ['Model Documentation', 'Bias Assessment', 'Performance Report'],
            monitoring: true,
            alerts: true
          },
          impact: {
            businessValue: 250000,
            usersAffected: 50000,
            revenueImpact: 180000,
            riskScore: 35
          }
        },
        {
          id: 'model-002',
          name: 'Dynamic Pricing Engine',
          type: 'regression',
          purpose: 'Optimize pricing based on demand and competition',
          version: 'v1.4.2',
          status: 'production',
          accuracy: 92.3,
          precision: 89.7,
          recall: 94.1,
          f1Score: 91.8,
          lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          lastDeployed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            size: 200000,
            sources: ['Transaction Data', 'Market Data', 'Competitor Pricing'],
            lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            quality: 'excellent'
          },
          performance: {
            latency: 25,
            throughput: 2000,
            resourceUsage: 45,
            errorRate: 0.3
          },
          bias: {
            overall: 8,
            demographic: {
              gender: 5,
              age: 12,
              ethnicity: 8,
              location: 10
            },
            fairness: {
              equalizedOdds: 0.92,
              demographicParity: 0.88,
              equalOpportunity: 0.90
            },
            lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          compliance: {
            gdpr: true,
            ccpa: true,
            sox: true,
            hipaa: false,
            iso27001: true,
            lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            auditScore: 95
          },
          governance: {
            approvalStatus: 'approved',
            approver: 'Dr. Michael Rodriguez',
            approvalDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'low',
            documentation: ['Model Documentation', 'Bias Assessment', 'Performance Report', 'Compliance Report'],
            monitoring: true,
            alerts: true
          },
          impact: {
            businessValue: 500000,
            usersAffected: 100000,
            revenueImpact: 350000,
            riskScore: 20
          }
        },
        {
          id: 'model-003',
          name: 'Fraud Detection System',
          type: 'classification',
          purpose: 'Detect fraudulent transactions in real-time',
          version: 'v3.0.1',
          status: 'testing',
          accuracy: 94.8,
          precision: 96.2,
          recall: 93.5,
          f1Score: 94.8,
          lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastDeployed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          trainingData: {
            size: 500000,
            sources: ['Transaction Data', 'User Behavior', 'Device Fingerprints'],
            lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            quality: 'excellent'
          },
          performance: {
            latency: 15,
            throughput: 5000,
            resourceUsage: 80,
            errorRate: 0.1
          },
          bias: {
            overall: 25,
            demographic: {
              gender: 20,
              age: 30,
              ethnicity: 35,
              location: 15
            },
            fairness: {
              equalizedOdds: 0.75,
              demographicParity: 0.70,
              equalOpportunity: 0.78
            },
            lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          compliance: {
            gdpr: true,
            ccpa: true,
            sox: true,
            hipaa: false,
            iso27001: true,
            lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            auditScore: 88
          },
          governance: {
            approvalStatus: 'under_review',
            approver: 'Dr. Lisa Wang',
            riskLevel: 'high',
            documentation: ['Model Documentation', 'Bias Assessment', 'Performance Report'],
            monitoring: true,
            alerts: true
          },
          impact: {
            businessValue: 750000,
            usersAffected: 200000,
            revenueImpact: 500000,
            riskScore: 65
          }
        }
      ];

      const mockBiasAlerts: BiasAlert[] = [
        {
          id: 'alert-001',
          modelId: 'model-003',
          type: 'demographic_bias',
          severity: 'high',
          status: 'investigating',
          description: 'Significant bias detected in ethnicity-based predictions',
          detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metrics: [
            {
              metric: 'Ethnicity Bias Score',
              value: 35,
              threshold: 20,
              impact: 'high'
            },
            {
              metric: 'Demographic Parity',
              value: 0.70,
              threshold: 0.80,
              impact: 'high'
            }
          ],
          actions: [
            {
              id: 'action-001',
              type: 'investigate',
              description: 'Investigate training data for ethnic bias',
              status: 'in_progress',
              assignedTo: 'Dr. Lisa Wang',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'action-002',
              type: 'retrain',
              description: 'Retrain model with bias mitigation techniques',
              status: 'pending',
              assignedTo: 'Data Science Team',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'alert-002',
          modelId: 'model-001',
          type: 'accuracy_drop',
          severity: 'medium',
          status: 'active',
          description: 'Model accuracy has decreased by 3% over the last week',
          detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          metrics: [
            {
              metric: 'Accuracy',
              value: 84.5,
              threshold: 85.0,
              impact: 'medium'
            },
            {
              metric: 'F1 Score',
              value: 84.8,
              threshold: 85.0,
              impact: 'medium'
            }
          ],
          actions: [
            {
              id: 'action-003',
              type: 'investigate',
              description: 'Analyze recent data drift and model performance',
              status: 'pending',
              assignedTo: 'Dr. Sarah Chen',
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ];

      setModels(mockModels);
      setBiasAlerts(mockBiasAlerts);
      setSelectedModel(mockModels[0]);
    };

    loadModelGovernanceData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setModels(prev => prev.map(model => ({
        ...model,
        bias: {
          ...model.bias,
          overall: Math.max(0, Math.min(100, model.bias.overall + (Math.random() - 0.5) * 2))
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'production': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-orange-100 text-orange-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'regression': return <TrendingUp className="h-4 w-4" />;
      case 'clustering': return <Users className="h-4 w-4" />;
      case 'nlp': return <MessageSquare className="h-4 w-4" />;
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      case 'recommendation': return <Star className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getBiasColor = (bias: number) => {
    if (bias <= 10) return 'text-green-600';
    if (bias <= 20) return 'text-yellow-600';
    if (bias <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredModels = models.filter(model => {
    const typeMatch = filterType === 'all' || model.type === filterType;
    const statusMatch = filterStatus === 'all' || model.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const productionModels = models.filter(model => model.status === 'production').length;
  const highBiasModels = models.filter(model => model.bias.overall > 20).length;
  const pendingApprovals = models.filter(model => model.governance.approvalStatus === 'pending' || model.governance.approvalStatus === 'under_review').length;
  const activeAlerts = biasAlerts.filter(alert => alert.status === 'active' || alert.status === 'investigating').length;
  const avgBiasScore = models.length > 0 
    ? Math.round(models.reduce((sum, model) => sum + model.bias.overall, 0) / models.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Model Governance Panel
              </CardTitle>
              <CardDescription>
                Bias/fairness tracking and AI model governance
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
          {/* Model Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{productionModels}</div>
              <div className="text-sm text-muted-foreground">Production Models</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{highBiasModels}</div>
              <div className="text-sm text-muted-foreground">High Bias Models</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingApprovals}</div>
              <div className="text-sm text-muted-foreground">Pending Approvals</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </div>

          {/* Bias Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Average Bias Score</h4>
                <p className="text-sm text-muted-foreground">
                  Overall bias assessment across all AI models (lower is better)
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getBiasColor(avgBiasScore)}`}>
                  {avgBiasScore}
                </div>
                <div className="text-sm text-muted-foreground">bias score</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgBiasScore} className="h-2" />
            </div>
          </div>

          {/* Bias Alerts */}
          <div>
            <h4 className="font-medium mb-3">Bias & Fairness Alerts</h4>
            <div className="space-y-2">
              {biasAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.description}</span>
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAlertStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {models.find(m => m.id === alert.modelId)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Detected: {new Date(alert.detectedAt).toLocaleString()} • 
                    Actions: {alert.actions.length} • 
                    Last Updated: {new Date(alert.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Models */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">AI Models</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'classification', 'regression', 'clustering', 'nlp', 'computer_vision', 'recommendation'].map((type) => (
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
                {['all', 'development', 'testing', 'production', 'deprecated', 'retired'].map((status) => (
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
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel?.id === model.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(model.type)}
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.purpose} • v{model.version}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      <Badge className={getRiskColor(model.governance.riskLevel)}>
                        {model.governance.riskLevel} risk
                      </Badge>
                      <div className={`text-sm font-medium ${getBiasColor(model.bias.overall)}`}>
                        {model.bias.overall}% bias
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Accuracy: {model.accuracy}%</span>
                    <span>Bias Score: {model.bias.overall}%</span>
                    <span>Compliance: {model.compliance.auditScore}%</span>
                    <span>Last Trained: {new Date(model.lastTrained).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Model Details */}
          {selectedModel && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Model Details - {selectedModel.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="governance">Governance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Model Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedModel.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purpose:</span>
                          <span className="font-medium">{selectedModel.purpose}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{selectedModel.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedModel.status)}>
                            {selectedModel.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <Badge className={getRiskColor(selectedModel.governance.riskLevel)}>
                            {selectedModel.governance.riskLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Trained:</span>
                          <span className="font-medium">{new Date(selectedModel.lastTrained).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Model Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">{selectedModel.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precision:</span>
                          <span className="font-medium">{selectedModel.precision}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recall:</span>
                          <span className="font-medium">{selectedModel.recall}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>F1 Score:</span>
                          <span className="font-medium">{selectedModel.f1Score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bias Score:</span>
                          <span className={`font-medium ${getBiasColor(selectedModel.bias.overall)}`}>
                            {selectedModel.bias.overall}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Training Data</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">{formatNumber(selectedModel.trainingData.size)} records</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span className={`font-medium ${getDataQualityColor(selectedModel.trainingData.quality)}`}>
                            {selectedModel.trainingData.quality}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="font-medium">{new Date(selectedModel.trainingData.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Sources:</span>
                        <div className="mt-1 space-y-1">
                          {selectedModel.trainingData.sources.map((source, index) => (
                            <div key={index} className="text-muted-foreground">• {source}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bias" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Bias Assessment</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Overall Bias Score:</span>
                        <span className={`font-medium ${getBiasColor(selectedModel.bias.overall)}`}>
                          {selectedModel.bias.overall}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Assessment:</span>
                        <span className="font-medium">{new Date(selectedModel.bias.lastAssessment).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Demographic Bias</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Gender:</span>
                          <span className={`font-medium ${getBiasColor(selectedModel.bias.demographic.gender)}`}>
                            {selectedModel.bias.demographic.gender}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Age:</span>
                          <span className={`font-medium ${getBiasColor(selectedModel.bias.demographic.age)}`}>
                            {selectedModel.bias.demographic.age}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Ethnicity:</span>
                          <span className={`font-medium ${getBiasColor(selectedModel.bias.demographic.ethnicity)}`}>
                            {selectedModel.bias.demographic.ethnicity}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className={`font-medium ${getBiasColor(selectedModel.bias.demographic.location)}`}>
                            {selectedModel.bias.demographic.location}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Fairness Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Equalized Odds:</span>
                        <span className="font-medium">{selectedModel.bias.fairness.equalizedOdds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Demographic Parity:</span>
                        <span className="font-medium">{selectedModel.bias.fairness.demographicParity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equal Opportunity:</span>
                        <span className="font-medium">{selectedModel.bias.fairness.equalOpportunity}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Performance Metrics</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Latency:</span>
                          <span className="font-medium">{selectedModel.performance.latency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="font-medium">{formatNumber(selectedModel.performance.throughput)} req/s</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Resource Usage:</span>
                          <span className="font-medium">{selectedModel.performance.resourceUsage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Error Rate:</span>
                          <span className="font-medium">{selectedModel.performance.errorRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Compliance Status</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>GDPR:</span>
                        <Badge className={selectedModel.compliance.gdpr ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.compliance.gdpr ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>CCPA:</span>
                        <Badge className={selectedModel.compliance.ccpa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.compliance.ccpa ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>SOX:</span>
                        <Badge className={selectedModel.compliance.sox ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.compliance.sox ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>HIPAA:</span>
                        <Badge className={selectedModel.compliance.hipaa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.compliance.hipaa ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>ISO 27001:</span>
                        <Badge className={selectedModel.compliance.iso27001 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.compliance.iso27001 ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Score:</span>
                        <span className="font-medium">{selectedModel.compliance.auditScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Audit:</span>
                        <span className="font-medium">{new Date(selectedModel.compliance.lastAudit).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="governance" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Governance Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Approval Status:</span>
                        <Badge className={getApprovalStatusColor(selectedModel.governance.approvalStatus)}>
                          {selectedModel.governance.approvalStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Approver:</span>
                        <span className="font-medium">{selectedModel.governance.approver}</span>
                      </div>
                      {selectedModel.governance.approvalDate && (
                        <div className="flex justify-between">
                          <span>Approval Date:</span>
                          <span className="font-medium">{new Date(selectedModel.governance.approvalDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Monitoring:</span>
                        <Badge className={selectedModel.governance.monitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.governance.monitoring ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Alerts:</span>
                        <Badge className={selectedModel.governance.alerts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedModel.governance.alerts ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Documentation</h5>
                    <div className="space-y-1">
                      {selectedModel.governance.documentation.map((doc, index) => (
                        <div key={index} className="p-2 border rounded-lg text-sm">
                          • {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Model
                </Button>
                <Button size="sm" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Flag for Review
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Monitoring
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
