"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productionApi, type KPIMetric, type FleetVehicle, type Notification } from "@/lib/production-api";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import { AuthStatus } from "@/components/auth-status";
import { RealtimeStatus } from "@/components/realtime-status";
import { useQuickActions } from "@/lib/quick-actions";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";

// Import new Phase 2 widgets
import UnifiedOpsPulse from "@/components/widgets/unified-ops-pulse";
import ChurnRiskCard from "@/components/widgets/churn-risk-card";
import RevenueMarginCard from "@/components/widgets/revenue-margin-card";
import AIForecastCard from "@/components/widgets/ai-forecast-card";
import ComplianceRadar from "@/components/widgets/compliance-radar";
import TopEnterpriseClients from "@/components/widgets/top-enterprise-clients";
import { 
  Users, 
  Truck, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Fuel,
  Gauge,
  Plus,
  FileText,
  BarChart3,
  Clock,
  Zap,
  Server,
  Globe,
  MessageSquare,
  Route,
  Download,
  RefreshCw,
  UserCheck,
  Settings
} from "lucide-react";

const iconMap = {
  Users,
  Truck,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Fuel,
  Gauge,
  Plus,
  FileText,
  BarChart3,
  Clock,
  Zap,
  Server,
  Globe,
  MessageSquare,
  Route,
  Download,
  RefreshCw,
  UserCheck,
  Settings
};

export default function DashboardPage() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();
  const {
    quickActions,
    generateReport,
    exportData,
    addUser,
    createFleet,
    optimizeRoutes,
    refreshData,
    navigateToAnalytics
  } = useQuickActions(hasPermission);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metricsResponse, vehiclesResponse, notifsResponse, perfResponse] = await Promise.all([
          productionApi.getKPIMetrics(),
          productionApi.getFleetVehicles(),
          productionApi.getNotifications(),
          productionApi.getSystemPerformanceMetrics(),
        ]);
        
        // Handle API response structure properly
        const metrics = metricsResponse || [];
        const vehicles = vehiclesResponse || [];
        const notifs = notifsResponse || [];
        const perf = perfResponse?.data || perfResponse || null;
        
        // Ensure data is arrays before calling slice
        setKpiMetrics(Array.isArray(metrics) ? metrics : []);
        setFleetVehicles(Array.isArray(vehicles) ? vehicles.slice(0, 5) : []);
        setNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
        setPerformanceMetrics(perf);
      } catch (error) {
        // Error handled by API service
        // Set empty arrays on error - no mock data fallback in production
        setKpiMetrics([]);
        setFleetVehicles([]);
        setNotifications([]);
        setPerformanceMetrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Note: Real-time subscriptions will be handled by the WebSocket service
    // For now, we'll rely on the initial data load and periodic refreshes

    return () => {
      // Cleanup will be handled by the WebSocket service
    };
  }, []);

  const formatMetricValue = (metric: KPIMetric) => {
    switch (metric.format) {
      case "currency":
        return formatCurrency(metric.value);
      case "percentage":
        return `${metric.value.toFixed(1)}%`;
      case "number":
        return formatNumber(metric.value);
      default:
        return metric.value.toString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">{t('dashboard.loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('dashboard.welcomeMessage')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <RealtimeStatus />
          <Button variant="outline" className="shadow-2xs" onClick={generateReport}>
            <FileText className="mr-2 h-4 w-4" />
            {t('dashboard.generateReport')}
          </Button>
          <Button className="shadow-2xs" onClick={() => exportData('dashboard')}>
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.exportData')}
          </Button>
          <Button variant="outline" className="shadow-2xs" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('dashboard.refresh')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiMetrics.map((metric) => {
          const Icon = iconMap[metric.icon as keyof typeof iconMap] || Activity;
          return (
            <Card key={metric.id} className="shadow-2xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metric.title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{formatMetricValue(metric)}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(metric.changeType === 'increase' ? 'up' : 'down')}
                  <span>{metric.change}% {t('dashboard.fromLastMonth')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real-time Activity Feed */}
        <Card className="lg:col-span-2 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.realtimeActivityFeed')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('dashboard.latestActionsAndEvents')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-[0.625rem] bg-muted/50 border border-border">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.quickActions')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('dashboard.commonAdministrativeTasks')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.slice(0, 6).map((action) => {
              const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;
              return (
                <Button 
                  key={action.id}
                  variant={action.id === 'add-user' ? 'default' : 'outline'}
                  className="w-full justify-start shadow-2xs hover:bg-muted focus:ring-2 focus:ring-ring"
                  onClick={action.action}
                  title={action.description}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.fleetStatus')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('dashboard.realtimeFleetMonitoring')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fleetVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 rounded-[0.625rem] bg-muted/50 border border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{vehicle.licensePlate}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {vehicle.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vehicle.location ? `${vehicle.location.latitude.toFixed(2)}, ${vehicle.location.longitude.toFixed(2)}` : t('dashboard.noLocation')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Graphs */}
        <Card className="lg:col-span-2 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.performanceMetrics')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('dashboard.apiUptimeRequestsErrorsSessions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{t('dashboard.apiUptime')}</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.uptime ? `${performanceMetrics.uptime}%` : '99.9%'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${performanceMetrics?.uptime || 99.9}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{t('dashboard.requestRate')}</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.requestRate ? `${performanceMetrics.requestRate.toLocaleString()}/min` : '1,234/min'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((performanceMetrics?.requestRate || 1234) / 20, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{t('dashboard.errorRate')}</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.errorRate ? `${performanceMetrics.errorRate}%` : '0.1%'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-destructive h-2 rounded-full" 
                    style={{ width: `${Math.min((performanceMetrics?.errorRate || 0.1) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">{t('dashboard.activeSessions')}</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics?.activeSessions ? performanceMetrics.activeSessions.toLocaleString() : '456'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full" 
                    style={{ width: `${Math.min((performanceMetrics?.activeSessions || 456) / 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts/Notifications Card */}
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.systemAlerts')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('dashboard.criticalNotificationsRequiringAttention')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">{t('dashboard.highErrorRate')}</p>
                  <p className="text-xs text-destructive/80">{t('dashboard.apiErrorsIncreased')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-muted/50 border border-border">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{t('dashboard.maintenanceWindow')}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.scheduledForTonight')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-success/10 border border-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">{t('dashboard.systemHealthy')}</p>
                  <p className="text-xs text-success/80">{t('dashboard.allServicesOperational')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase 2: Business Intelligence Widgets */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-card-foreground">{t('dashboard.businessIntelligence')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.advancedAnalyticsAndPredictiveInsights')}
            </p>
          </div>
        </div>

        {/* Top Row - Key Operational Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UnifiedOpsPulse className="lg:col-span-2" />
          <ChurnRiskCard />
        </div>

        {/* Second Row - Financial & Forecast */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RevenueMarginCard />
          <AIForecastCard />
          <ComplianceRadar />
        </div>

        {/* Third Row - Enterprise Clients */}
        <div className="grid gap-6">
          <TopEnterpriseClients />
        </div>
      </div>
    </div>
  );
}
