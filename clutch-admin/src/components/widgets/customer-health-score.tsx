"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Heart, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CustomerHealthScoreProps {
  className?: string;
}

interface CustomerHealth {
  customerId: string;
  customerName: string;
  healthScore: number;
  usage: number;
  tickets: number;
  satisfaction: number;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'declining' | 'stable';
  segment: string;
}

export function CustomerHealthScore({ className = '' }: CustomerHealthScoreProps) {
  const [healthData, setHealthData] = React.useState<{
    customers: CustomerHealth[];
    averageScore: number;
    distribution: Record<string, number>;
    topPerformers: CustomerHealth[];
    atRisk: CustomerHealth[];
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadHealthData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate customer health scores
        const customerHealth: CustomerHealth[] = [
          {
            customerId: '1',
            customerName: 'Enterprise Client A',
            healthScore: 92,
            usage: 95,
            tickets: 2,
            satisfaction: 4.8,
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'low',
            trend: 'improving',
            segment: 'Enterprise'
          },
          {
            customerId: '2',
            customerName: 'SMB Client B',
            healthScore: 78,
            usage: 82,
            tickets: 5,
            satisfaction: 4.2,
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'medium',
            trend: 'stable',
            segment: 'SMB'
          },
          {
            customerId: '3',
            customerName: 'Individual Client C',
            healthScore: 45,
            usage: 35,
            tickets: 12,
            satisfaction: 3.1,
            lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'high',
            trend: 'declining',
            segment: 'Individual'
          },
          {
            customerId: '4',
            customerName: 'Enterprise Client D',
            healthScore: 88,
            usage: 90,
            tickets: 3,
            satisfaction: 4.6,
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'low',
            trend: 'improving',
            segment: 'Enterprise'
          },
          {
            customerId: '5',
            customerName: 'SMB Client E',
            healthScore: 65,
            usage: 70,
            tickets: 8,
            satisfaction: 3.8,
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            riskLevel: 'medium',
            trend: 'declining',
            segment: 'SMB'
          }
        ];

        const averageScore = customerHealth.reduce((sum, customer) => sum + customer.healthScore, 0) / customerHealth.length;
        
        const distribution = customerHealth.reduce((acc, customer) => {
          acc[customer.riskLevel] = (acc[customer.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topPerformers = customerHealth
          .filter(c => c.healthScore >= 80)
          .sort((a, b) => b.healthScore - a.healthScore)
          .slice(0, 3);

        const atRisk = customerHealth
          .filter(c => c.riskLevel === 'high')
          .sort((a, b) => a.healthScore - b.healthScore);

        setHealthData({
          customers: customerHealth,
          averageScore,
          distribution,
          topPerformers,
          atRisk
        });
      } catch (error) {
        console.error('Failed to load customer health data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHealthData();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getHealthLevel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Moderate';
    return 'At Risk';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <Heart className="h-5 w-5 text-red-600" />
            <span>Customer Health Score</span>
          </CardTitle>
          <CardDescription>Loading customer health data...</CardDescription>
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

  if (!healthData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span>Customer Health Score</span>
          </CardTitle>
          <CardDescription>Unable to load customer health data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-600" />
          <span>Customer Health Score</span>
        </CardTitle>
        <CardDescription>
          Weighted score: usage, tickets, satisfaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">
              {healthData.averageScore.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">Avg Health Score</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{healthData.customers.length}</p>
            <p className="text-xs text-gray-500">Total Customers</p>
          </div>
        </div>

        {/* Average Health Score */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className={`h-6 w-6 ${getHealthColor(healthData.averageScore)}`} />
            <span className={`text-2xl font-bold ${getHealthColor(healthData.averageScore)}`}>
              {healthData.averageScore.toFixed(0)}
            </span>
            <Badge className={getHealthBadge(healthData.averageScore)}>
              {getHealthLevel(healthData.averageScore)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Average Customer Health Score</p>
          <div className="mt-3">
            <Progress value={healthData.averageScore} className="h-2" />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Risk Distribution</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg-lg">
              <p className="text-sm font-bold text-green-600">
                {healthData.distribution.low || 0}
              </p>
              <p className="text-xs text-gray-500">Low Risk</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg-lg">
              <p className="text-sm font-bold text-yellow-600">
                {healthData.distribution.medium || 0}
              </p>
              <p className="text-xs text-gray-500">Medium Risk</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg-lg">
              <p className="text-sm font-bold text-red-600">
                {healthData.distribution.high || 0}
              </p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Performers</h4>
          <div className="space-y-2">
            {healthData.topPerformers.map((customer, index) => {
              const TrendIcon = getTrendIcon(customer.trend);
              
              return (
                <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-lg-lg-full">
                      <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.customerName}</p>
                      <p className="text-xs text-gray-500">{customer.segment}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${getHealthColor(customer.healthScore)}`}>
                        {customer.healthScore}
                      </p>
                      <Badge className={getHealthBadge(customer.healthScore)}>
                        {getHealthLevel(customer.healthScore)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(customer.trend)}`} />
                      <span className={`text-xs ${getTrendColor(customer.trend)}`}>
                        {customer.trend}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* At Risk Customers */}
        {healthData.atRisk.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>At Risk Customers</span>
            </h4>
            <div className="space-y-2">
              {healthData.atRisk.map((customer) => {
                const TrendIcon = getTrendIcon(customer.trend);
                
                return (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg-lg-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">{customer.customerName}</p>
                        <p className="text-xs text-red-700">Last activity: {formatDate(customer.lastActivity)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-red-600">
                          {customer.healthScore}
                        </p>
                        <Badge className="bg-red-100 text-red-800">
                          At Risk
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <TrendIcon className={`h-3 w-3 ${getTrendColor(customer.trend)}`} />
                        <span className={`text-xs ${getTrendColor(customer.trend)}`}>
                          {customer.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Health Score Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average health score: {healthData.averageScore.toFixed(0)}</li>
            <li>• {healthData.distribution.low || 0} customers at low risk</li>
            <li>• {healthData.distribution.medium || 0} customers at medium risk</li>
            <li>• {healthData.distribution.high || 0} customers at high risk</li>
            <li>• {healthData.topPerformers.length} top performing customers</li>
            {healthData.distribution.high > 0 && (
              <li>• {healthData.distribution.high} customers need immediate attention</li>
            )}
            {healthData.averageScore >= 80 && (
              <li>• Excellent overall customer health</li>
            )}
            {healthData.averageScore < 60 && (
              <li>• Customer health below target - focus on retention</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerHealthScore;
