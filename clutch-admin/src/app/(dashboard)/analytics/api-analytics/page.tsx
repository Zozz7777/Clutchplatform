'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Zap,
  Database
} from 'lucide-react';

interface ApiAnalytics {
  id: string;
  endpoint: string;
  method: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  lastUsed: string;
  status: 'healthy' | 'warning' | 'critical';
  usage: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
}

interface ApiUsage {
  endpoint: string;
  method: string;
  requests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorCount: number;
  lastAccess: string;
}

export default function ApiAnalyticsPage() {
  const [apiAnalytics, setApiAnalytics] = useState<ApiAnalytics[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApiAnalyticsData();
  }, [timeRange]);

  const loadApiAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load API analytics
      const analyticsResponse = await fetch(`/api/v1/analytics/api?timeRange=${timeRange}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setApiAnalytics(analyticsData.data || []);
      }
      
      // Load API usage data
      const usageResponse = await fetch(`/api/v1/analytics/api/usage?timeRange=${timeRange}`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setApiUsage(usageData.data || []);
      }
    } catch (error) {
      console.error('Failed to load API analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const filteredAnalytics = apiAnalytics.filter(item => {
    const matchesSearch = item.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.method.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">API Analytics</h1>
          <p className="text-gray-600">Monitor API usage, performance, and health metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button onClick={loadApiAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {apiAnalytics.reduce((sum, api) => sum + api.totalRequests, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(apiAnalytics.reduce((sum, api) => sum + api.successRate, 0) / apiAnalytics.length || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatResponseTime(apiAnalytics.reduce((sum, api) => sum + api.averageResponseTime, 0) / apiAnalytics.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(apiAnalytics.reduce((sum, api) => sum + api.errorRate, 0) / apiAnalytics.length || 0).toFixed(1)}%
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
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>API Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">API performance chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Most Used Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiAnalytics
                    .sort((a, b) => b.totalRequests - a.totalRequests)
                    .slice(0, 5)
                    .map((api) => (
                    <div key={api.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getMethodColor(api.method)}>
                            {api.method}
                          </Badge>
                          <span className="font-medium text-sm">{api.endpoint}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {api.totalRequests.toLocaleString()} requests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatResponseTime(api.averageResponseTime)}
                        </p>
                        <Badge className={getStatusColor(api.status)}>
                          {api.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Endpoint</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Requests</th>
                      <th className="text-left py-3 px-4">Success Rate</th>
                      <th className="text-left py-3 px-4">Response Time</th>
                      <th className="text-left py-3 px-4">Error Rate</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalytics.map((api) => (
                      <tr key={api.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{api.endpoint}</td>
                        <td className="py-3 px-4">
                          <Badge className={getMethodColor(api.method)}>
                            {api.method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{api.totalRequests.toLocaleString()}</td>
                        <td className="py-3 px-4">{api.successRate.toFixed(1)}%</td>
                        <td className="py-3 px-4">{formatResponseTime(api.averageResponseTime)}</td>
                        <td className="py-3 px-4">{api.errorRate.toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(api.status)}>
                            {api.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(api.lastUsed).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Endpoint</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Requests</th>
                      <th className="text-left py-3 px-4">Unique Users</th>
                      <th className="text-left py-3 px-4">Avg Response Time</th>
                      <th className="text-left py-3 px-4">Errors</th>
                      <th className="text-left py-3 px-4">Last Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiUsage.map((usage, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{usage.endpoint}</td>
                        <td className="py-3 px-4">
                          <Badge className={getMethodColor(usage.method)}>
                            {usage.method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{usage.requests.toLocaleString()}</td>
                        <td className="py-3 px-4">{usage.uniqueUsers.toLocaleString()}</td>
                        <td className="py-3 px-4">{formatResponseTime(usage.averageResponseTime)}</td>
                        <td className="py-3 px-4">
                          <span className={usage.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
                            {usage.errorCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(usage.lastAccess).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
