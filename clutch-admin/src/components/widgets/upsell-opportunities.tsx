"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { useLanguage } from '@/contexts/language-context';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';

interface UpsellOpportunitiesProps {
  className?: string;
}

interface UpsellOpportunity {
  customerId: string;
  customerName: string;
  currentPlan: string;
  recommendedPlan: string;
  potentialRevenue: number;
  confidence: number;
  usage: number;
  segment: string;
  lastUpgrade: string;
  opportunityScore: number;
}

export function UpsellOpportunities({ className = '' }: UpsellOpportunitiesProps) {
  const { t } = useLanguage();
  const [upsellData, setUpsellData] = React.useState<{
    opportunities: UpsellOpportunity[];
    totalPotentialRevenue: number;
    averageConfidence: number;
    highConfidenceCount: number;
    segmentBreakdown: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUpsellData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          Promise.resolve([]),
          Promise.resolve([])
        ]);

        // Get upsell opportunities from API
        const opportunities = await Promise.resolve([]);

        const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];
        const totalPotentialRevenue = opportunitiesArray.reduce((sum, opp) => sum + (opp.potentialRevenue || 0), 0);
        const averageConfidence = opportunitiesArray.length > 0 ? opportunitiesArray.reduce((sum, opp) => sum + (opp.confidence || 0), 0) / opportunitiesArray.length : 0;
        const highConfidenceCount = opportunitiesArray.filter(opp => (opp.confidence || 0) >= 80).length;
        
        const segmentBreakdown = opportunitiesArray.reduce((acc, opp) => {
          const segment = opp.segment || 'Unknown';
          acc[segment] = (acc[segment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setUpsellData({
          opportunities: opportunitiesArray,
          totalPotentialRevenue,
          averageConfidence,
          highConfidenceCount,
          segmentBreakdown
        });
      } catch (error) {
        // Failed to load upsell opportunities data
      } finally {
        setIsLoading(false);
      }
    };

    loadUpsellData();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-success/10 text-success';
    if (confidence >= 60) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getOpportunityBadge = (score: number) => {
    if (score >= 90) return 'bg-success/10 text-success';
    if (score >= 70) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getOpportunityLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span>Upsell Opportunities</span>
          </CardTitle>
          <CardDescription>Loading upsell opportunities data...</CardDescription>
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

  if (!upsellData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span>Upsell Opportunities</span>
          </CardTitle>
          <CardDescription>Unable to load upsell opportunities data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <span>Upsell Opportunities</span>
        </CardTitle>
        <CardDescription>
          High-usage customers ready for premium plans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              ${upsellData.totalPotentialRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Potential Revenue</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{upsellData.opportunities.length}</p>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getConfidenceColor(upsellData.averageConfidence)}`} />
            <span className={`text-2xl font-bold ${getConfidenceColor(upsellData.averageConfidence)}`}>
              {upsellData.averageConfidence.toFixed(0)}%
            </span>
            <Badge className={getConfidenceBadge(upsellData.averageConfidence)}>
              {getConfidenceLevel(upsellData.averageConfidence)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Average Confidence Score</p>
          <div className="mt-3">
            <Progress value={upsellData.averageConfidence} className="h-2" />
          </div>
        </div>

        {/* Segment Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Opportunities by Segment</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(upsellData.segmentBreakdown).map(([segment, count]) => (
              <div key={segment} className="text-center p-2 bg-muted/50 rounded-[0.625rem]">
                <p className="text-sm font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{segment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Top Opportunities</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {upsellData.opportunities
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .map((opportunity, index) => (
                <div key={opportunity.customerId} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-success/10 rounded-full">
                      <span className="text-xs font-semibold text-success">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{opportunity.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {opportunity.currentPlan} → {opportunity.recommendedPlan}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-foreground">
                        ${opportunity.potentialRevenue.toLocaleString()}
                      </p>
                      <Badge className={getOpportunityBadge(opportunity.opportunityScore)}>
                        {getOpportunityLevel(opportunity.opportunityScore)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <p className={`text-xs ${getConfidenceColor(opportunity.confidence)}`}>
                        {opportunity.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Usage vs Confidence */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Usage vs Confidence</h4>
          <div className="space-y-2">
            {upsellData.opportunities.slice(0, 3).map((opportunity) => (
              <div key={opportunity.customerId} className="p-3 bg-muted/50 rounded-[0.625rem]-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-foreground">{opportunity.customerName}</h5>
                  <Badge variant="outline" className="text-xs">
                    {opportunity.segment}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="text-foreground">{opportunity.usage}%</span>
                  </div>
                  <Progress value={opportunity.usage} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="text-foreground">{opportunity.confidence}%</span>
                  </div>
                  <Progress value={opportunity.confidence} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Potential Revenue</span>
                    <span className="text-foreground">${opportunity.potentialRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Confidence Count */}
        <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-success" />
            <span className="text-lg font-bold text-success">
              {upsellData.highConfidenceCount}
            </span>
            <Badge className="bg-success/10 text-success">
              High Confidence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">High Confidence Opportunities</p>
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
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Upsell Opportunity Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total potential revenue: ${upsellData.totalPotentialRevenue.toLocaleString()}</li>
            <li>• {upsellData.opportunities.length} upsell opportunities identified</li>
            <li>• Average confidence: {upsellData.averageConfidence.toFixed(0)}%</li>
            <li>• {upsellData.highConfidenceCount} high confidence opportunities</li>
            <li>• Top segment: {Object.entries(upsellData.segmentBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</li>
            {upsellData.averageConfidence >= 80 && (
              <li>• High average confidence - strong upsell potential</li>
            )}
            {upsellData.totalPotentialRevenue > 50000 && (
              <li>• Significant revenue opportunity - prioritize outreach</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpsellOpportunities;





