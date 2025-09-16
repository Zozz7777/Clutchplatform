"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Download,
  Eye,
  Truck,
  Activity,
  Target
} from 'lucide-react';

interface DowntimeImpactProps {
  className?: string;
}

interface DowntimeMetrics {
  totalDowntimeHours: number;
  lostRevenueHours: number;
  revenueImpact: number;
  averageDowntimePerVehicle: number;
  downtimeByReason: Array<{
    reason: string;
    hours: number;
    percentage: number;
    cost: number;
  }>;
  topAffectedVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    downtimeHours: number;
    revenueLoss: number;
  }>;
}

export function DowntimeImpact({ className = '' }: DowntimeImpactProps) {
  const [downtimeMetrics, setDowntimeMetrics] = React.useState<DowntimeMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDowntimeMetrics = async () => {
      try {
        const vehicles = await productionApi.getFleetVehicles();
        const totalVehicles = vehicles?.length || 0;

        // Simulate downtime calculations
        const totalDowntimeHours = totalVehicles * 24; // 24 hours per vehicle per month
        const lostRevenueHours = totalDowntimeHours * 0.3; // 30% of downtime is revenue-impacting
        const revenuePerHour = 150; // $150 per hour of lost revenue
        const revenueImpact = lostRevenueHours * revenuePerHour;
        const averageDowntimePerVehicle = totalVehicles > 0 ? totalDowntimeHours / totalVehicles : 0;

        // Simulate downtime by reason
        const downtimeByReason = [
          { reason: 'Maintenance', hours: totalDowntimeHours * 0.4, percentage: 40, cost: revenueImpact * 0.4 },
          { reason: 'Breakdown', hours: totalDowntimeHours * 0.25, percentage: 25, cost: revenueImpact * 0.25 },
          { reason: 'Driver Issues', hours: totalDowntimeHours * 0.15, percentage: 15, cost: revenueImpact * 0.15 },
          { reason: 'Weather', hours: totalDowntimeHours * 0.1, percentage: 10, cost: revenueImpact * 0.1 },
          { reason: 'Other', hours: totalDowntimeHours * 0.1, percentage: 10, cost: revenueImpact * 0.1 }
        ];

        // Simulate top affected vehicles
        const topAffectedVehicles = (vehicles || []).slice(0, 5).map((vehicle, index) => ({
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
          downtimeHours: 20 + (index * 5), // Varying downtime
          revenueLoss: (20 + (index * 5)) * revenuePerHour
        }));

        setDowntimeMetrics({
          totalDowntimeHours,
          lostRevenueHours,
          revenueImpact,
          averageDowntimePerVehicle,
          downtimeByReason,
          topAffectedVehicles
        });
      } catch (error) {
        console.error('Failed to load downtime metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDowntimeMetrics();
  }, []);

  const getImpactColor = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'text-green-600';
    if (impact <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactBadge = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'bg-green-100 text-green-800';
    if (impact <= threshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getImpactLevel = (impact: number, threshold: number) => {
    if (impact <= threshold * 0.5) return 'Low';
    if (impact <= threshold) return 'Medium';
    return 'High';
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Maintenance': return 'text-orange-600';
      case 'Breakdown': return 'text-red-600';
      case 'Driver Issues': return 'text-yellow-600';
      case 'Weather': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'Maintenance': return 'bg-orange-100 text-orange-800';
      case 'Breakdown': return 'bg-red-100 text-red-800';
      case 'Driver Issues': return 'bg-yellow-100 text-yellow-800';
      case 'Weather': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-red-600" />
            <span>Downtime Impact</span>
          </CardTitle>
          <CardDescription>Loading downtime metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!downtimeMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-red-600" />
            <span>Downtime Impact</span>
          </CardTitle>
          <CardDescription>Unable to load downtime metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const targetRevenueImpact = 50000; // Target monthly revenue impact
  const targetDowntimeHours = 200; // Target monthly downtime hours

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-red-600" />
          <span>Downtime Impact</span>
        </CardTitle>
        <CardDescription>
          Lost revenue hours due to vehicle unavailability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <Clock className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{downtimeMetrics.totalDowntimeHours}</p>
            <p className="text-xs text-gray-500">Total Hours</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{downtimeMetrics.lostRevenueHours}</p>
            <p className="text-xs text-gray-500">Lost Revenue Hours</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg-lg-lg">
            <DollarSign className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">
              ${downtimeMetrics.revenueImpact.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Revenue Impact</p>
          </div>
        </div>

        {/* Revenue Impact */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className={`h-6 w-6 ${getImpactColor(downtimeMetrics.revenueImpact, targetRevenueImpact)}`} />
            <span className={`text-2xl font-bold ${getImpactColor(downtimeMetrics.revenueImpact, targetRevenueImpact)}`}>
              ${downtimeMetrics.revenueImpact.toLocaleString()}
            </span>
            <Badge className={getImpactBadge(downtimeMetrics.revenueImpact, targetRevenueImpact)}>
              {getImpactLevel(downtimeMetrics.revenueImpact, targetRevenueImpact)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Monthly Revenue Impact</p>
          <div className="mt-3">
            <Progress value={(downtimeMetrics.revenueImpact / targetRevenueImpact) * 100} className="h-2" />
          </div>
        </div>

        {/* Downtime by Reason */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Downtime by Reason</h4>
          <div className="space-y-2">
            {downtimeMetrics.downtimeByReason.map((reason) => (
              <div key={reason.reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg-lg-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {reason.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{reason.reason}</p>
                    <p className="text-xs text-gray-500">{reason.hours.toFixed(0)} hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${reason.cost.toLocaleString()}
                  </p>
                  <Badge className={getReasonBadge(reason.reason)}>
                    {reason.percentage.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affected Vehicles */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Affected Vehicles</h4>
          <div className="space-y-2">
            {downtimeMetrics.topAffectedVehicles.map((vehicle, index) => (
              <div key={vehicle.vehicleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg-lg-full">
                    <span className="text-sm font-semibold text-red-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.vehicleName}</p>
                    <p className="text-xs text-gray-500">{vehicle.downtimeHours.toFixed(0)} hours downtime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${vehicle.revenueLoss.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Revenue Loss
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Truck className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-blue-600">
              {downtimeMetrics.averageDowntimePerVehicle.toFixed(1)}h
            </p>
            <p className="text-xs text-gray-500">Avg Per Vehicle</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg-lg-lg">
            <BarChart3 className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-purple-600">
              {((downtimeMetrics.lostRevenueHours / downtimeMetrics.totalDowntimeHours) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Revenue Impact Rate</p>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Downtime Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total downtime: {downtimeMetrics.totalDowntimeHours} hours</li>
            <li>• Revenue-impacting downtime: {downtimeMetrics.lostRevenueHours} hours</li>
            <li>• Total revenue impact: ${downtimeMetrics.revenueImpact.toLocaleString()}</li>
            <li>• Average downtime per vehicle: {downtimeMetrics.averageDowntimePerVehicle.toFixed(1)} hours</li>
            <li>• Top downtime reason: {downtimeMetrics.downtimeByReason[0]?.reason} ({downtimeMetrics.downtimeByReason[0]?.percentage.toFixed(0)}%)</li>
            {downtimeMetrics.revenueImpact > targetRevenueImpact && (
              <li>• Revenue impact above target - consider preventive measures</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default DowntimeImpact;
