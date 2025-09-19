'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { realApi } from '@/lib/real-api';
import { toast } from 'sonner';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target, 
  Zap,
  CheckCircle,
  X,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Users,
  Truck,
  Activity
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'efficiency' | 'cost' | 'risk' | 'growth';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    metric: string;
    currentValue: number;
    expectedValue: number;
    improvement: number;
    unit: string;
    timeframe: string;
  };
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  roi: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
  expiresAt: string;
  tags: string[];
  actions: {
    primary: string;
    secondary?: string;
  };
}

export default function AIRecommendationFeed() {
  const { t } = useTranslations();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'revenue' | 'efficiency' | 'cost' | 'risk' | 'growth'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recommendationsData = await realApi.getAIRecommendations();
        setRecommendations(recommendationsData || []);
      } catch (error) {
        console.error("Failed to load AI recommendations:", error);
        toast.error(t('aiRecommendations.failedToLoadRecommendations'));
        setRecommendations([]);
      }
    };

    loadRecommendations();
  }, [t]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'efficiency':
        return <Zap className="h-4 w-4" />;
      case 'cost':
        return <TrendingUp className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'growth':
        return <Target className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'dismissed':
        return <X className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.category === filter
  );

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Trigger new analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate analysis
      const updatedRecommendations = await realApi.getAIRecommendations();
      setRecommendations(updatedRecommendations || []);
      toast.success(t('aiRecommendations.analysisComplete'));
    } catch (error) {
      console.error("Failed to analyze recommendations:", error);
      toast.error(t('aiRecommendations.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = async (recommendationId: string, action: string) => {
    try {
      // Implement action logic here
      toast.success(t('aiRecommendations.actionStarted', { action }));
    } catch (error) {
      console.error("Failed to execute action:", error);
      toast.error(t('aiRecommendations.actionFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights to optimize your business performance
          </p>
        </div>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          {isAnalyzing ? t('aiRecommendations.analyzing') : t('aiRecommendations.analyze')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Active recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.length > 0 ? Math.round(recommendations.reduce((sum, r) => sum + r.roi, 0) / recommendations.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Expected return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.length > 0 ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI confidence level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Categories
            </Button>
            <Button
              variant={filter === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('revenue')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </Button>
            <Button
              variant={filter === 'efficiency' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('efficiency')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Efficiency
            </Button>
            <Button
              variant={filter === 'cost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('cost')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Cost
            </Button>
            <Button
              variant={filter === 'risk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('risk')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk
            </Button>
            <Button
              variant={filter === 'growth' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('growth')}
            >
              <Target className="h-4 w-4 mr-2" />
              Growth
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filter or run a new analysis
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(recommendation.category)}
                        <span className="text-sm font-medium capitalize">
                          {recommendation.category}
                        </span>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(recommendation.status)}
                        <span className="text-sm text-muted-foreground capitalize">
                          {recommendation.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {recommendation.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Impact Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {recommendation.impact.metric}
                    </div>
                    <div className="text-2xl font-bold">
                      {recommendation.impact.currentValue}
                      {recommendation.impact.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      → {recommendation.impact.expectedValue}{recommendation.impact.unit}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Improvement
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +{recommendation.impact.improvement}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recommendation.impact.timeframe}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      ROI & Confidence
                    </div>
                    <div className="text-2xl font-bold">
                      {recommendation.roi}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recommendation.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {recommendation.tags && recommendation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recommendation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Created {recommendation.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Expires {recommendation.expiresAt}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getEffortColor(recommendation.effort)}`}>
                      <span>Effort: {recommendation.effort}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(recommendation.id, recommendation.actions.secondary || 'View Details')}
                    >
                      {recommendation.actions.secondary || 'View Details'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(recommendation.id, recommendation.actions.primary)}
                    >
                      {recommendation.actions.primary}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
