"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { 
  Brain, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Play,
  Pause,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Shield,
  Database,
  Cpu,
  Layers,
  GitBranch
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIModel {
  _id: string;
  name: string;
  type: "fraud_detection" | "recommendation" | "predictive" | "nlp" | "computer_vision" | "anomaly_detection";
  status: "training" | "active" | "inactive" | "error" | "deployed";
  version: string;
  accuracy: number;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    latency: number;
  };
  trainingData: {
    size: number;
    lastUpdated: string;
    quality: "excellent" | "good" | "fair" | "poor";
  };
  deployment: {
    environment: "production" | "staging" | "development";
    instances: number;
    lastDeployed: string;
    uptime: number;
  };
  metrics: {
    predictions: number;
    accuracy: number;
    falsePositives: number;
    falseNegatives: number;
  };
  createdAt: string;
  updatedAt: string;
  description: string;
  tags: string[];
}

interface MLExperiment {
  _id: string;
  name: string;
  status: "running" | "completed" | "failed" | "paused";
  algorithm: string;
  dataset: string;
  progress: number;
  startTime: string;
  endTime?: string;
  metrics: {
    accuracy: number;
    loss: number;
    validationAccuracy: number;
  };
  hyperparameters: Record<string, any>;
  results: {
    bestModel: string;
    performance: number;
    insights: string[];
  };
  createdBy: string;
}

interface AIInsight {
  _id: string;
  title: string;
  type: "anomaly" | "trend" | "prediction" | "recommendation" | "alert";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  confidence: number;
  impact: string;
  actionRequired: boolean;
  createdAt: string;
  status: "new" | "reviewed" | "actioned" | "dismissed";
  relatedModel: string;
  data: Record<string, any>;
}

interface AIStats {
  totalModels: number;
  activeModels: number;
  totalPredictions: number;
  averageAccuracy: number;
  totalExperiments: number;
  runningExperiments: number;
  insightsGenerated: number;
  criticalAlerts: number;
}

