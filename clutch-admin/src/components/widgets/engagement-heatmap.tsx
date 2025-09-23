"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { businessIntelligence } from '@/lib/business-intelligence';
import { useLanguage } from '@/contexts/language-context';
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
  const { t } = useLanguage();
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
        setHeatmapData({ segments: [] });
      } finally {
        setIsLoading(false);
      }
    };

    loadHeatmapData();
  }, []);

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'bg-success';
    if (usage >= 60) return 'bg-warning';
    if (usage >= 40) return 'bg-info';
    return 'bg-destructive';
  };

  const getUsageTextColor = (usage: number) => {
    if (usage >= 80) return 'text-success';
    if (usage >= 60) return 'text-warning';
    if (usage >= 40) return 'text-info';
    return 'text-destructive';
  };

  const getUsageLevel = (usage: number) => {
    if (usage >= 80) return t('widgets.high');
    if (usage >= 60) return t('widgets.medium');
    if (usage >= 40) return t('widgets.low');
    return t('widgets.veryLow');
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
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Engagement Heatmap</span>
          </CardTitle>
          <CardDescription>Loading engagement data...</CardDescription>
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

  const filteredSegments = getFilteredSegments();
  const totalUsage = getTotalUsage();
  const topFeatures = getTopFeatures();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>{t('widgets.engagementHeatmap')}</span>
        </CardTitle>
        <CardDescription>
          {t('widgets.showsFeatureUsage')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segment Selector */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-lg">
          <Button
            variant={selectedSegment === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSegment('all')}
            className="flex-1 min-w-0"
          >
            {t('widgets.allSegments')}
          </Button>
          {heatmapData?.segments.map((segment) => (
            <Button
              key={segment.segment}
              variant={selectedSegment === segment.segment ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegment(segment.segment)}
              className="flex-1 min-w-0"
            >
              {segment.segment}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{totalUsage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{t('widgets.averageUsage')}</p>
          </div>
          <div className="text-center p-3 bg-secondary/10 rounded-[0.625rem] border border-secondary/20">
            <Users className="h-5 w-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-secondary">{filteredSegments.length}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.segments')}</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">{t('dashboard.featureUsageHeatmap')}</h4>
          <div className="space-y-2">
            {filteredSegments.map((segment) => (
              <div key={segment.segment} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-medium text-foreground">{segment.segment}</h5>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(segment.features).length} features
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries(segment.features).map(([feature, usage]) => (
                    <div key={feature} className="text-center">
                      <div className={`p-3 rounded-[0.625rem] ${getUsageColor(usage)} text-white mb-1`}>
                        <p className="text-sm font-semibold">{usage}%</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate" title={feature}>
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
          <h4 className="text-sm font-medium text-card-foreground">{t('dashboard.topPerformingFeatures')}</h4>
          <div className="space-y-2">
            {topFeatures.map((item, index) => (
              <div key={item.feature} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{item.feature}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.featureUsage')}</p>
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
          <h4 className="text-sm font-medium text-card-foreground">{t('dashboard.usageDistribution')}</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-success/10 rounded-[0.625rem] border border-success/20">
              <p className="text-sm font-bold text-success">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 80).length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t('widgets.high')}</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-[0.625rem] border border-warning/20">
              <p className="text-sm font-bold text-warning">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 60 && usage < 80).length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t('widgets.medium')}</p>
            </div>
            <div className="text-center p-2 bg-info/10 rounded-[0.625rem] border border-info/20">
              <p className="text-sm font-bold text-info">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage >= 40 && usage < 60).length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t('widgets.low')}</p>
            </div>
            <div className="text-center p-2 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
              <p className="text-sm font-bold text-destructive">
                {filteredSegments.reduce((count, segment) => 
                  count + Object.values(segment.features).filter(usage => usage < 40).length, 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t('widgets.veryLow')}</p>
            </div>
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
        <div className="p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
          <h5 className="text-sm font-medium text-primary mb-2">💡 {t('widgets.engagementInsights')}</h5>
          <ul className="text-xs text-primary/80 space-y-1">
            <li>• {t('widgets.averageFeatureUsage', { rate: totalUsage.toFixed(1) })}</li>
            <li>• {t('widgets.topFeature', { feature: topFeatures[0]?.feature || 'N/A', rate: topFeatures[0]?.usage.toFixed(1) || '0' })}</li>
            <li>• {t('widgets.featuresWithHighEngagement', { count: filteredSegments.reduce((count, segment) => 
              count + Object.values(segment.features).filter(usage => usage >= 80).length, 0
            ) })}</li>
            <li>• {t('widgets.featuresNeedAttention', { count: filteredSegments.reduce((count, segment) => 
              count + Object.values(segment.features).filter(usage => usage < 40).length, 0
            ) })}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default EngagementHeatmap;





