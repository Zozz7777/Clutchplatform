"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockAPI, type FleetVehicle } from "@/lib/mock-api";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { 
  Truck, 
  Search, 
  MapPin, 
  Fuel, 
  Gauge,
  Plus,
  MoreHorizontal,
  Navigation,
  Wrench,
  AlertTriangle,
  CheckCircle
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
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<FleetVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const vehicleData = await mockAPI.getFleetVehicles();
        setVehicles(vehicleData);
        setFilteredVehicles(vehicleData);
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();

    // Subscribe to real-time updates
    const unsubscribe = mockAPI.subscribeToFleetUpdates((updatedVehicles) => {
      setVehicles(updatedVehicles);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  const handleVehicleAction = async (vehicleId: string, action: string) => {
    try {
      switch (action) {
        case "activate":
          await mockAPI.updateFleetVehicle(vehicleId, { status: "active" });
          break;
        case "maintenance":
          await mockAPI.updateFleetVehicle(vehicleId, { status: "maintenance" });
          break;
        case "offline":
          await mockAPI.updateFleetVehicle(vehicleId, { status: "offline" });
          break;
      }
      
      // Reload vehicles
      const updatedVehicles = await mockAPI.getFleetVehicles();
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error(`Failed to ${action} vehicle:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your fleet vehicles with real-time tracking
          </p>
        </div>
        {hasPermission("manage_fleet") && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((vehicles.filter(v => v.status === "active").length / vehicles.length) * 100)}% operational
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === "maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled maintenance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === "offline").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>
            Real-time status and location of all fleet vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Vehicles Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(vehicle.status)}
                    <Badge variant={getStatusColor(vehicle.status) as any}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <MapPin className="mr-2 h-4 w-4" />
                        View Location
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Navigation className="mr-2 h-4 w-4" />
                        Track Route
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleVehicleAction(vehicle.id, "activate")}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Active
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleVehicleAction(vehicle.id, "maintenance")}
                        className="text-yellow-600"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Schedule Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleVehicleAction(vehicle.id, "offline")}
                        className="text-red-600"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Mark Offline
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                  <p className="text-sm text-muted-foreground">License: {vehicle.licensePlate}</p>
                  <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
                  
                  {vehicle.driver && (
                    <p className="text-sm text-muted-foreground">Driver: {vehicle.driver.name}</p>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location
                    </span>
                    <span className="text-muted-foreground">{vehicle.location.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Gauge className="h-3 w-3 mr-1" />
                      Odometer
                    </span>
                    <span className="text-muted-foreground">{vehicle.odometer.toLocaleString()} mi</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Fuel className="h-3 w-3 mr-1" />
                      Fuel Level
                    </span>
                    <span className="text-muted-foreground">{vehicle.fuelLevel}%</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Last update: {formatRelativeTime(vehicle.lastUpdate)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vehicles found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
