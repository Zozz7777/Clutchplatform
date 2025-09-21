'use client';

import { useState, useEffect } from 'react';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';
import { useTranslations } from '@/hooks/use-translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Check,
  X,
  Edit,
  Plus,
  BarChart3
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular: boolean;
  customers: number;
  revenue: number;
}

export default function PricingPage() {
  const { t } = useTranslations();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    averagePrice: 0,
    conversionRate: 0,
    churnRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setIsLoading(true);
        
        // Load real pricing plans data from API
        const plansData = await productionApi.getPricingPlans();
        setPlans(plansData || []);
        
        // Load analytics data
        const analyticsData = await productionApi.getPricingAnalytics();
        setAnalytics(analyticsData || {
          totalRevenue: 0,
          averagePrice: 0,
          conversionRate: 0,
          churnRate: 0
        });
        
      } catch (error) {
        toast.error('Failed to load pricing data');
        // Set empty data on error - no mock data fallback
        setPlans([]);
        setAnalytics({
          totalRevenue: 0,
          averagePrice: 0,
          conversionRate: 0,
          churnRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Pricing Management</h1>
          <p className="text-muted-foreground font-sans">
            Manage pricing plans and analyze pricing performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">{t('pricing.plans')}</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="experiments">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'border-blue-500 shadow-lg' : ''}>
                {plan.popular && (
                  <div className="bg-primary/100 text-white text-center py-2 text-sm font-medium font-sans">
{t('pricing.mostPopular')}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-sans">{plan.name}</CardTitle>
                    <Badge variant="outline">
                      {plan.customers} customers
                    </Badge>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold font-sans">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-muted-foreground font-sans">
                      /{plan.interval}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-sans mb-2">Features:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-success" />
                          <span className="text-sm font-sans">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-sans">{t('pricing.monthlyRevenue')}:</span>
                      <span className="font-sans font-medium">
                        {formatCurrency(plan.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button className="flex-1">
                      Edit Plan
                    </Button>
                    <Button variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('pricing.totalRevenue')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(analytics.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
{t('pricing.monthlyRecurringRevenue')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('pricing.averagePrice')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(analytics.averagePrice)}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Per customer per month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('pricing.conversionRate')}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {analytics.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Trial to paid conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('pricing.churnRate')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {analytics.churnRate}%
                </div>
                <p className="text-xs text-muted-foreground font-sans">
{t('pricing.monthlyChurnRate')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Plan Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium font-sans">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {plan.customers} customers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium font-sans">
                          {formatCurrency(plan.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground font-sans">
                          {formatCurrency(plan.price)}/month
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan, index) => {
                    const percentage = (plan.revenue / analytics.totalRevenue) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-sans">{plan.name}</span>
                          <span className="text-sm font-sans">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary/100 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Pricing Experiments</CardTitle>
              <CardDescription className="font-sans">
                A/B tests for pricing optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Professional Plan Price Test',
                    status: 'Running',
                    description: 'Testing 79 EGP vs 89 EGP for Professional plan',
                    startDate: '2024-01-01',
                    participants: 1250,
                    conversionA: 12.3,
                    conversionB: 14.7
                  },
                  {
                    name: 'Starter Plan Feature Test',
                    status: 'Completed',
                    description: 'Testing with/without API access in Starter plan',
                    startDate: '2023-12-01',
                    participants: 800,
                    conversionA: 8.5,
                    conversionB: 11.2
                  }
                ].map((experiment, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium font-sans">{experiment.name}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            {experiment.description}
                          </p>
                        </div>
                        <Badge variant={experiment.status === 'Running' ? 'default' : 'secondary'}>
                          {experiment.status}
                        </Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-sans">Start Date</p>
                          <p className="font-sans">{experiment.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-sans">Participants</p>
                          <p className="font-sans">{experiment.participants}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-sans">Variant A</p>
                          <p className="font-sans">{experiment.conversionA}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-sans">Variant B</p>
                          <p className="font-sans">{experiment.conversionB}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


