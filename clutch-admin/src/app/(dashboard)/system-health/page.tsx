"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { productionApi } from '@/lib/production-api';
import { websocketService } from '@/lib/websocket-service';
import { handleError, handleWarning, handleWebSocketError } from '@/lib/error-handler';
import { useLanguage } from '@/contexts/language-context';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

// Import new Phase 2 widgets
import SLACompliance from '@/components/widgets/sla-compliance';
import IncidentCost from '@/components/widgets/incident-cost';
import ErrorDistribution from '@/components/widgets/error-distribution';
import RootCauseTimeline from '@/components/widgets/root-cause-timeline';

// Define interfaces for merged functionality
interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  dependencies: string[];
}

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
  availability: {
    uptime: number;
    downtime: number;
    lastIncident: string;
  };
  endpoints: Array<{
    path: string;
    method: string;
    averageResponseTime: number;
    requestCount: number;
    errorCount: number;
  }>;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  startTime: string;
  endTime?: string;
  affectedServices: string[];
  rootCause?: string;
  resolution?: string;
}

interface ApiAnalytics {
  endpoint: string;
  method: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  lastAccessed: string;
}

import {
  Heart, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Activity,
  Server,
  Database,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  BarChart3,
  Gauge,
  Eye,
  MoreHorizontal,
  Play,
  Pause,
  Square
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SystemHealthPage() {
  const { t } = useLanguage();
  
  // Main system health state
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [overallHealth, setOverallHealth] = useState({
    status: 'unknown' as 'healthy' | 'degraded' | 'down' | 'unknown',
    uptime: 0,
    servicesUp: 0,
    servicesDown: 0,
    lastIncident: ''
  });

  // Additional state for merged functionality
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [apiAnalytics, setApiAnalytics] = useState<ApiAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Load all system health related data
        const [servicesData, performanceData, incidentsData, analyticsData] = await Promise.allSettled([
          productionApi.getSystemHealth?.() || Promise.resolve([]),
          productionApi.getPerformanceMetrics?.() || Promise.resolve(null),
          productionApi.getIncidents?.() || Promise.resolve([]),
          productionApi.getApiAnalytics?.() || Promise.resolve([])
        ]);

        // Set data
        if (servicesData.status === 'fulfilled') {
          const servicesArray = servicesData.value || [];
          setServices(servicesArray);
          
          // Calculate overall health
          const upServices = servicesArray.filter(s => s.status === 'healthy').length;
          const downServices = servicesArray.filter(s => s.status === 'down').length;
          const totalServices = servicesArray.length;
          
          setOverallHealth({
            status: downServices > 0 ? 'down' : upServices === totalServices ? 'healthy' : 'degraded',
            uptime: totalServices > 0 ? (upServices / totalServices) * 100 : 0,
            servicesUp: upServices,
            servicesDown: downServices,
            lastIncident: servicesArray.length > 0 ? servicesArray[0].lastCheck : ''
          });
        }

        if (performanceData.status === 'fulfilled') {
          setPerformanceMetrics(performanceData.value);
        }
        if (incidentsData.status === 'fulfilled') {
          setIncidents(incidentsData.value || []);
        }
        if (analyticsData.status === 'fulfilled') {
          setApiAnalytics(analyticsData.value || []);
        }

      } catch (error) {
        handleError(error, { component: 'SystemHealthPage', action: 'load_data' });
        toast.error('Failed to load system health data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();

    // Subscribe to real-time updates
    let unsubscribe: (() => void) | null = null;
    try {
      if (websocketService && typeof websocketService.subscribeToSystemHealth === 'function') {
        unsubscribe = websocketService.subscribeToSystemHealth((data: any) => {
          setServices(prevServices => 
            prevServices.map(service => 
              service.name === data.serviceName ? { ...service, ...data } : service
            )
          );
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToSystemHealth method not found', { component: 'SystemHealthPage' });
      }
    } catch (error) {
      handleWebSocketError(error, 'system-health', 'subscription');
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
          handleWebSocketError(error, 'system-health', 'unsubscribe');
        }
      }
      clearInterval(statusInterval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success/10 text-success-foreground";
      case "degraded":
        return "bg-warning/10 text-warning-foreground";
      case "down":
        return "bg-destructive/10 text-destructive-foreground";
      case "open":
        return "bg-destructive/10 text-destructive-foreground";
      case "investigating":
        return "bg-warning/10 text-warning-foreground";
      case "resolved":
        return "bg-success/10 text-success-foreground";
      case "closed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "degraded":
      case "investigating":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "down":
      case "open":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-warning/10 text-warning-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading system health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">System Health & Monitoring</h1>
          <p className="text-muted-foreground font-sans">
            Monitor system performance, incidents, and API analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
            {connectionStatus === 'connected' ? 'Live' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="api-analytics">API Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Analytics Widgets */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SLACompliance />
            <IncidentCost />
            <ErrorDistribution />
            <RootCauseTimeline />
          </div>

          {/* System Health Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Overall Status</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(overallHealth.status)}
                  <span className="text-2xl font-bold font-sans capitalize">{overallHealth.status}</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  {overallHealth.servicesUp}/{overallHealth.servicesUp + overallHealth.servicesDown} services up
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{overallHealth.uptime.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground font-sans">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Response Time</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {performanceMetrics?.responseTime.average ? `${performanceMetrics.responseTime.average}ms` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Average response time
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
                  {performanceMetrics?.errorRate.percentage ? `${performanceMetrics.errorRate.percentage.toFixed(2)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Last hour
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>
                Monitor the health and status of all system services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Last Check</TableHead>
                      <TableHead>Dependencies</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(services) ? services : []).map((service) => (
                      <TableRow key={service.name}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Server className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium">{service.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(service.status)}
                            <Badge className={getStatusColor(service.status)}>
                              {service.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{service.uptime.toFixed(1)}%</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{service.responseTime}ms</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatRelativeTime(service.lastCheck)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {service.dependencies.length} dependencies
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>View Logs</DropdownMenuItem>
                              <DropdownMenuItem>Restart Service</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Configure Alerts</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analytics and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance Summary */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics?.responseTime.average || 0}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      P95: {performanceMetrics?.responseTime.p95 || 0}ms
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics?.throughput.requestsPerSecond || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      requests/second
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics?.errorRate.percentage.toFixed(2) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {performanceMetrics?.errorRate.count || 0} errors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Availability</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics?.availability.uptime.toFixed(2) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* API Endpoints Performance */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Avg Response Time</TableHead>
                      <TableHead>Request Count</TableHead>
                      <TableHead>Error Count</TableHead>
                      <TableHead>Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(performanceMetrics?.endpoints) ? performanceMetrics.endpoints : []).map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{endpoint.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{endpoint.averageResponseTime}ms</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{endpoint.requestCount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{endpoint.errorCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {((endpoint.requestCount - endpoint.errorCount) / endpoint.requestCount * 100).toFixed(1)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incidents</CardTitle>
              <CardDescription>
                Track and manage system incidents and outages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Affected Services</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(incidents) ? incidents : []).map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{incident.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {incident.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(incident.status)}
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {incident.affectedServices.length} services
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(incident.startTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {incident.endTime 
                              ? `${Math.round((new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime()) / (1000 * 60))}m`
                              : 'Ongoing'
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Update Status</DropdownMenuItem>
                              <DropdownMenuItem>Add Root Cause</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Close Incident</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Analytics Tab */}
        <TabsContent value="api-analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Analytics</CardTitle>
              <CardDescription>
                Monitor API usage, performance, and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Total Requests</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Avg Response Time</TableHead>
                      <TableHead>Error Count</TableHead>
                      <TableHead>Last Accessed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(apiAnalytics) ? apiAnalytics : []).map((api) => (
                      <TableRow key={`${api.endpoint}-${api.method}`}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {api.endpoint}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{api.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{api.totalRequests.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{api.successRate.toFixed(1)}%</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{api.averageResponseTime}ms</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{api.errorCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatRelativeTime(api.lastAccessed)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}