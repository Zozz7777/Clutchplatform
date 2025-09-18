"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  AlertTriangle, 
  Target, 
  Activity,
  BarChart3,
  LineChart,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Timer,
  Gauge,
  Cpu,
  Database,
  Server,
  Wifi,
  HardDrive,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Headphones,
  Mic,
  Video,
  Share2,
  Lock,
  Unlock,
  Scale,
  Award,
  BookOpen,
  Clipboard,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle2,
  Info as InfoIcon,
  RotateCcw as RollbackIcon,
  Power,
  PowerOff,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  Brain,
  Calculator,
  PieChart as PieChartIcon,
  BarChart,
  LineChart as LineChartIcon,
  TestTube,
  Bug,
  Shield,
  Wrench,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  MapPin,
  Globe,
  Building,
  Car,
  Phone,
  Mail,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  FileText,
  CreditCard,
  Flame,
  Wind,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';

interface BlackSwanEvent {
  id: string;
  name: string;
  description: string;
  category: 'natural_disaster' | 'cyber_attack' | 'economic_crisis' | 'pandemic' | 'infrastructure_failure' | 'regulatory_change' | 'market_crash' | 'supply_chain_disruption';
  severity: 'low' | 'medium' | 'high' | 'extreme' | 'catastrophic';
  probability: number; // 0-100
  impact: {
    users: number;
    revenue: number;
    services: number;
    regions: number;
    duration: number; // hours
  };
  scenarios: {
    id: string;
    name: string;
    probability: number;
    impact: {
      users: number;
      revenue: number;
      services: number;
      regions: number;
      duration: number;
    };
    mitigation: {
      strategy: string;
      effectiveness: number;
      cost: number;
      timeToImplement: number;
    }[];
  }[];
  triggers: {
    condition: string;
    threshold: number;
    metric: string;
  }[];
  resilience: {
    current: number;
    target: number;
    gaps: string[];
  };
  lastSimulated?: string;
  nextSimulation?: string;
}

interface BlackSwanSimulatorProps {
  className?: string;
}

