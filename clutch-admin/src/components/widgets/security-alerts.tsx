"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye,
  Download,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

interface SecurityAlertsProps {
  className?: string;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'resolved' | 'investigating';
  count: number;
}

export function SecurityAlerts({ className = '' }: SecurityAlertsProps) {
  const [alertData, setAlertData] = React.useState<{
    alerts: SecurityAlert[];
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    resolvedToday: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadSecurityData = async () => {
      try {
        // Get security alerts data from API
        const alerts = await productionApi.getSecurityAlerts();

        const totalAlerts = alerts.length;
        const activeAlerts = alerts.filter(a => a.status === 'active').length;
        const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
        const resolvedToday = alerts.filter(a => a.status === 'resolved').length;

        setAlertData({
          alerts,
          totalAlerts,
          activeAlerts,
          criticalAlerts,
          resolvedToday
        });
      } catch (error) {
        console.error('Failed to load security alerts data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'investigating': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Shield className="h-5 w-5 text-red-600" />
            <span>Security Alerts</span>
          </CardTitle>
          <CardDescription>Loading security alerts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alertData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <span>Security Alerts</span>
          </CardTitle>
          <CardDescription>Unable to load security alerts</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-600" />
          <span>Security Alerts</span>
        </CardTitle>
        <CardDescription>
          Failed logins, suspicious access attempts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{alertData.totalAlerts}</p>
            <p className="text-xs text-gray-500">Total Alerts</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
            <Shield className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{alertData.activeAlerts}</p>
            <p className="text-xs text-gray-500">Active Alerts</p>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="text-center p-3 bg-red-50 rounded-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-lg font-bold text-red-600">{alertData.criticalAlerts}</span>
            <Badge className="bg-red-100 text-red-800">
              Critical
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Critical Security Alerts</p>
        </div>

        {/* Recent Alerts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Recent Security Alerts</h4>
          <div className="space-y-2">
            {alertData.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg-full ${
                    alert.severity === 'critical' ? 'bg-red-100' :
                    alert.severity === 'high' ? 'bg-orange-100' :
                    alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.type}</p>
                    <p className="text-xs text-gray-500">
                      {alert.description} • {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge className={getStatusBadge(alert.status)}>
                      {alert.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{alert.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Alert Types</h4>
          <div className="space-y-2">
            {['Failed Login Attempts', 'Unusual Access Pattern', 'Permission Escalation', 'Data Export Anomaly', 'API Rate Limit Exceeded'].map((type) => (
              <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{type}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.floor(Math.random() * 5) + 1} alerts
                </Badge>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Security Alert Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total alerts: {alertData.totalAlerts}</li>
            <li>• Active alerts: {alertData.activeAlerts}</li>
            <li>• Critical alerts: {alertData.criticalAlerts}</li>
            <li>• Resolved today: {alertData.resolvedToday}</li>
            {alertData.criticalAlerts > 0 && (
              <li>• {alertData.criticalAlerts} critical alerts need immediate attention</li>
            )}
            {alertData.activeAlerts > 0 && (
              <li>• {alertData.activeAlerts} active alerts require investigation</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SecurityAlerts;
