"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
// import { useTranslations } from '@/hooks/use-translations';
import { 
  AlertTriangle, 
  Bug, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Clock,
  Users
} from 'lucide-react';

interface ErrorDistributionProps {
  className?: string;
}

interface ErrorData {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastOccurrence: string;
  description: string;
}

export function ErrorDistribution({ className = '' }: ErrorDistributionProps) {
  const t = (key: string, params?: any) => key;
  const [errorData, setErrorData] = React.useState<{
    errors: ErrorData[];
    totalErrors: number;
    criticalErrors: number;
    averageErrors: number;
    trend: 'up' | 'down' | 'stable';
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadErrorData = async () => {
      try {
        // Load real error data from API
        const [errors, alerts, logs] = await Promise.all([
          productionApi.getErrors(),
          productionApi.getAlerts(),
          productionApi.getLogs()
        ]);

        // Transform API data to component format
        const transformedErrors: ErrorData[] = errors.map((error: any, index: number) => ({
          type: error.type || 'Unknown Error',
          count: error.count || 0,
          percentage: error.percentage || 0,
          trend: error.trend || 'stable',
          severity: error.severity || 'medium',
          lastOccurrence: error.lastOccurrence || new Date().toISOString(),
          description: error.description || 'Error occurred in the system'
        }));

        const totalErrors = transformedErrors.reduce((sum, error) => sum + error.count, 0);
        const criticalErrors = transformedErrors.filter(e => e.severity === 'critical').reduce((sum, error) => sum + error.count, 0);
        const averageErrors = totalErrors / transformedErrors.length;
        const trend = transformedErrors.filter(e => e.trend === 'up').length > transformedErrors.filter(e => e.trend === 'down').length ? 'up' : 'down';

        setErrorData({
          errors: transformedErrors,
          totalErrors,
          criticalErrors,
          averageErrors,
          trend
        });
      } catch (error) {
        // Failed to load error distribution data
      } finally {
        setIsLoading(false);
      }
    };

    loadErrorData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-red-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
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
      case 'up': return 'text-destructive';
      case 'down': return 'text-success';
      default: return 'text-muted-foreground';
    }
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
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Error Distribution</span>
          </CardTitle>
          <CardDescription>Loading error distribution data...</CardDescription>
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

  if (!errorData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Error Distribution</span>
          </CardTitle>
          <CardDescription>Unable to load error distribution data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span>Error Distribution</span>
        </CardTitle>
        <CardDescription>
          Types of errors (auth, payment, fleet)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <Bug className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{errorData.totalErrors}</p>
            <p className="text-xs text-muted-foreground">Total Errors</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{errorData.criticalErrors}</p>
            <p className="text-xs text-muted-foreground">Critical Errors</p>
          </div>
        </div>

        {/* Error Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Error Types</h4>
          <div className="space-y-2">
            {errorData.errors.map((error, index) => {
              const TrendIcon = getTrendIcon(error.trend);
              
              return (
                <div key={error.type} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-full">
                      <span className="text-sm font-semibold text-destructive">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{error.type}</p>
                      <p className="text-xs text-muted-foreground">{error.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">{error.count}</p>
                      <Badge className={getSeverityBadge(error.severity)}>
                        {error.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(error.trend)}`} />
                      <span className={`text-xs ${getTrendColor(error.trend)}`}>
                        {error.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Distribution Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Error Distribution</h4>
          <div className="space-y-2">
            {errorData.errors.map((error) => (
              <div key={error.type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{error.type}</span>
                  <span className="text-foreground font-medium">{error.percentage}%</span>
                </div>
                <Progress value={error.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Errors</h4>
          <div className="space-y-2">
            {errorData.errors
              .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
              .slice(0, 3)
              .map((error) => (
                <div key={error.type} className="flex items-center justify-between p-2 bg-muted/50 rounded-[0.625rem]">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-foreground">{error.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityBadge(error.severity)}>
                      {error.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatTime(error.lastOccurrence)}</span>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Error Distribution Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total errors: {errorData.totalErrors}</li>
            <li>• Critical errors: {errorData.criticalErrors}</li>
            <li>• Average errors per type: {errorData.averageErrors.toFixed(0)}</li>
            <li>• Top error type: {errorData.errors[0]?.type} ({errorData.errors[0]?.percentage}%)</li>
            <li>• Overall trend: {errorData.trend}</li>
            {errorData.criticalErrors > 0 && (
              <li>• {errorData.criticalErrors} critical errors need immediate attention</li>
            )}
            {errorData.trend === 'up' && (
              <li>• Error trend is increasing - investigate root causes</li>
            )}
            {errorData.trend === 'down' && (
              <li>• Error trend is decreasing - good progress</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ErrorDistribution;





