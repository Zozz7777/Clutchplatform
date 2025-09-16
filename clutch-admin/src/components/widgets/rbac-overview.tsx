"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
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
        const users = await productionApi.getUsers();

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
        console.error('Failed to load RBAC data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRBACData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Shield className="h-5 w-5 text-blue-600" />
            <span>RBAC Overview</span>
          </CardTitle>
          <CardDescription>Loading RBAC data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
            <Shield className="h-5 w-5 text-blue-600" />
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
          <Shield className="h-5 w-5 text-blue-600" />
          <span>RBAC Overview</span>
        </CardTitle>
        <CardDescription>
          Role-based access summary & anomalies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{rbacData.totalUsers}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{rbacData.activeUsers}</p>
            <p className="text-xs text-gray-500">Active Users</p>
          </div>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{rbacData.riskUsers}</p>
            <p className="text-xs text-gray-500">High Risk Users</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Shield className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{rbacData.anomalies}</p>
            <p className="text-xs text-gray-500">Anomalies</p>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Role Distribution</h4>
          <div className="space-y-2">
            {rbacData.roles.map((role) => (
              <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Lock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{role.role}</p>
                    <p className="text-xs text-gray-500">
                      {role.permissions} permissions • Last activity: {formatDate(role.lastActivity)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900">{role.userCount}</p>
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
          <h4 className="text-sm font-medium text-gray-900">Permission Levels</h4>
          <div className="space-y-2">
            {rbacData.roles.map((role) => (
              <div key={role.role} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{role.role}</span>
                  <span className="text-gray-900 font-medium">{role.permissions}</span>
                </div>
                <Progress value={(role.permissions / 25) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>Security Alerts</span>
          </h4>
          <div className="space-y-2">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">High-risk users detected</p>
                  <p className="text-xs text-red-700">{rbacData.riskUsers} users with elevated permissions</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Access anomalies</p>
                  <p className="text-xs text-yellow-700">{rbacData.anomalies} unusual access patterns detected</p>
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
        <div className="p-3 bg-blue-50 rounded-lg">
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
