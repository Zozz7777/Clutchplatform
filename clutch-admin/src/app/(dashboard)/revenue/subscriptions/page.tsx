'use client';

import { useState } from 'react';
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      customerName: 'John Smith',
      email: 'john@example.com',
      plan: 'Professional',
      status: 'active',
      amount: 79,
      interval: 'monthly',
      startDate: '2024-01-15',
      nextBilling: '2024-02-15',
      paymentMethod: 'Visa **** 4242'
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      email: 'sarah@example.com',
      plan: 'Enterprise',
      status: 'active',
      amount: 199,
      interval: 'monthly',
      startDate: '2024-01-10',
      nextBilling: '2024-02-10',
      paymentMethod: 'Mastercard **** 5555'
    },
    {
      id: '3',
      customerName: 'Mike Wilson',
      email: 'mike@example.com',
      plan: 'Starter',
      status: 'past_due',
      amount: 29,
      interval: 'monthly',
      startDate: '2024-01-05',
      nextBilling: '2024-02-05',
      paymentMethod: 'Visa **** 1234'
    }
  ]);

  const [stats] = useState({
    totalSubscriptions: 1250,
    activeSubscriptions: 1180,
    monthlyRevenue: 90650,
    churnRate: 3.2,
    growthRate: 12.5
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'past_due':
        return <Badge variant="default" className="bg-yellow-500">Past Due</Badge>;
      case 'trialing':
        return <Badge variant="secondary">Trialing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'trialing':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Subscription Management</h1>
          <p className="text-muted-foreground font-sans">
            Manage customer subscriptions and billing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground font-sans">
              All time subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Currently active
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
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                          <p className="text-xs text-green-600 font-sans">+{month.new} new</p>
                          <p className="text-xs text-red-600 font-sans">-{month.cancelled} cancelled</p>
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
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
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-medium font-sans">Upcoming Billing</h3>
                  <p className="text-2xl font-bold font-sans mt-2">$45,230</p>
                  <p className="text-sm text-muted-foreground font-sans">Next 7 days</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-medium font-sans">Failed Payments</h3>
                  <p className="text-2xl font-bold font-sans mt-2 text-red-500">12</p>
                  <p className="text-sm text-muted-foreground font-sans">Require attention</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-medium font-sans">Success Rate</h3>
                  <p className="text-2xl font-bold font-sans mt-2 text-green-500">98.2%</p>
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
