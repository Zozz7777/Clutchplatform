"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
        console.error('Failed to load forecast accuracy data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadForecastAccuracy();
  }, []);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-100 text-green-800';
    if (accuracy >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-green-100 text-green-800';
      case 'declining': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Target className="h-5 w-5 text-blue-600" />
            <span>Forecast Accuracy</span>
          </CardTitle>
          <CardDescription>Loading forecast accuracy data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <Target className="h-5 w-5 text-blue-600" />
          <span>Forecast Accuracy</span>
        </CardTitle>
        <CardDescription>
          Compare AI predictions vs actual results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              {averageAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Avg Accuracy</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              {accuracyData.filter(m => m.accuracy >= 80).length}
            </p>
            <p className="text-xs text-gray-500">Good Models</p>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getAccuracyColor(averageAccuracy)}`} />
            <span className={`text-2xl font-bold ${getAccuracyColor(averageAccuracy)}`}>
              {averageAccuracy.toFixed(1)}%
            </span>
            <Badge className={getAccuracyBadge(averageAccuracy)}>
              {getAccuracyLevel(averageAccuracy)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Overall Forecast Accuracy</p>
          <div className="mt-3">
            <Progress value={averageAccuracy} className="h-2" />
          </div>
        </div>

        {/* Model Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Model Performance</h4>
          <div className="space-y-2">
            {accuracyData.map((model, index) => {
              const TrendIcon = getTrendIcon(model.trend);
              
              return (
                <div key={model.model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{model.model}</p>
                      <p className="text-xs text-gray-500">{model.description}</p>
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
          <h4 className="text-sm font-medium text-gray-900">Accuracy Distribution</h4>
          <div className="space-y-2">
            {accuracyData.map((model) => (
              <div key={model.model} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{model.model}</span>
                  <span className="text-gray-900 font-medium">{model.accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Model Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Model Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accuracyData.slice(0, 4).map((model) => (
              <div key={model.model} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">{model.model}</h5>
                  <Badge variant="outline" className="text-xs">
                    {model.accuracy.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">MAPE:</span>
                    <span className="text-gray-900">{model.mape.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">RMSE:</span>
                    <span className="text-gray-900">{model.rmse.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Predictions:</span>
                    <span className="text-gray-900">{model.predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actuals:</span>
                    <span className="text-gray-900">{model.actuals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-600">
              {topModel?.model || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Best Model</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-red-600">
              {worstModel?.model || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Needs Improvement</p>
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
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Forecast Accuracy Insights</h5>
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
