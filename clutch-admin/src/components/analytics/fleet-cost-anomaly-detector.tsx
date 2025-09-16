"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Wrench, 
  Fuel, 
  Battery,
  Activity,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Bell,
  BellOff,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CostAnomaly {
  id: string;
  type: 'maintenance' | 'fuel' | 'insurance' | 'depreciation' | 'repair' | 'operational';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  title: string;
  description: string;
  vehicleId: string;
  vehicleName: string;
  detectedAt: string;
  costImpact: {
    actual: number;
    expected: number;
    variance: number;
    variancePercentage: number;
  };
  timeRange: {
    start: string;
    end: string;
    duration: number; // days
  };
  anomalyScore: number; // 0-100
  confidence: number; // 0-100
  rootCause: {
    primary: string;
    secondary: string[];
    contributingFactors: string[];
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
    costSavings: number;
  };
  historicalData: {
    period: string;
    cost: number;
    usage: number;
    efficiency: number;
  }[];
  alerts: {
    id: string;
    type: 'cost_spike' | 'unusual_pattern' | 'threshold_breach' | 'trend_anomaly';
    message: string;
    timestamp: string;
    resolved: boolean;
  }[];
}

interface CostCategory {
  id: string;
  name: string;
  type: string;
  baseline: number;
  current: number;
  variance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  anomalies: number;
  lastAnomaly: string;
}

interface FleetCostAnomalyDetectorProps {
  className?: string;
}

