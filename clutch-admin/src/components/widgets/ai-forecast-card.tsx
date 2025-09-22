"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessIntelligence, type RevenueForecast } from '@/lib/business-intelligence';
import { logger } from '@/lib/logger';
// import { useTranslations } from '@/hooks/use-translations';
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
  const t = (key: string, params?: any) => key;
  const [forecast, setForecast] = useState<RevenueForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  React.useEffect(() => {
    const loadForecast = async () => {
      try {
        const data = await Promise.resolve([]);
        setForecast(data);
      } catch (error) {
        logger.error('Failed to load forecast:', error);
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
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI-Powered Forecast</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Loading predictive analytics...</CardDescription>
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

  const filteredForecast = getFilteredForecast();
  const avgConfidence = getAverageConfidence();
  const totalRevenue = getTotalProjectedRevenue();
  const optimisticRevenue = getOptimisticRevenue();
  const pessimisticRevenue = getPessimisticRevenue();
  const riskLevel = getRiskLevel();

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <Brain className="h-5 w-5 text-primary" />
          <span>{t('dashboard.aiPoweredForecast')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('dashboard.nextPeriodRevenueProjection', { period: selectedPeriod })}
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
              className="flex-1 hover:bg-muted focus:ring-2 focus:ring-ring"
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
            <p className="text-2xl font-bold text-success">
              {totalRevenue.toLocaleString()} EGP
            </p>
            <p className="text-xs text-muted-foreground">Projected Revenue</p>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Base Case
              </Badge>
            </div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <p className="text-2xl font-bold text-primary">
              {avgConfidence.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <div className="mt-1">
              <Badge className={`text-xs ${
                riskLevel.color === 'green' ? 'bg-success/10 text-success border-success/20' :
                riskLevel.color === 'yellow' ? 'bg-warning/10 text-warning border-warning/20' :
                'bg-destructive/10 text-destructive border-destructive/20'
              }`}>
                {riskLevel.level} Risk
              </Badge>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Scenario Analysis</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
              <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-sm font-semibold text-success">
                {optimisticRevenue.toLocaleString()} EGP
              </p>
              <p className="text-xs text-muted-foreground">Optimistic</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-[0.625rem] border border-border">
              <Target className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-sm font-semibold text-card-foreground">
                {totalRevenue.toLocaleString()} EGP
              </p>
              <p className="text-xs text-muted-foreground">Base Case</p>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
              <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
              <p className="text-sm font-semibold text-destructive">
                {pessimisticRevenue.toLocaleString()} EGP
              </p>
              <p className="text-xs text-muted-foreground">Pessimistic</p>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Daily Forecast Trend</span>
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredForecast.slice(0, 10).map((day, index) => (
              <div key={day.period} className="flex items-center justify-between p-2 bg-muted/50 rounded-[0.625rem] border border-border">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{formatDate(day.period)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">
                      {day.base.toLocaleString()} EGP
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {day.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                  <div className="w-16">
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
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
          <h4 className="text-sm font-medium text-card-foreground">Key Factors</h4>
          <div className="space-y-2">
            {filteredForecast[0]?.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="p-3 bg-muted/50 rounded-[0.625rem] border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <riskLevel.icon className={`h-4 w-4 ${
              riskLevel.color === 'green' ? 'text-success' :
              riskLevel.color === 'yellow' ? 'text-warning' :
              'text-destructive'
            }`} />
            <h5 className="text-sm font-medium text-card-foreground">Risk Assessment</h5>
          </div>
          <p className="text-xs text-muted-foreground">
            {riskLevel.level === 'Low' && 'Forecast shows high confidence with stable growth patterns.'}
            {riskLevel.level === 'Medium' && 'Moderate confidence with some variability in projections.'}
            {riskLevel.level === 'High' && 'High uncertainty - consider additional data sources.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 hover:bg-muted focus:ring-2 focus:ring-ring">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1 hover:bg-muted focus:ring-2 focus:ring-ring">
            <Target className="h-4 w-4 mr-2" />
            Set Targets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIForecastCard;





