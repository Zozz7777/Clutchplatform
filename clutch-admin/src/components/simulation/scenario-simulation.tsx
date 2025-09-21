"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  DollarSign,
  Users,
  Car,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Download,
  Save
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ScenarioParameter {
  id: string;
  name: string;
  category: 'fleet' | 'pricing' | 'demand' | 'operations' | 'market';
  currentValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface ScenarioResult {
  metric: string;
  currentValue: number;
  simulatedValue: number;
  change: number;
  changePercent: number;
  unit: string;
  category: 'revenue' | 'cost' | 'efficiency' | 'satisfaction';
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
  results: ScenarioResult[];
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'draft' | 'running' | 'completed' | 'saved';
}

interface ScenarioSimulationProps {
  className?: string;
}

export default function ScenarioSimulation({ className }: ScenarioSimulationProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState('parameters');

  useEffect(() => {
    const loadScenarios = () => {
      const mockScenarios: Scenario[] = [
        {
          id: 'scenario-1',
          name: 'Fleet Expansion Analysis',
          description: 'Simulate adding 20 new vehicles to the fleet and its impact on revenue and costs',
          parameters: [
            {
              id: 'fleet-size',
              name: 'Fleet Size',
              category: 'fleet',
              currentValue: 50,
              minValue: 30,
              maxValue: 100,
              unit: 'vehicles',
              description: 'Total number of vehicles in the fleet',
              impact: 'high'
            },
            {
              id: 'utilization-rate',
              name: 'Utilization Rate',
              category: 'fleet',
              currentValue: 75,
              minValue: 50,
              maxValue: 95,
              unit: '%',
              description: 'Percentage of time vehicles are in use',
              impact: 'high'
            },
            {
              id: 'avg-fare',
              name: 'Average Fare',
              category: 'pricing',
              currentValue: 25,
              minValue: 15,
              maxValue: 40,
              unit: '$',
              description: 'Average fare per trip',
              impact: 'medium'
            },
            {
              id: 'demand-growth',
              name: 'Demand Growth',
              category: 'demand',
              currentValue: 5,
              minValue: -10,
              maxValue: 20,
              unit: '%',
              description: 'Monthly demand growth rate',
              impact: 'high'
            }
          ],
          results: [
            {
              metric: 'Monthly Revenue',
              currentValue: 125000,
              simulatedValue: 187500,
              change: 62500,
              changePercent: 50,
              unit: '$',
              category: 'revenue'
            },
            {
              metric: 'Operating Costs',
              currentValue: 75000,
              simulatedValue: 112500,
              change: 37500,
              changePercent: 50,
              unit: '$',
              category: 'cost'
            },
            {
              metric: 'Net Profit',
              currentValue: 50000,
              simulatedValue: 75000,
              change: 25000,
              changePercent: 50,
              unit: '$',
              category: 'revenue'
            },
            {
              metric: 'Customer Satisfaction',
              currentValue: 4.2,
              simulatedValue: 4.5,
              change: 0.3,
              changePercent: 7.1,
              unit: '/5',
              category: 'satisfaction'
            }
          ],
          confidence: 85,
          riskLevel: 'medium',
          createdAt: new Date().toISOString(),
          status: 'draft'
        },
        {
          id: 'scenario-2',
          name: 'Dynamic Pricing Optimization',
          description: 'Test the impact of implementing surge pricing during peak hours',
          parameters: [
            {
              id: 'surge-multiplier',
              name: 'Surge Multiplier',
              category: 'pricing',
              currentValue: 1.5,
              minValue: 1.0,
              maxValue: 3.0,
              unit: 'x',
              description: 'Price multiplier during peak hours',
              impact: 'high'
            },
            {
              id: 'peak-hours',
              name: 'Peak Hours',
              category: 'operations',
              currentValue: 4,
              minValue: 2,
              maxValue: 8,
              unit: 'hours',
              description: 'Number of peak hours per day',
              impact: 'medium'
            },
            {
              id: 'demand-elasticity',
              name: 'Demand Elasticity',
              category: 'demand',
              currentValue: -0.3,
              minValue: -0.8,
              maxValue: 0,
              unit: '',
              description: 'How demand responds to price changes',
              impact: 'high'
            }
          ],
          results: [
            {
              metric: 'Peak Hour Revenue',
              currentValue: 45000,
              simulatedValue: 67500,
              change: 22500,
              changePercent: 50,
              unit: '$',
              category: 'revenue'
            },
            {
              metric: 'Customer Retention',
              currentValue: 87,
              simulatedValue: 82,
              change: -5,
              changePercent: -5.7,
              unit: '%',
              category: 'satisfaction'
            },
            {
              metric: 'Total Daily Revenue',
              currentValue: 150000,
              simulatedValue: 172500,
              change: 22500,
              changePercent: 15,
              unit: '$',
              category: 'revenue'
            }
          ],
          confidence: 78,
          riskLevel: 'high',
          createdAt: new Date().toISOString(),
          status: 'draft'
        }
      ];

      setScenarios(mockScenarios);
      setCurrentScenario(mockScenarios[0]);
    };

    loadScenarios();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/10 text-red-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fleet': return <Car className="h-4 w-4" />;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'demand': return <TrendingUp className="h-4 w-4" />;
      case 'operations': return <Activity className="h-4 w-4" />;
      case 'market': return <BarChart3 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getResultCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-success';
      case 'cost': return 'text-destructive';
      case 'efficiency': return 'text-primary';
      case 'satisfaction': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const handleParameterChange = (parameterId: string, value: number) => {
    if (!currentScenario) return;

    const updatedScenario = {
      ...currentScenario,
      parameters: currentScenario.parameters.map(param =>
        param.id === parameterId ? { ...param, currentValue: value } : param
      )
    };

    setCurrentScenario(updatedScenario);
  };

  const runSimulation = () => {
    if (!currentScenario) return;

    setIsRunning(true);
    setSimulationProgress(0);

    // Simulate running simulation
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setCurrentScenario(prev => prev ? { ...prev, status: 'completed' as const } : null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Update scenario status
    setCurrentScenario(prev => prev ? { ...prev, status: 'running' as const } : null);
  };

  const resetSimulation = () => {
    if (!currentScenario) return;

    const resetScenario = {
      ...currentScenario,
      parameters: currentScenario.parameters.map(param => ({
        ...param,
        currentValue: param.currentValue // Reset to original values
      })),
      status: 'draft' as const
    };

    setCurrentScenario(resetScenario);
    setSimulationProgress(0);
    setIsRunning(false);
  };

  const saveScenario = () => {
    if (!currentScenario) return;

    setCurrentScenario(prev => prev ? { ...prev, status: 'saved' as const } : null);
    setScenarios(prev => prev.map(scenario =>
      scenario.id === currentScenario.id ? currentScenario : scenario
    ));
  };

  if (!currentScenario) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Scenario Selected</h3>
            <p className="text-muted-foreground">Select a scenario to begin simulation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Scenario Simulation
              </CardTitle>
              <CardDescription>
                What-if analysis for business decisions and impact modeling
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {currentScenario.name}
              </Badge>
              <Badge className={getImpactColor(currentScenario.riskLevel)}>
                {currentScenario.riskLevel} risk
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scenario Description */}
          <div className="p-4 bg-primary/10 rounded-[0.625rem]">
            <h3 className="font-semibold mb-2">{currentScenario.name}</h3>
            <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>{currentScenario.confidence}% confidence</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Created {new Date(currentScenario.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center justify-between p-4 border rounded-[0.625rem]">
            <div className="flex items-center gap-4">
              <Button
                onClick={runSimulation}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? 'Running...' : 'Run Simulation'}
              </Button>
              <Button
                variant="outline"
                onClick={resetSimulation}
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={saveScenario}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={
                currentScenario.status === 'completed' ? 'bg-success/10 text-green-800' :
                currentScenario.status === 'running' ? 'bg-primary/10 text-blue-800' :
                currentScenario.status === 'saved' ? 'bg-primary/10 text-purple-800' :
                'bg-muted text-gray-800'
              }>
                {currentScenario.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Simulation Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Simulation Progress</span>
                <span>{simulationProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              <div className="grid gap-4">
                {currentScenario.parameters.map((parameter) => (
                  <div key={parameter.id} className="p-4 border rounded-[0.625rem]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(parameter.category)}
                        <h4 className="font-medium">{parameter.name}</h4>
                      </div>
                      <Badge className={getImpactColor(parameter.impact)}>
                        {parameter.impact} impact
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{parameter.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Current: {parameter.currentValue}{parameter.unit}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Range: {parameter.minValue} - {parameter.maxValue}{parameter.unit}
                        </div>
                      </div>
                      
                      <Slider
                        value={[parameter.currentValue]}
                        onValueChange={(value) => handleParameterChange(parameter.id, value[0])}
                        min={parameter.minValue}
                        max={parameter.maxValue}
                        step={parameter.unit === '%' ? 1 : parameter.unit === '$' ? 1 : 0.1}
                        className="w-full"
                        disabled={isRunning}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {currentScenario.status === 'completed' ? (
                <div className="grid gap-4">
                  {currentScenario.results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{result.metric}</h4>
                        <Badge className={getResultCategoryColor(result.category)}>
                          {result.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="text-lg font-semibold">
                            {result.unit === '$' 
                              ? formatCurrency(result.currentValue)
                              : `${result.currentValue}${result.unit}`
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Simulated</div>
                          <div className="text-lg font-semibold">
                            {result.unit === '$' 
                              ? formatCurrency(result.simulatedValue)
                              : `${result.simulatedValue}${result.unit}`
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Change</div>
                          <div className={`text-lg font-semibold ${
                            result.change >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {result.change >= 0 ? '+' : ''}
                            {result.unit === '$' 
                              ? formatCurrency(result.change)
                              : `${result.change}${result.unit}`
                            }
                            <div className="text-sm">
                              ({result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Run the simulation to see projected results and impact analysis
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Scenario List */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Available Scenarios</h4>
            <div className="grid gap-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    currentScenario?.id === scenario.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentScenario(scenario)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-muted-foreground">{scenario.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(scenario.riskLevel)}>
                        {scenario.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">
                        {scenario.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


