"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
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
  LineChart as LineChartIcon
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ModelImpact {
  id: string;
  modelName: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision' | 'recommendation';
  businessArea: 'revenue' | 'cost_reduction' | 'customer_experience' | 'operational_efficiency' | 'risk_mitigation' | 'compliance';
  impactType: 'direct' | 'indirect' | 'cascading' | 'compound';
  value: {
    revenue: number;
    costSavings: number;
    efficiency: number;
    riskReduction: number;
    customerSatisfaction: number;
    total: number;
  };
  metrics: {
    metric: string;
    before: number;
    after: number;
    improvement: number;
    unit: string;
    confidence: number;
  }[];
  attribution: {
    direct: number;
    indirect: number;
    confidence: number;
    methodology: string;
    lastCalculated: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
    milestones: {
      date: string;
      event: string;
      impact: number;
    }[];
  };
  stakeholders: {
    department: string;
    role: string;
    impact: number;
    feedback: string;
  }[];
  roi: {
    investment: number;
    returns: number;
    paybackPeriod: number;
    netPresentValue: number;
    internalRateOfReturn: number;
  };
}

interface BusinessValueAttributionProps {
  className?: string;
}

export default function BusinessValueAttribution({ className }: BusinessValueAttributionProps) {
  const [modelImpacts, setModelImpacts] = useState<ModelImpact[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<ModelImpact | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterBusinessArea, setFilterBusinessArea] = useState<string>('all');
  const [filterImpactType, setFilterImpactType] = useState<string>('all');

  useEffect(() => {
    const loadBusinessValueData = () => {
      const mockModelImpacts: ModelImpact[] = [
        {
          id: 'impact-001',
          modelName: 'Customer Churn Predictor',
          modelType: 'classification',
          businessArea: 'revenue',
          impactType: 'direct',
          value: {
            revenue: 450000,
            costSavings: 125000,
            efficiency: 85000,
            riskReduction: 50000,
            customerSatisfaction: 75000,
            total: 785000
          },
          metrics: [
            {
              metric: 'Customer Retention Rate',
              before: 78.5,
              after: 85.2,
              improvement: 8.5,
              unit: '%',
              confidence: 92
            },
            {
              metric: 'Revenue per Customer',
              before: 1250,
              after: 1380,
              improvement: 10.4,
              unit: '$',
              confidence: 88
            },
            {
              metric: 'Customer Lifetime Value',
              before: 8500,
              after: 9200,
              improvement: 8.2,
              unit: '$',
              confidence: 85
            },
            {
              metric: 'Churn Rate',
              before: 12.5,
              after: 8.8,
              improvement: -29.6,
              unit: '%',
              confidence: 90
            }
          ],
          attribution: {
            direct: 75,
            indirect: 25,
            confidence: 88,
            methodology: 'Causal Impact Analysis with A/B Testing',
            lastCalculated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          timeline: {
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 83,
            milestones: [
              {
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Model Deployment',
                impact: 150000
              },
              {
                date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'First Retention Campaign',
                impact: 280000
              },
              {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Full Rollout',
                impact: 450000
              },
              {
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Optimization Complete',
                impact: 785000
              }
            ]
          },
          stakeholders: [
            {
              department: 'Customer Success',
              role: 'VP Customer Success',
              impact: 35,
              feedback: 'Significant improvement in retention rates and customer satisfaction'
            },
            {
              department: 'Sales',
              role: 'Sales Director',
              impact: 25,
              feedback: 'Better lead qualification and reduced churn in enterprise accounts'
            },
            {
              department: 'Marketing',
              role: 'Marketing Manager',
              impact: 20,
              feedback: 'More targeted campaigns and improved customer segmentation'
            },
            {
              department: 'Finance',
              role: 'CFO',
              impact: 20,
              feedback: 'Clear ROI and positive impact on revenue growth'
            }
          ],
          roi: {
            investment: 150000,
            returns: 785000,
            paybackPeriod: 2.3,
            netPresentValue: 635000,
            internalRateOfReturn: 45.2
          }
        },
        {
          id: 'impact-002',
          modelName: 'Dynamic Pricing Engine',
          modelType: 'regression',
          businessArea: 'revenue',
          impactType: 'direct',
          value: {
            revenue: 320000,
            costSavings: 45000,
            efficiency: 30000,
            riskReduction: 25000,
            customerSatisfaction: 40000,
            total: 460000
          },
          metrics: [
            {
              metric: 'Average Revenue per User',
              before: 95,
              after: 108,
              improvement: 13.7,
              unit: '$',
              confidence: 94
            },
            {
              metric: 'Price Optimization Score',
              before: 72,
              after: 89,
              improvement: 23.6,
              unit: '%',
              confidence: 91
            },
            {
              metric: 'Market Share',
              before: 15.2,
              after: 17.8,
              improvement: 17.1,
              unit: '%',
              confidence: 87
            },
            {
              metric: 'Customer Acquisition Cost',
              before: 85,
              after: 72,
              improvement: -15.3,
              unit: '$',
              confidence: 89
            }
          ],
          attribution: {
            direct: 80,
            indirect: 20,
            confidence: 91,
            methodology: 'Regression Analysis with Market Data',
            lastCalculated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          timeline: {
            startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 106,
            milestones: [
              {
                date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Pilot Launch',
                impact: 80000
              },
              {
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Market Expansion',
                impact: 180000
              },
              {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Full Deployment',
                impact: 320000
              },
              {
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Optimization Complete',
                impact: 460000
              }
            ]
          },
          stakeholders: [
            {
              department: 'Product',
              role: 'Product Manager',
              impact: 30,
              feedback: 'Improved pricing strategy and better market positioning'
            },
            {
              department: 'Sales',
              role: 'Sales Director',
              impact: 25,
              feedback: 'Higher conversion rates and increased deal sizes'
            },
            {
              department: 'Finance',
              role: 'CFO',
              impact: 25,
              feedback: 'Strong revenue growth and improved margins'
            },
            {
              department: 'Marketing',
              role: 'Marketing Director',
              impact: 20,
              feedback: 'Better competitive positioning and market share growth'
            }
          ],
          roi: {
            investment: 200000,
            returns: 460000,
            paybackPeriod: 3.2,
            netPresentValue: 260000,
            internalRateOfReturn: 28.5
          }
        },
        {
          id: 'impact-003',
          modelName: 'Fraud Detection System',
          modelType: 'classification',
          businessArea: 'risk_mitigation',
          impactType: 'direct',
          value: {
            revenue: 0,
            costSavings: 180000,
            efficiency: 25000,
            riskReduction: 220000,
            customerSatisfaction: 35000,
            total: 460000
          },
          metrics: [
            {
              metric: 'Fraud Detection Rate',
              before: 78.5,
              after: 94.2,
              improvement: 20.0,
              unit: '%',
              confidence: 96
            },
            {
              metric: 'False Positive Rate',
              before: 8.2,
              after: 3.1,
              improvement: -62.2,
              unit: '%',
              confidence: 93
            },
            {
              metric: 'Fraud Losses',
              before: 45000,
              after: 12000,
              improvement: -73.3,
              unit: '$/month',
              confidence: 95
            },
            {
              metric: 'Processing Time',
              before: 2.5,
              after: 0.8,
              improvement: -68.0,
              unit: 'seconds',
              confidence: 89
            }
          ],
          attribution: {
            direct: 85,
            indirect: 15,
            confidence: 94,
            methodology: 'Before/After Analysis with Control Groups',
            lastCalculated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
          },
          timeline: {
            startDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 129,
            milestones: [
              {
                date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'System Deployment',
                impact: 80000
              },
              {
                date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Model Optimization',
                impact: 150000
              },
              {
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Full Integration',
                impact: 280000
              },
              {
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                event: 'Performance Optimization',
                impact: 460000
              }
            ]
          },
          stakeholders: [
            {
              department: 'Security',
              role: 'CISO',
              impact: 35,
              feedback: 'Significant reduction in fraud losses and improved security posture'
            },
            {
              department: 'Operations',
              role: 'Operations Director',
              impact: 25,
              feedback: 'Faster processing times and reduced manual review workload'
            },
            {
              department: 'Customer Service',
              role: 'Customer Service Manager',
              impact: 20,
              feedback: 'Fewer customer complaints and improved trust'
            },
            {
              department: 'Finance',
              role: 'CFO',
              impact: 20,
              feedback: 'Direct cost savings and reduced financial risk'
            }
          ],
          roi: {
            investment: 180000,
            returns: 460000,
            paybackPeriod: 2.8,
            netPresentValue: 280000,
            internalRateOfReturn: 35.8
          }
        }
      ];

      setModelImpacts(mockModelImpacts);
      setSelectedImpact(mockModelImpacts[0]);
    };

    loadBusinessValueData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setModelImpacts(prev => prev.map(impact => ({
        ...impact,
        value: {
          ...impact.value,
          total: impact.value.total + (Math.random() - 0.5) * 1000
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getBusinessAreaColor = (area: string) => {
    switch (area) {
      case 'revenue': return 'bg-success/10 text-success';
      case 'cost_reduction': return 'bg-primary/10 text-primary';
      case 'customer_experience': return 'bg-primary/10 text-primary';
      case 'operational_efficiency': return 'bg-warning/10 text-warning';
      case 'risk_mitigation': return 'bg-destructive/10 text-destructive';
      case 'compliance': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getImpactTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-success/10 text-success';
      case 'indirect': return 'bg-primary/10 text-primary';
      case 'cascading': return 'bg-warning/10 text-warning';
      case 'compound': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getModelTypeIcon = (type: string) => {
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

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-success';
    if (improvement < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const filteredImpacts = modelImpacts.filter(impact => {
    const areaMatch = filterBusinessArea === 'all' || impact.businessArea === filterBusinessArea;
    const typeMatch = filterImpactType === 'all' || impact.impactType === filterImpactType;
    return areaMatch && typeMatch;
  });

  const totalValue = modelImpacts.reduce((sum, impact) => sum + impact.value.total, 0);
  const totalInvestment = modelImpacts.reduce((sum, impact) => sum + impact.roi.investment, 0);
  const totalReturns = modelImpacts.reduce((sum, impact) => sum + impact.roi.returns, 0);
  const avgROI = totalInvestment > 0 ? Math.round(((totalReturns - totalInvestment) / totalInvestment) * 100) : 0;
  const avgConfidence = modelImpacts.length > 0 
    ? Math.round(modelImpacts.reduce((sum, impact) => sum + impact.attribution.confidence, 0) / modelImpacts.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Business Value Attribution
              </CardTitle>
              <CardDescription>
                Model impact tracking and ROI measurement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTracking(!isTracking)}
                className={isTracking ? 'bg-success/10 text-success' : ''}
              >
                {isTracking ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {isTracking ? 'Tracking' : 'Paused'}
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
          {/* Value Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Value Created</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalInvestment)}</div>
              <div className="text-sm text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgROI}%</div>
              <div className="text-sm text-muted-foreground">Average ROI</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>

          {/* Value Attribution Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Business Value Attribution</h4>
                <p className="text-sm text-muted-foreground">
                  Total value created across all AI models with confidence scoring
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-success">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-sm text-muted-foreground">total value</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={Math.min(100, (totalValue / 2000000) * 100)} className="h-2" />
            </div>
          </div>

          {/* Model Impacts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Model Impact Analysis</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Business Area:</span>
                {['all', 'revenue', 'cost_reduction', 'customer_experience', 'operational_efficiency', 'risk_mitigation', 'compliance'].map((area) => (
                  <Button
                    key={area}
                    variant={filterBusinessArea === area ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBusinessArea(area)}
                  >
                    {area.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Impact Type:</span>
                {['all', 'direct', 'indirect', 'cascading', 'compound'].map((type) => (
                  <Button
                    key={type}
                    variant={filterImpactType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterImpactType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredImpacts.map((impact) => (
                <div
                  key={impact.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedImpact?.id === impact.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedImpact(impact)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getModelTypeIcon(impact.modelType)}
                      <div>
                        <div className="font-medium">{impact.modelName}</div>
                        <div className="text-sm text-muted-foreground">{impact.modelType} • {impact.businessArea.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getBusinessAreaColor(impact.businessArea)}>
                        {impact.businessArea.replace('_', ' ')}
                      </Badge>
                      <Badge className={getImpactTypeColor(impact.impactType)}>
                        {impact.impactType}
                      </Badge>
                      <div className="text-sm font-medium">
                        {formatCurrency(impact.value.total)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>ROI: {Math.round(((impact.roi.returns - impact.roi.investment) / impact.roi.investment) * 100)}%</span>
                    <span>Confidence: {impact.attribution.confidence}%</span>
                    <span>Payback: {impact.roi.paybackPeriod} months</span>
                    <span>Duration: {impact.timeline.duration} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Impact Details */}
          {selectedImpact && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Impact Details - {selectedImpact.modelName}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="attribution">Attribution</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Model Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Model Name:</span>
                          <span className="font-medium">{selectedImpact.modelName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{selectedImpact.modelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Area:</span>
                          <Badge className={getBusinessAreaColor(selectedImpact.businessArea)}>
                            {selectedImpact.businessArea.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Impact Type:</span>
                          <Badge className={getImpactTypeColor(selectedImpact.impactType)}>
                            {selectedImpact.impactType}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium text-success">{formatCurrency(selectedImpact.value.total)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Value Breakdown</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatCurrency(selectedImpact.value.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Savings:</span>
                          <span className="font-medium">{formatCurrency(selectedImpact.value.costSavings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span className="font-medium">{formatCurrency(selectedImpact.value.efficiency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Reduction:</span>
                          <span className="font-medium">{formatCurrency(selectedImpact.value.riskReduction)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Satisfaction:</span>
                          <span className="font-medium">{formatCurrency(selectedImpact.value.customerSatisfaction)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Stakeholder Impact</h5>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedImpact.stakeholders.map((stakeholder, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{stakeholder.department}</span>
                            <span className="text-sm font-medium">{stakeholder.impact}% impact</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {stakeholder.role}
                          </div>
                          <p className="text-sm text-muted-foreground">{stakeholder.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Performance Metrics</h5>
                    <div className="space-y-2">
                      {selectedImpact.metrics.map((metric) => (
                        <div key={metric.metric} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{metric.metric}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${getConfidenceColor(metric.confidence)}`}>
                                {metric.confidence}% confidence
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Before: {metric.before}{metric.unit}</span>
                            <span>After: {metric.after}{metric.unit}</span>
                            <span className={`font-medium ${getImprovementColor(metric.improvement)}`}>
                              {metric.improvement > 0 ? '+' : ''}{metric.improvement.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attribution" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Attribution Analysis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Direct Impact:</span>
                        <span className="font-medium">{selectedImpact.attribution.direct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indirect Impact:</span>
                        <span className="font-medium">{selectedImpact.attribution.indirect}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className={`font-medium ${getConfidenceColor(selectedImpact.attribution.confidence)}`}>
                          {selectedImpact.attribution.confidence}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Methodology:</span>
                        <span className="font-medium">{selectedImpact.attribution.methodology}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Calculated:</span>
                        <span className="font-medium">{new Date(selectedImpact.attribution.lastCalculated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Impact Timeline</h5>
                    <div className="space-y-2">
                      {selectedImpact.timeline.milestones.map((milestone, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{milestone.event}</span>
                            <span className="text-sm font-medium text-success">
                              {formatCurrency(milestone.impact)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(milestone.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="roi" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">ROI Analysis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Investment:</span>
                        <span className="font-medium">{formatCurrency(selectedImpact.roi.investment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Returns:</span>
                        <span className="font-medium text-success">{formatCurrency(selectedImpact.roi.returns)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Present Value:</span>
                        <span className="font-medium text-success">{formatCurrency(selectedImpact.roi.netPresentValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <span className="font-medium">{selectedImpact.roi.paybackPeriod} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Internal Rate of Return:</span>
                        <span className="font-medium text-success">{selectedImpact.roi.internalRateOfReturn}%</span>
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
                  Configure Tracking
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


