"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productionApi } from "@/lib/production-api";
import { realApi } from "@/lib/real-api";
import { websocketService } from "@/lib/websocket-service";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { handleError, handleWarning, handleWebSocketError, handleDataLoadError } from "@/lib/error-handler";

// Import new Phase 2 widgets
import FleetUtilization from "@/components/widgets/fleet-utilization";
import MaintenanceForecast from "@/components/widgets/maintenance-forecast";
import FuelCostMetrics from "@/components/widgets/fuel-cost-metrics";
import DowntimeImpact from "@/components/widgets/downtime-impact";
import { ErrorBoundary } from "@/components/error-boundary";

// Define FleetVehicle type locally since we're not using mock API
interface FleetVehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  mileage: number;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  fuelEfficiency: number;
  createdAt: string;
  updatedAt: string;
}

// OBD2 specific interface
interface OBD2Data {
  id: string;
  vehicleId: string;
  engineRPM: number;
  speed: number;
  fuelLevel: number;
  engineTemp: number;
  batteryVoltage: number;
  errorCodes: string[];
  timestamp: string;
}

import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  MapPin,
  Fuel,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Route,
  Wrench,
  Activity,
  TrendingUp,
  Navigation,
  Car,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Wifi,
  Battery,
  Thermometer
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FleetPage() {
  // Main fleet state
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // OBD2 state
  const [obd2Data, setObd2Data] = useState<OBD2Data[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadFleetData = async () => {
      try {
        setIsLoading(true);
        
        // Load fleet vehicles
        const fleetData = await productionApi.getFleetVehicles();
        const vehiclesArray = Array.isArray(fleetData) ? fleetData : [];
        setVehicles(vehiclesArray);
        setFilteredVehicles(vehiclesArray);

        // Load OBD2 data
        const obd2Response = await productionApi.getOBD2Data?.() || Promise.resolve([]);
        setObd2Data(Array.isArray(obd2Response) ? obd2Response : []);

      } catch (error) {
        handleDataLoadError(error, { component: 'FleetPage', action: 'load_fleet_data' });
        toast.error('Failed to load fleet data');
        setVehicles([]);
        setFilteredVehicles([]);
        setObd2Data([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFleetData();

    // Subscribe to real-time fleet updates
    let unsubscribe: (() => void) | null = null;
    try {
      if (websocketService && typeof websocketService.subscribeToFleetUpdates === 'function') {
        unsubscribe = websocketService.subscribeToFleetUpdates((data: any) => {
          setVehicles(prevVehicles => 
            prevVehicles.map(vehicle => 
              vehicle.id === data.vehicleId ? { ...vehicle, ...data } : vehicle
            )
          );
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToFleetUpdates method not found', { component: 'FleetPage' });
      }
    } catch (error) {
      handleWebSocketError(error, 'fleet', 'subscription');
    }

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(websocketService.getConnectionStatus());
    }, 1000);

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          handleWebSocketError(error, 'fleet', 'unsubscribe');
        }
      }
      clearInterval(statusInterval);
    };
  }, []);

  useEffect(() => {
    const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
    let filtered = vehiclesArray.filter(vehicle => vehicle != null);

    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        (vehicle.licensePlate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.make || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.model || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle && vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "maintenance":
        return "bg-warning/10 text-warning-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "offline":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-warning" />;
      case "inactive":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Fleet Management</h1>
          <p className="text-muted-foreground font-sans">
            Monitor and manage your vehicle fleet, OBD2 data, and maintenance schedules
          </p>
        </div>
        {hasPermission("manage_fleet") && (
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
          <TabsTrigger value="vehicles">All Vehicles</TabsTrigger>
          <TabsTrigger value="obd2">OBD2 Data</TabsTrigger>
        </TabsList>

        {/* Fleet Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Analytics Widgets */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ErrorBoundary>
              <FleetUtilization />
            </ErrorBoundary>
            <ErrorBoundary>
              <MaintenanceForecast />
            </ErrorBoundary>
            <ErrorBoundary>
              <FuelCostMetrics />
            </ErrorBoundary>
            <ErrorBoundary>
              <DowntimeImpact />
            </ErrorBoundary>
          </div>

          {/* Fleet Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground font-sans">
                  {vehicles.filter(v => v.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Maintenance Due</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {vehicles.filter(v => v.status === 'maintenance').length}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Vehicles needing service
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Average Fuel Level</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length) : 0}%
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Fleet average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Connection Status</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans capitalize">{connectionStatus}</div>
                <p className="text-xs text-muted-foreground font-sans">
                  Real-time updates
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Fleet Activity</CardTitle>
              <CardDescription>
                Latest updates from your fleet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(vehicle.status)}
                      <div>
                        <h3 className="font-medium">{vehicle.licensePlate}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.make} {vehicle.model} • {vehicle.mileage.toLocaleString()} miles
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {formatRelativeTime(vehicle.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Vehicles</CardTitle>
              <CardDescription>
                Manage and monitor all vehicles in your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicles Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Fuel Level</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Truck className="h-8 w-8 text-primary" />
                            <div>
                              <div className="font-medium">{vehicle.licensePlate}</div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(vehicle.status)}
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.location.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.fuelLevel}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Gauge className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.mileage.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vehicle.driver ? (
                            <div className="text-sm">
                              <div className="font-medium">{vehicle.driver.name}</div>
                              <div className="text-muted-foreground">{vehicle.driver.phone}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No driver assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                              <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove Vehicle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OBD2 Data Tab */}
        <TabsContent value="obd2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OBD2 Data</CardTitle>
              <CardDescription>
                Real-time vehicle diagnostics and performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Selector */}
              <div className="flex items-center space-x-4">
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* OBD2 Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engine RPM</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {obd2Data.length > 0 ? Math.round(obd2Data.reduce((sum, d) => sum + d.engineRPM, 0) / obd2Data.length) : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Average RPM</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Speed</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {obd2Data.length > 0 ? Math.round(obd2Data.reduce((sum, d) => sum + d.speed, 0) / obd2Data.length) : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Average Speed (mph)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engine Temp</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {obd2Data.length > 0 ? Math.round(obd2Data.reduce((sum, d) => sum + d.engineTemp, 0) / obd2Data.length) : 0}°C
                    </div>
                    <p className="text-xs text-muted-foreground">Average Temperature</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Battery Voltage</CardTitle>
                    <Battery className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {obd2Data.length > 0 ? (obd2Data.reduce((sum, d) => sum + d.batteryVoltage, 0) / obd2Data.length).toFixed(1) : 0}V
                    </div>
                    <p className="text-xs text-muted-foreground">Average Voltage</p>
                  </CardContent>
                </Card>
              </div>

              {/* OBD2 Data Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Engine RPM</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Fuel Level</TableHead>
                      <TableHead>Engine Temp</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Error Codes</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obd2Data.slice(0, 10).map((data) => {
                      const vehicle = vehicles.find(v => v.id === data.vehicleId);
                      return (
                        <TableRow key={data.id}>
                          <TableCell>
                            <div className="font-medium">
                              {vehicle ? vehicle.licensePlate : 'Unknown Vehicle'}
                            </div>
                          </TableCell>
                          <TableCell>{data.engineRPM} RPM</TableCell>
                          <TableCell>{data.speed} mph</TableCell>
                          <TableCell>{data.fuelLevel}%</TableCell>
                          <TableCell>{data.engineTemp}°C</TableCell>
                          <TableCell>{data.batteryVoltage}V</TableCell>
                          <TableCell>
                            {data.errorCodes.length > 0 ? (
                              <Badge variant="destructive">{data.errorCodes.length} errors</Badge>
                            ) : (
                              <Badge variant="default" className="bg-success/10">No errors</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatRelativeTime(data.timestamp)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}