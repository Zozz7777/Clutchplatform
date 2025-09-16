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
  TrendingUp, 
  TrendingDown, 
  Target,
  Download,
  RefreshCw,
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
        console.error('Failed to load onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
            <Target className="h-5 w-5 text-green-600" />
            <span>Onboarding Completion</span>
          </CardTitle>
          <CardDescription>Loading onboarding metrics...</CardDescription>
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

  if (!onboardingData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
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
          <Target className="h-5 w-5 text-green-600" />
          <span>Onboarding Completion</span>
        </CardTitle>
        <CardDescription>
          % of new users completing onboarding flows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Completion */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className={`h-6 w-6 ${getCompletionColor(onboardingData.completionRate)}`} />
            <span className={`text-2xl font-bold ${getCompletionColor(onboardingData.completionRate)}`}>
              {onboardingData.completionRate.toFixed(1)}%
            </span>
            <Badge className={getCompletionBadge(onboardingData.completionRate)}>
              {getCompletionLevel(onboardingData.completionRate)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Overall Completion Rate</p>
          <div className="mt-3">
            <Progress value={onboardingData.completionRate} className="h-2" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg-lg">
            <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{onboardingData.total}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg-lg-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{onboardingData.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">
              {onboardingData.total - onboardingData.completed}
            </p>
            <p className="text-xs text-gray-500">Incomplete</p>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Onboarding Steps</h4>
          <div className="space-y-2">
            {onboardingData.steps.map((step, index) => {
              const StepIcon = getStepIcon(step.rate);
              return (
                <div key={step.step} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                  <div className="flex items-center space-x-3">
                    <StepIcon className={`h-4 w-4 ${getStepColor(step.rate)}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step.step}</p>
                      <p className="text-xs text-gray-500">{step.completed} of {onboardingData.total} users</p>
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
          <h4 className="text-sm font-medium text-gray-900">Step Progress</h4>
          <div className="space-y-2">
            {onboardingData.steps.map((step) => (
              <div key={step.step} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{step.step}</span>
                  <span className="text-gray-900 font-medium">{step.rate.toFixed(1)}%</span>
                </div>
                <Progress value={step.rate} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        {bottleneckSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Bottlenecks</span>
            </h4>
            <div className="space-y-2">
              {bottleneckSteps.map((step) => (
                <div key={step.step} className="flex items-center justify-between p-3 bg-red-50 rounded-lg-lg-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">{step.step}</p>
                      <p className="text-xs text-red-700">Needs attention</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{step.rate.toFixed(1)}%</p>
                    <Badge className="bg-red-100 text-red-800">Low</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performing Steps */}
        {topPerformingSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Top Performing Steps</span>
            </h4>
            <div className="space-y-2">
              {topPerformingSteps.map((step) => (
                <div key={step.step} className="flex items-center justify-between p-3 bg-green-50 rounded-lg-lg-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{step.step}</p>
                      <p className="text-xs text-green-700">Performing well</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{step.rate.toFixed(1)}%</p>
                    <Badge className="bg-green-100 text-green-800">High</Badge>
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
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
