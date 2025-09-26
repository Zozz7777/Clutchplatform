"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Shield,
  Users,
  Car,
  Wrench,
  Bell,
  BellOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Timer,
  Gauge,
  Award,
  Flag
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';
import { logger } from '@/lib/logger';

interface SLA {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number;
  current: number;
  status: 'meeting' | 'at_risk' | 'breach' | 'unknown';
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
  breachCount: number;
  avgResponseTime: number;
  uptime: number;
  availability: number;
  performance: {
    p50: number;
    p95: number;
    p99: number;
  };
  incidents: {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    impact: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
  }[];
  alerts: {
    id: string;
    type: 'threshold_breach' | 'performance_degradation' | 'availability_issue' | 'response_time_spike';
    message: string;
    timestamp: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    resolved: boolean;
  }[];
  history: {
    timestamp: string;
    value: number;
    status: 'meeting' | 'at_risk' | 'breach';
  }[];
}

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastIncident: string;
  slas: string[]; // SLA IDs
}

interface OperationalSLADashboardProps {
  className?: string;
}

export default function OperationalSLADashboard({ className }: OperationalSLADashboardProps) {
  const [slas, setSlas] = useState<SLA[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

  useEffect(() => {
    const loadSLAData = async () => {
      try {
        // Load real SLA data from API
        const [slaData, serviceData] = await Promise.all([
          productionApi.getSLAMetrics(),
          productionApi.getServiceHealth()
        ]);
        
        setSlas(slaData || []);
        setServices(serviceData || []);
        setSelectedSLA(slaData?.[0] || null);
      } catch (error) {
        logger.error('Failed to load SLA data:', error);
        // Set empty arrays as fallback
        setSlas([]);
        setServices([]);
        setSelectedSLA(null);
      }
    };

    loadSLAData();

    // Real-time updates via WebSocket or polling
    const interval = setInterval(loadSLAData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'bg-success/10 text-success';
      case 'at_risk': return 'bg-warning/10 text-warning';
      case 'breach': return 'bg-destructive/10 text-destructive';
      case 'unknown': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success/100';
      case 'degraded': return 'bg-warning/100';
      case 'down': return 'bg-destructive/100';
      case 'maintenance': return 'bg-primary/100';
      default: return 'bg-muted/500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Activity className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'threshold_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'performance_degradation': return <TrendingDown className="h-4 w-4" />;
      case 'availability_issue': return <XCircle className="h-4 w-4" />;
      case 'response_time_spike': return <Timer className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleSLAStatusUpdate = (slaId: string, newStatus: string) => {
    setSlas(prev => prev.map(sla =>
      sla.id === slaId ? { ...sla, status: newStatus as string } : sla
    ));
  };

  const handleAlertResolve = (slaId: string, alertId: string) => {
    setSlas(prev => prev.map(sla =>
      sla.id === slaId
        ? {
            ...sla,
            alerts: sla.alerts.map(alert =>
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : sla
    ));
  };

  const filteredSLAs = slas.filter(sla => {
    const statusMatch = filterStatus === 'all' || sla.status === filterStatus;
    const serviceMatch = filterService === 'all' || sla.service === filterService;
    return statusMatch && serviceMatch;
  });

  const meetingSLAs = slas.filter(sla => sla.status === 'meeting').length;
  const atRiskSLAs = slas.filter(sla => sla.status === 'at_risk').length;
  const breachSLAs = slas.filter(sla => sla.status === 'breach').length;
  const avgUptime = slas.length > 0 
    ? Math.round(slas.reduce((sum, sla) => sum + sla.uptime, 0) / slas.length * 100) / 100
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operational SLA Dashboard
              </CardTitle>
              <CardDescription>
                Service Level Agreement monitoring across all operational services
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-success' : ''}
              >
                {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SLA Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{meetingSLAs}</div>
              <div className="text-sm text-muted-foreground">Meeting SLA</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{atRiskSLAs}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{breachSLAs}</div>
              <div className="text-sm text-muted-foreground">Breach</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{avgUptime}%</div>
              <div className="text-sm text-muted-foreground">Avg Uptime</div>
            </div>
          </div>

          {/* Service Health */}
          <div>
            <h4 className="font-medium mb-3">Service Health</h4>
            <div className="grid gap-3">
              {services.map((service) => (
                <div key={service.id} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${getServiceStatusColor(service.status)}`} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getServiceStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {service.uptime}% uptime
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Response: {service.responseTime}ms</span>
                    <span>Error Rate: {service.errorRate}%</span>
                    <span>Throughput: {formatNumber(service.throughput)}/min</span>
                    <span>Last Incident: {new Date(service.lastIncident).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Monitoring */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">SLA Monitoring</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {['all', 'meeting', 'at_risk', 'breach', 'unknown'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Service:</span>
                {['all', 'API Gateway', 'Fleet Management', 'Payment Gateway', 'Support System'].map((service) => (
                  <Button
                    key={service}
                    variant={filterService === service ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterService(service)}
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredSLAs.map((sla) => (
                <div
                  key={sla.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedSLA?.id === sla.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedSLA(sla)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{sla.name}</div>
                        <div className="text-sm text-muted-foreground">{sla.service} - {sla.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(sla.status)}>
                        {sla.status.replace('_', ' ')}
                      </Badge>
                      {getTrendIcon(sla.trend)}
                      <div className="text-sm font-medium">
                        {sla.current} / {sla.target}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Breaches: {sla.breachCount}</span>
                    <span>Uptime: {sla.uptime}%</span>
                    <span>Last Updated: {new Date(sla.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected SLA Details */}
          {selectedSLA && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">SLA Details - {selectedSLA.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="incidents">Incidents</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">SLA Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Value:</span>
                          <span className="font-medium">{selectedSLA.current}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-medium">{selectedSLA.target}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedSLA.status)}>
                            {selectedSLA.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Breach Count:</span>
                          <span className="font-medium">{selectedSLA.breachCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span className="font-medium">{selectedSLA.uptime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Availability:</span>
                          <span className="font-medium">{selectedSLA.availability}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Performance Percentiles</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>P50:</span>
                          <span className="font-medium">{selectedSLA.performance.p50}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P95:</span>
                          <span className="font-medium">{selectedSLA.performance.p95}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P99:</span>
                          <span className="font-medium">{selectedSLA.performance.p99}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Historical Performance</h5>
                    <div className="space-y-2">
                      {selectedSLA.history.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-[0.625rem] text-sm">
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.value}</span>
                            <Badge className={getStatusColor(entry.status)}>
                              {entry.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Performance Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Average Response Time:</span>
                          <span className="font-medium">{selectedSLA.avgResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span className="font-medium">{selectedSLA.uptime}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Availability:</span>
                          <span className="font-medium">{selectedSLA.availability}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Trend Analysis</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span>Trend:</span>
                          {getTrendIcon(selectedSLA.trend)}
                          <span className="font-medium">{selectedSLA.trend}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="font-medium">{new Date(selectedSLA.lastUpdated).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="incidents" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Recent Incidents</h5>
                    <div className="space-y-2">
                      {selectedSLA.incidents.map((incident) => (
                        <div key={incident.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(incident.severity)}>
                                {incident.severity}
                              </Badge>
                              <span className="font-medium">{incident.title}</span>
                            </div>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{incident.impact}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Started: {new Date(incident.startTime).toLocaleString()}</span>
                            {incident.endTime && (
                              <span>Duration: {incident.duration} minutes</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {selectedSLA.incidents.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No recent incidents
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Active Alerts</h5>
                    <div className="space-y-2">
                      {selectedSLA.alerts.filter(alert => !alert.resolved).map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertTypeIcon(alert.type)}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAlertResolve(selectedSLA.id, alert.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {selectedSLA.alerts.filter(alert => !alert.resolved).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No active alerts
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


