"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface CashFlowProjectionProps {
  className?: string;
}

interface CashFlowData {
  currentBalance: number;
  projectedBalance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  netCashFlow: number;
  projectionPeriod: number;
  scenarios: Array<{
    scenario: string;
    balance: number;
    probability: number;
    description: string;
  }>;
  upcomingPayments: Array<{
    date: string;
    amount: number;
    type: 'inflow' | 'outflow';
    description: string;
  }>;
}

export function CashFlowProjection({ className = '' }: CashFlowProjectionProps) {
  const [cashFlowData, setCashFlowData] = React.useState<CashFlowData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'30d' | '90d' | '180d'>('90d');

  React.useEffect(() => {
    const loadCashFlowData = async () => {
      try {
        const [payments, expenses] = await Promise.all([
          productionApi.getPayments(),
          productionApi.getExpenses()
        ]);

        const currentBalance = 125000; // Simulated current balance
        const monthlyInflow = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const monthlyOutflow = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        const netCashFlow = monthlyInflow - monthlyOutflow;
        
        const days = selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 180;
        const projectedBalance = currentBalance + (netCashFlow * (days / 30));

        const scenarios = [
          {
            scenario: 'Optimistic',
            balance: projectedBalance * 1.2,
            probability: 25,
            description: 'Best case scenario with 20% growth'
          },
          {
            scenario: 'Realistic',
            balance: projectedBalance,
            probability: 50,
            description: 'Most likely outcome based on current trends'
          },
          {
            scenario: 'Pessimistic',
            balance: projectedBalance * 0.8,
            probability: 25,
            description: 'Worst case scenario with 20% decline'
          }
        ];

        const upcomingPayments = [
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 15000,
            type: 'inflow' as const,
            description: 'Client payment - Enterprise A'
          },
          {
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 8500,
            type: 'inflow' as const,
            description: 'Client payment - SMB B'
          },
          {
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 12000,
            type: 'outflow' as const,
            description: 'Infrastructure costs'
          },
          {
            date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 8000,
            type: 'outflow' as const,
            description: 'Employee salaries'
          }
        ];

        setCashFlowData({
          currentBalance,
          projectedBalance,
          monthlyInflow,
          monthlyOutflow,
          netCashFlow,
          projectionPeriod: days,
          scenarios,
          upcomingPayments
        });
      } catch (error) {
        console.error('Failed to load cash flow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCashFlowData();
  }, [selectedPeriod]);

  const getBalanceColor = (balance: number) => {
    if (balance >= 100000) return 'text-green-600';
    if (balance >= 50000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceBadge = (balance: number) => {
    if (balance >= 100000) return 'bg-green-100 text-green-800';
    if (balance >= 50000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getBalanceLevel = (balance: number) => {
    if (balance >= 100000) return 'Healthy';
    if (balance >= 50000) return 'Moderate';
    return 'Low';
  };

  const getCashFlowColor = (flow: number) => {
    if (flow > 0) return 'text-green-600';
    if (flow < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCashFlowIcon = (flow: number) => {
    if (flow > 0) return TrendingUp;
    if (flow < 0) return TrendingDown;
    return Activity;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Cash Flow Projection</span>
          </CardTitle>
          <CardDescription>Loading cash flow data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cashFlowData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Cash Flow Projection</span>
          </CardTitle>
          <CardDescription>Unable to load cash flow data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const CashFlowIcon = getCashFlowIcon(cashFlowData.netCashFlow);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Cash Flow Projection</span>
        </CardTitle>
        <CardDescription>
          Next 90 days based on invoices & subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['30d', '90d', '180d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1"
            >
              {period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '180 Days'}
            </Button>
          ))}
        </div>

        {/* Current vs Projected Balance */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getBalanceColor(cashFlowData.projectedBalance)}`} />
            <span className={`text-2xl font-bold ${getBalanceColor(cashFlowData.projectedBalance)}`}>
              ${cashFlowData.projectedBalance.toLocaleString()}
            </span>
            <Badge className={getBalanceBadge(cashFlowData.projectedBalance)}>
              {getBalanceLevel(cashFlowData.projectedBalance)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Projected Balance in {selectedPeriod}</p>
          <div className="mt-3">
            <Progress value={Math.min((cashFlowData.projectedBalance / 200000) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${cashFlowData.monthlyInflow.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Monthly Inflow</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">
              ${cashFlowData.monthlyOutflow.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Monthly Outflow</p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center space-x-3">
            <CashFlowIcon className={`h-4 w-4 ${getCashFlowColor(cashFlowData.netCashFlow)}`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Net Cash Flow</p>
              <p className="text-xs text-gray-500">Monthly net flow</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${getCashFlowColor(cashFlowData.netCashFlow)}`}>
              ${cashFlowData.netCashFlow.toLocaleString()}
            </p>
            <Badge variant="outline" className="text-xs">
              {cashFlowData.netCashFlow > 0 ? 'Positive' : 'Negative'}
            </Badge>
          </div>
        </div>

        {/* Scenarios */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Projection Scenarios</h4>
          <div className="space-y-2">
            {cashFlowData.scenarios.map((scenario) => (
              <div key={scenario.scenario} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg-lg-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {scenario.scenario.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{scenario.scenario}</p>
                    <p className="text-xs text-gray-500">{scenario.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-semibold ${getBalanceColor(scenario.balance)}`}>
                      ${scenario.balance.toLocaleString()}
                    </p>
                    <Badge className={getBalanceBadge(scenario.balance)}>
                      {scenario.probability}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Upcoming Payments</h4>
          <div className="space-y-2">
            {cashFlowData.upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg-lg-full ${
                    payment.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {payment.type === 'inflow' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    payment.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {payment.type === 'inflow' ? '+' : '-'}${payment.amount.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {payment.type === 'inflow' ? 'Inflow' : 'Outflow'}
                  </Badge>
                </div>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Cash Flow Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Current balance: ${cashFlowData.currentBalance.toLocaleString()}</li>
            <li>• Projected balance: ${cashFlowData.projectedBalance.toLocaleString()}</li>
            <li>• Monthly net flow: ${cashFlowData.netCashFlow.toLocaleString()}</li>
            <li>• Projection period: {cashFlowData.projectionPeriod} days</li>
            <li>• {cashFlowData.scenarios.length} scenarios analyzed</li>
            {cashFlowData.netCashFlow > 0 && (
              <li>• Positive cash flow - healthy financial position</li>
            )}
            {cashFlowData.netCashFlow < 0 && (
              <li>• Negative cash flow - monitor expenses closely</li>
            )}
            {cashFlowData.projectedBalance < 50000 && (
              <li>• Low projected balance - consider cost optimization</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CashFlowProjection;
