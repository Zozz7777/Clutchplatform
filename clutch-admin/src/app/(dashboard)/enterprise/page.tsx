"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
// Translation system removed - using hardcoded strings
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Users,
  Car,
  Settings,
  Shield,
  BarChart3,
  Globe,
  Key,
  Database,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Download,
  Send,
  UserPlus,
  CarIcon,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnterpriseClient {
  _id: string;
  companyName: string;
  industry: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  status: "active" | "inactive" | "pending" | "suspended";
  tier: "basic" | "professional" | "enterprise" | "custom";
  contactInfo: {
    primaryContact: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    monthlyFee: number;
    currency: string;
    autoRenewal: boolean;
  };
  fleet: {
    totalVehicles: number;
    activeVehicles: number;
    managedVehicles: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
  };
  api: {
    enabled: boolean;
    rateLimit: number;
    usage: number;
    lastUsed: string;
  };
  whiteLabel: {
    enabled: boolean;
    domain: string;
    branding: {
      logo: string;
      colors: string[];
      customCss: string;
    };
  };
  createdAt: string;
  lastActivity: string;
  tags: string[];
  notes: string;
}

interface EnterpriseStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageFleetSize: number;
  totalVehicles: number;
  apiUsage: number;
  whiteLabelClients: number;
}

