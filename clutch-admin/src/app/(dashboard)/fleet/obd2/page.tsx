"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAPI, type FleetVehicle } from "@/lib/mock-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
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
        const fleetData = await mockAPI.getFleetVehicles();
        setVehicles(fleetData);
        
        // Mock OBD2 data
        const mockOBD2Data: OBD2Data[] = [
          {
            id: "1",
            vehicleId: fleetData[0]?.id || "1",
            dtc: "P0301",
            description: "Cylinder 1 Misfire Detected",
            severity: "high",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: "active"
          },
          {
            id: "2",
            vehicleId: fleetData[1]?.id || "2",
            dtc: "P0171",
            description: "System Too Lean (Bank 1)",
            severity: "medium",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            status: "pending"
          },
          {
            id: "3",
            vehicleId: fleetData[2]?.id || "3",
            dtc: "P0420",
            description: "Catalyst System Efficiency Below Threshold",
            severity: "medium",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            status: "resolved"
          },
          {
            id: "4",
            vehicleId: fleetData[0]?.id || "1",
            dtc: "P0128",
            description: "Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)",
            severity: "low",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            status: "active"
          },
          {
            id: "5",
            vehicleId: fleetData[1]?.id || "2",
            dtc: "P0300",
            description: "Random/Multiple Cylinder Misfire Detected",
            severity: "critical",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: "active"
          }
        ];
        
        setOBD2Data(mockOBD2Data);
        setFilteredData(mockOBD2Data);
      } catch (error) {
        console.error("Failed to load OBD2 data:", error);
        toast.error("Failed to load OBD2 diagnostics");
      } finally {
        setIsLoading(false);
      }
    };

    loadOBD2Data();
  }, []);

  useEffect(() => {
    let filtered = obd2Data;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.dtc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicles.find(v => v.id === item.vehicleId)?.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
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
        return "bg-red-500/10 text-red-600 border-red-200";
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500/10 text-red-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "resolved":
        return "bg-green-500/10 text-green-600";
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

  const activeCodes = obd2Data.filter(item => item.status === "active").length;
  const criticalCodes = obd2Data.filter(item => item.severity === "critical").length;
  const resolvedCodes = obd2Data.filter(item => item.status === "resolved").length;

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
          <Button variant="outline" className="shadow-sm">
            <Database className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="shadow-sm">
            <Zap className="mr-2 h-4 w-4" />
            Clear Codes
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Codes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeCodes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+2</span> since yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{criticalCodes}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{resolvedCodes}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this week
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Fleet Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vehicles.length > 0 ? ((vehicles.length - activeCodes) / vehicles.length * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.2%</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OBD2 Data Tabs */}
      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="codes">Error Codes</TabsTrigger>
          <TabsTrigger value="live">Live Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Diagnostic Trouble Codes (DTCs)</CardTitle>
              <CardDescription>Current and historical error codes from fleet vehicles</CardDescription>
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
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Live OBD2 Data</CardTitle>
              <CardDescription>Real-time vehicle sensor data and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Live OBD2 data streaming interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Diagnostic History</CardTitle>
              <CardDescription>Historical diagnostic data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Diagnostic history and trends coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">OBD2 Analytics</CardTitle>
              <CardDescription>Fleet health analytics and predictive maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">OBD2 analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
