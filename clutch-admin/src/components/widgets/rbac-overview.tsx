"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Lock
} from 'lucide-react';

interface RBACOverviewProps {
  className?: string;
}

interface RoleData {
  role: string;
  userCount: number;
  permissions: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
  riskLevel: 'low' | 'medium' | 'high';
}

export function RBACOverview({ className = '' }: RBACOverviewProps) {
  const { t } = useLanguage();
  const [rbacData, setRbacData] = React.useState<{
    roles: RoleData[];
    totalUsers: number;
    activeUsers: number;
    riskUsers: number;
    anomalies: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRBACData = async () => {
      try {
        const users = await Promise.resolve([]);

        // Simulate RBAC overview data
        const roles: RoleData[] = [
          {
            role: 'Platform Admin',
            userCount: 3,
            permissions: 25,
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            riskLevel: 'high'
          },
          {
            role: 'Enterprise Manager',
            userCount: 12,
            permissions: 18,
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            riskLevel: 'medium'
          },
          {
            role: 'Fleet Manager',
            userCount: 8,
            permissions: 12,
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            riskLevel: 'low'
          },
          {
            role: 'Service Provider',
            userCount: 25,
            permissions: 8,
            lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            riskLevel: 'low'
          },
          {
            role: 'Customer',
            userCount: 150,
            permissions: 4,
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            riskLevel: 'low'
          },
          {
            role: 'Suspended User',
            userCount: 5,
            permissions: 0,
            lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'suspended',
            riskLevel: 'high'
          }
        ];

        const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
        const activeUsers = roles.filter(r => r.status === 'active').reduce((sum, role) => sum + role.userCount, 0);
        const riskUsers = roles.filter(r => r.riskLevel === 'high').reduce((sum, role) => sum + role.userCount, 0);
        const anomalies = 2; // Simulated anomalies

        setRbacData({
          roles,
          totalUsers,
          activeUsers,
          riskUsers,
          anomalies
        });
      } catch (error) {
        // Failed to load RBAC data
      } finally {
        setIsLoading(false);
      }
    };

    loadRBACData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-warning';
      case 'suspended': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'inactive': return 'bg-warning/10 text-warning';
      case 'suspended': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>RBAC Overview</span>
          </CardTitle>
          <CardDescription>Loading RBAC data...</CardDescription>
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

  if (!rbacData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>RBAC Overview</span>
          </CardTitle>
          <CardDescription>Unable to load RBAC data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>RBAC Overview</span>
        </CardTitle>
        <CardDescription>
          Role-based access summary & anomalies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{rbacData.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{rbacData.activeUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{rbacData.riskUsers}</p>
            <p className="text-xs text-muted-foreground">High Risk Users</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Shield className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{rbacData.anomalies}</p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Role Distribution</h4>
          <div className="space-y-2">
            {rbacData.roles.map((role) => (
              <div key={role.role} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{role.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions} permissions • Last activity: {formatDate(role.lastActivity)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-foreground">{role.userCount}</p>
                    <Badge className={getStatusBadge(role.status)}>
                      {role.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className={getRiskBadge(role.riskLevel)}>
                      {role.riskLevel} risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Levels */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Permission Levels</h4>
          <div className="space-y-2">
            {rbacData.roles.map((role) => (
              <div key={role.role} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{role.role}</span>
                  <span className="text-foreground font-medium">{role.permissions}</span>
                </div>
                <Progress value={(role.permissions / 25) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>Security Alerts</span>
          </h4>
          <div className="space-y-2">
            <div className="p-3 bg-destructive/10 rounded-[0.625rem]-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">High-risk users detected</p>
                  <p className="text-xs text-destructive">{rbacData.riskUsers} users with elevated permissions</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-warning/10 rounded-[0.625rem]-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm font-medium text-warning">Access anomalies</p>
                  <p className="text-xs text-warning">{rbacData.anomalies} unusual access patterns detected</p>
                </div>
              </div>
            </div>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 RBAC Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total users: {rbacData.totalUsers}</li>
            <li>• Active users: {rbacData.activeUsers}</li>
            <li>• High-risk users: {rbacData.riskUsers}</li>
            <li>• Security anomalies: {rbacData.anomalies}</li>
            <li>• {rbacData.roles.length} roles configured</li>
            <li>• {rbacData.roles.filter(r => r.status === 'active').length} active roles</li>
            {rbacData.riskUsers > 0 && (
              <li>• {rbacData.riskUsers} high-risk users need review</li>
            )}
            {rbacData.anomalies > 0 && (
              <li>• {rbacData.anomalies} access anomalies detected</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RBACOverview;





