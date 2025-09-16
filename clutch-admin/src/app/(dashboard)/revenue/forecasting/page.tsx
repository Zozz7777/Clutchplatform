'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

export default function RevenueForecastingPage() {
  const [forecastData] = useState({
    currentMonth: {
      revenue: 125000,
      growth: 12.5,
      customers: 1250,
      churn: 2.1
    },
    nextMonth: {
      revenue: 142000,
      growth: 13.6,
      customers: 1380,
      churn: 1.8
    },
    quarterly: {
      revenue: 425000,
      growth: 15.2,
      customers: 4200,
      churn: 1.9
    },
    yearly: {
      revenue: 1850000,
      growth: 18.7,
      customers: 18500,
      churn: 1.5
    }
  });

  const [scenarios] = useState([
    {
      name: 'Optimistic',
      description: 'High growth scenario with increased market adoption',
      revenue: 2200000,
      growth: 25.0,
      probability: 30
    },
    {
      name: 'Realistic',
      description: 'Current trend continuation with steady growth',
      revenue: 1850000,
      growth: 18.7,
      probability: 50
    },
    {
      name: 'Pessimistic',
      description: 'Economic downturn affecting customer acquisition',
      revenue: 1500000,
      growth: 12.0,
      probability: 20
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Revenue Forecasting</h1>
          <p className="text-muted-foreground font-sans">
            Predict future revenue and growth patterns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Current Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(forecastData.currentMonth.revenue)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(forecastData.currentMonth.growth)}
                  <span className={`font-sans ${getGrowthColor(forecastData.currentMonth.growth)}`}>
                    +{forecastData.currentMonth.growth}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Next Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(forecastData.nextMonth.revenue)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(forecastData.nextMonth.growth)}
                  <span className={`font-sans ${getGrowthColor(forecastData.nextMonth.growth)}`}>
                    +{forecastData.nextMonth.growth}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Quarterly</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(forecastData.quarterly.revenue)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(forecastData.quarterly.growth)}
                  <span className={`font-sans ${getGrowthColor(forecastData.quarterly.growth)}`}>
                    +{forecastData.quarterly.growth}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Yearly</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(forecastData.yearly.revenue)}
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  {getGrowthIcon(forecastData.yearly.growth)}
                  <span className={`font-sans ${getGrowthColor(forecastData.yearly.growth)}`}>
                    +{forecastData.yearly.growth}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Revenue Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium font-sans">Steady Growth Pattern</p>
                  <p className="text-sm text-muted-foreground font-sans">
                    Revenue is projected to grow consistently over the next 12 months
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans">Customer Growth Rate</span>
                  <span className="font-sans font-medium">+15.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Average Revenue Per User</span>
                  <span className="font-sans font-medium">$125</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Customer Lifetime Value</span>
                  <span className="font-sans font-medium">$2,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans">Churn Rate</span>
                  <span className="font-sans font-medium">1.9%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4">
            {scenarios.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-sans">{scenario.name} Scenario</CardTitle>
                      <CardDescription className="font-sans">
                        {scenario.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {scenario.probability}% probability
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground font-sans">Projected Revenue</p>
                      <p className="text-2xl font-bold font-sans">
                        {formatCurrency(scenario.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-sans">Growth Rate</p>
                      <p className="text-2xl font-bold font-sans">
                        +{scenario.growth}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-sans">Probability</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${scenario.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-sans mt-1">{scenario.probability}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { month: 'Jan 2024', revenue: 95000, growth: 8.2 },
                    { month: 'Feb 2024', revenue: 108000, growth: 13.7 },
                    { month: 'Mar 2024', revenue: 125000, growth: 15.7 },
                    { month: 'Apr 2024', revenue: 142000, growth: 13.6 },
                    { month: 'May 2024', revenue: 158000, growth: 11.3 },
                    { month: 'Jun 2024', revenue: 175000, growth: 10.8 }
                  ].map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-sans">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-sans">{formatCurrency(month.revenue)}</span>
                        <span className={`text-xs font-sans ${getGrowthColor(month.growth)}`}>
                          +{month.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Subscription Revenue', amount: 1250000, percentage: 67.6 },
                    { source: 'One-time Sales', amount: 350000, percentage: 18.9 },
                    { source: 'Professional Services', amount: 200000, percentage: 10.8 },
                    { source: 'Other', amount: 50000, percentage: 2.7 }
                  ].map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sans">{source.source}</span>
                        <span className="text-sm font-sans">{formatCurrency(source.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Forecasting Models</CardTitle>
                <CardDescription className="font-sans">
                  AI-powered models used for revenue predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      name: 'Linear Regression',
                      accuracy: 87.3,
                      description: 'Historical trend analysis with seasonal adjustments',
                      status: 'Active'
                    },
                    {
                      name: 'ARIMA Model',
                      accuracy: 91.2,
                      description: 'Time series analysis with autoregressive components',
                      status: 'Active'
                    },
                    {
                      name: 'Neural Network',
                      accuracy: 89.7,
                      description: 'Deep learning model for complex pattern recognition',
                      status: 'Testing'
                    },
                    {
                      name: 'Ensemble Model',
                      accuracy: 93.1,
                      description: 'Combined predictions from multiple models',
                      status: 'Active'
                    }
                  ].map((model, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium font-sans">{model.name}</h3>
                          <Badge variant={model.status === 'Active' ? 'default' : 'secondary'}>
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-sans mb-2">
                          {model.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-sans">Accuracy</span>
                          <span className="text-sm font-sans font-medium">{model.accuracy}%</span>
                        </div>
                      </CardContent>
                    </Card>
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
