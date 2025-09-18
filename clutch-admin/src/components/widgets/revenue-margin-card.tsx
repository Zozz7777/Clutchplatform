"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Server, 
  Wrench, 
  MoreHorizontal,
  PieChart,
  BarChart3
} from 'lucide-react';

interface RevenueMarginCardProps {
  className?: string;
}

export function RevenueMarginCard({ className = '' }: RevenueMarginCardProps) {
  const [marginData, setMarginData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMarginData = async () => {
      try {
        const data = await businessIntelligence.getRevenueVsCostMargin();
        setMarginData(data);
      } catch (error) {
        console.error('Failed to load margin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarginData();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Revenue vs Cost Margin</span>
          </CardTitle>
          <CardDescription>Loading financial metrics...</CardDescription>
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

  if (!marginData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Revenue vs Cost Margin</span>
          </CardTitle>
          <CardDescription>Unable to load financial metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 30) return 'bg-green-100 text-green-800';
    if (margin >= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMarginTrend = (margin: number) => {
    if (margin >= 30) return { icon: TrendingUp, color: 'text-green-500', text: 'Excellent' };
    if (margin >= 15) return { icon: TrendingUp, color: 'text-yellow-500', text: 'Good' };
    return { icon: TrendingDown, color: 'text-red-500', text: 'Needs Attention' };
  };

  const totalCosts = marginData.breakdown.fleet + marginData.breakdown.infrastructure + 
                    marginData.breakdown.maintenance + marginData.breakdown.other;

  const costBreakdown = [
    {
      name: 'Fleet Operations',
      amount: marginData.breakdown.fleet,
      percentage: (marginData.breakdown.fleet / totalCosts) * 100,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Infrastructure',
      amount: marginData.breakdown.infrastructure,
      percentage: (marginData.breakdown.infrastructure / totalCosts) * 100,
      icon: Server,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Maintenance',
      amount: marginData.breakdown.maintenance,
      percentage: (marginData.breakdown.maintenance / totalCosts) * 100,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Other',
      amount: marginData.breakdown.other,
      percentage: (marginData.breakdown.other / totalCosts) * 100,
      icon: MoreHorizontal,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const trend = getMarginTrend(marginData.margin);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Revenue vs Cost Margin</span>
        </CardTitle>
        <CardDescription>
          Monthly revenue vs operational costs breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ${marginData.revenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">+12% vs last month</Badge>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">
              ${marginData.costs.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Monthly Costs</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">+5% vs last month</Badge>
            </div>
          </div>
        </div>

        {/* Margin Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <trend.icon className={`h-5 w-5 ${trend.color}`} />
            <span className={`text-2xl font-bold ${getMarginColor(marginData.margin)}`}>
              {marginData.margin.toFixed(1)}%
            </span>
            <Badge className={getMarginBadge(marginData.margin)}>
              {trend.text}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Net Profit Margin</p>
          <div className="mt-3">
            <Progress value={marginData.margin} className="h-2" />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Cost Breakdown</span>
          </h4>
          
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg-full ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}% of total costs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${item.amount.toLocaleString()}
                  </p>
                  <div className="w-16 mt-1">
                    <Progress value={item.percentage} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost vs Revenue Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Revenue vs Costs</span>
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-sm font-medium">${marginData.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-lg-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-lg-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Costs</span>
              <span className="text-sm font-medium">${marginData.costs.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-lg-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-lg-full" 
                style={{ width: `${(marginData.costs / marginData.revenue) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            {marginData.margin >= 30 && (
              <li>• Excellent profit margin - consider expansion opportunities</li>
            )}
            {marginData.margin < 30 && marginData.margin >= 15 && (
              <li>• Good margin - monitor cost trends closely</li>
            )}
            {marginData.margin < 15 && (
              <li>• Margin needs improvement - review cost optimization strategies</li>
            )}
            <li>• Fleet operations represent {(costBreakdown[0].percentage).toFixed(0)}% of total costs</li>
            <li>• Infrastructure costs are stable at ${marginData.breakdown.infrastructure.toLocaleString()}/month</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueMarginCard;
