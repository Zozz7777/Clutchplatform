"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';

interface IntegrationHealthProps {
  className?: string;
}

interface Integration {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  errorRate: number;
  type: string;
}

export function IntegrationHealth({ className = '' }: IntegrationHealthProps) {
  const [integrationData, setIntegrationData] = React.useState<{
    integrations: Integration[];
    totalIntegrations: number;
    healthyIntegrations: number;
    averageUptime: number;
    averageResponseTime: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIntegrationData = async () => {
      try {
        // Simulate integration health data
        const integrations: Integration[] = [
          {
            name: 'Payment Gateway',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 150,
            lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            errorRate: 0.1,
            type: 'Payment'
          },
          {
            name: 'Fleet Tracking API',
            status: 'healthy',
            uptime: 99.8,
            responseTime: 200,
            lastCheck: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            errorRate: 0.2,
            type: 'Fleet'
          },
          {
            name: 'Email Service',
            status: 'degraded',
            uptime: 98.5,
            responseTime: 500,
            lastCheck: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            errorRate: 1.5,
            type: 'Communication'
          },
          {
            name: 'SMS Gateway',
            status: 'healthy',
            uptime: 99.7,
            responseTime: 300,
            lastCheck: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
            errorRate: 0.3,
            type: 'Communication'
          },
          {
            name: 'Analytics API',
            status: 'down',
            uptime: 95.2,
            responseTime: 2000,
            lastCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            errorRate: 4.8,
            type: 'Analytics'
          },
          {
            name: 'Database Connection',
            status: 'healthy',
            uptime: 99.95,
            responseTime: 50,
            lastCheck: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            errorRate: 0.05,
            type: 'Database'
          }
        ];

        const totalIntegrations = integrations.length;
        const healthyIntegrations = integrations.filter(i => i.status === 'healthy').length;
        const averageUptime = integrations.reduce((sum, i) => sum + i.uptime, 0) / integrations.length;
        const averageResponseTime = integrations.reduce((sum, i) => sum + i.responseTime, 0) / integrations.length;

        setIntegrationData({
          integrations,
          totalIntegrations,
          healthyIntegrations,
          averageUptime,
          averageResponseTime
        });
      } catch (error) {
        console.error('Failed to load integration health data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrationData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success/10 text-green-800';
      case 'degraded': return 'bg-warning/10 text-yellow-800';
      case 'down': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'down': return XCircle;
      default: return Activity;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-primary" />
            <span>Integration Health</span>
          </CardTitle>
          <CardDescription>Loading integration health data...</CardDescription>
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

  if (!integrationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-primary" />
            <span>Integration Health</span>
          </CardTitle>
          <CardDescription>Unable to load integration health data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Link className="h-5 w-5 text-primary" />
          <span>Integration Health</span>
        </CardTitle>
        <CardDescription>
          3rd-party API success/error rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Link className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{integrationData.totalIntegrations}</p>
            <p className="text-xs text-muted-foreground">Total Integrations</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{integrationData.healthyIntegrations}</p>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </div>
        </div>

        {/* Average Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
            <Target className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-muted-foreground">
              {integrationData.averageUptime.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Uptime</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
            <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-muted-foreground">
              {integrationData.averageResponseTime.toFixed(0)}ms
            </p>
            <p className="text-xs text-muted-foreground">Avg Response</p>
          </div>
        </div>

        {/* Integration Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Integration Status</h4>
          <div className="space-y-2">
            {integrationData.integrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <div key={integration.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-[0.625rem]-full ${
                      integration.status === 'healthy' ? 'bg-success/10' :
                      integration.status === 'degraded' ? 'bg-warning/10' : 'bg-destructive/10'
                    }`}>
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(integration.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.type} • Last check: {formatTime(integration.lastCheck)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {integration.uptime.toFixed(1)}% uptime
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Performance Metrics</h4>
          <div className="space-y-2">
            {integrationData.integrations.map((integration) => (
              <div key={integration.name} className="p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-foreground">{integration.name}</h5>
                  <Badge className={getStatusBadge(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="text-foreground">{integration.uptime.toFixed(1)}%</span>
                  </div>
                  <Progress value={integration.uptime} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="text-foreground">{integration.responseTime}ms</span>
                  </div>
                  <Progress value={Math.min((integration.responseTime / 1000) * 100, 100)} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className="text-foreground">{integration.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={integration.errorRate} className="h-1" />
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Integration Health Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total integrations: {integrationData.totalIntegrations}</li>
            <li>• Healthy integrations: {integrationData.healthyIntegrations}</li>
            <li>• Average uptime: {integrationData.averageUptime.toFixed(1)}%</li>
            <li>• Average response time: {integrationData.averageResponseTime.toFixed(0)}ms</li>
            <li>• {integrationData.integrations.filter(i => i.status === 'down').length} integrations down</li>
            <li>• {integrationData.integrations.filter(i => i.status === 'degraded').length} integrations degraded</li>
            {integrationData.integrations.filter(i => i.status === 'down').length > 0 && (
              <li>• Some integrations are down - check connectivity</li>
            )}
            {integrationData.averageUptime >= 99 && (
              <li>• Excellent overall integration health</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default IntegrationHealth;
