'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productionApi } from '@/lib/production-api';
import { websocketService } from '@/lib/websocket-service';
import { toast } from 'sonner';
import { handleError, handleWarning, handleWebSocketError } from '@/lib/error-handler';
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
  const [metrics, setMetrics] = useState({
    responseTime: {
      average: 0,
      p95: 0,
      p99: 0,
      max: 0
    },
    throughput: {
      requestsPerSecond: 0,
      requestsPerMinute: 0,
      requestsPerHour: 0
    },
    errorRate: {
      percentage: 0,
      count: 0,
      lastHour: 0
    },
    availability: {
      uptime: 0,
      downtime: 0,
      lastIncident: ''
    }
  });

  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setIsLoading(true);
        const [metricsData, alertsData] = await Promise.all([
          productionApi.getPerformanceMetrics(),
          productionApi.getSystemAlerts()
        ]);

        if (metricsData) {
          setMetrics(metricsData);
        }

        if (alertsData) {
          setAlerts(alertsData);
        }
      } catch (error) {
        // Error handled by API service
        toast.error('Failed to load performance data');
        // Set empty data on error
        setMetrics({
          responseTime: { average: 0, p95: 0, p99: 0, max: 0 },
          throughput: { requestsPerSecond: 0, requestsPerMinute: 0, requestsPerHour: 0 },
          errorRate: { percentage: 0, count: 0, lastHour: 0 },
          availability: { uptime: 0, downtime: 0, lastIncident: '' }
        });
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformanceData();

    // Subscribe to real-time performance updates
    let unsubscribe: (() => void) | null = null;
    let unsubscribeAlerts: (() => void) | null = null;
    
    try {
      if (websocketService && typeof websocketService.subscribeToPerformanceMetrics === 'function') {
        unsubscribe = websocketService.subscribeToPerformanceMetrics((data) => {
          setMetrics(data);
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToPerformanceMetrics method not found', { component: 'PerformancePage' });
      }

      if (websocketService && typeof websocketService.subscribeToNotifications === 'function') {
        unsubscribeAlerts = websocketService.subscribeToNotifications((data) => {
          setAlerts(prevAlerts => [data, ...prevAlerts.slice(0, 9)]); // Keep last 10 alerts
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToNotifications method not found', { component: 'PerformancePage' });
      }
    } catch (error) {
      handleWebSocketError(error, 'performance', 'subscription');
    }

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(websocketService.getConnectionStatus());
    }, 1000);

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          handleWebSocketError(error, 'performance', 'unsubscribe');
        }
      }
      if (unsubscribeAlerts) {
        try {
          unsubscribeAlerts();
        } catch (error) {
          handleWebSocketError(error, 'performance', 'unsubscribe');
        }
      }
      clearInterval(statusInterval);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const [metricsData, alertsData] = await Promise.all([
        productionApi.getPerformanceMetrics(),
        productionApi.getSystemAlerts()
      ]);

      if (metricsData) {
        setMetrics(metricsData);
      }

      if (alertsData) {
        setAlerts(alertsData);
      }
    } catch (error) {
      // Error handled by API service
      toast.error('Failed to refresh performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-warning/100">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-primary/100">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-success/100">Resolved</Badge>;
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
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-success/100 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Memory Usage:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-warning/100 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Disk Usage:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-success/100 h-2 rounded-full" style={{ width: '32%' }}></div>
                      </div>
                      <span className="text-sm font-sans font-medium">32%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans">Network I/O:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-primary/100 h-2 rounded-full" style={{ width: '55%' }}></div>
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
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
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
                  <TrendingDown className="h-12 w-12 mx-auto text-success mb-4" />
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
                  <TrendingUp className="h-12 w-12 mx-auto text-destructive mb-4" />
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
