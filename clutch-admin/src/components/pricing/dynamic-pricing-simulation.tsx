"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
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
  Calculator,
  TestTube,
  Lightbulb
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface PricingScenario {
  id: string;
  name: string;
  description: string;
  type: 'price_increase' | 'price_decrease' | 'tier_restructure' | 'promotional' | 'competitive';
  status: 'draft' | 'testing' | 'active' | 'paused' | 'completed';
  currentPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
  targetSegment: string;
  expectedImpact: {
    revenue: number;
    volume: number;
    margin: number;
    churn: number;
    acquisition: number;
  };
  actualImpact?: {
    revenue: number;
    volume: number;
    margin: number;
    churn: number;
    acquisition: number;
  };
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assumptions: string[];
  constraints: {
    minPrice: number;
    maxPrice: number;
    maxChurnIncrease: number;
    minMargin: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: number;
  };
  metrics: {
    elasticity: number;
    priceSensitivity: number;
    demandCurve: number;
    competitivePosition: number;
  };
}

interface PricingTest {
  id: string;
  scenarioId: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startDate: string;
  endDate?: string;
  testGroup: {
    size: number;
    conversion: number;
    revenue: number;
    churn: number;
  };
  controlGroup: {
    size: number;
    conversion: number;
    revenue: number;
    churn: number;
  };
  results: {
    revenueLift: number;
    conversionChange: number;
    churnChange: number;
    statisticalSignificance: number;
  };
}

interface MarketAnalysis {
  competitor: string;
  currentPrice: number;
  marketShare: number;
  priceTrend: 'increasing' | 'decreasing' | 'stable';
  lastUpdate: string;
}

interface DynamicPricingSimulationProps {
  className?: string;
}

