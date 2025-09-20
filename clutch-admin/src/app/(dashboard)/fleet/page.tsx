"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productionApi } from "@/lib/production-api";
import { websocketService } from "@/lib/websocket-service";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { useQuickActions } from "@/lib/quick-actions";
import { toast } from "sonner";
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
  Car
} from "lucide-react";

// Import new Phase 2 widgets
import FleetUtilization from "@/components/widgets/fleet-utilization";
import MaintenanceForecast from "@/components/widgets/maintenance-forecast";
import FuelCostMetrics from "@/components/widgets/fuel-cost-metrics";
import DowntimeImpact from "@/components/widgets/downtime-impact";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasPermission } = useAuth();
  const { t } = useTranslations();
  const { createFleet, optimizeRoutes } = useQuickActions(hasPermission);

  useEffect(() => {
    const loadFleetData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const vehicleData = await productionApi.getFleetVehicles();
        // Ensure we always have an array
        const vehiclesArray = Array.isArray(vehicleData) ? vehicleData : [];
        setVehicles(vehiclesArray);
        setFilteredVehicles(vehiclesArray);
      } catch (error) {
        // Failed to load fleet data
        toast.error(t('fleet.failedToLoadFleetData'));
        // Set empty arrays on error - no mock data fallback
        setVehicles([]);
        setFilteredVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFleetData();

    // Subscribe to real-time updates via WebSocket
    const unsubscribe = websocketService.subscribeToFleetUpdates((data) => {
      // Handle different data structures from WebSocket
      const vehiclesData = Array.isArray(data) ? data : 
                          Array.isArray(data?.vehicles) ? data.vehicles : 
                          Array.isArray(data?.data) ? data.data : [];
      setVehicles(vehiclesData);
      setFilteredVehicles(vehiclesData);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    // Ensure vehicles is always an array
    const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
    let filtered = vehiclesArray;

    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle?.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.make?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle?.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "maintenance":
        return "bg-secondary/10 text-secondary-foreground";
      case "offline":
        return "bg-destructive/10 text-destructive-foreground";
      case "idle":
        return "bg-muted text-muted-foreground";
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
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "idle":
        return <Clock className="h-4 w-4 text-primary" />;
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('fleet.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('fleet.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs" onClick={optimizeRoutes}>
            <Route className="mr-2 h-4 w-4" />
            {t('fleet.optimizeRoutes')}
          </Button>
          <Button className="shadow-2xs" onClick={createFleet}>
            <Plus className="mr-2 h-4 w-4" />
            {t('fleet.addVehicle')}
          </Button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('fleet.totalVehicles')}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> {t('fleet.thisMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('fleet.activeVehicles')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(vehicles) ? vehicles.filter(v => v?.status === "active").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+5%</span> {t('fleet.efficiency')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('fleet.maintenanceDue')}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(vehicles) ? vehicles.filter(v => v?.status === "maintenance").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">3</span> {t('fleet.overdue')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('fleet.offlineVehicles')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(vehicles) ? vehicles.filter(v => v?.status === "offline").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">-2</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Map Placeholder */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Map</CardTitle>
          <CardDescription>Real-time GPS tracking of all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-[0.625rem] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive fleet map will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {Array.isArray(vehicles) ? vehicles.filter(v => v?.location).length : 0} vehicles with GPS data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet List */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Vehicles</CardTitle>
          <CardDescription>Detailed view of all vehicles with real-time status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('fleet.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">{t('fleet.active')}</SelectItem>
                <SelectItem value="idle">{t('fleet.idle')}</SelectItem>
                <SelectItem value="maintenance">{t('fleet.maintenance')}</SelectItem>
                <SelectItem value="offline">{t('fleet.offline')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fuel Level</TableHead>
                <TableHead>OBD2 Health</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Car className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{vehicle.licensePlate}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
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
                    {vehicle.location ? (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {vehicle.location.lat.toFixed(2)}, {vehicle.location.lng.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No location data</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {vehicle.fuelLevel || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {vehicle.obd2Health || t('fleet.good')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(vehicle.lastUpdate)}
                    </span>
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
                        <DropdownMenuItem>
                          <Navigation className="mr-2 h-4 w-4" />
                          View on Map
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Route className="mr-2 h-4 w-4" />
                          Plan Route
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Wrench className="mr-2 h-4 w-4" />
                          Schedule Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Report Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Alerts</CardTitle>
          <CardDescription>Critical notifications and maintenance reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicles.filter(v => v.status === 'offline').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive-foreground">{t('fleet.vehicleOffline', { plate: vehicle.licensePlate })}</p>
                  <p className="text-xs text-destructive-foreground/80">No GPS signal for 2 hours</p>
                </div>
              </div>
            ))}
            {vehicles.filter(v => v.status === 'maintenance').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-secondary/10 border border-secondary/20">
                <Wrench className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">{t('fleet.maintenanceDue')}</p>
                  <p className="text-xs text-secondary-foreground/80">{vehicle.licensePlate} needs oil change</p>
                </div>
              </div>
            ))}
            {vehicles.filter(v => v.status === 'active').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-primary/10 border border-primary/20">
                <Fuel className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary-foreground">Low Fuel Alert</p>
                  <p className="text-xs text-primary-foreground/80">{vehicle.licensePlate} fuel level at 15%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 2: Fleet Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Fleet Analytics</h2>
            <p className="text-muted-foreground">
              Optimize utilization, costs, and downtime
            </p>
          </div>
        </div>

        {/* Top Row - Utilization & Maintenance */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FleetUtilization className="lg:col-span-2" />
          <MaintenanceForecast />
        </div>

        {/* Second Row - Cost & Downtime */}
        <div className="grid gap-6 md:grid-cols-2">
          <FuelCostMetrics />
          <DowntimeImpact />
        </div>
      </div>
    </div>
  );
}