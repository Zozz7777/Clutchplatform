"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useQuickActions } from "@/lib/quick-actions";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";

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
  filters: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
  fileUrl?: string;
  insights: string[];
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [fleetAnalytics, setFleetAnalytics] = useState<FleetAnalytics | null>(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { generateReport, exportData } = useQuickActions(hasPermission);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Load analytics metrics using production API
        const metricsData = await productionApi.getAnalyticsMetrics();
        setMetrics(metricsData || []);

        // Load user analytics
        const userData = await productionApi.getAnalyticsData('users', { period: selectedTimeRange });
        setUserAnalytics(userData || null);

        // Load revenue analytics
        const revenueData = await productionApi.getAnalyticsData('revenue', { period: selectedTimeRange });
        setRevenueAnalytics(revenueData || null);

        // Load fleet analytics
        const fleetData = await productionApi.getAnalyticsData('fleet', { period: selectedTimeRange });
        setFleetAnalytics(fleetData || null);

        // Load engagement analytics
        const engagementData = await productionApi.getAnalyticsData('engagement', { period: selectedTimeRange });
        setEngagementAnalytics(engagementData || null);

        // Load analytics reports
        const reportsData = await productionApi.getReports();
        setReports(reportsData || []);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
        // Set empty data instead of mock data
        setMetrics([]);
        setUserAnalytics(null);
        setRevenueAnalytics(null);
        setFleetAnalytics(null);
        setEngagementAnalytics(null);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedTimeRange]);

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
            Business intelligence and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          {hasPermission("generate_reports") && (
            <>
              <Button variant="outline" onClick={generateReport}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button onClick={() => exportData('analytics')}>
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
              {userAnalytics ? userAnalytics.totalUsers.toLocaleString() : "0"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getChangeIcon("increase")}
              <span className={getChangeColor("increase")}>
                +{userAnalytics ? userAnalytics.userGrowth.toFixed(1) : 0}%
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
              {revenueAnalytics ? formatCurrency(revenueAnalytics.monthlyRevenue) : "$0"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getChangeIcon("increase")}
              <span className={getChangeColor("increase")}>
                +{revenueAnalytics ? revenueAnalytics.revenueGrowth.toFixed(1) : 0}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fleetAnalytics ? fleetAnalytics.activeVehicles.toLocaleString() : "0"}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>
                {fleetAnalytics ? (fleetAnalytics.utilizationRate * 100).toFixed(1) : 0}% utilization
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
                {engagementAnalytics ? engagementAnalytics.pageViews.toLocaleString() : 0} page views
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
              User Analytics
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
                    <p className="text-sm text-muted-foreground">New Users</p>
                    <p className="text-2xl font-bold">{userAnalytics.newUsers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold">{(userAnalytics.retentionRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Top Locations</p>
                  <div className="space-y-2">
                    {Object.entries(userAnalytics.demographics.locations)
                      .slice(0, 3)
                      .map(([location, count]) => (
                        <div key={location} className="flex justify-between text-sm">
                          <span>{location}</span>
                          <span>{count.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Device Breakdown</p>
                  <div className="space-y-2">
                    {Object.entries(userAnalytics.demographics.devices).map(([device, count]) => (
                      <div key={device} className="flex justify-between text-sm">
                        <span className="flex items-center">
                          {device === "mobile" ? <Smartphone className="mr-1 h-3 w-3" /> : 
                           device === "desktop" ? <Monitor className="mr-1 h-3 w-3" /> : 
                           <Globe className="mr-1 h-3 w-3" />}
                          {device}
                        </span>
                        <span>{count.toLocaleString()}</span>
                      </div>
                    ))}
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
              Revenue Analytics
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
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueAnalytics.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueAnalytics.averageOrderValue)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Revenue by Source</p>
                  <div className="space-y-2">
                    {Object.entries(revenueAnalytics.revenueBySource).map(([source, amount]) => (
                      <div key={source} className="flex justify-between text-sm">
                        <span>{source}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Revenue by Region</p>
                  <div className="space-y-2">
                    {Object.entries(revenueAnalytics.revenueByRegion)
                      .slice(0, 3)
                      .map(([region, amount]) => (
                        <div key={region} className="flex justify-between text-sm">
                          <span>{region}</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                      ))}
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
              Fleet Analytics
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
                    <p className="text-sm text-muted-foreground">Total Vehicles</p>
                    <p className="text-2xl font-bold">{fleetAnalytics.totalVehicles.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Mileage</p>
                    <p className="text-2xl font-bold">{fleetAnalytics.averageMileage.toLocaleString()} mi</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Vehicles by Type</p>
                  <div className="space-y-2">
                    {Object.entries(fleetAnalytics.vehiclesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span>{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Performance Metrics</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fuel Efficiency</span>
                      <span>{fleetAnalytics.fuelEfficiency.toFixed(1)} MPG</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Maintenance Costs</span>
                      <span>{formatCurrency(fleetAnalytics.maintenanceCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilization Rate</span>
                      <span>{(fleetAnalytics.utilizationRate * 100).toFixed(1)}%</span>
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
                    <p className="text-2xl font-bold">{engagementAnalytics.totalSessions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Visitors</p>
                    <p className="text-2xl font-bold">{engagementAnalytics.uniqueVisitors.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Top Pages</p>
                  <div className="space-y-2">
                    {engagementAnalytics.topPages.slice(0, 3).map((page) => (
                      <div key={page.path} className="flex justify-between text-sm">
                        <span className="truncate">{page.path}</span>
                        <span>{page.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Traffic Sources</p>
                  <div className="space-y-2">
                    {Object.entries(engagementAnalytics.trafficSources)
                      .slice(0, 3)
                      .map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span>{source}</span>
                          <span>{count.toLocaleString()}</span>
                        </div>
                      ))}
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
            {reports.map((report) => (
              <div key={report._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-[0.625rem] bg-muted flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.metrics.length} metrics • {formatDate(report.generatedAt)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={report.status === "completed" ? "success" : 
                                     report.status === "failed" ? "destructive" : "warning"}>
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
            ))}
          </div>

          {reports.length === 0 && (
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
