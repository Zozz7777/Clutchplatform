"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
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
  const { t } = useLanguage();
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
        // Load real error data from backend APIs
        const [logsResponse, alertsResponse] = await Promise.all([
          productionApi.getSystemLogs(),
          productionApi.getSystemAlerts()
        ]);

        const logsData = Array.isArray(logsResponse?.data) ? logsResponse.data : [];
        const alertsData = Array.isArray(alertsResponse?.data) ? alertsResponse.data : [];
        
        // Transform logs and alerts into error data
        const errorLogs = logsData.filter((log: any) => log.level === 'error' || log.level === 'critical' || log.level === 'warning');
        const errorAlerts = alertsData.filter((alert: any) => alert.severity === 'high' || alert.severity === 'critical');
        
        // Group errors by type
        const errorGroups: Record<string, any[]> = {};
        
        errorLogs.forEach((log: any) => {
          const type = log.type || log.category || t('systemHealth.errors.systemError');
          if (!errorGroups[type]) errorGroups[type] = [];
          errorGroups[type].push(log);
        });
        
        errorAlerts.forEach((alert: any) => {
          const type = alert.type || alert.category || t('systemHealth.errors.systemAlert');
          if (!errorGroups[type]) errorGroups[type] = [];
          errorGroups[type].push(alert);
        });

        // Transform grouped data to component format
        const transformedErrors: ErrorData[] = Object.entries(errorGroups).map(([type, errors]) => {
          const count = errors.length;
          const severity = errors.some((e: any) => e.level === 'critical' || e.severity === 'critical') ? 'critical' : 
                          errors.some((e: any) => e.level === 'error' || e.severity === 'high') ? 'high' : 'medium';
          const lastOccurrence = errors.reduce((latest, error) => {
            const errorTime = new Date(error.timestamp || error.createdAt || 0);
            return errorTime > latest ? errorTime : latest;
          }, new Date(0));
          
          return {
            type,
            count,
            percentage: 0, // Will be calculated below
            trend: 'stable',
            severity,
            lastOccurrence: lastOccurrence.toISOString(),
            description: `Errors related to ${type.toLowerCase()}`
          };
        });

        const totalErrors = transformedErrors.reduce((sum, error) => sum + error.count, 0);
        const criticalErrors = transformedErrors.filter(e => e.severity === 'critical').reduce((sum, error) => sum + error.count, 0);
        const averageErrors = transformedErrors.length > 0 ? totalErrors / transformedErrors.length : 0;
        const trend = 'down'; // Default trend
        
        // Calculate percentages
        transformedErrors.forEach(error => {
          error.percentage = totalErrors > 0 ? (error.count / totalErrors) * 100 : 0;
        });

        setErrorData({
          errors: transformedErrors,
          totalErrors,
          criticalErrors,
          averageErrors,
          trend
        });
      } catch (error) {
        console.error('Failed to load error data:', error);
        // Fallback data on error
        setErrorData({
          errors: [],
          totalErrors: 0,
          criticalErrors: 0,
          averageErrors: 0,
          trend: 'stable'
        });
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
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
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
            <span>{t('systemHealth.widgets.errorDistribution')}</span>
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
            <span>{t('systemHealth.widgets.errorDistribution')}</span>
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
          <span>{t('systemHealth.widgets.errorDistribution')}</span>
        </CardTitle>
        <CardDescription>
          {t('systemHealth.widgetDescriptions.errorDistribution')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <Bug className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{errorData.totalErrors}</p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.totalErrors')}</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{errorData.criticalErrors}</p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.criticalErrors')}</p>
          </div>
        </div>

        {/* Error Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.errorTypes')}</h4>
          <div className="space-y-2">
            {(Array.isArray(errorData.errors) ? errorData.errors : []).map((error, index) => {
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
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.errorDistribution')}</h4>
          <div className="space-y-2">
            {(Array.isArray(errorData.errors) ? errorData.errors : []).map((error) => (
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
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.recentErrors')}</h4>
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
            {t('systemHealth.widgetLabels.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('systemHealth.widgetLabels.exportReport')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-primary mb-2">💡 Error Distribution Insights</h5>
          <ul className="text-xs text-primary space-y-1">
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





