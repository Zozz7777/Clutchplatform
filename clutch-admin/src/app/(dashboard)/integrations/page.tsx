"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plug,
  Plus,
  Search,
  Filter,
  Settings,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  Database,
  MessageSquare,
  CreditCard,
  Truck,
  Users,
  BarChart3,
  Shield,
  Key,
  Activity,
} from "lucide-react";
import { hybridApi } from "@/lib/hybrid-api";

interface Integration {
  _id: string;
  name: string;
  description: string;
  type: "payment" | "communication" | "analytics" | "fleet" | "crm" | "database" | "api" | "webhook";
  category: string;
  status: "active" | "inactive" | "error" | "pending" | "maintenance";
  provider: {
    name: string;
    website: string;
    logo?: string;
  };
  configuration: {
    apiKey?: string;
    webhookUrl?: string;
    endpoints: string[];
    rateLimit: number;
    timeout: number;
  };
  health: {
    status: "healthy" | "degraded" | "down";
    lastCheck: string;
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  usage: {
    requestsToday: number;
    requestsThisMonth: number;
    lastUsed: string;
    quota: {
      limit: number;
      used: number;
      resetDate: string;
    };
  };
  security: {
    encryption: boolean;
    authentication: string;
    dataRetention: number;
    compliance: string[];
  };
  logs: {
    total: number;
    errors: number;
    lastError?: {
      message: string;
      timestamp: string;
      severity: "low" | "medium" | "high" | "critical";
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface IntegrationTemplate {
  _id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  provider: string;
  features: string[];
  pricing: {
    model: "free" | "per_request" | "monthly" | "enterprise";
    cost?: number;
    currency?: string;
  };
  documentation: string;
  setupSteps: string[];
  isPopular: boolean;
  rating: number;
  reviewCount: number;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Mock data for development
  const mockIntegrations: Integration[] = [
    {
      _id: "1",
      name: "Paymob Payment Gateway",
      description: "Egyptian payment gateway for processing online payments",
      type: "payment",
      category: "Payment Processing",
      status: "active",
      provider: {
        name: "Paymob",
        website: "https://paymob.com",
        logo: "/logos/paymob.png",
      },
      configuration: {
        apiKey: "pk_test_***",
        endpoints: ["/api/v1/payments", "/api/v1/refunds"],
        rateLimit: 1000,
        timeout: 30000,
      },
      health: {
        status: "healthy",
        lastCheck: "2024-03-15T14:30:00Z",
        responseTime: 245,
        uptime: 99.9,
        errorRate: 0.1,
      },
      usage: {
        requestsToday: 1250,
        requestsThisMonth: 35000,
        lastUsed: "2024-03-15T14:25:00Z",
        quota: {
          limit: 100000,
          used: 35000,
          resetDate: "2024-04-01T00:00:00Z",
        },
      },
      security: {
        encryption: true,
        authentication: "API Key + OAuth",
        dataRetention: 90,
        compliance: ["PCI DSS", "GDPR"],
      },
      logs: {
        total: 35000,
        errors: 35,
        lastError: {
          message: "Timeout on payment processing",
          timestamp: "2024-03-14T16:45:00Z",
          severity: "medium",
        },
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "2",
      name: "Twilio SMS Service",
      description: "SMS and messaging service for notifications",
      type: "communication",
      category: "Messaging",
      status: "active",
      provider: {
        name: "Twilio",
        website: "https://twilio.com",
        logo: "/logos/twilio.png",
      },
      configuration: {
        apiKey: "AC***",
        webhookUrl: "https://api.yourclutch.com/webhooks/twilio",
        endpoints: ["/api/v1/messages", "/api/v1/phone-numbers"],
        rateLimit: 500,
        timeout: 15000,
      },
      health: {
        status: "healthy",
        lastCheck: "2024-03-15T14:30:00Z",
        responseTime: 180,
        uptime: 99.8,
        errorRate: 0.2,
      },
      usage: {
        requestsToday: 850,
        requestsThisMonth: 25000,
        lastUsed: "2024-03-15T14:20:00Z",
        quota: {
          limit: 50000,
          used: 25000,
          resetDate: "2024-04-01T00:00:00Z",
        },
      },
      security: {
        encryption: true,
        authentication: "API Key",
        dataRetention: 30,
        compliance: ["GDPR", "HIPAA"],
      },
      logs: {
        total: 25000,
        errors: 50,
        lastError: {
          message: "Invalid phone number format",
          timestamp: "2024-03-15T10:30:00Z",
          severity: "low",
        },
      },
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "3",
      name: "Google Analytics 4",
      description: "Web analytics service for tracking user behavior",
      type: "analytics",
      category: "Analytics",
      status: "error",
      provider: {
        name: "Google",
        website: "https://analytics.google.com",
        logo: "/logos/google-analytics.png",
      },
      configuration: {
        apiKey: "G-***",
        endpoints: ["/api/v1/data", "/api/v1/reports"],
        rateLimit: 10000,
        timeout: 60000,
      },
      health: {
        status: "down",
        lastCheck: "2024-03-15T14:30:00Z",
        responseTime: 0,
        uptime: 95.2,
        errorRate: 5.8,
      },
      usage: {
        requestsToday: 0,
        requestsThisMonth: 15000,
        lastUsed: "2024-03-14T18:00:00Z",
        quota: {
          limit: 1000000,
          used: 15000,
          resetDate: "2024-04-01T00:00:00Z",
        },
      },
      security: {
        encryption: true,
        authentication: "OAuth 2.0",
        dataRetention: 365,
        compliance: ["GDPR", "CCPA"],
      },
      logs: {
        total: 15000,
        errors: 870,
        lastError: {
          message: "Authentication token expired",
          timestamp: "2024-03-15T12:00:00Z",
          severity: "high",
        },
      },
      createdAt: "2024-01-20T11:30:00Z",
      updatedAt: "2024-03-15T12:00:00Z",
    },
  ];

  const mockTemplates: IntegrationTemplate[] = [
    {
      _id: "1",
      name: "Stripe Payment Gateway",
      description: "Global payment processing with support for multiple currencies",
      type: "payment",
      category: "Payment Processing",
      provider: "Stripe",
      features: ["Credit Cards", "Digital Wallets", "Bank Transfers", "Cryptocurrency"],
      pricing: {
        model: "per_request",
        cost: 0.029,
        currency: "USD",
      },
      documentation: "https://stripe.com/docs",
      setupSteps: [
        "Create Stripe account",
        "Get API keys",
        "Configure webhook endpoints",
        "Test integration",
      ],
      isPopular: true,
      rating: 4.8,
      reviewCount: 1250,
    },
    {
      _id: "2",
      name: "SendGrid Email Service",
      description: "Reliable email delivery service for transactional and marketing emails",
      type: "communication",
      category: "Email",
      provider: "SendGrid",
      features: ["Transactional Email", "Marketing Campaigns", "Email Templates", "Analytics"],
      pricing: {
        model: "monthly",
        cost: 19.95,
        currency: "USD",
      },
      documentation: "https://sendgrid.com/docs",
      setupSteps: [
        "Create SendGrid account",
        "Verify domain",
        "Generate API key",
        "Configure SMTP settings",
      ],
      isPopular: true,
      rating: 4.6,
      reviewCount: 890,
    },
  ];

  useEffect(() => {
    loadIntegrations();
    loadTemplates();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await hybridApi.getIntegrations();
      setIntegrations(data || mockIntegrations);
    } catch (error) {
      console.error("Error loading integrations:", error);
      setIntegrations(mockIntegrations);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await hybridApi.getIntegrationTemplates();
      setTemplates(data || mockTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates(mockTemplates);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "down":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      case "analytics":
        return <BarChart3 className="h-4 w-4" />;
      case "fleet":
        return <Truck className="h-4 w-4" />;
      case "crm":
        return <Users className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "api":
        return <Globe className="h-4 w-4" />;
      case "webhook":
        return <Activity className="h-4 w-4" />;
      default:
        return <Plug className="h-4 w-4" />;
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || integration.type === typeFilter;
    const matchesStatus = statusFilter === "all" || integration.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === "active").length;
  const errorIntegrations = integrations.filter(i => i.status === "error").length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.usage.requestsThisMonth, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage third-party integrations and API connections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowTemplatesDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Browse Templates
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrations} active, {errorIntegrations} with errors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              API calls this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(integrations.reduce((sum, i) => sum + i.health.uptime, 0) / integrations.length || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all integrations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(integrations.reduce((sum, i) => sum + i.health.errorRate, 0) / integrations.length || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Integrations</CardTitle>
          <CardDescription>
            Monitor and manage all your third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Type: {typeFilter === "all" ? "All" : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("payment")}>
                  Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("communication")}>
                  Communication
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("analytics")}>
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("fleet")}>
                  Fleet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("crm")}>
                  CRM
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("error")}>
                  Error
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(integration.type)}
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                        <Badge className={getHealthColor(integration.health.status)}>
                          {integration.health.status}
                        </Badge>
                        <Badge variant="outline">
                          {integration.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{integration.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Provider: <a href={integration.provider.website} className="text-primary hover:underline">{integration.provider.name}</a>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Response Time</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.health.responseTime}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Uptime</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.health.uptime}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Requests Today</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.usage.requestsToday.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Error Rate</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.health.errorRate}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Last check: {new Date(integration.health.lastCheck).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Last used: {new Date(integration.usage.lastUsed).toLocaleString()}</span>
                        </div>
                        {integration.logs.lastError && (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Last error: {new Date(integration.logs.lastError.timestamp).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Key className="mr-2 h-4 w-4" />
                            Manage API Keys
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="mr-2 h-4 w-4" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Security Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Integration
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Integration Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Connect a new third-party service to your platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="integrationName">Integration Name</Label>
                <Input id="integrationName" placeholder="Enter integration name" />
              </div>
              <div>
                <Label htmlFor="integrationType">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="payment">Payment</option>
                  <option value="communication">Communication</option>
                  <option value="analytics">Analytics</option>
                  <option value="fleet">Fleet</option>
                  <option value="crm">CRM</option>
                  <option value="database">Database</option>
                  <option value="api">API</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="integrationDescription">Description</Label>
              <Input id="integrationDescription" placeholder="Integration description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="providerName">Provider Name</Label>
                <Input id="providerName" placeholder="Provider name" />
              </div>
              <div>
                <Label htmlFor="providerWebsite">Provider Website</Label>
                <Input id="providerWebsite" placeholder="https://provider.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input id="apiKey" type="password" placeholder="Enter API key" />
            </div>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
              <Input id="webhookUrl" placeholder="https://api.yourclutch.com/webhooks/..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Integration Templates</DialogTitle>
            <DialogDescription>
              Browse and install pre-configured integrations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {template.provider}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {template.isPopular && (
                          <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                        )}
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{template.rating}</span>
                          <span className="text-xs text-muted-foreground">({template.reviewCount} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pricing</span>
                        <span className="text-sm text-muted-foreground">
                          {template.pricing.model === "free" ? "Free" : 
                           template.pricing.model === "per_request" ? `$${template.pricing.cost}/request` :
                           template.pricing.model === "monthly" ? `$${template.pricing.cost}/month` :
                           "Enterprise"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
