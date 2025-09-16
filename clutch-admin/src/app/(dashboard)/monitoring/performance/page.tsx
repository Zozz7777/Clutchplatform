'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function MonitoringPerformancePage() {
  const [metrics] = useState({
    responseTime: {
      average: 156,
      p95: 320,
      p99: 850,
      max: 2500
    },
    throughput: {
      requestsPerSecond: 1250,
      requestsPerMinute: 75000,
      requestsPerHour: 4500000
    },
    errorRate: {
      percentage: 0.8,
      count: 1250,
      lastHour: 45
    },
    availability: {
      uptime: 99.9,
      downtime: 0.1,
      lastIncident: '2024-01-10'
    }
  });

  const [alerts] = useState([
    {
      id: '1',
      type: 'warning',
      message: 'High response time detected',
      threshold: '> 500ms',
      current: '650ms',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      type: 'critical',
      message: 'Error rate spike',
      threshold: '> 5%',
      current: '8.2%',
      timestamp: '2024-01-15T13:45:00Z',
      status: 'resolved'
    },
    {
      id: '3',
      type: 'info',
      message: 'High traffic volume',
      threshold: '> 1000 req/s',
      current: '1250 req/s',
      timestamp: '2024-01-15T12:15:00Z',
      status: 'active'
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-500">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Performance Monitoring</h1>
          <p className="text-muted-foreground font-sans">
            Monitor system performance and response times
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{metrics.responseTime.average}ms</div>
            <p className="text-xs text-muted-foreground font-sans">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -5% from last hour
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
              {metrics.throughput.requestsPerSecond.toLocaleString()}
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
            <div className="text-2xl font-bold font-sans">{metrics.errorRate.percentage}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              {metrics.errorRate.count} errors today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{metrics.availability.uptime}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Average:</span>
                    <span className="text-sm font-sans font-medium">{metrics.responseTime.average}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">P95:</span>
                    <span className="text-sm font-sans font-medium">{metrics.responseTime.p95}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">P99:</span>
                    <span className="text-sm font-sans font-medium">{metrics.responseTime.p99}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Max:</span>
                    <span className="text-sm font-sans font-medium">{metrics.responseTime.max}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">CPU Usage:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Memory Usage:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Disk Usage:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">32%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Network I/O:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">55%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Active Alerts</CardTitle>
              <CardDescription className="font-sans">
                Current performance alerts and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <h3 className="font-medium font-sans">{alert.message}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          Threshold: {alert.threshold} • Current: {alert.current}
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getAlertBadge(alert.type)}
                      {getStatusBadge(alert.status)}
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
                <CardTitle className="font-sans">Response Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium font-sans">Improving Performance</p>
                  <p className="text-sm text-muted-foreground font-sans">
                    Response times have decreased by 15% over the last 7 days
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
                  <TrendingUp className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <p className="text-lg font-medium font-sans">Error Rate Increasing</p>
                  <p className="text-sm text-muted-foreground font-sans">
                    Error rate has increased by 8% over the last 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
