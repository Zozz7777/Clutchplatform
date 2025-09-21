"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Activity,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface RootCauseAnalysis {
  id: string;
  title: string;
  description: string;
  type: 'churn' | 'downtime' | 'performance' | 'cost' | 'security' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'analyzing' | 'identified' | 'resolved' | 'monitoring';
  detectedAt: string;
  resolvedAt?: string;
  impact: {
    financial: number;
    customers: number;
    reputation: number;
    operational: number;
  };
  rootCauses: {
    primary: {
      factor: string;
      confidence: number;
      evidence: string[];
      impact: number;
    };
    secondary: {
      factor: string;
      confidence: number;
      evidence: string[];
      impact: number;
    }[];
    contributing: {
      factor: string;
      confidence: number;
      evidence: string[];
      impact: number;
    }[];
  };
  timeline: {
    id: string;
    timestamp: string;
    event: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    evidence: string[];
  }[];
  correlations: {
    metric: string;
    correlation: number;
    significance: 'high' | 'medium' | 'low';
    direction: 'positive' | 'negative';
  }[];
  recommendations: {
    immediate: {
      action: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      effort: 'low' | 'medium' | 'high';
      impact: 'high' | 'medium' | 'low';
      cost: number;
    }[];
    longTerm: {
      action: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      effort: 'low' | 'medium' | 'high';
      impact: 'high' | 'medium' | 'low';
      cost: number;
    }[];
  };
  metrics: {
    before: number;
    during: number;
    after: number;
    recovery: number;
  };
  stakeholders: {
    id: string;
    name: string;
    role: string;
    impact: 'high' | 'medium' | 'low';
    notified: boolean;
  }[];
}

interface ChurnAnalysis {
  id: string;
  customerSegment: string;
  churnRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  primaryFactors: string[];
  timeToChurn: number;
  revenueImpact: number;
  lastAnalysis: string;
}

interface DowntimeAnalysis {
  id: string;
  service: string;
  duration: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  primaryFactors: string[];
  costImpact: number;
  lastAnalysis: string;
}

interface RootCauseAnalyticsProps {
  className?: string;
}

