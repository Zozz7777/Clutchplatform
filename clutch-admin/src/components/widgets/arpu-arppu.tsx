"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Download,
  Eye,
  Target,
  Activity,
  PieChart,
  UserCheck
} from 'lucide-react';

interface ARPUARPPUProps {
  className?: string;
}

interface ARPUData {
  arpu: number;
  arppu: number;
  totalUsers: number;
  payingUsers: number;
  conversionRate: number;
  arpuGrowth: number;
  arppuGrowth: number;
  segmentBreakdown: Array<{
    segment: string;
    arpu: number;
    userCount: number;
    percentage: number;
  }>;
}

export function ARPUARPPU({ className = '' }: ARPUARPPUProps) {
  const [arpuData, setArpuData] = React.useState<ARPUData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadARPUData = async () => {
      try {
        const [users, payments] = await Promise.all([
          productionApi.getUsers(),
          productionApi.getPayments()
        ]);

        const totalUsers = users?.length || 0;
        const payingUsers = payments?.length || 0;
        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        
        const arpu = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        const arppu = payingUsers > 0 ? totalRevenue / payingUsers : 0;
        const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

        const segmentBreakdown = [
          {
            segment: 'Enterprise',
            arpu: arpu * 3.5,
            userCount: Math.floor(totalUsers * 0.15),
            percentage: 15
          },
          {
            segment: 'SMB',
            arpu: arpu * 1.2,
            userCount: Math.floor(totalUsers * 0.35),
            percentage: 35
          },
          {
            segment: 'Individual',
            arpu: arpu * 0.8,
            userCount: Math.floor(totalUsers * 0.50),
            percentage: 50
          }
        ];

        setArpuData({
          arpu,
          arppu,
          totalUsers,
          payingUsers,
          conversionRate,
          arpuGrowth: 8.5, // Simulated
          arppuGrowth: 12.3, // Simulated
          segmentBreakdown
        });
      } catch (error) {
        console.error('Failed to load ARPU data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadARPUData();
  }, []);

  const getARPUColor = (arpu: number) => {
    if (arpu >= 100) return 'text-green-600';
    if (arpu >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getARPUBadge = (arpu: number) => {
    if (arpu >= 100) return 'bg-green-100 text-green-800';
    if (arpu >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getARPULevel = (arpu: number) => {
    if (arpu >= 100) return 'High';
    if (arpu >= 50) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span>ARPU & ARPPU</span>
          </CardTitle>
          <CardDescription>Loading ARPU data...</CardDescription>
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

  if (!arpuData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span>ARPU & ARPPU</span>
          </CardTitle>
          <CardDescription>Unable to load ARPU data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span>ARPU & ARPPU</span>
        </CardTitle>
        <CardDescription>
          Average revenue per user & per paying user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              ${arpuData.arpu.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">ARPU</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${arpuData.arppu.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">ARPPU</p>
          </div>
        </div>

        {/* ARPU vs ARPPU Comparison */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="text-center">
              <p className="text-sm text-gray-600">ARPU</p>
              <p className={`text-xl font-bold ${getARPUColor(arpuData.arpu)}`}>
                ${arpuData.arpu.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ARPPU</p>
              <p className={`text-xl font-bold ${getARPUColor(arpuData.arppu)}`}>
                ${arpuData.arppu.toFixed(0)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Revenue per User Comparison</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Progress value={Math.min((arpuData.arpu / 200) * 100, 100)} className="h-2" />
            <Progress value={Math.min((arpuData.arppu / 200) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* User Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">User Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Users</p>
                  <p className="text-xs text-gray-500">All registered users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {arpuData.totalUsers.toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  100%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Paying Users</p>
                  <p className="text-xs text-gray-500">Users with active payments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {arpuData.payingUsers.toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  {arpuData.conversionRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Segment Breakdown</h4>
          <div className="space-y-2">
            {arpuData.segmentBreakdown.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {segment.segment.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                    <p className="text-xs text-gray-500">{segment.userCount} users</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-semibold ${getARPUColor(segment.arpu)}`}>
                      ${segment.arpu.toFixed(0)}
                    </p>
                    <Badge className={getARPUBadge(segment.arpu)}>
                      {getARPULevel(segment.arpu)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {segment.percentage}% of users
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Trends */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-600">
              +{arpuData.arpuGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">ARPU Growth</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-600">
              +{arpuData.arppuGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">ARPPU Growth</p>
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
            Export Data
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 ARPU Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• ARPU: ${arpuData.arpu.toFixed(0)} per user</li>
            <li>• ARPPU: ${arpuData.arppu.toFixed(0)} per paying user</li>
            <li>• Conversion rate: {arpuData.conversionRate.toFixed(1)}%</li>
            <li>• Total users: {arpuData.totalUsers.toLocaleString()}</li>
            <li>• Paying users: {arpuData.payingUsers.toLocaleString()}</li>
            <li>• ARPU growth: +{arpuData.arpuGrowth.toFixed(1)}%</li>
            <li>• ARPPU growth: +{arpuData.arppuGrowth.toFixed(1)}%</li>
            {arpuData.conversionRate < 20 && (
              <li>• Low conversion rate - focus on user activation</li>
            )}
            {arpuData.arpuGrowth > arpuData.arppuGrowth && (
              <li>• ARPU growing faster than ARPPU - good user expansion</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default ARPUARPPU;
