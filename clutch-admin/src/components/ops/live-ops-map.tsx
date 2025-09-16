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
    const loadMapData = () => {
      // Mock fleet locations
      const mockFleet: FleetLocation[] = [
        {
          id: '1',
          name: 'Fleet-001',
          type: 'vehicle',
          lat: 40.7128,
          lng: -74.0060,
          status: 'active',
          speed: 45,
          fuel: 75,
          lastUpdate: '2 minutes ago',
          revenue: 125.50,
          passengers: 2
        },
        {
          id: '2',
          name: 'Fleet-002',
          type: 'vehicle',
          lat: 40.7589,
          lng: -73.9851,
          status: 'idle',
          speed: 0,
          fuel: 60,
          lastUpdate: '1 minute ago',
          revenue: 0,
          passengers: 0
        },
        {
          id: '3',
          name: 'Fleet-003',
          type: 'vehicle',
          lat: 40.7505,
          lng: -73.9934,
          status: 'maintenance',
          speed: 0,
          fuel: 90,
          lastUpdate: '5 minutes ago',
          revenue: 0,
          passengers: 0
        },
        {
          id: '4',
          name: 'Driver-001',
          type: 'driver',
          lat: 40.7282,
          lng: -73.7949,
          status: 'active',
          lastUpdate: '30 seconds ago',
          revenue: 89.25,
          passengers: 1
        }
      ];

      // Mock revenue hotspots
      const mockHotspots: RevenueHotspot[] = [
        {
          id: '1',
          name: 'Times Square',
          lat: 40.7580,
          lng: -73.9855,
          revenue: 15420,
          trend: 'up',
          transactions: 89,
          avgTicket: 173.26,
          category: 'commercial'
        },
        {
          id: '2',
          name: 'JFK Airport',
          lat: 40.6413,
          lng: -73.7781,
          revenue: 12850,
          trend: 'stable',
          transactions: 45,
          avgTicket: 285.56,
          category: 'airport'
        },
        {
          id: '3',
          name: 'Central Park',
          lat: 40.7829,
          lng: -73.9654,
          revenue: 8750,
          trend: 'down',
          transactions: 67,
          avgTicket: 130.60,
          category: 'residential'
        },
        {
          id: '4',
          name: 'Grand Central',
          lat: 40.7527,
          lng: -73.9772,
          revenue: 11200,
          trend: 'up',
          transactions: 78,
          avgTicket: 143.59,
          category: 'station'
        }
      ];

      // Mock user activities
      const mockUsers: UserActivity[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          lat: 40.7128,
          lng: -74.0060,
          status: 'online',
          lastSeen: '1 minute ago',
          role: 'Fleet Manager',
          currentTask: 'Monitoring Fleet-001'
        },
        {
          id: '2',
          name: 'Mike Chen',
          lat: 40.7589,
          lng: -73.9851,
          status: 'busy',
          lastSeen: '2 minutes ago',
          role: 'Operations',
          currentTask: 'Maintenance Check'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          lat: 40.7505,
          lng: -73.9934,
          status: 'online',
          lastSeen: '30 seconds ago',
          role: 'Analyst',
          currentTask: 'Revenue Analysis'
        }
      ];

      setFleetLocations(mockFleet);
      setRevenueHotspots(mockHotspots);
      setUserActivities(mockUsers);
      setLastUpdate(new Date());
    };

    loadMapData();

    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setFleetLocations(prev => 
          prev.map(location => ({
            ...location,
            lastUpdate: 'Just now',
            speed: location.status === 'active' ? Math.floor(Math.random() * 60) : 0,
            fuel: Math.max(0, location.fuel! - Math.random() * 2)
          }))
        );
        setLastUpdate(new Date());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial': return 'bg-blue-500';
      case 'residential': return 'bg-green-500';
      case 'airport': return 'bg-purple-500';
      case 'station': return 'bg-orange-500';
      default: return 'bg-gray-500';
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
              onClick={() => setSelectedLayer(layer.key as any)}
            >
              {layer.icon}
              <span className="ml-1">{layer.label}</span>
            </Button>
          ))}
        </div>

        {/* Map Visualization (Simplified) */}
        <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
            
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
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
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
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
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
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
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
            <div className="text-2xl font-bold text-green-600">{activeFleet}</div>
            <div className="text-sm text-muted-foreground">Active Fleet</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${(totalRevenue / 1000).toFixed(1)}k</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{onlineUsers}</div>
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
