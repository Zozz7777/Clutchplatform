"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';

interface EngagementHeatmapProps {
  className?: string;
}

interface SegmentData {
  segment: string;
  features: Record<string, number>;
}

export function EngagementHeatmap({ className = '' }: EngagementHeatmapProps) {
  const [heatmapData, setHeatmapData] = React.useState<{ segments: SegmentData[] } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSegment, setSelectedSegment] = React.useState<string>('all');

  React.useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        const data = await businessIntelligence.getEngagementHeatmap();
        setHeatmapData(data);
      } catch (error) {
        console.error('Failed to load heatmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeatmapData();
  }, []);

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'bg-green-500';
    if (usage >= 60) return 'bg-yellow-500';
    if (usage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUsageTextColor = (usage: number) => {
    if (usage >= 80) return 'text-green-600';
    if (usage >= 60) return 'text-yellow-600';
    if (usage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUsageLevel = (usage: number) => {
    if (usage >= 80) return 'High';
    if (usage >= 60) return 'Medium';
    if (usage >= 40) return 'Low';
    return 'Very Low';
  };

  const getFilteredSegments = () => {
    if (!heatmapData) return [];
    if (selectedSegment === 'all') return heatmapData.segments;
    return heatmapData.segments.filter(s => s.segment === selectedSegment);
  };

  const getTotalUsage = () => {
    const segments = getFilteredSegments();
    if (segments.length === 0) return 0;
    
    const allFeatures = segments.reduce((acc, segment) => {
      Object.entries(segment.features).forEach(([feature, usage]) => {
        acc[feature] = (acc[feature] || 0) + usage;
      });
      return acc;
    }, {} as Record<string, number>);

    const totalUsage = Object.values(allFeatures).reduce((sum, usage) => sum + usage, 0);
    const featureCount = Object.keys(allFeatures).length;
    
    return featureCount > 0 ? totalUsage / featureCount : 0;
  };

  const getTopFeatures = () => {
    const segments = getFilteredSegments();
    if (segments.length === 0) return [];

    const featureUsage: Record<string, number> = {};
    segments.forEach(segment => {
      Object.entries(segment.features).forEach(([feature, usage]) => {
        featureUsage[feature] = (featureUsage[feature] || 0) + usage;
      });
    });

    return Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([feature, usage]) => ({ feature, usage }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Engagement Heatmap</span>
          </CardTitle>
          <CardDescription>Loading engagement data...</CardDescription>
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

  const filteredSegments = getFilteredSegments();
  const totalUsage = getTotalUsage();
  const topFeatures = getTopFeatures();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Engagement Heatmap</span>
        </CardTitle>
        <CardDescription>
          Shows feature usage by user segment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segment Selector */}
        <div className="flex space-x-2">
          <Button
            variant={selectedSegment === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSegment('all')}
            className="flex-1"
          >
            All Segments
          </Button>
          {heatmapData?.segments.map((segment) => (
            <Button
              key={segment.segment}
              variant={selectedSegment === segment.segment ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegment(segment.segment)}
              className="flex-1"
            >
              {segment.segment}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg-lg-lg">
            <Activity className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">{totalUsage.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Avg Usage</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{filteredSegments.length}</p>
            <p className="text-xs text-gray-500">Segments</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Feature Usage Heatmap</h4>
          <div className="space-y-2">
            {filteredSegments.map((segment) => (
              <div key={segment.segment} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-medium text-gray-700">{segment.segment}</h5>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(segment.features).length} features
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(segment.features).map(([feature, usage]) => (
                    <div key={feature} className="text-center">
                      <div className={`p-3 rounded-lg-lg-lg ${getUsageColor(usage)} text-white mb-1`}>
                        <p className="text-sm font-semibold">{usage}%</p>
                      </div>
                      <p className="text-xs text-gray-600 truncate" title={feature}>
                        {feature}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUsageTextColor(usage)}`}
                      >
                        {getUsageLevel(usage)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Performing Features</h4>
          <div className="space-y-2">
            {topFeatures.map((item, index) => (
              <div key={item.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-lg-lg-full">
                    <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.feature}</p>
                    <p className="text-xs text-gray-500">Feature usage</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getUsageTextColor(item.usage)}`}>
                    {item.usage.toFixed(1)}%
                  </p>
                  <Badge className={getUsageColor(item.usage).replace('bg-', 'bg-').replace('-500', '-100') + ' ' + getUsageTextColor(item.usage)}>
                    {getUsageLevel(item.usage)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Usage Distribution</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg-lg">
              <p className="text-sm font-bold text-green-600">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 80).length, 0
                )}
              </p>
              <p className="text-xs text-gray-500">High (80%+)</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg-lg">
              <p className="text-sm font-bold text-yellow-600">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 60 && usage < 80).length, 0
                )}
              </p>
              <p className="text-xs text-gray-500">Medium (60-79%)</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg-lg">
              <p className="text-sm font-bold text-orange-600">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 40 && usage < 60).length, 0
                )}
              </p>
              <p className="text-xs text-gray-500">Low (40-59%)</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg-lg">
              <p className="text-sm font-bold text-red-600">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage < 40).length, 0
                )}
              </p>
              <p className="text-xs text-gray-500">Very Low (&lt;40%)</p>
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
            Export Data
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Engagement Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Average feature usage: {totalUsage.toFixed(1)}%</li>
            <li>• Top feature: {topFeatures[0]?.feature} ({topFeatures[0]?.usage.toFixed(1)}% usage)</li>
            <li>• {filteredSegments.reduce((count, segment) => 
              count + Object.values(segment.features).filter(usage => usage >= 80).length, 0
            )} features with high engagement (80%+)</li>
            <li>• {filteredSegments.reduce((count, segment) => 
              count + Object.values(segment.features).filter(usage => usage < 40).length, 0
            )} features need attention (&lt;40% usage)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default EngagementHeatmap;
