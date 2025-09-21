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
import { useTranslations } from "@/hooks/use-translations";
import { productionApi } from "@/lib/production-api";
import { paymentService } from "@/lib/payment-service";

// Import new Phase 2 widgets
import RevenueExpenses from "@/components/widgets/revenue-expenses";
import ARPUARPPU from "@/components/widgets/arpu-arppu";
import CashFlowProjection from "@/components/widgets/cash-flow-projection";
import OverdueInvoices from "@/components/widgets/overdue-invoices";
import { toast } from "sonner";
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
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Payment {
  id: string;
  customer: string;
  amount: number;
  status: string;
  method: string;
  date: string;
  description: string;
}

interface Subscription {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: string;
  nextBilling: string;
  autoRenew: boolean;
}

interface Payout {
  id: string;
  recipient: string;
  amount: number;
  status: string;
  date: string;
  method: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerId: string;
}

interface RefundData {
  reason: string;
  amount?: number;
}

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();

  // Payment processing functions
  const handleProcessPayment = async (paymentData: Record<string, unknown>) => {
    try {
      const result = await paymentService.processPayment(paymentData as unknown as PaymentData);
      if (result.success) {
        // Refresh the payments list
        const updatedPayments = await productionApi.getPayments();
        setPayments((updatedPayments || []) as unknown as Payment[]);
        setFilteredPayments((updatedPayments || []) as unknown as Payment[]);
      }
    } catch (error) {
      // Error handled by payment service
    }
  };

  const handleRefundPayment = async (paymentId: string, refundData: Record<string, unknown>) => {
    try {
      const result = await paymentService.refundPayment(paymentId, refundData as unknown as RefundData);
      if (result.success) {
        // Refresh the payments list
        const updatedPayments = await productionApi.getPayments();
        setPayments((updatedPayments || []) as unknown as Payment[]);
        setFilteredPayments((updatedPayments || []) as unknown as Payment[]);
      }
    } catch (error) {
      // Error handled by payment service
    }
  };

  const handleCreatePayment = async () => {
    // This would open a payment creation dialog
    toast.info(t('finance.paymentCreationDialog'));
  };

  const handleExportPayments = async () => {
    try {
      // Export payments data
      const paymentsData = payments.map(payment => ({
        ID: payment.id,
        Customer: payment.customer,
        Amount: payment.amount,
        Status: payment.status,
        Method: payment.method,
        Date: payment.date,
        Description: payment.description
      }));

      const csvContent = [
        Object.keys(paymentsData[0] || {}).join(','),
        ...paymentsData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('dashboard.paymentsExportedSuccessfully'));
    } catch (error) {
      // Error handled by API service
      toast.error(t('finance.failedToExportPayments'));
    }
  };

  useEffect(() => {
    const loadFinanceData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API
        const [paymentsData, subscriptionsData, payoutsData] = await Promise.all([
          productionApi.getPayments(),
          productionApi.getSubscriptions(),
          productionApi.getPayouts()
        ]);

        setPayments((paymentsData || []) as unknown as Payment[]);
        setSubscriptions((subscriptionsData || []) as unknown as Subscription[]);
        setPayouts((payoutsData || []) as unknown as Payout[]);
        setFilteredPayments((paymentsData || []) as unknown as Payment[]);
        
      } catch (error) {
        // Error handled by API service
        toast.error(t('finance.failedToLoadFinanceData'));
        // Set empty arrays on error - no mock data fallback
        setPayments([]);
        setSubscriptions([]);
        setPayouts([]);
        setFilteredPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinanceData();
  }, []);

  useEffect(() => {
    const paymentsArray = Array.isArray(payments) ? payments : [];
    let filtered = paymentsArray;

    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment?.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment?.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary-foreground";
      case "pending":
        return "bg-secondary/10 text-secondary-foreground";
      case "failed":
        return "bg-destructive/10 text-destructive-foreground";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-secondary" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
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

  const paymentsArray = Array.isArray(payments) ? payments : [];
  const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];
  
  const totalRevenue = paymentsArray.filter(p => p?.status === "completed").reduce((sum, p) => sum + (p?.amount || 0), 0);
  const pendingPayments = paymentsArray.filter(p => p?.status === "pending").reduce((sum, p) => sum + (p?.amount || 0), 0);
  const activeSubscriptions = subscriptionsArray.filter(s => s?.status === "active").length;
  const monthlyRecurring = subscriptionsArray.filter(s => s?.status === "active").reduce((sum, s) => sum + (s?.amount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('finance.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('finance.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Download className="mr-2 h-4 w-4" />
            {t('finance.exportReport')}
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('finance.processPayment')}
          </Button>
        </div>
      </div>

      {/* Revenue Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('finance.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+15%</span> {t('finance.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('finance.pendingPayments')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(pendingPayments)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary">{paymentsArray.filter(p => p?.status === "pending").length}</span> payments
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('finance.activeSubscriptions')}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+8%</span> retention rate
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('finance.monthlyRecurring')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(monthlyRecurring)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+12%</span> growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Charts Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.revenueTrends')}</CardTitle>
            <CardDescription>{t('dashboard.monthlyRevenueOverTime')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-[0.625rem] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('dashboard.revenueChartWillBeDisplayed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-[0.625rem] flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Payment methods chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payment Queue</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Payment Queue</CardTitle>
              <CardDescription>Manage incoming and outgoing payments</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('finance.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">ID: {payment.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{payment.customer}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {payment.method === 'Credit Card' ? (
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Banknote className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">{payment.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(payment.date)}
                        </span>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Receipt className="mr-2 h-4 w-4" />
                              Generate Receipt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Refund Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Subscriptions</CardTitle>
              <CardDescription>Manage customer subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Auto Renew</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">{subscription.customer}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscription.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(subscription.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(subscription.nextBilling)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscription.autoRenew ? "default" : "secondary"}>
                          {subscription.autoRenew ? t('finance.yes') : t('finance.no')}
                        </Badge>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Payouts</CardTitle>
              <CardDescription>Manage payouts to service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">{payout.recipient}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(payout.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Banknote className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{payout.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payout.status)}
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(payout.date)}
                        </span>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Upload className="mr-2 h-4 w-4" />
                              Process Payout
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Billing Management</CardTitle>
              <CardDescription>Hold or clear payments, manage billing cycles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Payment Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start shadow-2xs">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('finance.clearPendingPayments')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start shadow-2xs">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {t('dashboard.holdSuspiciousPayments')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start shadow-2xs">
                      <Download className="mr-2 h-4 w-4" />
                      Export Billing Report
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Billing Settings</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start shadow-2xs">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Billing Cycles
                    </Button>
                    <Button variant="outline" className="w-full justify-start shadow-2xs">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Button>
                    <Button variant="outline" className="w-full justify-start shadow-2xs">
                      <Receipt className="mr-2 h-4 w-4" />
                      Invoice Templates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2: Financial Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Financial Analytics</h2>
            <p className="text-muted-foreground">
              Make revenue actionable & contextualized
            </p>
          </div>
        </div>

        {/* Top Row - Revenue & ARPU */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RevenueExpenses className="lg:col-span-2" />
          <ARPUARPPU />
        </div>

        {/* Second Row - Cash Flow & Overdue */}
        <div className="grid gap-6 md:grid-cols-2">
          <CashFlowProjection />
          <OverdueInvoices />
        </div>
      </div>
    </div>
  );
}