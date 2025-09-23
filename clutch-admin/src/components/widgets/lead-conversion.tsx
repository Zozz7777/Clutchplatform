'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';

interface ConversionMetric {
  stage: string;
  count: number;
  conversionRate: number;
  avgDays: number;
}

export default function LeadConversion() {
  const { t } = useLanguage();

  // Mock data - in production, this would come from API
  const conversionMetrics: ConversionMetric[] = [
    { stage: 'new', count: 45, conversionRate: 100, avgDays: 0 },
    { stage: 'contacted', count: 38, conversionRate: 84.4, avgDays: 2.3 },
    { stage: 'qualified', count: 22, conversionRate: 48.9, avgDays: 7.1 },
    { stage: 'converted', count: 12, conversionRate: 26.7, avgDays: 14.5 },
    { stage: 'lost', count: 6, conversionRate: 13.3, avgDays: 21.2 }
  ];

  const totalLeads = conversionMetrics[0].count;
  const convertedLeads = conversionMetrics.find(m => m.stage === 'converted')?.count || 0;
  const overallConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('leadConversion')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Conversion Rate */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-600">{t('overallConversionRate')}</span>
          </div>
          <p className="text-4xl font-bold text-green-600 mb-1">
            {overallConversionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {convertedLeads} {t('outOf')} {totalLeads} {t('leadsConverted')}
          </p>
        </div>

        {/* Conversion Funnel */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('conversionFunnel')}</h4>
          {conversionMetrics.map((metric, index) => {
            const isLast = index === conversionMetrics.length - 1;
            const nextMetric = !isLast ? conversionMetrics[index + 1] : null;
            const stageConversionRate = nextMetric ? 
              (nextMetric.count / metric.count) * 100 : 0;
            
            return (
              <div key={metric.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      metric.stage === 'new' ? 'bg-blue-500' :
                      metric.stage === 'contacted' ? 'bg-yellow-500' :
                      metric.stage === 'qualified' ? 'bg-orange-500' :
                      metric.stage === 'converted' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}>
                      {metric.count}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{t(metric.stage)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{metric.avgDays} {t('avgDays')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{metric.count} {t('leads')}</p>
                    {!isLast && (
                      <p className="text-sm text-gray-600">
                        {stageConversionRate.toFixed(1)}% {t('conversion')}
                      </p>
                    )}
                  </div>
                </div>
                
                {!isLast && (
                  <div className="ml-11">
                    <Progress value={stageConversionRate} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">{t('keyInsights')}</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('highestDropOff')}
                </p>
                <p className="text-xs text-blue-700">
                  {t('highestDropOffDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  {t('avgConversionTime')}
                </p>
                <p className="text-xs text-green-700">
                  {t('avgConversionTimeDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
