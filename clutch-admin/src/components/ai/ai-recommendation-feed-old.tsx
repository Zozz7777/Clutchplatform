'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
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

interface AIRecommendationFeedProps {
  className?: string;
}

export default function AIRecommendationFeed({ className }: AIRecommendationFeedProps) {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'revenue' | 'efficiency' | 'cost' | 'risk' | 'growth'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadRecommendations = () => {
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          title: 'Extend Fleet A Maintenance by 2 Days',
          description: 'Based on usage patterns, extending maintenance by 2 days will prevent revenue loss during peak hours',
          category: 'revenue',
          priority: 'high',
          impact: {
            metric: 'Revenue Loss Prevention',
            currentValue: 0,
            expectedValue: 3200,
            improvement: 100,
            unit: '$',
            timeframe: 'Next 7 days'
          },
          confidence: 87,
          effort: 'low',
          roi: 450,
          status: 'pending',
          createdAt: '2 hours ago',
          expiresAt: '6 hours',
          tags: ['fleet', 'maintenance', 'revenue'],
          actions: {
            primary: 'Schedule Maintenance',
            secondary: 'View Details'
          }
        },
        {
          id: '2',
          title: 'Optimize B2B Onboarding Flow',
          description: 'Streamlining the onboarding process from 12 to 3 steps will increase activation rate by 40%',
          category: 'growth',
          priority: 'high',
          impact: {
            metric: 'Activation Rate',
            currentValue: 35,
            expectedValue: 49,
            improvement: 40,
            unit: '%',
            timeframe: 'Next 30 days'
          },
          confidence: 92,
          effort: 'high',
          roi: 280,
          status: 'pending',
          createdAt: '4 hours ago',
          expiresAt: '2 days',
          tags: ['onboarding', 'b2b', 'conversion'],
          actions: {
            primary: 'Implement Changes',
            secondary: 'A/B Test'
          }
        },
        {
          id: '3',
          title: 'Implement Dynamic Pricing for Peak Hours',
          description: 'Adjusting pricing during peak demand hours can increase revenue by 15% without affecting customer satisfaction',
          category: 'revenue',
          priority: 'medium',
          impact: {
            metric: 'Peak Hour Revenue',
            currentValue: 12500,
            expectedValue: 14375,
            improvement: 15,
            unit: '$',
            timeframe: 'Next 14 days'
          },
          confidence: 78,
          effort: 'medium',
          roi: 320,
          status: 'pending',
          createdAt: '6 hours ago',
          expiresAt: '3 days',
          tags: ['pricing', 'revenue', 'optimization'],
          actions: {
            primary: 'Enable Dynamic Pricing',
            secondary: 'Review Impact'
          }
        },
        {
          id: '4',
          title: 'Reduce API Response Time with Caching',
          description: 'Implementing Redis caching for frequently accessed data will reduce response time by 65%',
          category: 'efficiency',
          priority: 'high',
          impact: {
            metric: 'API Response Time',
            currentValue: 2.3,
            expectedValue: 0.8,
            improvement: 65,
            unit: 's',
            timeframe: 'Next 10 days'
          },
          confidence: 95,
          effort: 'medium',
          roi: 180,
          status: 'in_progress',
          createdAt: '1 day ago',
          expiresAt: '5 days',
          tags: ['performance', 'api', 'caching'],
          actions: {
            primary: 'Continue Implementation',
            secondary: 'Monitor Progress'
          }
        },
        {
          id: '5',
          title: 'Automate Customer Support Triage',
          description: 'AI-powered ticket classification will reduce response time by 40% and improve customer satisfaction',
          category: 'efficiency',
          priority: 'medium',
          impact: {
            metric: 'Support Response Time',
            currentValue: 4.2,
            expectedValue: 2.5,
            improvement: 40,
            unit: 'hours',
            timeframe: 'Next 21 days'
          },
          confidence: 83,
          effort: 'high',
          roi: 220,
          status: 'pending',
          createdAt: '2 days ago',
          expiresAt: '1 week',
          tags: ['support', 'automation', 'ai'],
          actions: {
            primary: 'Start Implementation',
            secondary: 'Pilot Program'
          }
        }
      ];

      setRecommendations(mockRecommendations);
    };

    loadRecommendations();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'efficiency': return <Activity className="h-4 w-4" />;
      case 'cost': return <BarChart3 className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'bg-success';
      case 'efficiency': return 'bg-primary';
      case 'cost': return 'bg-secondary';
      case 'risk': return 'bg-destructive';
      case 'growth': return 'bg-warning';
      default: return 'bg-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'dismissed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const handleAcceptRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'in_progress' as const }
          : rec
      )
    );
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'dismissed' as const }
          : rec
      )
    );
  };

  const handleCompleteRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'completed' as const }
          : rec
      )
    );
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Perform real analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Add new recommendations
    }, 3000);
  };

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === filter);

  const pendingRecommendations = recommendations.filter(rec => rec.status === 'pending');
  const totalPotentialImpact = pendingRecommendations.reduce((sum, rec) => sum + rec.impact.expectedValue, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              {t('widgets.aiRecommendationFeed.title')}
            </CardTitle>
            <CardDescription>
              {t('widgets.aiRecommendationFeed.description')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-medium text-success">
                ${(totalPotentialImpact / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">
                {t('widgets.aiRecommendationFeed.potentialImpact')}
              </div>
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-1 animate-spin" />
                  {t('widgets.aiRecommendationFeed.analyzing')}
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {t('widgets.aiRecommendationFeed.analyze')}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{t('widgets.aiRecommendationFeed.filter')}</span>
          {[
            { key: 'all', label: t('widgets.aiRecommendationFeed.all'), icon: <Target className="h-4 w-4" /> },
            { key: 'revenue', label: t('widgets.aiRecommendationFeed.revenue'), icon: <DollarSign className="h-4 w-4" /> },
            { key: 'efficiency', label: t('widgets.aiRecommendationFeed.efficiency'), icon: <Activity className="h-4 w-4" /> },
            { key: 'cost', label: t('widgets.aiRecommendationFeed.cost'), icon: <BarChart3 className="h-4 w-4" /> },
            { key: 'risk', label: t('widgets.aiRecommendationFeed.risk'), icon: <AlertTriangle className="h-4 w-4" /> },
            { key: 'growth', label: t('widgets.aiRecommendationFeed.growth'), icon: <TrendingUp className="h-4 w-4" /> }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption.key as string)}
            >
              {filterOption.icon}
              <span className="ml-1">{filterOption.label}</span>
            </Button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 border border-border rounded-[0.625rem] ${
                recommendation.priority === 'critical' ? 'bg-destructive/10' :
                recommendation.priority === 'high' ? 'bg-warning/10' :
                'bg-background'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-[0.625rem] ${getCategoryColor(recommendation.category)} text-background`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <h3 className="font-medium">{recommendation.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(recommendation.status)}>
                    {recommendation.status.replace('_', ' ')}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Expected Impact</div>
                  <div className="font-medium text-success">
                    {recommendation.impact.improvement > 0 ? '+' : ''}{recommendation.impact.improvement}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendation.impact.expectedValue}{recommendation.impact.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t('widgets.aiRecommendationFeed.roi')}</div>
                  <div className="font-medium text-primary">
                    {recommendation.roi}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendation.impact.timeframe}
                  </div>
                </div>
              </div>

              {/* Confidence and Effort */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">{t('widgets.aiRecommendationFeed.confidence')}</span>
                    <span className="text-sm font-medium">{recommendation.confidence}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">{t('widgets.aiRecommendationFeed.effort')}</span>
                    <div className={`w-2 h-2 rounded-full ${getEffortColor(recommendation.effort)}`} />
                    <span className="text-sm capitalize">{recommendation.effort}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('widgets.aiRecommendationFeed.expires')} {recommendation.expiresAt}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {recommendation.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {t('widgets.aiRecommendationFeed.created')} {recommendation.createdAt}
                </div>
                <div className="flex items-center space-x-2">
                  {recommendation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRecommendation(recommendation.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {recommendation.actions.primary}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismissRecommendation(recommendation.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        {t('widgets.aiRecommendationFeed.dismiss')}
                      </Button>
                    </>
                  )}
                  {recommendation.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteRecommendation(recommendation.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('widgets.aiRecommendationFeed.markComplete')}
                    </Button>
                  )}
                  {recommendation.actions.secondary && (
                    <Button variant="ghost" size="sm">
                      {recommendation.actions.secondary}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-medium text-warning">
              {recommendations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-primary">
              {recommendations.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-success">
              {recommendations.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-muted-foreground">
              {recommendations.filter(r => r.status === 'dismissed').length}
            </div>
            <div className="text-xs text-muted-foreground">Dismissed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


