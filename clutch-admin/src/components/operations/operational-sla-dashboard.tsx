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
    const loadSLAData = () => {
      const mockSLAs: SLA[] = [
        {
          id: 'sla-001',
          name: 'API Response Time',
          description: 'API endpoints must respond within 200ms for 95% of requests',
          service: 'API Gateway',
          metric: 'Response Time',
          target: 200,
          current: 185,
          status: 'meeting',
          trend: 'improving',
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          breachCount: 2,
          avgResponseTime: 185,
          uptime: 99.9,
          availability: 99.95,
          performance: {
            p50: 120,
            p95: 185,
            p99: 250
          },
          incidents: [
            {
              id: 'incident-001',
              severity: 'high',
              title: 'API Response Time Degradation',
              startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              duration: 60,
              impact: 'Increased response times affecting user experience',
              status: 'resolved'
            }
          ],
          alerts: [
            {
              id: 'alert-001',
              type: 'response_time_spike',
              message: 'Response time exceeded 300ms threshold',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              severity: 'high',
              resolved: true
            }
          ],
          history: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 195, status: 'meeting' },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 180, status: 'meeting' },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 220, status: 'at_risk' },
            { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 185, status: 'meeting' }
          ]
        },
        {
          id: 'sla-002',
          name: 'Fleet Availability',
          description: 'Fleet vehicles must be available for 95% of operational hours',
          service: 'Fleet Management',
          metric: 'Availability',
          target: 95,
          current: 97.2,
          status: 'meeting',
          trend: 'stable',
          lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          breachCount: 0,
          avgResponseTime: 0,
          uptime: 97.2,
          availability: 97.2,
          performance: {
            p50: 0,
            p95: 0,
            p99: 0
          },
          incidents: [],
          alerts: [],
          history: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 96.8, status: 'meeting' },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 97.1, status: 'meeting' },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 97.0, status: 'meeting' },
            { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 97.2, status: 'meeting' }
          ]
        },
        {
          id: 'sla-003',
          name: 'Payment Processing',
          description: 'Payment transactions must complete within 5 seconds for 99% of requests',
          service: 'Payment Gateway',
          metric: 'Transaction Time',
          target: 5000,
          current: 4200,
          status: 'meeting',
          trend: 'improving',
          lastUpdated: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          breachCount: 1,
          avgResponseTime: 4200,
          uptime: 99.8,
          availability: 99.85,
          performance: {
            p50: 2800,
            p95: 4200,
            p99: 4800
          },
          incidents: [
            {
              id: 'incident-002',
              severity: 'critical',
              title: 'Payment Processing Delay',
              startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              duration: 60,
              impact: 'Payment delays affecting customer experience',
              status: 'resolved'
            }
          ],
          alerts: [
            {
              id: 'alert-002',
              type: 'threshold_breach',
              message: 'Transaction time exceeded 6 seconds',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              severity: 'critical',
              resolved: true
            }
          ],
          history: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 3800, status: 'meeting' },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 4100, status: 'meeting' },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 5200, status: 'at_risk' },
            { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 4200, status: 'meeting' }
          ]
        },
        {
          id: 'sla-004',
          name: 'Customer Support',
          description: 'Customer support tickets must be resolved within 24 hours for 90% of cases',
          service: 'Support System',
          metric: 'Resolution Time',
          target: 24,
          current: 18.5,
          status: 'meeting',
          trend: 'improving',
          lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          breachCount: 3,
          avgResponseTime: 18.5,
          uptime: 99.5,
          availability: 99.5,
          performance: {
            p50: 12,
            p95: 18.5,
            p99: 22
          },
          incidents: [
            {
              id: 'incident-003',
              severity: 'medium',
              title: 'Support Ticket Backlog',
              startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              duration: 120,
              impact: 'Increased resolution times for support tickets',
              status: 'resolved'
            }
          ],
          alerts: [
            {
              id: 'alert-003',
              type: 'performance_degradation',
              message: 'Resolution time approaching SLA threshold',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              severity: 'medium',
              resolved: true
            }
          ],
          history: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 20, status: 'meeting' },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 22, status: 'at_risk' },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 25, status: 'breach' },
            { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), value: 18.5, status: 'meeting' }
          ]
        }
      ];

      const mockServices: ServiceHealth[] = [
        {
          id: 'service-001',
          name: 'API Gateway',
          status: 'healthy',
          uptime: 99.9,
          responseTime: 185,
          errorRate: 0.1,
          throughput: 1500,
          lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          slas: ['sla-001']
        },
        {
          id: 'service-002',
          name: 'Fleet Management',
          status: 'healthy',
          uptime: 97.2,
          responseTime: 0,
          errorRate: 0.05,
          throughput: 500,
          lastIncident: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          slas: ['sla-002']
        },
        {
          id: 'service-003',
          name: 'Payment Gateway',
          status: 'healthy',
          uptime: 99.8,
          responseTime: 4200,
          errorRate: 0.2,
          throughput: 800,
          lastIncident: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          slas: ['sla-003']
        },
        {
          id: 'service-004',
          name: 'Support System',
          status: 'degraded',
          uptime: 99.5,
          responseTime: 18.5,
          errorRate: 0.3,
          throughput: 200,
          lastIncident: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          slas: ['sla-004']
        }
      ];

      setSlas(mockSLAs);
      setServices(mockServices);
      setSelectedSLA(mockSLAs[0]);
    };

    loadSLAData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSlas(prev => prev.map(sla => {
        // Simulate small variations in SLA metrics
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const newValue = sla.current * (1 + variation);
        
        let newStatus = sla.status;
        if (newValue > sla.target * 1.1) {
          newStatus = 'breach';
        } else if (newValue > sla.target * 0.9) {
          newStatus = 'at_risk';
        } else {
          newStatus = 'meeting';
        }

        return {
          ...sla,
          current: Math.round(newValue * 100) / 100,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'breach': return 'bg-red-100 text-red-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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
      sla.id === slaId ? { ...sla, status: newStatus as any } : sla
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
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
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
            <div className="text-center p-3 bg-green-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-green-600">{meetingSLAs}</div>
              <div className="text-sm text-muted-foreground">Meeting SLA</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-yellow-600">{atRiskSLAs}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-red-600">{breachSLAs}</div>
              <div className="text-sm text-muted-foreground">Breach</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-blue-600">{avgUptime}%</div>
              <div className="text-sm text-muted-foreground">Avg Uptime</div>
            </div>
          </div>

          {/* Service Health */}
          <div>
            <h4 className="font-medium mb-3">Service Health</h4>
            <div className="grid gap-3">
              {services.map((service) => (
                <div key={service.id} className="p-3 border rounded-lg-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-lg-full ${getServiceStatusColor(service.status)}`} />
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
                  className={`p-3 border rounded-lg-lg cursor-pointer transition-colors ${
                    selectedSLA?.id === sla.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
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
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg text-sm">
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
                        <div key={incident.id} className="p-3 border rounded-lg-lg">
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
                        <div key={alert.id} className="p-3 border rounded-lg-lg">
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
