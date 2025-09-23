'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface ForecastData {
  period: string;
  actual: number;
  forecast: number;
  target: number;
  probability: number;
}

export default function RevenueForecast() {
  const t = useTranslations('sales');

  // Mock data - in production, this would come from API
  const forecastData: ForecastData[] = [
    { period: 'Q1 2024', actual: 1200000, forecast: 1250000, target: 1500000, probability: 85 },
    { period: 'Q2 2024', actual: 1350000, forecast: 1400000, target: 1600000, probability: 78 },
    { period: 'Q3 2024', actual: 0, forecast: 1550000, target: 1700000, probability: 72 },
    { period: 'Q4 2024', actual: 0, forecast: 1650000, target: 1800000, probability: 68 }
  ];

  const currentQuarter = forecastData[2]; // Q3 2024
  const previousQuarter = forecastData[1]; // Q2 2024
  const forecastGrowth = previousQuarter.actual > 0 ? 
    ((currentQuarter.forecast - previousQuarter.actual) / previousQuarter.actual) * 100 : 0;

  const getPerformanceColor = (actual: number, target: number) => {
    if (actual === 0) return 'text-gray-500'; // No data yet
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (actual: number, target: number) => {
    if (actual === 0) return null; // No data yet
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('revenueForecast')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Quarter Overview */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{currentQuarter.period}</h4>
            <Badge variant="outline" className="text-blue-600">
              {currentQuarter.probability}% {t('probability')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('forecast')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {(currentQuarter.forecast / 1000000).toFixed(1)}M EGP
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('target')}</p>
              <p className="text-2xl font-bold text-purple-600">
                {(currentQuarter.target / 1000000).toFixed(1)}M EGP
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              {forecastGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                forecastGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(forecastGrowth).toFixed(1)}% {t('vsPreviousQuarter')}
              </span>
            </div>
          </div>
        </div>

        {/* Quarterly Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('quarterlyPerformance')}</h4>
          {forecastData.map((quarter, index) => (
            <div key={quarter.period} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{quarter.period}</span>
                  {quarter.actual > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {quarter.probability}% {t('probability')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(quarter.actual, quarter.target)}
                  <span className={`text-sm font-medium ${
                    getPerformanceColor(quarter.actual, quarter.target)
                  }`}>
                    {quarter.actual > 0 ? 
                      `${((quarter.actual / quarter.target) * 100).toFixed(0)}%` : 
                      t('forecasted')
                    }
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">{t('actual')}</p>
                  <p className="font-semibold">
                    {quarter.actual > 0 ? 
                      `${(quarter.actual / 1000000).toFixed(1)}M EGP` : 
                      '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">{t('forecast')}</p>
                  <p className="font-semibold">
                    {(quarter.forecast / 1000000).toFixed(1)}M EGP
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">{t('target')}</p>
                  <p className="font-semibold">
                    {(quarter.target / 1000000).toFixed(1)}M EGP
                  </p>
                </div>
              </div>
              
              {quarter.actual > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (quarter.actual / quarter.target) >= 1 ? 'bg-green-500' :
                      (quarter.actual / quarter.target) >= 0.8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((quarter.actual / quarter.target) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-900">
              {((forecastData.reduce((sum, q) => sum + q.forecast, 0) / 
                 forecastData.reduce((sum, q) => sum + q.target, 0)) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-green-700">{t('forecastAccuracy')}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-900">
              {((forecastData[3].forecast - forecastData[0].actual) / forecastData[0].actual * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-blue-700">{t('yearlyGrowth')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
