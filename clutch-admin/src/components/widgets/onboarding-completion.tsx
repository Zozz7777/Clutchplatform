"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
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
  steps: OnboardingStep[];
}

export function OnboardingCompletion({ className = '' }: OnboardingCompletionProps) {
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
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Poor';
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
    if (!onboardingData) return [];
    return onboardingData.steps
      .filter(step => step.rate < 60)
      .sort((a, b) => a.rate - b.rate);
  };

  const getTopPerformingSteps = () => {
    if (!onboardingData) return [];
    return onboardingData.steps
      .filter(step => step.rate >= 80)
      .sort((a, b) => b.rate - a.rate);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-success" />
            <span>Onboarding Completion</span>
          </CardTitle>
          <CardDescription>Loading onboarding metrics...</CardDescription>
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
            <span>Onboarding Completion</span>
          </CardTitle>
          <CardDescription>Unable to load onboarding data</CardDescription>
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
          <span>Onboarding Completion</span>
        </CardTitle>
        <CardDescription>
          % of new users completing onboarding flows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Completion */}
        <div className="text-center p-4 bg-muted/50 rounded-[0.625rem]-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getCompletionColor(onboardingData.completionRate)}`} />
            <span className={`text-2xl font-bold ${getCompletionColor(onboardingData.completionRate)}`}>
              {onboardingData.completionRate.toFixed(1)}%
            </span>
            <Badge className={getCompletionBadge(onboardingData.completionRate)}>
              {getCompletionLevel(onboardingData.completionRate)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
          <div className="mt-3">
            <Progress value={onboardingData.completionRate} className="h-2" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem]-lg">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{onboardingData.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]-lg">
            <CheckCircle className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{onboardingData.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">
              {onboardingData.total - onboardingData.completed}
            </p>
            <p className="text-xs text-muted-foreground">Incomplete</p>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Onboarding Steps</h4>
          <div className="space-y-2">
            {onboardingData.steps.map((step) => {
              const StepIcon = getStepIcon(step.rate);
              return (
                <div key={step.step} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem]-lg">
                  <div className="flex items-center space-x-3">
                    <StepIcon className={`h-4 w-4 ${getStepColor(step.rate)}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.step}</p>
                      <p className="text-xs text-muted-foreground">{step.completed} of {onboardingData.total} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getCompletionColor(step.rate)}`}>
                      {step.rate.toFixed(1)}%
                    </p>
                    <Badge className={getCompletionBadge(step.rate)}>
                      {getCompletionLevel(step.rate)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Progress Visualization */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Step Progress</h4>
          <div className="space-y-2">
            {onboardingData.steps.map((step) => (
              <div key={step.step} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{step.step}</span>
                  <span className="text-foreground font-medium">{step.rate.toFixed(1)}%</span>
                </div>
                <Progress value={step.rate} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        {bottleneckSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span>Bottlenecks</span>
            </h4>
            <div className="space-y-2">
              {bottleneckSteps.map((step) => (
                <div key={step.step} className="flex items-center justify-between p-3 bg-destructive/10 rounded-[0.625rem]-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{step.step}</p>
                      <p className="text-xs text-destructive">Needs attention</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">{step.rate.toFixed(1)}%</p>
                    <Badge className="bg-destructive/10 text-red-800">Low</Badge>
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
              <span>Top Performing Steps</span>
            </h4>
            <div className="space-y-2">
              {topPerformingSteps.map((step) => (
                <div key={step.step} className="flex items-center justify-between p-3 bg-success/10 rounded-[0.625rem]-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{step.step}</p>
                      <p className="text-xs text-success">Performing well</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success">{step.rate.toFixed(1)}%</p>
                    <Badge className="bg-success/10 text-green-800">High</Badge>
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
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem]-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Onboarding Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Overall completion rate: {onboardingData.completionRate.toFixed(1)}%</li>
            <li>• {onboardingData.completed} users completed full onboarding</li>
            <li>• {bottleneckSteps.length} steps need improvement</li>
            <li>• {topPerformingSteps.length} steps performing excellently</li>
            {bottleneckSteps.length > 0 && (
              <li>• Focus on: {bottleneckSteps[0]?.step} ({bottleneckSteps[0]?.rate.toFixed(1)}% completion)</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default OnboardingCompletion;



