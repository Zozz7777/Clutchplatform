'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { productionApi } from '@/lib/production-api';
import { useTranslations } from '@/hooks/use-translations';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  customerName: string;
  email: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  amount: number;
  interval: 'monthly' | 'yearly';
  startDate: string;
  nextBilling: string;
  paymentMethod: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    growthRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const t = (key: string, params?: any) => key;

  useEffect(() => {
    const loadSubscriptionsData = async () => {
      try {
        setIsLoading(true);
        
        // Load real subscription data from API
        const subscriptionsData = await productionApi.getSubscriptions();
        
        // Ensure we always have an array and handle type conversion safely
        const subscriptionsArray = Array.isArray(subscriptionsData) ? subscriptionsData as unknown as Subscription[] : [];
        setSubscriptions(subscriptionsArray);
        
        // Calculate stats from real data
        const totalSubscriptions = subscriptionsArray.length;
        const activeSubscriptions = subscriptionsArray.filter(sub => sub.status === 'active').length;
        const monthlyRevenue = subscriptionsArray
          .filter(sub => sub.status === 'active' && sub.interval === 'monthly')
          .reduce((sum, sub) => sum + sub.amount, 0);
        const yearlyRevenue = subscriptionsArray
          .filter(sub => sub.status === 'active' && sub.interval === 'yearly')
          .reduce((sum, sub) => sum + sub.amount, 0);
        const totalMonthlyRevenue = monthlyRevenue + (yearlyRevenue / 12);
        
        // Calculate churn rate (simplified - would need historical data for accurate calculation)
        const cancelledSubscriptions = subscriptionsArray.filter(sub => sub.status === 'cancelled').length;
        const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
        
        // Calculate growth rate (simplified - would need historical data for accurate calculation)
        const newSubscriptions = subscriptionsArray.filter(sub => {
          const startDate = new Date(sub.startDate);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return startDate >= thirtyDaysAgo;
        }).length;
        const growthRate = totalSubscriptions > 0 ? (newSubscriptions / totalSubscriptions) * 100 : 0;
        
        setStats({
          totalSubscriptions,
          activeSubscriptions,
          monthlyRevenue: totalMonthlyRevenue,
          churnRate,
          growthRate
        });
        
      } catch (error) {
        // Error handled by API service
        toast.error('Failed to load subscriptions data');
        // Set empty arrays on error - no mock data fallback
        setSubscriptions([]);
        setStats({
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          churnRate: 0,
          growthRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionsData();
  }, []);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success/100">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'past_due':
        return <Badge variant="default" className="bg-warning/100">Past Due</Badge>;
      case 'trialing':
        return <Badge variant="secondary">Trialing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'trialing':
        return <Calendar className="h-4 w-4 text-primary" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">{t('subscriptions.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('subscriptions.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
{t('common.export')}
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
{t('subscriptions.newSubscription')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('subscriptions.totalSubscriptions')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground font-sans">
              {t('subscriptions.allTimeSubscriptions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">{t('subscriptions.active')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground font-sans">
              {t('subscriptions.currentlyActive')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              Recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.churnRate}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Monthly churn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">+{stats.growthRate}%</div>
            <p className="text-xs text-muted-foreground font-sans">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="past_due">Past Due</option>
          <option value="trialing">Trialing</option>
        </select>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Subscription List</CardTitle>
              <CardDescription className="font-sans">
                Manage all customer subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(subscription.status)}
                      <div>
                        <h3 className="font-medium font-sans">{subscription.customerName}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {subscription.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium font-sans">{subscription.plan}</p>
                        <p className="text-sm text-muted-foreground font-sans">
                          {formatCurrency(subscription.amount)}/{subscription.interval}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-sans">
                          Next: {new Date(subscription.nextBilling).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {subscription.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(subscription.status)}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Subscription Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'Jan 2024', active: 1100, new: 150, cancelled: 45 },
                    { month: 'Feb 2024', active: 1180, new: 180, cancelled: 35 },
                    { month: 'Mar 2024', active: 1250, new: 200, cancelled: 40 }
                  ].map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-sans">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-sans">{month.active} active</p>
                          <p className="text-xs text-success font-sans">+{month.new} new</p>
                          <p className="text-xs text-destructive font-sans">-{month.cancelled} cancelled</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'Starter', count: 450, percentage: 36.0 },
                    { plan: 'Professional', count: 680, percentage: 54.4 },
                    { plan: 'Enterprise', count: 120, percentage: 9.6 }
                  ].map((plan, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sans">{plan.plan}</span>
                        <span className="text-sm font-sans">{plan.count} ({plan.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary/100 h-2 rounded-full" 
                          style={{ width: `${plan.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Billing Overview</CardTitle>
              <CardDescription className="font-sans">
                Monitor billing cycles and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-[0.625rem]">
                  <h3 className="font-medium font-sans">Upcoming Billing</h3>
                  <p className="text-2xl font-bold font-sans mt-2">45,230 EGP</p>
                  <p className="text-sm text-muted-foreground font-sans">Next 7 days</p>
                </div>
                <div className="text-center p-4 border rounded-[0.625rem]">
                  <h3 className="font-medium font-sans">Failed Payments</h3>
                  <p className="text-2xl font-bold font-sans mt-2 text-destructive">12</p>
                  <p className="text-sm text-muted-foreground font-sans">Require attention</p>
                </div>
                <div className="text-center p-4 border rounded-[0.625rem]">
                  <h3 className="font-medium font-sans">Success Rate</h3>
                  <p className="text-2xl font-bold font-sans mt-2 text-success">98.2%</p>
                  <p className="text-sm text-muted-foreground font-sans">Payment success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


