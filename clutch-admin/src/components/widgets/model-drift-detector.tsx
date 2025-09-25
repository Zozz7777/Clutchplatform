"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Zap,
  Clock
} from 'lucide-react';

interface ModelDriftDetectorProps {
  className?: string;
}

interface ModelDriftData {
  modelName: string;
  accuracy: number;
  previousAccuracy: number;
  driftScore: number;
  status: 'stable' | 'warning' | 'critical';
  lastUpdated: string;
  dataDistribution: {
    feature: string;
    drift: number;
    threshold: number;
  }[];
  performanceMetrics: {
    metric: string;
    current: number;
    baseline: number;
    change: number;
  }[];
}

export function ModelDriftDetector({ className = '' }: ModelDriftDetectorProps) {
  const { t } = useLanguage();
  const [driftData, setDriftData] = React.useState<ModelDriftData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDriftData = async () => {
      try {
        // Simulate model drift data
        const models: ModelDriftData[] = [
          {
            modelName: 'Fraud Detection',
            accuracy: 94.2,
            previousAccuracy: 96.1,
            driftScore: 0.15,
            status: 'warning',
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            dataDistribution: [
              { feature: 'Transaction Amount', drift: 0.12, threshold: 0.1 },
              { feature: 'Time of Day', drift: 0.08, threshold: 0.1 },
              { feature: 'Location', drift: 0.15, threshold: 0.1 },
              { feature: 'Device Type', drift: 0.05, threshold: 0.1 }
            ],
            performanceMetrics: [
              { metric: 'Precision', current: 0.92, baseline: 0.94, change: -2.1 },
              { metric: 'Recall', current: 0.89, baseline: 0.91, change: -2.2 },
              { metric: 'F1 Score', current: 0.90, baseline: 0.92, change: -2.2 }
            ]
          },
          {
            modelName: 'Recommendation Engine',
            accuracy: 87.5,
            previousAccuracy: 87.8,
            driftScore: 0.05,
            status: 'stable',
            lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            dataDistribution: [
              { feature: 'User Behavior', drift: 0.03, threshold: 0.1 },
              { feature: 'Content Features', drift: 0.07, threshold: 0.1 },
              { feature: 'Temporal Patterns', drift: 0.04, threshold: 0.1 }
            ],
            performanceMetrics: [
              { metric: 'Click-Through Rate', current: 0.15, baseline: 0.14, change: 7.1 },
              { metric: 'Conversion Rate', current: 0.08, baseline: 0.08, change: 0.0 },
              { metric: 'Engagement Score', current: 0.72, baseline: 0.71, change: 1.4 }
            ]
          },
          {
            modelName: 'Churn Prediction',
            accuracy: 82.1,
            previousAccuracy: 85.3,
            driftScore: 0.25,
            status: 'critical',
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            dataDistribution: [
              { feature: 'Usage Patterns', drift: 0.22, threshold: 0.1 },
              { feature: 'Support Tickets', drift: 0.18, threshold: 0.1 },
              { feature: 'Payment History', drift: 0.12, threshold: 0.1 }
            ],
            performanceMetrics: [
              { metric: 'Precision', current: 0.78, baseline: 0.82, change: -4.9 },
              { metric: 'Recall', current: 0.75, baseline: 0.80, change: -6.3 },
              { metric: 'F1 Score', current: 0.76, baseline: 0.81, change: -6.2 }
            ]
          }
        ];

        setDriftData(models);
      } catch (error) {
        // Failed to load model drift data
      } finally {
        setIsLoading(false);
      }
    };

    loadDriftData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success/10 text-success';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getDriftColor = (drift: number, threshold: number) => {
    if (drift <= threshold) return 'text-success';
    if (drift <= threshold * 1.5) return 'text-warning';
    return 'text-destructive';
  };

  const getDriftBadge = (drift: number, threshold: number) => {
    if (drift <= threshold) return 'bg-success/10 text-success';
    if (drift <= threshold * 1.5) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getDriftLevel = (drift: number, threshold: number) => {
    if (drift <= threshold) return 'Low';
    if (drift <= threshold * 1.5) return 'Medium';
    return 'High';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Activity;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Model Drift Detector</span>
          </CardTitle>
          <CardDescription>Loading model drift data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalModels = driftData.filter(m => m.status === 'critical').length;
  const warningModels = driftData.filter(m => m.status === 'warning').length;
  const stableModels = driftData.filter(m => m.status === 'stable').length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Model Drift Detector</span>
        </CardTitle>
        <CardDescription>
          Flags if model accuracy is declining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{criticalModels}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{warningModels}</p>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{stableModels}</p>
            <p className="text-xs text-muted-foreground">Stable</p>
          </div>
        </div>

        {/* Model Status Overview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Model Status</h4>
          <div className="space-y-2">
            {driftData.map((model) => {
              const StatusIcon = getStatusIcon(model.status);
              const accuracyChange = model.accuracy - model.previousAccuracy;
              const ChangeIcon = getChangeIcon(accuracyChange);
              
              return (
                <div key={model.modelName} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(model.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{model.modelName}</p>
                      <p className="text-xs text-muted-foreground">
                        Accuracy: {model.accuracy.toFixed(1)}% 
                        <span className={`ml-1 ${getChangeColor(accuracyChange)}`}>
                          ({accuracyChange > 0 ? '+' : ''}{accuracyChange.toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">
                        {model.driftScore.toFixed(2)}
                      </p>
                      <Badge className={getDriftBadge(model.driftScore, 0.1)}>
                        {model.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <ChangeIcon className={`h-3 w-3 ${getChangeColor(accuracyChange)}`} />
                      <span className={`text-xs ${getChangeColor(accuracyChange)}`}>
                        {formatTime(model.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Distribution Drift */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Data Distribution Drift</h4>
          <div className="space-y-2">
            {driftData[0]?.dataDistribution.map((feature) => (
              <div key={feature.feature} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.feature}</p>
                    <p className="text-xs text-muted-foreground">Feature drift</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {feature.drift.toFixed(3)}
                  </p>
                  <Badge className={getDriftBadge(feature.drift, feature.threshold)}>
                    {getDriftLevel(feature.drift, feature.threshold)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Performance Metrics</h4>
          <div className="space-y-2">
            {driftData[0]?.performanceMetrics.map((metric) => {
              const ChangeIcon = getChangeIcon(metric.change);
              return (
                <div key={metric.metric} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{metric.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {metric.current.toFixed(3)} | Baseline: {metric.baseline.toFixed(3)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <ChangeIcon className={`h-3 w-3 ${getChangeColor(metric.change)}`} />
                      <span className={`text-sm font-semibold ${getChangeColor(metric.change)}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Drift Detection Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {driftData.length} models monitored for drift</li>
            <li>• {criticalModels} models require immediate attention</li>
            <li>• {warningModels} models showing warning signs</li>
            <li>• {stableModels} models performing stably</li>
            {criticalModels > 0 && (
              <li>• Critical models need retraining or data pipeline review</li>
            )}
            {warningModels > 0 && (
              <li>• Warning models should be monitored closely</li>
            )}
            {stableModels === driftData.length && (
              <li>• All models performing within acceptable parameters</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModelDriftDetector;





