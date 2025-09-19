"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Clock,
  Download,
  Eye,
  BarChart3,
  Target,
  Activity,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { realApi } from '@/lib/real-api';

interface ChurnAttributionProps {
  className?: string;
}

interface ChurnReason {
  reason: string;
  percentage: number;
  count: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

// Helper functions
const getIconForReason = (reason: string) => {
  switch (reason.toLowerCase()) {
    case 'inactivity': return Activity;
    case 'billing issues': return DollarSign;
    case 'fleet delays': return Clock;
    case 'poor support': return MessageSquare;
    case 'competitor switch': return XCircle;
    default: return AlertTriangle;
  }
};

const getColorForImpact = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-destructive';
    case 'medium': return 'text-warning';
    case 'low': return 'text-primary';
    default: return 'text-muted-foreground';
  }
};

export function ChurnAttribution({ className = '' }: ChurnAttributionProps) {
  const [churnReasons, setChurnReasons] = React.useState<ChurnReason[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadChurnAttribution = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API
        const churnData = await realApi.getChurnAttribution();
        
        // Transform API data to component format
        const reasons: ChurnReason[] = (churnData || []).map((item: Record<string, unknown>) => ({
          reason: item.reason,
          percentage: item.percentage,
          count: item.count,
          impact: item.impact,
          description: item.description,
          icon: getIconForReason(item.reason),
          color: getColorForImpact(item.impact),
          trend: item.trend
        }));

        setChurnReasons(reasons);
      } catch (error) {
        // Error handled by API service
        // Set empty array on error - no mock data fallback
        setChurnReasons([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChurnAttribution();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/10 text-red-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingDown; // Up trend means more churn
      case 'down': return TrendingDown; // Down trend means less churn
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-destructive'; // Up trend is bad for churn
      case 'down': return 'text-success'; // Down trend is good for churn
      default: return 'text-muted-foreground';
    }
  };

  const getTotalChurned = () => {
    return churnReasons.reduce((sum, reason) => sum + reason.count, 0);
  };

  const getHighImpactReasons = () => {
    return churnReasons.filter(reason => reason.impact === 'high');
  };

  const getTopReason = () => {
    return churnReasons.length > 0 ? churnReasons[0] : null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <span>Churn Attribution</span>
          </CardTitle>
          <CardDescription>Loading churn attribution data...</CardDescription>
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

  const totalChurned = getTotalChurned();
  const highImpactReasons = getHighImpactReasons();
  const topReason = getTopReason();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingDown className="h-5 w-5 text-destructive" />
          <span>Churn Attribution</span>
        </CardTitle>
        <CardDescription>
          Why users leave (inactivity, billing issues, fleet delays)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{totalChurned}</p>
            <p className="text-xs text-muted-foreground">Total Churned</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{highImpactReasons.length}</p>
            <p className="text-xs text-muted-foreground">High Impact</p>
          </div>
        </div>

        {/* Top Churn Reason */}
        {topReason && (
          <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <topReason.icon className={`h-6 w-6 ${topReason.color}`} />
              <span className="text-xl font-bold text-foreground">{topReason.reason}</span>
              <Badge className={getImpactBadge(topReason.impact)}>
                {topReason.impact}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{topReason.percentage}% of churn cases</p>
            <div className="mt-3">
              <Progress value={topReason.percentage} className="h-2" />
            </div>
          </div>
        )}

        {/* Churn Reasons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Churn Reasons</h4>
          <div className="space-y-2">
            {churnReasons.map((reason, index) => {
              const ReasonIcon = reason.icon;
              const TrendIcon = getTrendIcon(reason.trend);
              
              return (
                <div key={reason.reason} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-[0.625rem]-full">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <ReasonIcon className={`h-4 w-4 ${reason.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{reason.reason}</p>
                      <p className="text-xs text-muted-foreground">{reason.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">{reason.count}</p>
                      <Badge className={getImpactBadge(reason.impact)}>
                        {reason.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(reason.trend)}`} />
                      <span className={`text-xs ${getTrendColor(reason.trend)}`}>
                        {reason.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Churn Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Churn Distribution</h4>
          <div className="space-y-2">
            {churnReasons.map((reason) => (
              <div key={reason.reason} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{reason.reason}</span>
                  <span className="text-foreground font-medium">{reason.percentage}%</span>
                </div>
                <Progress value={reason.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Impact Analysis</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-destructive/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-destructive">
                {churnReasons.filter(r => r.impact === 'high').length}
              </p>
              <p className="text-xs text-muted-foreground">High Impact</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {churnReasons.filter(r => r.impact === 'medium').length}
              </p>
              <p className="text-xs text-muted-foreground">Medium Impact</p>
            </div>
            <div className="text-center p-2 bg-success/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-success">
                {churnReasons.filter(r => r.impact === 'low').length}
              </p>
              <p className="text-xs text-muted-foreground">Low Impact</p>
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
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Churn Attribution Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total churned users: {totalChurned}</li>
            <li>• Top churn reason: {topReason?.reason} ({topReason?.percentage}%)</li>
            <li>• {highImpactReasons.length} high-impact churn reasons</li>
            <li>• {churnReasons.filter(r => r.trend === 'up').length} reasons trending up</li>
            <li>• {churnReasons.filter(r => r.trend === 'down').length} reasons trending down</li>
            {topReason && topReason.percentage > 30 && (
              <li>• {topReason.reason} is the primary churn driver - focus on prevention</li>
            )}
            {highImpactReasons.length > 2 && (
              <li>• Multiple high-impact churn reasons - comprehensive retention strategy needed</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChurnAttribution;
