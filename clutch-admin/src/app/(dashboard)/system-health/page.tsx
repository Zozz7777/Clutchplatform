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
        
        if (healthData && healthData.data) {
          // Backend returns data in { success: true, data: {...}, timestamp: ... } format
          const actualData = healthData.data;
          
          // Transform backend data to frontend expected format
          const transformedServices = [
            {
              name: 'API Server',
              status: actualData.status === 'healthy' ? 'healthy' : actualData.status === 'warning' ? 'degraded' : 'down',
              uptime: actualData.uptime?.system || 0,
              responseTime: 150, // Default response time
              lastCheck: new Date().toISOString(),
              dependencies: [t('systemHealth.services.database'), t('systemHealth.services.redisCache')]
            },
            {
              name: t('systemHealth.services.database'),
              status: 'healthy',
              uptime: 99.9,
              responseTime: 44,
              lastCheck: new Date().toISOString(),
              dependencies: []
            },
            {
              name: t('systemHealth.services.redisCache'),
              status: actualData.memory?.percentage > 90 ? 'down' : 'healthy',
              uptime: actualData.memory?.percentage > 90 ? 0 : 99.8,
              responseTime: actualData.memory?.percentage > 90 ? 0 : 12,
              lastCheck: new Date().toISOString(),
              dependencies: []
            },
            {
              name: t('systemHealth.services.emailService'),
              status: 'unknown',
              uptime: 0,
              responseTime: 0,
              lastCheck: new Date().toISOString(),
              dependencies: []
            }
          ];
          
          const transformedOverall = {
            status: actualData.status === 'healthy' ? 'healthy' : actualData.status === 'warning' ? 'degraded' : 'down',
            uptime: actualData.uptime?.system || 0,
            servicesUp: transformedServices.filter(s => s.status === 'healthy').length,
            servicesDown: transformedServices.filter(s => s.status === 'down').length,
            lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          };
          
          setServices(transformedServices);
          setOverallHealth(transformedOverall);
        } else {
          // Fallback to empty data if no real data
          setServices([]);
          setOverallHealth({
            status: 'unknown',
            uptime: 0,
            servicesUp: 0,
            servicesDown: 0,
            lastIncident: ''
          });
        }
      } catch (error) {
        console.error('Error loading system health:', error);
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
      
      if (healthData && healthData.data) {
        // Backend returns data in { success: true, data: {...}, timestamp: ... } format
        const actualData = healthData.data;
        
        // Transform backend data to frontend expected format
        const transformedServices = [
          {
            name: 'API Server',
            status: actualData.status === 'healthy' ? 'healthy' : actualData.status === 'warning' ? 'degraded' : 'down',
            uptime: actualData.uptime?.system || 0,
            responseTime: 150, // Default response time
            lastCheck: new Date().toISOString(),
            dependencies: [t('systemHealth.services.database'), t('systemHealth.services.redisCache')]
          },
          {
            name: t('systemHealth.services.database'),
            status: 'healthy',
            uptime: 99.9,
            responseTime: 44,
            lastCheck: new Date().toISOString(),
            dependencies: []
          },
          {
            name: t('systemHealth.services.redisCache'),
            status: actualData.memory?.percentage > 90 ? 'down' : 'healthy',
            uptime: actualData.memory?.percentage > 90 ? 0 : 99.8,
            responseTime: actualData.memory?.percentage > 90 ? 0 : 12,
            lastCheck: new Date().toISOString(),
            dependencies: []
          },
          {
            name: t('systemHealth.services.emailService'),
            status: 'unknown',
            uptime: 0,
            responseTime: 0,
            lastCheck: new Date().toISOString(),
            dependencies: []
          }
        ];
        
        const transformedOverall = {
          status: actualData.status === 'healthy' ? 'healthy' : actualData.status === 'warning' ? 'degraded' : 'down',
          uptime: actualData.uptime?.system || 0,
          servicesUp: transformedServices.filter(s => s.status === 'healthy').length,
          servicesDown: transformedServices.filter(s => s.status === 'down').length,
          lastIncident: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        };
        
        setServices(transformedServices);
        setOverallHealth(transformedOverall);
      }
    } catch (error) {
      console.error('Error refreshing system health:', error);
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

  const getServiceTranslationKey = (serviceName: string) => {
    const serviceMap: Record<string, string> = {
      'API Server': 'apiServer',
      'Database': 'database',
      'Redis Cache': 'redisCache',
      'Email Service': 'emailService',
      'Load Balancer': 'loadBalancer',
      'Queue Workers': 'queueWorkers',
      'Background Jobs': 'backgroundJobs',
      'AWS S3': 'awsS3',
      'Stripe API': 'stripeApi',
      'SendGrid': 'sendGrid',
      'MongoDB Atlas': 'mongoDbAtlas'
    };
    return serviceMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, '');
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
          <Button onClick={handleRefresh}>
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
              {t(`systemHealth.statusValues.${overallHealth.status}`) || t(`systemHealth.status.${overallHealth.status}`) || overallHealth.status}
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
                        <CardTitle className="font-sans">{t(`systemHealth.services.${getServiceTranslationKey(service.name)}`) || service.name}</CardTitle>
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
                    { name: t('systemHealth.externalServices.awsS3'), status: 'healthy', responseTime: 45 },
                    { name: t('systemHealth.externalServices.stripeApi'), status: 'healthy', responseTime: 120 },
                    { name: t('systemHealth.externalServices.sendGrid'), status: 'down', responseTime: 0 },
                    { name: t('systemHealth.externalServices.mongoDbAtlas'), status: 'healthy', responseTime: 25 }
                  ].map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(dep.status)}
                  <div>
                          <h3 className="font-medium font-sans">{t(`systemHealth.externalServices.${getServiceTranslationKey(dep.name)}`) || dep.name}</h3>
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
                    { name: t('systemHealth.services.loadBalancer'), status: 'healthy', instances: 3 },
                    { name: t('systemHealth.services.redisCache'), status: 'degraded', instances: 2 },
                    { name: t('systemHealth.services.queueWorkers'), status: 'healthy', instances: 5 },
                    { name: t('systemHealth.services.backgroundJobs'), status: 'healthy', instances: 2 }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                  <div>
                          <h3 className="font-medium font-sans">{t(`systemHealth.services.${getServiceTranslationKey(service.name)}`) || service.name}</h3>
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
                    event: 'emailServiceOutage',
                    duration: '2h 15m',
                    impact: 'medium',
                    status: 'resolved'
                  },
                  {
                    time: '2024-01-14T09:15:00Z',
                    event: 'databasePerformanceDegradation',
                    duration: '45m',
                    impact: 'low',
                    status: 'resolved'
                  },
                  {
                    time: '2024-01-13T16:20:00Z',
                    event: 'apiGatewayTimeout',
                    duration: '1h 30m',
                    impact: 'high',
                    status: 'resolved'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(event.status)}
                  <div>
                        <h3 className="font-medium font-sans">{t(`systemHealth.history.${event.event}`)}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {new Date(event.time).toLocaleString()} • {t('systemHealth.history.duration')}: {event.duration}
                        </p>
                    </div>
                  </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.impact === 'high' ? 'destructive' : event.impact === 'medium' ? 'default' : 'secondary'}>
                        {t(`systemHealth.history.${event.impact}Impact`)}
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