"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { formatDate, formatRelativeTime, formatCurrency } from "@/lib/utils";
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
  const { t } = useTranslations();

  useEffect(() => {
    const loadMarketingData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load campaigns
        const campaignsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/campaigns", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData.data || campaignsData);
        }

        // Load leads
        const leadsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/leads", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData.data || leadsData);
        }

        // Load marketing stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/marketing/stats", {
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
          const totalCampaigns = campaigns.length;
          const activeCampaigns = campaigns.filter(c => c.status === "active").length;
          const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
          const totalLeads = leads.length;
          const conversionRate = campaigns.length > 0 
            ? campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0) / 
              campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0) * 100 
            : 0;
          const averageROAS = campaigns.length > 0 
            ? campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length 
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
        console.error("Failed to load marketing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketingData();
  }, []);

  useEffect(() => {
    let filteredCamps = campaigns;
    let filteredLeadsList = leads;

    // Search filter
    if (searchQuery) {
      filteredCamps = filteredCamps.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.objective.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredLeadsList = filteredLeadsList.filter(lead =>
        lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
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
      console.error(`Failed to ${action} campaign:`, error);
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
      console.error(`Failed to ${action} lead:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('marketing.title')}</h1>
          <p className="text-muted-foreground">
            {t('marketing.description')}
          </p>
        </div>
        {hasPermission("manage_marketing") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Import Leads
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeCampaigns : campaigns.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.totalCampaigns : campaigns.length} total campaigns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalSpent) : 
                formatCurrency(campaigns.reduce((sum, c) => sum + c.spent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('marketing.marketingBudget')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalLeads : leads.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === "new").length} new leads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.conversionRate.toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lead to customer
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
            <CardTitle>{t('marketing.marketingCampaigns')}</CardTitle>
            <CardDescription>
              {t('marketing.manageAndMonitor')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search campaigns..."
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
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="social">Social</option>
                <option value="display">Display</option>
                <option value="search">Search</option>
                <option value="content">Content</option>
                <option value="affiliate">Affiliate</option>
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
                          Budget: {formatCurrency(campaign.budget)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Spent: {formatCurrency(campaign.spent)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ROAS: {campaign.metrics.roas.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Impressions: {campaign.metrics.impressions.toLocaleString()}</p>
                      <p>Clicks: {campaign.metrics.clicks.toLocaleString()}</p>
                      <p>CTR: {campaign.metrics.ctr.toFixed(2)}%</p>
                      <p>CPC: {formatCurrency(campaign.metrics.cpc)}</p>
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
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign._id, "start")}
                            className="text-success"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Campaign
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign._id, "pause")}
                            className="text-warning"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Campaign
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
                <p className="text-muted-foreground">No campaigns found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leads Tab */}
      {activeTab === "leads" && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Management</CardTitle>
            <CardDescription>
              Track and manage marketing leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads..."
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
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
                          Score: {lead.score}/100
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Source: {lead.source}
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
                      <p>Created: {formatDate(lead.createdAt)}</p>
                      <p>Last activity: {formatRelativeTime(lead.lastActivity)}</p>
                      {lead.phone && (
                        <p>Phone: {lead.phone}</p>
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {lead.status === "new" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "contact")}
                            className="text-primary"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Mark as Contacted
                          </DropdownMenuItem>
                        )}
                        {lead.status === "contacted" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "qualify")}
                            className="text-success"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Qualify Lead
                          </DropdownMenuItem>
                        )}
                        {lead.status === "qualified" && (
                          <DropdownMenuItem 
                            onClick={() => handleLeadAction(lead._id, "convert")}
                            className="text-success"
                          >
                            <Target className="mr-2 h-4 w-4" />
                            Convert to Customer
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
                <p className="text-muted-foreground">No leads found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