export default function AIMLPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [experiments, setExperiments] = useState<MLExperiment[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"models" | "experiments" | "insights">("models");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadAIMLData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load AI models
        const modelsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/models", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          setModels(modelsData.data || modelsData);
        }

        // Load ML experiments
        const experimentsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/experiments", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (experimentsResponse.ok) {
          const experimentsData = await experimentsResponse.json();
          setExperiments(experimentsData.data || experimentsData);
        }

        // Load AI insights
        const insightsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/insights", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setInsights(insightsData.data || insightsData);
        }

        // Load AI stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/stats", {
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
          const totalModels = models.length;
          const activeModels = models.filter(m => m.status === "active").length;
          const totalPredictions = models.reduce((sum, m) => sum + m.metrics.predictions, 0);
          const averageAccuracy = models.length > 0 
            ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length 
            : 0;
          const totalExperiments = experiments.length;
          const runningExperiments = experiments.filter(e => e.status === "running").length;
          const insightsGenerated = insights.length;
          const criticalAlerts = insights.filter(i => i.severity === "critical").length;

          setStats({
            totalModels,
            activeModels,
            totalPredictions,
            averageAccuracy,
            totalExperiments,
            runningExperiments,
            insightsGenerated,
            criticalAlerts,
          });
        }
      } catch (error) {
        console.error("Failed to load AI/ML data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAIMLData();
  }, []);

  useEffect(() => {
    let filtered = models;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(model => model.status === statusFilter);
    }

    setFilteredModels(filtered);
  }, [models, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "success";
      case "training":
      case "running":
        return "warning";
      case "inactive":
      case "paused":
        return "default";
      case "error":
      case "failed":
        return "destructive";
      case "deployed":
        return "info";
      default:
        return "default";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fraud_detection":
        return <Shield className="h-4 w-4" />;
      case "recommendation":
        return <Target className="h-4 w-4" />;
      case "predictive":
        return <TrendingUp className="h-4 w-4" />;
      case "nlp":
        return <Brain className="h-4 w-4" />;
      case "computer_vision":
        return <Eye className="h-4 w-4" />;
      case "anomaly_detection":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const handleModelAction = async (modelId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "deploy":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/models/${modelId}/deploy`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "stop":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/models/${modelId}/stop`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "retrain":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/models/${modelId}/retrain`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload models
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/models", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} model:`, error);
    }
  };

  const handleExperimentAction = async (experimentId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "start":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/experiments/${experimentId}/start`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "pause":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/experiments/${experimentId}/pause`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
        case "stop":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/ai/experiments/${experimentId}/stop`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload experiments
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/ai/experiments", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExperiments(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} experiment:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI/ML data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI & ML Dashboard</h1>
          <p className="text-muted-foreground">
            Manage machine learning models, experiments, and AI insights
          </p>
        </div>
        {hasPermission("manage_ai_models") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Model
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Experiment
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeModels : models.filter(m => m.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.totalModels : models.length} total models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalPredictions.toLocaleString() : 
                models.reduce((sum, m) => sum + m.metrics.predictions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All time predictions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? (stats.averageAccuracy * 100).toFixed(1) : 
                models.length > 0 ? (models.reduce((sum, m) => sum + m.accuracy, 0) / models.length * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model performance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Experiments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.runningExperiments : experiments.filter(e => e.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.totalExperiments : experiments.length} total experiments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "models" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("models")}
        >
          <Brain className="mr-2 h-4 w-4" />
          Models
        </Button>
        <Button
          variant={activeTab === "experiments" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("experiments")}
        >
          <GitBranch className="mr-2 h-4 w-4" />
          Experiments
        </Button>
        <Button
          variant={activeTab === "insights" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("insights")}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Insights
        </Button>
      </div>

      {/* Models Tab */}
      {activeTab === "models" && (
        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>
              Manage and monitor machine learning models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search models..."
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
                <option value="training">Training</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
                <option value="deployed">Deployed</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredModels.map((model) => (
                <div key={model._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(model.type)}
                      <Brain className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(model.status) as any}>
                          {model.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          v{model.version}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(model.accuracy * 100).toFixed(1)}% accuracy
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {model.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Predictions: {model.metrics.predictions.toLocaleString()}</p>
                      <p>Latency: {model.performance.latency}ms</p>
                      <p>Uptime: {model.deployment.uptime}%</p>
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
                          View Metrics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {model.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleModelAction(model._id, "stop")}
                            className="text-red-600"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Stop Model
                          </DropdownMenuItem>
                        )}
                        {model.status === "inactive" && (
                          <DropdownMenuItem 
                            onClick={() => handleModelAction(model._id, "deploy")}
                            className="text-green-600"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Deploy Model
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleModelAction(model._id, "retrain")}
                          className="text-blue-600"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Retrain Model
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No models found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experiments Tab */}
      {activeTab === "experiments" && (
        <Card>
          <CardHeader>
            <CardTitle>ML Experiments</CardTitle>
            <CardDescription>
              Track machine learning experiments and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experiments.map((experiment) => (
                <div key={experiment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{experiment.name}</p>
                      <p className="text-sm text-muted-foreground">{experiment.algorithm} • {experiment.dataset}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(experiment.status) as any}>
                          {experiment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(experiment.progress * 100).toFixed(0)}% complete
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(experiment.metrics.accuracy * 100).toFixed(1)}% accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Started: {formatDate(experiment.startTime)}</p>
                      {experiment.endTime && (
                        <p>Ended: {formatDate(experiment.endTime)}</p>
                      )}
                      <p>Created by: {experiment.createdBy}</p>
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
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Metrics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {experiment.status === "paused" && (
                          <DropdownMenuItem 
                            onClick={() => handleExperimentAction(experiment._id, "start")}
                            className="text-green-600"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {experiment.status === "running" && (
                          <DropdownMenuItem 
                            onClick={() => handleExperimentAction(experiment._id, "pause")}
                            className="text-yellow-600"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {experiment.status === "running" && (
                          <DropdownMenuItem 
                            onClick={() => handleExperimentAction(experiment._id, "stop")}
                            className="text-red-600"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Stop
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {experiments.length === 0 && (
              <div className="text-center py-8">
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No experiments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>
              AI-generated insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getSeverityColor(insight.severity) as any}>
                          {insight.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                        {insight.actionRequired && (
                          <Badge variant="warning" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created: {formatDate(insight.createdAt)}</p>
                      <p>Status: {insight.status}</p>
                      <p>Model: {insight.relatedModel}</p>
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
                          View Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Reviewed
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Take Action
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {insights.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No insights available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
