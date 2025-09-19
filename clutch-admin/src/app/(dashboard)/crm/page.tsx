"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Import new Phase 2 widgets
import CustomerHealthScore from "@/components/widgets/customer-health-score";
import AtRiskClients from "@/components/widgets/at-risk-clients";
import CSATNPSTrends from "@/components/widgets/csat-nps-trends";
import UpsellOpportunities from "@/components/widgets/upsell-opportunities";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Activity,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  lastContact: string;
  totalSpent: number;
  satisfaction: number;
  tags: string[];
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  customer: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();

  useEffect(() => {
    const loadCRMData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API
        const [customersData, ticketsData] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getTickets()
        ]);

        setCustomers(customersData || []);
        setTickets(ticketsData || []);
        setFilteredCustomers(customersData || []);
        setFilteredTickets(ticketsData || []);
        
      } catch (error) {
        // Error handled by API service
        toast.error(t('crm.failedToLoadCrmData'));
        // Set empty arrays on error - no mock data fallback
        setCustomers([]);
        setTickets([]);
        setFilteredCustomers([]);
        setFilteredTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCRMData();
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "prospect":
        return "bg-secondary/10 text-secondary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-destructive/10 text-destructive-foreground";
      case "in_progress":
        return "bg-secondary/10 text-secondary-foreground";
      case "closed":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">CRM Dashboard</h1>
          <p className="text-muted-foreground font-sans">
            Manage customer relationships and support tickets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* CRM Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Customers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {customers.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> retention rate
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {tickets.filter(t => t.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+3</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {customers.filter(c => c.satisfaction > 0).length > 0 
                ? (customers.filter(c => c.satisfaction > 0).reduce((acc, c) => acc + c.satisfaction, 0) / customers.filter(c => c.satisfaction > 0).length).toFixed(1)
                : "0.0"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+0.2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CRM Tabs */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">Customer Profiles</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
          <TabsTrigger value="communication">Communication History</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Customer Profiles</CardTitle>
              <CardDescription>Manage customer information and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('crm.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{customer.company || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          EGP {customer.totalSpent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-warning" />
                          <span className="text-sm text-muted-foreground">
                            {customer.satisfaction > 0 ? customer.satisfaction.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(customer.lastContact)}
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
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Activity className="mr-2 h-4 w-4" />
                              View Activity
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

        <TabsContent value="tickets" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Support Tickets</CardTitle>
              <CardDescription>Manage customer support requests and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{ticket.customer}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTicketStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{ticket.assignedTo}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(ticket.createdAt)}
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
                              <MessageSquare className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              Assign to Me
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Escalate
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

        <TabsContent value="communication" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Communication History</CardTitle>
              <CardDescription>Timeline of all customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Phone Call - Ahmed Hassan</p>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discussed fleet management features and pricing options
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Email - Fatma Mohamed</p>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent monthly usage report and recommendations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Meeting - Omar Ali</p>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Product demo and onboarding session completed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2: CRM Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">CRM Analytics</h2>
            <p className="text-muted-foreground">
              Move beyond tickets → predict churn & satisfaction
            </p>
          </div>
        </div>

        {/* Top Row - Health Score & At-Risk */}
        <div className="grid gap-6 md:grid-cols-2">
          <CustomerHealthScore />
          <AtRiskClients />
        </div>

        {/* Second Row - CSAT/NPS & Upsell */}
        <div className="grid gap-6 md:grid-cols-2">
          <CSATNPSTrends />
          <UpsellOpportunities />
        </div>
      </div>
    </div>
  );
}