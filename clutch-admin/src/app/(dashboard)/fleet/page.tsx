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
import { useTranslations } from "next-intl";
import { useQuickActions } from "@/lib/quick-actions";
import { toast } from "sonner";
import { handleError, handleWarning, handleWebSocketError, handleDataLoadError } from "@/lib/error-handler";
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
import { ErrorBoundary } from "@/components/error-boundary";

// Define FleetVehicle type locally since we're not using mock API
interface FleetVehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  mileage?: number;
  fuelLevel?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  fuelEfficiency?: number;
  createdAt?: string;
  updatedAt?: string;
  lastUpdate?: string;
  obd2Health?: string;
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
  const [error, setError] = useState<string | null>(null);
  const { user, hasPermission } = useAuth();
  const t = useTranslations();
  
  // Safely get quick actions with error handling
  let createFleet: (() => void) | null = null;
  let optimizeRoutes: (() => void) | null = null;
  
  try {
    // Ensure hasPermission is a function before using it
    const permissionCheck = typeof hasPermission === 'function' ? hasPermission : () => true;
    const quickActions = useQuickActions(permissionCheck);
    createFleet = quickActions.createFleet;
    optimizeRoutes = quickActions.optimizeRoutes;
  } catch (error) {
    handleError(error, { component: 'FleetPage', action: 'initialize_quick_actions' });
  }

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadFleetData = async () => {
      if (!user || !isMounted) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          const vehicleData = await productionApi.getFleetVehicles();
          // Ensure we always have an array and handle potential null/undefined
          const vehiclesArray = Array.isArray(vehicleData) ? vehicleData as FleetVehicle[] : [];
          
          if (isMounted) {
            setVehicles(vehiclesArray);
            setFilteredVehicles(vehiclesArray);
          }
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'fleet_data');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        // Failed to load fleet data
        toast.error(t('fleet.failedToLoadFleetData') || 'Failed to load fleet data');
        // Set empty arrays on error - no mock data fallback
        setVehicles([]);
        setFilteredVehicles([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFleetData();

    // Subscribe to real-time updates via WebSocket with error handling
    let unsubscribe: (() => void) | null = null;
    try {
      // Check if websocketService exists and has the method
      if (websocketService && typeof websocketService.subscribeToFleetUpdates === 'function') {
        unsubscribe = websocketService.subscribeToFleetUpdates((data: any) => {
          if (!isMounted) return;
          
          try {
            // Handle different data structures from WebSocket
            const vehiclesData = Array.isArray(data) ? data : 
                                Array.isArray(data?.vehicles) ? data.vehicles : 
                                Array.isArray(data?.data) ? data.data : [];
            setVehicles(vehiclesData as FleetVehicle[]);
            setFilteredVehicles(vehiclesData as FleetVehicle[]);
          } catch (wsError) {
            handleWebSocketError(wsError, 'fleet', 'data_processing');
          }
        });
      } else {
        handleWarning('WebSocket service not available or subscribeToFleetUpdates method not found', { component: 'FleetPage' });
      }
    } catch (wsError) {
      handleWebSocketError(wsError, 'fleet', 'subscription');
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          handleWebSocketError(error, 'fleet', 'unsubscribe');
        }
      }
    };
  }, [user, t]);

  useEffect(() => {
    // Ensure vehicles is always an array and handle null/undefined values
    const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
    let filtered = vehiclesArray.filter(vehicle => vehicle != null);

    if (searchQuery) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle) return false;
        const searchLower = searchQuery.toLowerCase();
        return (
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchLower)) ||
          (vehicle.model && vehicle.model.toLowerCase().includes(searchLower)) ||
          (vehicle.make && vehicle.make.toLowerCase().includes(searchLower))
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle && vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      case "offline":
        return "destructive";
      case "idle":
        return "outline";
      default:
        return "default";
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
          <Button 
            variant="outline" 
            className="shadow-2xs" 
            onClick={optimizeRoutes || (() => handleWarning('Optimize routes not available', { component: 'FleetPage' }))}
            disabled={!optimizeRoutes}
          >
            <Route className="mr-2 h-4 w-4" />
            {t('fleet.optimizeRoutes')}
          </Button>
          <Button 
            className="shadow-2xs" 
            onClick={createFleet || (() => handleWarning('Create fleet not available', { component: 'FleetPage' }))}
            disabled={!createFleet}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('fleet.addVehicle')}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="shadow-2xs border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Error Loading Fleet Data</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <CardTitle className="text-card-foreground">{t('dashboard.fleetMap')}</CardTitle>
          <CardDescription>{t('dashboard.realtimeGpsTracking')}</CardDescription>
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
          <CardTitle className="text-card-foreground">{t('dashboard.fleetVehicles')}</CardTitle>
          <CardDescription>{t('dashboard.detailedViewOfAllVehicles')}</CardDescription>
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
                <TableHead>{t('dashboard.vehicle')}</TableHead>
                <TableHead>{t('dashboard.status')}</TableHead>
                <TableHead>{t('dashboard.location')}</TableHead>
                <TableHead>{t('dashboard.fuelLevel')}</TableHead>
                <TableHead>{t('dashboard.obd2Health')}</TableHead>
                <TableHead>{t('dashboard.lastUpdate')}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                if (!vehicle || !vehicle.id) return null;
                
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Car className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {vehicle.licensePlate || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.make || 'Unknown'} {vehicle.model || 'Model'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(vehicle.status || 'unknown')}
                        <Badge variant={getStatusVariant(vehicle.status || 'unknown')}>
                          {vehicle.status || 'Unknown'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.location ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {(vehicle.location.latitude || 0).toFixed(2)}, {(vehicle.location.longitude || 0).toFixed(2)}
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
                        {vehicle.lastUpdate || vehicle.updatedAt ? 
                          formatRelativeTime(vehicle.lastUpdate || vehicle.updatedAt || new Date()) : 
                          "Never"
                        }
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
                            {t('dashboard.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Wrench className="mr-2 h-4 w-4" />
                            {t('dashboard.scheduleMaintenance')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Report Issue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="shadow-2xs">
        <CardHeader>
          <CardTitle className="text-card-foreground">{t('dashboard.fleetAlerts')}</CardTitle>
          <CardDescription>{t('dashboard.criticalNotificationsAndMaintenance')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vehicles.filter(v => v && v.status === 'offline').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive-foreground">
                    {(t('fleet.vehicleOffline') || 'Vehicle {plate} is offline').replace('{plate}', vehicle.licensePlate || 'Unknown')}
                  </p>
                  <p className="text-xs text-destructive-foreground/80">No GPS signal for 2 hours</p>
                </div>
              </div>
            ))}
            {vehicles.filter(v => v && v.status === 'maintenance').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-secondary/10 border border-secondary/20">
                <Wrench className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">{t('fleet.maintenanceDue')}</p>
                  <p className="text-xs text-secondary-foreground/80">
                    {vehicle.licensePlate || 'Unknown'} needs oil change
                  </p>
                </div>
              </div>
            ))}
            {vehicles.filter(v => v && v.status === 'active').slice(0, 1).map(vehicle => (
              <div key={vehicle.id} className="flex items-center space-x-3 p-3 rounded-[0.625rem] bg-primary/10 border border-primary/20">
                <Fuel className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary-foreground">{t('dashboard.lowFuelAlert')}</p>
                  <p className="text-xs text-primary-foreground/80">
                    {vehicle.licensePlate || 'Unknown'} fuel level at 15%
                  </p>
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.fleetAnalytics')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.optimizeUtilizationCosts')}
            </p>
          </div>
        </div>

        {/* Top Row - Utilization & Maintenance */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ErrorBoundary>
            <FleetUtilization className="lg:col-span-2" />
          </ErrorBoundary>
          <ErrorBoundary>
            <MaintenanceForecast />
          </ErrorBoundary>
        </div>

        {/* Second Row - Cost & Downtime */}
        <div className="grid gap-6 md:grid-cols-2">
          <ErrorBoundary>
            <FuelCostMetrics />
          </ErrorBoundary>
          <ErrorBoundary>
            <DowntimeImpact />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
