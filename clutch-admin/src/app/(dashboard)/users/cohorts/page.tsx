'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  RefreshCw,
  Download
} from 'lucide-react';

interface CohortData {
  cohort: string;
  size: number;
  periods: {
    period: number;
    users: number;
    retention: number;
  }[];
}

export default function UserCohortsPage() {
  const [cohortData, setCohortData] = useState<CohortData[]>([
    {
      cohort: '2024-01',
      size: 1000,
      periods: [
        { period: 0, users: 1000, retention: 100 },
        { period: 1, users: 750, retention: 75 },
        { period: 2, users: 600, retention: 60 },
        { period: 3, users: 500, retention: 50 },
        { period: 4, users: 450, retention: 45 },
        { period: 5, users: 420, retention: 42 },
        { period: 6, users: 400, retention: 40 }
      ]
    },
    {
      cohort: '2024-02',
      size: 1200,
      periods: [
        { period: 0, users: 1200, retention: 100 },
        { period: 1, users: 900, retention: 75 },
        { period: 2, users: 720, retention: 60 },
        { period: 3, users: 600, retention: 50 },
        { period: 4, users: 540, retention: 45 },
        { period: 5, users: 504, retention: 42 }
      ]
    },
    {
      cohort: '2024-03',
      size: 1500,
      periods: [
        { period: 0, users: 1500, retention: 100 },
        { period: 1, users: 1125, retention: 75 },
        { period: 2, users: 900, retention: 60 },
        { period: 3, users: 750, retention: 50 },
        { period: 4, users: 675, retention: 45 }
      ]
    }
  ]);

  const [analytics] = useState({
    averageRetention: {
      day1: 85,
      day7: 65,
      day30: 45
    },
    bestCohort: '2024-03',
    worstCohort: '2024-01',
    totalCohorts: 12
  });

  const getRetentionColor = (retention: number) => {
    if (retention >= 70) return 'bg-success/100';
    if (retention >= 50) return 'bg-warning/100';
    if (retention >= 30) return 'bg-warning/100';
    return 'bg-destructive/100';
  };

  const getRetentionTextColor = (retention: number) => {
    if (retention >= 70) return 'text-success';
    if (retention >= 50) return 'text-warning';
    if (retention >= 30) return 'text-orange-700';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Cohort Analysis</h1>
          <p className="text-muted-foreground font-sans">
            Analyze user retention and behavior patterns over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Day 1 Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.averageRetention.day1}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Average retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Day 7 Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.averageRetention.day7}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Week retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Day 30 Retention</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.averageRetention.day30}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Month retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Cohorts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.totalCohorts}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Analyzed cohorts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="retention">Retention Matrix</TabsTrigger>
          <TabsTrigger value="analysis">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Retention Matrix</CardTitle>
              <CardDescription className="font-sans">
                User retention rates by cohort and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-sans">Cohort</th>
                      <th className="text-center p-2 font-sans">Size</th>
                      {Array.from({ length: 7 }, (_, i) => (
                        <th key={i} className="text-center p-2 font-sans">
                          Month {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="p-2 font-sans font-medium">{cohort.cohort}</td>
                        <td className="p-2 text-center font-sans">{cohort.size.toLocaleString()}</td>
                        {Array.from({ length: 7 }, (_, i) => {
                          const period = cohort.periods.find(p => p.period === i);
                          const retention = period ? period.retention : 0;
                          return (
                            <td key={i} className="p-2 text-center">
                              {period ? (
                                <div className={`inline-flex items-center justify-center w-12 h-8 rounded text-xs font-medium font-sans ${getRetentionColor(retention)} ${getRetentionTextColor(retention)}`}>
                                  {retention}%
                                </div>
                              ) : (
                                <span className="text-gray-400 font-sans">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4">
            {cohortData.map((cohort) => (
              <Card key={cohort.cohort}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-sans">Cohort {cohort.cohort}</CardTitle>
                      <CardDescription className="font-sans">
                        {cohort.size.toLocaleString()} users
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {cohort.periods.length} months tracked
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium font-sans mb-2">Retention Trend</p>
                        <div className="space-y-1">
                          {cohort.periods.slice(0, 6).map((period, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-sans">Month {period.period}:</span>
                              <span className="text-sm font-sans font-medium">{period.retention}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium font-sans mb-2">Key Metrics</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sans">Day 1:</span>
                            <span className="text-sm font-sans font-medium">
                              {cohort.periods[1]?.retention || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sans">Day 7:</span>
                            <span className="text-sm font-sans font-medium">
                              {cohort.periods[2]?.retention || 0}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sans">Day 30:</span>
                            <span className="text-sm font-sans font-medium">
                              {cohort.periods[4]?.retention || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium font-sans mb-2">Performance</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="text-sm font-sans">Above average retention</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-sans">Good long-term retention</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      insight: 'Retention is improving over time',
                      description: 'Newer cohorts show better retention rates',
                      impact: 'Positive',
                      confidence: 'High'
                    },
                    {
                      insight: 'Day 1 retention is consistently high',
                      description: 'Users who return after first day are likely to stay',
                      impact: 'Positive',
                      confidence: 'High'
                    },
                    {
                      insight: 'Month 1-2 shows significant dropoff',
                      description: 'Focus on improving mid-term retention',
                      impact: 'Negative',
                      confidence: 'Medium'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium font-sans">{item.insight}</h3>
                        <Badge variant={item.impact === 'Positive' ? 'default' : 'destructive'}>
                          {item.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans mb-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans">
                        Confidence: {item.confidence}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      recommendation: 'Improve onboarding experience',
                      reason: 'Better Day 1 retention leads to higher long-term retention',
                      priority: 'High',
                      effort: 'Medium'
                    },
                    {
                      recommendation: 'Add engagement features for Month 1-2',
                      reason: 'Address the significant dropoff in mid-term retention',
                      priority: 'High',
                      effort: 'High'
                    },
                    {
                      recommendation: 'Implement re-engagement campaigns',
                      reason: 'Target users who show signs of churning',
                      priority: 'Medium',
                      effort: 'Low'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium font-sans">{item.recommendation}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.priority === 'High' ? 'destructive' : 'default'}>
                            {item.priority} Priority
                          </Badge>
                          <Badge variant={item.effort === 'High' ? 'destructive' : item.effort === 'Medium' ? 'default' : 'secondary'}>
                            {item.effort} Effort
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
