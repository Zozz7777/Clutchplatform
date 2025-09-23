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
import { productionApi } from "@/lib/production-api";
import { useLanguage } from "@/contexts/language-context";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

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
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);


  useEffect(() => {
    loadIntegrations();
    loadTemplates();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getIntegrations();
      const integrationsArray = Array.isArray(data) ? data as unknown as Integration[] : [];
      setIntegrations(integrationsArray);
    } catch (error) {
      logger.error("Error loading integrations:", error);
      toast.error(t('dashboard.failedToLoadIntegrations'));
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await productionApi.getIntegrationTemplates();
      const templatesArray = Array.isArray(data) ? data as unknown as IntegrationTemplate[] : [];
      setTemplates(templatesArray);
    } catch (error) {
      logger.error("Error loading templates:", error);
      toast.error(t('dashboard.failedToLoadIntegrationTemplates'));
      setTemplates([]);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "error":
        return "destructive";
      case "pending":
        return "secondary";
      case "maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getHealthVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default";
      case "degraded":
        return "secondary";
      case "down":
        return "destructive";
      default:
        return "outline";
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

  const integrationsArray = Array.isArray(integrations) ? integrations : [];
  const filteredIntegrations = integrationsArray.filter((integration) => {
    const matchesSearch = integration?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration?.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || integration?.type === typeFilter;
    const matchesStatus = statusFilter === "all" || integration?.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIntegrations = integrationsArray.length;
  const activeIntegrations = integrationsArray.filter(i => i?.status === "active").length;
  const errorIntegrations = integrationsArray.filter(i => i?.status === "error").length;
  const totalRequests = integrationsArray.reduce((sum, i) => sum + (i?.usage?.requestsThisMonth || 0), 0);

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
            {t('dashboard.integrationsDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowTemplatesDialog(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.browseTemplates')}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.addIntegration')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalIntegrations')}</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrations} {t('dashboard.active')}, {errorIntegrations} {t('dashboard.activeWithErrors')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.monthlyRequests')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.apiCallsThisMonth')}
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
              {(integrationsArray.length > 0 ? integrationsArray.reduce((sum, i) => sum + (i?.health?.uptime || 0), 0) / integrationsArray.length : 0).toFixed(1)}%
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
              {(integrationsArray.length > 0 ? integrationsArray.reduce((sum, i) => sum + (i?.health?.errorRate || 0), 0) / integrationsArray.length : 0).toFixed(2)}%
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
          <CardTitle>{t('integrations.activeIntegrationsList')}</CardTitle>
          <CardDescription>
            {t('integrations.monitorAndManage')}
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
              <Card key={integration._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(integration.type)}
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        <Badge variant={getStatusVariant(integration.status)}>
                          {integration.status}
                        </Badge>
                        <Badge variant={getHealthVariant(integration.health.status)}>
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
                          <DropdownMenuItem className="text-destructive">
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
              {t('dashboard.addIntegration')}
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
              {Array.isArray(templates) ? templates.map((template) => (
                <Card key={template._id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {template.provider}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {template.isPopular && (
                          <Badge variant="secondary">Popular</Badge>
                        )}
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('integrations.rating')}</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{template.rating}</span>
                          <span className="text-xs text-muted-foreground">({template.reviewCount} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('integrations.pricing')}</span>
                        <span className="text-sm text-muted-foreground">
                          {template.pricing.model === "free" ? t('integrations.free') : 
                           template.pricing.model === "per_request" ? `$${template.pricing.cost}/${t('integrations.perRequest')}` :
                           template.pricing.model === "monthly" ? `$${template.pricing.cost}/${t('integrations.perMonth')}` :
                           t('integrations.enterprise')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button size="sm" variant="outline">
                        {t('integrations.viewDetails')}
                      </Button>
                      <Button size="sm">
                        {t('integrations.install')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
              {t('integrations.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


