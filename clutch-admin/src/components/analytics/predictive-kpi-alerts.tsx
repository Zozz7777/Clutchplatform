"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Bell, 
  Target, 
  Activity,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  BellOff,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface KPIMetric {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'operations' | 'customer' | 'fleet' | 'financial' | 'performance';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendDirection: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
  lastUpdated: string;
  historicalData: {
    timestamp: string;
    value: number;
    predicted: boolean;
  }[];
  predictions: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
  alerts: {
    id: string;
    type: 'threshold_breach' | 'trend_anomaly' | 'prediction_alert' | 'performance_degradation';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    predictedValue: number;
    threshold: number;
    timeToBreach: number; // minutes
    confidence: number;
    timestamp: string;
    status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
  }[];
  thresholds: {
    warning: number;
    critical: number;
    target: number;
  };
  impact: {
    business: 'high' | 'medium' | 'low';
    financial: number;
    operational: 'high' | 'medium' | 'low';
    customer: 'high' | 'medium' | 'low';
  };
}

interface PredictiveAlert {
  id: string;
  kpiId: string;
  kpiName: string;
  type: 'threshold_breach' | 'trend_anomaly' | 'prediction_alert' | 'performance_degradation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  predictedValue: number;
  currentValue: number;
  threshold: number;
  timeToBreach: number;
  confidence: number;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
  impact: {
    business: 'high' | 'medium' | 'low';
    financial: number;
    operational: 'high' | 'medium' | 'low';
    customer: 'high' | 'medium' | 'low';
  };
  recommendations: {
    immediate: string[];
    preventive: string[];
    longTerm: string[];
  };
}

interface PredictiveKPIAlertsProps {
  className?: string;
}

