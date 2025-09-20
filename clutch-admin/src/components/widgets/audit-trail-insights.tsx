"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  FileText, 
  Users, 
  Clock, 
  TrendingUp,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AuditTrailInsightsProps {
  className?: string;
}

interface AuditEvent {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  success: boolean;
}

export function AuditTrailInsights({ className = '' }: AuditTrailInsightsProps) {
  const [auditData, setAuditData] = React.useState<{
    events: AuditEvent[];
    totalEvents: number;
    uniqueUsers: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ user: string; count: number }>;
    recentEvents: AuditEvent[];
    securityEvents: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAuditData = async () => {
      try {
        // Simulate audit trail data
        const events: AuditEvent[] = [
          {
            id: '1',
            user: 'admin@clutch.com',
            action: 'User Login',
            resource: 'Authentication',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            severity: 'low',
            ipAddress: '192.168.1.100',
            success: true
          },
          {
            id: '2',
            user: 'manager@enterprise.com',
            action: 'Data Export',
            resource: 'Customer Data',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            severity: 'high',
            ipAddress: '10.0.0.50',
            success: true
          },
          {
            id: '3',
            user: 'fleet@provider.com',
            action: 'Permission Change',
            resource: 'User Management',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            severity: 'critical',
            ipAddress: '172.16.0.25',
            success: false
          },
          {
            id: '4',
            user: 'customer@client.com',
            action: 'API Access',
            resource: 'Fleet API',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            severity: 'medium',
            ipAddress: '203.0.113.10',
            success: true
          },
          {
            id: '5',
            user: 'admin@clutch.com',
            action: 'System Configuration',
            resource: 'Settings',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            severity: 'high',
            ipAddress: '192.168.1.100',
            success: true
          }
        ];

        const totalEvents = events.length;
        const uniqueUsers = new Set(events.map(e => e.user)).size;
        const topActions = [
          { action: 'User Login', count: 45 },
          { action: 'Data Export', count: 23 },
          { action: 'API Access', count: 18 },
          { action: 'Permission Change', count: 12 },
          { action: 'System Configuration', count: 8 }
        ];
        const topUsers = [
          { user: 'admin@clutch.com', count: 25 },
          { user: 'manager@enterprise.com', count: 18 },
          { user: 'fleet@provider.com', count: 15 },
          { user: 'customer@client.com', count: 12 }
        ];
        const recentEvents = events.slice(0, 3);
        const securityEvents = events.filter(e => e.severity === 'high' || e.severity === 'critical').length;

        setAuditData({
          events,
          totalEvents,
          uniqueUsers,
          topActions,
          topUsers,
          recentEvents,
          securityEvents
        });
      } catch (error) {
        // Failed to load audit trail data
      } finally {
        setIsLoading(false);
      }
    };

    loadAuditData();
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Audit Trail Insights</span>
          </CardTitle>
          <CardDescription>Loading audit trail data...</CardDescription>
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

  if (!auditData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Audit Trail Insights</span>
          </CardTitle>
          <CardDescription>Unable to load audit trail data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Audit Trail Insights</span>
        </CardTitle>
        <CardDescription>
          Most frequent changes & by whom
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{auditData.totalEvents}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{auditData.uniqueUsers}</p>
            <p className="text-xs text-muted-foreground">Unique Users</p>
          </div>
        </div>

        {/* Security Events */}
        <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-lg font-bold text-destructive">{auditData.securityEvents}</span>
            <Badge className="bg-destructive/10 text-red-800">
              Security Events
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">High/Critical Severity Events</p>
        </div>

        {/* Top Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Most Frequent Actions</h4>
          <div className="space-y-2">
            {auditData.topActions.map((action, index) => (
              <div key={action.action} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-[0.625rem]-full">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.action}</p>
                    <p className="text-xs text-muted-foreground">System action</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{action.count}</p>
                  <Badge variant="outline" className="text-xs">
                    occurrences
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Most Active Users</h4>
          <div className="space-y-2">
            {auditData.topUsers.map((user, index) => (
              <div key={user.user} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-success/10 rounded-[0.625rem]-full">
                    <span className="text-xs font-semibold text-success">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.user}</p>
                    <p className="text-xs text-muted-foreground">User account</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{user.count}</p>
                  <Badge variant="outline" className="text-xs">
                    actions
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recent Events</h4>
          <div className="space-y-2">
            {auditData.recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-[0.625rem]-full ${
                    event.success ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {event.success ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.user} • {event.resource} • {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getSeverityBadge(event.severity)}>
                    {event.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{event.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Action Distribution</h4>
          <div className="space-y-2">
            {auditData.topActions.map((action) => (
              <div key={action.action} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{action.action}</span>
                  <span className="text-foreground font-medium">{action.count}</span>
                </div>
                <Progress value={(action.count / Math.max(...auditData.topActions.map(a => a.count))) * 100} className="h-2" />
              </div>
            ))}
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Audit Trail Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total events: {auditData.totalEvents}</li>
            <li>• Unique users: {auditData.uniqueUsers}</li>
            <li>• Security events: {auditData.securityEvents}</li>
            <li>• Top action: {auditData.topActions[0]?.action} ({auditData.topActions[0]?.count} times)</li>
            <li>• Most active user: {auditData.topUsers[0]?.user} ({auditData.topUsers[0]?.count} actions)</li>
            <li>• {auditData.recentEvents.length} recent events</li>
            {auditData.securityEvents > 0 && (
              <li>• {auditData.securityEvents} security events need attention</li>
            )}
            {auditData.topActions[0]?.count > 20 && (
              <li>• High activity detected - monitor for anomalies</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default AuditTrailInsights;
