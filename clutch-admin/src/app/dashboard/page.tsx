"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAPI, type KPIMetric, type FleetVehicle, type Notification } from "@/lib/mock-api";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
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
  Gauge
} from "lucide-react";

const iconMap = {
  Users,
  Truck,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
};

export default function DashboardPage() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metrics, vehicles, notifs] = await Promise.all([
          mockAPI.getKPIMetrics(),
          mockAPI.getFleetVehicles(),
          mockAPI.getNotifications(),
        ]);
        
        setKpiMetrics(metrics);
        setFleetVehicles(vehicles.slice(0, 5)); // Show only first 5 vehicles
        setNotifications(notifs.slice(0, 5)); // Show only first 5 notifications
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Subscribe to real-time updates
    const unsubscribeFleet = mockAPI.subscribeToFleetUpdates((vehicles) => {
      setFleetVehicles(vehicles.slice(0, 5));
    });

    const unsubscribeKPIs = mockAPI.subscribeToKPIMetrics((metrics) => {
      setKpiMetrics(metrics);
    });

    return () => {
      unsubscribeFleet();
      unsubscribeKPIs();
    };
  }, []);

  const formatMetricValue = (metric: KPIMetric) => {
    switch (metric.format) {
      case "currency":
        return formatCurrency(metric.value);
      case "percentage":
        return `${metric.value.toFixed(1)}%`;
      default:
        return formatNumber(metric.value);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "offline":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Clutch Admin. Here's what's happening with your platform.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiMetrics.map((metric) => {
          const Icon = iconMap[metric.icon as keyof typeof iconMap];
          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetricValue(metric)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {metric.changeType === "increase" ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={metric.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fleet Overview and Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fleet Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Overview</CardTitle>
            <CardDescription>
              Recent fleet activity and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fleetVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(vehicle.status) as any}>
                      {vehicle.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(vehicle.lastUpdate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Vehicles
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Latest system alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === "error" ? "bg-red-500" :
                    notification.type === "warning" ? "bg-yellow-500" :
                    notification.type === "success" ? "bg-green-500" :
                    "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Notifications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Add User</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Truck className="h-6 w-6 mb-2" />
              <span>Add Vehicle</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Process Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Activity className="h-6 w-6 mb-2" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
