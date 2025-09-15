"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Download,
  Eye,
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

interface Payment {
  _id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  processedAt?: string;
  description: string;
  fees: number;
  netAmount: number;
}

interface Invoice {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overdueInvoices: number;
  averageTransactionValue: number;
  paymentSuccessRate: number;
}

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"payments" | "invoices">("payments");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadFinanceData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load payments
        const paymentsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/payments", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.data || paymentsData);
        }

        // Load invoices
        const invoicesResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/invoices", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setInvoices(invoicesData.data || invoicesData);
        }

        // Load billing stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/finance/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || statsData);
        } else {
          // Calculate stats from loaded data
          const totalRevenue = payments
            .filter(p => p.status === "completed")
            .reduce((sum, p) => sum + p.amount, 0);
          
          const monthlyRevenue = payments
            .filter(p => p.status === "completed" && 
              new Date(p.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .reduce((sum, p) => sum + p.amount, 0);
          
          const pendingPayments = payments.filter(p => p.status === "pending").length;
          const overdueInvoices = invoices.filter(i => 
            i.status === "overdue" || 
            (i.status === "sent" && new Date(i.dueDate) < new Date())
          ).length;
          
          const averageTransactionValue = payments.length > 0 
            ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
            : 0;
          
          const paymentSuccessRate = payments.length > 0 
            ? (payments.filter(p => p.status === "completed").length / payments.length) * 100 
            : 0;

          setStats({
            totalRevenue,
            monthlyRevenue,
            pendingPayments,
            overdueInvoices,
            averageTransactionValue,
            paymentSuccessRate,
          });
        }
      } catch (error) {
        console.error("Failed to load finance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinanceData();
  }, []);

  useEffect(() => {
    let filteredPays = payments;
    let filteredInvs = invoices;

    // Search filter
    if (searchQuery) {
      filteredPays = filteredPays.filter(payment =>
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredInvs = filteredInvs.filter(invoice =>
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredPays = filteredPays.filter(payment => payment.status === statusFilter);
      filteredInvs = filteredInvs.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredPayments(filteredPays);
    setFilteredInvoices(filteredInvs);
  }, [payments, invoices, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "success";
      case "pending":
      case "sent":
        return "warning";
      case "failed":
      case "overdue":
      case "cancelled":
        return "destructive";
      case "refunded":
        return "info";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
      case "sent":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "refunded":
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handlePaymentAction = async (paymentId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "refund":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/payments/${paymentId}/refund`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "retry":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/payments/${paymentId}/retry`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload payments
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/payments", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} payment:`, error);
    }
  };

  const handleInvoiceAction = async (invoiceId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "send":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/invoices/${invoiceId}/send`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "mark_paid":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/invoices/${invoiceId}/mark-paid`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "cancel":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/invoices/${invoiceId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "cancelled" }),
          });
          break;
      }
      
      // Reload invoices
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/invoices", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} invoice:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance & Billing</h1>
          <p className="text-muted-foreground">
            Manage payments, invoices, and financial operations
          </p>
        </div>
        {hasPermission("manage_finance") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.monthlyRevenue) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.pendingPayments : payments.filter(p => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.overdueInvoices : invoices.filter(i => i.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "payments" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("payments")}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Payments
        </Button>
        <Button
          variant={activeTab === "invoices" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("invoices")}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Invoices
        </Button>
      </div>

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              Monitor and manage payment processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.customerName}</p>
                      <p className="text-sm text-muted-foreground">{payment.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(payment.status) as any}>
                          {payment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {payment.paymentMethod}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {payment.transactionId}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        Net: {formatCurrency(payment.netAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {payment.status === "failed" && (
                          <DropdownMenuItem 
                            onClick={() => handlePaymentAction(payment._id, "retry")}
                            className="text-blue-600"
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Retry Payment
                          </DropdownMenuItem>
                        )}
                        {payment.status === "completed" && (
                          <DropdownMenuItem 
                            onClick={() => handlePaymentAction(payment._id, "refund")}
                            className="text-red-600"
                          >
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Process Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Manage customer invoices and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invoice.status)}
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.customerName}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{invoice.invoiceNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Due: {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        Issued: {formatDate(invoice.issuedDate)}
                      </p>
                      {invoice.paidDate && (
                        <p className="text-xs text-muted-foreground">
                          Paid: {formatDate(invoice.paidDate)}
                        </p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleInvoiceAction(invoice._id, "send")}
                            className="text-blue-600"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Invoice
                          </DropdownMenuItem>
                        )}
                        {invoice.status === "sent" && (
                          <DropdownMenuItem 
                            onClick={() => handleInvoiceAction(invoice._id, "mark_paid")}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <DropdownMenuItem 
                            onClick={() => handleInvoiceAction(invoice._id, "cancel")}
                            className="text-red-600"
                          >
                            Cancel Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