export default function DynamicPricingSimulation({ className }: DynamicPricingSimulationProps) {
  const [scenarios, setScenarios] = useState<PricingScenario[]>([]);
  const [tests, setTests] = useState<PricingTest[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<PricingScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadPricingData = () => {
      const mockScenarios: PricingScenario[] = [
        {
          id: 'scenario-001',
          name: 'Premium Tier Price Increase',
          description: 'Increase premium tier pricing by 15% to improve margins',
          type: 'price_increase',
          status: 'testing',
          currentPrice: 99,
          newPrice: 114,
          priceChange: 15,
          priceChangePercent: 15.15,
          targetSegment: 'Enterprise',
          expectedImpact: {
            revenue: 125000,
            volume: -8,
            margin: 12,
            churn: 5,
            acquisition: -3
          },
          actualImpact: {
            revenue: 118000,
            volume: -6,
            margin: 11,
            churn: 4,
            acquisition: -2
          },
          confidence: 78,
          riskLevel: 'medium',
          assumptions: [
            'Enterprise customers have low price sensitivity',
            'Competitive landscape remains stable',
            'Value proposition justifies price increase'
          ],
          constraints: {
            minPrice: 100,
            maxPrice: 150,
            maxChurnIncrease: 10,
            minMargin: 25
          },
          timeline: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 14
          },
          metrics: {
            elasticity: -0.8,
            priceSensitivity: 0.6,
            demandCurve: 0.7,
            competitivePosition: 0.8
          }
        },
        {
          id: 'scenario-002',
          name: 'SMB Tier Restructure',
          description: 'Restructure SMB pricing with usage-based components',
          type: 'tier_restructure',
          status: 'draft',
          currentPrice: 29,
          newPrice: 35,
          priceChange: 6,
          priceChangePercent: 20.69,
          targetSegment: 'SMB',
          expectedImpact: {
            revenue: 85000,
            volume: -12,
            margin: 8,
            churn: 8,
            acquisition: -5
          },
          confidence: 65,
          riskLevel: 'high',
          assumptions: [
            'SMB customers prefer predictable pricing',
            'Usage-based pricing increases adoption',
            'Competition doesn\'t respond aggressively'
          ],
          constraints: {
            minPrice: 25,
            maxPrice: 50,
            maxChurnIncrease: 15,
            minMargin: 20
          },
          timeline: {
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 30
          },
          metrics: {
            elasticity: -1.2,
            priceSensitivity: 0.8,
            demandCurve: 0.5,
            competitivePosition: 0.6
          }
        },
        {
          id: 'scenario-003',
          name: 'Competitive Response Pricing',
          description: 'Adjust pricing to match competitor\'s new offering',
          type: 'competitive',
          status: 'active',
          currentPrice: 49,
          newPrice: 45,
          priceChange: -4,
          priceChangePercent: -8.16,
          targetSegment: 'Mid-Market',
          expectedImpact: {
            revenue: -20000,
            volume: 15,
            margin: -3,
            churn: -2,
            acquisition: 12
          },
          actualImpact: {
            revenue: -18000,
            volume: 18,
            margin: -2,
            churn: -1,
            acquisition: 15
          },
          confidence: 85,
          riskLevel: 'low',
          assumptions: [
            'Competitor pricing is sustainable',
            'Market demand remains stable',
            'Volume increase offsets price reduction'
          ],
          constraints: {
            minPrice: 40,
            maxPrice: 60,
            maxChurnIncrease: 5,
            minMargin: 15
          },
          timeline: {
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 30
          },
          metrics: {
            elasticity: -1.5,
            priceSensitivity: 0.9,
            demandCurve: 0.8,
            competitivePosition: 0.9
          }
        }
      ];

      const mockTests: PricingTest[] = [
        {
          id: 'test-001',
          scenarioId: 'scenario-001',
          name: 'Premium Tier A/B Test',
          status: 'running',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          testGroup: {
            size: 500,
            conversion: 12.5,
            revenue: 57000,
            churn: 3.2
          },
          controlGroup: {
            size: 500,
            conversion: 13.8,
            revenue: 49500,
            churn: 2.8
          },
          results: {
            revenueLift: 15.2,
            conversionChange: -9.4,
            churnChange: 14.3,
            statisticalSignificance: 78
          }
        },
        {
          id: 'test-002',
          scenarioId: 'scenario-002',
          name: 'SMB Tier Restructure Test',
          status: 'completed',
          startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          testGroup: {
            size: 300,
            conversion: 8.2,
            revenue: 10500,
            churn: 5.1
          },
          controlGroup: {
            size: 300,
            conversion: 9.5,
            revenue: 8700,
            churn: 3.8
          },
          results: {
            revenueLift: 20.7,
            conversionChange: -13.7,
            churnChange: 34.2,
            statisticalSignificance: 92
          }
        }
      ];

      const mockMarketAnalysis: MarketAnalysis[] = [
        {
          competitor: 'Competitor A',
          currentPrice: 95,
          marketShare: 25,
          priceTrend: 'increasing',
          lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          competitor: 'Competitor B',
          currentPrice: 110,
          marketShare: 20,
          priceTrend: 'stable',
          lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          competitor: 'Competitor C',
          currentPrice: 85,
          marketShare: 15,
          priceTrend: 'decreasing',
          lastUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setScenarios(mockScenarios);
      setTests(mockTests);
      setMarketAnalysis(mockMarketAnalysis);
      setSelectedScenario(mockScenarios[0]);
    };

    loadPricingData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setScenarios(prev => prev.map(scenario => {
        if (scenario.status === 'testing' && scenario.actualImpact) {
          // Simulate small variations in actual impact
          const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
          return {
            ...scenario,
            actualImpact: {
              ...scenario.actualImpact,
              revenue: Math.round(scenario.actualImpact.revenue * (1 + variation)),
              volume: Math.round(scenario.actualImpact.volume * (1 + variation)),
              margin: Math.round(scenario.actualImpact.margin * (1 + variation)),
              churn: Math.round(scenario.actualImpact.churn * (1 + variation)),
              acquisition: Math.round(scenario.actualImpact.acquisition * (1 + variation))
            }
          };
        }
        return scenario;
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price_increase': return <TrendingUp className="h-4 w-4" />;
      case 'price_decrease': return <TrendingDown className="h-4 w-4" />;
      case 'tier_restructure': return <Target className="h-4 w-4" />;
      case 'promotional': return <Zap className="h-4 w-4" />;
      case 'competitive': return <Activity className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleScenarioStatusUpdate = (scenarioId: string, newStatus: string) => {
    setScenarios(prev => prev.map(scenario =>
      scenario.id === scenarioId ? { ...scenario, status: newStatus as any } : scenario
    ));
  };

  const filteredScenarios = scenarios.filter(scenario => {
    const typeMatch = filterType === 'all' || scenario.type === filterType;
    const statusMatch = filterStatus === 'all' || scenario.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const activeScenarios = scenarios.filter(scenario => scenario.status === 'active').length;
  const testingScenarios = scenarios.filter(scenario => scenario.status === 'testing').length;
  const totalExpectedRevenue = scenarios.reduce((sum, scenario) => sum + scenario.expectedImpact.revenue, 0);
  const avgConfidence = scenarios.length > 0 
    ? Math.round(scenarios.reduce((sum, scenario) => sum + scenario.confidence, 0) / scenarios.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dynamic Pricing Simulation
              </CardTitle>
              <CardDescription>
                Impact testing and scenario modeling for pricing strategies
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSimulating(!isSimulating)}
                className={isSimulating ? 'bg-green-100 text-green-800' : ''}
              >
                {isSimulating ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isSimulating ? 'Simulating' : 'Paused'}
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
          {/* Simulation Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeScenarios}</div>
              <div className="text-sm text-muted-foreground">Active Scenarios</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testingScenarios}</div>
              <div className="text-sm text-muted-foreground">Testing Scenarios</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalExpectedRevenue)}</div>
              <div className="text-sm text-muted-foreground">Expected Revenue</div>
            </div>
          </div>

          {/* Market Analysis */}
          <div>
            <h4 className="font-medium mb-3">Competitive Market Analysis</h4>
            <div className="space-y-2">
              {marketAnalysis.map((competitor) => (
                <div key={competitor.competitor} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{competitor.competitor}</span>
                      <span className="text-sm text-muted-foreground">{competitor.marketShare}% market share</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(competitor.priceTrend)}
                      <span className="text-sm font-medium">{formatCurrency(competitor.currentPrice)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(competitor.lastUpdate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Pricing Scenarios</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'price_increase', 'price_decrease', 'tier_restructure', 'promotional', 'competitive'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'draft', 'testing', 'active', 'paused', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(scenario.type)}
                      <div>
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">{scenario.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(scenario.status)}>
                        {scenario.status}
                      </Badge>
                      <Badge className={getRiskColor(scenario.riskLevel)}>
                        {scenario.riskLevel} risk
                      </Badge>
                      <div className="text-sm font-medium">
                        {scenario.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Price: {formatCurrency(scenario.currentPrice)} → {formatCurrency(scenario.newPrice)} ({scenario.priceChangePercent > 0 ? '+' : ''}{scenario.priceChangePercent.toFixed(1)}%)</span>
                    <span>Target: {scenario.targetSegment}</span>
                    <span>Expected Revenue: {formatCurrency(scenario.expectedImpact.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Scenario Details */}
          {selectedScenario && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Scenario Details - {selectedScenario.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
                  <TabsTrigger value="testing">Testing</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Pricing Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Current Price:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.currentPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Price:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.newPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Change:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.priceChange)} ({selectedScenario.priceChangePercent > 0 ? '+' : ''}{selectedScenario.priceChangePercent.toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Segment:</span>
                          <span className="font-medium">{selectedScenario.targetSegment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedScenario.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <Badge className={getRiskColor(selectedScenario.riskLevel)}>
                            {selectedScenario.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Constraints</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Min Price:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.constraints.minPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Price:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.constraints.maxPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Churn Increase:</span>
                          <span className="font-medium">{selectedScenario.constraints.maxChurnIncrease}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min Margin:</span>
                          <span className="font-medium">{selectedScenario.constraints.minMargin}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Assumptions</h5>
                    <div className="space-y-1">
                      {selectedScenario.assumptions.map((assumption, index) => (
                        <div key={index} className="p-2 border rounded text-sm">
                          • {assumption}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Expected Impact</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatCurrency(selectedScenario.expectedImpact.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume Change:</span>
                          <span className="font-medium">{selectedScenario.expectedImpact.volume > 0 ? '+' : ''}{selectedScenario.expectedImpact.volume}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin Change:</span>
                          <span className="font-medium">{selectedScenario.expectedImpact.margin > 0 ? '+' : ''}{selectedScenario.expectedImpact.margin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Churn Change:</span>
                          <span className="font-medium">{selectedScenario.expectedImpact.churn > 0 ? '+' : ''}{selectedScenario.expectedImpact.churn}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acquisition Change:</span>
                          <span className="font-medium">{selectedScenario.expectedImpact.acquisition > 0 ? '+' : ''}{selectedScenario.expectedImpact.acquisition}%</span>
                        </div>
                      </div>
                    </div>
                    {selectedScenario.actualImpact && (
                      <div>
                        <h5 className="font-medium mb-2">Actual Impact</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">{formatCurrency(selectedScenario.actualImpact.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Volume Change:</span>
                            <span className="font-medium">{selectedScenario.actualImpact.volume > 0 ? '+' : ''}{selectedScenario.actualImpact.volume}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Margin Change:</span>
                            <span className="font-medium">{selectedScenario.actualImpact.margin > 0 ? '+' : ''}{selectedScenario.actualImpact.margin}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Churn Change:</span>
                            <span className="font-medium">{selectedScenario.actualImpact.churn > 0 ? '+' : ''}{selectedScenario.actualImpact.churn}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Acquisition Change:</span>
                            <span className="font-medium">{selectedScenario.actualImpact.acquisition > 0 ? '+' : ''}{selectedScenario.actualImpact.acquisition}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="testing" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">A/B Tests</h5>
                    <div className="space-y-3">
                      {tests.filter(test => test.scenarioId === selectedScenario.id).map((test) => (
                        <div key={test.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{test.name}</span>
                            <Badge className={getTestStatusColor(test.status)}>
                              {test.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-medium mb-1">Test Group</h6>
                              <div className="space-y-1">
                                <div>Size: {test.testGroup.size}</div>
                                <div>Conversion: {test.testGroup.conversion}%</div>
                                <div>Revenue: {formatCurrency(test.testGroup.revenue)}</div>
                                <div>Churn: {test.testGroup.churn}%</div>
                              </div>
                            </div>
                            <div>
                              <h6 className="font-medium mb-1">Control Group</h6>
                              <div className="space-y-1">
                                <div>Size: {test.controlGroup.size}</div>
                                <div>Conversion: {test.controlGroup.conversion}%</div>
                                <div>Revenue: {formatCurrency(test.controlGroup.revenue)}</div>
                                <div>Churn: {test.controlGroup.churn}%</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>Revenue Lift: {test.results.revenueLift > 0 ? '+' : ''}{test.results.revenueLift.toFixed(1)}%</div>
                              <div>Conversion Change: {test.results.conversionChange > 0 ? '+' : ''}{test.results.conversionChange.toFixed(1)}%</div>
                              <div>Churn Change: {test.results.churnChange > 0 ? '+' : ''}{test.results.churnChange.toFixed(1)}%</div>
                              <div>Statistical Significance: {test.results.statisticalSignificance}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Pricing Metrics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price Elasticity:</span>
                          <span className="font-medium">{selectedScenario.metrics.elasticity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Sensitivity:</span>
                          <span className="font-medium">{selectedScenario.metrics.priceSensitivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Demand Curve:</span>
                          <span className="font-medium">{selectedScenario.metrics.demandCurve}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Competitive Position:</span>
                          <span className="font-medium">{selectedScenario.metrics.competitivePosition}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
                <Button size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
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
