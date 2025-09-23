"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
import { useLanguage } from '@/contexts/language-context';
import { 
  CheckCircle, 
  Circle, 
  Users, 
  Target,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface OnboardingCompletionProps {
  className?: string;
}

interface OnboardingStep {
  step: string;
  completed: number;
  rate: number;
}

interface OnboardingData {
  total: number;
  completed: number;
  completionRate: number;
  steps: Array<{
    step: string;
    completed: number;
    total: number;
    completionRate: number;
  }>;
}

export function OnboardingCompletion({ className = '' }: OnboardingCompletionProps) {
  const { t } = useLanguage();
  const [onboardingData, setOnboardingData] = React.useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        const data = await businessIntelligence.getOnboardingCompletion();
        setOnboardingData(data);
      } catch (error) {
        // Failed to load onboarding data
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) return 'bg-success/10 text-green-800';
    if (rate >= 60) return 'bg-warning/10 text-yellow-800';
    return 'bg-destructive/10 text-red-800';
  };

  const getCompletionLevel = (rate: number) => {
    if (rate >= 80) return t('widgets.excellent');
    if (rate >= 60) return t('widgets.good');
    if (rate >= 40) return t('widgets.fair');
    return t('widgets.poor');
  };

  const getStepIcon = (rate: number) => {
    if (rate >= 80) return CheckCircle;
    if (rate >= 60) return Circle;
    return AlertTriangle;
  };

  const getStepColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getBottleneckSteps = () => {
    if (!onboardingData || !onboardingData.steps || !Array.isArray(onboardingData.steps)) return [];
    return onboardingData.steps
      .filter(step => (step?.completionRate || 0) < 60)
      .sort((a, b) => (a?.completionRate || 0) - (b?.completionRate || 0));
  };

  const getTopPerformingSteps = () => {
    if (!onboardingData || !onboardingData.steps || !Array.isArray(onboardingData.steps)) return [];
    return onboardingData.steps
      .filter(step => (step?.completionRate || 0) >= 80)
      .sort((a, b) => (b?.completionRate || 0) - (a?.completionRate || 0));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-success" />
            <span>{t('widgets.onboardingCompletion')}</span>
          </CardTitle>
          <CardDescription>{t('widgets.loadingOnboardingData')}</CardDescription>
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

  if (!onboardingData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-success" />
            <span>{t('widgets.onboardingCompletion')}</span>
          </CardTitle>
          <CardDescription>{t('users.unableToLoadOnboardingData')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Safety check to prevent errors when data is not loaded
  if (!onboardingData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-success" />
            <span>{t('widgets.onboardingCompletion')}</span>
          </CardTitle>
          <CardDescription>{t('users.unableToLoadOnboardingData')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const bottleneckSteps = getBottleneckSteps();
  const topPerformingSteps = getTopPerformingSteps();

  return (
    <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-success" />
            <span>{t('widgets.onboardingCompletion')}</span>
          </CardTitle>
          <CardDescription>
            {t('widgets.percentageOfNewUsersCompletingOnboarding')}
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Completion */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getCompletionColor(onboardingData.completionRate)}`} />
            <span className={`text-2xl font-bold ${getCompletionColor(onboardingData.completionRate)}`}>
              {(onboardingData.completionRate || 0).toFixed(1)}%
            </span>
            <Badge className={getCompletionBadge(onboardingData.completionRate)}>
              {getCompletionLevel(onboardingData.completionRate)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t('widgets.overallCompletionRate')}</p>
          <div className="mt-3">
            <Progress value={onboardingData.completionRate} className="h-2" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{onboardingData.total}</p>
            <p className="text-xs text-muted-foreground">{t('widgets.totalUsers')}</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{onboardingData.completed}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.completed')}</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">
              {onboardingData.total - onboardingData.completed}
            </p>
            <p className="text-xs text-muted-foreground">{t('widgets.incomplete')}</p>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('widgets.onboardingSteps')}</h4>
          <div className="space-y-2">
            {onboardingData.steps?.map((step, index) => {
              const StepIcon = getStepIcon(step?.completionRate || 0);
              return (
                <div key={step?.step || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <StepIcon className={`h-4 w-4 ${getStepColor(step?.completionRate || 0)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{step?.step || 'Unknown Step'}</p>
                      <p className="text-xs text-muted-foreground">{step?.completed || 0} of {step?.total || 0} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getCompletionColor(step?.completionRate || 0)}`}>
                      {(step?.completionRate || 0).toFixed(1)}%
                    </p>
                    <Badge className={getCompletionBadge(step?.completionRate || 0)}>
                      {getCompletionLevel(step?.completionRate || 0)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Progress Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">{t('widgets.stepProgress')}</h4>
          <div className="space-y-2">
            {onboardingData.steps?.map((step, index) => (
              <div key={step?.step || index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{step?.step || 'Unknown Step'}</span>
                  <span className="text-foreground font-medium">{(step?.completionRate || 0).toFixed(1)}%</span>
                </div>
                <Progress value={step?.completionRate || 0} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        {bottleneckSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span>{t('widgets.bottlenecks')}</span>
            </h4>
            <div className="space-y-2">
              {bottleneckSteps.map((step, index) => (
                <div key={step?.step || index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-[0.625rem]-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{step?.step || 'Unknown Step'}</p>
                      <p className="text-xs text-destructive">{t('widgets.needsAttention')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">{(step?.completionRate || 0).toFixed(1)}%</p>
                    <Badge className="bg-destructive/10 text-red-800">{t('widgets.low')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performing Steps */}
        {topPerformingSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t('widgets.topPerformingSteps')}</span>
            </h4>
            <div className="space-y-2">
              {topPerformingSteps.map((step, index) => (
                <div key={step?.step || index} className="flex items-center justify-between p-3 bg-success/10 rounded-[0.625rem]-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{step?.step || 'Unknown Step'}</p>
                      <p className="text-xs text-success">{t('widgets.performingWell')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">{(step?.completionRate || 0).toFixed(1)}%</p>
                    <Badge className="bg-success/10 text-green-800">{t('widgets.high')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 {t('widgets.onboardingInsights')}</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {t('widgets.overallCompletionRate')}: {(onboardingData.completionRate || 0).toFixed(1)}%</li>
            <li>• {onboardingData.completed || 0} {t('widgets.usersCompletedFullOnboarding')}</li>
            <li>• {bottleneckSteps.length} {t('widgets.stepsNeedImprovement')}</li>
            <li>• {topPerformingSteps.length} {t('widgets.stepsPerformingExcellent')}</li>
            {bottleneckSteps.length > 0 && (
              <li>• {t('widgets.focusOn')} {bottleneckSteps[0]?.step || 'Unknown'} ({(bottleneckSteps[0]?.completionRate || 0).toFixed(1)}% {t('widgets.completion')})</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default OnboardingCompletion;





