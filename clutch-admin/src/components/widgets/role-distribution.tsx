"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { businessIntelligence } from '@/lib/business-intelligence';
import { useLanguage } from '@/contexts/language-context';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Settings, 
  User,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  PieChart,
  BarChart3
} from 'lucide-react';

interface RoleDistributionProps {
  className?: string;
}

interface RoleData {
  role: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export function RoleDistribution({ className = '' }: RoleDistributionProps) {
  const { t } = useLanguage();
  const [roleData, setRoleData] = React.useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRoleData = async () => {
      try {
        // Try to get role distribution data from business intelligence service
        const roleData = await businessIntelligence.getRoleDistribution();
        if (roleData && roleData.length > 0) {
          setRoleData(roleData);
          return;
        }

        // Fallback to counting users by role
        const users: any[] = await productionApi.getUsers();
        const roleCounts: Record<string, number> = {};
        
        // Count users by role
        (users || []).forEach((user: any) => {
          if (user && user.role) {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
          }
        });

        const totalUsers = users?.length || 0;
        const roleDefinitions = {
          // Level 1: Executive Leadership
          super_admin: { 
            color: 'text-destructive', 
            icon: Shield, 
            description: 'Full system access and control' 
          },
          head_administrator: { 
            color: 'text-destructive', 
            icon: Shield, 
            description: 'System administration and management' 
          },
          executive: { 
            color: 'text-destructive', 
            icon: Shield, 
            description: 'Executive leadership and oversight' 
          },
          platform_admin: { 
            color: 'text-destructive', 
            icon: Shield, 
            description: 'Platform administration and control' 
          },
          admin: { 
            color: 'text-destructive', 
            icon: Shield, 
            description: 'Administrative access and management' 
          },
          
          // Level 2: Department Heads
          hr_manager: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Human resources management' 
          },
          finance_officer: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Financial management and oversight' 
          },
          operations_manager: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Operations and fleet management' 
          },
          marketing_manager: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Marketing and customer acquisition' 
          },
          legal_team: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Legal and compliance management' 
          },
          security_manager: { 
            color: 'text-primary', 
            icon: UserCheck, 
            description: 'Security and risk management' 
          },
          
          // Level 3: Specialized Managers
          business_analyst: { 
            color: 'text-blue-600', 
            icon: User, 
            description: 'Business analysis and insights' 
          },
          project_manager: { 
            color: 'text-blue-600', 
            icon: User, 
            description: 'Project management and coordination' 
          },
          asset_manager: { 
            color: 'text-blue-600', 
            icon: User, 
            description: 'Asset and fleet management' 
          },
          crm_manager: { 
            color: 'text-blue-600', 
            icon: User, 
            description: 'Customer relationship management' 
          },
          system_admin: { 
            color: 'text-blue-600', 
            icon: User, 
            description: 'System administration and maintenance' 
          },
          
          // Level 4: Functional Specialists
          hr: { 
            color: 'text-green-600', 
            icon: User, 
            description: 'Human resources specialist' 
          },
          finance: { 
            color: 'text-green-600', 
            icon: User, 
            description: 'Financial operations specialist' 
          },
          customer_support: { 
            color: 'text-green-600', 
            icon: User, 
            description: 'Customer support specialist' 
          },
          developer: { 
            color: 'text-green-600', 
            icon: User, 
            description: 'Development and technical specialist' 
          },
          
          // Level 5: Operational Staff
          employee: { 
            color: 'text-success', 
            icon: User, 
            description: 'Standard employee access' 
          },
          support_agent: { 
            color: 'text-success', 
            icon: User, 
            description: 'Support and assistance specialist' 
          },
          
          // Level 6: External Users
          enterprise_client: { 
            color: 'text-warning', 
            icon: Users, 
            description: 'Enterprise client access' 
          },
          service_provider: { 
            color: 'text-warning', 
            icon: Settings, 
            description: 'Service provider access' 
          }
        };

        const roles: RoleData[] = Object.entries(roleCounts).map(([role, count]) => ({
          role,
          count,
          percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0,
          color: roleDefinitions[role as keyof typeof roleDefinitions]?.color || 'text-muted-foreground',
          icon: roleDefinitions[role as keyof typeof roleDefinitions]?.icon || User,
          description: roleDefinitions[role as keyof typeof roleDefinitions]?.description || 'User access'
        }));

        setRoleData(roles.sort((a, b) => b.count - a.count));
      } catch (error) {
        // Failed to load role data
      } finally {
        setIsLoading(false);
      }
    };

    loadRoleData();
  }, []);

  const getTotalUsers = () => {
    return roleData.reduce((sum, role) => sum + role.count, 0);
  };

  const getLargestRole = () => {
    return roleData.length > 0 ? roleData[0] : null;
  };

  const getSmallestRole = () => {
    return roleData.length > 0 ? roleData[roleData.length - 1] : null;
  };

  const getRoleTrend = (role: string) => {
    // Simulate trend data
    const trends = {
      admin: { trend: 'stable', change: 0 },
      manager: { trend: 'up', change: 12 },
      staff: { trend: 'up', change: 8 },
      customer: { trend: 'up', change: 15 },
      provider: { trend: 'down', change: -5 }
    };
    return trends[role as keyof typeof trends] || { trend: 'stable', change: 0 };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-primary" />
            <span>{t('widgets.roleDistribution')}</span>
          </CardTitle>
          <CardDescription>{t('widgets.loadingRoleData')}</CardDescription>
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

  // Safety check to prevent errors when data is not loaded
  if (!roleData || roleData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-primary" />
            <span>{t('widgets.roleDistribution')}</span>
          </CardTitle>
          <CardDescription>{t('widgets.loadingRoleData')}</CardDescription>
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

  const totalUsers = getTotalUsers();
  const largestRole = getLargestRole();
  const smallestRole = getSmallestRole();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-primary" />
          <span>{t('widgets.roleDistribution')}</span>
        </CardTitle>
        <CardDescription>
          {t('widgets.pieChartOfRoles')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.totalUsers')}</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <UserCheck className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{roleData.length}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.roles')}</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {largestRole ? (largestRole.percentage || 0).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{t('widgets.largestRole')}</p>
          </div>
        </div>

        {/* Role List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('widgets.roleBreakdown')}</h4>
          <div className="space-y-2">
            {roleData.map((role, index) => {
              const RoleIcon = role.icon;
              const trend = getRoleTrend(role.role);
              const TrendIcon = trend.trend === 'up' ? TrendingUp : trend.trend === 'down' ? TrendingDown : Users;
              
              return (
                <div key={role.role} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <RoleIcon className={`h-4 w-4 ${role.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{role.role}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">{role.count}</p>
                      <Badge variant="outline" className="text-xs">
                        {(role.percentage || 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${
                        trend.trend === 'up' ? 'text-success' : 
                        trend.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      }`} />
                      <span className={`text-xs ${
                        trend.trend === 'up' ? 'text-success' : 
                        trend.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('widgets.distribution')}</h4>
          <div className="space-y-2">
            {roleData.map((role) => (
              <div key={role.role} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{role.role}</span>
                  <span className="text-foreground font-medium">{(role.percentage || 0).toFixed(1)}%</span>
                </div>
                <Progress value={role.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Role Insights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <UserCheck className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-sm font-bold text-success capitalize">
              {largestRole?.role || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">{t('widgets.largestRole')}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <User className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-sm font-bold text-destructive capitalize">
              {smallestRole?.role || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">{t('widgets.smallestRole')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            {t('widgets.viewDetails')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('widgets.exportData')}
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 {t('widgets.roleInsights')}</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {t('widgets.totalUsersInSystem', { count: totalUsers })}</li>
            <li>• {t('widgets.differentRolesInSystem', { count: roleData.length })}</li>
            <li>• {t('widgets.largestRolePercentage', { role: largestRole?.role || 'N/A', percentage: (largestRole?.percentage || 0).toFixed(1) })}</li>
            <li>• {t('widgets.smallestRolePercentage', { role: smallestRole?.role || 'N/A', percentage: (smallestRole?.percentage || 0).toFixed(1) })}</li>
            {roleData.filter(r => ['super_admin', 'head_administrator', 'executive', 'platform_admin', 'admin'].includes(r.role)).length > 0 && (
              <li>• {roleData.filter(r => ['super_admin', 'head_administrator', 'executive', 'platform_admin', 'admin'].includes(r.role)).reduce((sum, r) => sum + r.count, 0)} admin users</li>
            )}
            {roleData.filter(r => ['enterprise_client', 'service_provider'].includes(r.role)).length > 0 && (
              <li>• {roleData.filter(r => ['enterprise_client', 'service_provider'].includes(r.role)).reduce((sum, r) => sum + r.count, 0)} external users</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleDistribution;





