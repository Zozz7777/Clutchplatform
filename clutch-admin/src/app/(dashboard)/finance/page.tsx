"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { productionApi } from "@/lib/production-api";
import { paymentService } from "@/lib/payment-service";
import { toast } from "sonner";

// Import new Phase 2 widgets
import RevenueExpenses from "@/components/widgets/revenue-expenses";
import ARPUARPPU from "@/components/widgets/arpu-arppu";
import CashFlowProjection from "@/components/widgets/cash-flow-projection";
import OverdueInvoices from "@/components/widgets/overdue-invoices";

// Define interfaces for merged functionality
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  description: string;
}

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

import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Receipt,
  Download,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  PieChart,
  FileText,
  Send,
  Eye,
  Users,
  Target,
  Check,
  X,
  Edit
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FinancePage() {
  // Main finance state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Additional state for merged functionality
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionSearch, setSubscriptionSearch] = useState("");

  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Load all finance-related data
        const [transactionsData, invoicesData, pricingData, subscriptionsData] = await Promise.allSettled([
          productionApi.getTransactions?.() || Promise.resolve([]),
          productionApi.getInvoices?.() || Promise.resolve([]),
          productionApi.getPricingPlans?.() || Promise.resolve([]),
          productionApi.getSubscriptions?.() || Promise.resolve([])
        ]);

        // Set data
        if (transactionsData.status === 'fulfilled') {
          setTransactions(transactionsData.value || []);
          setFilteredTransactions(transactionsData.value || []);
        }
        if (invoicesData.status === 'fulfilled') {
          setInvoices(invoicesData.value || []);
          setFilteredInvoices(invoicesData.value || []);
        }
        if (pricingData.status === 'fulfilled') setPricingPlans(pricingData.value || []);
        if (subscriptionsData.status === 'fulfilled') {
          setSubscriptions(subscriptionsData.value || []);
          setFilteredSubscriptions(subscriptionsData.value || []);
        }

      } catch (error) {
        toast.error('Failed to load finance data');
        console.error('Error loading finance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    let filtered = transactionsArray.filter(transaction => transaction != null);

    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction && transaction.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction && transaction.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];
    let filtered = subscriptionsArray.filter(subscription => subscription != null);

    if (subscriptionSearch) {
      filtered = filtered.filter(subscription =>
        (subscription.customerName || '').toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        (subscription.email || '').toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        (subscription.plan || '').toLowerCase().includes(subscriptionSearch.toLowerCase())
      );
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, subscriptionSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "pending":
      case "trialing":
        return "bg-secondary/10 text-secondary-foreground";
      case "failed":
      case "cancelled":
        return "bg-muted text-muted-foreground";
      case "overdue":
      case "past_due":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
      case "trialing":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case "overdue":
      case "past_due":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Finance & Revenue</h1>
          <p className="text-muted-foreground font-sans">
            Manage finances, pricing, subscriptions, and revenue analytics
          </p>
        </div>
        {hasPermission("manage_finance") && (
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Analytics Widgets */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <RevenueExpenses />
            <ARPUARPPU />
            <CashFlowProjection />
            <OverdueInvoices />
          </div>

          {/* Finance Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  <span className="text-success">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  <span className="text-destructive">+5.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Active Subscriptions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {subscriptions.filter(s => s.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  {subscriptions.length} total subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Overdue Invoices</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {invoices.filter(i => i.status === 'overdue').length}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  {formatCurrency(invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0))} total
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Transactions</CardTitle>
              <CardDescription>
                Track all income and expense transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transactions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.reference && (
                              <div className="text-sm text-muted-foreground">Ref: {transaction.reference}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{transaction.category}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(transaction.date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Transaction</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete Transaction
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage customer invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customerName}</div>
                            <div className="text-sm text-muted-foreground">{invoice.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(invoice.issueDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(invoice.dueDate)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Invoice</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Cancel Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
              <CardDescription>
                Manage subscription pricing and plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <Card key={plan.id} className={plan.popular ? "ring-2 ring-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {plan.popular && (
                          <Badge className="bg-primary">Popular</Badge>
                        )}
                      </div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.interval}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-success" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{plan.customers} customers</span>
                          <span>{formatCurrency(plan.revenue)} revenue</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage customer subscriptions and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={subscriptionSearch}
                    onChange={(e) => setSubscriptionSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.customerName}</div>
                            <div className="text-sm text-muted-foreground">{subscription.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscription.plan}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(subscription.amount)}/{subscription.interval}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <Badge className={getStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(subscription.nextBilling)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{subscription.paymentMethod}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Update Payment Method</DropdownMenuItem>
                              <DropdownMenuItem>Pause Subscription</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}