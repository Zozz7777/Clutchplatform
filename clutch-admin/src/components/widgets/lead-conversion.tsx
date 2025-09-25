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

  // TODO: Replace with real API call
  const [conversionMetrics, setConversionMetrics] = React.useState<ConversionMetric[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Implement real API call
    // fetchLeadConversionMetrics().then(setConversionMetrics).finally(() => setIsLoading(false));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.leadConversion')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = conversionMetrics[0]?.count || 0;
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
            <TrendingUp className="h-6 w-6 text-success" />
            <span className="text-sm font-medium text-muted-foreground">{t('overallConversionRate')}</span>
          </div>
          <p className="text-4xl font-bold text-success mb-1">
            {overallConversionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            {convertedLeads} {t('outOf')} {totalLeads} {t('leadsConverted')}
          </p>
        </div>

        {/* Conversion Funnel */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t('conversionFunnel')}</h4>
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
                      metric.stage === 'contacted' ? 'bg-warning' :
                      metric.stage === 'qualified' ? 'bg-info' :
                      metric.stage === 'converted' ? 'bg-success' :
                      'bg-destructive'
                    }`}>
                      {metric.count}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{t(metric.stage)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{metric.avgDays} {t('avgDays')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{metric.count} {t('leads')}</p>
                    {!isLast && (
                      <p className="text-sm text-muted-foreground">
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
          <h4 className="font-semibold text-foreground">{t('keyInsights')}</h4>
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
            <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-success">
                  {t('avgConversionTime')}
                </p>
                <p className="text-xs text-success/80">
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
