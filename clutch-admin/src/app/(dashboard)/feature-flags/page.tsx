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
  Flag,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Users,
  Globe,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Target,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import { productionApi } from "@/lib/production-api";

interface FeatureFlag {
  _id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  type: "boolean" | "string" | "number" | "json";
  defaultValue: string | number | boolean;
  currentValue: string | number | boolean;
  environment: "development" | "staging" | "production";
  tags: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: {
    id: string;
    name: string;
    email: string;
  };
  rollout: {
    percentage: number;
    targetUsers: string[];
    targetSegments: string[];
    conditions: Record<string, unknown>;
  };
  analytics: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    lastEvaluated: string;
  };
}

interface ABTest {
  _id: string;
  name: string;
  description: string;
  featureFlagId: string;
  status: "draft" | "running" | "paused" | "completed";
  variants: {
    name: string;
    value: string | number | boolean;
    percentage: number;
    metrics: {
      impressions: number;
      conversions: number;
      conversionRate: number;
    };
  }[];
  startDate: string;
  endDate: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
  results: {
    winner: string;
    confidence: number;
    significance: boolean;
    lift: number;
  };
  createdAt: string;
}

interface Rollout {
  _id: string;
  name: string;
  featureFlagId: string;
  type: "percentage" | "user_list" | "segment" | "geographic";
  status: "scheduled" | "active" | "paused" | "completed";
  target: {
    percentage?: number;
    userIds?: string[];
    segments?: string[];
    countries?: string[];
    regions?: string[];
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  metrics: {
    totalUsers: number;
    exposedUsers: number;
    conversionRate: number;
  };
  createdAt: string;
}

export default function FeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [rollouts, setRollouts] = useState<Rollout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showABTestDialog, setShowABTestDialog] = useState(false);
  const [showRolloutDialog, setShowRolloutDialog] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // Mock data for development
  const mockFeatureFlags: FeatureFlag[] = [
    {
      _id: "1",
      name: "New Dashboard UI",
      key: "new_dashboard_ui",
      description: "Enable the new dashboard user interface design",
      enabled: true,
      type: "boolean",
      defaultValue: false,
      currentValue: true,
      environment: "production",
      tags: ["ui", "dashboard", "frontend"],
      createdBy: {
        id: "1",
        name: "Ahmed Hassan",
        email: "ahmed@yourclutch.com",
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-03-15T14:30:00Z",
      lastModifiedBy: {
        id: "2",
        name: "Fatma Ali",
        email: "fatma@yourclutch.com",
      },
      rollout: {
        percentage: 75,
        targetUsers: [],
        targetSegments: ["premium_users", "beta_testers"],
        conditions: {
          userTier: "premium",
          region: "EG",
        },
      },
      analytics: {
        impressions: 15420,
        conversions: 1236,
        conversionRate: 8.02,
        lastEvaluated: "2024-03-15T14:30:00Z",
      },
    },
    {
      _id: "2",
      name: "AI Recommendations",
      key: "ai_recommendations",
      description: "Enable AI-powered service recommendations",
      enabled: false,
      type: "boolean",
      defaultValue: false,
      currentValue: false,
      environment: "staging",
      tags: ["ai", "recommendations", "ml"],
      createdBy: {
        id: "3",
        name: "Mohamed Ibrahim",
        email: "mohamed@yourclutch.com",
      },
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-03-10T16:45:00Z",
      lastModifiedBy: {
        id: "3",
        name: "Mohamed Ibrahim",
        email: "mohamed@yourclutch.com",
      },
      rollout: {
        percentage: 0,
        targetUsers: [],
        targetSegments: [],
        conditions: {},
      },
      analytics: {
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        lastEvaluated: "2024-03-10T16:45:00Z",
      },
    },
    {
      _id: "3",
      name: "Payment Gateway",
      key: "payment_gateway",
      description: "Switch between payment gateway providers",
      enabled: true,
      type: "string",
      defaultValue: "stripe",
      currentValue: "paymob",
      environment: "production",
      tags: ["payment", "integration", "backend"],
      createdBy: {
        id: "4",
        name: "Nour El-Din",
        email: "nour@yourclutch.com",
      },
      createdAt: "2024-01-20T11:30:00Z",
      updatedAt: "2024-03-12T10:15:00Z",
      lastModifiedBy: {
        id: "4",
        name: "Nour El-Din",
        email: "nour@yourclutch.com",
      },
      rollout: {
        percentage: 100,
        targetUsers: [],
        targetSegments: [],
        conditions: {},
      },
      analytics: {
        impressions: 8930,
        conversions: 1786,
        conversionRate: 20.01,
        lastEvaluated: "2024-03-12T10:15:00Z",
      },
    },
  ];

  const mockABTests: ABTest[] = [
    {
      _id: "1",
      name: "Checkout Button Color",
      description: "Test different button colors for checkout conversion",
      featureFlagId: "1",
      status: "running",
      variants: [
        {
          name: "Control (Blue)",
          value: "#3B82F6",
          percentage: 50,
          metrics: {
            impressions: 1250,
            conversions: 125,
            conversionRate: 10.0,
          },
        },
        {
          name: "Variant A (Green)",
          value: "#10B981",
          percentage: 50,
          metrics: {
            impressions: 1280,
            conversions: 141,
            conversionRate: 11.02,
          },
        },
      ],
      startDate: "2024-03-01T00:00:00Z",
      endDate: "2024-03-31T23:59:59Z",
      successMetric: "checkout_completion",
      minimumSampleSize: 2000,
      confidenceLevel: 95,
      results: {
        winner: "Variant A (Green)",
        confidence: 87.5,
        significance: false,
        lift: 10.2,
      },
      createdAt: "2024-02-25T14:00:00Z",
    },
  ];

  const mockRollouts: Rollout[] = [
    {
      _id: "1",
      name: "New Dashboard - Gradual Rollout",
      featureFlagId: "1",
      type: "percentage",
      status: "active",
      target: {
        percentage: 75,
      },
      schedule: {
        startDate: "2024-03-01T00:00:00Z",
        timezone: "Africa/Cairo",
      },
      metrics: {
        totalUsers: 20000,
        exposedUsers: 15000,
        conversionRate: 8.02,
      },
      createdAt: "2024-02-28T10:00:00Z",
    },
  ];

  useEffect(() => {
    loadFeatureFlags();
    loadABTests();
    loadRollouts();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getFeatureFlags();
      setFeatureFlags(data || mockFeatureFlags);
    } catch (error) {
      console.error("Error loading feature flags:", error);
      setFeatureFlags(mockFeatureFlags);
    } finally {
      setLoading(false);
    }
  };

  const loadABTests = async () => {
    try {
      const data = await hybridApi.getABTests();
      setABTests(data || mockABTests);
    } catch (error) {
      console.error("Error loading A/B tests:", error);
      setABTests(mockABTests);
    }
  };

  const loadRollouts = async () => {
    try {
      const data = await hybridApi.getRollouts();
      setRollouts(data || mockRollouts);
    } catch (error) {
      console.error("Error loading rollouts:", error);
      setRollouts(mockRollouts);
    }
  };

  const toggleFeatureFlag = async (flagId: string, enabled: boolean) => {
    try {
      await productionApi.updateFeatureFlag(flagId, enabled);
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag._id === flagId 
            ? { ...flag, enabled, updatedAt: new Date().toISOString() }
            : flag
        )
      );
    } catch (error) {
      console.error("Error toggling feature flag:", error);
    }
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? "bg-primary/10 text-primary-foreground" : "bg-muted text-muted-foreground";
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "production":
        return "bg-destructive/10 text-destructive-foreground";
      case "staging":
        return "bg-secondary/10 text-secondary-foreground";
      case "development":
        return "bg-secondary/10 text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getABTestStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-primary/10 text-primary-foreground";
      case "paused":
        return "bg-secondary/10 text-secondary-foreground";
      case "completed":
        return "bg-secondary/10 text-secondary-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredFlags = featureFlags.filter((flag) => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "enabled" && flag.enabled) ||
                         (statusFilter === "disabled" && !flag.enabled);
    const matchesEnvironment = environmentFilter === "all" || flag.environment === environmentFilter;
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const totalFlags = featureFlags.length;
  const enabledFlags = featureFlags.filter(f => f.enabled).length;
  const productionFlags = featureFlags.filter(f => f.environment === "production").length;
  const totalImpressions = featureFlags.reduce((sum, f) => sum + f.analytics.impressions, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage feature flags, A/B tests, and gradual rollouts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowRolloutDialog(true)} variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            Create Rollout
          </Button>
          <Button onClick={() => setShowABTestDialog(true)} variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Create A/B Test
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Flag
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlags}</div>
            <p className="text-xs text-muted-foreground">
              {enabledFlags} enabled, {totalFlags - enabledFlags} disabled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Flags</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionFlags}</div>
            <p className="text-xs text-muted-foreground">
              Live in production
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all flags
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {abTests.filter(t => t.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Manage feature toggles and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feature flags..."
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
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("enabled")}>
                  Enabled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("disabled")}>
                  Disabled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Env: {environmentFilter === "all" ? "All" : environmentFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("all")}>
                  All Environments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("production")}>
                  Production
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("staging")}>
                  Staging
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEnvironmentFilter("development")}>
                  Development
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredFlags.map((flag) => (
              <Card key={flag._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{flag.name}</h3>
                        <Badge className={getStatusColor(flag.enabled)}>
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge className={getEnvironmentColor(flag.environment)}>
                          {flag.environment}
                        </Badge>
                        <Badge variant="outline">
                          {flag.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{flag.description}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <code className="bg-gray-100 px-2 py-1 rounded">{flag.key}</code>
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Current Value</p>
                          <p className="text-sm text-muted-foreground">
                            {typeof flag.currentValue === "boolean" 
                              ? flag.currentValue.toString() 
                              : flag.currentValue}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rollout</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.rollout.percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Impressions</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.analytics.impressions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Conversion Rate</p>
                          <p className="text-sm text-muted-foreground">
                            {flag.analytics.conversionRate.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Created by {flag.createdBy.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Last evaluated: {new Date(flag.analytics.lastEvaluated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatureFlag(flag._id, !flag.enabled)}
                      >
                        {flag.enabled ? (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Disable
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Enable
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedFlag(flag)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Flag
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure Rollout
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Flag
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

      {/* A/B Tests */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Tests</CardTitle>
          <CardDescription>
            Monitor and manage A/B testing experiments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {abTests.map((test) => (
              <Card key={test._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                        <Badge className={getABTestStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{test.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Success Metric</p>
                          <p className="text-sm text-muted-foreground">{test.successMetric}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Confidence Level</p>
                          <p className="text-sm text-muted-foreground">{test.confidenceLevel}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sample Size</p>
                          <p className="text-sm text-muted-foreground">
                            {test.variants.reduce((sum, v) => sum + v.metrics.impressions, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.ceil((new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Variants:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {test.variants.map((variant, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{variant.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {variant.metrics.impressions} impressions, {variant.metrics.conversions} conversions
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{variant.metrics.conversionRate.toFixed(2)}%</p>
                                <p className="text-sm text-muted-foreground">{variant.percentage}% traffic</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Detailed Analytics
                        </DropdownMenuItem>
                        {test.status === "running" && (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Test
                          </DropdownMenuItem>
                        )}
                        {test.status === "paused" && (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Test
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Test
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Feature Flag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Feature Flag</DialogTitle>
            <DialogDescription>
              Create a new feature flag to control feature rollouts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Flag Name</Label>
                <Input id="name" placeholder="Enter flag name" />
              </div>
              <div>
                <Label htmlFor="key">Flag Key</Label>
                <Input id="key" placeholder="flag_key_name" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Describe what this flag controls" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="boolean">Boolean</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input id="defaultValue" placeholder="false" />
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="ui, frontend, feature" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Create Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create A/B Test Dialog */}
      <Dialog open={showABTestDialog} onOpenChange={setShowABTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
            <DialogDescription>
              Create a new A/B test to experiment with different variants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="testName">Test Name</Label>
              <Input id="testName" placeholder="Enter test name" />
            </div>
            <div>
              <Label htmlFor="testDescription">Description</Label>
              <Input id="testDescription" placeholder="Describe the test hypothesis" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="featureFlag">Feature Flag</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select feature flag</option>
                  {featureFlags.map((flag) => (
                    <option key={flag._id} value={flag._id}>
                      {flag.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="successMetric">Success Metric</Label>
                <Input id="successMetric" placeholder="conversion_rate" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
              <div>
                <Label htmlFor="confidenceLevel">Confidence Level</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowABTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowABTestDialog(false)}>
              Create Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rollout Dialog */}
      <Dialog open={showRolloutDialog} onOpenChange={setShowRolloutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Rollout</DialogTitle>
            <DialogDescription>
              Create a gradual rollout for a feature flag.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="rolloutName">Rollout Name</Label>
              <Input id="rolloutName" placeholder="Enter rollout name" />
            </div>
            <div>
              <Label htmlFor="rolloutFlag">Feature Flag</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select feature flag</option>
                {featureFlags.map((flag) => (
                  <option key={flag._id} value={flag._id}>
                    {flag.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rolloutType">Rollout Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="percentage">Percentage</option>
                  <option value="user_list">User List</option>
                  <option value="segment">User Segment</option>
                  <option value="geographic">Geographic</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rolloutPercentage">Percentage</Label>
                <Input id="rolloutPercentage" type="number" min="0" max="100" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rolloutStart">Start Date</Label>
                <Input id="rolloutStart" type="datetime-local" />
              </div>
              <div>
                <Label htmlFor="rolloutEnd">End Date (Optional)</Label>
                <Input id="rolloutEnd" type="datetime-local" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRolloutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRolloutDialog(false)}>
              Create Rollout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
