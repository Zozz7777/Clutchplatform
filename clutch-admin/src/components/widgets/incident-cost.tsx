"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

interface IncidentCostProps {
  className?: string;
}

interface IncidentCostData {
  incidentId: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number; // in minutes
  cost: number;
  affectedUsers: number;
  date: string;
  status: 'resolved' | 'investigating' | 'mitigated';
}

export function IncidentCost({ className = '' }: IncidentCostProps) {
  const { t } = useLanguage();
  const [incidentData, setIncidentData] = React.useState<{
    incidents: IncidentCostData[];
    totalCost: number;
    averageCost: number;
    totalDowntime: number;
    severityDistribution: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIncidentData = async () => {
      try {
        // Load real incident data from backend APIs
        const [alertsResponse, logsResponse] = await Promise.all([
          productionApi.getSystemAlerts(),
          productionApi.getSystemLogs()
        ]);

        // Transform backend data to component format
        const alertsData = Array.isArray(alertsResponse?.data) ? alertsResponse.data : [];
        const logsData = Array.isArray(logsResponse?.data) ? logsResponse.data : [];
        
        // Create incidents from alerts and logs
        const transformedIncidents: IncidentCostData[] = alertsData.map((alert: any, index: number) => ({
          incidentId: alert.id || `incident-${index}`,
          title: alert.title || alert.message || t('systemHealth.incidents.systemIncident'),
          severity: alert.severity || 'medium',
          duration: alert.duration || 30, // Default 30 minutes
          cost: alert.cost || (alert.severity === 'critical' ? 5000 : alert.severity === 'high' ? 2000 : 500),
          affectedUsers: alert.affectedUsers || 0,
          date: alert.timestamp || alert.createdAt || new Date().toISOString(),
          status: alert.status || 'resolved'
        }));

        // Add incidents from error logs
        const errorLogs = logsData.filter((log: any) => log.level === 'error' || log.level === 'critical');
        const logIncidents = errorLogs.map((log: any, index: number) => ({
          incidentId: `log-incident-${index}`,
          title: log.message || t('systemHealth.incidents.systemError'),
          severity: log.level === 'critical' ? 'critical' : 'high',
          duration: 15, // Default 15 minutes for log-based incidents
          cost: log.level === 'critical' ? 3000 : 1000,
          affectedUsers: 0,
          date: log.timestamp || new Date().toISOString(),
          status: 'resolved'
        }));

        const allIncidents = [...transformedIncidents, ...logIncidents];
        const totalCost = allIncidents.reduce((sum, incident) => sum + incident.cost, 0);
        const averageCost = allIncidents.length > 0 ? totalCost / allIncidents.length : 0;
        const totalDowntime = allIncidents.reduce((sum, incident) => sum + incident.duration, 0);
        
        const severityDistribution = allIncidents.reduce((acc, incident) => {
          acc[incident.severity] = (acc[incident.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setIncidentData({
          incidents: allIncidents,
          totalCost,
          averageCost,
          totalDowntime,
          severityDistribution
        });
      } catch (error) {
        console.error('Failed to load incident data:', error);
        // Fallback data on error
        setIncidentData({
          incidents: [],
          totalCost: 0,
          averageCost: 0,
          totalDowntime: 0,
          severityDistribution: { critical: 0, high: 0, medium: 0, low: 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadIncidentData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-success';
      case 'investigating': return 'text-warning';
      case 'mitigated': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-success/10 text-success';
      case 'investigating': return 'bg-warning/10 text-warning';
      case 'mitigated': return 'bg-primary/10 text-blue-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-destructive" />
            <span>{t('systemHealth.widgets.incidentCost')}</span>
          </CardTitle>
          <CardDescription>Loading incident cost data...</CardDescription>
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

  if (!incidentData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-destructive" />
            <span>{t('systemHealth.widgets.incidentCost')}</span>
          </CardTitle>
          <CardDescription>Unable to load incident cost data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-destructive" />
          <span>{t('systemHealth.widgets.incidentCost')}</span>
        </CardTitle>
        <CardDescription>
          {t('systemHealth.widgetDescriptions.incidentCost')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">
              ${incidentData.totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.totalCost')}</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">
              {formatDuration(incidentData.totalDowntime)}
            </p>
            <p className="text-xs text-muted-foreground">{t('systemHealth.widgetLabels.totalDowntime')}</p>
          </div>
        </div>

        {/* Average Cost */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-6 w-6 text-destructive" />
            <span className="text-2xl font-bold text-destructive">
              ${incidentData.averageCost.toLocaleString()}
            </span>
            <Badge className="bg-destructive/10 text-destructive">
              {t('common.average')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t('systemHealth.widgetLabels.averageCostPerIncident')}</p>
          <div className="mt-3">
            <Progress value={Math.min((incidentData.averageCost / 20000) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.severityDistribution')}</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-destructive/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-destructive">
                {incidentData.severityDistribution.critical || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('systemHealth.severity.critical')}</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {incidentData.severityDistribution.high || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('systemHealth.severity.high')}</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {incidentData.severityDistribution.medium || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('systemHealth.severity.medium')}</p>
            </div>
            <div className="text-center p-2 bg-success/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-success">
                {incidentData.severityDistribution.low || 0}
              </p>
              <p className="text-xs text-muted-foreground">{t('systemHealth.severity.low')}</p>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.recentIncidents')}</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {incidentData.incidents
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((incident) => (
                <div key={incident.incidentId} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(incident.date)} • {formatDuration(incident.duration)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">
                        ${incident.cost.toLocaleString()}
                      </p>
                      <Badge className={getSeverityBadge(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {incident.affectedUsers} users
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Cost by Severity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('systemHealth.widgetLabels.costBySeverity')}</h4>
          <div className="space-y-2">
            {Object.entries(incidentData.severityDistribution).map(([severity, count]) => {
              const severityIncidents = incidentData.incidents.filter(i => i.severity === severity);
              const severityCost = severityIncidents.reduce((sum, incident) => sum + incident.cost, 0);
              const percentage = (severityCost / incidentData.totalCost) * 100;
              
              return (
                <div key={severity} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{severity}</span>
                    <span className="text-foreground font-medium">
                      ${severityCost.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            {t('systemHealth.widgetLabels.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('systemHealth.widgetLabels.exportReport')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Incident Cost Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total Incident Cost: ${incidentData.totalCost.toLocaleString()}</li>
            <li>• {t('incidentCost.averageCostPerIncident')}: ${incidentData.averageCost.toLocaleString()}</li>
            <li>• {t('incidentCost.totalDowntime')}: {formatDuration(incidentData.totalDowntime)}</li>
            <li>• {incidentData.incidents.length} {t('incidentCost.incidentsAnalyzed')}</li>
            <li>• {incidentData.severityDistribution.critical || 0} {t('incidentCost.criticalIncidents')}</li>
            <li>• {incidentData.severityDistribution.high || 0} {t('incidentCost.highSeverityIncidents')}</li>
            {incidentData.severityDistribution.critical > 0 && (
              <li>• {t('incidentCost.criticalIncidentsHighestCost')}</li>
            )}
            {incidentData.averageCost > 10000 && (
              <li>• {t('incidentCost.highAverageCost')}</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncidentCost;





