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
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
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
        const [metricsResponse, vehiclesResponse, notifsResponse] = await Promise.all([
          productionApi.getKPIMetrics(),
          productionApi.getFleetVehicles(),
          productionApi.getNotifications(),
        ]);
        
        // Handle API response structure properly
        const metrics = metricsResponse?.data || metricsResponse || [];
        const vehicles = vehiclesResponse?.data || vehiclesResponse || [];
        const notifs = notifsResponse?.data?.notifications || notifsResponse?.data || notifsResponse || [];
        
        // Ensure data is arrays before calling slice
        setKpiMetrics(Array.isArray(metrics) ? metrics : []);
        setFleetVehicles(Array.isArray(vehicles) ? vehicles.slice(0, 5) : []);
        setNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Set empty arrays on error - no mock data fallback in production
        setKpiMetrics([]);
        setFleetVehicles([]);
        setNotifications([]);
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
          <p className="text-muted-foreground font-sans">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Dashboard</h1>
          <p className="text-muted-foreground font-sans">
            Welcome to Clutch Admin. Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <RealtimeStatus />
          <Button variant="outline" className="shadow-sm" onClick={generateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button className="shadow-sm" onClick={() => exportData('dashboard')}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="shadow-sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiMetrics.map((metric) => {
          const Icon = iconMap[metric.icon as keyof typeof iconMap];
          return (
            <Card key={metric.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metric.title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatMetricValue(metric)}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(metric.trend)}
                  <span>{metric.change}% from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real-time Activity Feed */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Real-time Activity Feed</CardTitle>
            <CardDescription>Latest actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.slice(0, 6).map((action) => {
              const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;
              return (
                <Button 
                  key={action.id}
                  variant={action.id === 'add-user' ? 'default' : 'outline'}
                  className="w-full justify-start shadow-sm"
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
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Fleet Status</CardTitle>
            <CardDescription>Real-time fleet monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fleetVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{vehicle.licensePlate}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {vehicle.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vehicle.location ? `${vehicle.location.lat.toFixed(2)}, ${vehicle.location.lng.toFixed(2)}` : 'No location'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Graphs */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Performance Metrics</CardTitle>
            <CardDescription>API uptime, requests, errors, and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">API Uptime</span>
                  <span className="text-sm text-muted-foreground">99.9%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Request Rate</span>
                  <span className="text-sm text-muted-foreground">1,234/min</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Error Rate</span>
                  <span className="text-sm text-muted-foreground">0.1%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full" style={{ width: '0.1%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Active Sessions</span>
                  <span className="text-sm text-muted-foreground">456</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts/Notifications Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">System Alerts</CardTitle>
            <CardDescription>Critical notifications requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive-foreground">High Error Rate</p>
                  <p className="text-xs text-destructive-foreground/80">API errors increased by 15%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted border border-border">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Maintenance Window</p>
                  <p className="text-xs text-muted-foreground">Scheduled for tonight 2AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary-foreground">System Healthy</p>
                  <p className="text-xs text-primary-foreground/80">All services operational</p>
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Business Intelligence</h2>
            <p className="text-muted-foreground">
              Advanced analytics and predictive insights for data-driven decisions
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
