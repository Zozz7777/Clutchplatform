"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  Fuel, 
  DollarSign, 
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

interface FuelCostMetricsProps {
  className?: string;
}

interface CostMetrics {
  totalCost: number;
  fuelCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  otherCosts: number;
  costPerVehicle: number;
  costPerMile: number;
  fuelEfficiency: number;
  totalMiles: number;
  totalVehicles: number;
}

export function FuelCostMetrics({ className = '' }: FuelCostMetricsProps) {
  const [costMetrics, setCostMetrics] = React.useState<CostMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCostMetrics = async () => {
      try {
        const [vehicles, payments] = await Promise.all([
          productionApi.getFleetVehicles(),
          productionApi.getPayments()
        ]);

        const totalVehicles = vehicles?.length || 0;
        const totalMiles = totalVehicles * 1200; // Simulated monthly miles per vehicle
        const fuelEfficiency = 8.5; // MPG average

        // Simulate cost calculations
        const fuelCost = (totalMiles / fuelEfficiency) * 3.50; // $3.50 per gallon
        const maintenanceCost = totalVehicles * 450; // $450 per vehicle per month
        const insuranceCost = totalVehicles * 200; // $200 per vehicle per month
        const otherCosts = totalVehicles * 150; // $150 per vehicle per month

        const totalCost = fuelCost + maintenanceCost + insuranceCost + otherCosts;
        const costPerVehicle = totalVehicles > 0 ? totalCost / totalVehicles : 0;
        const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;

        setCostMetrics({
          totalCost,
          fuelCost,
          maintenanceCost,
          insuranceCost,
          otherCosts,
          costPerVehicle,
          costPerMile,
          fuelEfficiency,
          totalMiles,
          totalVehicles
        });
      } catch (error) {
        console.error('Failed to load cost metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCostMetrics();
  }, []);

  const getCostColor = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'text-green-600';
    if (cost <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCostBadge = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'bg-green-100 text-green-800';
    if (cost <= threshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCostLevel = (cost: number, threshold: number) => {
    if (cost <= threshold * 0.8) return 'Excellent';
    if (cost <= threshold) return 'Good';
    return 'High';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-green-600" />
            <span>Fuel & Cost Metrics</span>
          </CardTitle>
          <CardDescription>Loading cost metrics...</CardDescription>
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

  if (!costMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-green-600" />
            <span>Fuel & Cost Metrics</span>
          </CardTitle>
          <CardDescription>Unable to load cost metrics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const costBreakdown = [
    { name: 'Fuel', cost: costMetrics.fuelCost, color: 'text-green-600', bgColor: 'bg-green-50' },
    { name: 'Maintenance', cost: costMetrics.maintenanceCost, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { name: 'Insurance', cost: costMetrics.insuranceCost, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Other', cost: costMetrics.otherCosts, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  const targetCostPerVehicle = 1200; // Target monthly cost per vehicle
  const targetCostPerMile = 0.85; // Target cost per mile

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Fuel className="h-5 w-5 text-green-600" />
          <span>Fuel & Cost Metrics</span>
        </CardTitle>
        <CardDescription>
          Operating cost per vehicle, per client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg-lg">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${costMetrics.totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Monthly Cost</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{costMetrics.totalVehicles}</p>
            <p className="text-xs text-gray-500">Total Vehicles</p>
          </div>
        </div>

        {/* Cost Per Vehicle */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getCostColor(costMetrics.costPerVehicle, targetCostPerVehicle)}`} />
            <span className={`text-2xl font-bold ${getCostColor(costMetrics.costPerVehicle, targetCostPerVehicle)}`}>
              ${costMetrics.costPerVehicle.toFixed(0)}
            </span>
            <Badge className={getCostBadge(costMetrics.costPerVehicle, targetCostPerVehicle)}>
              {getCostLevel(costMetrics.costPerVehicle, targetCostPerVehicle)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Cost Per Vehicle (Monthly)</p>
          <div className="mt-3">
            <Progress value={(costMetrics.costPerVehicle / targetCostPerVehicle) * 100} className="h-2" />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Cost Breakdown</h4>
          <div className="space-y-2">
            {costBreakdown.map((item) => {
              const percentage = (item.cost / costMetrics.totalCost) * 100;
              return (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg-lg-full ${item.bgColor}`}>
                      <Fuel className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${item.cost.toLocaleString()}
                    </p>
                    <div className="w-16 mt-1">
                      <Progress value={percentage} className="h-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg-lg-lg">
            <BarChart3 className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-purple-600">
              ${costMetrics.costPerMile.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Cost Per Mile</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg-lg-lg">
            <Fuel className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-yellow-600">
              {costMetrics.fuelEfficiency.toFixed(1)} MPG
            </p>
            <p className="text-xs text-gray-500">Fuel Efficiency</p>
          </div>
        </div>

        {/* Cost Trends */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Cost Trends</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
              <div className="flex items-center space-x-3">
                <Fuel className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fuel Costs</p>
                  <p className="text-xs text-gray-500">Monthly trend</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">+5.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
              <div className="flex items-center space-x-3">
                <Truck className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Costs</p>
                  <p className="text-xs text-gray-500">Monthly trend</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">-2.1%</span>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Cost Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total monthly fleet cost: ${costMetrics.totalCost.toLocaleString()}</li>
            <li>• Cost per vehicle: ${costMetrics.costPerVehicle.toFixed(0)} (target: ${targetCostPerVehicle})</li>
            <li>• Cost per mile: ${costMetrics.costPerMile.toFixed(2)} (target: ${targetCostPerMile})</li>
            <li>• Fuel efficiency: {costMetrics.fuelEfficiency.toFixed(1)} MPG</li>
            <li>• Total miles driven: {costMetrics.totalMiles.toLocaleString()}</li>
            {costMetrics.costPerVehicle > targetCostPerVehicle && (
              <li>• Cost per vehicle above target - consider optimization</li>
            )}
            {costMetrics.fuelCost > costMetrics.totalCost * 0.4 && (
              <li>• High fuel costs - consider route optimization</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FuelCostMetrics;
