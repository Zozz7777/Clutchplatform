"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  UserCheck,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle
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
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: "active" | "inactive" | "pending";
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
  tags: string[];
  notes: string;
}

interface SupportTicket {
  _id: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadCRMData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load customers
        const customersResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/customers", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          setCustomers(customersData.data || customersData);
        }

        // Load support tickets
        const ticketsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/support/tickets", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          setTickets(ticketsData.data || ticketsData);
        }
      } catch (error) {
        console.error("Failed to load CRM data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCRMData();
  }, []);

  useEffect(() => {
    let filteredCust = customers;
    let filteredTick = tickets;

    // Search filter
    if (searchQuery) {
      filteredCust = filteredCust.filter(customer =>
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredTick = filteredTick.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredCust = filteredCust.filter(customer => customer.status === statusFilter);
      filteredTick = filteredTick.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredCustomers(filteredCust);
    setFilteredTickets(filteredTick);
  }, [customers, tickets, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return "success";
      case "inactive":
      case "closed":
        return "destructive";
      case "pending":
      case "in_progress":
        return "warning";
      case "open":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const handleCustomerAction = async (customerId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "activate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/customers/${customerId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active" }),
          });
          break;
        case "deactivate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/customers/${customerId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "inactive" }),
          });
          break;
      }
      
      // Reload customers
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/customers", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} customer:`, error);
    }
  };

  const handleTicketAction = async (ticketId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "assign":
        case "resolve":
        case "close":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/support/tickets/${ticketId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: action === "assign" ? "in_progress" : action }),
          });
          break;
      }
      
      // Reload tickets
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/support/tickets", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} ticket:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Relationship Management</h1>
          <p className="text-muted-foreground">
            Manage customer profiles, support tickets, and interactions
          </p>
        </div>
        {hasPermission("manage_crm") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              +{customers.filter(c => c.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === "open" || t.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tickets.filter(t => t.priority === "urgent").length} urgent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              from {customers.length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              -15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            Manage customer profiles and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {customer.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusColor(customer.status) as any}>
                        {customer.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(customer.totalSpent)} spent
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Joined {formatDate(customer.createdAt)}</p>
                    <p>Last order {formatRelativeTime(customer.lastOrderDate)}</p>
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
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {customer.status === "active" ? (
                        <DropdownMenuItem 
                          onClick={() => handleCustomerAction(customer._id, "deactivate")}
                          className="text-yellow-600"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleCustomerAction(customer._id, "activate")}
                          className="text-green-600"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No customers found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Tickets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            Manage customer support requests and issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">by {ticket.customerName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusColor(ticket.status) as any}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={getPriorityColor(ticket.priority) as any}>
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Created {formatDate(ticket.createdAt)}</p>
                    <p>Updated {formatRelativeTime(ticket.updatedAt)}</p>
                    {ticket.assignedTo && (
                      <p>Assigned to {ticket.assignedTo}</p>
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
                        <MessageSquare className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleTicketAction(ticket._id, "assign")}
                        className="text-blue-600"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Assign to Me
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleTicketAction(ticket._id, "resolve")}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleTicketAction(ticket._id, "close")}
                        className="text-gray-600"
                      >
                        Close Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No support tickets found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
