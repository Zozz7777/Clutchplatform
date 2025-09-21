"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type ChurnRisk } from '@/lib/business-intelligence';
import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Clock, 
  Eye,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface ChurnRiskCardProps {
  className?: string;
  showDetails?: boolean;
}

export function ChurnRiskCard({ className = '', showDetails = false }: ChurnRiskCardProps) {
  const { t } = useTranslations();
  const [churnRisks, setChurnRisks] = useState<ChurnRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(showDetails);

  React.useEffect(() => {
    const loadChurnRisks = async () => {
      try {
        const data = await businessIntelligence.getChurnRisk();
        setChurnRisks(Array.isArray(data) ? data : []);
      } catch (error) {
        logger.error('Failed to load churn risks:', error);
        setChurnRisks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChurnRisks();
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-warning';
    return 'text-success';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return 'bg-destructive/10 text-destructive';
    if (score >= 60) return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>{t('dashboard.churnRiskAnalysis')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Loading churn risk data...</CardDescription>
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

  const highRiskCount = churnRisks.filter(r => r.riskScore >= 80).length;
  const mediumRiskCount = churnRisks.filter(r => r.riskScore >= 60 && r.riskScore < 80).length;
  const totalAtRisk = churnRisks.length;

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>{t('dashboard.churnRiskAnalysis')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          AI-powered prediction of customer churn risk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
            <p className="text-2xl font-bold text-destructive">{highRiskCount}</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem] border border-warning/20">
            <p className="text-2xl font-bold text-warning">{mediumRiskCount}</p>
            <p className="text-xs text-muted-foreground">Medium Risk</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <p className="text-2xl font-bold text-primary">{totalAtRisk}</p>
            <p className="text-xs text-muted-foreground">Total At Risk</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">High Risk (80%+)</span>
            <span className="text-card-foreground">{highRiskCount}</span>
          </div>
          <Progress value={(highRiskCount / Math.max(totalAtRisk, 1)) * 100} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Medium Risk (60-79%)</span>
            <span className="text-card-foreground">{mediumRiskCount}</span>
          </div>
          <Progress value={(mediumRiskCount / Math.max(totalAtRisk, 1)) * 100} className="h-2" />
        </div>

        {/* At-Risk Users List */}
        {churnRisks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-card-foreground">At-Risk Users</h4>
              {!showAll && churnRisks.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="text-xs hover:bg-muted focus:ring-2 focus:ring-ring"
                >
                  View All ({churnRisks.length})
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {(showAll ? churnRisks : churnRisks.slice(0, 3)).map((risk) => (
                <div key={risk.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-card-foreground">{risk.userName}</p>
                      <Badge className={getRiskBadge(risk.riskScore)}>
                        {getRiskLevel(risk.riskScore)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {risk.riskScore.toFixed(0)}% risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Last active: {formatRelativeTime(risk.lastActivity)}
                        </span>
                      </div>
                    </div>
                    {risk.factors.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-muted-foreground">
                          Factors: {risk.factors.slice(0, 2).join(', ')}
                          {risk.factors.length > 2 && ` +${risk.factors.length - 2} more`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring"
                      onClick={() => {
                        // Navigate to user details
                        window.open(`/users?highlight=${risk.userId}`, '_blank');
                      }}
                      title="View User Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring"
                      onClick={() => {
                        // Send email to user
                        window.open(`mailto:${risk.userName}@example.com?subject=Retention Campaign`, '_blank');
                      }}
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring"
                      onClick={() => {
                        // Call user (placeholder)
                        alert(`Calling ${risk.userName}...`);
                      }}
                      title="Call User"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predicted Churn Timeline */}
        {churnRisks.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-card-foreground mb-3">Predicted Churn Timeline</h4>
            <div className="space-y-2">
              {churnRisks.slice(0, 3).map((risk) => (
                <div key={risk.userId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{risk.userName}</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(risk.predictedChurnDate)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {risk.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-muted focus:ring-2 focus:ring-ring"
            onClick={() => {
              // Send retention campaign to all at-risk users
              const emails = churnRisks.map(risk => `${risk.userName}@example.com`).join(',');
              window.open(`mailto:${emails}?subject=Retention Campaign&body=We noticed you haven't been active recently. We'd love to help you get back on track!`, '_blank');
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Retention Campaign
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-muted focus:ring-2 focus:ring-ring"
            onClick={() => {
              // Navigate to users page
              window.open('/users', '_blank');
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            View All Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChurnRiskCard;
