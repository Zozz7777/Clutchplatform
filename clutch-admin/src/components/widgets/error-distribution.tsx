"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
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
        // Simulate error distribution data
        const errors: ErrorData[] = [
          {
            type: 'Authentication',
            count: 45,
            percentage: 35,
            trend: 'down',
            severity: 'high',
            lastOccurrence: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: 'Failed login attempts and token validation errors'
          },
          {
            type: 'Payment',
            count: 28,
            percentage: 22,
            trend: 'up',
            severity: 'critical',
            lastOccurrence: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            description: 'Payment processing and billing errors'
          },
          {
            type: 'Fleet',
            count: 22,
            percentage: 17,
            trend: 'stable',
            severity: 'medium',
            lastOccurrence: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            description: 'Vehicle tracking and fleet management errors'
          },
          {
            type: 'API',
            count: 18,
            percentage: 14,
            trend: 'down',
            severity: 'medium',
            lastOccurrence: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            description: 'API endpoint and integration errors'
          },
          {
            type: 'Database',
            count: 15,
            percentage: 12,
            trend: 'up',
            severity: 'critical',
            lastOccurrence: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            description: 'Database connection and query errors'
          }
        ];

        const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
        const criticalErrors = errors.filter(e => e.severity === 'critical').reduce((sum, error) => sum + error.count, 0);
        const averageErrors = totalErrors / errors.length;
        const trend = errors.filter(e => e.trend === 'up').length > errors.filter(e => e.trend === 'down').length ? 'up' : 'down';

        setErrorData({
          errors,
          totalErrors,
          criticalErrors,
          averageErrors,
          trend
        });
      } catch (error) {
        console.error('Failed to load error distribution data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadErrorData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
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
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Error Distribution</span>
          </CardTitle>
          <CardDescription>Loading error distribution data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-2/3"></div>
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
            <AlertTriangle className="h-5 w-5 text-red-600" />
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
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Error Distribution</span>
        </CardTitle>
        <CardDescription>
          Types of errors (auth, payment, fleet)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <Bug className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{errorData.totalErrors}</p>
            <p className="text-xs text-gray-500">Total Errors</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{errorData.criticalErrors}</p>
            <p className="text-xs text-gray-500">Critical Errors</p>
          </div>
        </div>

        {/* Error Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Error Types</h4>
          <div className="space-y-2">
            {errorData.errors.map((error, index) => {
              const TrendIcon = getTrendIcon(error.trend);
              
              return (
                <div key={error.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg-lg-full">
                      <span className="text-sm font-semibold text-red-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{error.type}</p>
                      <p className="text-xs text-gray-500">{error.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">{error.count}</p>
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
          <h4 className="text-sm font-medium text-gray-900">Error Distribution</h4>
          <div className="space-y-2">
            {errorData.errors.map((error) => (
              <div key={error.type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{error.type}</span>
                  <span className="text-gray-900 font-medium">{error.percentage}%</span>
                </div>
                <Progress value={error.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Recent Errors</h4>
          <div className="space-y-2">
            {errorData.errors
              .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
              .slice(0, 3)
              .map((error) => (
                <div key={error.type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg-lg">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-700">{error.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityBadge(error.severity)}>
                      {error.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTime(error.lastOccurrence)}</span>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
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
