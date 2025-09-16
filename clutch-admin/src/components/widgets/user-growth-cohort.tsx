"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';

interface UserGrowthCohortProps {
  className?: string;
}

interface CohortData {
  month: string;
  newUsers: number;
  retained: number;
  retentionRate: number;
}

export function UserGrowthCohort({ className = '' }: UserGrowthCohortProps) {
  const [cohortData, setCohortData] = React.useState<{ cohorts: CohortData[] } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'6m' | '12m'>('12m');

  React.useEffect(() => {
    const loadCohortData = async () => {
      try {
        const data = await businessIntelligence.getUserGrowthCohort();
        setCohortData(data);
      } catch (error) {
        console.error('Failed to load cohort data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCohortData();
  }, []);

  const getFilteredCohorts = () => {
    if (!cohortData) return [];
    const months = selectedPeriod === '6m' ? 6 : 12;
    return cohortData.cohorts.slice(-months);
  };

  const getTotalNewUsers = () => {
    return getFilteredCohorts().reduce((sum, cohort) => sum + cohort.newUsers, 0);
  };

  const getTotalRetained = () => {
    return getFilteredCohorts().reduce((sum, cohort) => sum + cohort.retained, 0);
  };

  const getAverageRetention = () => {
    const cohorts = getFilteredCohorts();
    if (cohorts.length === 0) return 0;
    return cohorts.reduce((sum, cohort) => sum + cohort.retentionRate, 0) / cohorts.length;
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

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>User Growth Cohort</span>
          </CardTitle>
          <CardDescription>Loading cohort analysis...</CardDescription>
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

  const filteredCohorts = getFilteredCohorts();
  const totalNewUsers = getTotalNewUsers();
  const totalRetained = getTotalRetained();
  const averageRetention = getAverageRetention();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span>User Growth Cohort</span>
        </CardTitle>
        <CardDescription>
          Tracks new signups vs retained users per month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['6m', '12m'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1"
            >
              {period === '6m' ? '6 Months' : '12 Months'}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{totalNewUsers}</p>
            <p className="text-xs text-gray-500">New Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg-lg-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{totalRetained}</p>
            <p className="text-xs text-gray-500">Retained</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg-lg-lg">
            <BarChart3 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">{averageRetention.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Avg Retention</p>
          </div>
        </div>

        {/* Cohort Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Monthly Cohorts</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCohorts.map((cohort, index) => (
              <div key={cohort.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg-lg-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {filteredCohorts.length - index}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatMonth(cohort.month)}</p>
                    <p className="text-xs text-gray-500">Cohort</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{cohort.newUsers}</p>
                    <p className="text-xs text-gray-500">New</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{cohort.retained}</p>
                    <p className="text-xs text-gray-500">Retained</p>
                  </div>
                  <div className="text-center">
                    <Badge className={getRetentionBadge(cohort.retentionRate)}>
                      {cohort.retentionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Trend Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Retention Trend</h4>
          <div className="space-y-2">
            {filteredCohorts.slice(-6).map((cohort) => (
              <div key={cohort.month} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{formatMonth(cohort.month)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-lg-lg-full h-2">
                    <div 
                      className={`h-2 rounded-lg-lg-full ${
                        cohort.retentionRate >= 80 ? 'bg-green-500' :
                        cohort.retentionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cohort.retentionRate}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${getRetentionColor(cohort.retentionRate)}`}>
                    {cohort.retentionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg-lg">
            <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-600">
              {filteredCohorts.filter(c => c.retentionRate >= 80).length}
            </p>
            <p className="text-xs text-gray-500">High Retention</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <TrendingDown className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-red-600">
              {filteredCohorts.filter(c => c.retentionRate < 60).length}
            </p>
            <p className="text-xs text-gray-500">Low Retention</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Cohort Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average retention rate: {averageRetention.toFixed(1)}%</li>
            <li>• {filteredCohorts.filter(c => c.retentionRate >= 80).length} cohorts with high retention (80%+)</li>
            <li>• Total new users in period: {totalNewUsers}</li>
            <li>• Total retained users: {totalRetained}</li>
            {averageRetention < 70 && (
              <li>• Retention below target - consider onboarding improvements</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserGrowthCohort;
