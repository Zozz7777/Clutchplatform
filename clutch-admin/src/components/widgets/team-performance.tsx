'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Target, TrendingUp, Award, Star } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  leads: number;
  deals: number;
  revenue: number;
  quota: number;
  conversionRate: number;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export default function TeamPerformance() {
  const { t } = useLanguage();

  // TODO: Replace with real API call
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Implement real API call
    // fetchTeamPerformance().then(setTeamMembers).finally(() => setIsLoading(false));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.teamPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      role: 'sales_rep',
      leads: 25,
      deals: 8,
      revenue: 450000,
      quota: 400000,
      conversionRate: 32,
      performance: 'excellent'
    },
    {
      id: '2',
      name: 'Fatma Mohamed',
      role: 'sales_manager',
      leads: 18,
      deals: 6,
      revenue: 380000,
      quota: 350000,
      conversionRate: 33.3,
      performance: 'excellent'
    },
    {
      id: '3',
      name: 'Omar Ali',
      role: 'sales_rep',
      leads: 15,
      deals: 4,
      revenue: 220000,
      quota: 300000,
      conversionRate: 26.7,
      performance: 'good'
    },
    {
      id: '4',
      name: 'Nour Ibrahim',
      role: 'sales_rep',
      leads: 12,
      deals: 3,
      revenue: 180000,
      quota: 300000,
      conversionRate: 25,
      performance: 'average'
    }
  ];

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-success bg-success/10';
      case 'good': return 'text-primary bg-primary/10';
      case 'average': return 'text-warning bg-warning/10';
      case 'needs_improvement': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Award className="h-4 w-4" />;
      case 'good': return <Star className="h-4 w-4" />;
      case 'average': return <Target className="h-4 w-4" />;
      case 'needs_improvement': return <TrendingUp className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const totalRevenue = mockTeamMembers.reduce((sum, member) => sum + member.revenue, 0);
  const totalQuota = mockTeamMembers.reduce((sum, member) => sum + member.quota, 0);
  const teamQuotaAchievement = totalQuota > 0 ? (totalRevenue / totalQuota) * 100 : 0;

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('teamPerformance')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">
              {teamQuotaAchievement.toFixed(0)}%
            </p>
            <p className="text-sm text-primary">{t('quotaAchievement')}</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-success/80">EGP {t('totalRevenue')}</p>
          </div>
        </div>

        {/* Individual Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t('individualPerformance')}</h4>
          {mockTeamMembers.map((member) => {
            const quotaAchievement = member.quota > 0 ? (member.revenue / member.quota) * 100 : 0;
            
            return (
              <div key={member.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {t(member.role)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getPerformanceColor(member.performance)}>
                    <div className="flex items-center gap-1">
                      {getPerformanceIcon(member.performance)}
                      <span className="capitalize">{t(member.performance)}</span>
                    </div>
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('leads')}</p>
                    <p className="font-semibold">{member.leads}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('deals')}</p>
                    <p className="font-semibold">{member.deals}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('revenue')}</p>
                    <p className="font-semibold">
                      {(member.revenue / 1000).toFixed(0)}K EGP
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('conversion')}</p>
                    <p className="font-semibold">{member.conversionRate}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('quotaProgress')}</span>
                    <span className="font-medium">
                      {quotaAchievement.toFixed(0)}% ({member.revenue.toLocaleString()} / {member.quota.toLocaleString()} EGP)
                    </span>
                  </div>
                  <Progress 
                    value={quotaAchievement} 
                    className="h-2"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Insights */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-foreground">{t('teamInsights')}</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-success">
                  {t('topPerformer')}
                </p>
                <p className="text-xs text-success/80">
                  {mockTeamMembers.find(m => m.performance === 'excellent')?.name} - {t('exceedingQuota')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-primary">
                  {t('teamAverage')}
                </p>
                <p className="text-xs text-primary">
                  {t('teamAverageDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
              <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-warning">
                  {t('improvementArea')}
                </p>
                <p className="text-xs text-warning/80">
                  {t('improvementAreaDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
