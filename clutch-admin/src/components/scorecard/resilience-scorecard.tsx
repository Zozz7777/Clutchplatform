'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  DollarSign,
  Users,
  Truck,
  FileCheck,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface ResilienceMetric {
  id: string;
  name: string;
  category: 'system' | 'financial' | 'churn' | 'compliance';
  score: number;
  maxScore: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
  details: {
    current: number;
    target: number;
    unit: string;
    factors: string[];
  };
}

interface ResilienceScorecardProps {
  className?: string;
}

export default function ResilienceScorecard({ className }: ResilienceScorecardProps) {
  const [metrics, setMetrics] = useState<ResilienceMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadResilienceMetrics = () => {
      const mockMetrics: ResilienceMetric[] = [
        {
          id: '1',
          name: 'System Health',
          category: 'system',
          score: 87,
          maxScore: 100,
          weight: 0.3,
          trend: 'up',
          status: 'good',
          description: 'Overall system performance and reliability',
          lastUpdated: '5 minutes ago',
          details: {
            current: 87,
            target: 95,
            unit: '%',
            factors: ['Uptime: 99.2%', 'Response Time: 245ms', 'Error Rate: 0.1%']
          }
        },
        {
          id: '2',
          name: 'Financial Health',
          category: 'financial',
          score: 92,
          maxScore: 100,
          weight: 0.25,
          trend: 'up',
          status: 'excellent',
          description: 'Revenue stability and cost management',
          lastUpdated: '1 hour ago',
          details: {
            current: 92,
            target: 90,
            unit: '%',
            factors: ['Revenue Growth: +15%', 'Cost Ratio: 0.65', 'Cash Runway: 18 months']
          }
        },
        {
          id: '3',
          name: 'Churn Risk',
          category: 'churn',
          score: 73,
          maxScore: 100,
          weight: 0.25,
          trend: 'down',
          status: 'warning',
          description: 'Customer retention and satisfaction levels',
          lastUpdated: '2 hours ago',
          details: {
            current: 73,
            target: 85,
            unit: '%',
            factors: ['Churn Rate: 3.2%', 'NPS Score: 42', 'Support Tickets: +12%']
          }
        },
        {
          id: '4',
          name: 'Compliance',
          category: 'compliance',
          score: 95,
          maxScore: 100,
          weight: 0.2,
          trend: 'stable',
          status: 'excellent',
          description: 'Regulatory compliance and security posture',
          lastUpdated: '1 day ago',
          details: {
            current: 95,
            target: 100,
            unit: '%',
            factors: ['SOC2: Compliant', 'GDPR: Compliant', 'Security Score: 98/100']
          }
        }
      ];

      setMetrics(mockMetrics);
      
      // Calculate overall weighted score
      const weightedScore = mockMetrics.reduce((sum, metric) => {
        return sum + (metric.score * metric.weight);
      }, 0);
      setOverallScore(Math.round(weightedScore));
      setLastUpdated(new Date());
    };

    loadResilienceMetrics();

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(prev => 
        prev.map(metric => ({
          ...metric,
          lastUpdated: 'Just now'
        }))
      );
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Activity className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'churn': return <Users className="h-4 w-4" />;
      case 'compliance': return <FileCheck className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getOverallStatus = (score: number) => {
    if (score >= 90) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const overallStatus = getOverallStatus(overallScore);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Resilience Scorecard
            </CardTitle>
            <CardDescription>
              Comprehensive health assessment across all critical areas
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${overallStatus.color}`}>
              {overallScore}
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Score
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score Visualization */}
        <div className={`p-4 rounded-lg-lg ${overallStatus.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Overall Resilience</span>
            <Badge className={`${getStatusColor(overallStatus.status)} text-white`}>
              {overallStatus.status.toUpperCase()}
            </Badge>
          </div>
          <Progress value={overallScore} className="h-3 mb-2" />
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 border rounded-lg-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(metric.category)}
                  <h3 className="font-medium">{metric.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <Badge className={`${getStatusColor(metric.status)} text-white`}>
                    {metric.score}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className={getStatusTextColor(metric.status)}>
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>
                <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Current</div>
                  <div className="font-medium">
                    {metric.details.current}{metric.details.unit}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Target</div>
                  <div className="font-medium">
                    {metric.details.target}{metric.details.unit}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Key Factors:</div>
                <div className="flex flex-wrap gap-1">
                  {metric.details.factors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Updated: {metric.lastUpdated}
              </div>
            </div>
          ))}
        </div>

        {/* Action Items */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Priority Actions
          </h4>
          <div className="space-y-2">
            {metrics
              .filter(metric => metric.status === 'warning' || metric.status === 'critical')
              .map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">
                      Address {metric.name.toLowerCase()} - currently at {metric.score}%
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Action
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.filter(m => m.status === 'excellent').length}
            </div>
            <div className="text-xs text-muted-foreground">Excellent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.filter(m => m.status === 'good').length}
            </div>
            <div className="text-xs text-muted-foreground">Good</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics.filter(m => m.status === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
