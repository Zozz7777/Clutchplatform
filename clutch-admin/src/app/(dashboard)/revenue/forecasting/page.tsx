'use client';

import { useState, useEffect } from 'react';
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
import { productionApi } from '@/lib/production-api';

// Import new Phase 2 widgets
import ChurnAdjustedForecast from '@/components/widgets/churn-adjusted-forecast';
import ClientGrowthContribution from '@/components/widgets/client-growth-contribution';
import RiskScenarioMatrix from '@/components/widgets/risk-scenario-matrix';
import ForecastAccuracyTrend from '@/components/widgets/forecast-accuracy-trend';

export default function RevenueForecastingPage() {
  const [forecastData, setForecastData] = useState({
    currentMonth: {
      revenue: 0,
      growth: 0,
      customers: 0,
      churn: 0
    },
    nextMonth: {
      revenue: 0,
      growth: 0,
      customers: 0,
      churn: 0
    },
    quarterly: {
      revenue: 0,
      growth: 0,
      customers: 0,
      churn: 0
    },
    yearly: {
      revenue: 0,
      growth: 0,
      customers: 0,
      churn: 0
    }
  });

  const [scenarios, setScenarios] = useState([
    {
      name: 'Optimistic',
      description: 'High growth scenario with increased market adoption',
      revenue: 0,
      growth: 0,
      probability: 0
    },
    {
      name: 'Realistic',
      description: 'Current trend continuation with steady growth',
      revenue: 0,
      growth: 0,
      probability: 0
    },
    {
      name: 'Pessimistic',
      description: 'Economic downturn affecting customer acquisition',
      revenue: 0,
      growth: 0,
      probability: 0
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-success' : 'text-destructive';
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };
  
  useEffect(() => {
    loadForecastData();
  }, []);
  
  const loadForecastData = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getRevenueForecast();
      if (data) {
        setForecastData(data.forecastData || forecastData);
        setScenarios(data.scenarios || scenarios);
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshData = async () => {
    try {
      setRefreshing(true);
      await productionApi.refreshRevenueData();
      await loadForecastData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const generateReport = async () => {
    try {
      const report = await productionApi.generateRevenueReport();
      if (report) {
        // Handle report generation success
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
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
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button onClick={generateReport}>
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
                  <TrendingUp className="h-12 w-12 mx-auto text-success mb-4" />
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
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary/100 h-2 rounded-full" 
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
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary/100 h-2 rounded-full" 
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

      {/* Phase 2: Revenue Forecasting Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Revenue Forecasting Analytics</h2>
            <p className="text-muted-foreground">
              From static projections → scenarios & risk-adjusted planning
            </p>
          </div>
        </div>

        {/* Top Row - Churn-Adjusted & Client Growth */}
        <div className="grid gap-6 md:grid-cols-2">
          <ChurnAdjustedForecast />
          <ClientGrowthContribution />
        </div>

        {/* Second Row - Risk Scenarios & Accuracy */}
        <div className="grid gap-6 md:grid-cols-2">
          <RiskScenarioMatrix />
          <ForecastAccuracyTrend />
        </div>
      </div>
    </div>
  );
}
