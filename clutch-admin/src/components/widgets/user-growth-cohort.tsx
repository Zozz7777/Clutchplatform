"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
// Translation system removed - using hardcoded strings
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
  // Translation system removed - using hardcoded strings
  const [cohortData, setCohortData] = React.useState<{ cohorts: CohortData[] } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'6m' | '12m'>('12m');

  React.useEffect(() => {
    const loadCohortData = async () => {
      try {
        const data = await Promise.resolve({ cohorts: [] });
        setCohortData(data);
      } catch (error) {
        // Failed to load cohort data
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
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRetentionBadge = (rate: number) => {
    if (rate >= 80) return 'bg-success/10 text-green-800';
    if (rate >= 60) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
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
            <Users className="h-5 w-5 text-primary" />
            <span>{'User Growth Cohort'}</span>
          </CardTitle>
          <CardDescription>Loading cohort analysis...</CardDescription>
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

  const filteredCohorts = getFilteredCohorts();
  const totalNewUsers = getTotalNewUsers();
  const totalRetained = getTotalRetained();
  const averageRetention = getAverageRetention();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
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
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{totalNewUsers}</p>
            <p className="text-xs text-muted-foreground">{'New Users'}</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{totalRetained}</p>
            <p className="text-xs text-muted-foreground">{'Retained'}</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{averageRetention.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{'Average Retention'}</p>
          </div>
        </div>

        {/* Cohort Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{'Monthly Cohorts'}</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCohorts.map((cohort, index) => (
              <div key={cohort.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">
                      {filteredCohorts.length - index}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatMonth(cohort.month)}</p>
                    <p className="text-xs text-muted-foreground">{'Cohort'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{cohort.newUsers}</p>
                    <p className="text-xs text-muted-foreground">New</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{cohort.retained}</p>
                    <p className="text-xs text-muted-foreground">{'Retained'}</p>
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
          <h4 className="text-sm font-medium text-foreground">{'Retention Trend'}</h4>
          <div className="space-y-2">
            {filteredCohorts.slice(-6).map((cohort) => (
              <div key={cohort.month} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{formatMonth(cohort.month)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cohort.retentionRate >= 80 ? 'bg-success/100' :
                        cohort.retentionRate >= 60 ? 'bg-warning/100' : 'bg-destructive/100'
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
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success">
              {filteredCohorts.filter(c => c.retentionRate >= 80).length}
            </p>
            <p className="text-xs text-muted-foreground">{'High Retention'}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-sm font-bold text-destructive">
              {filteredCohorts.filter(c => c.retentionRate < 60).length}
            </p>
            <p className="text-xs text-muted-foreground">{'Low Retention'}</p>
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
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
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





