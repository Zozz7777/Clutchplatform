"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
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
        // Simulate incident cost data
        const incidents: IncidentCostData[] = [
          {
            incidentId: '1',
            title: 'API Gateway Outage',
            severity: 'critical',
            duration: 120,
            cost: 15000,
            affectedUsers: 2500,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved'
          },
          {
            incidentId: '2',
            title: 'Database Performance Issue',
            severity: 'high',
            duration: 90,
            cost: 8500,
            affectedUsers: 1200,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved'
          },
          {
            incidentId: '3',
            title: 'Payment Processing Delay',
            severity: 'medium',
            duration: 45,
            cost: 3200,
            affectedUsers: 800,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved'
          },
          {
            incidentId: '4',
            title: 'Fleet Tracking Interruption',
            severity: 'low',
            duration: 30,
            cost: 1200,
            affectedUsers: 300,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved'
          },
          {
            incidentId: '5',
            title: 'User Authentication Issues',
            severity: 'high',
            duration: 60,
            cost: 5500,
            affectedUsers: 1500,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'resolved'
          }
        ];

        const totalCost = incidents.reduce((sum, incident) => sum + incident.cost, 0);
        const averageCost = totalCost / incidents.length;
        const totalDowntime = incidents.reduce((sum, incident) => sum + incident.duration, 0);
        
        const severityDistribution = incidents.reduce((acc, incident) => {
          acc[incident.severity] = (acc[incident.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setIncidentData({
          incidents,
          totalCost,
          averageCost,
          totalDowntime,
          severityDistribution
        });
      } catch (error) {
        // Failed to load incident cost data
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
      case 'critical': return 'bg-destructive/10 text-red-800';
      case 'high': return 'bg-warning/10 text-orange-800';
      case 'medium': return 'bg-warning/10 text-yellow-800';
      case 'low': return 'bg-success/10 text-green-800';
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
      case 'resolved': return 'bg-success/10 text-green-800';
      case 'investigating': return 'bg-warning/10 text-yellow-800';
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
            <span>Incident Cost</span>
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
            <span>Incident Cost</span>
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
          <span>Incident Cost</span>
        </CardTitle>
        <CardDescription>
          Estimated $ impact of downtime
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
            <p className="text-xs text-muted-foreground">Total Cost</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Clock className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">
              {formatDuration(incidentData.totalDowntime)}
            </p>
            <p className="text-xs text-muted-foreground">Total Downtime</p>
          </div>
        </div>

        {/* Average Cost */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="h-6 w-6 text-destructive" />
            <span className="text-2xl font-bold text-destructive">
              ${incidentData.averageCost.toLocaleString()}
            </span>
            <Badge className="bg-destructive/10 text-red-800">
              Average
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Average Cost per Incident</p>
          <div className="mt-3">
            <Progress value={Math.min((incidentData.averageCost / 20000) * 100, 100)} className="h-2" />
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Severity Distribution</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-destructive/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-destructive">
                {incidentData.severityDistribution.critical || 0}
              </p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {incidentData.severityDistribution.high || 0}
              </p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-warning">
                {incidentData.severityDistribution.medium || 0}
              </p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center p-2 bg-success/10 rounded-[0.625rem]">
              <p className="text-sm font-bold text-success">
                {incidentData.severityDistribution.low || 0}
              </p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Incidents</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {incidentData.incidents
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((incident) => (
                <div key={incident.incidentId} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-destructive/10 rounded-[0.625rem]-full">
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
          <h4 className="text-sm font-medium text-foreground">Cost by Severity</h4>
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
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Incident Cost Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total incident cost: ${incidentData.totalCost.toLocaleString()}</li>
            <li>• Average cost per incident: ${incidentData.averageCost.toLocaleString()}</li>
            <li>• Total downtime: {formatDuration(incidentData.totalDowntime)}</li>
            <li>• {incidentData.incidents.length} incidents analyzed</li>
            <li>• {incidentData.severityDistribution.critical || 0} critical incidents</li>
            <li>• {incidentData.severityDistribution.high || 0} high severity incidents</li>
            {incidentData.severityDistribution.critical > 0 && (
              <li>• Critical incidents have highest cost impact</li>
            )}
            {incidentData.averageCost > 10000 && (
              <li>• High average cost - focus on prevention</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncidentCost;
