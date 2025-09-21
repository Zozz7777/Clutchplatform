'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// import { useTranslations } from 'next-intl';
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Zap, 
  Clock, 
  DollarSign,
  Users,
  Truck,
  Activity,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface CriticalPathAlert {
  id: string;
  title: string;
  description: string;
  category: 'fleet' | 'revenue' | 'users' | 'system' | 'compliance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: {
    metric: string;
    currentValue: number;
    potentialValue: number;
    unit: string;
    improvement: number;
  };
  bottleneck: {
    description: string;
    rootCause: string;
    solution: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  };
  kpiImpact: {
    revenue: number;
    efficiency: number;
    satisfaction: number;
    cost: number;
  };
  status: 'identified' | 'in_progress' | 'resolved' | 'monitoring';
  createdAt: string;
  estimatedResolution: string;
}

interface CriticalPathAlertsProps {
  className?: string;
}

export default function CriticalPathAlerts({ className }: CriticalPathAlertsProps) {
  const t = (key: string, params?: any) => key;
  const [alerts, setAlerts] = useState<CriticalPathAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CriticalPathAlert | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadCriticalPathAlerts = () => {
      const mockAlerts: CriticalPathAlert[] = [
        {
          id: '1',
          title: 'Fleet Maintenance Bottleneck',
          description: 'Vehicle downtime is causing 23% revenue loss in peak hours',
          category: 'fleet',
          priority: 'critical',
          impact: {
            metric: 'Revenue per Hour',
            currentValue: 125,
            potentialValue: 162,
            unit: '$',
            improvement: 29.6
          },
          bottleneck: {
            description: 'Maintenance scheduling conflicts during peak demand hours',
            rootCause: 'Manual scheduling system causing overlapping appointments',
            solution: 'Implement AI-powered predictive maintenance scheduling',
            effort: 'medium',
            timeline: '2-3 weeks'
          },
          kpiImpact: {
            revenue: 29.6,
            efficiency: 35.2,
            satisfaction: 18.7,
            cost: -15.3
          },
          status: 'identified',
          createdAt: '2 hours ago',
          estimatedResolution: '2-3 weeks'
        },
        {
          id: '2',
          title: 'User Onboarding Friction',
          description: 'B2B customer activation rate is 40% below industry average',
          category: 'users',
          priority: 'high',
          impact: {
            metric: 'Activation Rate',
            currentValue: 35,
            potentialValue: 75,
            unit: '%',
            improvement: 114.3
          },
          bottleneck: {
            description: 'Complex onboarding process with 12 required steps',
            rootCause: 'Lack of guided setup and unclear value proposition',
            solution: 'Streamline to 3-step onboarding with interactive demo',
            effort: 'high',
            timeline: '4-6 weeks'
          },
          kpiImpact: {
            revenue: 45.8,
            efficiency: 22.1,
            satisfaction: 67.3,
            cost: -8.2
          },
          status: 'in_progress',
          createdAt: '1 day ago',
          estimatedResolution: '4-6 weeks'
        },
        {
          id: '3',
          title: 'API Response Time Degradation',
          description: 'Mobile app performance issues affecting user retention',
          category: 'system',
          priority: 'high',
          impact: {
            metric: 'API Response Time',
            currentValue: 2.3,
            potentialValue: 0.8,
            unit: 's',
            improvement: 65.2
          },
          bottleneck: {
            description: 'Database queries not optimized for mobile traffic patterns',
            rootCause: 'Missing indexes and inefficient query patterns',
            solution: 'Implement query optimization and caching layer',
            effort: 'medium',
            timeline: '1-2 weeks'
          },
          kpiImpact: {
            revenue: 12.4,
            efficiency: 28.9,
            satisfaction: 41.6,
            cost: -5.7
          },
          status: 'monitoring',
          createdAt: '3 days ago',
          estimatedResolution: '1-2 weeks'
        }
      ];

      setAlerts(mockAlerts);
    };

    loadCriticalPathAlerts();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fleet': return <Truck className="h-4 w-4" />;
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in_progress': return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      case 'monitoring': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const handleAnalyzeBottlenecks = () => {
    setIsAnalyzing(true);
    // Perform real analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Add new alert or update existing ones
    }, 2000);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const }
          : alert
      )
    );
  };

  const topAlert = alerts.find(alert => alert.priority === 'critical') || alerts[0];

  return (
    <div className={className}>
      {/* Top Critical Alert */}
      {topAlert && (
        <Card className="mb-4 border-destructive/20 bg-destructive/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">{t('widgets.criticalPathAlerts.criticalBottleneckIdentified')}</CardTitle>
              </div>
              <Badge className={`${getPriorityColor(topAlert.priority)} text-background`}>
                {topAlert.priority.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="text-destructive/80">
              {topAlert.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('widgets.criticalPathAlerts.currentPerformance')}</div>
                <div className="text-2xl font-medium text-destructive">
                  {topAlert.impact.currentValue}{topAlert.impact.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('widgets.criticalPathAlerts.potentialPerformance')}</div>
                <div className="text-2xl font-medium text-success">
                  {topAlert.impact.potentialValue}{topAlert.impact.unit}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{t('widgets.criticalPathAlerts.improvementPotential')}</span>
                <span className="font-medium">+{topAlert.impact.improvement}%</span>
              </div>
              <Progress value={topAlert.impact.improvement} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('widgets.criticalPathAlerts.estimatedResolution')} {topAlert.estimatedResolution}
              </div>
              <Button size="sm" onClick={() => setSelectedAlert(topAlert)}>
                <Lightbulb className="h-4 w-4 mr-1" />
                {t('widgets.criticalPathAlerts.viewSolution')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {t('widgets.criticalPathAlerts.title')}
              </CardTitle>
              <CardDescription>
                {t('widgets.criticalPathAlerts.description')}
              </CardDescription>
            </div>
            <Button 
              onClick={handleAnalyzeBottlenecks}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-1 animate-spin" />
                  {t('widgets.criticalPathAlerts.analyzing')}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  {t('widgets.criticalPathAlerts.analyze')}
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-[0.625rem] border border-border ${
                alert.priority === 'critical' ? 'bg-destructive/10' :
                alert.priority === 'high' ? 'bg-warning/10' :
                'bg-background'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(alert.category)}
                  <h3 className="font-medium">{alert.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status.replace('_', ' ')}
                  </Badge>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="font-medium">{alert.impact.currentValue}{alert.impact.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Potential</div>
                  <div className="font-medium text-success">
                    {alert.impact.potentialValue}{alert.impact.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span>+{alert.impact.improvement}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{alert.estimatedResolution}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getEffortColor(alert.bottleneck.effort)}`} />
                    <span className="capitalize">{alert.bottleneck.effort} effort</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    Details
                  </Button>
                  {alert.status !== 'resolved' && (
                    <Button
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(selectedAlert.category)}
                  <CardTitle>{selectedAlert.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Impact Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-[0.625rem]">
                    <div className="text-sm text-muted-foreground">Current Performance</div>
                    <div className="text-xl font-bold">{selectedAlert.impact.currentValue}{selectedAlert.impact.unit}</div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-[0.625rem]">
                    <div className="text-sm text-muted-foreground">Potential Performance</div>
                    <div className="text-xl font-medium text-success">
                      {selectedAlert.impact.potentialValue}{selectedAlert.impact.unit}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Bottleneck Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Issue:</span> {selectedAlert.bottleneck.description}
                  </div>
                  <div>
                    <span className="font-medium">Root Cause:</span> {selectedAlert.bottleneck.rootCause}
                  </div>
                  <div>
                    <span className="font-medium">Solution:</span> {selectedAlert.bottleneck.solution}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">KPI Impact</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="text-success">+{selectedAlert.kpiImpact.revenue}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="text-success">+{selectedAlert.kpiImpact.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfaction:</span>
                    <span className="text-success">+{selectedAlert.kpiImpact.satisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="text-success">{selectedAlert.kpiImpact.cost}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                <Button onClick={() => handleResolveAlert(selectedAlert.id)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Resolved
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

