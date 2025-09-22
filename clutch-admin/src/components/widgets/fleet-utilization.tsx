"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
// import { useTranslations } from '@/hooks/use-translations';
import { 
  Truck, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';

interface FleetUtilizationProps {
  className?: string;
}

interface UtilizationData {
  total: number;
  active: number;
  idle: number;
  maintenance: number;
  utilizationRate: number;
}

export function FleetUtilization({ className = '' }: FleetUtilizationProps) {
  const [utilizationData, setUtilizationData] = React.useState<UtilizationData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const t = (key: string, params?: any) => key;

  React.useEffect(() => {
    const loadUtilizationData = async () => {
      try {
        const data = await Promise.resolve(null);
        setUtilizationData(data);
      } catch (error) {
        // Failed to load utilization data
      } finally {
        setIsLoading(false);
      }
    };

    loadUtilizationData();
  }, []);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return 'bg-success/10 text-green-800';
    if (rate >= 60) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getUtilizationLevel = (rate: number) => {
    if (rate >= 80) return t('fleetUtilization.excellent');
    if (rate >= 60) return t('fleetUtilization.good');
    if (rate >= 40) return t('fleetUtilization.fair');
    return t('fleetUtilization.poor');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'idle': return 'text-warning';
      case 'maintenance': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-green-800';
      case 'idle': return 'bg-warning/10 text-yellow-800';
      case 'maintenance': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'idle': return Clock;
      case 'maintenance': return AlertTriangle;
      default: return Truck;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Fleet Utilization</span>
          </CardTitle>
          <CardDescription>Loading data...</CardDescription>
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

  if (!utilizationData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-primary" />
            <span>Fleet Utilization</span>
          </CardTitle>
          <CardDescription>Unable to load data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusData = [
    { status: 'active', count: utilizationData.active, label: t('fleetUtilization.active') },
    { status: 'idle', count: utilizationData.idle, label: t('fleetUtilization.idle') },
    { status: 'maintenance', count: utilizationData.maintenance, label: t('fleetUtilization.maintenance') }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-primary" />
          <span>Fleet Utilization</span>
        </CardTitle>
        <CardDescription>
          Monitor vehicle utilization rates and optimize fleet efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Utilization */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className={`h-6 w-6 ${getUtilizationColor(utilizationData.utilizationRate)}`} />
            <span className={`text-2xl font-bold ${getUtilizationColor(utilizationData.utilizationRate)}`}>
              {utilizationData.utilizationRate.toFixed(1)}%
            </span>
            <Badge className={getUtilizationBadge(utilizationData.utilizationRate)}>
              {getUtilizationLevel(utilizationData.utilizationRate)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Overall Utilization Rate</p>
          <div className="mt-3">
            <Progress value={utilizationData.utilizationRate} className="h-2" />
          </div>
        </div>

        {/* Fleet Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{utilizationData.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{utilizationData.idle}</p>
            <p className="text-xs text-muted-foreground">{t('fleetUtilization.idle')}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{utilizationData.maintenance}</p>
            <p className="text-xs text-muted-foreground">{t('fleetUtilization.maintenance')}</p>
          </div>
        </div>

        {/* Fleet Status Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('fleetUtilization.fleetStatusBreakdown')}</h4>
          <div className="space-y-2">
            {statusData.map((status) => {
              const StatusIcon = getStatusIcon(status.status);
              const percentage = utilizationData.total > 0 ? (status.count / utilizationData.total) * 100 : 0;
              
              return (
                <div key={status.status} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(status.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{status.label}</p>
                      <p className="text-xs text-muted-foreground">{status.count} vehicles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{status.count}</p>
                    <Badge className={getStatusBadge(status.status)}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Utilization Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('fleetUtilization.utilizationDistribution')}</h4>
          <div className="space-y-2">
            {statusData.map((status) => {
              const percentage = utilizationData.total > 0 ? (status.count / utilizationData.total) * 100 : 0;
              return (
                <div key={status.status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{status.label}</span>
                    <span className="text-foreground font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {utilizationData.total > 0 ? ((utilizationData.active / utilizationData.total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{t('fleetUtilization.activeRate')}</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {utilizationData.total > 0 ? ((utilizationData.maintenance / utilizationData.total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{t('fleetUtilization.maintenanceRate')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
{t('fleetUtilization.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
{t('fleetUtilization.exportData')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Fleet Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total fleet size: {utilizationData.total} vehicles</li>
            <li>• Utilization rate: {utilizationData.utilizationRate.toFixed(1)}%</li>
            <li>• {utilizationData.active} vehicles currently active</li>
            <li>• {utilizationData.idle} vehicles idle</li>
            <li>• {utilizationData.maintenance} vehicles in maintenance</li>
            {utilizationData.utilizationRate < 60 && (
              <li>• Low utilization - consider optimizing fleet deployment</li>
            )}
            {utilizationData.maintenance > utilizationData.total * 0.1 && (
              <li>• High maintenance rate - review maintenance schedules</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FleetUtilization;





