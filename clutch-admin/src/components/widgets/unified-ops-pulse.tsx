"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type OperationalPulse } from '@/lib/business-intelligence';
import { Users, Activity, Truck, DollarSign, TrendingUp, Zap } from 'lucide-react';

interface UnifiedOpsPulseProps {
  className?: string;
}

export function UnifiedOpsPulse({ className = '' }: UnifiedOpsPulseProps) {
  const [pulse, setPulse] = React.useState<OperationalPulse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPulse = async () => {
      try {
        const data = await businessIntelligence.getUnifiedOpsPulse();
        setPulse(data);
      } catch (error) {
        console.error('Failed to load ops pulse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPulse();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Unified Ops Pulse</span>
          </CardTitle>
          <CardDescription>Loading operational metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg-lg-lg-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg-lg-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg-lg-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pulse) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Unified Ops Pulse</span>
          </CardTitle>
          <CardDescription>Unable to load operational metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 80) return 'bg-green-100 text-green-800';
    if (efficiency >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Unified Ops Pulse</span>
        </CardTitle>
        <CardDescription>
          Real-time operational funnel from users to revenue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel Flow */}
        <div className="space-y-4">
          {/* New Users */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg-lg-lg-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg-lg-lg-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New Users (30d)</p>
                <p className="text-xs text-gray-500">Fresh signups</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">{pulse.newUsers}</p>
              <Badge variant="secondary" className="text-xs">+12%</Badge>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg-lg-lg-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg-lg-lg-full">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                <p className="text-xs text-gray-500">Currently online</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">{pulse.activeSessions}</p>
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </div>
          </div>

          {/* Active Vehicles */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg-lg-lg-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg-lg-lg-full">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Active Vehicles</p>
                <p className="text-xs text-gray-500">Fleet utilization</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-purple-600">{pulse.activeVehicles}</p>
              <Badge className={getEfficiencyBadge(pulse.efficiency)}>
                {pulse.efficiency.toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg-lg-lg-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg-lg-lg-full">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Revenue Impact</p>
                <p className="text-xs text-gray-500">Monthly revenue</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-yellow-600">
                ${pulse.revenueImpact.toLocaleString()}
              </p>
              <Badge variant="secondary" className="text-xs">+8%</Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{pulse.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <div className="mt-2">
              <Progress value={pulse.conversionRate} className="h-2" />
            </div>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${getEfficiencyColor(pulse.efficiency)}`}>
              {pulse.efficiency.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Fleet Efficiency</p>
            <div className="mt-2">
              <Progress value={pulse.efficiency} className="h-2" />
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">Operations trending positive</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default UnifiedOpsPulse;
