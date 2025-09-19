'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface SystemHealth {
  status: string;
  healthScore: number;
  uptime: {
    process: number;
    system: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
    process: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
  cpu: {
    usage: any;
    loadAverage: number[];
  };
  platform: {
    type: string;
    platform: string;
    arch: string;
    release: string;
  };
}

interface ServiceHealth {
  name: string;
  status: string;
  responseTime: number;
  lastCheck: string;
}

export default function SystemHealthPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const [healthResponse, servicesResponse] = await Promise.all([
        apiService.getSystemHealth(),
        apiService.getServicesHealth()
      ]);

      if (healthResponse.success) {
        setSystemHealth(healthResponse.data);
      }

      if (servicesResponse.success) {
        setServices(servicesResponse.data.services || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <Badge variant="default" className="bg-success/100">Healthy</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-warning/100">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">System Health</h1>
          <p className="text-muted-foreground font-sans">
            Monitor system performance and service status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground font-sans">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchSystemHealth} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {systemHealth && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">System Status</CardTitle>
                  {getStatusIcon(systemHealth.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {systemHealth.healthScore}%
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Health Score
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(systemHealth.status)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Uptime</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {formatUptime(systemHealth.uptime.process)}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Process uptime
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">Memory Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {systemHealth.memory.percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    {formatBytes(systemHealth.memory.used)} / {formatBytes(systemHealth.memory.total)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-sans">CPU Load</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-sans">
                    {systemHealth.cpu.loadAverage[0]?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    1-minute average
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">Platform:</span>
                    <span className="text-sm font-sans">{systemHealth.platform.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">Architecture:</span>
                    <span className="text-sm font-sans">{systemHealth.platform.arch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">Release:</span>
                    <span className="text-sm font-sans">{systemHealth.platform.release}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Memory Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">Heap Used:</span>
                    <span className="text-sm font-sans">{formatBytes(systemHealth.memory.process.heapUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">Heap Total:</span>
                    <span className="text-sm font-sans">{formatBytes(systemHealth.memory.process.heapTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-sans">RSS:</span>
                    <span className="text-sm font-sans">{formatBytes(systemHealth.memory.process.rss)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Service Status</CardTitle>
                <CardDescription className="font-sans">
                  Monitor the health of all system services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-medium font-sans">{service.name}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            Response time: {service.responseTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(service.status)}
                        <span className="text-sm text-muted-foreground font-sans">
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Load Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">1 minute:</span>
                      <span className="text-sm font-sans">{systemHealth.cpu.loadAverage[0]?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">5 minutes:</span>
                      <span className="text-sm font-sans">{systemHealth.cpu.loadAverage[1]?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans">15 minutes:</span>
                      <span className="text-sm font-sans">{systemHealth.cpu.loadAverage[2]?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-sans">Memory Usage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-sans mt-2">
                      Memory usage: {systemHealth.memory.percentage}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          systemHealth.memory.percentage > 80 ? 'bg-destructive/100' :
                          systemHealth.memory.percentage > 60 ? 'bg-warning/100' : 'bg-success/100'
                        }`}
                        style={{ width: `${systemHealth.memory.percentage}%` }}
                      ></div>
                    </div>
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