export default function PredictiveKPIAlerts({ className }: PredictiveKPIAlertsProps) {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [selectedKPI, setSelectedKPI] = useState<KPIMetric | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadKPIData = () => {
      const mockKPIs: KPIMetric[] = [
        {
          id: 'kpi-001',
          name: 'Revenue per Hour',
          description: 'Average revenue generated per operational hour',
          category: 'revenue',
          currentValue: 125.50,
          targetValue: 150.00,
          unit: '$',
          trend: 'decreasing',
          trendDirection: 'negative',
          confidence: 87,
          lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          historicalData: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 135.20, predicted: false },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 130.80, predicted: false },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 128.40, predicted: false },
            { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 125.50, predicted: false },
            { timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), value: 122.30, predicted: true },
            { timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), value: 118.70, predicted: true }
          ],
          predictions: {
            nextHour: 122.30,
            nextDay: 115.80,
            nextWeek: 98.40,
            nextMonth: 85.20,
            confidence: 87
          },
          alerts: [
            {
              id: 'alert-001',
              type: 'threshold_breach',
              severity: 'high',
              message: 'Revenue per hour predicted to fall below warning threshold',
              predictedValue: 122.30,
              threshold: 130.00,
              timeToBreach: 45,
              confidence: 87,
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              status: 'active'
            }
          ],
          thresholds: {
            warning: 130.00,
            critical: 100.00,
            target: 150.00
          },
          impact: {
            business: 'high',
            financial: 25000,
            operational: 'high',
            customer: 'medium'
          }
        },
        {
          id: 'kpi-002',
          name: 'Fleet Utilization Rate',
          description: 'Percentage of fleet vehicles actively in use',
          category: 'fleet',
          currentValue: 78.5,
          targetValue: 85.0,
          unit: '%',
          trend: 'decreasing',
          trendDirection: 'negative',
          confidence: 92,
          lastUpdated: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          historicalData: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 82.3, predicted: false },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 80.1, predicted: false },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 79.2, predicted: false },
            { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 78.5, predicted: false },
            { timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), value: 77.8, predicted: true },
            { timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), value: 75.2, predicted: true }
          ],
          predictions: {
            nextHour: 77.8,
            nextDay: 74.5,
            nextWeek: 68.9,
            nextMonth: 62.3,
            confidence: 92
          },
          alerts: [
            {
              id: 'alert-002',
              type: 'trend_anomaly',
              severity: 'medium',
              message: 'Fleet utilization showing unusual decline pattern',
              predictedValue: 77.8,
              threshold: 80.0,
              timeToBreach: 120,
              confidence: 92,
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              status: 'active'
            }
          ],
          thresholds: {
            warning: 80.0,
            critical: 70.0,
            target: 85.0
          },
          impact: {
            business: 'medium',
            financial: 15000,
            operational: 'medium',
            customer: 'low'
          }
        },
        {
          id: 'kpi-003',
          name: 'Customer Satisfaction Score',
          description: 'Average customer satisfaction rating',
          category: 'customer',
          currentValue: 4.2,
          targetValue: 4.5,
          unit: '/5',
          trend: 'stable',
          trendDirection: 'neutral',
          confidence: 78,
          lastUpdated: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          historicalData: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 4.3, predicted: false },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 4.2, predicted: false },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 4.2, predicted: false },
            { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 4.2, predicted: false },
            { timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), value: 4.2, predicted: true },
            { timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), value: 4.1, predicted: true }
          ],
          predictions: {
            nextHour: 4.2,
            nextDay: 4.1,
            nextWeek: 4.0,
            nextMonth: 3.9,
            confidence: 78
          },
          alerts: [],
          thresholds: {
            warning: 4.0,
            critical: 3.5,
            target: 4.5
          },
          impact: {
            business: 'high',
            financial: 30000,
            operational: 'high',
            customer: 'high'
          }
        },
        {
          id: 'kpi-004',
          name: 'API Response Time',
          description: 'Average API response time in milliseconds',
          category: 'performance',
          currentValue: 185,
          targetValue: 200,
          unit: 'ms',
          trend: 'increasing',
          trendDirection: 'negative',
          confidence: 85,
          lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          historicalData: [
            { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 165, predicted: false },
            { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 172, predicted: false },
            { timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), value: 178, predicted: false },
            { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), value: 185, predicted: false },
            { timestamp: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), value: 192, predicted: true },
            { timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), value: 205, predicted: true }
          ],
          predictions: {
            nextHour: 192,
            nextDay: 210,
            nextWeek: 235,
            nextMonth: 280,
            confidence: 85
          },
          alerts: [
            {
              id: 'alert-003',
              type: 'prediction_alert',
              severity: 'high',
              message: 'API response time predicted to exceed target threshold',
              predictedValue: 205,
              threshold: 200,
              timeToBreach: 180,
              confidence: 85,
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              status: 'active'
            }
          ],
          thresholds: {
            warning: 180,
            critical: 250,
            target: 200
          },
          impact: {
            business: 'high',
            financial: 20000,
            operational: 'high',
            customer: 'high'
          }
        }
      ];

      const mockAlerts: PredictiveAlert[] = [
        {
          id: 'alert-001',
          kpiId: 'kpi-001',
          kpiName: 'Revenue per Hour',
          type: 'threshold_breach',
          severity: 'high',
          message: 'Revenue per hour predicted to fall below warning threshold',
          predictedValue: 122.30,
          currentValue: 125.50,
          threshold: 130.00,
          timeToBreach: 45,
          confidence: 87,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'active',
          impact: {
            business: 'high',
            financial: 25000,
            operational: 'high',
            customer: 'medium'
          },
          recommendations: {
            immediate: ['Review pricing strategy', 'Analyze demand patterns'],
            preventive: ['Implement dynamic pricing', 'Optimize fleet allocation'],
            longTerm: ['Market analysis', 'Competitive positioning']
          }
        },
        {
          id: 'alert-002',
          kpiId: 'kpi-002',
          kpiName: 'Fleet Utilization Rate',
          type: 'trend_anomaly',
          severity: 'medium',
          message: 'Fleet utilization showing unusual decline pattern',
          predictedValue: 77.8,
          currentValue: 78.5,
          threshold: 80.0,
          timeToBreach: 120,
          confidence: 92,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'active',
          impact: {
            business: 'medium',
            financial: 15000,
            operational: 'medium',
            customer: 'low'
          },
          recommendations: {
            immediate: ['Check fleet status', 'Review maintenance schedule'],
            preventive: ['Optimize vehicle placement', 'Improve demand forecasting'],
            longTerm: ['Fleet expansion analysis', 'Market penetration strategy']
          }
        },
        {
          id: 'alert-003',
          kpiId: 'kpi-004',
          kpiName: 'API Response Time',
          type: 'prediction_alert',
          severity: 'high',
          message: 'API response time predicted to exceed target threshold',
          predictedValue: 205,
          currentValue: 185,
          threshold: 200,
          timeToBreach: 180,
          confidence: 85,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'active',
          impact: {
            business: 'high',
            financial: 20000,
            operational: 'high',
            customer: 'high'
          },
          recommendations: {
            immediate: ['Scale infrastructure', 'Optimize database queries'],
            preventive: ['Implement caching', 'Load balancing optimization'],
            longTerm: ['Architecture review', 'Performance monitoring enhancement']
          }
        }
      ];

      setKpiMetrics(mockKPIs);
      setPredictiveAlerts(mockAlerts);
      setSelectedKPI(mockKPIs[0]);
    };

    loadKPIData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setKpiMetrics(prev => prev.map(kpi => {
        // Simulate small variations in KPI values
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newValue = kpi.currentValue * (1 + variation);
        
        return {
          ...kpi,
          currentValue: Math.round(newValue * 100) / 100,
          lastUpdated: new Date().toISOString()
        };
      }));
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
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <TrendingUp className="h-4 w-4" />;
      case 'operations': return <Activity className="h-4 w-4" />;
      case 'customer': return <Target className="h-4 w-4" />;
      case 'fleet': return <Zap className="h-4 w-4" />;
      case 'financial': return <BarChart3 className="h-4 w-4" />;
      case 'performance': return <LineChart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'threshold_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'trend_anomaly': return <TrendingDown className="h-4 w-4" />;
      case 'prediction_alert': return <Bell className="h-4 w-4" />;
      case 'performance_degradation': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAlertStatusUpdate = (alertId: string, newStatus: string) => {
    setPredictiveAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: newStatus as any } : alert
    ));
  };

  const filteredKPIs = kpiMetrics.filter(kpi => {
    const categoryMatch = filterCategory === 'all' || kpi.category === filterCategory;
    return categoryMatch;
  });

  const filteredAlerts = predictiveAlerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    return severityMatch;
  });

  const activeAlerts = predictiveAlerts.filter(alert => alert.status === 'active').length;
  const criticalAlerts = predictiveAlerts.filter(alert => alert.severity === 'critical').length;
  const avgConfidence = predictiveAlerts.length > 0 
    ? Math.round(predictiveAlerts.reduce((sum, alert) => sum + alert.confidence, 0) / predictiveAlerts.length)
    : 0;
  const totalFinancialImpact = predictiveAlerts.reduce((sum, alert) => sum + alert.impact.financial, 0);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Predictive KPI Alerts
              </CardTitle>
              <CardDescription>
                AI-powered predictive alerts with trend analysis and threshold monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
              >
                {isMonitoring ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
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
          {/* Alerts Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{criticalAlerts}</div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalFinancialImpact)}</div>
              <div className="text-sm text-muted-foreground">Total Impact</div>
            </div>
          </div>

          {/* KPI Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">KPI Metrics</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'revenue', 'operations', 'customer', 'fleet', 'financial', 'performance'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredKPIs.map((kpi) => (
                <div
                  key={kpi.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedKPI?.id === kpi.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedKPI(kpi)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(kpi.category)}
                      <div>
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-sm text-muted-foreground">{kpi.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kpi.trend)}
                      <div className="text-sm font-medium">
                        {kpi.currentValue}{kpi.unit} / {kpi.targetValue}{kpi.unit}
                      </div>
                      <div className="text-sm font-medium">
                        {kpi.confidence}% confidence
                      </div>
                      {kpi.alerts.filter(alert => alert.status === 'active').length > 0 && (
                        <Badge className="bg-red-500">
                          {kpi.alerts.filter(alert => alert.status === 'active').length} alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Last updated: {new Date(kpi.lastUpdated).toLocaleTimeString()}</span>
                    <span>Next prediction: {kpi.predictions.nextHour}{kpi.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Predictive Alerts</h4>
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
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getAlertTypeIcon(alert.type)}
                      <div>
                        <div className="font-medium">{alert.kpiName}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        {alert.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Predicted: {alert.predictedValue} (Current: {alert.currentValue})</span>
                    <span>Time to breach: {alert.timeToBreach} minutes</span>
                    <span>Impact: {formatCurrency(alert.impact.financial)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected KPI Details */}
          {selectedKPI && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">KPI Details - {selectedKPI.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Current Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Value:</span>
                          <span className="font-medium">{selectedKPI.currentValue}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Value:</span>
                          <span className="font-medium">{selectedKPI.targetValue}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend:</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(selectedKPI.trend)}
                            <span className="font-medium">{selectedKPI.trend}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedKPI.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Thresholds</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Warning:</span>
                          <span className="font-medium">{selectedKPI.thresholds.warning}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="font-medium">{selectedKPI.thresholds.critical}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-medium">{selectedKPI.thresholds.target}{selectedKPI.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Impact Assessment</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Business Impact:</span>
                          <Badge className={getImpactColor(selectedKPI.impact.business)}>
                            {selectedKPI.impact.business}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Operational Impact:</span>
                          <Badge className={getImpactColor(selectedKPI.impact.operational)}>
                            {selectedKPI.impact.operational}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Impact:</span>
                          <Badge className={getImpactColor(selectedKPI.impact.customer)}>
                            {selectedKPI.impact.customer}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Financial Impact:</span>
                          <span className="font-medium">{formatCurrency(selectedKPI.impact.financial)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Predictions</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Next Hour:</span>
                          <span className="font-medium">{selectedKPI.predictions.nextHour}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Day:</span>
                          <span className="font-medium">{selectedKPI.predictions.nextDay}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Week:</span>
                          <span className="font-medium">{selectedKPI.predictions.nextWeek}{selectedKPI.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Month:</span>
                          <span className="font-medium">{selectedKPI.predictions.nextMonth}{selectedKPI.unit}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedKPI.predictions.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Historical Data</h5>
                    <div className="space-y-2">
                      {selectedKPI.historicalData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                          <span>{new Date(data.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{data.value}{selectedKPI.unit}</span>
                            {data.predicted && (
                              <Badge variant="outline" className="text-xs">
                                Predicted
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Active Alerts</h5>
                    <div className="space-y-2">
                      {selectedKPI.alerts.filter(alert => alert.status === 'active').map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertTypeIcon(alert.type)}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <span className="text-sm font-medium">{alert.confidence}% confidence</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Predicted: {alert.predictedValue}{selectedKPI.unit}</span>
                            <span>Threshold: {alert.threshold}{selectedKPI.unit}</span>
                            <span>Time to breach: {alert.timeToBreach} minutes</span>
                          </div>
                        </div>
                      ))}
                      {selectedKPI.alerts.filter(alert => alert.status === 'active').length === 0 && (
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
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
