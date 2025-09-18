"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface RootCauseTimelineProps {
  className?: string;
}

interface RootCause {
  id: string;
  category: string;
  description: string;
  incidents: number;
  frequency: number;
  lastOccurrence: string;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}

export function RootCauseTimeline({ className = '' }: RootCauseTimelineProps) {
  const [rootCauseData, setRootCauseData] = React.useState<{
    causes: RootCause[];
    totalIncidents: number;
    averageResolution: number;
    topCause: RootCause | null;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRootCauseData = async () => {
      try {
        // Simulate root cause analysis data
        const causes: RootCause[] = [
          {
            id: '1',
            category: 'Infrastructure',
            description: 'Server overload and resource exhaustion',
            incidents: 12,
            frequency: 35,
            lastOccurrence: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'down',
            severity: 'high',
            resolution: 'Auto-scaling configuration updated'
          },
          {
            id: '2',
            category: 'Database',
            description: 'Connection pool exhaustion and query timeouts',
            incidents: 8,
            frequency: 23,
            lastOccurrence: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'up',
            severity: 'critical',
            resolution: 'Connection pool size increased'
          },
          {
            id: '3',
            category: 'Third-party API',
            description: 'External service failures and rate limiting',
            incidents: 6,
            frequency: 18,
            lastOccurrence: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'stable',
            severity: 'medium',
            resolution: 'Circuit breaker pattern implemented'
          },
          {
            id: '4',
            category: 'Code Deployment',
            description: 'Failed deployments and configuration errors',
            incidents: 4,
            frequency: 12,
            lastOccurrence: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'down',
            severity: 'medium',
            resolution: 'Deployment pipeline improved'
          },
          {
            id: '5',
            category: 'Network',
            description: 'DNS resolution and connectivity issues',
            incidents: 3,
            frequency: 9,
            lastOccurrence: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'down',
            severity: 'low',
            resolution: 'DNS failover configured'
          },
          {
            id: '6',
            category: 'Security',
            description: 'Authentication and authorization failures',
            incidents: 2,
            frequency: 6,
            lastOccurrence: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            trend: 'stable',
            severity: 'high',
            resolution: 'Security policies updated'
          }
        ];

        const totalIncidents = causes.reduce((sum, cause) => sum + cause.incidents, 0);
        const averageResolution = 45; // Simulated average resolution time in minutes
        const topCause = causes.reduce((top, cause) => cause.incidents > top.incidents ? cause : top, causes[0]);

        setRootCauseData({
          causes,
          totalIncidents,
          averageResolution,
          topCause
        });
      } catch (error) {
        console.error('Failed to load root cause data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRootCauseData();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Root Cause Timeline</span>
          </CardTitle>
          <CardDescription>Loading root cause analysis data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rootCauseData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Root Cause Timeline</span>
          </CardTitle>
          <CardDescription>Unable to load root cause analysis data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-blue-600" />
          <span>Root Cause Timeline</span>
        </CardTitle>
        <CardDescription>
          Automatically clusters incidents into causes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg">
            <AlertTriangle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{rootCauseData.totalIncidents}</p>
            <p className="text-xs text-gray-500">Total Incidents</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg-lg">
            <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{rootCauseData.averageResolution}m</p>
            <p className="text-xs text-gray-500">Avg Resolution</p>
          </div>
        </div>

        {/* Top Root Cause */}
        {rootCauseData.topCause && (
          <div className="text-center p-4 bg-gray-50 rounded-lg-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold text-gray-900">{rootCauseData.topCause.category}</span>
              <Badge className={getSeverityBadge(rootCauseData.topCause.severity)}>
                {rootCauseData.topCause.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{rootCauseData.topCause.description}</p>
            <div className="mt-3">
              <Progress value={rootCauseData.topCause.frequency} className="h-2" />
            </div>
          </div>
        )}

        {/* Root Causes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Root Causes</h4>
          <div className="space-y-2">
            {rootCauseData.causes.map((cause, index) => {
              const TrendIcon = getTrendIcon(cause.trend);
              
              return (
                <div key={cause.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg-full">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cause.category}</p>
                      <p className="text-xs text-gray-500">{cause.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">{cause.incidents}</p>
                      <Badge className={getSeverityBadge(cause.severity)}>
                        {cause.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(cause.trend)}`} />
                      <span className={`text-xs ${getTrendColor(cause.trend)}`}>
                        {cause.frequency}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Frequency Distribution</h4>
          <div className="space-y-2">
            {rootCauseData.causes.map((cause) => (
              <div key={cause.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{cause.category}</span>
                  <span className="text-gray-900 font-medium">{cause.frequency}%</span>
                </div>
                <Progress value={cause.frequency} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Recent Resolutions</h4>
          <div className="space-y-2">
            {rootCauseData.causes
              .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime())
              .slice(0, 3)
              .map((cause) => (
                <div key={cause.id} className="p-3 bg-gray-50 rounded-lg-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">{cause.category}</h5>
                    <Badge className={getSeverityBadge(cause.severity)}>
                      {cause.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{cause.description}</p>
                  <p className="text-xs text-green-600 mb-1">Resolution: {cause.resolution}</p>
                  <p className="text-xs text-gray-500">Last occurrence: {formatDate(cause.lastOccurrence)}</p>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Root Cause Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total incidents analyzed: {rootCauseData.totalIncidents}</li>
            <li>• {rootCauseData.causes.length} root causes identified</li>
            <li>• Average resolution time: {rootCauseData.averageResolution} minutes</li>
            <li>• Top cause: {rootCauseData.topCause?.category} ({rootCauseData.topCause?.frequency}%)</li>
            <li>• {rootCauseData.causes.filter(c => c.severity === 'critical').length} critical causes</li>
            <li>• {rootCauseData.causes.filter(c => c.trend === 'down').length} causes trending down</li>
            {rootCauseData.topCause && rootCauseData.topCause.frequency > 30 && (
              <li>• {rootCauseData.topCause.category} is the primary cause - focus prevention efforts</li>
            )}
            {rootCauseData.causes.filter(c => c.trend === 'up').length > 0 && (
              <li>• Some causes trending up - monitor closely</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RootCauseTimeline;
