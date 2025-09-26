"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingDown, 
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
  Shield,
  Clock,
  Users,
  Car
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface RevenueRisk {
  id: string;
  category: 'churn' | 'downtime' | 'competition' | 'pricing' | 'market' | 'operational';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: number; // 0-100
  impact: number; // financial impact
  timeHorizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  status: 'active' | 'monitoring' | 'mitigated' | 'resolved';
  detectedAt: string;
  lastUpdated: string;
  riskScore: number; // 0-100
  mitigation: {
    actions: string[];
    cost: number;
    effectiveness: number; // 0-100
    timeline: string;
  };
  indicators: {
    metric: string;
    current: number;
    threshold: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  scenarios: {
    scenario: string;
    probability: number;
    impact: number;
    description: string;
  }[];
}

interface RevenueProjection {
  period: string;
  baseline: number;
  optimistic: number;
  pessimistic: number;
  atRisk: number;
  confidence: number;
}

interface RevenueAtRiskWidgetProps {
  className?: string;
}

export default function RevenueAtRiskWidget({ className }: RevenueAtRiskWidgetProps) {
  const [revenueRisks, setRevenueRisks] = useState<RevenueRisk[]>([]);
  const [revenueProjections, setRevenueProjections] = useState<RevenueProjection[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RevenueRisk | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadRevenueRiskData = () => {
      const mockRisks: RevenueRisk[] = [
        {
          id: 'risk-001',
          category: 'churn',
          title: 'Enterprise Customer Churn Risk',
          description: 'High-value enterprise customers showing signs of potential churn',
          severity: 'critical',
          probability: 75,
          impact: 250000,
          timeHorizon: 'short_term',
          status: 'active',
          detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          riskScore: 85,
          mitigation: {
            actions: ['Customer success outreach', 'Pricing review', 'Feature enhancement'],
            cost: 50000,
            effectiveness: 80,
            timeline: '30 days'
          },
          indicators: [
            {
              metric: 'Customer Satisfaction',
              current: 3.2,
              threshold: 4.0,
              trend: 'declining'
            },
            {
              metric: 'Support Ticket Volume',
              current: 45,
              threshold: 20,
              trend: 'declining'
            },
            {
              metric: 'Usage Frequency',
              current: 65,
              threshold: 80,
              trend: 'declining'
            }
          ],
          scenarios: [
            {
              scenario: 'Worst Case',
              probability: 25,
              impact: 400000,
              description: 'Complete loss of enterprise segment'
            },
            {
              scenario: 'Most Likely',
              probability: 50,
              impact: 250000,
              description: 'Partial churn with revenue reduction'
            },
            {
              scenario: 'Best Case',
              probability: 25,
              impact: 100000,
              description: 'Minimal impact with retention'
            }
          ]
        },
        {
          id: 'risk-002',
          category: 'competition',
          title: 'Competitive Pricing Pressure',
          description: 'New competitor entering market with aggressive pricing strategy',
          severity: 'high',
          probability: 60,
          impact: 180000,
          timeHorizon: 'medium_term',
          status: 'monitoring',
          detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          riskScore: 72,
          mitigation: {
            actions: ['Competitive analysis', 'Pricing strategy review', 'Value proposition enhancement'],
            cost: 75000,
            effectiveness: 70,
            timeline: '60 days'
          },
          indicators: [
            {
              metric: 'Market Share',
              current: 35,
              threshold: 40,
              trend: 'declining'
            },
            {
              metric: 'Price Competitiveness',
              current: 85,
              threshold: 90,
              trend: 'declining'
            },
            {
              metric: 'Customer Acquisition Cost',
              current: 150,
              threshold: 120,
              trend: 'declining'
            }
          ],
          scenarios: [
            {
              scenario: 'Worst Case',
              probability: 20,
              impact: 300000,
              description: 'Significant market share loss'
            },
            {
              scenario: 'Most Likely',
              probability: 60,
              impact: 180000,
              description: 'Moderate revenue impact'
            },
            {
              scenario: 'Best Case',
              probability: 20,
              impact: 50000,
              description: 'Minimal competitive impact'
            }
          ]
        },
        {
          id: 'risk-003',
          category: 'downtime',
          title: 'Service Reliability Risk',
          description: 'Increasing service downtime affecting customer experience and revenue',
          severity: 'high',
          probability: 45,
          impact: 120000,
          timeHorizon: 'immediate',
          status: 'active',
          detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          riskScore: 68,
          mitigation: {
            actions: ['Infrastructure scaling', 'Monitoring enhancement', 'Backup systems'],
            cost: 100000,
            effectiveness: 85,
            timeline: '14 days'
          },
          indicators: [
            {
              metric: 'Uptime',
              current: 97.5,
              threshold: 99.0,
              trend: 'declining'
            },
            {
              metric: 'Response Time',
              current: 250,
              threshold: 200,
              trend: 'declining'
            },
            {
              metric: 'Error Rate',
              current: 2.5,
              threshold: 1.0,
              trend: 'declining'
            }
          ],
          scenarios: [
            {
              scenario: 'Worst Case',
              probability: 15,
              impact: 200000,
              description: 'Extended service outage'
            },
            {
              scenario: 'Most Likely',
              probability: 45,
              impact: 120000,
              description: 'Intermittent service issues'
            },
            {
              scenario: 'Best Case',
              probability: 40,
              impact: 30000,
              description: 'Quick resolution with minimal impact'
            }
          ]
        },
        {
          id: 'risk-004',
          category: 'market',
          title: 'Economic Downturn Impact',
          description: 'Potential economic recession affecting customer spending patterns',
          severity: 'medium',
          probability: 30,
          impact: 200000,
          timeHorizon: 'long_term',
          status: 'monitoring',
          detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          riskScore: 45,
          mitigation: {
            actions: ['Cost optimization', 'Diversified revenue streams', 'Customer retention focus'],
            cost: 125000,
            effectiveness: 60,
            timeline: '90 days'
          },
          indicators: [
            {
              metric: 'Customer Spending',
              current: 85,
              threshold: 90,
              trend: 'stable'
            },
            {
              metric: 'Market Demand',
              current: 78,
              threshold: 85,
              trend: 'declining'
            },
            {
              metric: 'Economic Indicators',
              current: 65,
              threshold: 70,
              trend: 'declining'
            }
          ],
          scenarios: [
            {
              scenario: 'Worst Case',
              probability: 10,
              impact: 400000,
              description: 'Severe economic downturn'
            },
            {
              scenario: 'Most Likely',
              probability: 30,
              impact: 200000,
              description: 'Moderate economic impact'
            },
            {
              scenario: 'Best Case',
              probability: 60,
              impact: 50000,
              description: 'Minimal economic impact'
            }
          ]
        }
      ];

      const mockProjections: RevenueProjection[] = [
        {
          period: 'Next Month',
          baseline: 500000,
          optimistic: 550000,
          pessimistic: 450000,
          atRisk: 75000,
          confidence: 85
        },
        {
          period: 'Next Quarter',
          baseline: 1500000,
          optimistic: 1650000,
          pessimistic: 1350000,
          atRisk: 225000,
          confidence: 78
        },
        {
          period: 'Next Year',
          baseline: 6000000,
          optimistic: 6600000,
          pessimistic: 5400000,
          atRisk: 900000,
          confidence: 72
        }
      ];

      setRevenueRisks(mockRisks);
      setRevenueProjections(mockProjections);
      setSelectedRisk(mockRisks[0]);
    };

    loadRevenueRiskData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setRevenueRisks(prev => prev.map(risk => ({
        ...risk,
        lastUpdated: new Date().toISOString(),
        riskScore: Math.max(0, Math.min(100, risk.riskScore + (Math.random() - 0.5) * 5))
      })));
    }, 30000);

    return () => clearInterval(interval);
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
      case 'active': return 'bg-destructive/10 text-destructive';
      case 'monitoring': return 'bg-warning/10 text-warning';
      case 'mitigated': return 'bg-primary/10 text-primary';
      case 'resolved': return 'bg-success/10 text-success';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'churn': return <Users className="h-4 w-4" />;
      case 'downtime': return <Clock className="h-4 w-4" />;
      case 'competition': return <Target className="h-4 w-4" />;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'market': return <BarChart3 className="h-4 w-4" />;
      case 'operational': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-success" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Minus className="h-4 w-4 text-primary" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTimeHorizonColor = (horizon: string) => {
    switch (horizon) {
      case 'immediate': return 'bg-destructive/10 text-destructive';
      case 'short_term': return 'bg-warning/10 text-warning';
      case 'medium_term': return 'bg-warning/10 text-warning';
      case 'long_term': return 'bg-success/10 text-success';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleRiskStatusUpdate = (riskId: string, newStatus: string) => {
    setRevenueRisks(prev => prev.map(risk =>
      risk.id === riskId ? { ...risk, status: newStatus as string } : risk
    ));
  };

  const filteredRisks = revenueRisks.filter(risk => {
    const categoryMatch = filterCategory === 'all' || risk.category === filterCategory;
    const severityMatch = filterSeverity === 'all' || risk.severity === filterSeverity;
    return categoryMatch && severityMatch;
  });

  const criticalRisks = revenueRisks.filter(risk => risk.severity === 'critical').length;
  const activeRisks = revenueRisks.filter(risk => risk.status === 'active').length;
  const totalAtRisk = revenueRisks.reduce((sum, risk) => sum + risk.impact, 0);
  const avgRiskScore = revenueRisks.length > 0 
    ? Math.round(revenueRisks.reduce((sum, risk) => sum + risk.riskScore, 0) / revenueRisks.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue-at-Risk Widget
              </CardTitle>
              <CardDescription>
                Potential loss projection and revenue risk monitoring
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
          {/* Risk Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalRisks}</div>
              <div className="text-sm text-muted-foreground">Critical Risks</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{activeRisks}</div>
              <div className="text-sm text-muted-foreground">Active Risks</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgRiskScore}</div>
              <div className="text-sm text-muted-foreground">Avg Risk Score</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalAtRisk)}</div>
              <div className="text-sm text-muted-foreground">Total at Risk</div>
            </div>
          </div>

          {/* Revenue Projections */}
          <div>
            <h4 className="font-medium mb-3">Revenue Projections</h4>
            <div className="space-y-3">
              {revenueProjections.map((projection) => (
                <div key={projection.period} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{projection.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{projection.confidence}% confidence</span>
                      <Badge className="bg-destructive/10 text-destructive">
                        {formatCurrency(projection.atRisk)} at risk
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Baseline:</span>
                      <span className="font-medium ml-2">{formatCurrency(projection.baseline)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Optimistic:</span>
                      <span className="font-medium ml-2 text-success">{formatCurrency(projection.optimistic)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pessimistic:</span>
                      <span className="font-medium ml-2 text-destructive">{formatCurrency(projection.pessimistic)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Risks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Revenue Risks</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'churn', 'downtime', 'competition', 'pricing', 'market', 'operational'].map((category) => (
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
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredRisks.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedRisk?.id === risk.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRisk(risk)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(risk.category)}
                      <div>
                        <div className="font-medium">{risk.title}</div>
                        <div className="text-sm text-muted-foreground">{risk.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <Badge className={getStatusColor(risk.status)}>
                        {risk.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {risk.riskScore}% risk
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Impact: {formatCurrency(risk.impact)}</span>
                    <span>Probability: {risk.probability}%</span>
                    <span>Time Horizon: {risk.timeHorizon.replace('_', ' ')}</span>
                    <span>Last Updated: {new Date(risk.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Risk Details */}
          {selectedRisk && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Risk Details - {selectedRisk.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="indicators">Indicators</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Risk Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedRisk.severity)}>
                            {selectedRisk.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Probability:</span>
                          <span className="font-medium">{selectedRisk.probability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedRisk.impact)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Score:</span>
                          <span className="font-medium">{selectedRisk.riskScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Horizon:</span>
                          <Badge className={getTimeHorizonColor(selectedRisk.timeHorizon)}>
                            {selectedRisk.timeHorizon.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedRisk.status)}>
                            {selectedRisk.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Timeline</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Detected:</span>
                          <span className="font-medium">{new Date(selectedRisk.detectedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="font-medium">{new Date(selectedRisk.lastUpdated).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="indicators" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Indicators</h5>
                    <div className="space-y-2">
                      {selectedRisk.indicators.map((indicator, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{indicator.metric}</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(indicator.trend)}
                              <span className="text-sm font-medium">{indicator.current}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Threshold: {indicator.threshold}</span>
                            <span>Trend: {indicator.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scenarios" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Scenarios</h5>
                    <div className="space-y-2">
                      {selectedRisk.scenarios.map((scenario, index) => (
                        <div key={index} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{scenario.scenario}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{scenario.probability}% probability</span>
                              <span className="text-sm font-medium">{formatCurrency(scenario.impact)} impact</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mitigation" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Mitigation Plan</h5>
                    <div className="space-y-3">
                      <div>
                        <h6 className="font-medium mb-2">Actions</h6>
                        <div className="space-y-1">
                          {selectedRisk.mitigation.actions.map((action, index) => (
                            <div key={index} className="p-2 border rounded-[0.625rem] text-sm">
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium mb-2">Cost & Timeline</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span className="font-medium">{formatCurrency(selectedRisk.mitigation.cost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Timeline:</span>
                              <span className="font-medium">{selectedRisk.mitigation.timeline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Effectiveness:</span>
                              <span className="font-medium">{selectedRisk.mitigation.effectiveness}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Mitigated
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Assessment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