export default function BlackSwanSimulator({ className }: BlackSwanSimulatorProps) {
  const [blackSwanEvents, setBlackSwanEvents] = useState<BlackSwanEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<BlackSwanEvent | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadBlackSwanData = async () => {
      try {
        const data = await productionApi.getBlackSwanEvents();
        setBlackSwanEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]);
        }
      } catch (error) {
        console.error('Failed to load black swan events:', error);
        // Fallback to empty array if API fails
        setBlackSwanEvents([]);
      }
    };

    loadBlackSwanData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setBlackSwanEvents(prev => prev.map(event => ({
        ...event,
        probability: Math.max(0, Math.min(100, event.probability + (Math.random() - 0.5) * 2))
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      case 'catastrophic': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'natural_disaster': return 'bg-blue-100 text-blue-800';
      case 'cyber_attack': return 'bg-red-100 text-red-800';
      case 'economic_crisis': return 'bg-yellow-100 text-yellow-800';
      case 'pandemic': return 'bg-purple-100 text-purple-800';
      case 'infrastructure_failure': return 'bg-orange-100 text-orange-800';
      case 'regulatory_change': return 'bg-indigo-100 text-indigo-800';
      case 'market_crash': return 'bg-pink-100 text-pink-800';
      case 'supply_chain_disruption': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'natural_disaster': return <CloudLightning className="h-4 w-4" />;
      case 'cyber_attack': return <Shield className="h-4 w-4" />;
      case 'economic_crisis': return <TrendingDown className="h-4 w-4" />;
      case 'pandemic': return <Users className="h-4 w-4" />;
      case 'infrastructure_failure': return <Server className="h-4 w-4" />;
      case 'regulatory_change': return <FileText className="h-4 w-4" />;
      case 'market_crash': return <BarChart className="h-4 w-4" />;
      case 'supply_chain_disruption': return <Truck className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 50) return 'text-red-600';
    if (probability >= 25) return 'text-orange-600';
    if (probability >= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredEvents = blackSwanEvents.filter(event => {
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory;
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    return categoryMatch && severityMatch;
  });

  const totalUsers = blackSwanEvents.reduce((sum, event) => sum + event.impact.users, 0);
  const totalRevenue = blackSwanEvents.reduce((sum, event) => sum + event.impact.revenue, 0);
  const totalServices = blackSwanEvents.reduce((sum, event) => sum + event.impact.services, 0);
  const totalRegions = blackSwanEvents.reduce((sum, event) => sum + event.impact.regions, 0);
  const avgProbability = blackSwanEvents.length > 0 
    ? Math.round(blackSwanEvents.reduce((sum, event) => sum + event.probability, 0) / blackSwanEvents.length)
    : 0;
  const avgResilience = blackSwanEvents.length > 0 
    ? Math.round(blackSwanEvents.reduce((sum, event) => sum + event.resilience.current, 0) / blackSwanEvents.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Black Swan Simulator
              </CardTitle>
              <CardDescription>
                Extreme event stress testing and resilience planning
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
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
          {/* Event Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatNumber(totalUsers)}</div>
              <div className="text-sm text-muted-foreground">Total Users at Risk</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Revenue at Risk</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{avgProbability}%</div>
              <div className="text-sm text-muted-foreground">Avg Probability</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgResilience}%</div>
              <div className="text-sm text-muted-foreground">Avg Resilience</div>
            </div>
          </div>

          {/* Black Swan Overview */}
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Black Swan Event Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Extreme event stress testing with scenario planning and resilience assessment
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">
                  {blackSwanEvents.length}
                </div>
                <div className="text-sm text-muted-foreground">events monitored</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(avgResilience / 100) * 100} className="h-2" />
            </div>
          </div>

          {/* Black Swan Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Black Swan Events</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'natural_disaster', 'cyber_attack', 'economic_crisis', 'pandemic', 'infrastructure_failure', 'regulatory_change', 'market_crash', 'supply_chain_disruption'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Severity:</span>
                {['all', 'low', 'medium', 'high', 'extreme', 'catastrophic'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(event.category)}
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <div className="text-sm font-medium">
                        {event.probability}% probability
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Users: {formatNumber(event.impact.users)}</span>
                    <span>Revenue: {formatCurrency(event.impact.revenue)}</span>
                    <span>Services: {event.impact.services}</span>
                    <span>Duration: {event.impact.duration}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Event Details - {selectedEvent.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                  <TabsTrigger value="triggers">Triggers</TabsTrigger>
                  <TabsTrigger value="resilience">Resilience</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Event Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedEvent.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <Badge className={getCategoryColor(selectedEvent.category)}>
                            {selectedEvent.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedEvent.severity)}>
                            {selectedEvent.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Probability:</span>
                          <span className={`font-medium ${getProbabilityColor(selectedEvent.probability)}`}>
                            {selectedEvent.probability}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact Assessment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Users Affected:</span>
                          <span className="font-medium">{formatNumber(selectedEvent.impact.users)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedEvent.impact.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Services Affected:</span>
                          <span className="font-medium">{selectedEvent.impact.services}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Regions Affected:</span>
                          <span className="font-medium">{selectedEvent.impact.regions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedEvent.impact.duration} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scenarios" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Scenario Analysis</h5>
                    <div className="space-y-2">
                      {selectedEvent.scenarios.map((scenario) => (
                        <div key={scenario.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{scenario.name}</span>
                            <span className="text-sm font-medium">{scenario.probability}% probability</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                            <div>
                              <div>Users: {formatNumber(scenario.impact.users)}</div>
                              <div>Revenue: {formatCurrency(scenario.impact.revenue)}</div>
                            </div>
                            <div>
                              <div>Services: {scenario.impact.services}</div>
                              <div>Duration: {scenario.impact.duration}h</div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-sm mb-1">Mitigation Strategies:</div>
                            <div className="space-y-1">
                              {scenario.mitigation.map((strategy, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  • {strategy.strategy} ({strategy.effectiveness}% effective, {formatCurrency(strategy.cost)}, {strategy.timeToImplement}h)
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="triggers" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Early Warning Triggers</h5>
                    <div className="space-y-2">
                      {selectedEvent.triggers.map((trigger, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{trigger.condition}</span>
                            <span className="text-sm font-medium">Threshold: {trigger.threshold}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Metric: {trigger.metric}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resilience" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Resilience Assessment</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Resilience:</span>
                        <span className="font-medium">{selectedEvent.resilience.current}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Resilience:</span>
                        <span className="font-medium">{selectedEvent.resilience.target}%</span>
                      </div>
                      <div className="mt-3">
                        <div className="font-medium mb-2">Resilience Gaps:</div>
                        <div className="space-y-1">
                          {selectedEvent.resilience.gaps.map((gap, index) => (
                            <div key={index} className="p-2 border rounded-lg text-sm">
                              • {gap}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
