"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useQuickActions } from "@/lib/quick-actions";
import { handleError, handleDataLoadError } from "@/lib/error-handler";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";
import { useLanguage } from "@/contexts/language-context";

// Import new Phase 2 widgets
import AdoptionFunnel from "@/components/widgets/adoption-funnel";
import CustomerLifetimeValue from "@/components/widgets/customer-lifetime-value";
import FeatureUsage from "@/components/widgets/feature-usage";
import ChurnAttribution from "@/components/widgets/churn-attribution";
import ForecastAccuracy from "@/components/widgets/forecast-accuracy";
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  DollarSign,
  Activity,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Target,
  PieChart,
  LineChart,
  Settings,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AnalyticsMetric {
  _id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  unit: string;
  category: "users" | "revenue" | "fleet" | "engagement" | "performance";
  period: "daily" | "weekly" | "monthly" | "yearly";
  timestamp: string;
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  retentionRate: number;
  demographics: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
    devices: Record<string, number>;
  };
  behavior: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    conversionRate: number;
  };
}

interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  revenueBySource: Record<string, number>;
  revenueByRegion: Record<string, number>;
  subscriptionRevenue: number;
  oneTimeRevenue: number;
}

interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesByType: Record<string, number>;
  averageMileage: number;
  fuelEfficiency: number;
  maintenanceCosts: number;
  utilizationRate: number;
  geographicDistribution: Record<string, number>;
}

interface EngagementAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  pageViews: number;
  uniqueVisitors: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  trafficSources: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  geographicData: Record<string, number>;
}

interface AnalyticsReport {
  _id: string;
  name: string;
  type: "custom" | "scheduled" | "automated";
  status: "generating" | "completed" | "failed";
  metrics: string[];
  dateRange: {
    start: string;
    end: string;
  };
  filters: Record<string, unknown>;
  generatedAt: string;
  generatedBy: string;
  fileUrl?: string;
  insights: string[];
}

