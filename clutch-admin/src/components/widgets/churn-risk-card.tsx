"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence, type ChurnRisk } from '@/lib/business-intelligence';
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
  const [churnRisks, setChurnRisks] = useState<ChurnRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(showDetails);

  React.useEffect(() => {
    const loadChurnRisks = async () => {
      try {
        const data = await businessIntelligence.getChurnRisk();
        setChurnRisks(data);
      } catch (error) {
        console.error('Failed to load churn risks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChurnRisks();
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Churn Risk Analysis</span>
          </CardTitle>
          <CardDescription>Loading churn risk data...</CardDescription>
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

  const highRiskCount = churnRisks.filter(r => r.riskScore >= 80).length;
  const mediumRiskCount = churnRisks.filter(r => r.riskScore >= 60 && r.riskScore < 80).length;
  const totalAtRisk = churnRisks.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Churn Risk Analysis</span>
        </CardTitle>
        <CardDescription>
          AI-powered prediction of customer churn risk
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
            <p className="text-xs text-gray-500">High Risk</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg-lg-lg">
            <p className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</p>
            <p className="text-xs text-gray-500">Medium Risk</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <p className="text-2xl font-bold text-blue-600">{totalAtRisk}</p>
            <p className="text-xs text-gray-500">Total At Risk</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>High Risk (80%+)</span>
            <span>{highRiskCount}</span>
          </div>
          <Progress value={(highRiskCount / Math.max(totalAtRisk, 1)) * 100} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>Medium Risk (60-79%)</span>
            <span>{mediumRiskCount}</span>
          </div>
          <Progress value={(mediumRiskCount / Math.max(totalAtRisk, 1)) * 100} className="h-2" />
        </div>

        {/* At-Risk Users List */}
        {churnRisks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">At-Risk Users</h4>
              {!showAll && churnRisks.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="text-xs"
                >
                  View All ({churnRisks.length})
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {(showAll ? churnRisks : churnRisks.slice(0, 3)).map((risk) => (
                <div key={risk.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{risk.userName}</p>
                      <Badge className={getRiskBadge(risk.riskScore)}>
                        {getRiskLevel(risk.riskScore)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {risk.riskScore.toFixed(0)}% risk
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Last active: {formatRelativeTime(risk.lastActivity)}
                        </span>
                      </div>
                    </div>
                    {risk.factors.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          Factors: {risk.factors.slice(0, 2).join(', ')}
                          {risk.factors.length > 2 && ` +${risk.factors.length - 2} more`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Predicted Churn Timeline</h4>
            <div className="space-y-2">
              {churnRisks.slice(0, 3).map((risk) => (
                <div key={risk.userId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{risk.userName}</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">
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
        <div className="flex space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Send Retention Campaign
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            View All Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChurnRiskCard;