export default function EnterprisePage() {
  const [clients, setClients] = useState<EnterpriseClient[]>([]);
  const [stats, setStats] = useState<EnterpriseStats | null>(null);
  const [filteredClients, setFilteredClients] = useState<EnterpriseClient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  // Translation system removed - using hardcoded strings

  useEffect(() => {
    const loadEnterpriseData = async () => {
      try {
        setIsLoading(true);
        
        // Load enterprise clients and stats using production API
        const [clientsData, statsData] = await Promise.all([
          productionApi.getEnterpriseClients(),
          productionApi.getEnterpriseStats()
        ]);

        // Ensure clients is always an array
        const clientsArray = Array.isArray(clientsData) ? clientsData : [];
        setClients(clientsArray as unknown as EnterpriseClient[]);

        if (statsData) {
          setStats(statsData as unknown as EnterpriseStats);
        } else {
          // Calculate stats from loaded data with array safety
          const totalClients = clientsArray.length;
          const activeClients = clientsArray.filter(c => c.status === "active").length;
          const totalRevenue = clientsArray.reduce((sum, c) => sum + ((c as any).subscription?.monthlyFee || 0), 0);
          const totalVehicles = clientsArray.reduce((sum, c) => sum + ((c as any).fleet?.totalVehicles || 0), 0);
          const averageFleetSize = clientsArray.length > 0 ? totalVehicles / clientsArray.length : 0;
          const whiteLabelClients = clientsArray.filter(c => (c as any).whiteLabel?.enabled).length;

          setStats({
            totalClients,
            activeClients,
            totalRevenue,
            monthlyRecurringRevenue: totalRevenue,
            averageFleetSize,
            totalVehicles,
            apiUsage: clientsArray.reduce((sum, c) => sum + ((c as any).api?.usage || 0), 0),
            whiteLabelClients,
          });
        }
        
      } catch (error) {
        // Error handled by API service
        toast.error("Failed to load enterprise data");
        // Set empty arrays on error - no mock data fallback
        setClients([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnterpriseData();
  }, []);

  useEffect(() => {
    // Ensure clients is always an array
    let filtered = Array.isArray(clients) ? clients : [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactInfo?.primaryContact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(client => client.tier === tierFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, statusFilter, tierFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "destructive";
      case "pending":
        return "warning";
      case "suspended":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return "success";
      case "professional":
        return "info";
      case "basic":
        return "default";
      case "custom":
        return "warning";
      default:
        return "default";
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case "enterprise":
        return "success";
      case "large":
        return "info";
      case "medium":
        return "warning";
      case "small":
        return "default";
      case "startup":
        return "default";
      default:
        return "default";
    }
  };

  const handleClientAction = async (clientId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "activate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/enterprise/clients/${clientId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active" }),
          });
          break;
        case "suspend":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/enterprise/clients/${clientId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "suspended" }),
          });
          break;
        case "upgrade":
          // This would open an upgrade modal
          break;
        case "enable_whitelabel":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/enterprise/clients/${clientId}/whitelabel`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload clients
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/enterprise/clients", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.data || data);
      }
    } catch (error) {
      // Error handled by API service
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise B2B</h1>
          <p className="text-muted-foreground">
            Manage enterprise clients, multi-tenant operations, and white-label solutions
          </p>
        </div>
        {hasPermission("manage_enterprise") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalClients : (Array.isArray(clients) ? clients.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.activeClients : (Array.isArray(clients) ? clients.filter(c => c.status === "active").length : 0)} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.monthlyRecurringRevenue) : 
                formatCurrency(Array.isArray(clients) ? clients.reduce((sum, c) => sum + (c.subscription?.monthlyFee || 0), 0) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalVehicles : (Array.isArray(clients) ? clients.reduce((sum, c) => sum + (c.fleet?.totalVehicles || 0), 0) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">White-Label Clients</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.whiteLabelClients : (Array.isArray(clients) ? clients.filter(c => c.whiteLabel?.enabled).length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Custom branding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Clients</CardTitle>
          <CardDescription>
            Manage B2B clients and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search clients..."
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
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-[0.625rem] bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {client.companyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{client.companyName}</p>
                    <p className="text-sm text-muted-foreground">{client.contactInfo.primaryContact} • {client.industry}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusColor(client.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {client.status}
                      </Badge>
                      <Badge variant={getTierColor(client.tier) as "default" | "secondary" | "destructive" | "outline"}>
                        {client.tier}
                      </Badge>
                      <Badge variant={getSizeColor(client.size) as "default" | "secondary" | "destructive" | "outline"}>
                        {client.size}
                      </Badge>
                      {client.whiteLabel.enabled && (
                        <Badge variant="secondary">
                          <Globe className="mr-1 h-3 w-3" />
                          White-Label
                        </Badge>
                      )}
                      {client.api.enabled && (
                        <Badge variant="secondary">
                          <Key className="mr-1 h-3 w-3" />
                          API
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Fleet: {client.fleet.totalVehicles} vehicles</p>
                    <p>Users: {client.users.total} ({client.users.active} active)</p>
                    <p>Revenue: {formatCurrency(client.subscription.monthlyFee)}/mo</p>
                    <p>Last activity: {formatRelativeTime(client.lastActivity)}</p>
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
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {client.status === "active" && (
                        <DropdownMenuItem 
                          onClick={() => handleClientAction(client._id, "suspend")}
                          className="text-destructive"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Suspend Client
                        </DropdownMenuItem>
                      )}
                      {client.status === "suspended" && (
                        <DropdownMenuItem 
                          onClick={() => handleClientAction(client._id, "activate")}
                          className="text-success"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate Client
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleClientAction(client._id, "upgrade")}
                        className="text-primary"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Upgrade Plan
                      </DropdownMenuItem>
                      {!client.whiteLabel.enabled && (
                        <DropdownMenuItem 
                          onClick={() => handleClientAction(client._id, "enable_whitelabel")}
                          className="text-primary"
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Enable White-Label
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No enterprise clients found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Enterprise Features */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* API Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              API Management
            </CardTitle>
            <CardDescription>
              Monitor API usage and manage access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total API Calls</span>
                <span className="font-medium">
                  {stats ? stats.apiUsage.toLocaleString() : 
                    (Array.isArray(clients) ? clients.reduce((sum, c) => sum + (c.api?.usage || 0), 0) : 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active API Clients</span>
                <span className="font-medium">
                  {Array.isArray(clients) ? clients.filter(c => c.api?.enabled).length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limit Violations</span>
                <span className="font-medium text-destructive">12</span>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage API Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* White-Label Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              White-Label Management
            </CardTitle>
            <CardDescription>
              Configure custom branding and domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">White-Label Clients</span>
                <span className="font-medium">
                  {Array.isArray(clients) ? clients.filter(c => c.whiteLabel?.enabled).length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Domains</span>
                <span className="font-medium">
                  {Array.isArray(clients) ? clients.filter(c => c.whiteLabel?.enabled && c.whiteLabel?.domain).length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Configurations</span>
                <span className="font-medium text-warning">3</span>
              </div>
              <Button className="w-full" variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                Manage White-Label
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