export default function FleetCostAnomalyDetector({ className }: FleetCostAnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useState<CostAnomaly[]>([]);
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<CostAnomaly | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadAnomalyData = () => {
      const mockAnomalies: CostAnomaly[] = [
        {
          id: 'anomaly-001',
          type: 'maintenance',
          severity: 'critical',
          status: 'detected',
          title: 'Unexpected Maintenance Cost Spike',
          description: 'Maintenance costs for Scooter Alpha exceeded expected range by 300%',
          vehicleId: 'VH-001',
          vehicleName: 'Scooter Alpha',
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          costImpact: {
            actual: 1200,
            expected: 300,
            variance: 900,
            variancePercentage: 300
          },
          timeRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now()).toISOString(),
            duration: 7
          },
          anomalyScore: 95,
          confidence: 92,
          rootCause: {
            primary: 'Battery replacement due to premature failure',
            secondary: ['High usage in extreme weather', 'Inadequate maintenance schedule'],
            contributingFactors: ['Weather exposure', 'Usage patterns', 'Battery age']
          },
          recommendations: {
            immediate: ['Replace battery immediately', 'Review maintenance schedule'],
            longTerm: ['Implement weather protection', 'Optimize usage patterns'],
            costSavings: 500
          },
          historicalData: [
            { period: 'Week 1', cost: 150, usage: 1200, efficiency: 8.5 },
            { period: 'Week 2', cost: 180, usage: 1350, efficiency: 8.2 },
            { period: 'Week 3', cost: 200, usage: 1400, efficiency: 8.0 },
            { period: 'Week 4', cost: 1200, usage: 1100, efficiency: 7.5 }
          ],
          alerts: [
            {
              id: 'alert-001',
              type: 'cost_spike',
              message: 'Maintenance cost exceeded threshold by 300%',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              resolved: false
            }
          ]
        },
        {
          id: 'anomaly-002',
          type: 'fuel',
          severity: 'high',
          status: 'investigating',
          title: 'Fuel Efficiency Anomaly',
          description: 'Fuel consumption increased by 40% without corresponding usage increase',
          vehicleId: 'VH-002',
          vehicleName: 'Bike Beta',
          detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          costImpact: {
            actual: 280,
            expected: 200,
            variance: 80,
            variancePercentage: 40
          },
          timeRange: {
            start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now()).toISOString(),
            duration: 14
          },
          anomalyScore: 78,
          confidence: 85,
          rootCause: {
            primary: 'Engine performance degradation',
            secondary: ['Fuel quality issues', 'Route optimization problems'],
            contributingFactors: ['Engine wear', 'Fuel quality', 'Route efficiency']
          },
          recommendations: {
            immediate: ['Engine diagnostic check', 'Fuel quality analysis'],
            longTerm: ['Engine maintenance', 'Route optimization'],
            costSavings: 200
          },
          historicalData: [
            { period: 'Week 1', cost: 180, usage: 900, efficiency: 5.0 },
            { period: 'Week 2', cost: 190, usage: 950, efficiency: 5.0 },
            { period: 'Week 3', cost: 220, usage: 920, efficiency: 4.2 },
            { period: 'Week 4', cost: 280, usage: 950, efficiency: 3.4 }
          ],
          alerts: [
            {
              id: 'alert-002',
              type: 'unusual_pattern',
              message: 'Fuel efficiency declining without usage increase',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              resolved: false
            }
          ]
        },
        {
          id: 'anomaly-003',
          type: 'operational',
          severity: 'medium',
          status: 'resolved',
          title: 'Insurance Cost Variance',
          description: 'Insurance costs increased due to claim frequency',
          vehicleId: 'VH-003',
          vehicleName: 'Car Gamma',
          detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          costImpact: {
            actual: 450,
            expected: 350,
            variance: 100,
            variancePercentage: 28.6
          },
          timeRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now()).toISOString(),
            duration: 30
          },
          anomalyScore: 65,
          confidence: 75,
          rootCause: {
            primary: 'Increased claim frequency',
            secondary: ['Driver behavior', 'Route safety'],
            contributingFactors: ['Accident rate', 'Insurance claims', 'Risk assessment']
          },
          recommendations: {
            immediate: ['Review driver training', 'Update safety protocols'],
            longTerm: ['Implement safety monitoring', 'Optimize routes'],
            costSavings: 150
          },
          historicalData: [
            { period: 'Month 1', cost: 320, usage: 2000, efficiency: 6.25 },
            { period: 'Month 2', cost: 340, usage: 2100, efficiency: 6.18 },
            { period: 'Month 3', cost: 380, usage: 2050, efficiency: 5.39 },
            { period: 'Month 4', cost: 450, usage: 2200, efficiency: 4.89 }
          ],
          alerts: [
            {
              id: 'alert-003',
              type: 'threshold_breach',
              message: 'Insurance costs exceeded monthly threshold',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              resolved: true
            }
          ]
        }
      ];

      const mockCostCategories: CostCategory[] = [
        {
          id: 'category-001',
          name: 'Maintenance',
          type: 'maintenance',
          baseline: 5000,
          current: 7200,
          variance: 2200,
          trend: 'increasing',
          anomalies: 3,
          lastAnomaly: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'category-002',
          name: 'Fuel',
          type: 'fuel',
          baseline: 3000,
          current: 3200,
          variance: 200,
          trend: 'increasing',
          anomalies: 1,
          lastAnomaly: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'category-003',
          name: 'Insurance',
          type: 'insurance',
          baseline: 2000,
          current: 2100,
          variance: 100,
          trend: 'stable',
          anomalies: 1,
          lastAnomaly: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'category-004',
          name: 'Depreciation',
          type: 'depreciation',
          baseline: 4000,
          current: 3800,
          variance: -200,
          trend: 'decreasing',
          anomalies: 0,
          lastAnomaly: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setAnomalies(mockAnomalies);
      setCostCategories(mockCostCategories);
      setSelectedAnomaly(mockAnomalies[0]);
    };

    loadAnomalyData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new anomalies occasionally
      if (Math.random() > 0.9) {
        const newAnomaly: CostAnomaly = {
          id: `anomaly-${Date.now()}`,
          type: 'maintenance',
          severity: 'medium',
          status: 'detected',
          title: 'New Cost Anomaly Detected',
          description: 'Automated detection of unusual cost pattern',
          vehicleId: `VH-${Math.floor(Math.random() * 100)}`,
          vehicleName: 'Vehicle',
          detectedAt: new Date().toISOString(),
          costImpact: {
            actual: Math.floor(Math.random() * 1000) + 500,
            expected: Math.floor(Math.random() * 300) + 200,
            variance: 0,
            variancePercentage: 0
          },
          timeRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            duration: 7
          },
          anomalyScore: Math.floor(Math.random() * 40) + 60,
          confidence: Math.floor(Math.random() * 30) + 70,
          rootCause: {
            primary: 'Automated detection',
            secondary: [],
            contributingFactors: []
          },
          recommendations: {
            immediate: ['Investigate anomaly'],
            longTerm: ['Monitor patterns'],
            costSavings: 0
          },
          historicalData: [],
          alerts: []
        };
        newAnomaly.costImpact.variance = newAnomaly.costImpact.actual - newAnomaly.costImpact.expected;
        newAnomaly.costImpact.variancePercentage = (newAnomaly.costImpact.variance / newAnomaly.costImpact.expected) * 100;
        
        setAnomalies(prev => [newAnomaly, ...prev.slice(0, 9)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'insurance': return <Shield className="h-4 w-4" />;
      case 'depreciation': return <TrendingDown className="h-4 w-4" />;
      case 'repair': return <Wrench className="h-4 w-4" />;
      case 'operational': return <Activity className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_spike': return <TrendingUp className="h-4 w-4" />;
      case 'unusual_pattern': return <Activity className="h-4 w-4" />;
      case 'threshold_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'trend_anomaly': return <LineChart className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleAnomalyStatusUpdate = (anomalyId: string, newStatus: string) => {
    setAnomalies(prev => prev.map(anomaly =>
      anomaly.id === anomalyId ? { ...anomaly, status: newStatus as any } : anomaly
    ));
  };

  const handleAlertResolve = (anomalyId: string, alertId: string) => {
    setAnomalies(prev => prev.map(anomaly =>
      anomaly.id === anomalyId
        ? {
            ...anomaly,
            alerts: anomaly.alerts.map(alert =>
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : anomaly
    ));
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const severityMatch = filterSeverity === 'all' || anomaly.severity === filterSeverity;
    const typeMatch = filterType === 'all' || anomaly.type === filterType;
    return severityMatch && typeMatch;
  });

  const criticalAnomalies = anomalies.filter(anomaly => anomaly.severity === 'critical').length;
  const activeAnomalies = anomalies.filter(anomaly => anomaly.status !== 'resolved' && anomaly.status !== 'false_positive').length;
  const totalCostImpact = anomalies.reduce((sum, anomaly) => sum + anomaly.costImpact.variance, 0);
  const avgAnomalyScore = anomalies.length > 0 
    ? Math.round(anomalies.reduce((sum, anomaly) => sum + anomaly.anomalyScore, 0) / anomalies.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Fleet Cost Anomaly Detector
              </CardTitle>
              <CardDescription>
                AI-powered detection of unusual cost patterns and spending anomalies
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
          {/* Anomaly Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-red-600">{criticalAnomalies}</div>
              <div className="text-sm text-muted-foreground">Critical Anomalies</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-orange-600">{activeAnomalies}</div>
              <div className="text-sm text-muted-foreground">Active Anomalies</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-purple-600">{avgAnomalyScore}</div>
              <div className="text-sm text-muted-foreground">Avg Anomaly Score</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalCostImpact)}</div>
              <div className="text-sm text-muted-foreground">Cost Impact</div>
            </div>
          </div>

          {/* Cost Categories */}
          <div>
            <h4 className="font-medium mb-3">Cost Categories</h4>
            <div className="grid gap-3">
              {costCategories.map((category) => (
                <div key={category.id} className="p-3 border rounded-lg-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(category.type)}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(category.trend)}
                      <div className="text-sm font-medium">
                        {formatCurrency(category.current)} / {formatCurrency(category.baseline)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Variance: {formatCurrency(category.variance)}</span>
                    <span>Anomalies: {category.anomalies}</span>
                    <span>Last: {new Date(category.lastAnomaly).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Anomalies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Cost Anomalies</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Severity:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
                <span className="text-sm ml-4">Type:</span>
                {['all', 'maintenance', 'fuel', 'insurance', 'depreciation', 'repair', 'operational'].map((type) => (
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
              {filteredAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-3 border rounded-lg-lg cursor-pointer transition-colors ${
                    selectedAnomaly?.id === anomaly.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(anomaly.type)}
                      <div>
                        <div className="font-medium">{anomaly.title}</div>
                        <div className="text-sm text-muted-foreground">{anomaly.vehicleName} - {anomaly.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                      <Badge className={getStatusColor(anomaly.status)}>
                        {anomaly.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        {anomaly.anomalyScore}% score
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Cost Impact: {formatCurrency(anomaly.costImpact.variance)} ({anomaly.costImpact.variancePercentage.toFixed(1)}%)</span>
                    <span>Detected: {new Date(anomaly.detectedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Anomaly Details */}
          {selectedAnomaly && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Anomaly Details - {selectedAnomaly.title}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Cost Impact</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Actual Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAnomaly.costImpact.actual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Cost:</span>
                          <span className="font-medium">{formatCurrency(selectedAnomaly.costImpact.expected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Variance:</span>
                          <span className="font-medium text-red-600">{formatCurrency(selectedAnomaly.costImpact.variance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Variance %:</span>
                          <span className="font-medium text-red-600">{selectedAnomaly.costImpact.variancePercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Anomaly Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Anomaly Score:</span>
                          <span className="font-medium">{selectedAnomaly.anomalyScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedAnomaly.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{selectedAnomaly.timeRange.duration} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Detected:</span>
                          <span className="font-medium">{new Date(selectedAnomaly.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Historical Data</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.historicalData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                          <span className="font-medium">{data.period}</span>
                          <div className="flex items-center gap-4">
                            <span>Cost: {formatCurrency(data.cost)}</span>
                            <span>Usage: {formatNumber(data.usage)}</span>
                            <span>Efficiency: {data.efficiency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Root Cause Analysis</h5>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Primary Cause:</span>
                        <p className="text-sm text-muted-foreground mt-1">{selectedAnomaly.rootCause.primary}</p>
                      </div>
                      <div>
                        <span className="font-medium">Secondary Causes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAnomaly.rootCause.secondary.map((cause, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cause}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Contributing Factors:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAnomaly.rootCause.contributingFactors.map((factor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Immediate Actions</h5>
                      <div className="space-y-2">
                        {selectedAnomaly.recommendations.immediate.map((action, index) => (
                          <div key={index} className="p-2 border rounded-lg text-sm">
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Long-term Solutions</h5>
                      <div className="space-y-2">
                        {selectedAnomaly.recommendations.longTerm.map((action, index) => (
                          <div key={index} className="p-2 border rounded-lg text-sm">
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Potential Cost Savings:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedAnomaly.recommendations.costSavings)}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Active Alerts</h5>
                    <div className="space-y-2">
                      {selectedAnomaly.alerts.filter(alert => !alert.resolved).map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-lg-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertTypeIcon(alert.type)}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertResolve(selectedAnomaly.id, alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {selectedAnomaly.alerts.filter(alert => !alert.resolved).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No active alerts
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  False Positive
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
