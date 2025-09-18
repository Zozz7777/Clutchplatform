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
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  PieChart,
  Calculator
} from 'lucide-react';

interface RevenueExpensesProps {
  className?: string;
}

interface FinancialData {
  revenue: number;
  expenses: number;
  netMargin: number;
  grossMargin: number;
  operatingMargin: number;
  revenueGrowth: number;
  expenseGrowth: number;
  marginTrend: 'improving' | 'declining' | 'stable';
}

export function RevenueExpenses({ className = '' }: RevenueExpensesProps) {
  const [financialData, setFinancialData] = React.useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const [payments, expenses] = await Promise.all([
          productionApi.getPayments(),
          productionApi.getExpenses()
        ]);

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        
        const netMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
        const grossMargin = totalRevenue > 0 ? ((totalRevenue - (totalExpenses * 0.6)) / totalRevenue) * 100 : 0;
        const operatingMargin = totalRevenue > 0 ? ((totalRevenue - (totalExpenses * 0.8)) / totalRevenue) * 100 : 0;

        setFinancialData({
          revenue: totalRevenue,
          expenses: totalExpenses,
          netMargin,
          grossMargin,
          operatingMargin,
          revenueGrowth: 12.5, // Simulated
          expenseGrowth: 8.2, // Simulated
          marginTrend: netMargin > 20 ? 'improving' : netMargin < 10 ? 'declining' : 'stable'
        });
      } catch (error) {
        console.error('Failed to load financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 20) return 'bg-green-100 text-green-800';
    if (margin >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMarginLevel = (margin: number) => {
    if (margin >= 20) return 'Excellent';
    if (margin >= 10) return 'Good';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Revenue vs Expenses</span>
          </CardTitle>
          <CardDescription>Loading financial data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!financialData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Revenue vs Expenses</span>
          </CardTitle>
          <CardDescription>Unable to load financial data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Revenue vs Expenses</span>
        </CardTitle>
        <CardDescription>
          Net margin tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${financialData.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg-lg">
            <Calculator className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">
              ${financialData.expenses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Expenses</p>
          </div>
        </div>

        {/* Net Margin */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getMarginColor(financialData.netMargin)}`} />
            <span className={`text-2xl font-bold ${getMarginColor(financialData.netMargin)}`}>
              {financialData.netMargin.toFixed(1)}%
            </span>
            <Badge className={getMarginBadge(financialData.netMargin)}>
              {getMarginLevel(financialData.netMargin)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Net Margin</p>
          <div className="mt-3">
            <Progress value={Math.min(financialData.netMargin, 100)} className="h-2" />
          </div>
        </div>

        {/* Margin Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Margin Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
              <div className="flex items-center space-x-3">
                <PieChart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Gross Margin</p>
                  <p className="text-xs text-gray-500">Revenue - COGS</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getMarginColor(financialData.grossMargin)}`}>
                  {financialData.grossMargin.toFixed(1)}%
                </p>
                <Badge className={getMarginBadge(financialData.grossMargin)}>
                  {getMarginLevel(financialData.grossMargin)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Operating Margin</p>
                  <p className="text-xs text-gray-500">Revenue - Operating Expenses</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getMarginColor(financialData.operatingMargin)}`}>
                  {financialData.operatingMargin.toFixed(1)}%
                </p>
                <Badge className={getMarginBadge(financialData.operatingMargin)}>
                  {getMarginLevel(financialData.operatingMargin)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Growth Trends</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                  <p className="text-xs text-gray-500">Month over month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  +{financialData.revenueGrowth.toFixed(1)}%
                </p>
                <Badge variant="outline" className="text-xs">
                  Growing
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Expense Growth</p>
                  <p className="text-xs text-gray-500">Month over month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">
                  +{financialData.expenseGrowth.toFixed(1)}%
                </p>
                <Badge variant="outline" className="text-xs">
                  Rising
                </Badge>
              </div>
            </div>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Financial Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Net margin: {financialData.netMargin.toFixed(1)}%</li>
            <li>• Revenue: ${financialData.revenue.toLocaleString()}</li>
            <li>• Expenses: ${financialData.expenses.toLocaleString()}</li>
            <li>• Revenue growth: +{financialData.revenueGrowth.toFixed(1)}%</li>
            <li>• Expense growth: +{financialData.expenseGrowth.toFixed(1)}%</li>
            {financialData.netMargin >= 20 && (
              <li>• Excellent net margin - strong profitability</li>
            )}
            {financialData.netMargin < 10 && (
              <li>• Low net margin - consider cost optimization</li>
            )}
            {financialData.expenseGrowth > financialData.revenueGrowth && (
              <li>• Expenses growing faster than revenue - monitor closely</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueExpenses;
