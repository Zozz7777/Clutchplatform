"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  MapPin, 
  Battery, 
  Gauge, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Zap,
  Fuel,
  Thermometer,
  Speedometer,
  Navigation,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  BellOff,
  Bike,
  Truck
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface VehicleTwin {
  id: string;
  vehicleId: string;
  name: string;
  type: 'scooter' | 'bike' | 'car' | 'van';
  status: 'active' | 'maintenance' | 'offline' | 'charging' | 'in_use';
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: string;
  };
  health: {
    overall: number; // 0-100
    battery: number;
    engine: number;
    brakes: number;
    tires: number;
    electronics: number;
  };
  performance: {
    speed: number;
    mileage: number;
    efficiency: number;
    uptime: number;
  };
  maintenance: {
    lastService: string;
    nextService: string;
    serviceInterval: number;
    totalServices: number;
    totalCost: number;
  };
  usage: {
    totalTrips: number;
    totalDistance: number;
    totalRevenue: number;
    avgTripDuration: number;
    utilizationRate: number;
  };
  alerts: {
    id: string;
    type: 'battery_low' | 'maintenance_due' | 'performance_issue' | 'location_anomaly' | 'safety_concern';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    timestamp: string;
    resolved: boolean;
  }[];
  predictions: {
    batteryLife: number; // hours remaining
    maintenanceDue: number; // days until next service
    failureRisk: number; // 0-100
    efficiencyTrend: 'improving' | 'stable' | 'declining';
  };
}

interface FleetHealth {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  offlineVehicles: number;
  avgHealthScore: number;
  totalRevenue: number;
  totalDistance: number;
  avgUtilization: number;
  criticalAlerts: number;
  maintenanceCost: number;
}

interface DigitalTwinFleetProps {
  className?: string;
}

