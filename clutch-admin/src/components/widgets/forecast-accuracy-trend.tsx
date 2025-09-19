"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Activity,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ForecastAccuracyTrendProps {
  className?: string;
}

interface AccuracyData {
  period: string;
  forecasted: number;
  actual: number;
  accuracy: number;
  error: number;
  trend: 'up' | 'down' | 'stable';
  model: string;
}

export function ForecastAccuracyTrend({ className = '' }: ForecastAccuracyTrendProps) {
  const [accuracyData, setAccuracyData] = React.useState<{
    trends: AccuracyData[];
    averageAccuracy: number;
    bestAccuracy: number;
    worstAccuracy: number;
    improvement: number;
    modelPerformance: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAccuracyData = async () => {
      try {
        // Simulate forecast accuracy trend data
        const trends: AccuracyData[] = [
          {
            period: 'Jan 2024',
            forecasted: 450000,
            actual: 465000,
            accuracy: 96.7,
            error: 3.3,
            trend: 'up',
            model: 'Revenue Model'
          },
          {
            period: 'Feb 2024',
            forecasted: 480000,
            actual: 472000,
            accuracy: 98.3,
            error: 1.7,
            trend: 'up',
            model: 'Revenue Model'
          },
          {
            period: 'Mar 2024',
            forecasted: 520000,
            actual: 498000,
            accuracy: 95.8,
            error: 4.2,
            trend: 'down',
            model: 'Revenue Model'
          },
          {
            period: 'Apr 2024',
            forecasted: 550000,
            actual: 568000,
            accuracy: 96.8,
            error: 3.2,
            trend: 'up',
            model: 'Revenue Model'
          },
          {
            period: 'May 2024',
            forecasted: 580000,
            actual: 592000,
            accuracy: 98.0,
            error: 2.0,
            trend: 'up',
            model: 'Revenue Model'
          },
          {
            period: 'Jun 2024',
            forecasted: 620000,
            actual: 605000,
            accuracy: 97.6,
            error: 2.4,
            trend: 'down',
            model: 'Revenue Model'
          }
        ];

        const averageAccuracy = trends.reduce((sum, trend) => sum + trend.accuracy, 0) / trends.length;
        const bestAccuracy = Math.max(...trends.map(t => t.accuracy));
        const worstAccuracy = Math.min(...trends.map(t => t.accuracy));
        const improvement = trends[trends.length - 1].accuracy - trends[0].accuracy;
        
        const modelPerformance = trends.reduce((acc, trend) => {
          acc[trend.model] = (acc[trend.model] || 0) + trend.accuracy;
          return acc;
        }, {} as Record<string, number>);

        // Calculate average for each model
        Object.keys(modelPerformance).forEach(model => {
          const modelTrends = trends.filter(t => t.model === model);
          modelPerformance[model] = modelPerformance[model] / modelTrends.length;
        });

        setAccuracyData({
          trends,
          averageAccuracy,
          bestAccuracy,
          worstAccuracy,
          improvement,
          modelPerformance
        });
      } catch (error) {
        // Failed to load forecast accuracy data
      } finally {
        setIsLoading(false);
      }
    };

    loadAccuracyData();
  }, []);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-success';
    if (accuracy >= 90) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 95) return 'bg-success/10 text-green-800';
    if (accuracy >= 90) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 95) return 'Excellent';
    if (accuracy >= 90) return 'Good';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Forecast Accuracy Trend</span>
          </CardTitle>
          <CardDescription>Loading forecast accuracy data...</CardDescription>
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

  if (!accuracyData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Forecast Accuracy Trend</span>
          </CardTitle>
          <CardDescription>Unable to load forecast accuracy data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Forecast Accuracy Trend</span>
        </CardTitle>
        <CardDescription>
          How accurate historical forecasts have been
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {accuracyData.averageAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {accuracyData.improvement > 0 ? '+' : ''}{accuracyData.improvement.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Improvement</p>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getAccuracyColor(accuracyData.averageAccuracy)}`} />
            <span className={`text-2xl font-bold ${getAccuracyColor(accuracyData.averageAccuracy)}`}>
              {accuracyData.averageAccuracy.toFixed(1)}%
            </span>
            <Badge className={getAccuracyBadge(accuracyData.averageAccuracy)}>
              {getAccuracyLevel(accuracyData.averageAccuracy)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Average Forecast Accuracy</p>
          <div className="mt-3">
            <Progress value={accuracyData.averageAccuracy} className="h-2" />
          </div>
        </div>

        {/* Accuracy Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {accuracyData.bestAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Best Accuracy</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">
              {accuracyData.worstAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Worst Accuracy</p>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Monthly Accuracy Trends</h4>
          <div className="space-y-2">
            {accuracyData.trends.map((trend) => {
              const TrendIcon = getTrendIcon(trend.trend);
              
              return (
                <div key={trend.period} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-[0.625rem]-full">
                      <span className="text-sm font-semibold text-primary">
                        {trend.period.split(' ')[0].substring(0, 3)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{trend.period}</p>
                      <p className="text-xs text-muted-foreground">
                        Forecast: ${trend.forecasted.toLocaleString()} • Actual: ${trend.actual.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${getAccuracyColor(trend.accuracy)}`}>
                        {trend.accuracy.toFixed(1)}%
                      </p>
                      <Badge className={getAccuracyBadge(trend.accuracy)}>
                        {getAccuracyLevel(trend.accuracy)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(trend.trend)}`} />
                      <span className={`text-xs ${getTrendColor(trend.trend)}`}>
                        {trend.error.toFixed(1)}% error
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accuracy Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Accuracy Distribution</h4>
          <div className="space-y-2">
            {accuracyData.trends.map((trend) => (
              <div key={trend.period} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{trend.period}</span>
                  <span className="text-foreground font-medium">{trend.accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={trend.accuracy} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Model Performance</h4>
          <div className="space-y-2">
            {Object.entries(accuracyData.modelPerformance).map(([model, accuracy]) => (
              <div key={model} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{model}</p>
                    <p className="text-xs text-muted-foreground">Forecast model</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getAccuracyColor(accuracy)}`}>
                    {accuracy.toFixed(1)}%
                  </p>
                  <Badge className={getAccuracyBadge(accuracy)}>
                    {getAccuracyLevel(accuracy)}
                  </Badge>
                </div>
              </div>
            ))}
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Forecast Accuracy Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average accuracy: {accuracyData.averageAccuracy.toFixed(1)}%</li>
            <li>• Best accuracy: {accuracyData.bestAccuracy.toFixed(1)}%</li>
            <li>• Worst accuracy: {accuracyData.worstAccuracy.toFixed(1)}%</li>
            <li>• Overall improvement: {accuracyData.improvement > 0 ? '+' : ''}{accuracyData.improvement.toFixed(1)}%</li>
            <li>• {accuracyData.trends.length} months analyzed</li>
            <li>• {Object.keys(accuracyData.modelPerformance).length} models tracked</li>
            {accuracyData.averageAccuracy >= 95 && (
              <li>• Excellent forecast accuracy - models performing well</li>
            )}
            {accuracyData.improvement > 0 && (
              <li>• Accuracy improving over time - good model evolution</li>
            )}
            {accuracyData.improvement < 0 && (
              <li>• Accuracy declining - consider model updates</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForecastAccuracyTrend;
