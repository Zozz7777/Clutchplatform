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
import { handleDataLoadError } from "@/lib/error-handler";
import { formatDate, formatRelativeTime } from "@/lib/utils";

// Import new Phase 2 widgets
import CustomerHealthScore from "@/components/widgets/customer-health-score";
import AtRiskClients from "@/components/widgets/at-risk-clients";
import CSATNPSTrends from "@/components/widgets/csat-nps-trends";
import UpsellOpportunities from "@/components/widgets/upsell-opportunities";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
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
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadCRMData = async () => {
      if (!user || !isMounted) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          // Load real data from API with error handling
          const [customersData, ticketsData] = await Promise.allSettled([
            productionApi.getCustomers(),
            productionApi.getTickets()
          ]);

          // Handle customers data
          const customersArray = customersData.status === 'fulfilled' && Array.isArray(customersData.value) 
            ? customersData.value as unknown as Customer[] 
            : [];
          
          // Handle tickets data
          const ticketsArray = ticketsData.status === 'fulfilled' && Array.isArray(ticketsData.value) 
            ? ticketsData.value as unknown as Ticket[] 
            : [];
          
          if (isMounted) {
            setCustomers(customersArray);
            setTickets(ticketsArray);
            setFilteredCustomers(customersArray);
            setFilteredTickets(ticketsArray);
          }
          
          // Log any errors
          if (customersData.status === 'rejected') {
            handleDataLoadError(customersData.reason, 'customers');
          }
          if (ticketsData.status === 'rejected') {
            handleDataLoadError(ticketsData.reason, 'tickets');
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'crm_data');
        toast.error(t('crm.failedToLoadCrmData') || 'Failed to load CRM data');
        // Set empty arrays on error - no mock data fallback
        setCustomers([]);
        setTickets([]);
        setFilteredCustomers([]);
        setFilteredTickets([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCRMData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, t]);

  useEffect(() => {
    // Ensure customers is always an array
    const customersArray = Array.isArray(customers) ? customers : [];
    let filtered = customersArray;

    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer?.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, statusFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "prospect":
        return "secondary";
      case "inactive":
        return "outline";
      case "unknown":
        return "outline";
      default:
        return "default";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      case "unknown":
        return "outline";
      default:
        return "default";
    }
  };

  const getTicketStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "in_progress":
        return "secondary";
      case "closed":
        return "default";
      case "unknown":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">{t('crm.loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('crm.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('crm.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t('crm.analytics')}
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('crm.addCustomer')}
          </Button>
        </div>
      </div>

      {/* CRM Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('crm.totalCustomers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> {t('crm.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('crm.activeCustomers')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(customers) ? customers.filter(c => c?.status === "active").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> {t('crm.retentionRate')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('crm.openTickets')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(tickets) ? tickets.filter(t => t?.status === "open").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+3</span> {t('crm.fromYesterday')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('crm.avgSatisfaction')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(customers) && customers.filter(c => c?.satisfaction > 0).length > 0 
                ? (customers.filter(c => c?.satisfaction > 0).reduce((acc, c) => acc + (c?.satisfaction || 0), 0) / customers.filter(c => c?.satisfaction > 0).length).toFixed(1)
                : "0.0"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+0.2</span> {t('crm.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CRM Tabs */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">{t('crm.customerProfiles')}</TabsTrigger>
          <TabsTrigger value="tickets">{t('crm.ticketManagement')}</TabsTrigger>
          <TabsTrigger value="communication">{t('crm.communicationHistory')}</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('crm.customerProfiles')}</CardTitle>
              <CardDescription>{t('crm.manageCustomerInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('crm.searchCustomers')}
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
                    <SelectItem value="all">{t('crm.allStatus')}</SelectItem>
                    <SelectItem value="active">{t('crm.active')}</SelectItem>
                    <SelectItem value="prospect">{t('crm.prospect')}</SelectItem>
                    <SelectItem value="inactive">{t('crm.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crm.customer')}</TableHead>
                    <TableHead>{t('crm.company')}</TableHead>
                    <TableHead>{t('crm.status')}</TableHead>
                    <TableHead>{t('crm.totalSpent')}</TableHead>
                    <TableHead>{t('crm.satisfaction')}</TableHead>
                    <TableHead>{t('crm.lastContact')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                            <p className="text-sm font-medium text-foreground">{customer.name || "Unknown Customer"}</p>
                            <p className="text-xs text-muted-foreground">{customer.email || "No email"}</p>
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
                        <Badge variant={getStatusVariant(customer.status || "unknown")}>
                          {customer.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          EGP {(customer.totalSpent || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-warning" />
                          <span className="text-sm text-muted-foreground">
                            {(customer.satisfaction || 0) > 0 ? (customer.satisfaction || 0).toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {customer.lastContact ? formatRelativeTime(customer.lastContact) : "Never"}
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
                            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              {t('crm.viewProfile')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {t('crm.sendMessage')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              {t('crm.callCustomer')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              {t('crm.scheduleMeeting')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Activity className="mr-2 h-4 w-4" />
                              {t('crm.viewActivity')}
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
            <CardTitle className="text-card-foreground">{t('crm.supportTickets')}</CardTitle>
            <CardDescription>{t('crm.manageCustomerSupport')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('crm.ticket')}</TableHead>
                    <TableHead>{t('crm.customer')}</TableHead>
                    <TableHead>{t('crm.status')}</TableHead>
                    <TableHead>{t('crm.priority')}</TableHead>
                    <TableHead>{t('crm.assignedTo')}</TableHead>
                    <TableHead>{t('crm.created')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{ticket.title || "Untitled Ticket"}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description || "No description"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{ticket.customer || "Unknown Customer"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTicketStatusVariant(ticket.status || "unknown")}>
                          {ticket.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority || "unknown")}>
                          {ticket.priority || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{ticket.assignedTo || "Unassigned"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {ticket.createdAt ? formatRelativeTime(ticket.createdAt) : "Unknown"}
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
                            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {t('crm.viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              {t('crm.assignToMe')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('crm.markAsResolved')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              {t('crm.escalate')}
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
              <CardTitle className="text-card-foreground">{t('crm.communicationHistory')}</CardTitle>
              <CardDescription>{t('crm.timelineOfInteractions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{t('crm.phoneCall')} - Ahmed Hassan</p>
                      <span className="text-xs text-muted-foreground">2 {t('crm.hoursAgo')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('crm.discussedFleetFeatures')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{t('crm.email')} - Fatma Mohamed</p>
                      <span className="text-xs text-muted-foreground">1 {t('crm.dayAgo')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('crm.sentMonthlyReport')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{t('crm.meeting')} - Omar Ali</p>
                      <span className="text-xs text-muted-foreground">3 {t('crm.daysAgo')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('crm.productDemoCompleted')}
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('crm.crmAnalytics')}</h2>
            <p className="text-muted-foreground">
              {t('crm.moveBeyondTickets')}
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


