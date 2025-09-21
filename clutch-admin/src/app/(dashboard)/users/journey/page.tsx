'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Circle,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target
} from 'lucide-react';

interface JourneyStep {
  id: string;
  name: string;
  description: string;
  users: number;
  conversionRate: number;
  averageTime: string;
  dropoffRate: number;
}

export default function UserJourneyPage() {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([
    {
      id: '1',
      name: 'Landing Page',
      description: 'User visits the landing page',
      users: 10000,
      conversionRate: 100,
      averageTime: '2m 30s',
      dropoffRate: 0
    },
    {
      id: '2',
      name: 'Sign Up',
      description: 'User creates an account',
      users: 2500,
      conversionRate: 25,
      averageTime: '5m 15s',
      dropoffRate: 75
    },
    {
      id: '3',
      name: 'Onboarding',
      description: 'User completes initial setup',
      users: 1800,
      conversionRate: 72,
      averageTime: '8m 45s',
      dropoffRate: 28
    },
    {
      id: '4',
      name: 'First Fleet',
      description: 'User adds their first vehicle',
      users: 1200,
      conversionRate: 66.7,
      averageTime: '12m 20s',
      dropoffRate: 33.3
    },
    {
      id: '5',
      name: 'Active Usage',
      description: 'User actively uses the platform',
      users: 950,
      conversionRate: 79.2,
      averageTime: '15m 10s',
      dropoffRate: 20.8
    }
  ]);

  const [analytics] = useState({
    totalUsers: 10000,
    convertedUsers: 950,
    overallConversion: 9.5,
    averageJourneyTime: '43m 20s'
  });

  const getStepIcon = (index: number, isLast: boolean) => {
    if (isLast) {
      return <CheckCircle className="h-6 w-6 text-success" />;
    }
    if (index === 0) {
      return <Circle className="h-6 w-6 text-primary" />;
    }
    return <Circle className="h-6 w-6 text-gray-400" />;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-success';
    if (rate >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">User Journey Analytics</h1>
          <p className="text-muted-foreground font-sans">
            Track user behavior through the conversion funnel
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Optimize Journey
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Started journey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Converted Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.convertedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Completed journey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Overall Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.overallConversion}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              End-to-end conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Avg Journey Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.averageJourneyTime}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Time to conversion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="steps">Step Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">User Journey Funnel</CardTitle>
              <CardDescription className="font-sans">
                Visual representation of user flow through the conversion process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {journeySteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(index, index === journeySteps.length - 1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium font-sans">{step.name}</h3>
                            <p className="text-sm text-muted-foreground font-sans">
                              {step.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-sans">
                              {step.users.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground font-sans">
                              {step.conversionRate}% conversion
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-primary/100 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${step.conversionRate}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span className="font-sans">Avg time: {step.averageTime}</span>
                          {step.dropoffRate > 0 && (
                            <span className="font-sans text-destructive">
                              {step.dropoffRate}% dropoff
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < journeySteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          <div className="grid gap-4">
            {journeySteps.map((step, index) => (
              <Card key={step.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-sans">{step.name}</CardTitle>
                      <CardDescription className="font-sans">
                        {step.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Step {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Users</p>
                      <p className="text-2xl font-bold font-sans">
                        {step.users.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Conversion Rate</p>
                      <p className={`text-2xl font-bold font-sans ${getConversionColor(step.conversionRate)}`}>
                        {step.conversionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Average Time</p>
                      <p className="text-2xl font-bold font-sans">
                        {step.averageTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-1">Dropoff Rate</p>
                      <p className={`text-2xl font-bold font-sans ${step.dropoffRate > 0 ? 'text-destructive' : 'text-success'}`}>
                        {step.dropoffRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: 'Sign Up',
                      issue: 'High dropoff rate (75%)',
                      suggestion: 'Simplify registration form',
                      impact: 'High',
                      effort: 'Medium'
                    },
                    {
                      step: 'Onboarding',
                      issue: 'Long completion time (8m 45s)',
                      suggestion: 'Add progress indicators',
                      impact: 'Medium',
                      effort: 'Low'
                    },
                    {
                      step: 'First Fleet',
                      issue: 'Low conversion (66.7%)',
                      suggestion: 'Add guided tour',
                      impact: 'High',
                      effort: 'High'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-[0.625rem]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium font-sans">{item.step}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.impact === 'High' ? 'destructive' : item.impact === 'Medium' ? 'default' : 'secondary'}>
                            {item.impact} Impact
                          </Badge>
                          <Badge variant={item.effort === 'High' ? 'destructive' : item.effort === 'Medium' ? 'default' : 'secondary'}>
                            {item.effort} Effort
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans mb-2">
                        <strong>Issue:</strong> {item.issue}
                      </p>
                      <p className="text-sm font-sans">
                        <strong>Suggestion:</strong> {item.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">A/B Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      test: 'Simplified Sign Up Form',
                      step: 'Sign Up',
                      improvement: '+12%',
                      status: 'Completed',
                      confidence: 95
                    },
                    {
                      test: 'Progress Indicators',
                      step: 'Onboarding',
                      improvement: '+8%',
                      status: 'Running',
                      confidence: 78
                    },
                    {
                      test: 'Guided Tour',
                      step: 'First Fleet',
                      improvement: '+15%',
                      status: 'Planned',
                      confidence: 0
                    }
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                      <div>
                        <h3 className="font-medium font-sans">{test.test}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {test.step} • {test.confidence}% confidence
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-sans text-success font-medium">
                          {test.improvement}
                        </p>
                        <Badge variant={test.status === 'Completed' ? 'default' : test.status === 'Running' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


