"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ChurnAdjustedForecastProps {
  className?: string;
}

interface ForecastData {
  period: string;
  baseRevenue: number;
  churnImpact: number;
  adjustedRevenue: number;
  churnRate: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export function ChurnAdjustedForecast({ className = '' }: ChurnAdjustedForecastProps) {
  const [forecastData, setForecastData] = React.useState<{
    forecasts: ForecastData[];
    totalBaseRevenue: number;
    totalAdjustedRevenue: number;
    averageChurnRate: number;
    confidenceScore: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadForecastData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate churn-adjusted forecast data
        const forecasts: ForecastData[] = [
          {
            period: 'Q1 2024',
            baseRevenue: 450000,
            churnImpact: -25000,
            adjustedRevenue: 425000,
            churnRate: 5.5,
            confidence: 85,
            trend: 'up'
          },
          {
            period: 'Q2 2024',
            baseRevenue: 480000,
            churnImpact: -30000,
            adjustedRevenue: 450000,
            churnRate: 6.2,
            confidence: 82,
            trend: 'up'
          },
          {
            period: 'Q3 2024',
            baseRevenue: 520000,
            churnImpact: -35000,
            adjustedRevenue: 485000,
            churnRate: 6.7,
            confidence: 78,
            trend: 'stable'
          },
          {
            period: 'Q4 2024',
            baseRevenue: 550000,
            churnImpact: -40000,
            adjustedRevenue: 510000,
            churnRate: 7.3,
            confidence: 75,
            trend: 'down'
          }
        ];

        const totalBaseRevenue = forecasts.reduce((sum, f) => sum + f.baseRevenue, 0);
        const totalAdjustedRevenue = forecasts.reduce((sum, f) => sum + f.adjustedRevenue, 0);
        const averageChurnRate = forecasts.reduce((sum, f) => sum + f.churnRate, 0) / forecasts.length;
        const confidenceScore = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

        setForecastData({
          forecasts,
          totalBaseRevenue,
          totalAdjustedRevenue,
          averageChurnRate,
          confidenceScore
        });
      } catch (error) {
        // Failed to load churn-adjusted forecast data
      } finally {
        setIsLoading(false);
      }
    };

    loadForecastData();
  }, []);

  const getChurnColor = (rate: number) => {
    if (rate <= 5) return 'text-success';
    if (rate <= 7) return 'text-warning';
    return 'text-destructive';
  };

  const getChurnBadge = (rate: number) => {
    if (rate <= 5) return 'bg-success/10 text-green-800';
    if (rate <= 7) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getChurnLevel = (rate: number) => {
    if (rate <= 5) return 'Low';
    if (rate <= 7) return 'Medium';
    return 'High';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-success/10 text-green-800';
    if (confidence >= 70) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
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
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Churn-Adjusted Revenue Forecast</span>
          </CardTitle>
          <CardDescription>Loading forecast data...</CardDescription>
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

  if (!forecastData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Churn-Adjusted Revenue Forecast</span>
          </CardTitle>
          <CardDescription>Unable to load forecast data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Churn-Adjusted Revenue Forecast</span>
        </CardTitle>
        <CardDescription>
          Projections factoring churn rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              ${forecastData.totalAdjustedRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Adjusted Revenue</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">
              {forecastData.averageChurnRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Churn Rate</p>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-6 w-6 text-destructive" />
            <span className="text-2xl font-bold text-destructive">
              ${(forecastData.totalBaseRevenue - forecastData.totalAdjustedRevenue).toLocaleString()}
            </span>
            <Badge className="bg-destructive/10 text-red-800">
              Churn Impact
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Total Revenue Impact from Churn</p>
          <div className="mt-3">
            <Progress value={((forecastData.totalBaseRevenue - forecastData.totalAdjustedRevenue) / forecastData.totalBaseRevenue) * 100} className="h-2" />
          </div>
        </div>

        {/* Forecast Periods */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Forecast by Period</h4>
          <div className="space-y-2">
            {forecastData.forecasts.map((forecast) => {
              const TrendIcon = getTrendIcon(forecast.trend);
              
              return (
                <div key={forecast.period} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        {forecast.period.split(' ')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{forecast.period}</p>
                      <p className="text-xs text-muted-foreground">
                        Base: ${forecast.baseRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">
                        ${forecast.adjustedRevenue.toLocaleString()}
                      </p>
                      <Badge className={getChurnBadge(forecast.churnRate)}>
                        {forecast.churnRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(forecast.trend)}`} />
                      <span className={`text-xs ${getTrendColor(forecast.trend)}`}>
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Churn Rate Trends */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Churn Rate Trends</h4>
          <div className="space-y-2">
            {forecastData.forecasts.map((forecast) => (
              <div key={forecast.period} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{forecast.period}</span>
                  <span className="text-foreground font-medium">{forecast.churnRate.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(forecast.churnRate * 10, 100)} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-5 w-5 ${getConfidenceColor(forecastData.confidenceScore)}`} />
            <span className={`text-lg font-bold ${getConfidenceColor(forecastData.confidenceScore)}`}>
              {forecastData.confidenceScore.toFixed(0)}%
            </span>
            <Badge className={getConfidenceBadge(forecastData.confidenceScore)}>
              Confidence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Overall Forecast Confidence</p>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Churn-Adjusted Forecast Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total adjusted revenue: ${forecastData.totalAdjustedRevenue.toLocaleString()}</li>
            <li>• Churn impact: ${(forecastData.totalBaseRevenue - forecastData.totalAdjustedRevenue).toLocaleString()}</li>
            <li>• Average churn rate: {forecastData.averageChurnRate.toFixed(1)}%</li>
            <li>• Forecast confidence: {forecastData.confidenceScore.toFixed(0)}%</li>
            <li>• {forecastData.forecasts.length} quarters forecasted</li>
            {forecastData.averageChurnRate > 7 && (
              <li>• High churn rate - focus on retention strategies</li>
            )}
            {forecastData.confidenceScore < 75 && (
              <li>• Low confidence - consider improving data quality</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChurnAdjustedForecast;




