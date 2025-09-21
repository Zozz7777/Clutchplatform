"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
// import { useTranslations } from '@/hooks/use-translations';

import { 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Download,
  Eye,
  Truck,
  Activity,
  Target
} from 'lucide-react';

interface DowntimeImpactProps {
  className?: string;
}

interface DowntimeMetrics {
  totalDowntimeHours: number;
  lostRevenueHours: number;
  revenueImpact: number;
  averageDowntimePerVehicle: number;
  downtimeByReason: Array<{
    reason: string;
    hours: number;
    percentage: number;
    cost: number;
  }>;
  topAffectedVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    downtimeHours: number;
    revenueLoss: number;
  }>;
}

export function DowntimeImpact({ className = '' }: DowntimeImpactProps) {
  const t = (key: string, params?: any) => key;
  const [downtimeMetrics, setDowntimeMetrics] = React.useState<DowntimeMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDowntimeMetrics = async () => {
      try {
        const vehicles = await productionApi.getFleetVehicles();
        const totalVehicles = vehicles?.length || 0;

        // Load real downtime data from API
        try {
          const downtimeData = await productionApi.getDowntimeMetrics() as any[];
          
          if (downtimeData && Array.isArray(downtimeData)) {
            const totalDowntimeHours = downtimeData.reduce((sum, record) => sum + (Number(record.downtimeHours) || 0), 0);
            const totalRevenueLoss = downtimeData.reduce((sum, record) => sum + (Number(record.revenueLoss) || 0), 0);
            const averageDowntimePerVehicle = totalVehicles > 0 ? totalDowntimeHours / totalVehicles : 0;

            // Group downtime by reason from real data
            const downtimeByReasonMap = downtimeData.reduce((acc, record) => {
              const reason = String(record.reason) || t('downtime.other');
              if (!acc[reason]) {
                acc[reason] = { hours: 0, cost: 0 };
              }
              acc[reason].hours += Number(record.downtimeHours) || 0;
              acc[reason].cost += Number(record.revenueLoss) || 0;
              return acc;
            }, {} as Record<string, { hours: number; cost: number }>);

            const downtimeByReason = Object.entries(downtimeByReasonMap).map(([reason, data]) => {
              const typedData = data as { hours: number; cost: number };
              return {
                reason,
                hours: typedData.hours,
                percentage: totalDowntimeHours > 0 ? (typedData.hours / totalDowntimeHours) * 100 : 0,
                cost: typedData.cost
              };
            });

            // Get top affected vehicles from real data
            const topAffectedVehicles = downtimeData
              .sort((a, b) => (Number(b.downtimeHours) || 0) - (Number(a.downtimeHours) || 0))
              .slice(0, 5)
              .map(record => ({
                vehicleId: String(record.vehicleId) || 'unknown',
                vehicleName: String(record.vehicleName) || 'Unknown Vehicle',
                downtimeHours: Number(record.downtimeHours) || 0,
                revenueLoss: Number(record.revenueLoss) || 0
              }));

            setDowntimeMetrics({
              totalDowntimeHours,
              averageDowntimePerVehicle,
              downtimeByReason,
              topAffectedVehicles,
              lostRevenueHours: totalRevenueLoss / 50, // Assuming $50/hour average
              revenueImpact: totalRevenueLoss
            });
          } else {
            // Fallback to empty data if no downtime records exist
            setDowntimeMetrics({
              totalDowntimeHours: 0,
              averageDowntimePerVehicle: 0,
              downtimeByReason: [],
              topAffectedVehicles: [],
              lostRevenueHours: 0,
              revenueImpact: 0
            });
          }
        } catch (error) {
          // If downtime API fails, set empty data
          setDowntimeMetrics({
            totalDowntimeHours: 0,
            averageDowntimePerVehicle: 0,
            downtimeByReason: [],
            topAffectedVehicles: [],
            lostRevenueHours: 0
          });
        }
      } catch (error) {
        // Failed to load downtime metrics - set default values
        setDowntimeMetrics({
          totalDowntimeHours: 0,
          averageDowntimePerVehicle: 0,
          downtimeByReason: [],
          topAffectedVehicles: [],
          lostRevenueHours: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDowntimeMetrics();
  }, []);

  const getImpactColor = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'text-success';
    if (impact <= threshold) return 'text-warning';
    return 'text-destructive';
  };

  const getImpactBadge = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'bg-success/10 text-green-800';
    if (impact <= threshold) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getImpactLevel = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'Low';
    if (impact <= threshold) return 'Medium';
    return 'High';
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Maintenance': return 'text-warning';
      case 'Breakdown': return 'text-destructive';
      case 'Driver Issues': return 'text-warning';
      case 'Weather': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'Maintenance': return 'bg-warning/10 text-orange-800';
      case 'Breakdown': return 'bg-destructive/10 text-red-800';
      case 'Driver Issues': return 'bg-warning/10 text-yellow-800';
      case 'Weather': return 'bg-primary/10 text-blue-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-destructive" />
            <span>{t('downtime.downtimeImpact')}</span>
          </CardTitle>
          <CardDescription>Loading downtime metrics...</CardDescription>
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

  if (!downtimeMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-destructive" />
            <span>{t('downtime.downtimeImpact')}</span>
          </CardTitle>
          <CardDescription>{t('common.unableToLoad')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const targetRevenueImpact = 50000; // Target monthly revenue impact
  const targetDowntimeHours = 200; // Target monthly downtime hours

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-destructive" />
          <span>{t('downtime.downtimeImpact')}</span>
        </CardTitle>
        <CardDescription>
          {t('downtime.lostRevenueHoursDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <Clock className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{downtimeMetrics.totalDowntimeHours}</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{downtimeMetrics.lostRevenueHours}</p>
            <p className="text-xs text-muted-foreground">{t('downtime.lostRevenueHours')}</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">
              ${(downtimeMetrics.revenueImpact || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Revenue Impact</p>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className={`h-6 w-6 ${getImpactColor(downtimeMetrics.revenueImpact, targetRevenueImpact)}`} />
            <span className={`text-2xl font-bold ${getImpactColor(downtimeMetrics.revenueImpact, targetRevenueImpact)}`}>
              ${(downtimeMetrics.revenueImpact || 0).toLocaleString()}
            </span>
            <Badge className={getImpactBadge(downtimeMetrics.revenueImpact, targetRevenueImpact)}>
              {getImpactLevel(downtimeMetrics.revenueImpact, targetRevenueImpact)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Monthly Revenue Impact</p>
          <div className="mt-3">
            <Progress value={(downtimeMetrics.revenueImpact / targetRevenueImpact) * 100} className="h-2" />
          </div>
        </div>

        {/* Downtime by Reason */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Downtime by Reason</h4>
          <div className="space-y-2">
            {downtimeMetrics.downtimeByReason.map((reason) => (
              <div key={reason.reason} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">
                      {(reason.percentage || 0).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{reason.reason}</p>
                    <p className="text-xs text-muted-foreground">{(reason.hours || 0).toFixed(0)} hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ${(reason.cost || 0).toLocaleString()}
                  </p>
                  <Badge className={getReasonBadge(reason.reason)}>
                    {reason.percentage.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affected Vehicles */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('downtime.topAffectedVehicles')}</h4>
          <div className="space-y-2">
            {downtimeMetrics.topAffectedVehicles.map((vehicle, index) => (
              <div key={vehicle.vehicleId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-full">
                    <span className="text-sm font-semibold text-destructive">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{vehicle.vehicleName}</p>
                    <p className="text-xs text-muted-foreground">{(vehicle.downtimeHours || 0).toFixed(0)} hours downtime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    ${(vehicle.revenueLoss || 0).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Revenue Loss
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <Truck className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {(downtimeMetrics.averageDowntimePerVehicle || 0).toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">Avg Per Vehicle</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {(() => {
                const lostHours = downtimeMetrics.lostRevenueHours || 0;
                const totalHours = downtimeMetrics.totalDowntimeHours || 1;
                return ((lostHours / totalHours) * 100).toFixed(1);
              })()}%
            </p>
            <p className="text-xs text-muted-foreground">Revenue Impact Rate</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
{t('downtime.exportReport')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 {t('downtime.downtimeInsights')}</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {t('downtime.totalDowntimeHours')}: {downtimeMetrics.totalDowntimeHours} {t('downtime.hours')}</li>
            <li>• {t('downtime.revenueImpactingDowntime')}: {downtimeMetrics.lostRevenueHours} {t('downtime.hours')}</li>
            <li>• {t('downtime.totalRevenueImpact')}: ${(downtimeMetrics.revenueImpact || 0).toLocaleString()}</li>
            <li>• {t('downtime.averageDowntimePerVehicle')}: {(downtimeMetrics.averageDowntimePerVehicle || 0).toFixed(1)} {t('downtime.hours')}</li>
            <li>• {t('downtime.topDowntimeReason')}: {downtimeMetrics.downtimeByReason[0]?.reason} ({(downtimeMetrics.downtimeByReason[0]?.percentage || 0).toFixed(0)}%)</li>
            {downtimeMetrics.revenueImpact > targetRevenueImpact && (
              <li>• {t('downtime.revenueImpactAboveTarget')}</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default DowntimeImpact;





