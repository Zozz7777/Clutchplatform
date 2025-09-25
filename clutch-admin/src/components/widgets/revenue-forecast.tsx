'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
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
  const { t } = useLanguage();

  // TODO: Replace with real API call
  const [forecastData, setForecastData] = React.useState<ForecastData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Implement real API call
    // fetchForecastData().then(setForecastData).finally(() => setIsLoading(false));
    
    // Mock data for development
    const mockForecastData: ForecastData[] = [
      {
        period: 'Q1 2024',
        actual: 1200000,
        forecast: 1200000,
        target: 1000000,
        probability: 95
      },
      {
        period: 'Q2 2024',
        actual: 1350000,
        forecast: 1350000,
        target: 1200000,
        probability: 92
      },
      {
        period: 'Q3 2024',
        actual: 0,
        forecast: 1500000,
        target: 1400000,
        probability: 88
      },
      {
        period: 'Q4 2024',
        actual: 0,
        forecast: 1650000,
        target: 1600000,
        probability: 85
      }
    ];
    
    setForecastData(mockForecastData);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.revenueForecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuarter = forecastData[2] || { period: 'Q3 2024', actual: 0, forecast: 0, target: 0, probability: 0 }; // Q3 2024
  const previousQuarter = forecastData[1] || { period: 'Q2 2024', actual: 0, forecast: 0, target: 0, probability: 0 }; // Q2 2024
  const forecastGrowth = previousQuarter?.actual > 0 ? 
    ((currentQuarter?.forecast - previousQuarter.actual) / previousQuarter.actual) * 100 : 0;

  const getPerformanceColor = (actual: number, target: number) => {
    if (actual === 0) return 'text-muted-foreground'; // No data yet
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return 'text-success';
    if (percentage >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceIcon = (actual: number, target: number) => {
    if (actual === 0) return null; // No data yet
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return <TrendingUp className="h-4 w-4 text-success" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
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
            <h4 className="font-semibold text-foreground">{currentQuarter.period}</h4>
            <Badge variant="outline" className="text-blue-600">
              {currentQuarter.probability}% {t('probability')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('forecast')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {(currentQuarter.forecast / 1000000).toFixed(1)}M EGP
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('target')}</p>
              <p className="text-2xl font-bold text-purple-600">
                {(currentQuarter.target / 1000000).toFixed(1)}M EGP
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              {forecastGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${
                forecastGrowth > 0 ? 'text-success' : 'text-destructive'
              }`}>
                {Math.abs(forecastGrowth).toFixed(1)}% {t('vsPreviousQuarter')}
              </span>
            </div>
          </div>
        </div>

        {/* Quarterly Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t('quarterlyPerformance')}</h4>
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
                  <p className="text-muted-foreground">{t('actual')}</p>
                  <p className="font-semibold">
                    {quarter.actual > 0 ? 
                      `${(quarter.actual / 1000000).toFixed(1)}M EGP` : 
                      '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('forecast')}</p>
                  <p className="font-semibold">
                    {(quarter.forecast / 1000000).toFixed(1)}M EGP
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('target')}</p>
                  <p className="font-semibold">
                    {(quarter.target / 1000000).toFixed(1)}M EGP
                  </p>
                </div>
              </div>
              
              {quarter.actual > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (quarter.actual / quarter.target) >= 1 ? 'bg-success' :
                      (quarter.actual / quarter.target) >= 0.8 ? 'bg-warning' :
                      'bg-destructive'
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
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <Target className="h-6 w-6 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {forecastData.length > 0 && forecastData.reduce((sum, q) => sum + q.target, 0) > 0 ? 
                ((forecastData.reduce((sum, q) => sum + q.forecast, 0) / 
                  forecastData.reduce((sum, q) => sum + q.target, 0)) * 100).toFixed(0) : 
                '0'
              }%
            </p>
            <p className="text-xs text-success/80">{t('forecastAccuracy')}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-900">
              {forecastData.length >= 4 && forecastData[0].actual > 0 ? 
                ((forecastData[3].forecast - forecastData[0].actual) / forecastData[0].actual * 100).toFixed(0) : 
                '0'
              }%
            </p>
            <p className="text-xs text-blue-700">{t('yearlyGrowth')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
