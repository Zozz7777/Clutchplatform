'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Search,
  Activity,
  Zap,
  Gauge
} from 'lucide-react';

interface OBD2Data {
  id: string;
  vehicleId: string;
  vehicleName: string;
  dtc: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'pending';
  timestamp: string;
  mileage: number;
  location: string;
}

interface VehicleHealth {
  id: string;
  vehicleName: string;
  overallHealth: number;
  engineStatus: 'good' | 'warning' | 'critical';
  transmissionStatus: 'good' | 'warning' | 'critical';
  brakeStatus: 'good' | 'warning' | 'critical';
  lastScan: string;
  totalDTCs: number;
  activeDTCs: number;
}

export default function OBD2Page() {
  const [obd2Data, setObd2Data] = useState<OBD2Data[]>([]);
  const [vehicleHealth, setVehicleHealth] = useState<VehicleHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOBD2Data();
  }, [filterSeverity]);

  const loadOBD2Data = async () => {
    try {
      setIsLoading(true);
      
      // Load OBD2 diagnostic data
      const obd2Response = await fetch(`/api/v1/operations/obd2?severity=${filterSeverity}`);
      if (obd2Response.ok) {
        const obd2Data = await obd2Response.json();
        setObd2Data(obd2Data.data || []);
      }
      
      // Load vehicle health data
      const healthResponse = await fetch('/api/v1/operations/obd2/vehicle-health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setVehicleHealth(healthData.data || []);
      }
    } catch (error) {
      console.error('Failed to load OBD2 data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredData = obd2Data.filter(item => {
    const matchesSearch = item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.dtc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OBD2 Diagnostics</h1>
          <p className="text-gray-600">Monitor vehicle diagnostics and health status</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search vehicles or DTCs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <Button onClick={loadOBD2Data} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicleHealth.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active DTCs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obd2Data.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved DTCs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obd2Data.filter(d => d.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicleHealth.length > 0 ? 
                    Math.round(vehicleHealth.reduce((sum, v) => sum + v.overallHealth, 0) / vehicleHealth.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Health Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Vehicle health chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent DTCs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Diagnostic Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{item.dtc}</h4>
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{item.vehicleName}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Trouble Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">DTC</th>
                      <th className="text-left py-3 px-4">Vehicle</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Severity</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Mileage</th>
                      <th className="text-left py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{item.dtc}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{item.vehicleName}</p>
                            <p className="text-xs text-gray-500">{item.location}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4">
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{item.mileage.toLocaleString()} mi</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicleHealth.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{vehicle.vehicleName}</h3>
                      <div className={`text-2xl font-bold ${getHealthColor(vehicle.overallHealth)}`}>
                        {vehicle.overallHealth}%
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Engine</span>
                        <Badge className={
                          vehicle.engineStatus === 'good' ? 'bg-green-100 text-green-800' :
                          vehicle.engineStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {vehicle.engineStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Transmission</span>
                        <Badge className={
                          vehicle.transmissionStatus === 'good' ? 'bg-green-100 text-green-800' :
                          vehicle.transmissionStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {vehicle.transmissionStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Brakes</span>
                        <Badge className={
                          vehicle.brakeStatus === 'good' ? 'bg-green-100 text-green-800' :
                          vehicle.brakeStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {vehicle.brakeStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>DTCs: {vehicle.activeDTCs}/{vehicle.totalDTCs}</span>
                      <span>Last scan: {new Date(vehicle.lastScan).toLocaleDateString()}</span>
                    </div>

                    <Button className="w-full" size="sm">
                      <Wrench className="h-4 w-4 mr-2" />
                      Run Diagnostics
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