export default function AnalyticsPage() {
  const { language } = useLanguage();
  const { t } = useTranslations();
  
  // Safety check for translation function and language context
  if (!t || !language) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Analytics...</h1>
          <p className="text-muted-foreground">Initializing translation system...</p>
        </div>
      </div>
    );
  }
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [fleetAnalytics, setFleetAnalytics] = useState<FleetAnalytics | null>(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasPermission } = useAuth();
  // Safely get quick actions with error handling
  let generateReport: (() => void) | null = null;
  let exportData: (() => void) | null = null;
  
  try {
    // Ensure hasPermission is a function before using it
    const permissionCheck = typeof hasPermission === 'function' ? hasPermission : () => true;
    const quickActions = useQuickActions(permissionCheck);
    generateReport = quickActions.generateReport;
    exportData = quickActions.exportData;
  } catch (error) {
    handleError(error, { component: 'AnalyticsPage', action: 'initialize_quick_actions' });
  }

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadAnalyticsData = async () => {
      if (!user || !isMounted) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          // Load all analytics data with error handling
          const [metricsData, userData, revenueData, fleetData, engagementData, reportsData] = await Promise.allSettled([
            productionApi.getAnalyticsMetrics(),
            productionApi.getAnalyticsData('users', { period: selectedTimeRange }),
            productionApi.getAnalyticsData('revenue', { period: selectedTimeRange }),
            productionApi.getAnalyticsData('fleet', { period: selectedTimeRange }),
            productionApi.getAnalyticsData('engagement', { period: selectedTimeRange }),
            productionApi.getReports()
          ]);

          // Handle metrics data
          const metricsArray = metricsData.status === 'fulfilled' && Array.isArray(metricsData.value) 
            ? metricsData.value 
            : [];
          
          // Handle user analytics data
          const userAnalyticsData = userData.status === 'fulfilled' && userData.value 
            ? userData.value as unknown as UserAnalytics 
            : null;
          
          // Handle revenue analytics data
          const revenueAnalyticsData = revenueData.status === 'fulfilled' && revenueData.value 
            ? revenueData.value as unknown as RevenueAnalytics 
            : null;
          
          // Handle fleet analytics data
          const fleetAnalyticsData = fleetData.status === 'fulfilled' && fleetData.value 
            ? fleetData.value as unknown as FleetAnalytics 
            : null;
          
          // Handle engagement analytics data
          const engagementAnalyticsData = engagementData.status === 'fulfilled' && engagementData.value 
            ? engagementData.value as unknown as EngagementAnalytics 
            : null;
          
          // Handle reports data
          const reportsArray = reportsData.status === 'fulfilled' && Array.isArray(reportsData.value) 
            ? reportsData.value as unknown as AnalyticsReport[] 
            : [];
          
          if (isMounted) {
            setMetrics(metricsArray);
            setUserAnalytics(userAnalyticsData);
            setRevenueAnalytics(revenueAnalyticsData);
            setFleetAnalytics(fleetAnalyticsData);
            setEngagementAnalytics(engagementAnalyticsData);
            setReports(reportsArray);
          }
          
          // Log any errors
          if (metricsData.status === 'rejected') {
            handleDataLoadError(metricsData.reason, 'metrics');
          }
          if (userData.status === 'rejected') {
            handleDataLoadError(userData.reason, 'user_analytics');
          }
          if (revenueData.status === 'rejected') {
            handleDataLoadError(revenueData.reason, 'revenue_analytics');
          }
          if (fleetData.status === 'rejected') {
            handleDataLoadError(fleetData.reason, 'fleet_analytics');
          }
          if (engagementData.status === 'rejected') {
            handleDataLoadError(engagementData.reason, 'engagement_analytics');
          }
          if (reportsData.status === 'rejected') {
            handleDataLoadError(reportsData.reason, 'reports');
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'analytics_data');
        // Set empty data instead of mock data
        setMetrics([]);
        setUserAnalytics(null);
        setRevenueAnalytics(null);
        setFleetAnalytics(null);
        setEngagementAnalytics(null);
        setReports([]);
      } finally {
        if (isMounted) {
        setIsLoading(false);
        }
      }
    };

    loadAnalyticsData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, selectedTimeRange]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "text-success";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          {hasPermission("generate_reports") && (
            <>
              <Button variant="outline" onClick={generateReport || (() => {})}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button onClick={() => exportData?.()}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAnalytics?.totalUsers ? userAnalytics.totalUsers.toLocaleString() : "0"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getChangeIcon("increase")}
              <span className={getChangeColor("increase")}>
                +{userAnalytics?.userGrowth ? userAnalytics.userGrowth.toFixed(1) : 0}%
              </span>
              <span>from last period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueAnalytics ? formatCurrency(revenueAnalytics.monthlyRevenue) : "0 EGP"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getChangeIcon("increase")}
              <span className={getChangeColor("increase")}>
                +{revenueAnalytics?.revenueGrowth ? revenueAnalytics.revenueGrowth.toFixed(1) : 0}%
              </span>
              <span>{t('analytics.fromLastMonth')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.activeVehicles')}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fleetAnalytics?.activeVehicles ? fleetAnalytics.activeVehicles.toLocaleString() : "0"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>
                {fleetAnalytics?.utilizationRate ? (fleetAnalytics.utilizationRate * 100).toFixed(1) : 0}% {t('dashboard.utilizationRate')}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementAnalytics ? Math.round(engagementAnalytics.averageSessionDuration / 60) : 0}m
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>
                {engagementAnalytics?.pageViews ? engagementAnalytics.pageViews.toLocaleString() : 0} {t('dashboard.pageViews')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              {t('dashboard.userAnalytics')}
            </CardTitle>
            <CardDescription>
              User growth and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.newUsers')}</p>
                    <p className="text-2xl font-bold">{userAnalytics?.newUsers ? userAnalytics.newUsers.toLocaleString() : "0"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.retentionRate')}</p>
                    <p className="text-2xl font-bold">{userAnalytics?.retentionRate ? (userAnalytics.retentionRate * 100).toFixed(1) : "0"}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">{t('dashboard.topLocations')}</p>
                  <div className="space-y-2">
                    {userAnalytics?.demographics?.locations ? Object.entries(userAnalytics.demographics.locations)
                      .slice(0, 3)
                      .map(([location, count]) => (
                        <div key={location} className="flex justify-between text-sm">
                          <span>{location}</span>
                          <span>{(count || 0).toLocaleString()}</span>
                        </div>
                      )) : null}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">{t('dashboard.deviceBreakdown')}</p>
                  <div className="space-y-2">
                    {userAnalytics?.demographics?.devices ? Object.entries(userAnalytics.demographics.devices).map(([device, count]) => (
                      <div key={device} className="flex justify-between text-sm">
                        <span className="flex items-center">
                          {device === "mobile" ? <Smartphone className="mr-1 h-3 w-3" /> : 
                           device === "desktop" ? <Monitor className="mr-1 h-3 w-3" /> : 
                           <Globe className="mr-1 h-3 w-3" />}
                          {device}
                        </span>
                        <span>{(count || 0).toLocaleString()}</span>
                      </div>
                    )) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No user analytics data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              {t('dashboard.revenueAnalytics')}
            </CardTitle>
            <CardDescription>
              Revenue trends and sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalRevenue')}</p>
                    <p className="text-2xl font-bold">{revenueAnalytics?.totalRevenue ? formatCurrency(revenueAnalytics.totalRevenue) : "0 EGP"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.avgOrderValue')}</p>
                    <p className="text-2xl font-bold">{revenueAnalytics?.averageOrderValue ? formatCurrency(revenueAnalytics.averageOrderValue) : "0 EGP"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">{t('dashboard.revenueBySource')}</p>
                  <div className="space-y-2">
                    {revenueAnalytics?.revenueBySource ? Object.entries(revenueAnalytics.revenueBySource).map(([source, amount]) => (
                      <div key={source} className="flex justify-between text-sm">
                        <span>{source}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    )) : null}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">{t('dashboard.revenueByRegion')}</p>
                  <div className="space-y-2">
                    {revenueAnalytics?.revenueByRegion ? Object.entries(revenueAnalytics.revenueByRegion)
                      .slice(0, 3)
                      .map(([region, amount]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span>{region}</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                      )) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No revenue analytics data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fleet Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              {t('dashboard.fleetAnalytics')}
            </CardTitle>
            <CardDescription>
              Vehicle performance and utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fleetAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalVehicles')}</p>
                    <p className="text-2xl font-bold">{fleetAnalytics?.totalVehicles ? fleetAnalytics.totalVehicles.toLocaleString() : "0"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.avgMileage')}</p>
                    <p className="text-2xl font-bold">{fleetAnalytics?.averageMileage ? fleetAnalytics.averageMileage.toLocaleString() : "0"} mi</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Vehicles by Type</p>
                  <div className="space-y-2">
                    {fleetAnalytics?.vehiclesByType ? Object.entries(fleetAnalytics.vehiclesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span>{(count || 0).toLocaleString()}</span>
                      </div>
                    )) : null}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Performance Metrics</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fuel Efficiency</span>
                      <span>{fleetAnalytics?.fuelEfficiency ? fleetAnalytics.fuelEfficiency.toFixed(1) : "0"} MPG</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Maintenance Costs</span>
                      <span>{fleetAnalytics?.maintenanceCosts ? formatCurrency(fleetAnalytics.maintenanceCosts) : "0 EGP"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilization Rate</span>
                      <span>{fleetAnalytics?.utilizationRate ? (fleetAnalytics.utilizationRate * 100).toFixed(1) : "0"}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No fleet analytics data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Engagement Analytics
            </CardTitle>
            <CardDescription>
              User behavior and website performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {engagementAnalytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{engagementAnalytics?.totalSessions ? engagementAnalytics.totalSessions.toLocaleString() : "0"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">{engagementAnalytics?.uniqueVisitors ? engagementAnalytics.uniqueVisitors.toLocaleString() : "0"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Top Pages</p>
                  <div className="space-y-2">
                    {engagementAnalytics?.topPages ? engagementAnalytics.topPages.slice(0, 3).map((page) => (
                      <div key={page.path} className="flex justify-between text-sm">
                        <span className="truncate">{page.path}</span>
                        <span>{(page.views || 0).toLocaleString()}</span>
                      </div>
                    )) : null}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Traffic Sources</p>
                  <div className="space-y-2">
                    {engagementAnalytics?.trafficSources ? Object.entries(engagementAnalytics.trafficSources)
                      .slice(0, 3)
                      .map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span>{source}</span>
                          <span>{(count || 0).toLocaleString()}</span>
                        </div>
                      )) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No engagement analytics data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Reports</CardTitle>
          <CardDescription>
            Generated reports and data exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(reports) ? reports.map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-[0.625rem] bg-muted flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.metrics?.length || 0} metrics • {report.generatedAt ? formatDate(report.generatedAt) : 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={report.status === "completed" ? "default" : 
                                     report.status === "failed" ? "destructive" : "secondary"}>
                        {report.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Generated by {report.generatedBy}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.fileUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )) : null}
          </div>

          {(!reports || reports.length === 0) && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analytics reports available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2: Advanced Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Advanced Analytics</h2>
            <p className="text-muted-foreground">
              Go beyond vanity metrics → decision-grade insights
            </p>
          </div>
        </div>

        {/* Top Row - Funnel & CLV */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AdoptionFunnel className="lg:col-span-2" />
          <CustomerLifetimeValue />
        </div>

        {/* Second Row - Feature Usage & Churn */}
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureUsage />
          <ChurnAttribution />
        </div>

        {/* Third Row - Forecast Accuracy */}
        <div className="grid gap-6">
          <ForecastAccuracy />
        </div>
      </div>
    </div>
  );
}


