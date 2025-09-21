"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Shield
} from 'lucide-react';

interface RiskScenarioMatrixProps {
  className?: string;
}

interface Scenario {
  name: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  probability: number;
  revenue: number;
  risk: number;
  description: string;
  factors: string[];
}

export function RiskScenarioMatrix({ className = '' }: RiskScenarioMatrixProps) {
  const [scenarioData, setScenarioData] = React.useState<{
    scenarios: Scenario[];
    baseRevenue: number;
    riskAdjustedRevenue: number;
    riskScore: number;
    topRisks: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadScenarioData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate risk scenario matrix data
        const scenarios: Scenario[] = [
          {
            name: 'Optimistic',
            type: 'optimistic',
            probability: 25,
            revenue: 650000,
            risk: 15,
            description: 'Best case scenario with market expansion',
            factors: ['New enterprise clients', 'Product adoption increase', 'Market growth']
          },
          {
            name: 'Realistic',
            type: 'realistic',
            probability: 50,
            revenue: 520000,
            risk: 35,
            description: 'Most likely outcome based on current trends',
            factors: ['Steady client growth', 'Normal churn rates', 'Stable market conditions']
          },
          {
            name: 'Pessimistic',
            type: 'pessimistic',
            probability: 25,
            revenue: 380000,
            risk: 65,
            description: 'Worst case scenario with market challenges',
            factors: ['Economic downturn', 'Increased competition', 'Client churn']
          }
        ];

        const baseRevenue = 520000; // Realistic scenario as base
        const riskAdjustedRevenue = scenarios.reduce((sum, scenario) => 
          sum + (scenario.revenue * scenario.probability / 100), 0
        );
        const riskScore = scenarios.reduce((sum, scenario) => 
          sum + (scenario.risk * scenario.probability / 100), 0
        );
        const topRisks = ['Market volatility', 'Client churn', 'Competition', 'Economic factors'];

        setScenarioData({
          scenarios,
          baseRevenue,
          riskAdjustedRevenue,
          riskScore,
          topRisks
        });
      } catch (error) {
        // Failed to load risk scenario data
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarioData();
  }, []);

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'optimistic': return 'text-success';
      case 'realistic': return 'text-primary';
      case 'pessimistic': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getScenarioBadge = (type: string) => {
    switch (type) {
      case 'optimistic': return 'bg-success/10 text-green-800';
      case 'realistic': return 'bg-primary/10 text-blue-800';
      case 'pessimistic': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-success';
    if (risk <= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskBadge = (risk: number) => {
    if (risk <= 30) return 'bg-success/10 text-green-800';
    if (risk <= 50) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getRiskLevel = (risk: number) => {
    if (risk <= 30) return 'Low';
    if (risk <= 50) return 'Medium';
    return 'High';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Risk Scenario Matrix</span>
          </CardTitle>
          <CardDescription>Loading risk scenario data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scenarioData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Risk Scenario Matrix</span>
          </CardTitle>
          <CardDescription>Unable to load risk scenario data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Risk Scenario Matrix</span>
        </CardTitle>
        <CardDescription>
          Cross-tab optimistic vs pessimistic vs base case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              ${scenarioData.riskAdjustedRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Risk-Adjusted Revenue</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Shield className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">
              {scenarioData.riskScore.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Risk Score</p>
          </div>
        </div>

        {/* Risk-Adjusted Revenue */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getRiskColor(scenarioData.riskScore)}`} />
            <span className={`text-2xl font-bold ${getRiskColor(scenarioData.riskScore)}`}>
              ${scenarioData.riskAdjustedRevenue.toLocaleString()}
            </span>
            <Badge className={getRiskBadge(scenarioData.riskScore)}>
              {getRiskLevel(scenarioData.riskScore)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Risk-Adjusted Revenue Forecast</p>
          <div className="mt-3">
            <Progress value={Math.min((scenarioData.riskAdjustedRevenue / 700000) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Scenarios */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Revenue Scenarios</h4>
          <div className="space-y-2">
            {scenarioData.scenarios.map((scenario) => (
              <div key={scenario.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">
                      {scenario.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{scenario.name}</p>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-foreground">
                      ${scenario.revenue.toLocaleString()}
                    </p>
                    <Badge className={getScenarioBadge(scenario.type)}>
                      {scenario.probability}%
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className={getRiskBadge(scenario.risk)}>
                      {getRiskLevel(scenario.risk)} Risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Scenario Comparison</h4>
          <div className="grid grid-cols-3 gap-2">
            {scenarioData.scenarios.map((scenario) => (
              <div key={scenario.name} className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className={`text-lg font-bold ${getScenarioColor(scenario.type)} mb-1`}>
                  ${scenario.revenue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{scenario.name}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Probability:</span>
                    <span>{scenario.probability}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Risk:</span>
                    <span>{scenario.risk}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Key Risk Factors</h4>
          <div className="space-y-2">
            {scenarioData.topRisks.map((risk, index) => (
              <div key={risk} className="flex items-center justify-between p-2 bg-muted/50 rounded-[0.625rem]">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-foreground">{risk}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Factor {index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Risk Distribution</h4>
          <div className="space-y-2">
            {scenarioData.scenarios.map((scenario) => (
              <div key={scenario.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{scenario.name}</span>
                  <span className="text-foreground font-medium">{scenario.risk}%</span>
                </div>
                <Progress value={scenario.risk} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Risk Scenario Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Risk-adjusted revenue: ${scenarioData.riskAdjustedRevenue.toLocaleString()}</li>
            <li>• Overall risk score: {scenarioData.riskScore.toFixed(0)}%</li>
            <li>• {scenarioData.scenarios.length} scenarios analyzed</li>
            <li>• Optimistic scenario: ${scenarioData.scenarios.find(s => s.type === 'optimistic')?.revenue.toLocaleString()}</li>
            <li>• Pessimistic scenario: ${scenarioData.scenarios.find(s => s.type === 'pessimistic')?.revenue.toLocaleString()}</li>
            <li>• {scenarioData.topRisks.length} key risk factors identified</li>
            {scenarioData.riskScore > 50 && (
              <li>• High risk score - consider risk mitigation strategies</li>
            )}
            {scenarioData.riskScore <= 30 && (
              <li>• Low risk score - favorable conditions</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RiskScenarioMatrix;




