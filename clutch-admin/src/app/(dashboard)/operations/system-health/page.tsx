'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Server, 
  Database, 
  Network, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

interface HealthCheck {
  id: string;
  name: string;
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: string;
  uptime: number;
  errorRate: number;
  details: {
    version?: string;
    environment?: string;
    dependencies?: string[];
  };
}

interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down';
  services: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
  uptime: number;
  lastIncident?: {
    id: string;
    description: string;
    timestamp: string;
    resolved: boolean;
  };
}

export default function SystemHealthPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSystemHealthData = async () => {
    try {
      setIsLoading(true);
      
      // Load health checks
      const healthResponse = await fetch('/api/v1/operations/system-health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthChecks(healthData.data || []);
      }
      
      // Load system status
      const statusResponse = await fetch('/api/v1/operations/system-health/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData.data || null);
      }
    } catch (error) {
      console.error('Failed to load system health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system health, service status, and uptime metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          <Button onClick={loadSystemHealthData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {systemStatus && (
        <Card className={`border-l-4 ${
          systemStatus.overall === 'healthy' ? 'border-green-500' :
          systemStatus.overall === 'degraded' ? 'border-yellow-500' :
          'border-red-500'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(systemStatus.overall)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    System Status: <span className={getOverallStatusColor(systemStatus.overall)}>
                      {systemStatus.overall.toUpperCase()}
                    </span>
                  </h2>
                  <p className="text-gray-600">
                    Uptime: {formatUptime(systemStatus.uptime)} | 
                    Services: {systemStatus.services.healthy}/{systemStatus.services.total} healthy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {((systemStatus.services.healthy / systemStatus.services.total) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Service Health</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.services.healthy || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Degraded Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.services.degraded || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Down Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus?.services.down || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus ? formatUptime(systemStatus.uptime) : '0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Service Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Health status chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Health Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthChecks.slice(0, 5).map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-xs text-gray-500">{check.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatResponseTime(check.responseTime)}</p>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Service</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Response Time</th>
                      <th className="text-left py-3 px-4">Uptime</th>
                      <th className="text-left py-3 px-4">Error Rate</th>
                      <th className="text-left py-3 px-4">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthChecks.map((check) => (
                      <tr key={check.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{check.service}</td>
                        <td className="py-3 px-4">{check.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(check.status)}
                            <Badge className={getStatusColor(check.status)}>
                              {check.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatResponseTime(check.responseTime)}</td>
                        <td className="py-3 px-4">{formatUptime(check.uptime)}</td>
                        <td className="py-3 px-4">{check.errorRate.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(check.lastChecked).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {systemStatus?.lastIncident ? (
                <div className={`p-4 rounded-lg border-l-4 ${
                  systemStatus.lastIncident.resolved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={systemStatus.lastIncident.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {systemStatus.lastIncident.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                        <span className="text-sm text-gray-500">Incident #{systemStatus.lastIncident.id}</span>
                      </div>
                      <p className="font-medium text-gray-900">{systemStatus.lastIncident.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(systemStatus.lastIncident.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!systemStatus.lastIncident.resolved && (
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No recent incidents</p>
                  <p className="text-sm text-gray-400">All systems are operating normally</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
