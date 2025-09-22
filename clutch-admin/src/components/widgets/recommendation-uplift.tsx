"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { 
  Lightbulb, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Download,
  Eye,
  BarChart3,
  Activity,
  CheckCircle
} from 'lucide-react';

interface RecommendationUpliftProps {
  className?: string;
}

interface RecommendationUpliftData {
  recommendationsSent: number;
  accepted: number;
  revenueImpact: number;
  engagementImprovement: number;
  topPerformingTypes: string[];
}

export function RecommendationUplift({ className = '' }: RecommendationUpliftProps) {
  const { t } = useTranslations();
  const [upliftData, setUpliftData] = React.useState<RecommendationUpliftData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUpliftData = async () => {
      try {
        const data = await businessIntelligence.getRecommendationUplift();
        setUpliftData(data);
      } catch (error) {
        // Failed to load recommendation uplift data
      } finally {
        setIsLoading(false);
      }
    };

    loadUpliftData();
  }, []);

  const getAcceptanceRate = () => {
    if (!upliftData) return 0;
    return upliftData.recommendationsSent > 0 ? (upliftData.accepted / upliftData.recommendationsSent) * 100 : 0;
  };

  const getAcceptanceColor = (rate: number) => {
    if (rate >= 70) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getAcceptanceBadge = (rate: number) => {
    if (rate >= 70) return 'bg-success/10 text-green-800';
    if (rate >= 50) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getAcceptanceLevel = (rate: number) => {
    if (rate >= 70) return 'Excellent';
    if (rate >= 50) return 'Good';
    if (rate >= 30) return 'Fair';
    return 'Poor';
  };

  const getEngagementColor = (improvement: number) => {
    if (improvement >= 30) return 'text-success';
    if (improvement >= 20) return 'text-warning';
    return 'text-destructive';
  };

  const getEngagementBadge = (improvement: number) => {
    if (improvement >= 30) return 'bg-success/10 text-green-800';
    if (improvement >= 20) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getEngagementLevel = (improvement: number) => {
    if (improvement >= 30) return 'High';
    if (improvement >= 20) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <span>Recommendation Uplift</span>
          </CardTitle>
          <CardDescription>Loading recommendation data...</CardDescription>
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

  if (!upliftData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            <span>Recommendation Uplift</span>
          </CardTitle>
          <CardDescription>Unable to load recommendation data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const acceptanceRate = getAcceptanceRate();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          <span>Recommendation Uplift</span>
        </CardTitle>
        <CardDescription>
          % improvement in revenue/engagement from recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Lightbulb className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{upliftData.recommendationsSent}</p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{upliftData.accepted}</p>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getAcceptanceColor(acceptanceRate)}`} />
            <span className={`text-2xl font-bold ${getAcceptanceColor(acceptanceRate)}`}>
              {acceptanceRate.toFixed(1)}%
            </span>
            <Badge className={getAcceptanceBadge(acceptanceRate)}>
              {getAcceptanceLevel(acceptanceRate)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Acceptance Rate</p>
          <div className="mt-3">
            <Progress value={acceptanceRate} className="h-2" />
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Impact Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Revenue Impact</p>
                  <p className="text-xs text-muted-foreground">From accepted recommendations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${upliftData.revenueImpact.toLocaleString()}
                </p>
                <Badge variant="outline" className="text-xs">
                  +{((upliftData.revenueImpact / 10000) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Engagement Improvement</p>
                  <p className="text-xs text-muted-foreground">User engagement increase</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getEngagementColor(upliftData.engagementImprovement)}`}>
                  +{upliftData.engagementImprovement.toFixed(1)}%
                </p>
                <Badge className={getEngagementBadge(upliftData.engagementImprovement)}>
                  {getEngagementLevel(upliftData.engagementImprovement)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Top Performing Types</h4>
          <div className="space-y-2">
            {upliftData.topPerformingTypes.map((type, index) => (
              <div key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-warning/10 rounded-full">
                    <span className="text-xs font-semibold text-warning">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{type}</p>
                    <p className="text-xs text-muted-foreground">Recommendation type</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {Math.floor(Math.random() * 30) + 70}%
                  </p>
                  <Badge variant="outline" className="text-xs">
                    High Impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-primary">
              {upliftData.accepted > 0 ? (upliftData.revenueImpact / upliftData.accepted).toFixed(0) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Avg Revenue Per Acceptance</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]-lg">
            <Activity className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-sm font-bold text-warning">
              {upliftData.engagementImprovement.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Engagement Uplift</p>
          </div>
        </div>

        {/* Recommendation Flow */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Recommendation Flow</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sent</span>
              <span>{upliftData.recommendationsSent}</span>
            </div>
            <Progress value={100} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Accepted</span>
              <span>{upliftData.accepted}</span>
            </div>
            <Progress value={acceptanceRate} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Revenue Impact</span>
              <span>${upliftData.revenueImpact.toLocaleString()}</span>
            </div>
            <Progress value={Math.min((upliftData.revenueImpact / 50000) * 100, 100)} className="h-2" />
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
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Recommendation Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {upliftData.recommendationsSent} recommendations sent</li>
            <li>• {upliftData.accepted} recommendations accepted ({acceptanceRate.toFixed(1)}% rate)</li>
            <li>• Revenue impact: ${upliftData.revenueImpact.toLocaleString()}</li>
            <li>• Engagement improvement: +{upliftData.engagementImprovement.toFixed(1)}%</li>
            <li>• Top performing type: {upliftData.topPerformingTypes[0]}</li>
            {acceptanceRate >= 70 && (
              <li>• Excellent acceptance rate - recommendations are highly relevant</li>
            )}
            {acceptanceRate < 50 && (
              <li>• Low acceptance rate - consider improving recommendation quality</li>
            )}
            {upliftData.engagementImprovement >= 30 && (
              <li>• High engagement improvement - recommendations driving user activity</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendationUplift;