export default function RootCauseAnalytics({ className }: RootCauseAnalyticsProps) {
  const [analyses, setAnalyses] = useState<RootCauseAnalysis[]>([]);
  const [churnAnalyses, setChurnAnalyses] = useState<ChurnAnalysis[]>([]);
  const [downtimeAnalyses, setDowntimeAnalyses] = useState<DowntimeAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadAnalyticsData = () => {
      const mockAnalyses: RootCauseAnalysis[] = [
        {
          id: 'analysis-001',
          title: 'Customer Churn Spike Analysis',
          description: 'Investigation into sudden increase in customer churn rate',
          type: 'churn',
          severity: 'critical',
          status: 'identified',
          detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          impact: {
            financial: 125000,
            customers: 45,
            reputation: 75,
            operational: 60
          },
          rootCauses: {
            primary: {
              factor: 'Pricing increase without communication',
              confidence: 92,
              evidence: ['Customer feedback', 'Support tickets', 'Usage patterns'],
              impact: 85
            },
            secondary: [
              {
                factor: 'Competitor price reduction',
                confidence: 78,
                evidence: ['Market analysis', 'Customer surveys'],
                impact: 65
              },
              {
                factor: 'Service quality degradation',
                confidence: 68,
                evidence: ['Support metrics', 'Performance data'],
                impact: 55
              }
            ],
            contributing: [
              {
                factor: 'Lack of customer communication',
                confidence: 82,
                evidence: ['Email open rates', 'Engagement metrics'],
                impact: 45
              },
              {
                factor: 'Feature limitations',
                confidence: 58,
                evidence: ['Feature requests', 'Usage analytics'],
                impact: 35
              }
            ]
          },
          timeline: [
            {
              id: 'timeline-001',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Pricing Change Announced',
              description: 'New pricing structure implemented without prior customer communication',
              impact: 'negative',
              evidence: ['Pricing announcement', 'Customer feedback']
            },
            {
              id: 'timeline-002',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Support Ticket Increase',
              description: '300% increase in pricing-related support tickets',
              impact: 'negative',
              evidence: ['Support metrics', 'Ticket analysis']
            },
            {
              id: 'timeline-003',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Churn Rate Spike',
              description: 'Customer churn rate increased from 2% to 8%',
              impact: 'negative',
              evidence: ['Churn analytics', 'Revenue data']
            },
            {
              id: 'timeline-004',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Communication Campaign',
              description: 'Emergency customer communication campaign launched',
              impact: 'positive',
              evidence: ['Email campaigns', 'Response rates']
            },
            {
              id: 'timeline-005',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Churn Rate Stabilized',
              description: 'Churn rate returned to baseline levels',
              impact: 'positive',
              evidence: ['Churn analytics', 'Customer retention']
            }
          ],
          correlations: [
            {
              metric: 'Support Ticket Volume',
              correlation: 0.89,
              significance: 'high',
              direction: 'positive'
            },
            {
              metric: 'Customer Satisfaction',
              correlation: -0.76,
              significance: 'high',
              direction: 'negative'
            },
            {
              metric: 'Feature Usage',
              correlation: -0.45,
              significance: 'medium',
              direction: 'negative'
            }
          ],
          recommendations: {
            immediate: [
              {
                action: 'Implement customer communication protocol',
                priority: 'critical',
                effort: 'low',
                impact: 'high',
                cost: 5000
              },
              {
                action: 'Review pricing strategy',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                cost: 15000
              }
            ],
            longTerm: [
              {
                action: 'Develop customer feedback system',
                priority: 'high',
                effort: 'high',
                impact: 'high',
                cost: 50000
              },
              {
                action: 'Implement competitive analysis',
                priority: 'medium',
                effort: 'medium',
                impact: 'medium',
                cost: 25000
              }
            ]
          },
          metrics: {
            before: 2.1,
            during: 8.3,
            after: 2.4,
            recovery: 95
          },
          stakeholders: [
            {
              id: 'stakeholder-001',
              name: 'Sarah Chen',
              role: 'Customer Success Manager',
              impact: 'high',
              notified: true
            },
            {
              id: 'stakeholder-002',
              name: 'Mike Rodriguez',
              role: 'Product Manager',
              impact: 'high',
              notified: true
            }
          ]
        },
        {
          id: 'analysis-002',
          title: 'API Downtime Root Cause',
          description: 'Analysis of recurring API service interruptions',
          type: 'downtime',
          severity: 'high',
          status: 'resolved',
          detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          impact: {
            financial: 75000,
            customers: 1200,
            reputation: 85,
            operational: 90
          },
          rootCauses: {
            primary: {
              factor: 'Database connection pool exhaustion',
              confidence: 95,
              evidence: ['System logs', 'Performance metrics', 'Error patterns'],
              impact: 90
            },
            secondary: [
              {
                factor: 'Insufficient monitoring',
                confidence: 82,
                evidence: ['Alert logs', 'Response times'],
                impact: 70
              }
            ],
            contributing: [
              {
                factor: 'High traffic volume',
                confidence: 75,
                evidence: ['Traffic analytics', 'Usage patterns'],
                impact: 60
              },
              {
                factor: 'Resource allocation',
                confidence: 68,
                evidence: ['Resource metrics', 'Capacity planning'],
                impact: 50
              }
            ]
          },
          timeline: [
            {
              id: 'timeline-006',
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Traffic Spike',
              description: 'Unusual traffic increase detected',
              impact: 'negative',
              evidence: ['Traffic analytics', 'Load metrics']
            },
            {
              id: 'timeline-007',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Connection Pool Exhaustion',
              description: 'Database connection pool reached maximum capacity',
              impact: 'negative',
              evidence: ['Database logs', 'Connection metrics']
            },
            {
              id: 'timeline-008',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Service Degradation',
              description: 'API response times increased significantly',
              impact: 'negative',
              evidence: ['Performance metrics', 'Error rates']
            },
            {
              id: 'timeline-009',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Infrastructure Scaling',
              description: 'Database connection pool increased and load balancing implemented',
              impact: 'positive',
              evidence: ['Infrastructure changes', 'Performance improvement']
            },
            {
              id: 'timeline-010',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              event: 'Service Recovery',
              description: 'API service fully restored to normal performance',
              impact: 'positive',
              evidence: ['Performance metrics', 'Error rate reduction']
            }
          ],
          correlations: [
            {
              metric: 'Database Connections',
              correlation: 0.94,
              significance: 'high',
              direction: 'positive'
            },
            {
              metric: 'Response Time',
              correlation: 0.87,
              significance: 'high',
              direction: 'positive'
            },
            {
              metric: 'Error Rate',
              correlation: 0.92,
              significance: 'high',
              direction: 'positive'
            }
          ],
          recommendations: {
            immediate: [
              {
                action: 'Increase database connection pool',
                priority: 'critical',
                effort: 'low',
                impact: 'high',
                cost: 10000
              },
              {
                action: 'Implement connection monitoring',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                cost: 15000
              }
            ],
            longTerm: [
              {
                action: 'Implement auto-scaling',
                priority: 'high',
                effort: 'high',
                impact: 'high',
                cost: 75000
              },
              {
                action: 'Database optimization',
                priority: 'medium',
                effort: 'high',
                impact: 'medium',
                cost: 50000
              }
            ]
          },
          metrics: {
            before: 99.9,
            during: 85.2,
            after: 99.8,
            recovery: 98
          },
          stakeholders: [
            {
              id: 'stakeholder-003',
              name: 'Alex Kim',
              role: 'DevOps Engineer',
              impact: 'high',
              notified: true
            },
            {
              id: 'stakeholder-004',
              name: 'Emily Rodriguez',
              role: 'Backend Developer',
              impact: 'high',
              notified: true
            }
          ]
        }
      ];

      const mockChurnAnalyses: ChurnAnalysis[] = [
        {
          id: 'churn-001',
          customerSegment: 'Enterprise',
          churnRate: 3.2,
          trend: 'increasing',
          primaryFactors: ['Pricing', 'Feature limitations', 'Support quality'],
          timeToChurn: 45,
          revenueImpact: 250000,
          lastAnalysis: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'churn-002',
          customerSegment: 'SMB',
          churnRate: 8.5,
          trend: 'stable',
          primaryFactors: ['Competition', 'Pricing', 'Onboarding'],
          timeToChurn: 30,
          revenueImpact: 125000,
          lastAnalysis: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockDowntimeAnalyses: DowntimeAnalysis[] = [
        {
          id: 'downtime-001',
          service: 'API Gateway',
          duration: 2.5,
          frequency: 3,
          trend: 'decreasing',
          primaryFactors: ['Database issues', 'Load balancing', 'Monitoring gaps'],
          costImpact: 50000,
          lastAnalysis: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'downtime-002',
          service: 'Payment Processing',
          duration: 1.2,
          frequency: 1,
          trend: 'stable',
          primaryFactors: ['Third-party integration', 'Network issues'],
          costImpact: 25000,
          lastAnalysis: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setAnalyses(mockAnalyses);
      setChurnAnalyses(mockChurnAnalyses);
      setDowntimeAnalyses(mockDowntimeAnalyses);
      setSelectedAnalysis(mockAnalyses[0]);
    };

    loadAnalyticsData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-primary/10 text-blue-800';
      case 'identified': return 'bg-warning/10 text-yellow-800';
      case 'resolved': return 'bg-success/10 text-green-800';
      case 'monitoring': return 'bg-primary/10 text-purple-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'churn': return <Users className="h-4 w-4" />;
      case 'downtime': return <Clock className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      case 'cost': return <TrendingUp className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-success" />;
      case 'stable': return <Activity className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/10 text-red-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleAnalysisStatusUpdate = (analysisId: string, newStatus: string) => {
    setAnalyses(prev => prev.map(analysis =>
      analysis.id === analysisId ? { ...analysis, status: newStatus as string } : analysis
    ));
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const typeMatch = filterType === 'all' || analysis.type === filterType;
    const statusMatch = filterStatus === 'all' || analysis.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const criticalAnalyses = analyses.filter(analysis => analysis.severity === 'critical').length;
  const activeAnalyses = analyses.filter(analysis => analysis.status !== 'resolved').length;
  const totalFinancialImpact = analyses.reduce((sum, analysis) => sum + analysis.impact.financial, 0);
  const avgRecoveryTime = analyses.length > 0 
    ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.metrics.recovery, 0) / analyses.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Root-Cause Analytics
              </CardTitle>
              <CardDescription>
                AI-powered analysis of churn, downtime, and performance issues
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnalyzing(!isAnalyzing)}
                className={isAnalyzing ? 'bg-success/10 text-green-800' : ''}
              >
                {isAnalyzing ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isAnalyzing ? 'Analyzing' : 'Paused'}
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
          {/* Analytics Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalAnalyses}</div>
              <div className="text-sm text-muted-foreground">Critical Analyses</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{activeAnalyses}</div>
              <div className="text-sm text-muted-foreground">Active Analyses</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgRecoveryTime}%</div>
              <div className="text-sm text-muted-foreground">Avg Recovery</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalFinancialImpact)}</div>
              <div className="text-sm text-muted-foreground">Total Impact</div>
            </div>
          </div>

          {/* Churn & Downtime Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Churn Analysis</h4>
              <div className="space-y-2">
                {churnAnalyses.map((churn) => (
                  <div key={churn.id} className="p-3 border rounded-[0.625rem]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{churn.customerSegment}</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(churn.trend)}
                        <span className="text-sm font-medium">{churn.churnRate}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Impact: {formatCurrency(churn.revenueImpact)} | Time to churn: {churn.timeToChurn} days
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Downtime Analysis</h4>
              <div className="space-y-2">
                {downtimeAnalyses.map((downtime) => (
                  <div key={downtime.id} className="p-3 border rounded-[0.625rem]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{downtime.service}</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(downtime.trend)}
                        <span className="text-sm font-medium">{downtime.duration}h</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Impact: {formatCurrency(downtime.costImpact)} | Frequency: {downtime.frequency}/month
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Root Cause Analyses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Root Cause Analyses</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'churn', 'downtime', 'performance', 'cost', 'security', 'compliance'].map((type) => (
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
                {['all', 'analyzing', 'identified', 'resolved', 'monitoring'].map((status) => (
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
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedAnalysis?.id === analysis.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(analysis.type)}
                      <div>
                        <div className="font-medium">{analysis.title}</div>
                        <div className="text-sm text-muted-foreground">{analysis.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(analysis.severity)}>
                        {analysis.severity}
                      </Badge>
                      <Badge className={getStatusColor(analysis.status)}>
                        {analysis.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {analysis.rootCauses.primary.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Financial Impact: {formatCurrency(analysis.impact.financial)}</span>
                    <span>Customers Affected: {analysis.impact.customers}</span>
                    <span>Detected: {new Date(analysis.detectedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Analysis Details */}
          {selectedAnalysis && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Analysis Details - {selectedAnalysis.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="causes">Root Causes</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Financial Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedAnalysis.impact.financial)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customers Affected:</span>
                          <span className="font-medium">{selectedAnalysis.impact.customers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputation Impact:</span>
                          <span className="font-medium">{selectedAnalysis.impact.reputation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operational Impact:</span>
                          <span className="font-medium">{selectedAnalysis.impact.operational}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Before:</span>
                          <span className="font-medium">{selectedAnalysis.metrics.before}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>During:</span>
                          <span className="font-medium">{selectedAnalysis.metrics.during}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After:</span>
                          <span className="font-medium">{selectedAnalysis.metrics.after}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recovery:</span>
                          <span className="font-medium">{selectedAnalysis.metrics.recovery}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Correlations</h5>
                    <div className="space-y-2">
                      {selectedAnalysis.correlations.map((correlation, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-[0.625rem] text-sm">
                          <span className="font-medium">{correlation.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{correlation.correlation.toFixed(2)}</span>
                            <Badge className={getPriorityColor(correlation.significance)}>
                              {correlation.significance}
                            </Badge>
                            <span className={correlation.direction === 'positive' ? 'text-success' : 'text-destructive'}>
                              {correlation.direction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="causes" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Primary Root Cause</h5>
                    <div className="p-3 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selectedAnalysis.rootCauses.primary.factor}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{selectedAnalysis.rootCauses.primary.confidence}% confidence</span>
                          <span className="text-sm font-medium">{selectedAnalysis.rootCauses.primary.impact}% impact</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">Evidence:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAnalysis.rootCauses.primary.evidence.map((evidence, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {evidence}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Secondary Causes</h5>
                    <div className="space-y-2">
                      {selectedAnalysis.rootCauses.secondary.map((cause, index) => (
                        <div key={index} className="p-2 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{cause.factor}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{cause.confidence}% confidence</span>
                              <span className="text-xs font-medium">{cause.impact}% impact</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cause.evidence.map((evidence, evidenceIndex) => (
                              <Badge key={evidenceIndex} variant="outline" className="text-xs">
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Contributing Factors</h5>
                    <div className="space-y-2">
                      {selectedAnalysis.rootCauses.contributing.map((factor, index) => (
                        <div key={index} className="p-2 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{factor.factor}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{factor.confidence}% confidence</span>
                              <span className="text-xs font-medium">{factor.impact}% impact</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {factor.evidence.map((evidence, evidenceIndex) => (
                              <Badge key={evidenceIndex} variant="outline" className="text-xs">
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Event Timeline</h5>
                    <div className="space-y-3">
                      {selectedAnalysis.timeline.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-[0.625rem]">
                          <div className={`p-1 rounded-full ${getImpactColor(event.impact)}`}>
                            {event.impact === 'positive' ? <ArrowRight className="h-4 w-4" /> : 
                             event.impact === 'negative' ? <ArrowLeft className="h-4 w-4" /> : 
                             <Info className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{event.event}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {event.evidence.map((evidence, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {evidence}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Immediate Actions</h5>
                      <div className="space-y-2">
                        {selectedAnalysis.recommendations.immediate.map((action, index) => (
                          <div key={index} className="p-3 border rounded-[0.625rem]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{action.action}</span>
                              <Badge className={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Effort: {action.effort}</span>
                              <span>Impact: {action.impact}</span>
                              <span>Cost: {formatCurrency(action.cost)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Long-term Solutions</h5>
                      <div className="space-y-2">
                        {selectedAnalysis.recommendations.longTerm.map((action, index) => (
                          <div key={index} className="p-3 border rounded-[0.625rem]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{action.action}</span>
                              <Badge className={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Effort: {action.effort}</span>
                              <span>Impact: {action.impact}</span>
                              <span>Cost: {formatCurrency(action.cost)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


