"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Heart
} from 'lucide-react';

interface CSATNPSTrendsProps {
  className?: string;
}

interface SatisfactionData {
  period: string;
  csat: number;
  nps: number;
  responseCount: number;
  trend: 'up' | 'down' | 'stable';
}

export function CSATNPSTrends({ className = '' }: CSATNPSTrendsProps) {
  const [satisfactionData, setSatisfactionData] = React.useState<{
    currentCSAT: number;
    currentNPS: number;
    trends: SatisfactionData[];
    averageCSAT: number;
    averageNPS: number;
    responseRate: number;
    segmentBreakdown: Array<{
      segment: string;
      csat: number;
      nps: number;
      responseCount: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSatisfactionData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate satisfaction data
        const trends: SatisfactionData[] = [
          {
            period: 'Jan',
            csat: 4.2,
            nps: 35,
            responseCount: 45,
            trend: 'up'
          },
          {
            period: 'Feb',
            csat: 4.3,
            nps: 38,
            responseCount: 52,
            trend: 'up'
          },
          {
            period: 'Mar',
            csat: 4.1,
            nps: 32,
            responseCount: 48,
            trend: 'down'
          },
          {
            period: 'Apr',
            csat: 4.4,
            nps: 42,
            responseCount: 58,
            trend: 'up'
          },
          {
            period: 'May',
            csat: 4.5,
            nps: 45,
            responseCount: 62,
            trend: 'up'
          },
          {
            period: 'Jun',
            csat: 4.6,
            nps: 48,
            responseCount: 68,
            trend: 'up'
          }
        ];

        const currentCSAT = trends[trends.length - 1].csat;
        const currentNPS = trends[trends.length - 1].nps;
        const averageCSAT = trends.reduce((sum, t) => sum + t.csat, 0) / trends.length;
        const averageNPS = trends.reduce((sum, t) => sum + t.nps, 0) / trends.length;
        const responseRate = 68; // Simulated

        const segmentBreakdown = [
          {
            segment: 'Enterprise',
            csat: 4.8,
            nps: 52,
            responseCount: 25
          },
          {
            segment: 'SMB',
            csat: 4.4,
            nps: 38,
            responseCount: 30
          },
          {
            segment: 'Individual',
            csat: 4.2,
            nps: 28,
            responseCount: 13
          }
        ];

        setSatisfactionData({
          currentCSAT,
          currentNPS,
          trends,
          averageCSAT,
          averageNPS,
          responseRate,
          segmentBreakdown
        });
      } catch (error) {
        console.error('Failed to load satisfaction data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSatisfactionData();
  }, []);

  const getCSATColor = (csat: number) => {
    if (csat >= 4.5) return 'text-green-600';
    if (csat >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCSATBadge = (csat: number) => {
    if (csat >= 4.5) return 'bg-green-100 text-green-800';
    if (csat >= 4.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCSATLevel = (csat: number) => {
    if (csat >= 4.5) return 'Excellent';
    if (csat >= 4.0) return 'Good';
    return 'Poor';
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 50) return 'text-green-600';
    if (nps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNPSBadge = (nps: number) => {
    if (nps >= 50) return 'bg-green-100 text-green-800';
    if (nps >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getNPSLevel = (nps: number) => {
    if (nps >= 50) return 'Excellent';
    if (nps >= 30) return 'Good';
    return 'Poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>CSAT/NPS Trends</span>
          </CardTitle>
          <CardDescription>Loading satisfaction data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!satisfactionData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>CSAT/NPS Trends</span>
          </CardTitle>
          <CardDescription>Unable to load satisfaction data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-600" />
          <span>CSAT/NPS Trends</span>
        </CardTitle>
        <CardDescription>
          Customer satisfaction trends over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">
              {satisfactionData.currentCSAT.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Current CSAT</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Heart className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              {satisfactionData.currentNPS}
            </p>
            <p className="text-xs text-gray-500">Current NPS</p>
          </div>
        </div>

        {/* Current Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className={`h-6 w-6 ${getCSATColor(satisfactionData.currentCSAT)}`} />
              <span className={`text-2xl font-bold ${getCSATColor(satisfactionData.currentCSAT)}`}>
                {satisfactionData.currentCSAT.toFixed(1)}
              </span>
              <Badge className={getCSATBadge(satisfactionData.currentCSAT)}>
                {getCSATLevel(satisfactionData.currentCSAT)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Customer Satisfaction</p>
            <div className="mt-3">
              <Progress value={(satisfactionData.currentCSAT / 5) * 100} className="h-2" />
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className={`h-6 w-6 ${getNPSColor(satisfactionData.currentNPS)}`} />
              <span className={`text-2xl font-bold ${getNPSColor(satisfactionData.currentNPS)}`}>
                {satisfactionData.currentNPS}
              </span>
              <Badge className={getNPSBadge(satisfactionData.currentNPS)}>
                {getNPSLevel(satisfactionData.currentNPS)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Net Promoter Score</p>
            <div className="mt-3">
              <Progress value={Math.min((satisfactionData.currentNPS + 100) / 2, 100)} className="h-2" />
            </div>
          </div>
        </div>

        {/* Trends Over Time */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Trends Over Time</h4>
          <div className="space-y-2">
            {satisfactionData.trends.slice(-4).map((trend) => {
              const TrendIcon = getTrendIcon(trend.trend);
              
              return (
                <div key={trend.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">
                        {trend.period}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{trend.period} 2024</p>
                      <p className="text-xs text-gray-500">{trend.responseCount} responses</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${getCSATColor(trend.csat)}`}>
                          {trend.csat.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">CSAT</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${getNPSColor(trend.nps)}`}>
                          {trend.nps}
                        </p>
                        <p className="text-xs text-gray-500">NPS</p>
                      </div>
                      <TrendIcon className={`h-4 w-4 ${getTrendColor(trend.trend)}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Segment Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Segment Breakdown</h4>
          <div className="space-y-2">
            {satisfactionData.segmentBreakdown.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {segment.segment.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                    <p className="text-xs text-gray-500">{segment.responseCount} responses</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${getCSATColor(segment.csat)}`}>
                        {segment.csat.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">CSAT</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${getNPSColor(segment.nps)}`}>
                        {segment.nps}
                      </p>
                      <p className="text-xs text-gray-500">NPS</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Rate */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">
              {satisfactionData.responseRate}%
            </span>
            <Badge variant="outline" className="text-xs">
              Response Rate
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Survey Response Rate</p>
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
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Satisfaction Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Current CSAT: {satisfactionData.currentCSAT.toFixed(1)}/5.0</li>
            <li>• Current NPS: {satisfactionData.currentNPS}</li>
            <li>• Average CSAT: {satisfactionData.averageCSAT.toFixed(1)}/5.0</li>
            <li>• Average NPS: {satisfactionData.averageNPS.toFixed(0)}</li>
            <li>• Response rate: {satisfactionData.responseRate}%</li>
            <li>• {satisfactionData.trends.length} months of data</li>
            {satisfactionData.currentCSAT >= 4.5 && (
              <li>• Excellent customer satisfaction - maintain quality</li>
            )}
            {satisfactionData.currentNPS >= 50 && (
              <li>• High NPS - strong customer advocacy</li>
            )}
            {satisfactionData.responseRate < 50 && (
              <li>• Low response rate - consider survey optimization</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CSATNPSTrends;
