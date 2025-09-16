"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Calendar,
  Star,
  Building2
} from 'lucide-react';

interface ClientGrowthContributionProps {
  className?: string;
}

interface ClientGrowth {
  clientId: string;
  clientName: string;
  segment: string;
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  contribution: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  lastActivity: string;
}

export function ClientGrowthContribution({ className = '' }: ClientGrowthContributionProps) {
  const [growthData, setGrowthData] = React.useState<{
    clients: ClientGrowth[];
    totalCurrentRevenue: number;
    totalProjectedRevenue: number;
    averageGrowthRate: number;
    topContributors: ClientGrowth[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadGrowthData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate client growth contribution data
        const clients: ClientGrowth[] = [
          {
            clientId: '1',
            clientName: 'Enterprise Client A',
            segment: 'Enterprise',
            currentRevenue: 125000,
            projectedRevenue: 150000,
            growthRate: 20,
            contribution: 25,
            confidence: 90,
            trend: 'up',
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            clientId: '2',
            clientName: 'SMB Client B',
            segment: 'SMB',
            currentRevenue: 85000,
            projectedRevenue: 95000,
            growthRate: 12,
            contribution: 10,
            confidence: 85,
            trend: 'up',
            lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            clientId: '3',
            clientName: 'Enterprise Client C',
            segment: 'Enterprise',
            currentRevenue: 95000,
            projectedRevenue: 110000,
            growthRate: 16,
            contribution: 15,
            confidence: 88,
            trend: 'up',
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            clientId: '4',
            clientName: 'SMB Client D',
            segment: 'SMB',
            currentRevenue: 45000,
            projectedRevenue: 48000,
            growthRate: 7,
            contribution: 3,
            confidence: 75,
            trend: 'stable',
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            clientId: '5',
            clientName: 'Individual Client E',
            segment: 'Individual',
            currentRevenue: 25000,
            projectedRevenue: 28000,
            growthRate: 12,
            contribution: 3,
            confidence: 80,
            trend: 'up',
            lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const totalCurrentRevenue = clients.reduce((sum, client) => sum + client.currentRevenue, 0);
        const totalProjectedRevenue = clients.reduce((sum, client) => sum + client.projectedRevenue, 0);
        const averageGrowthRate = clients.reduce((sum, client) => sum + client.growthRate, 0) / clients.length;
        const topContributors = clients
          .sort((a, b) => b.contribution - a.contribution)
          .slice(0, 3);

        setGrowthData({
          clients,
          totalCurrentRevenue,
          totalProjectedRevenue,
          averageGrowthRate,
          topContributors
        });
      } catch (error) {
        console.error('Failed to load client growth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGrowthData();
  }, []);

  const getGrowthColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600';
    if (rate >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthBadge = (rate: number) => {
    if (rate >= 15) return 'bg-green-100 text-green-800';
    if (rate >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGrowthLevel = (rate: number) => {
    if (rate >= 15) return 'High';
    if (rate >= 10) return 'Medium';
    return 'Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-800';
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Client Growth Contribution</span>
          </CardTitle>
          <CardDescription>Loading client growth data...</CardDescription>
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

  if (!growthData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Client Growth Contribution</span>
          </CardTitle>
          <CardDescription>Unable to load client growth data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span>Client Growth Contribution</span>
        </CardTitle>
        <CardDescription>
          Which accounts drive forecasted growth
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${(growthData.totalProjectedRevenue - growthData.totalCurrentRevenue).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Growth Revenue</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              {growthData.averageGrowthRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Avg Growth Rate</p>
          </div>
        </div>

        {/* Total Growth Impact */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              ${growthData.totalProjectedRevenue.toLocaleString()}
            </span>
            <Badge className="bg-green-100 text-green-800">
              Projected
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Total Projected Revenue</p>
          <div className="mt-3">
            <Progress value={(growthData.totalProjectedRevenue / (growthData.totalProjectedRevenue * 1.2)) * 100} className="h-2" />
          </div>
        </div>

        {/* Top Contributors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Growth Contributors</h4>
          <div className="space-y-2">
            {growthData.topContributors.map((client, index) => {
              const TrendIcon = getTrendIcon(client.trend);
              
              return (
                <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                      <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                    </div>
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.clientName}</p>
                      <p className="text-xs text-gray-500">{client.segment}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {client.contribution}%
                      </p>
                      <Badge className={getGrowthBadge(client.growthRate)}>
                        {client.growthRate.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(client.trend)}`} />
                      <span className={`text-xs ${getTrendColor(client.trend)}`}>
                        {client.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Clients Growth */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">All Clients Growth</h4>
          <div className="space-y-2">
            {growthData.clients.map((client) => {
              const TrendIcon = getTrendIcon(client.trend);
              
              return (
                <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-semibold text-blue-600">
                        {client.clientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {client.segment} • Last activity: {formatDate(client.lastActivity)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">
                        ${client.projectedRevenue.toLocaleString()}
                      </p>
                      <Badge className={getGrowthBadge(client.growthRate)}>
                        {getGrowthLevel(client.growthRate)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(client.trend)}`} />
                      <span className={`text-xs ${getTrendColor(client.trend)}`}>
                        +{client.growthRate.toFixed(0)}% growth
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Growth Distribution</h4>
          <div className="space-y-2">
            {growthData.clients.map((client) => (
              <div key={client.clientId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{client.clientName}</span>
                  <span className="text-gray-900 font-medium">{client.contribution}%</span>
                </div>
                <Progress value={client.contribution} className="h-2" />
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
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Client Growth Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total projected revenue: ${growthData.totalProjectedRevenue.toLocaleString()}</li>
            <li>• Growth revenue: ${(growthData.totalProjectedRevenue - growthData.totalCurrentRevenue).toLocaleString()}</li>
            <li>• Average growth rate: {growthData.averageGrowthRate.toFixed(1)}%</li>
            <li>• {growthData.clients.length} clients analyzed</li>
            <li>• Top contributor: {growthData.topContributors[0]?.clientName} ({growthData.topContributors[0]?.contribution}%)</li>
            <li>• {growthData.clients.filter(c => c.trend === 'up').length} clients trending up</li>
            {growthData.averageGrowthRate >= 15 && (
              <li>• High average growth rate - strong expansion</li>
            )}
            {growthData.topContributors[0]?.contribution > 20 && (
              <li>• Top client driving significant growth - maintain relationship</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClientGrowthContribution;
