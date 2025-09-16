'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface APIAnalytics {
  totalRequests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{
    path: string;
    method: string;
    requests: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  userAgents: Array<{
    userAgent: string;
    count: number;
    percentage: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    requests: number;
    errors: number;
    avgResponseTime: number;
  }>;
  statusCodes: Array<{
    code: number;
    count: number;
    percentage: number;
  }>;
}

export default function APIAnalyticsPage() {
  const [analytics, setAnalytics] = useState<APIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAPIAnalytics = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getAPIAnalytics();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching API analytics:', error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportData = async () => {
    try {
      const exportData = await productionApi.exportAPIAnalytics();
      // Handle export functionality
      console.log('Exporting API analytics data:', exportData);
    } catch (error) {
      console.error('Error exporting API analytics:', error);
    }
  };
  
  const handleConfigureMonitoring = async () => {
    try {
      // Implementation for configuring monitoring
      console.log('Configuring API monitoring...');
    } catch (error) {
      console.error('Error configuring monitoring:', error);
    }
  };

  useEffect(() => {
    fetchAPIAnalytics();
    const interval = setInterval(fetchAPIAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-500';
    if (code >= 300 && code < 400) return 'text-blue-500';
    if (code >= 400 && code < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (userAgent.includes('Macintosh') || userAgent.includes('Windows')) {
      return <Monitor className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading API analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">API Analytics</h1>
          <p className="text-muted-foreground font-sans">
            Monitor API usage patterns and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground font-sans">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleExportData} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleConfigureMonitoring} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button onClick={fetchAPIAnalytics} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {analytics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="status">Status Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {analytics.totalRequests.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    All time requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Unique Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {analytics.uniqueUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Active users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {analytics.averageResponseTime}ms
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Response time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {analytics.errorRate}%
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Error percentage
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Hourly Request Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.hourlyStats.slice(0, 8).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-sans">{stat.hour}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(stat.requests / 5000) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-sans w-16 text-right">{stat.requests}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Response Time Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 mx-auto text-green-500" />
                    <p className="text-sm text-muted-foreground font-sans mt-2">
                      Average response time: {analytics.averageResponseTime}ms
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      Trending down by 5% this week
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Top Endpoints</CardTitle>
                <CardDescription className="font-sans">
                  Most frequently accessed API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-sans">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <h3 className="font-medium font-sans">{endpoint.path}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {endpoint.requests.toLocaleString()} requests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-sans">
                            {endpoint.avgResponseTime}ms avg
                          </div>
                          <div className="text-xs text-muted-foreground font-sans">
                            {endpoint.errorRate}% error rate
                          </div>
                        </div>
                        {endpoint.errorRate < 1 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">User Agent Distribution</CardTitle>
                <CardDescription className="font-sans">
                  Breakdown of requests by device and browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userAgents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(agent.userAgent)}
                        <div>
                          <h3 className="font-medium font-sans">
                            {agent.userAgent.includes('iPhone') ? 'iPhone' :
                             agent.userAgent.includes('Android') ? 'Android' :
                             agent.userAgent.includes('Macintosh') ? 'macOS' :
                             agent.userAgent.includes('Windows') ? 'Windows' : 'Other'}
                          </h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {agent.count.toLocaleString()} requests
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-sans">
                          {agent.percentage}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${agent.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">HTTP Status Codes</CardTitle>
                <CardDescription className="font-sans">
                  Distribution of response status codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.statusCodes.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className={`font-sans ${getStatusColor(status.code)}`}
                        >
                          {status.code}
                        </Badge>
                        <div>
                          <h3 className="font-medium font-sans">
                            {status.code === 200 ? 'Success' :
                             status.code === 400 ? 'Bad Request' :
                             status.code === 401 ? 'Unauthorized' :
                             status.code === 404 ? 'Not Found' :
                             status.code === 500 ? 'Server Error' : 'Other'}
                          </h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {status.count.toLocaleString()} responses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-sans">
                          {status.percentage}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              status.code >= 200 && status.code < 300 ? 'bg-green-500' :
                              status.code >= 300 && status.code < 400 ? 'bg-blue-500' :
                              status.code >= 400 && status.code < 500 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${status.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
