'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Truck, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { realApi } from '@/lib/real-api';

interface FleetLocation {
  id: string;
  name: string;
  type: 'vehicle' | 'driver' | 'depot';
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  speed?: number;
  fuel?: number;
  lastUpdate: string;
  revenue?: number;
  passengers?: number;
}

interface RevenueHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  transactions: number;
  avgTicket: number;
  category: 'commercial' | 'residential' | 'airport' | 'station';
}

interface UserActivity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'busy';
  lastSeen: string;
  role: string;
  currentTask?: string;
}

interface LiveOpsMapProps {
  className?: string;
}

export default function LiveOpsMap({ className }: LiveOpsMapProps) {
  const [fleetLocations, setFleetLocations] = useState<FleetLocation[]>([]);
  const [revenueHotspots, setRevenueHotspots] = useState<RevenueHotspot[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'fleet' | 'revenue' | 'users'>('all');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const loadMapData = async () => {
      try {
        // Load real data from API
        const [fleetData, hotspotsData, usersData] = await Promise.all([
          realApi.getFleetLocations(),
          realApi.getRevenueHotspots(),
          realApi.getLiveUserActivities()
        ]);

        setFleetLocations(Array.isArray(fleetData) ? (fleetData as unknown as FleetLocation[]) : []);
        setRevenueHotspots(Array.isArray(hotspotsData) ? (hotspotsData as unknown as RevenueHotspot[]) : []);
        setUserActivities(Array.isArray(usersData) ? (usersData as unknown as UserActivity[]) : []);
        setLastUpdate(new Date());
      } catch (error) {
        // Error handled by API service
        // Set empty arrays on error - no mock data fallback
        setFleetLocations([]);
        setRevenueHotspots([]);
        setUserActivities([]);
        setLastUpdate(new Date());
      }
    };

    loadMapData();

    if (isLive) {
      const interval = setInterval(async () => {
        try {
          // Get real-time updates from API
          const [fleetData, hotspotsData, usersData] = await Promise.all([
            realApi.getFleetLocations(),
            realApi.getRevenueHotspots(),
            realApi.getLiveUserActivities()
          ]);

          setFleetLocations(Array.isArray(fleetData) ? (fleetData as unknown as FleetLocation[]) : []);
          setRevenueHotspots(Array.isArray(hotspotsData) ? (hotspotsData as unknown as RevenueHotspot[]) : []);
          setUserActivities(Array.isArray(usersData) ? (usersData as unknown as UserActivity[]) : []);
          setLastUpdate(new Date());
        } catch (error) {
          // Error handled by API service
          // Keep existing data on error
        }
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/100';
      case 'idle': return 'bg-warning/100';
      case 'maintenance': return 'bg-warning/100';
      case 'offline': return 'bg-destructive/100';
      case 'online': return 'bg-success/100';
      case 'busy': return 'bg-warning/100';
      default: return 'bg-muted/500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-destructive" />;
      case 'stable': return <Activity className="h-3 w-3 text-primary" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial': return 'bg-primary/100';
      case 'residential': return 'bg-success/100';
      case 'airport': return 'bg-primary/100';
      case 'station': return 'bg-warning/100';
      default: return 'bg-muted/500';
    }
  };

  const totalRevenue = revenueHotspots.reduce((sum, spot) => sum + spot.revenue, 0);
  const activeFleet = fleetLocations.filter(f => f.status === 'active').length;
  const onlineUsers = userActivities.filter(u => u.status === 'online').length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Live Ops Map
            </CardTitle>
            <CardDescription>
              Real-time fleet, revenue, and user activity
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              {isLive ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Layer Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Layers:</span>
          {[
            { key: 'all', label: 'All', icon: <Target className="h-4 w-4" /> },
            { key: 'fleet', label: 'Fleet', icon: <Truck className="h-4 w-4" /> },
            { key: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
            { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> }
          ].map((layer) => (
            <Button
              key={layer.key}
              variant={selectedLayer === layer.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLayer(layer.key as 'all' | 'fleet' | 'revenue' | 'users')}
            >
              {layer.icon}
              <span className="ml-1">{layer.label}</span>
            </Button>
          ))}
        </div>

        {/* Map Visualization (Simplified) */}
        <div className="relative h-64 bg-muted rounded-[0.625rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20 bg-grid-pattern" />
            
            {/* Fleet Locations */}
            {(selectedLayer === 'all' || selectedLayer === 'fleet') && fleetLocations.map((location) => (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((location.lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - location.lat) / 0.2) * 100}%`
                }}
              >
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full border-2 border-white ${getStatusColor(location.status)}`} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded-[0.625rem] whitespace-nowrap">
                    {location.name}
                  </div>
                </div>
              </div>
            ))}

            {/* Revenue Hotspots */}
            {(selectedLayer === 'all' || selectedLayer === 'revenue') && revenueHotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((hotspot.lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - hotspot.lat) / 0.2) * 100}%`
                }}
              >
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full border-2 border-white ${getCategoryColor(hotspot.category)}`} />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-success text-white text-xs px-1 py-0.5 rounded-[0.625rem] whitespace-nowrap">
                    ${(hotspot.revenue / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            ))}

            {/* User Activities */}
            {(selectedLayer === 'all' || selectedLayer === 'users') && userActivities.map((user) => (
              <div
                key={user.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((user.lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - user.lat) / 0.2) * 100}%`
                }}
              >
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full border border-white ${getStatusColor(user.status)}`} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-[0.625rem] whitespace-nowrap">
                    {user.name.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{activeFleet}</div>
            <div className="text-sm text-muted-foreground">Active Fleet</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${(totalRevenue / 1000).toFixed(1)}k</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{onlineUsers}</div>
            <div className="text-sm text-muted-foreground">Online Users</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {fleetLocations.slice(0, 3).map((location) => (
              <div key={location.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(location.status)}`} />
                  <span>{location.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {location.speed && location.speed > 0 && (
                    <span>{location.speed} mph</span>
                  )}
                  <span className="text-muted-foreground">{location.lastUpdate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}


