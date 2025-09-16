"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  Download,
  Eye,
  Target,
  Zap,
  Star,
  Heart
} from 'lucide-react';

interface FeatureUsageProps {
  className?: string;
}

interface FeatureData {
  feature: string;
  usage: number;
  adoption: number;
  satisfaction: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  description: string;
  icon: any;
}

export function FeatureUsage({ className = '' }: FeatureUsageProps) {
  const [featureData, setFeatureData] = React.useState<FeatureData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  React.useEffect(() => {
    const loadFeatureData = async () => {
      try {
        // Simulate feature usage data
        const features: FeatureData[] = [
          {
            feature: 'Dashboard Analytics',
            usage: 95,
            adoption: 88,
            satisfaction: 4.2,
            trend: 'up',
            category: 'Analytics',
            description: 'Real-time dashboard and analytics',
            icon: BarChart3
          },
          {
            feature: 'Fleet Management',
            usage: 87,
            adoption: 82,
            satisfaction: 4.1,
            trend: 'up',
            category: 'Fleet',
            description: 'Vehicle tracking and management',
            icon: Activity
          },
          {
            feature: 'User Management',
            usage: 92,
            adoption: 85,
            satisfaction: 4.3,
            trend: 'stable',
            category: 'Users',
            description: 'User roles and permissions',
            icon: Users
          },
          {
            feature: 'Payment Processing',
            usage: 78,
            adoption: 72,
            satisfaction: 3.9,
            trend: 'up',
            category: 'Finance',
            description: 'Payment and billing management',
            icon: Target
          },
          {
            feature: 'AI Recommendations',
            usage: 65,
            adoption: 58,
            satisfaction: 4.0,
            trend: 'up',
            category: 'AI/ML',
            description: 'AI-powered recommendations',
            icon: Zap
          },
          {
            feature: 'Report Generation',
            usage: 82,
            adoption: 75,
            satisfaction: 4.1,
            trend: 'stable',
            category: 'Reports',
            description: 'Automated report generation',
            icon: BarChart3
          },
          {
            feature: 'Mobile App',
            usage: 45,
            adoption: 38,
            satisfaction: 3.7,
            trend: 'down',
            category: 'Mobile',
            description: 'Mobile application features',
            icon: Activity
          },
          {
            feature: 'API Integration',
            usage: 58,
            adoption: 52,
            satisfaction: 3.8,
            trend: 'up',
            category: 'Integration',
            description: 'Third-party API integrations',
            icon: Zap
          }
        ];

        setFeatureData(features);
      } catch (error) {
        console.error('Failed to load feature usage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatureData();
  }, []);

  const getFilteredFeatures = () => {
    if (selectedCategory === 'all') return featureData;
    return featureData.filter(feature => feature.category === selectedCategory);
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-green-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBadge = (usage: number) => {
    if (usage >= 80) return 'bg-green-100 text-green-800';
    if (usage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getUsageLevel = (usage: number) => {
    if (usage >= 80) return 'High';
    if (usage >= 60) return 'Medium';
    return 'Low';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 4.0) return 'text-green-600';
    if (satisfaction >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionBadge = (satisfaction: number) => {
    if (satisfaction >= 4.0) return 'bg-green-100 text-green-800';
    if (satisfaction >= 3.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(featureData.map(f => f.category))];
    return categories;
  };

  const getTopFeatures = () => {
    return getFilteredFeatures()
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 3);
  };

  const getStickyFeatures = () => {
    return getFilteredFeatures().filter(f => f.usage >= 80);
  };

  const getIgnoredFeatures = () => {
    return getFilteredFeatures().filter(f => f.usage < 40);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Feature Usage</span>
          </CardTitle>
          <CardDescription>Loading feature usage data...</CardDescription>
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

  const filteredFeatures = getFilteredFeatures();
  const topFeatures = getTopFeatures();
  const stickyFeatures = getStickyFeatures();
  const ignoredFeatures = getIgnoredFeatures();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span>Feature Usage</span>
        </CardTitle>
        <CardDescription>
          Which features are sticky, which are ignored
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {getCategories().map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Star className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{stickyFeatures.length}</p>
            <p className="text-xs text-gray-500">Sticky Features</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Activity className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">{filteredFeatures.length}</p>
            <p className="text-xs text-gray-500">Total Features</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{ignoredFeatures.length}</p>
            <p className="text-xs text-gray-500">Ignored Features</p>
          </div>
        </div>

        {/* Top Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Top Performing Features</h4>
          <div className="space-y-2">
            {topFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon;
              const TrendIcon = getTrendIcon(feature.trend);
              
              return (
                <div key={feature.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
                      <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                    </div>
                    <FeatureIcon className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.feature}</p>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${getUsageColor(feature.usage)}`}>
                        {feature.usage}%
                      </p>
                      <Badge className={getUsageBadge(feature.usage)}>
                        {getUsageLevel(feature.usage)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(feature.trend)}`} />
                      <span className={`text-xs ${getTrendColor(feature.trend)}`}>
                        {feature.trend}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Usage Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Feature Usage Grid</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              const TrendIcon = getTrendIcon(feature.trend);
              
              return (
                <div key={feature.feature} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FeatureIcon className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-gray-900">{feature.feature}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-3 w-3 ${getTrendColor(feature.trend)}`} />
                      <Badge className={getUsageBadge(feature.usage)}>
                        {feature.usage}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Usage</span>
                      <span className="text-gray-900">{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-1" />
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Adoption</span>
                      <span className="text-gray-900">{feature.adoption}%</span>
                    </div>
                    <Progress value={feature.adoption} className="h-1" />
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Satisfaction</span>
                      <span className="text-gray-900">{feature.satisfaction}/5</span>
                    </div>
                    <Progress value={(feature.satisfaction / 5) * 100} className="h-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Usage Distribution</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-sm font-bold text-green-600">
                {filteredFeatures.filter(f => f.usage >= 80).length}
              </p>
              <p className="text-xs text-gray-500">High (80%+)</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <p className="text-sm font-bold text-yellow-600">
                {filteredFeatures.filter(f => f.usage >= 60 && f.usage < 80).length}
              </p>
              <p className="text-xs text-gray-500">Medium (60-79%)</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-sm font-bold text-red-600">
                {filteredFeatures.filter(f => f.usage < 60).length}
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
            Export Data
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Feature Usage Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {stickyFeatures.length} features with high usage (80%+)</li>
            <li>• {ignoredFeatures.length} features need attention (&lt;40% usage)</li>
            <li>• Top feature: {topFeatures[0]?.feature} ({topFeatures[0]?.usage}% usage)</li>
            <li>• Average satisfaction: {(filteredFeatures.reduce((sum, f) => sum + f.satisfaction, 0) / filteredFeatures.length).toFixed(1)}/5</li>
            {stickyFeatures.length > 0 && (
              <li>• Sticky features: {stickyFeatures.map(f => f.feature).join(', ')}</li>
            )}
            {ignoredFeatures.length > 0 && (
              <li>• Features to improve: {ignoredFeatures.map(f => f.feature).join(', ')}</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FeatureUsage;
