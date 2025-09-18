"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessIntelligence, type RevenueForecast } from '@/lib/business-intelligence';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  BarChart3,
  LineChart,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AIForecastCardProps {
  className?: string;
}

export function AIForecastCard({ className = '' }: AIForecastCardProps) {
  const [forecast, setForecast] = useState<RevenueForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  React.useEffect(() => {
    const loadForecast = async () => {
      try {
        const data = await businessIntelligence.getAIRevenueForecast();
        setForecast(data);
      } catch (error) {
        console.error('Failed to load forecast:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadForecast();
  }, []);

  const getFilteredForecast = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    return forecast.slice(0, days);
  };

  const getAverageConfidence = () => {
    const filtered = getFilteredForecast();
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, f) => sum + f.confidence, 0) / filtered.length;
  };

  const getTotalProjectedRevenue = () => {
    const filtered = getFilteredForecast();
    return filtered.reduce((sum, f) => sum + f.base, 0);
  };

  const getOptimisticRevenue = () => {
    const filtered = getFilteredForecast();
    return filtered.reduce((sum, f) => sum + f.optimistic, 0);
  };

  const getPessimisticRevenue = () => {
    const filtered = getFilteredForecast();
    return filtered.reduce((sum, f) => sum + f.pessimistic, 0);
  };

  const getRiskLevel = () => {
    const avgConfidence = getAverageConfidence();
    if (avgConfidence >= 80) return { level: 'Low', color: 'green', icon: CheckCircle };
    if (avgConfidence >= 60) return { level: 'Medium', color: 'yellow', icon: AlertCircle };
    return { level: 'High', color: 'red', icon: AlertCircle };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI-Powered Forecast</span>
          </CardTitle>
          <CardDescription>Loading predictive analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredForecast = getFilteredForecast();
  const avgConfidence = getAverageConfidence();
  const totalRevenue = getTotalProjectedRevenue();
  const optimisticRevenue = getOptimisticRevenue();
  const pessimisticRevenue = getPessimisticRevenue();
  const riskLevel = getRiskLevel();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI-Powered Forecast</span>
        </CardTitle>
        <CardDescription>
          Next {selectedPeriod} revenue & fleet utilization projection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1"
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg">
            <p className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Projected Revenue</p>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Base Case
              </Badge>
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg">
            <p className="text-2xl font-bold text-blue-600">
              {avgConfidence.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">Avg Confidence</p>
            <div className="mt-1">
              <Badge className={`text-xs ${
                riskLevel.color === 'green' ? 'bg-green-100 text-green-800' :
                riskLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {riskLevel.level} Risk
              </Badge>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Scenario Analysis</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg-lg">
              <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-green-600">
                ${optimisticRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Optimistic</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg-lg">
              <Target className="h-4 w-4 text-gray-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-600">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Base Case</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <TrendingDown className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-red-600">
                ${pessimisticRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Pessimistic</p>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Daily Forecast Trend</span>
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredForecast.slice(0, 10).map((day, index) => (
              <div key={day.period} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(day.period)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${day.base.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {day.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                  <div className="w-16">
                    <div className="w-full bg-gray-200 rounded-lg-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-lg-full" 
                        style={{ width: `${day.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Key Factors</h4>
          <div className="space-y-2">
            {filteredForecast[0]?.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-lg-full"></div>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="p-3 bg-gray-50 rounded-lg-lg">
          <div className="flex items-center space-x-2 mb-2">
            <riskLevel.icon className={`h-4 w-4 ${
              riskLevel.color === 'green' ? 'text-green-600' :
              riskLevel.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            <h5 className="text-sm font-medium text-gray-900">Risk Assessment</h5>
          </div>
          <p className="text-xs text-gray-600">
            {riskLevel.level === 'Low' && 'Forecast shows high confidence with stable growth patterns.'}
            {riskLevel.level === 'Medium' && 'Moderate confidence with some variability in projections.'}
            {riskLevel.level === 'High' && 'High uncertainty - consider additional data sources.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Set Targets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIForecastCard;
