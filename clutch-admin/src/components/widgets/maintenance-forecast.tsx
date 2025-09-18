"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  BarChart3,
  Target
} from 'lucide-react';

interface MaintenanceForecastProps {
  className?: string;
}

interface MaintenanceForecast {
  vehicleId: string;
  vehicleName: string;
  predictedDate: string;
  confidence: number;
  reason: string;
}

export function MaintenanceForecast({ className = '' }: MaintenanceForecastProps) {
  const [forecasts, setForecasts] = React.useState<MaintenanceForecast[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'7d' | '30d' | '90d'>('30d');

  React.useEffect(() => {
    const loadForecasts = async () => {
      try {
        const data = await businessIntelligence.getMaintenanceForecast();
        setForecasts(data);
      } catch (error) {
        console.error('Failed to load maintenance forecasts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadForecasts();
  }, []);

  const getFilteredForecasts = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return forecasts.filter(forecast => 
      new Date(forecast.predictedDate) <= cutoffDate
    ).sort((a, b) => new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime());
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getUrgencyColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'text-red-600';
    if (daysUntil <= 14) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUrgencyBadge = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'bg-red-100 text-red-800';
    if (daysUntil <= 14) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getUrgencyLevel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'Urgent';
    if (daysUntil <= 14) return 'Soon';
    return 'Scheduled';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getHighPriorityForecasts = () => {
    return getFilteredForecasts().filter(forecast => 
      getDaysUntil(forecast.predictedDate) <= 14 && forecast.confidence >= 70
    );
  };

  const getAverageConfidence = () => {
    const filtered = getFilteredForecasts();
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, forecast) => sum + forecast.confidence, 0) / filtered.length;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            <span>Maintenance Forecast</span>
          </CardTitle>
          <CardDescription>Loading maintenance predictions...</CardDescription>
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

  const filteredForecasts = getFilteredForecasts();
  const highPriorityForecasts = getHighPriorityForecasts();
  const averageConfidence = getAverageConfidence();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-orange-600" />
          <span>Maintenance Forecast</span>
        </CardTitle>
        <CardDescription>
          Predictive maintenance using usage & breakdown history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1"
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
            <Wrench className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{filteredForecasts.length}</p>
            <p className="text-xs text-gray-500">Scheduled</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{highPriorityForecasts.length}</p>
            <p className="text-xs text-gray-500">High Priority</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg">
            <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{averageConfidence.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Avg Confidence</p>
          </div>
        </div>

        {/* High Priority Alerts */}
        {highPriorityForecasts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>High Priority Maintenance</span>
            </h4>
            <div className="space-y-2">
              {highPriorityForecasts.slice(0, 3).map((forecast) => (
                <div key={forecast.vehicleId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{forecast.vehicleName}</p>
                      <p className="text-xs text-red-700">{forecast.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {getDaysUntil(forecast.predictedDate)} days
                    </p>
                    <Badge className={getUrgencyBadge(forecast.predictedDate)}>
                      {getUrgencyLevel(forecast.predictedDate)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Schedule */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Maintenance Schedule</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredForecasts.map((forecast) => (
              <div key={forecast.vehicleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{forecast.vehicleName}</p>
                    <p className="text-xs text-gray-500">{forecast.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(forecast.predictedDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getDaysUntil(forecast.predictedDate)} days
                      </p>
                    </div>
                    <div className="text-center">
                      <Badge className={getConfidenceBadge(forecast.confidence)}>
                        {forecast.confidence.toFixed(0)}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {getConfidenceLevel(forecast.confidence)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Confidence Distribution</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-sm font-bold text-green-600">
                {filteredForecasts.filter(f => f.confidence >= 80).length}
              </p>
              <p className="text-xs text-gray-500">High (80%+)</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <p className="text-sm font-bold text-yellow-600">
                {filteredForecasts.filter(f => f.confidence >= 60 && f.confidence < 80).length}
              </p>
              <p className="text-xs text-gray-500">Medium (60-79%)</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-sm font-bold text-red-600">
                {filteredForecasts.filter(f => f.confidence < 60).length}
              </p>
              <p className="text-xs text-gray-500">Low (&lt;60%)</p>
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
            Export Schedule
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Maintenance Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {filteredForecasts.length} maintenance events predicted in next {selectedPeriod}</li>
            <li>• {highPriorityForecasts.length} high-priority maintenance items</li>
            <li>• Average confidence: {averageConfidence.toFixed(1)}%</li>
            <li>• {filteredForecasts.filter(f => f.confidence >= 80).length} high-confidence predictions</li>
            {highPriorityForecasts.length > 0 && (
              <li>• Immediate attention needed for {highPriorityForecasts[0]?.vehicleName}</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default MaintenanceForecast;
