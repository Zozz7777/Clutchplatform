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

  // Mock data - in production, this would come from API
  const teamMembers: TeamMember[] = [
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
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const totalRevenue = teamMembers.reduce((sum, member) => sum + member.revenue, 0);
  const totalQuota = teamMembers.reduce((sum, member) => sum + member.quota, 0);
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
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">
              {teamQuotaAchievement.toFixed(0)}%
            </p>
            <p className="text-sm text-blue-700">{t('quotaAchievement')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-green-700">EGP {t('totalRevenue')}</p>
          </div>
        </div>

        {/* Individual Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t('individualPerformance')}</h4>
          {teamMembers.map((member) => {
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
                      <p className="text-sm text-gray-600 capitalize">
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
                    <p className="text-gray-600">{t('leads')}</p>
                    <p className="font-semibold">{member.leads}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('deals')}</p>
                    <p className="font-semibold">{member.deals}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('revenue')}</p>
                    <p className="font-semibold">
                      {(member.revenue / 1000).toFixed(0)}K EGP
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('conversion')}</p>
                    <p className="font-semibold">{member.conversionRate}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('quotaProgress')}</span>
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
          <h4 className="font-semibold text-gray-900">{t('teamInsights')}</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  {t('topPerformer')}
                </p>
                <p className="text-xs text-green-700">
                  {teamMembers.find(m => m.performance === 'excellent')?.name} - {t('exceedingQuota')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('teamAverage')}
                </p>
                <p className="text-xs text-blue-700">
                  {t('teamAverageDescription')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {t('improvementArea')}
                </p>
                <p className="text-xs text-yellow-700">
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
