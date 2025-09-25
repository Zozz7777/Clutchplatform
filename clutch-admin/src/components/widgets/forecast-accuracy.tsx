"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface ForecastAccuracyProps {
  className?: string;
}

interface ForecastAccuracyData {
  model: string;
  accuracy: number;
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
  predictions: number;
  actuals: number;
  category: string;
  description: string;
}

export function ForecastAccuracy({ className = '' }: ForecastAccuracyProps) {
  const { t } = useLanguage();
  const [accuracyData, setAccuracyData] = React.useState<ForecastAccuracyData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadForecastAccuracy = async () => {
      try {
        // Simulate forecast accuracy data
        const models: ForecastAccuracyData[] = [
          {
            model: 'Revenue Forecast',
            accuracy: 87.5,
            mape: 12.5,
            rmse: 0.08,
            trend: 'improving',
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            predictions: 24,
            actuals: 22,
            category: 'Financial',
            description: 'Monthly revenue predictions'
          },
          {
            model: 'User Growth',
            accuracy: 82.3,
            mape: 17.7,
            rmse: 0.12,
            trend: 'stable',
            lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            predictions: 18,
            actuals: 16,
            category: 'Users',
            description: 'User acquisition forecasts'
          },
          {
            model: 'Fleet Utilization',
            accuracy: 91.2,
            mape: 8.8,
            rmse: 0.06,
            trend: 'improving',
            lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            predictions: 30,
            actuals: 28,
            category: 'Fleet',
            description: 'Vehicle utilization predictions'
          },
          {
            model: 'Churn Prediction',
            accuracy: 78.9,
            mape: 21.1,
            rmse: 0.15,
            trend: 'declining',
            lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            predictions: 15,
            actuals: 12,
            category: 'Users',
            description: 'Customer churn predictions'
          },
          {
            model: 'Maintenance Schedule',
            accuracy: 94.1,
            mape: 5.9,
            rmse: 0.04,
            trend: 'improving',
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            predictions: 45,
            actuals: 43,
            category: 'Fleet',
            description: 'Vehicle maintenance predictions'
          }
        ];

        setAccuracyData(models);
      } catch (error) {
        // Failed to load forecast accuracy data
      } finally {
        setIsLoading(false);
      }
    };

    loadForecastAccuracy();
  }, []);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-success/10 text-success';
    if (accuracy >= 80) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-success';
      case 'declining': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-success/10 text-success';
      case 'declining': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getAverageAccuracy = () => {
    return accuracyData.length > 0 ? accuracyData.reduce((sum, model) => sum + model.accuracy, 0) / accuracyData.length : 0;
  };

  const getTopPerformingModel = () => {
    return accuracyData.length > 0 ? accuracyData.reduce((top, model) => model.accuracy > top.accuracy ? model : top) : null;
  };

  const getWorstPerformingModel = () => {
    return accuracyData.length > 0 ? accuracyData.reduce((worst, model) => model.accuracy < worst.accuracy ? model : worst) : null;
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
            <Target className="h-5 w-5 text-primary" />
            <span>Forecast Accuracy</span>
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

  const averageAccuracy = getAverageAccuracy();
  const topModel = getTopPerformingModel();
  const worstModel = getWorstPerformingModel();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Forecast Accuracy</span>
        </CardTitle>
        <CardDescription>
          Compare AI predictions vs actual results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {averageAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {accuracyData.filter(m => m.accuracy >= 80).length}
            </p>
            <p className="text-xs text-muted-foreground">Good Models</p>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getAccuracyColor(averageAccuracy)}`} />
            <span className={`text-2xl font-bold ${getAccuracyColor(averageAccuracy)}`}>
              {averageAccuracy.toFixed(1)}%
            </span>
            <Badge className={getAccuracyBadge(averageAccuracy)}>
              {getAccuracyLevel(averageAccuracy)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Overall Forecast Accuracy</p>
          <div className="mt-3">
            <Progress value={averageAccuracy} className="h-2" />
          </div>
        </div>

        {/* Model Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Model Performance</h4>
          <div className="space-y-2">
            {accuracyData.map((model, index) => {
              const TrendIcon = getTrendIcon(model.trend);
              
              return (
                <div key={model.model} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{model.model}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${getAccuracyColor(model.accuracy)}`}>
                        {model.accuracy.toFixed(1)}%
                      </p>
                      <Badge className={getAccuracyBadge(model.accuracy)}>
                        {getAccuracyLevel(model.accuracy)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(model.trend)}`} />
                      <span className={`text-xs ${getTrendColor(model.trend)}`}>
                        {model.trend}
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
            {accuracyData.map((model) => (
              <div key={model.model} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{model.model}</span>
                  <span className="text-foreground font-medium">{model.accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Model Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Model Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accuracyData.slice(0, 4).map((model) => (
              <div key={model.model} className="p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-foreground">{model.model}</h5>
                  <Badge variant="outline" className="text-xs">
                    {model.accuracy.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAPE:</span>
                    <span className="text-foreground">{model.mape.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RMSE:</span>
                    <span className="text-foreground">{model.rmse.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predictions:</span>
                    <span className="text-foreground">{model.predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actuals:</span>
                    <span className="text-foreground">{model.actuals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">
              {topModel?.model || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Best Model</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <XCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-sm font-bold text-destructive">
              {worstModel?.model || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Needs Improvement</p>
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
          <h5 className="text-sm font-medium text-primary mb-2">💡 Forecast Accuracy Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average accuracy: {averageAccuracy.toFixed(1)}%</li>
            <li>• {accuracyData.filter(m => m.accuracy >= 80).length} models performing well (80%+)</li>
            <li>• {accuracyData.filter(m => m.trend === 'improving').length} models improving</li>
            <li>• {accuracyData.filter(m => m.trend === 'declining').length} models declining</li>
            <li>• Best model: {topModel?.model} ({topModel?.accuracy.toFixed(1)}%)</li>
            <li>• Needs attention: {worstModel?.model} ({worstModel?.accuracy.toFixed(1)}%)</li>
            {averageAccuracy >= 85 && (
              <li>• Overall accuracy is excellent - models performing well</li>
            )}
            {averageAccuracy < 80 && (
              <li>• Overall accuracy below target - consider model improvements</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ForecastAccuracy;





