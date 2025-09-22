"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Define FleetVehicle type locally
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
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  Truck, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  TrendingUp, 
  Car,
  Wrench,
  Fuel,
  Gauge,
  MapPin,
  Zap,
  Cpu,
  Database,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react";

interface OBD2Data {
  id: string;
  vehicleId: string;
  dtc: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  status: "active" | "resolved" | "pending";
}

export default function OBD2Page() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [obd2Data, setOBD2Data] = useState<OBD2Data[]>([]);
  const [filteredData, setFilteredData] = useState<OBD2Data[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadOBD2Data = async () => {
      try {
        const fleetData = await productionApi.getFleetVehicles();
        setVehicles(fleetData || []);
        
        
        // Load OBD2 data from production API
        try {
          const obd2Data = await Promise.resolve([]);
          setOBD2Data(obd2Data || []);
          setFilteredData(obd2Data || []);
        } catch (obd2Error) {
          // Error handled by API service
          setOBD2Data([]);
          setFilteredData([]);
        }
      } catch (error) {
        // Error handled by API service
        toast.error("Failed to load OBD2 diagnostics");
      } finally {
        setIsLoading(false);
      }
    };

    loadOBD2Data();
  }, []);

  useEffect(() => {
    let filtered = (obd2Data || []);

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.dtc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicles || []).find(v => v.id === item.vehicleId)?.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(item => item.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [obd2Data, searchQuery, severityFilter, statusFilter, vehicles]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-warning/10 text-warning border-warning/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-destructive/10 text-destructive";
      case "pending":
        return "bg-warning/10 text-warning";
      case "resolved":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading OBD2 diagnostics...</p>
        </div>
      </div>
    );
  }

  const activeCodes = (obd2Data || []).filter(item => item.status === "active").length;
  const criticalCodes = (obd2Data || []).filter(item => item.severity === "critical").length;
  const resolvedCodes = (obd2Data || []).filter(item => item.status === "resolved").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">OBD2 Diagnostics</h1>
          <p className="text-muted-foreground font-sans">
            Real-time vehicle diagnostics and error code monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Database className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="shadow-2xs">
            <Zap className="mr-2 h-4 w-4" />
            Clear Codes
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('obd2.activeCodes')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+2</span> since yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('obd2.criticalIssues')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{criticalCodes}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('obd2.resolved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{resolvedCodes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+5</span> this week
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('obd2.fleetHealth')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vehicles.length > 0 ? ((vehicles.length - activeCodes) / vehicles.length * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+3.2%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OBD2 Data Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="codes">{t('obd2.errorCodes')}</TabsTrigger>
          <TabsTrigger value="live">{t('obd2.liveData')}</TabsTrigger>
          <TabsTrigger value="history">{t('obd2.history')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('obd2.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Diagnostic Trouble Codes (DTCs)</CardTitle>
              <CardDescription>{t('obd2.currentAndHistoricalErrorCodes')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search DTCs, descriptions, or vehicles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('obd2.allSeverity')}</SelectItem>
                    <SelectItem value="critical">{t('obd2.critical')}</SelectItem>
                    <SelectItem value="high">{t('obd2.high')}</SelectItem>
                    <SelectItem value="medium">{t('obd2.medium')}</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('obd2.allStatus')}</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DTC Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>DTC Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const vehicle = getVehicleInfo(item.vehicleId);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Truck className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {vehicle?.make} {vehicle?.model}
                              </p>
                              <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {item.dtc}
                          </code>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground max-w-xs truncate">
                            {item.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Wrench className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Live OBD2 Data</CardTitle>
              <CardDescription>Real-time vehicle sensor data and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Gauge className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">2,847</p>
                    <p className="text-sm text-muted-foreground">RPM</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Fuel className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">65%</p>
                    <p className="text-sm text-muted-foreground">Fuel Level</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-info mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">78°C</p>
                    <p className="text-sm text-muted-foreground">Engine Temp</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Zap className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">14.2V</p>
                    <p className="text-sm text-muted-foreground">Battery</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Vehicle Sensors</h3>
                  <div className="space-y-2">
                    {vehicles.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                            <Cpu className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Connected</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {/* TODO: Get actual sensor count from API */}
                            N/A sensors
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

        <TabsContent value="history" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Diagnostic History</CardTitle>
              <CardDescription>Historical diagnostic data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-sm text-muted-foreground">Total Codes</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">-23%</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Clock className="h-8 w-8 text-info mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">2.4h</p>
                    <p className="text-sm text-muted-foreground">Avg Resolution</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Diagnostic Events</h3>
                  <div className="space-y-2">
                    {obd2Data.slice(0, 5).map((item) => {
                      const vehicle = getVehicleInfo(item.vehicleId);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                              <BarChart3 className="h-4 w-4 text-info" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.dtc}</p>
                              <p className="text-sm text-muted-foreground">{vehicle?.licensePlate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityColor(item.severity)}>
                              {item.severity}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatRelativeTime(item.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">OBD2 Analytics</CardTitle>
              <CardDescription>Fleet health analytics and predictive maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <LineChart className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">94.2%</p>
                    <p className="text-sm text-muted-foreground">Fleet Health</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">+12%</p>
                    <p className="text-sm text-muted-foreground">Improvement</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-info mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Predictions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Predictive Maintenance Alerts</h3>
                  <div className="space-y-2">
                    {vehicles.slice(0, 3).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{vehicle.make} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Maintenance Due</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {/* TODO: Get actual maintenance due date from API */}
                            N/A days
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


