"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";

// Import new Phase 2 widgets
import FraudImpact from "@/components/widgets/fraud-impact";
import RecommendationUplift from "@/components/widgets/recommendation-uplift";
import TrainingROI from "@/components/widgets/training-roi";
import ModelDriftDetector from "@/components/widgets/model-drift-detector";
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
  Target,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Eye,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  XCircle
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
  id: string;
  name: string;
  type: string;
  accuracy: number;
  status: string;
  lastTrained: string;
  predictions: number;
  performance: number;
}

interface FraudCase {
  id: string;
  customer: string;
  amount: number;
  risk: string;
  status: string;
  detectedAt: string;
  description: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  confidence: number;
  impact: string;
  status: string;
  createdAt: string;
}

export default function AIMLPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [fraudCases, setFraudCases] = useState<FraudCase[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const t = useTranslations();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadAIMLData = async () => {
      if (!isMounted) {
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
          const [modelsData, fraudCasesData, recommendationsData] = await Promise.allSettled([
            productionApi.getAIModels(),
            productionApi.getFraudCases(),
            productionApi.getRecommendations()
          ]);

          // Handle models data
          const modelsArray = modelsData.status === 'fulfilled' && Array.isArray(modelsData.value) 
            ? modelsData.value as unknown as AIModel[] 
            : [];
          
          // Handle fraud cases data
          const fraudCasesArray = fraudCasesData.status === 'fulfilled' && Array.isArray(fraudCasesData.value) 
            ? fraudCasesData.value as unknown as FraudCase[] 
            : [];
          
          // Handle recommendations data
          const recommendationsArray = recommendationsData.status === 'fulfilled' && Array.isArray(recommendationsData.value) 
            ? recommendationsData.value as unknown as Recommendation[] 
            : [];
          
          if (isMounted) {
            setModels(modelsArray);
            setFraudCases(fraudCasesArray);
            setRecommendations(recommendationsArray);
            setFilteredModels(modelsArray);
          }
          
          // Log any errors
          if (modelsData.status === 'rejected') {
            console.error('Failed to load AI models:', modelsData.reason);
          }
          if (fraudCasesData.status === 'rejected') {
            console.error('Failed to load fraud cases:', fraudCasesData.reason);
          }
          if (recommendationsData.status === 'rejected') {
            console.error('Failed to load recommendations:', recommendationsData.reason);
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Failed to load AI/ML data:', error);
        toast.error("Failed to load AI/ML data");
        // Set empty arrays on error - no mock data fallback
        setModels([]);
        setFraudCases([]);
        setRecommendations([]);
        setFilteredModels([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAIMLData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    // Ensure models is always an array and handle null/undefined values
    const modelsArray = Array.isArray(models) ? models : [];
    let filtered = modelsArray.filter(model => model != null);

    if (searchQuery) {
      filtered = filtered.filter(model =>
        (model.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model.type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(model => model && model.status === statusFilter);
    }

    setFilteredModels(filtered);
  }, [models, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "training":
        return "bg-secondary/10 text-secondary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "investigating":
        return "bg-secondary/10 text-secondary-foreground";
      case "resolved":
        return "bg-primary/10 text-primary-foreground";
      case "false_positive":
        return "bg-secondary/10 text-secondary-foreground";
      case "pending":
        return "bg-secondary/10 text-secondary-foreground";
      case "implemented":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading AI/ML data...</p>
        </div>
      </div>
    );
  }

  const totalPredictions = Array.isArray(models) ? models.reduce((sum, model) => sum + (model?.predictions || 0), 0) : 0;
  const avgAccuracy = Array.isArray(models) && models.length > 0 ? models.reduce((sum, model) => sum + (model?.accuracy || 0), 0) / models.length : 0;
  const activeModels = Array.isArray(models) ? models.filter(m => m?.status === "active").length : 0;
  const fraudCasesDetected = Array.isArray(fraudCases) ? fraudCases.length : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">AI & ML Dashboard</h1>
          <p className="text-muted-foreground font-sans">
            Manage AI models, predictive analytics, and machine learning features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            Train Model
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{(totalPredictions || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+15%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Average Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{(avgAccuracy || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+2.3%</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('dashboard.activeModels')}</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeModels}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+1</span> new model
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Fraud Cases</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{fraudCasesDetected}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">+3</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI/ML Tabs */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">{t('dashboard.aiModels')}</TabsTrigger>
          <TabsTrigger value="fraud">{t('dashboard.fraudDetection')}</TabsTrigger>
          <TabsTrigger value="recommendations">{t('dashboard.recommendations')}</TabsTrigger>
          <TabsTrigger value="training">{t('dashboard.trainingStatus')}</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.aiModels')}</CardTitle>
              <CardDescription>{t('dashboard.manageAndMonitorModels')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('common.filter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.allStatus')}</SelectItem>
                    <SelectItem value="active">{t('dashboard.active')}</SelectItem>
                    <SelectItem value="training">{t('dashboard.training')}</SelectItem>
                    <SelectItem value="inactive">{t('dashboard.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Models Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Trained</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Brain className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{model.name || 'Unknown Model'}</p>
                            <p className="text-xs text-muted-foreground">{(model.predictions || 0).toLocaleString()} predictions</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.type || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{model.accuracy || 0}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${model.accuracy || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{model.performance || 0}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${model.performance || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {model.lastTrained ? formatRelativeTime(model.lastTrained) : 'Never'}
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
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Start Training
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Model
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export Model
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

        <TabsContent value="fraud" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.fraudDetectionCases')}</CardTitle>
              <CardDescription>{t('dashboard.monitorAndInvestigateFraud')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fraudCases.map((case_) => (
                    <TableRow key={case_.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">Case #{case_.id || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{case_.description || 'No description'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{case_.customer || 'Unknown Customer'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          EGP {(case_.amount || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(case_.risk)}>
                          {case_.risk || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {case_.detectedAt ? formatRelativeTime(case_.detectedAt) : 'Unknown'}
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
                              <Eye className="mr-2 h-4 w-4" />
                              Investigate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Escalate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Block Customer
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

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.aiRecommendations')}</CardTitle>
              <CardDescription>{t('dashboard.intelligentRecommendations')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{rec.title || 'Unknown Title'}</p>
                          <p className="text-xs text-muted-foreground">ID: {rec.id || 'Unknown'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rec.type || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{rec.confidence || 0}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${rec.confidence || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rec.status)}>
                          {rec.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {rec.createdAt ? formatRelativeTime(rec.createdAt) : 'Unknown'}
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
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Implement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Clock className="mr-2 h-4 w-4" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-4 w-4" />
                              Dismiss
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

        <TabsContent value="training" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.trainingStatusAndLogs')}</CardTitle>
              <CardDescription>{t('dashboard.monitorTrainingProgress')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Fleet Optimization Model</p>
                      <p className="text-xs text-muted-foreground">Training in progress...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">67%</p>
                    <p className="text-xs text-muted-foreground">Epoch 134/200</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('dashboard.fraudDetectionModel')}</p>
                      <p className="text-xs text-muted-foreground">{t('dashboard.trainingCompletedSuccessfully')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">100%</p>
                    <p className="text-xs text-muted-foreground">Accuracy: 94.5%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-[0.625rem] bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Customer Churn Model</p>
                      <p className="text-xs text-muted-foreground">Validation in progress...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">45%</p>
                    <p className="text-xs text-muted-foreground">Validating dataset</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2: AI/ML Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">AI/ML Analytics</h2>
            <p className="text-muted-foreground">
              Track not just models, but business impact
            </p>
          </div>
        </div>

        {/* Top Row - Impact & Uplift */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FraudImpact />
          <RecommendationUplift />
          <TrainingROI />
        </div>

        {/* Second Row - Model Monitoring */}
        <div className="grid gap-6">
          <ModelDriftDetector />
        </div>
      </div>
    </div>
  );
}