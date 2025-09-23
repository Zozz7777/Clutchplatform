"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type OperationalPulse } from '@/lib/business-intelligence';
import { Users, Activity, Truck, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useLanguage } from '@/contexts/language-context';

interface UnifiedOpsPulseProps {
  className?: string;
}

export function UnifiedOpsPulse({ className = '' }: UnifiedOpsPulseProps) {
  const { t } = useLanguage();
  const [pulse, setPulse] = React.useState<OperationalPulse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPulse = async () => {
      try {
        const data = await businessIntelligence.getUnifiedOpsPulse();
        console.log('UnifiedOpsPulse received data:', data);
        console.log('UnifiedOpsPulse data type:', typeof data);
        console.log('UnifiedOpsPulse data keys:', data ? Object.keys(data) : 'null');
        setPulse(data);
      } catch (error) {
        console.error('UnifiedOpsPulse failed to load:', error);
        logger.error('Failed to load ops pulse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPulse();
  }, []);

  if (isLoading) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Zap className="h-5 w-5 text-primary" />
            <span>{t('widgets.unifiedOpsPulse')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t('widgets.loadingOperationalMetrics')}</CardDescription>
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

  if (!pulse) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Zap className="h-5 w-5 text-primary" />
            <span>{t('widgets.unifiedOpsPulse')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">{t('widgets.unableToLoadOperationalMetrics')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-success';
    if (efficiency >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 80) return 'bg-success/10 text-success border-success/20';
    if (efficiency >= 60) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <Zap className="h-5 w-5 text-primary" />
          <span>{t('widgets.unifiedOpsPulse')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t('widgets.realTimeOperationalFunnel')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Flow */}
        <div className="space-y-4">
          {/* New Users */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('widgets.newUsers')} (30d)</p>
                <p className="text-xs text-muted-foreground">{t('widgets.freshSignups')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{pulse.newUsers}</p>
              <Badge variant="secondary" className="text-xs">
                {pulse.userGrowth > 0 ? '+' : ''}{pulse.userGrowth.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-full">
                <Activity className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('widgets.activeSessions')}</p>
                <p className="text-xs text-muted-foreground">{t('widgets.currentlyOnline')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-success">{pulse.activeSessions}</p>
              <Badge variant="secondary" className="text-xs">{t('widgets.live')}</Badge>
            </div>
          </div>

          {/* Active Vehicles */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-info/10 rounded-full">
                <Truck className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('widgets.activeVehicles')}</p>
                <p className="text-xs text-muted-foreground">{t('widgets.fleetUtilization')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-info">{pulse.activeVehicles}</p>
              <Badge className={getEfficiencyBadge(pulse.efficiency)}>
                {pulse.efficiency.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-full">
                <DollarSign className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('widgets.revenue')} Impact</p>
                <p className="text-xs text-muted-foreground">{t('widgets.monthlyRevenue')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-warning">
                {pulse.revenueImpact.toLocaleString()} EGP
              </p>
              <Badge variant="secondary" className="text-xs">
                {pulse.revenueGrowth > 0 ? '+' : ''}{pulse.revenueGrowth.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{pulse.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <div className="mt-2">
              <Progress value={pulse.conversionRate} className="h-2" />
            </div>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${getEfficiencyColor(pulse.efficiency)}`}>
              {pulse.efficiency.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{t('widgets.efficiency')}</p>
            <div className="mt-2">
              <Progress value={pulse.efficiency} className="h-2" />
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm text-muted-foreground">Operations trending positive</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default UnifiedOpsPulse;





