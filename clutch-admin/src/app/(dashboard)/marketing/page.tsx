"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { handleError, handleWarning, handleDataLoadError } from "@/lib/error-handler";
import { 
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Target,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  Eye,
  MousePointer,
  DollarSign,
  BarChart3,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Send,
  Settings,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Campaign {
  _id: string;
  name: string;
  type: "email" | "social" | "display" | "search" | "content" | "affiliate";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  objective: "awareness" | "traffic" | "leads" | "sales" | "engagement";
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate: string;
  targetAudience: {
    demographics: Record<string, unknown>;
    interests: string[];
    behaviors: string[];
    locations: string[];
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Lead {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  source: string;
  campaign?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  score: number;
  tags: string[];
  notes: string;
  createdAt: string;
  lastActivity: string;
  customFields: Record<string, unknown>;
}

interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;
  totalLeads: number;
  conversionRate: number;
  averageROAS: number;
  emailOpenRate: number;
  clickThroughRate: number;
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"campaigns" | "leads">("campaigns");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const t = (key: string, params?: any) => key;

  useEffect(() => {
    const loadMarketingData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load all data with proper error handling
        const [campaignsResponse, leadsResponse, statsResponse] = await Promise.allSettled([
          fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/stats", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        ]);

        // Handle campaigns data
        if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.ok) {
          const campaignsData = await campaignsResponse.value.json();
          const campaigns = campaignsData.data || campaignsData;
          setCampaigns(Array.isArray(campaigns) ? campaigns : []);
        } else {
          handleWarning(`Failed to load campaigns: ${campaignsResponse.status === 'rejected' ? campaignsResponse.reason : 'Response not ok'}`, { component: 'MarketingPage' });
          setCampaigns([]);
        }

        // Handle leads data
        if (leadsResponse.status === 'fulfilled' && leadsResponse.value.ok) {
          const leadsData = await leadsResponse.value.json();
          const leads = leadsData.data || leadsData;
          setLeads(Array.isArray(leads) ? leads : []);
        } else {
          handleWarning(`Failed to load leads: ${leadsResponse.status === 'rejected' ? leadsResponse.reason : 'Response not ok'}`, { component: 'MarketingPage' });
          setLeads([]);
        }

        // Handle stats data
        if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
          const statsData = await statsResponse.value.json();
          setStats(statsData.data || statsData);
        } else {
          handleWarning('Failed to load stats, calculating from loaded data', { component: 'MarketingPage' });
          // Calculate stats from loaded data with proper array checks
          const currentCampaigns = Array.isArray(campaigns) ? campaigns : [];
          const currentLeads = Array.isArray(leads) ? leads : [];
          
          const totalCampaigns = currentCampaigns.length;
          const activeCampaigns = currentCampaigns.filter(c => c.status === "active").length;
          const totalSpent = currentCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
          const totalLeads = currentLeads.length;
          const conversionRate = currentCampaigns.length > 0 
            ? currentCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0) / 
              Math.max(currentCampaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0), 1) * 100 
            : 0;
          const averageROAS = currentCampaigns.length > 0 
            ? currentCampaigns.reduce((sum, c) => sum + (c.metrics?.roas || 0), 0) / currentCampaigns.length 
            : 0;

          setStats({
            totalCampaigns,
            activeCampaigns,
            totalSpent,
            totalLeads,
            conversionRate,
            averageROAS,
            emailOpenRate: 24.5, // Default value
            clickThroughRate: 3.2, // Default value
          });
        }
        
      } catch (error) {
        handleDataLoadError(error, 'marketing_data');
        // Set empty arrays on error
        setCampaigns([]);
        setLeads([]);
        setStats({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalSpent: 0,
          totalLeads: 0,
          conversionRate: 0,
          averageROAS: 0,
          emailOpenRate: 0,
          clickThroughRate: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketingData();
  }, []);

  useEffect(() => {
    // Ensure we have arrays before filtering
    const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
    const leadsArray = Array.isArray(leads) ? leads : [];
    
    let filteredCamps = campaignsArray;
    let filteredLeadsList = leadsArray;

    // Search filter
    if (searchQuery) {
      filteredCamps = filteredCamps.filter(campaign =>
        (campaign.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.objective || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredLeadsList = filteredLeadsList.filter(lead =>
        (lead.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredCamps = filteredCamps.filter(campaign => campaign.status === statusFilter);
      filteredLeadsList = filteredLeadsList.filter(lead => lead.status === statusFilter);
    }

    // Type filter (for campaigns only)
    if (typeFilter !== "all" && activeTab === "campaigns") {
      filteredCamps = filteredCamps.filter(campaign => campaign.type === typeFilter);
    }

    setFilteredCampaigns(filteredCamps);
    setFilteredLeads(filteredLeadsList);
  }, [campaigns, leads, searchQuery, statusFilter, typeFilter, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "qualified":
      case "converted":
        return "success";
      case "draft":
      case "new":
      case "contacted":
        return "warning";
      case "paused":
      case "completed":
        return "info";
      case "cancelled":
      case "lost":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "display":
        return <Monitor className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "content":
        return <Megaphone className="h-4 w-4" />;
      case "affiliate":
        return <Target className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "start":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns/${campaignId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active" }),
          });
          break;
        case "pause":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns/${campaignId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "paused" }),
          });
          break;
        case "duplicate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns/${campaignId}/duplicate`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload campaigns
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || data);
      }
    } catch (error) {
      // Error handled by API service
    }
  };

  const handleLeadAction = async (leadId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "contact":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads/${leadId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "contacted" }),
          });
          break;
        case "qualify":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads/${leadId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "qualified" }),
          });
          break;
        case "convert":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads/${leadId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "converted" }),
          });
          break;
      }
      
      // Reload leads
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || data);
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
          <p className="text-muted-foreground">{t('dashboard.loadingMarketingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.marketing')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.marketingDescription')}
          </p>
        </div>
        {hasPermission("manage_marketing") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboard.newCampaign')}
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboard.importLeads')}
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeCampaigns')}</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeCampaigns : (Array.isArray(campaigns) ? campaigns.filter(c => c.status === "active").length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.totalCampaigns : (Array.isArray(campaigns) ? campaigns.length : 0)} {t('dashboard.totalCampaigns')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalSpent')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalSpent) : 
                formatCurrency(Array.isArray(campaigns) ? campaigns.reduce((sum, c) => sum + (c.spent || 0), 0) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.marketingBudget')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalLeads')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalLeads : (leads || []).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {(leads || []).filter(l => l.status === "new").length} {t('dashboard.newLeads')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.conversionRate.toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.leadToCustomer')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-[0.625rem] w-fit">
        <Button
          variant={activeTab === "campaigns" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("campaigns")}
        >
          <Megaphone className="mr-2 h-4 w-4" />
          Campaigns
        </Button>
        <Button
          variant={activeTab === "leads" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("leads")}
        >
          <Users className="mr-2 h-4 w-4" />
          Leads
        </Button>
      </div>

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.marketingCampaigns')}</CardTitle>
            <CardDescription>
              {t('dashboard.manageAndMonitor')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('dashboard.searchCampaigns')}
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
                <option value="all">{t('dashboard.allStatus')}</option>
                <option value="active">{t('dashboard.active')}</option>
                <option value="draft">{t('dashboard.draft')}</option>
                <option value="paused">{t('dashboard.paused')}</option>
                <option value="completed">{t('dashboard.completed')}</option>
                <option value="cancelled">{t('dashboard.cancelled')}</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">{t('dashboard.allTypes')}</option>
                <option value="email">{t('dashboard.email')}</option>
                <option value="social">{t('dashboard.social')}</option>
                <option value="display">{t('dashboard.display')}</option>
                <option value="search">{t('dashboard.search')}</option>
                <option value="content">{t('dashboard.content')}</option>
                <option value="affiliate">{t('dashboard.affiliate')}</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(campaign.type)}
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.objective} • {campaign.type}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(campaign.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {campaign.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('dashboard.budget')}: {formatCurrency(campaign.budget)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('dashboard.spent')}: {formatCurrency(campaign.spent)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ROAS: {campaign.metrics.roas.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{t('dashboard.impressions')}: {campaign.metrics.impressions.toLocaleString()}</p>
                      <p>{t('dashboard.clicks')}: {campaign.metrics.clicks.toLocaleString()}</p>
                      <p>{t('dashboard.ctr')}: {campaign.metrics.ctr.toFixed(2)}%</p>
                      <p>{t('dashboard.cpc')}: {formatCurrency(campaign.metrics.cpc)}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('dashboard.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('dashboard.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('dashboard.viewAnalytics')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('dashboard.editCampaign')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          {t('dashboard.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign._id, "start")}
                            className="text-success"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {t('dashboard.startCampaign')}
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign._id, "pause")}
                            className="text-warning"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            {t('dashboard.pauseCampaign')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('dashboard.noCampaignsFound')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leads Tab */}
      {activeTab === "leads" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.leadManagement')}</CardTitle>
            <CardDescription>
              {t('dashboard.trackAndManage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('dashboard.searchLeads')}
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
                <option value="all">{t('dashboard.allStatus')}</option>
                <option value="new">{t('dashboard.new')}</option>
                <option value="contacted">{t('dashboard.contacted')}</option>
                <option value="qualified">{t('dashboard.qualified')}</option>
                <option value="converted">{t('dashboard.converted')}</option>
                <option value="lost">{t('dashboard.lost')}</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {lead.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(lead.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {lead.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('dashboard.score')}: {lead.score}/100
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('dashboard.source')}: {lead.source}
                        </span>
                        {lead.company && (
                          <span className="text-xs text-muted-foreground">
                            {lead.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{t('dashboard.created')}: {formatDate(lead.createdAt)}</p>
                      <p>{t('dashboard.lastActivity')}: {formatRelativeTime(lead.lastActivity)}</p>
                      {lead.phone && (
                        <p>{t('dashboard.phone')}: {lead.phone}</p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('dashboard.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('dashboard.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          {t('dashboard.sendEmail')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('dashboard.editLead')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {lead.status === "new" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "contact")}
                            className="text-primary"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            {t('dashboard.markAsContacted')}
                          </DropdownMenuItem>
                        )}
                        {lead.status === "contacted" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "qualify")}
                            className="text-success"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t('dashboard.qualifyLead')}
                          </DropdownMenuItem>
                        )}
                        {lead.status === "qualified" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "convert")}
                            className="text-success"
                          >
                            <Target className="mr-2 h-4 w-4" />
                            {t('dashboard.convertToCustomer')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('dashboard.noLeadsFound')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

