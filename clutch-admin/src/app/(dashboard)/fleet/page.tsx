"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAPI, type FleetVehicle } from "@/lib/mock-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
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
    const loadFleetData = async () => {
      try {
        const vehicleData = await mockAPI.getFleetVehicles();
        setVehicles(vehicleData);
        setFilteredVehicles(vehicleData);
      } catch (error) {
        console.error("Failed to load fleet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFleetData();

    // Subscribe to real-time updates
    const unsubscribe = mockAPI.subscribeToFleetUpdates((vehicles) => {
      setVehicles(vehicles);
      setFilteredVehicles(vehicles);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let filtered = vehicles;

    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "idle":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-600" />;
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "idle":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
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
            Monitor and manage your fleet vehicles in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-sm">
            <Route className="mr-2 h-4 w-4" />
            Optimize Routes
          </Button>
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vehicles.filter(v => v.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> efficiency
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Maintenance Due</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vehicles.filter(v => v.status === "maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">3</span> overdue
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Offline Vehicles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vehicles.filter(v => v.status === "offline").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Map Placeholder */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Map</CardTitle>
          <CardDescription>Real-time GPS tracking of all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive fleet map will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {vehicles.filter(v => v.location).length} vehicles with GPS data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet List */}
      <Card className="shadow-sm">
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
                        {vehicle.obd2Health || "Good"}
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
                        <DropdownMenuItem className="text-red-600">
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Alerts</CardTitle>
          <CardDescription>Critical notifications and maintenance reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Vehicle ABC-123 Offline</p>
                <p className="text-xs text-red-700">No GPS signal for 2 hours</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Wrench className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Maintenance Due</p>
                <p className="text-xs text-yellow-700">DEF-456 needs oil change</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Fuel className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Low Fuel Alert</p>
                <p className="text-xs text-blue-700">GHI-789 fuel level at 15%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}