'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      case 'revenue': return 'bg-green-500';
      case 'efficiency': return 'bg-blue-500';
      case 'cost': return 'bg-purple-500';
      case 'risk': return 'bg-red-500';
      case 'growth': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
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
    // Simulate analysis
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
              AI Recommendation Feed
            </CardTitle>
            <CardDescription>
              Action suggestions with expected impact and ROI
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${(totalPotentialImpact / 1000).toFixed(1)}k
              </div>
              <div className="text-sm text-muted-foreground">
                Potential Impact
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          {[
            { key: 'all', label: 'All', icon: <Target className="h-4 w-4" /> },
            { key: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
            { key: 'efficiency', label: 'Efficiency', icon: <Activity className="h-4 w-4" /> },
            { key: 'cost', label: 'Cost', icon: <BarChart3 className="h-4 w-4" /> },
            { key: 'risk', label: 'Risk', icon: <AlertTriangle className="h-4 w-4" /> },
            { key: 'growth', label: 'Growth', icon: <TrendingUp className="h-4 w-4" /> }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
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
              className={`p-4 border rounded-lg ${
                recommendation.priority === 'critical' ? 'border-red-200 bg-red-50' :
                recommendation.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-lg ${getCategoryColor(recommendation.category)} text-white`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <h3 className="font-medium">{recommendation.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(recommendation.status)}>
                    {recommendation.status.replace('_', ' ')}
                  </Badge>
                  <div className={`w-2 h-2 rounded-lg-full ${getPriorityColor(recommendation.priority)}`} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Expected Impact</div>
                  <div className="font-medium text-green-600">
                    {recommendation.impact.improvement > 0 ? '+' : ''}{recommendation.impact.improvement}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendation.impact.expectedValue}{recommendation.impact.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                  <div className="font-medium text-blue-600">
                    {recommendation.roi}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendation.timeframe}
                  </div>
                </div>
              </div>

              {/* Confidence and Effort */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className="text-sm font-medium">{recommendation.confidence}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">Effort:</span>
                    <div className={`w-2 h-2 rounded-lg-full ${getEffortColor(recommendation.effort)}`} />
                    <span className="text-sm capitalize">{recommendation.effort}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Expires: {recommendation.expiresAt}
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
                  Created: {recommendation.createdAt}
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
                        Dismiss
                      </Button>
                    </>
                  )}
                  {recommendation.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteRecommendation(recommendation.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Complete
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
            <div className="text-2xl font-bold text-yellow-600">
              {recommendations.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {recommendations.filter(r => r.status === 'dismissed').length}
            </div>
            <div className="text-xs text-muted-foreground">Dismissed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
