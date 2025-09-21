"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { logger } from '@/lib/logger';
import { useTranslations } from '@/hooks/use-translations';
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
  const { t } = useTranslations();
  const [marginData, setMarginData] = React.useState<{
    revenue: number;
    costs: number;
    margin: number;
    breakdown: {
      fleet: number;
      infrastructure: number;
      maintenance: number;
      other: number;
    };
    revenueGrowth: number;
    costGrowth: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMarginData = async () => {
      try {
        const data = await businessIntelligence.getRevenueVsCostMargin();
        setMarginData(data);
      } catch (error) {
        logger.error('Failed to load margin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarginData();
  }, []);

  if (isLoading) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <DollarSign className="h-5 w-5 text-success" />
            <span>Revenue vs Cost Margin</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Loading financial metrics...</CardDescription>
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

  if (!marginData) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <DollarSign className="h-5 w-5 text-success" />
            <span>Revenue vs Cost Margin</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Unable to load financial metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-success';
    if (margin >= 15) return 'text-warning';
    return 'text-destructive';
  };

  const getMarginBadge = (margin: number) => {
    if (margin >= 30) return 'bg-success/10 text-success border-success/20';
    if (margin >= 15) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getMarginTrend = (margin: number) => {
    if (margin >= 30) return { icon: TrendingUp, color: 'text-success', text: 'Excellent' };
    if (margin >= 15) return { icon: TrendingUp, color: 'text-warning', text: 'Good' };
    return { icon: TrendingDown, color: 'text-destructive', text: 'Needs Attention' };
  };

  const totalCosts = marginData.breakdown.fleet + marginData.breakdown.infrastructure + 
                    marginData.breakdown.maintenance + marginData.breakdown.other;

  const costBreakdown = [
    {
      name: 'Fleet Operations',
      amount: marginData.breakdown.fleet,
      percentage: (marginData.breakdown.fleet / totalCosts) * 100,
      icon: Truck,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      name: 'Infrastructure',
      amount: marginData.breakdown.infrastructure,
      percentage: (marginData.breakdown.infrastructure / totalCosts) * 100,
      icon: Server,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      name: 'Maintenance',
      amount: marginData.breakdown.maintenance,
      percentage: (marginData.breakdown.maintenance / totalCosts) * 100,
      icon: Wrench,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      name: 'Other',
      amount: marginData.breakdown.other,
      percentage: (marginData.breakdown.other / totalCosts) * 100,
      icon: MoreHorizontal,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50'
    }
  ];

  const trend = getMarginTrend(marginData.margin);

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <DollarSign className="h-5 w-5 text-success" />
          <span>Revenue vs Cost Margin</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Monthly revenue vs operational costs breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-success">
              {marginData.revenue.toLocaleString()} EGP
            </p>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {marginData.revenueGrowth > 0 ? '+' : ''}{marginData.revenueGrowth.toFixed(1)}% vs last month
              </Badge>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-destructive">
              {marginData.costs.toLocaleString()} EGP
            </p>
            <p className="text-sm text-muted-foreground">Monthly Costs</p>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {marginData.costGrowth > 0 ? '+' : ''}{marginData.costGrowth.toFixed(1)}% vs last month
              </Badge>
            </div>
          </div>
        </div>

        {/* Margin Display */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem] border border-border">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <trend.icon className={`h-5 w-5 ${trend.color}`} />
            <span className={`text-2xl font-bold ${getMarginColor(marginData.margin)}`}>
              {marginData.margin.toFixed(1)}%
            </span>
            <Badge className={getMarginBadge(marginData.margin)}>
              {trend.text}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Net Profit Margin</p>
          <div className="mt-3">
            <Progress value={marginData.margin} className="h-2" />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground flex items-center space-x-2">
            <PieChart className="h-4 w-4" />
            <span>Cost Breakdown</span>
          </h4>
          
          <div className="space-y-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}% of total costs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">
                    {item.amount.toLocaleString()} EGP
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
          <h4 className="text-sm font-medium text-card-foreground flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Revenue vs Costs</span>
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="text-sm font-medium text-card-foreground">{marginData.revenue.toLocaleString()} EGP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Costs</span>
              <span className="text-sm font-medium text-card-foreground">{marginData.costs.toLocaleString()} EGP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-destructive h-2 rounded-full" 
                style={{ width: `${(marginData.costs / marginData.revenue) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
          <h5 className="text-sm font-medium text-primary mb-2">💡 Insights</h5>
          <ul className="text-xs text-primary/80 space-y-1">
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
            <li>• Infrastructure costs are stable at {marginData.breakdown.infrastructure.toLocaleString()} EGP/month</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueMarginCard;
