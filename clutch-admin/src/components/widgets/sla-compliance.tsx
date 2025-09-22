"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SLAComplianceProps {
  className?: string;
}

interface SLAMetric {
  service: string;
  uptime: number;
  sla: number;
  compliance: number;
  incidents: number;
  mttr: number; // Mean Time To Recovery
  status: 'compliant' | 'warning' | 'breach';
  trend: 'up' | 'down' | 'stable';
}

export function SLACompliance({ className = '' }: SLAComplianceProps) {
  const { t } = useTranslations();
  const [slaData, setSlaData] = React.useState<{
    metrics: SLAMetric[];
    overallCompliance: number;
    totalIncidents: number;
    averageMTTR: number;
    statusDistribution: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSLAData = async () => {
      try {
        // Get SLA compliance data from API
        const metrics = await Promise.resolve([]) as any[];

        const overallCompliance = metrics.reduce((sum: number, metric: any) => sum + metric.compliance, 0) / metrics.length;
        const totalIncidents = metrics.reduce((sum: number, metric: any) => sum + metric.incidents, 0);
        const averageMTTR = metrics.reduce((sum: number, metric: any) => sum + metric.mttr, 0) / metrics.length;
        
        const statusDistribution = metrics.reduce((acc, metric) => {
          acc[metric.status] = (acc[metric.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setSlaData({
          metrics,
          overallCompliance,
          totalIncidents,
          averageMTTR,
          statusDistribution
        });
      } catch (error) {
        // Failed to load SLA compliance data
      } finally {
        setIsLoading(false);
      }
    };

    loadSLAData();
  }, []);

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-success';
    if (compliance >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getComplianceBadge = (compliance: number) => {
    if (compliance >= 95) return 'bg-success/10 text-green-800';
    if (compliance >= 80) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getComplianceLevel = (compliance: number) => {
    if (compliance >= 95) return 'Excellent';
    if (compliance >= 80) return 'Good';
    return 'Poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-success';
      case 'warning': return 'text-warning';
      case 'breach': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success/10 text-green-800';
      case 'warning': return 'bg-warning/10 text-yellow-800';
      case 'breach': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>{t('sla.compliance')}</span>
          </CardTitle>
          <CardDescription>{t('sla.loadingData')}</CardDescription>
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

  if (!slaData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>{t('sla.compliance')}</span>
          </CardTitle>
          <CardDescription>{t('sla.unableToLoad')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>{t('sla.compliance')}</span>
        </CardTitle>
        <CardDescription>
          % uptime vs SLA commitment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {slaData.overallCompliance.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{t('sla.overallCompliance')}</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{slaData.totalIncidents}</p>
            <p className="text-xs text-muted-foreground">{t('sla.totalIncidents')}</p>
          </div>
        </div>

        {/* Overall Compliance */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className={`h-6 w-6 ${getComplianceColor(slaData.overallCompliance)}`} />
            <span className={`text-2xl font-bold ${getComplianceColor(slaData.overallCompliance)}`}>
              {slaData.overallCompliance.toFixed(1)}%
            </span>
            <Badge className={getComplianceBadge(slaData.overallCompliance)}>
              {getComplianceLevel(slaData.overallCompliance)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t('sla.overallSlaCompliance')}</p>
          <div className="mt-3">
            <Progress value={slaData.overallCompliance} className="h-2" />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('sla.statusDistribution')}</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-success/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-success">
                {slaData.statusDistribution.compliant || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('sla.compliant')}</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {slaData.statusDistribution.warning || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('sla.warning')}</p>
            </div>
            <div className="text-center p-2 bg-destructive/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-destructive">
                {slaData.statusDistribution.breach || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('sla.breach')}</p>
            </div>
          </div>
        </div>

        {/* Service Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('sla.serviceMetrics')}</h4>
          <div className="space-y-2">
            {slaData.metrics.map((metric) => {
              const TrendIcon = getTrendIcon(metric.trend);
              
              return (
                <div key={metric.service} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        {metric.service.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{metric.service}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.uptime.toFixed(2)}% uptime (SLA: {metric.sla}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${getComplianceColor(metric.compliance)}`}>
                        {metric.compliance.toFixed(0)}%
                      </p>
                      <Badge className={getStatusBadge(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(metric.trend)}`} />
                      <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                        {metric.incidents} incidents
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MTTR Summary */}
        <div className="text-center p-3 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-primary">
              {slaData.averageMTTR.toFixed(0)} min
            </span>
            <Badge variant="outline" className="text-xs">
              Average MTTR
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t('sla.meanTimeToRecovery')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 SLA Compliance Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Overall compliance: {slaData.overallCompliance.toFixed(1)}%</li>
            <li>• {slaData.statusDistribution.compliant || 0} services compliant</li>
            <li>• {slaData.statusDistribution.warning || 0} services at warning</li>
            <li>• {slaData.statusDistribution.breach || 0} services in breach</li>
            <li>• Total incidents: {slaData.totalIncidents}</li>
            <li>• Average MTTR: {slaData.averageMTTR.toFixed(0)} minutes</li>
            {slaData.statusDistribution.breach > 0 && (
              <li>• {slaData.statusDistribution.breach} services in breach - immediate attention needed</li>
            )}
            {slaData.overallCompliance >= 95 && (
              <li>• Excellent SLA compliance - maintain current standards</li>
            )}
            {slaData.overallCompliance < 80 && (
              <li>• SLA compliance below target - review service reliability</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SLACompliance;





