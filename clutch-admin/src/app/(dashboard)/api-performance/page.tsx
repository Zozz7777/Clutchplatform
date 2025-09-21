"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productionApi } from "@/lib/production-api";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { logger } from "@/lib/logger";
import { useTranslations } from "@/hooks/use-translations";
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Zap,
  Globe,
  Database
} from "lucide-react";

interface ApiEndpoint {
  name: string;
  method: string;
  requestsPerMinute: number;
  p95Latency: number;
  errorRate: number;
  status: "healthy" | "degraded" | "down";
  lastUpdate: string;
}

interface ApiPerformanceData {
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  endpoints: ApiEndpoint[];
}

export default function ApiPerformancePage() {
  const { t } = useTranslations();
  const [performanceData, setPerformanceData] = useState<ApiPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadApiPerformance = async () => {
      try {
        const result = await productionApi.getApiPerformance();
        if (result.success) {
          setPerformanceData(result.data);
        } else {
          // Set empty data if API fails
          setPerformanceData({
            endpoints: [],
            totalRequests: 0,
            averageResponseTime: 0,
            errorRate: 0,
            uptime: 0
          });
        }
      } catch (error) {
        logger.error("Failed to load API performance data:", error);
        setPerformanceData({
          endpoints: [],
          totalRequests: 0,
          averageResponseTime: 0,
          errorRate: 0,
          uptime: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApiPerformance();

    // Refresh data every 30 seconds
    const interval = setInterval(loadApiPerformance, 30000);
    return () => clearInterval(interval);
  }, []);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "success";
      case "degraded":
        return "warning";
      case "down":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "down":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-primary/10 text-primary-foreground";
      case "POST":
        return "bg-secondary/10 text-secondary-foreground";
      case "PUT":
        return "bg-secondary/10 text-secondary-foreground";
      case "DELETE":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API performance data...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load API performance data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.apiPerformanceAndUsage')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.monitorApiEndpoints')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* High-Level KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalRequests')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(performanceData.totalRequests)}
            </div>
            <p className="text-xs text-muted-foreground">
              requests per minute
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.averageLatency')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(performanceData.averageLatency)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              P95 response time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.errorRate')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              failed requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.uptime')}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.uptime.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              system availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
          <CardDescription>
            Real-time performance metrics for all API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(endpoint.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{endpoint.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(endpoint.lastUpdate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{formatNumber(endpoint.requestsPerMinute)}</p>
                    <p className="text-xs text-muted-foreground">RPM</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{endpoint.p95Latency}ms</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.p95Latency')}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-sm font-medium ${endpoint.errorRate > 2 ? "text-destructive" : endpoint.errorRate > 1 ? "text-warning" : "text-success"}`}>
                      {endpoint.errorRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.errorRate')}</p>
                  </div>
                  
                  <Badge variant={getStatusColor(endpoint.status) as "default" | "secondary" | "destructive" | "outline"}>
                    {endpoint.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>
              Average response time over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Response time chart would be displayed here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>
              Total requests per hour over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Request volume chart would be displayed here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


