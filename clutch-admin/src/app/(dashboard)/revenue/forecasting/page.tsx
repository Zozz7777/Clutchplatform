'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface RevenueForecast {
  id: string;
  period: string;
  actualRevenue: number;
  forecastedRevenue: number;
  confidence: number;
  variance: number;
  growthRate: number;
  factors: string[];
}

interface ForecastModel {
  id: string;
  name: string;
  accuracy: number;
  lastUpdated: string;
  status: 'active' | 'training' | 'deprecated';
  parameters: {
    seasonality: boolean;
    trend: boolean;
    externalFactors: string[];
  };
}

export default function RevenueForecastingPage() {
  const [forecasts, setForecasts] = useState<RevenueForecast[]>([]);
  const [models, setModels] = useState<ForecastModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedModel, setSelectedModel] = useState('all');

  useEffect(() => {
    loadForecastData();
  }, [timeRange, selectedModel]);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      
      // Load revenue forecasts
      const forecastsResponse = await fetch(`/api/v1/revenue/forecasting?timeRange=${timeRange}&model=${selectedModel}`);
      if (forecastsResponse.ok) {
        const forecastsData = await forecastsResponse.json();
        setForecasts(forecastsData.data || []);
      }
      
      // Load forecast models
      const modelsResponse = await fetch('/api/v1/revenue/forecasting/models');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-100 text-green-800';
    if (accuracy >= 80) return 'bg-yellow-100 text-yellow-800';
    if (accuracy >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 5) return 'text-green-600';
    if (Math.abs(variance) <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Forecasting</h1>
          <p className="text-gray-600">Predict future revenue using advanced forecasting models</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">Next 3 Months</option>
            <option value="6m">Next 6 Months</option>
            <option value="12m">Next 12 Months</option>
            <option value="24m">Next 24 Months</option>
          </select>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Models</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          <Button onClick={loadForecastData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Forecasted Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(forecasts.reduce((sum, f) => sum + f.forecastedRevenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(forecasts.reduce((sum, f) => sum + f.growthRate, 0) / forecasts.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Revenue forecast chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Forecast Accuracy */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecasts.slice(0, 5).map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{forecast.period}</p>
                        <p className="text-xs text-gray-500">
                          Forecast: {formatCurrency(forecast.forecastedRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(forecast.actualRevenue)}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${getVarianceColor(forecast.variance)}`}>
                            {formatPercentage(forecast.variance)}
                          </span>
                          <Badge className={getAccuracyColor(forecast.confidence)}>
                            {forecast.confidence.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Revenue Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-left py-3 px-4">Actual Revenue</th>
                      <th className="text-left py-3 px-4">Forecasted Revenue</th>
                      <th className="text-left py-3 px-4">Variance</th>
                      <th className="text-left py-3 px-4">Growth Rate</th>
                      <th className="text-left py-3 px-4">Confidence</th>
                      <th className="text-left py-3 px-4">Key Factors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.map((forecast) => (
                      <tr key={forecast.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{forecast.period}</td>
                        <td className="py-3 px-4">{formatCurrency(forecast.actualRevenue)}</td>
                        <td className="py-3 px-4">{formatCurrency(forecast.forecastedRevenue)}</td>
                        <td className="py-3 px-4">
                          <span className={getVarianceColor(forecast.variance)}>
                            {formatPercentage(forecast.variance)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={getGrowthColor(forecast.growthRate)}>
                            {formatPercentage(forecast.growthRate)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getAccuracyColor(forecast.confidence)}>
                            {forecast.confidence.toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {forecast.factors.slice(0, 2).map((factor, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                            {forecast.factors.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{forecast.factors.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecasting Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{model.name}</h3>
                          <Badge className={getAccuracyColor(model.accuracy)}>
                            {model.accuracy.toFixed(1)}% accuracy
                          </Badge>
                          <Badge variant="outline">
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">
                          Last updated: {new Date(model.lastUpdated).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            {model.parameters.seasonality ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Seasonality</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {model.parameters.trend ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>Trend Analysis</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>External Factors: {model.parameters.externalFactors.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          Retrain
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