export default function DigitalTwinFleet({ className }: DigitalTwinFleetProps) {
  const [vehicles, setVehicles] = useState<VehicleTwin[]>([]);
  const [fleetHealth, setFleetHealth] = useState<FleetHealth | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTwin | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadFleetData = () => {
      const mockVehicles: VehicleTwin[] = [
        {
          id: 'twin-001',
          vehicleId: 'VH-001',
          name: 'Scooter Alpha',
          type: 'scooter',
          status: 'active',
          location: {
            lat: 40.7128,
            lng: -74.0060,
            address: '123 Main St, New York, NY',
            lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          },
          health: {
            overall: 85,
            battery: 78,
            engine: 92,
            brakes: 88,
            tires: 90,
            electronics: 82
          },
          performance: {
            speed: 25,
            mileage: 1250,
            efficiency: 8.5,
            uptime: 95
          },
          maintenance: {
            lastService: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            nextService: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            serviceInterval: 30,
            totalServices: 12,
            totalCost: 2400
          },
          usage: {
            totalTrips: 450,
            totalDistance: 2250,
            totalRevenue: 6750,
            avgTripDuration: 12,
            utilizationRate: 78
          },
          alerts: [
            {
              id: 'alert-001',
              type: 'battery_low',
              severity: 'medium',
              message: 'Battery level below 20%',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              resolved: false
            }
          ],
          predictions: {
            batteryLife: 2.5,
            maintenanceDue: 5,
            failureRisk: 15,
            efficiencyTrend: 'stable'
          }
        },
        {
          id: 'twin-002',
          vehicleId: 'VH-002',
          name: 'Bike Beta',
          type: 'bike',
          status: 'maintenance',
          location: {
            lat: 40.7589,
            lng: -73.9851,
            address: '456 Park Ave, New York, NY',
            lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString()
          },
          health: {
            overall: 65,
            battery: 45,
            engine: 70,
            brakes: 60,
            tires: 55,
            electronics: 75
          },
          performance: {
            speed: 20,
            mileage: 2100,
            efficiency: 7.2,
            uptime: 88
          },
          maintenance: {
            lastService: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            nextService: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            serviceInterval: 30,
            totalServices: 8,
            totalCost: 1600
          },
          usage: {
            totalTrips: 320,
            totalDistance: 1600,
            totalRevenue: 4800,
            avgTripDuration: 15,
            utilizationRate: 65
          },
          alerts: [
            {
              id: 'alert-002',
              type: 'maintenance_due',
              severity: 'high',
              message: 'Maintenance overdue by 2 days',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              resolved: false
            },
            {
              id: 'alert-003',
              type: 'performance_issue',
              severity: 'medium',
              message: 'Brake performance below threshold',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              resolved: false
            }
          ],
          predictions: {
            batteryLife: 1.2,
            maintenanceDue: -2,
            failureRisk: 35,
            efficiencyTrend: 'declining'
          }
        },
        {
          id: 'twin-003',
          vehicleId: 'VH-003',
          name: 'Car Gamma',
          type: 'car',
          status: 'charging',
          location: {
            lat: 40.7505,
            lng: -73.9934,
            address: '789 Broadway, New York, NY',
            lastUpdate: new Date(Date.now() - 1 * 60 * 1000).toISOString()
          },
          health: {
            overall: 92,
            battery: 95,
            engine: 94,
            brakes: 96,
            tires: 89,
            electronics: 88
          },
          performance: {
            speed: 35,
            mileage: 3200,
            efficiency: 9.8,
            uptime: 98
          },
          maintenance: {
            lastService: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            nextService: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            serviceInterval: 30,
            totalServices: 15,
            totalCost: 3000
          },
          usage: {
            totalTrips: 680,
            totalDistance: 3400,
            totalRevenue: 10200,
            avgTripDuration: 18,
            utilizationRate: 85
          },
          alerts: [],
          predictions: {
            batteryLife: 6.8,
            maintenanceDue: 20,
            failureRisk: 5,
            efficiencyTrend: 'improving'
          }
        }
      ];

      const mockFleetHealth: FleetHealth = {
        totalVehicles: 150,
        activeVehicles: 120,
        maintenanceVehicles: 20,
        offlineVehicles: 10,
        avgHealthScore: 82,
        totalRevenue: 125000,
        totalDistance: 45000,
        avgUtilization: 76,
        criticalAlerts: 3,
        maintenanceCost: 25000
      };

      setVehicles(mockVehicles);
      setFleetHealth(mockFleetHealth);
      setSelectedVehicle(mockVehicles[0]);
    };

    loadFleetData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        // Simulate battery drain
        if (vehicle.status === 'active' && vehicle.health.battery > 0) {
          const newBattery = Math.max(0, vehicle.health.battery - Math.random() * 2);
          const newHealth = { ...vehicle.health, battery: newBattery };
          
          // Add battery low alert if needed
          const hasBatteryAlert = vehicle.alerts.some(alert => alert.type === 'battery_low' && !alert.resolved);
          let newAlerts = [...vehicle.alerts];
          
          if (newBattery < 20 && !hasBatteryAlert) {
            newAlerts.push({
              id: `alert-${Date.now()}`,
              type: 'battery_low',
              severity: 'medium',
              message: 'Battery level below 20%',
              timestamp: new Date().toISOString(),
              resolved: false
            });
          }
          
          return {
            ...vehicle,
            health: newHealth,
            alerts: newAlerts,
            predictions: {
              ...vehicle.predictions,
              batteryLife: newBattery / 40 // Rough estimate
            }
          };
        }
        return vehicle;
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/100';
      case 'maintenance': return 'bg-warning/100';
      case 'offline': return 'bg-destructive/100';
      case 'charging': return 'bg-primary/100';
      case 'in_use': return 'bg-primary/100';
      default: return 'bg-muted/500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scooter': return <Zap className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      case 'van': return <Truck className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'battery_low': return <Battery className="h-4 w-4" />;
      case 'maintenance_due': return <Wrench className="h-4 w-4" />;
      case 'performance_issue': return <Gauge className="h-4 w-4" />;
      case 'location_anomaly': return <MapPin className="h-4 w-4" />;
      case 'safety_concern': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Activity className="h-4 w-4 text-primary" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleAlertResolve = (vehicleId: string, alertId: string) => {
    setVehicles(prev => prev.map(vehicle =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            alerts: vehicle.alerts.map(alert =>
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : vehicle
    ));
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const statusMatch = filterStatus === 'all' || vehicle.status === filterStatus;
    const typeMatch = filterType === 'all' || vehicle.type === filterType;
    return statusMatch && typeMatch;
  });

  const criticalAlerts = vehicles.reduce((sum, vehicle) => 
    sum + vehicle.alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length, 0
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Digital Twin Fleet
              </CardTitle>
              <CardDescription>
                Real-time fleet health monitoring and predictive maintenance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-green-800' : ''}
              >
                {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Fleet Health Summary */}
          {fleetHealth && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
                <div className="text-2xl font-bold text-success">{fleetHealth.activeVehicles}</div>
                <div className="text-sm text-muted-foreground">Active Vehicles</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
                <div className="text-2xl font-bold text-primary">{fleetHealth.avgHealthScore}%</div>
                <div className="text-sm text-muted-foreground">Avg Health Score</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
                <div className="text-2xl font-bold text-primary">{fleetHealth.avgUtilization}%</div>
                <div className="text-sm text-muted-foreground">Avg Utilization</div>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
                <div className="text-2xl font-bold text-destructive">{criticalAlerts}</div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
              </div>
            </div>
          )}

          {/* Vehicle List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Fleet Vehicles</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {['all', 'active', 'maintenance', 'offline', 'charging', 'in_use'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Type:</span>
                {['all', 'scooter', 'bike', 'car', 'van'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedVehicle?.id === vehicle.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(vehicle.type)}
                      <div>
                        <div className="font-medium">{vehicle.name}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.vehicleId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(vehicle.status)}>
                        {vehicle.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        Health: {vehicle.health.overall}%
                      </div>
                      {vehicle.alerts.filter(alert => !alert.resolved).length > 0 && (
                        <Badge className="bg-destructive/100">
                          {vehicle.alerts.filter(alert => !alert.resolved).length} alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{vehicle.location.address}</span>
                    <span>Last update: {new Date(vehicle.location.lastUpdate).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Vehicle Details */}
          {selectedVehicle && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Vehicle Details - {selectedVehicle.name}</h4>
              
              <Tabs defaultValue="health" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="health" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Health Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall Health</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.overall} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.overall}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Battery</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.battery} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.battery}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Engine</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.engine} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.engine}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Brakes</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.brakes} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.brakes}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tires</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.tires} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.tires}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Electronics</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedVehicle.health.electronics} className="w-20 h-2" />
                            <span className="text-sm font-medium">{selectedVehicle.health.electronics}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Predictions</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Battery Life:</span>
                          <span className="font-medium">{selectedVehicle.predictions.batteryLife}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance Due:</span>
                          <span className="font-medium">{selectedVehicle.predictions.maintenanceDue} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failure Risk:</span>
                          <span className="font-medium">{selectedVehicle.predictions.failureRisk}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Efficiency Trend:</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(selectedVehicle.predictions.efficiencyTrend)}
                            <span className="font-medium">{selectedVehicle.predictions.efficiencyTrend}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Performance Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Speed:</span>
                          <span className="font-medium">{selectedVehicle.performance.speed} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Mileage:</span>
                          <span className="font-medium">{formatNumber(selectedVehicle.performance.mileage)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Efficiency:</span>
                          <span className="font-medium">{selectedVehicle.performance.efficiency} km/kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span className="font-medium">{selectedVehicle.performance.uptime}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Usage Statistics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Trips:</span>
                          <span className="font-medium">{formatNumber(selectedVehicle.usage.totalTrips)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Distance:</span>
                          <span className="font-medium">{formatNumber(selectedVehicle.usage.totalDistance)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(selectedVehicle.usage.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Trip Duration:</span>
                          <span className="font-medium">{selectedVehicle.usage.avgTripDuration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilization Rate:</span>
                          <span className="font-medium">{selectedVehicle.usage.utilizationRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Maintenance History</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Last Service:</span>
                          <span className="font-medium">{new Date(selectedVehicle.maintenance.lastService).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Service:</span>
                          <span className="font-medium">{new Date(selectedVehicle.maintenance.nextService).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Interval:</span>
                          <span className="font-medium">{selectedVehicle.maintenance.serviceInterval} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Services:</span>
                          <span className="font-medium">{selectedVehicle.maintenance.totalServices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedVehicle.maintenance.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Maintenance Actions</h5>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Wrench className="h-4 w-4 mr-2" />
                          Schedule Service
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Update Interval
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Active Alerts</h5>
                    <div className="space-y-2">
                      {selectedVehicle.alerts.filter(alert => !alert.resolved).map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAlertResolve(selectedVehicle.id, alert.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {selectedVehicle.alerts.filter(alert => !alert.resolved).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No active alerts
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
