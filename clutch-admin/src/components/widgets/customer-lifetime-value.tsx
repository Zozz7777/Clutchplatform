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
  Calendar,
  PieChart
} from 'lucide-react';

interface CustomerLifetimeValueProps {
  className?: string;
}

interface CLVData {
  segment: string;
  clv: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  customerLifespan: number;
  retentionRate: number;
  customerCount: number;
  totalRevenue: number;
}

export function CustomerLifetimeValue({ className = '' }: CustomerLifetimeValueProps) {
  const [clvData, setClvData] = React.useState<CLVData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCLVData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate CLV calculations by segment
        const segments = [
          {
            segment: 'Enterprise',
            clv: 45000,
            averageOrderValue: 5000,
            purchaseFrequency: 9,
            customerLifespan: 24,
            retentionRate: 85,
            customerCount: 12,
            totalRevenue: 540000
          },
          {
            segment: 'SMB',
            clv: 8500,
            averageOrderValue: 850,
            purchaseFrequency: 10,
            customerLifespan: 18,
            retentionRate: 70,
            customerCount: 45,
            totalRevenue: 382500
          },
          {
            segment: 'Service Providers',
            clv: 12000,
            averageOrderValue: 1200,
            purchaseFrequency: 10,
            customerLifespan: 20,
            retentionRate: 75,
            customerCount: 28,
            totalRevenue: 336000
          }
        ];

        setClvData(segments);
      } catch (error) {
        console.error('Failed to load CLV data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCLVData();
  }, []);

  const getCLVColor = (clv: number) => {
    if (clv >= 30000) return 'text-green-600';
    if (clv >= 15000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCLVBadge = (clv: number) => {
    if (clv >= 30000) return 'bg-green-100 text-green-800';
    if (clv >= 15000) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCLVLevel = (clv: number) => {
    if (clv >= 30000) return 'High';
    if (clv >= 15000) return 'Medium';
    return 'Low';
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRetentionBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTotalCLV = () => {
    return clvData.reduce((sum, segment) => sum + (segment.clv * segment.customerCount), 0);
  };

  const getAverageCLV = () => {
    const totalCustomers = clvData.reduce((sum, segment) => sum + segment.customerCount, 0);
    return totalCustomers > 0 ? getTotalCLV() / totalCustomers : 0;
  };

  const getTotalRevenue = () => {
    return clvData.reduce((sum, segment) => sum + segment.totalRevenue, 0);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Customer Lifetime Value</span>
          </CardTitle>
          <CardDescription>Loading CLV data...</CardDescription>
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

  const totalCLV = getTotalCLV();
  const averageCLV = getAverageCLV();
  const totalRevenue = getTotalRevenue();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Customer Lifetime Value</span>
        </CardTitle>
        <CardDescription>
          By segment (SMBs, Enterprises, Providers)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${averageCLV.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Avg CLV</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              {clvData.reduce((sum, segment) => sum + segment.customerCount, 0)}
            </p>
            <p className="text-xs text-gray-500">Total Customers</p>
          </div>
        </div>

        {/* CLV by Segment */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">CLV by Segment</h4>
          <div className="space-y-2">
            {clvData.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {segment.segment.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                    <p className="text-xs text-gray-500">{segment.customerCount} customers</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm font-semibold ${getCLVColor(segment.clv)}`}>
                      ${segment.clv.toLocaleString()}
                    </p>
                    <Badge className={getCLVBadge(segment.clv)}>
                      {getCLVLevel(segment.clv)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    ${segment.totalRevenue.toLocaleString()} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLV Components */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">CLV Components</h4>
          <div className="space-y-2">
            {clvData.map((segment) => (
              <div key={segment.segment} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">{segment.segment}</h5>
                  <Badge variant="outline" className="text-xs">
                    ${segment.clv.toLocaleString()} CLV
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">AOV:</span>
                    <span className="text-gray-900">${segment.averageOrderValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="text-gray-900">{segment.purchaseFrequency}/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lifespan:</span>
                    <span className="text-gray-900">{segment.customerLifespan} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retention:</span>
                    <span className="text-gray-900">{segment.retentionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Revenue Distribution</h4>
          <div className="space-y-2">
            {clvData.map((segment) => {
              const percentage = totalRevenue > 0 ? (segment.totalRevenue / totalRevenue) * 100 : 0;
              return (
                <div key={segment.segment} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{segment.segment}</span>
                    <span className="text-gray-900 font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <BarChart3 className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-purple-600">
              ${totalCLV.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total CLV</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-orange-600">
              {clvData.length > 0 ? clvData[0].segment : 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Highest CLV</p>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 CLV Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average CLV: ${averageCLV.toLocaleString()}</li>
            <li>• Total CLV: ${totalCLV.toLocaleString()}</li>
            <li>• Total revenue: ${totalRevenue.toLocaleString()}</li>
            <li>• Highest CLV segment: {clvData.length > 0 ? clvData[0].segment : 'N/A'}</li>
            <li>• {clvData.reduce((sum, segment) => sum + segment.customerCount, 0)} total customers</li>
            {clvData.length > 0 && clvData[0].clv > 30000 && (
              <li>• Enterprise segment driving highest value</li>
            )}
            {clvData.some(s => s.retentionRate < 70) && (
              <li>• Some segments have low retention - focus on retention strategies</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerLifetimeValue;
