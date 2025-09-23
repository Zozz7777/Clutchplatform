'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productionApi } from '@/lib/production-api';
import { websocketService } from '@/lib/websocket-service';
import { handleError, handleWarning, handleWebSocketError } from '@/lib/error-handler';
import { useLanguage } from '@/contexts/language-context';

// Import new Phase 2 widgets
import SLACompliance from '@/components/widgets/sla-compliance';
import IncidentCost from '@/components/widgets/incident-cost';
import ErrorDistribution from '@/components/widgets/error-distribution';
import RootCauseTimeline from '@/components/widgets/root-cause-timeline';
import { toast } from 'sonner';
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
  TrendingDown
} from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  dependencies: string[];
}

export default function SystemHealthPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [overallHealth, setOverallHealth] = useState({
    status: 'unknown' as 'healthy' | 'degraded' | 'down' | 'unknown',
    uptime: 0,
    servicesUp: 0,
    servicesDown: 0,
    lastIncident: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const loadSystemHealth = async () => {
      try {
        setIsLoading(true);
        const healthData = await productionApi.getSystemHealth();
        
        if (healthData) {
          setServices((healthData.services || []) as any);
          setOverallHealth((healthData.overall || {
            status: 'unknown',
            uptime: 0,
            servicesUp: 0,
            servicesDown: 0,
            lastIncident: ''
          }) as any);
        }
      } catch (error) {
        // Error handled by API service
        toast.error(t('systemHealth.failedToLoadData'));
        // Set empty data on error
        setServices([]);
        setOverallHealth({
          status: 'unknown',
          uptime: 0,
          servicesUp: 0,
          servicesDown: 0,
          lastIncident: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemHealth();

    // Subscribe to real-time health updates
    let unsubscribe: (() => void) | null = null;
    try {
      if (websocketService && typeof websocketService.subscribeToSystemHealth === 'function') {
        unsubscribe = websocketService.subscribeToSystemHealth((data: any) => {
          setServices(prevServices => 
            prevServices.map(service => 
              service.name === data.service ? { ...service, ...data } : service
            )
          );
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToSystemHealth method not found', { component: 'SystemHealthPage' });
      }
    } catch (error) {
      handleWebSocketError(error, 'health', 'subscription');
    }

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus((websocketService as any).getConnectionStatus());
    }, 1000);

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          handleWebSocketError(error, 'health', 'unsubscribe');
        }
      }
      clearInterval(statusInterval);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const healthData = await productionApi.getSystemHealth();
      
      if (healthData) {
        setServices((healthData.services || []) as any);
        setOverallHealth((healthData.overall || {
          status: 'unknown',
          uptime: 0,
          servicesUp: 0,
          servicesDown: 0,
          lastIncident: ''
        }) as any);
      }
    } catch (error) {
      // Error handled by API service
      toast.error(t('systemHealth.failedToRefreshData'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-success text-success-foreground">{t('systemHealth.status.healthy')}</Badge>;
      case 'degraded':
        return <Badge variant="default" className="bg-warning text-warning-foreground">{t('systemHealth.status.degraded')}</Badge>;
      case 'down':
        return <Badge variant="destructive">{t('systemHealth.status.down')}</Badge>;
      default:
        return <Badge variant="outline">{t('systemHealth.status.unknown')}</Badge>;
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Heart className="h-8 w-8 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-8 w-8 text-warning" />;
      case 'down':
        return <XCircle className="h-8 w-8 text-error" />;
      default:
        return <Activity className="h-8 w-8 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('systemHealth.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">{t('systemHealth.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('systemHealth.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('systemHealth.refresh')}
          </Button>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            {t('systemHealth.runHealthCheck')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('systemHealth.overallStatus')}</CardTitle>
            {getOverallStatusIcon(overallHealth.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans capitalize">
              {t(`systemHealth.statusValues.${overallHealth.status}`)}
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              {overallHealth.uptime}% {t('systemHealth.uptime')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('systemHealth.servicesUp')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{overallHealth.servicesUp}</div>
            <p className="text-xs text-muted-foreground font-sans">
              {t('systemHealth.outOfServices', { count: services.length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('systemHealth.servicesDown')}</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{overallHealth.servicesDown}</div>
            <p className="text-xs text-muted-foreground font-sans">
              {t('systemHealth.requireAttention')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('systemHealth.lastIncident')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {new Date(overallHealth.lastIncident).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              {new Date(overallHealth.lastIncident).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">{t('systemHealth.tabs.services')}</TabsTrigger>
          <TabsTrigger value="dependencies">{t('systemHealth.tabs.dependencies')}</TabsTrigger>
          <TabsTrigger value="history">{t('systemHealth.tabs.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <CardTitle className="font-sans">{service.name}</CardTitle>
                        <CardDescription className="font-sans">
                          {t('systemHealth.lastChecked')}: {new Date(service.lastCheck).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">{t('systemHealth.uptime')}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              service.uptime >= 99 ? 'bg-success/100' :
                              service.uptime >= 95 ? 'bg-warning/100' : 'bg-destructive/100'
                            }`}
                            style={{ width: `${service.uptime}%` }}
                  ></div>
                </div>
                        <span className="text-sm font-sans font-medium">{service.uptime}%</span>
                      </div>
              </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">{t('systemHealth.responseTime')}</p>
                      <p className="text-sm font-sans">
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </p>
                </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">{t('systemHealth.dependencies')}</p>
                      <div className="flex flex-wrap gap-1">
                        {service.dependencies.map((dep, depIndex) => (
                          <Badge key={depIndex} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
        </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
                <CardTitle className="font-sans">{t('systemHealth.externalDependencies')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                  {[
                    { name: 'AWS S3', status: 'healthy', responseTime: 45 },
                    { name: 'Stripe API', status: 'healthy', responseTime: 120 },
                    { name: 'SendGrid', status: 'down', responseTime: 0 },
                    { name: 'MongoDB Atlas', status: 'healthy', responseTime: 25 }
                  ].map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(dep.status)}
                  <div>
                          <h3 className="font-medium font-sans">{dep.name}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {dep.responseTime > 0 ? `${dep.responseTime}ms` : t('systemHealth.unavailable')}
                    </p>
                  </div>
                </div>
                      {getStatusBadge(dep.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
                <CardTitle className="font-sans">{t('systemHealth.internalServices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                  {[
                    { name: 'Load Balancer', status: 'healthy', instances: 3 },
                    { name: 'Redis Cache', status: 'degraded', instances: 2 },
                    { name: 'Queue Workers', status: 'healthy', instances: 5 },
                    { name: 'Background Jobs', status: 'healthy', instances: 2 }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                  <div>
                          <h3 className="font-medium font-sans">{service.name}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {t('systemHealth.instances', { count: service.instances })}
                    </p>
                  </div>
                </div>
                      {getStatusBadge(service.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
      <Card>
        <CardHeader>
              <CardTitle className="font-sans">{t('systemHealth.healthHistory')}</CardTitle>
              <CardDescription className="font-sans">
                {t('systemHealth.historicalHealthStatus')}
          </CardDescription>
        </CardHeader>
        <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: '2024-01-15T14:30:00Z',
                    event: 'Email Service Outage',
                    duration: '2h 15m',
                    impact: 'Medium',
                    status: 'resolved'
                  },
                  {
                    time: '2024-01-14T09:15:00Z',
                    event: 'Database Performance Degradation',
                    duration: '45m',
                    impact: 'Low',
                    status: 'resolved'
                  },
                  {
                    time: '2024-01-13T16:20:00Z',
                    event: 'API Gateway Timeout',
                    duration: '1h 30m',
                    impact: 'High',
                    status: 'resolved'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(event.status)}
                  <div>
                        <h3 className="font-medium font-sans">{event.event}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {new Date(event.time).toLocaleString()} • Duration: {event.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.impact === 'High' ? 'destructive' : event.impact === 'Medium' ? 'default' : 'secondary'}>
                        {event.impact} Impact
                        </Badge>
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2: System Health Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
                <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('systemHealth.analytics.title')}</h2>
            <p className="text-muted-foreground">
              {t('systemHealth.analytics.description')}
            </p>
                </div>
              </div>

        {/* Top Row - SLA & Incident Cost */}
        <div className="grid gap-6 md:grid-cols-2">
          <SLACompliance />
          <IncidentCost />
              </div>

        {/* Second Row - Error Distribution & Root Cause */}
        <div className="grid gap-6 md:grid-cols-2">
          <ErrorDistribution />
          <RootCauseTimeline />
                </div>
              </div>
    </div>
  );
}