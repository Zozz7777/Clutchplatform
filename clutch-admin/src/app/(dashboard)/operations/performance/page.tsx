'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Gauge
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  errorRate: {
    percentage: number;
    count: number;
    lastHour: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    averageResponseTime: number;
    requestCount: number;
    errorCount: number;
  }>;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAPIPerformance();
      
      if (response.success) {
        setMetrics(response.data);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <Badge variant="default" className="bg-green-500">Good</Badge>;
    if (value <= thresholds.warning) return <Badge variant="default" className="bg-yellow-500">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Performance Monitoring</h1>
          <p className="text-muted-foreground font-sans">
            Monitor API performance and system metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground font-sans">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchPerformanceMetrics} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {metrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-sans ${getPerformanceColor(metrics.responseTime.average, { good: 200, warning: 500 })}`}>
                    {metrics.responseTime.average}ms
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    {getPerformanceBadge(metrics.responseTime.average, { good: 200, warning: 500 })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">P95 Response Time</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-sans ${getPerformanceColor(metrics.responseTime.p95, { good: 300, warning: 1000 })}`}>
                    {metrics.responseTime.p95}ms
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    95th percentile
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Throughput</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {metrics.throughput.requestsPerSecond}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    requests/second
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-sans ${getPerformanceColor(metrics.errorRate.percentage, { good: 1, warning: 5 })}`}>
                    {metrics.errorRate.percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    {metrics.errorRate.count} errors
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Response Time Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">Average:</span>
                      <span className={`text-sm font-sans ${getPerformanceColor(metrics.responseTime.average, { good: 200, warning: 500 })}`}>
                        {metrics.responseTime.average}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">P95:</span>
                      <span className={`text-sm font-sans ${getPerformanceColor(metrics.responseTime.p95, { good: 300, warning: 1000 })}`}>
                        {metrics.responseTime.p95}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">P99:</span>
                      <span className={`text-sm font-sans ${getPerformanceColor(metrics.responseTime.p99, { good: 500, warning: 2000 })}`}>
                        {metrics.responseTime.p99}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">Max:</span>
                      <span className={`text-sm font-sans ${getPerformanceColor(metrics.responseTime.max, { good: 1000, warning: 5000 })}`}>
                        {metrics.responseTime.max}ms
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Throughput Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">Per Second:</span>
                      <span className="text-sm font-sans">{metrics.throughput.requestsPerSecond}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">Per Minute:</span>
                      <span className="text-sm font-sans">{metrics.throughput.requestsPerMinute.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">Per Hour:</span>
                      <span className="text-sm font-sans">{metrics.throughput.requestsPerHour.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Endpoint Performance</CardTitle>
                <CardDescription className="font-sans">
                  Performance metrics for individual API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-sans">
                          {endpoint.method}
                        </Badge>
                        <div>
                          <h3 className="font-medium font-sans">{endpoint.path}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {endpoint.requestCount.toLocaleString()} requests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-sm font-sans ${getPerformanceColor(endpoint.averageResponseTime, { good: 200, warning: 500 })}`}>
                            {endpoint.averageResponseTime}ms avg
                          </div>
                          <div className="text-xs text-muted-foreground font-sans">
                            {endpoint.errorCount} errors
                          </div>
                        </div>
                        {endpoint.errorCount > 0 ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 mx-auto text-green-500" />
                    <p className="text-sm text-muted-foreground font-sans mt-2">
                      Response time trending down
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      Average: {metrics.responseTime.average}ms
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Error Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    {metrics.errorRate.percentage < 1 ? (
                      <TrendingDown className="h-8 w-8 mx-auto text-green-500" />
                    ) : (
                      <TrendingUp className="h-8 w-8 mx-auto text-red-500" />
                    )}
                    <p className="text-sm text-muted-foreground font-sans mt-2">
                      Error rate: {metrics.errorRate.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {metrics.errorRate.lastHour} errors in last hour
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
