"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
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
  Shield,
  Clock,
  Users,
  Car,
  Calendar,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CashFlow {
  id: string;
  category: 'revenue' | 'operating_expenses' | 'capital_expenditure' | 'funding' | 'other';
  subcategory: string;
  amount: number;
  date: string;
  description: string;
  type: 'inflow' | 'outflow';
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface BurnRate {
  period: string;
  current: number;
  previous: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  projection: number;
  confidence: number;
}

interface RunwayProjection {
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
  months: number;
  burnRate: number;
  confidence: number;
  assumptions: string[];
}

interface CashBurnTrackerProps {
  className?: string;
}

export default function CashBurnTracker({ className }: CashBurnTrackerProps) {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [burnRates, setBurnRates] = useState<BurnRate[]>([]);
  const [runwayProjections, setRunwayProjections] = useState<RunwayProjection[]>([]);
  const [currentCash, setCurrentCash] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadCashBurnData = () => {
      const mockCashFlows: CashFlow[] = [
        {
          id: 'flow-001',
          category: 'revenue',
          subcategory: 'subscription',
          amount: 125000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Monthly subscription revenue',
          type: 'inflow',
          recurring: true,
          frequency: 'monthly'
        },
        {
          id: 'flow-002',
          category: 'revenue',
          subcategory: 'usage',
          amount: 45000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Usage-based revenue',
          type: 'inflow',
          recurring: true,
          frequency: 'monthly'
        },
        {
          id: 'flow-003',
          category: 'operating_expenses',
          subcategory: 'salaries',
          amount: -180000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Employee salaries and benefits',
          type: 'outflow',
          recurring: true,
          frequency: 'monthly'
        },
        {
          id: 'flow-004',
          category: 'operating_expenses',
          subcategory: 'infrastructure',
          amount: -25000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Cloud infrastructure costs',
          type: 'outflow',
          recurring: true,
          frequency: 'monthly'
        },
        {
          id: 'flow-005',
          category: 'operating_expenses',
          subcategory: 'marketing',
          amount: -35000,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Marketing and advertising',
          type: 'outflow',
          recurring: true,
          frequency: 'monthly'
        },
        {
          id: 'flow-006',
          category: 'capital_expenditure',
          subcategory: 'equipment',
          amount: -15000,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Fleet equipment purchase',
          type: 'outflow',
          recurring: false
        },
        {
          id: 'flow-007',
          category: 'funding',
          subcategory: 'investment',
          amount: 500000,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Series A funding round',
          type: 'inflow',
          recurring: false
        }
      ];

      const mockBurnRates: BurnRate[] = [
        {
          period: 'Current Month',
          current: 195000,
          previous: 185000,
          trend: 'increasing',
          projection: 200000,
          confidence: 85
        },
        {
          period: 'Last 3 Months',
          current: 580000,
          previous: 520000,
          trend: 'increasing',
          projection: 620000,
          confidence: 78
        },
        {
          period: 'Last 6 Months',
          current: 1100000,
          previous: 980000,
          trend: 'increasing',
          projection: 1200000,
          confidence: 72
        },
        {
          period: 'Last 12 Months',
          current: 2100000,
          previous: 1800000,
          trend: 'increasing',
          projection: 2300000,
          confidence: 68
        }
      ];

      const mockRunwayProjections: RunwayProjection[] = [
        {
          scenario: 'optimistic',
          months: 18,
          burnRate: 180000,
          confidence: 75,
          assumptions: [
            'Revenue growth continues at current rate',
            'No major unexpected expenses',
            'Successful cost optimization initiatives'
          ]
        },
        {
          scenario: 'realistic',
          months: 12,
          burnRate: 195000,
          confidence: 85,
          assumptions: [
            'Current burn rate continues',
            'Moderate revenue growth',
            'Some cost optimization success'
          ]
        },
        {
          scenario: 'pessimistic',
          months: 8,
          burnRate: 220000,
          confidence: 70,
          assumptions: [
            'Increased competition pressure',
            'Higher customer acquisition costs',
            'Economic downturn impact'
          ]
        }
      ];

      setCashFlows(mockCashFlows);
      setBurnRates(mockBurnRates);
      setRunwayProjections(mockRunwayProjections);
      setCurrentCash(2500000); // Starting cash position
    };

    loadCashBurnData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentCash(prev => {
        // Simulate daily burn
        const dailyBurn = 195000 / 30; // Monthly burn / 30 days
        return Math.max(0, prev - dailyBurn);
      });
    }, 60000); // Update every minute for demo

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <TrendingUp className="h-4 w-4" />;
      case 'operating_expenses': return <TrendingDown className="h-4 w-4" />;
      case 'capital_expenditure': return <Car className="h-4 w-4" />;
      case 'funding': return <Wallet className="h-4 w-4" />;
      case 'other': return <Activity className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inflow': return 'text-success';
      case 'outflow': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-destructive" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-success" />;
      case 'stable': return <Minus className="h-4 w-4 text-primary" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic': return 'bg-success/10 text-success';
      case 'realistic': return 'bg-primary/10 text-blue-800';
      case 'pessimistic': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const filteredCashFlows = cashFlows.filter(flow => {
    const categoryMatch = filterCategory === 'all' || flow.category === filterCategory;
    const typeMatch = filterType === 'all' || flow.type === filterType;
    return categoryMatch && typeMatch;
  });

  const totalInflows = cashFlows.filter(flow => flow.type === 'inflow').reduce((sum, flow) => sum + flow.amount, 0);
  const totalOutflows = Math.abs(cashFlows.filter(flow => flow.type === 'outflow').reduce((sum, flow) => sum + flow.amount, 0));
  const netCashFlow = totalInflows - totalOutflows;
  const currentBurnRate = burnRates[0]?.current || 0;
  const runwayMonths = currentCash / (currentBurnRate / 30); // Convert monthly burn to daily

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Cash Burn Tracker
              </CardTitle>
              <CardDescription>
                Spend vs runway monitoring and cash flow analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-success/10 text-success' : ''}
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
          {/* Cash Position Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{formatCurrency(currentCash)}</div>
              <div className="text-sm text-muted-foreground">Current Cash</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{formatCurrency(totalInflows)}</div>
              <div className="text-sm text-muted-foreground">Total Inflows</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOutflows)}</div>
              <div className="text-sm text-muted-foreground">Total Outflows</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-primary">{Math.round(runwayMonths)}</div>
              <div className="text-sm text-muted-foreground">Runway (Months)</div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Net Cash Flow</h4>
                <p className="text-sm text-muted-foreground">
                  {netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netCashFlow)}
                </div>
                <div className="text-sm text-muted-foreground">This month</div>
              </div>
            </div>
          </div>

          {/* Burn Rate Analysis */}
          <div>
            <h4 className="font-medium mb-3">Burn Rate Analysis</h4>
            <div className="space-y-3">
              {burnRates.map((burnRate) => (
                <div key={burnRate.period} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{burnRate.period}</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(burnRate.trend)}
                      <span className="text-sm font-medium">{formatCurrency(burnRate.current)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Previous: {formatCurrency(burnRate.previous)}</span>
                    <span>Projection: {formatCurrency(burnRate.projection)}</span>
                    <span>Confidence: {burnRate.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Runway Projections */}
          <div>
            <h4 className="font-medium mb-3">Runway Projections</h4>
            <div className="grid gap-3">
              {runwayProjections.map((projection) => (
                <div key={projection.scenario} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getScenarioColor(projection.scenario)}>
                        {projection.scenario}
                      </Badge>
                      <span className="font-medium">{projection.months} months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(projection.burnRate)}/month</span>
                      <span className="text-sm font-medium">{projection.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {projection.assumptions.map((assumption, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        • {assumption}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Flow Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Cash Flow Details</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'revenue', 'operating_expenses', 'capital_expenditure', 'funding', 'other'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Type:</span>
                {['all', 'inflow', 'outflow'].map((type) => (
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

            <div className="space-y-2">
              {filteredCashFlows.map((flow) => (
                <div key={flow.id} className="p-3 border rounded-[0.625rem]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(flow.category)}
                      <div>
                        <div className="font-medium">{flow.subcategory}</div>
                        <div className="text-sm text-muted-foreground">{flow.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getTypeColor(flow.type)}`}>
                        {formatCurrency(Math.abs(flow.amount))}
                      </span>
                      {flow.recurring && (
                        <Badge variant="outline" className="text-xs">
                          {flow.frequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{flow.category.replace('_', ' ')}</span>
                    <span>{new Date(flow.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="p-4 border rounded-[0.625rem]">
            <h4 className="font-medium mb-3">Cash Flow Trend</h4>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-green-50 rounded-[0.625rem] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Cash Flow Visualization</p>
                <p className="text-sm text-muted-foreground">Real-time cash flow tracking active</p>
                <div className="mt-2 flex justify-center space-x-4 text-xs">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-success/100 rounded-full mr-1"></div>
                    Inflow: ${(cashFlows.reduce((sum: number, flow: any) => sum + (flow.amount > 0 ? flow.amount : 0), 0)).toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-destructive/100 rounded-full mr-1"></div>
                    Outflow: ${(Math.abs(cashFlows.reduce((sum: number, flow: any) => sum + (flow.amount < 0 ? flow.amount : 0), 0))).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}


