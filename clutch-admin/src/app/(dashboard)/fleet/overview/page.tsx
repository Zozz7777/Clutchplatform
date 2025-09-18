"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { realApi } from "@/lib/real-api";
import { type FleetVehicle } from "@/lib/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  Truck, 
  MapPin, 
  Fuel, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Route, 
  Activity, 
  TrendingUp, 
  Navigation, 
  Car,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Wrench
} from "lucide-react";

export default function FleetOverviewPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadFleetData = async () => {
      try {
        const fleetData = await realApi.getFleetVehicles();
        setVehicles(fleetData);
      } catch (error) {
        console.error("Failed to load fleet data:", error);
        toast.error("Failed to load fleet overview");
      } finally {
        setIsLoading(false);
      }
    };

    loadFleetData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading fleet overview...</p>
        </div>
      </div>
    );
  }

  const activeVehicles = (vehicles || []).filter(v => v.status === "active").length;
  const maintenanceVehicles = (vehicles || []).filter(v => v.status === "maintenance").length;
  const totalMileage = (vehicles || []).reduce((sum, v) => sum + v.mileage, 0);
  const averageFuelEfficiency = (vehicles || []).length > 0 
    ? (vehicles || []).reduce((sum, v) => sum + v.fuelEfficiency, 0) / (vehicles || []).length 
    : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Fleet Overview</h1>
          <p className="text-muted-foreground font-sans">
            Comprehensive fleet management dashboard and analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="shadow-sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button className="shadow-sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{(vehicles || []).length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Fleet</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {((activeVehicles / vehicles.length) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Mileage</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMileage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Avg Fuel Efficiency</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{averageFuelEfficiency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3</span> MPG improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Status Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Fleet Status Distribution</CardTitle>
            <CardDescription>Current status of all fleet vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{activeVehicles} vehicles</span>
                  <Badge variant="secondary">{((activeVehicles / vehicles.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Maintenance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{maintenanceVehicles} vehicles</span>
                  <Badge variant="secondary">{((maintenanceVehicles / vehicles.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">Issues</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{vehicles.filter(v => v.status === "issue").length} vehicles</span>
                  <Badge variant="destructive">{((vehicles.filter(v => v.status === "issue").length / vehicles.length) * 100).toFixed(1)}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
            <CardDescription>Latest fleet operations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(vehicles || []).slice(0, 5).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Truck className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      vehicle.status === "active" ? "bg-primary/10 text-primary-foreground" :
                      vehicle.status === "maintenance" ? "bg-secondary/10 text-secondary-foreground" :
                      "bg-destructive/10 text-destructive-foreground"
                    }>
                      {vehicle.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(vehicle.lastMaintenance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Usage</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Fleet Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <LineChart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">94.2%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">87.5%</p>
                  <p className="text-sm text-muted-foreground">Efficiency</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">+12%</p>
                  <p className="text-sm text-muted-foreground">Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Maintenance Schedule</CardTitle>
              <CardDescription>Upcoming and overdue maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Upcoming Maintenance</h3>
                  <Button size="sm" className="shadow-sm">
                    <Wrench className="mr-2 h-4 w-4" />
                    Schedule New
                  </Button>
                </div>
                <div className="space-y-3">
                  {vehicles.filter(v => v.status === "maintenance").map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Scheduled</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(vehicle.lastMaintenance)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {vehicles.filter(v => v.status === "maintenance").length === 0 && (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No maintenance scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Fuel Usage Analytics</CardTitle>
              <CardDescription>Fuel consumption patterns and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Fuel className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{averageFuelEfficiency.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Avg MPG</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">+5.2%</p>
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">$2,340</p>
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Top Performing Vehicles</h3>
                  <div className="space-y-2">
                    {vehicles
                      .sort((a, b) => b.fuelEfficiency - a.fuelEfficiency)
                      .slice(0, 5)
                      .map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Fuel className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{vehicle.fuelEfficiency} MPG</p>
                            <p className="text-sm text-muted-foreground">{vehicle.mileage.toLocaleString()} miles</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Route Optimization</CardTitle>
              <CardDescription>Route planning and optimization tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Route className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-sm text-muted-foreground">Active Routes</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Navigation className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">-12%</p>
                    <p className="text-sm text-muted-foreground">Distance Saved</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">-18min</p>
                    <p className="text-sm text-muted-foreground">Avg Time Saved</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Recent Route Optimizations</h3>
                    <Button size="sm" variant="outline" className="shadow-sm">
                      <Route className="mr-2 h-4 w-4" />
                      Optimize All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {vehicles.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Navigation className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Optimized</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.floor(Math.random() * 20) + 5} min saved
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
