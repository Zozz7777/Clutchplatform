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

  useEffect(() => {
    const loadAIMLData = async () => {
      try {
        // Mock data for AI/ML
        const mockModels: AIModel[] = [
          {
            id: "1",
            name: "Fraud Detection Model",
            type: "Classification",
            accuracy: 94.5,
            status: "active",
            lastTrained: "2024-01-15T10:30:00Z",
            predictions: 1250,
            performance: 98.2
          },
          {
            id: "2",
            name: "Fleet Optimization",
            type: "Regression",
            accuracy: 89.3,
            status: "training",
            lastTrained: "2024-01-14T14:20:00Z",
            predictions: 850,
            performance: 92.1
          },
          {
            id: "3",
            name: "Customer Churn Prediction",
            type: "Classification",
            accuracy: 91.7,
            status: "active",
            lastTrained: "2024-01-13T09:15:00Z",
            predictions: 2100,
            performance: 95.8
          },
          {
            id: "4",
            name: "Demand Forecasting",
            type: "Time Series",
            accuracy: 87.2,
            status: "inactive",
            lastTrained: "2024-01-12T16:45:00Z",
            predictions: 650,
            performance: 88.9
          }
        ];

        const mockFraudCases: FraudCase[] = [
          {
            id: "1",
            customer: "Ahmed Hassan",
            amount: 15000,
            risk: "high",
            status: "investigating",
            detectedAt: "2024-01-15T10:30:00Z",
            description: "Unusual payment pattern detected"
          },
          {
            id: "2",
            customer: "Fatma Mohamed",
            amount: 8500,
            risk: "medium",
            status: "resolved",
            detectedAt: "2024-01-14T14:20:00Z",
            description: "Multiple failed payment attempts"
          },
          {
            id: "3",
            customer: "Omar Ali",
            amount: 3200,
            risk: "low",
            status: "false_positive",
            detectedAt: "2024-01-13T09:15:00Z",
            description: "New customer with high initial transaction"
          }
        ];

        const mockRecommendations: Recommendation[] = [
          {
            id: "1",
            type: "Fleet Optimization",
            title: "Optimize Route for Vehicle ABC-123",
            confidence: 92.5,
            impact: "high",
            status: "pending",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "2",
            type: "Customer Retention",
            title: "Offer discount to at-risk customer",
            confidence: 87.3,
            impact: "medium",
            status: "implemented",
            createdAt: "2024-01-14T14:20:00Z"
          },
          {
            id: "3",
            type: "Maintenance",
            title: "Schedule maintenance for Vehicle DEF-456",
            confidence: 95.1,
            impact: "high",
            status: "pending",
            createdAt: "2024-01-13T09:15:00Z"
          }
        ];

        setModels(mockModels);
        setFraudCases(mockFraudCases);
        setRecommendations(mockRecommendations);
        setFilteredModels(mockModels);
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

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(model => model.status === statusFilter);
    }

    setFilteredModels(filtered);
  }, [models, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "false_positive":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "implemented":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const totalPredictions = models.reduce((sum, model) => sum + model.predictions, 0);
  const avgAccuracy = models.length > 0 ? models.reduce((sum, model) => sum + model.accuracy, 0) / models.length : 0;
  const activeModels = models.filter(m => m.status === "active").length;
  const fraudCasesDetected = fraudCases.length;

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
          <Button variant="outline" className="shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Train Model
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalPredictions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Average Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> improvement
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeModels}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1</span> new model
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Fraud Cases</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{fraudCasesDetected}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI/ML Tabs */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="training">Training Status</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">AI Models</CardTitle>
              <CardDescription>Manage and monitor machine learning models</CardDescription>
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
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                            <p className="text-sm font-medium text-foreground">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.predictions.toLocaleString()} predictions</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{model.accuracy}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{model.performance}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${model.performance}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(model.lastTrained)}
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Fraud Detection Cases</CardTitle>
              <CardDescription>Monitor and investigate potential fraud cases</CardDescription>
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
                          <p className="text-sm font-medium text-foreground">Case #{case_.id}</p>
                          <p className="text-xs text-muted-foreground">{case_.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{case_.customer}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          EGP {case_.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(case_.risk)}>
                          {case_.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(case_.status)}>
                          {case_.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(case_.detectedAt)}
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">AI Recommendations</CardTitle>
              <CardDescription>Intelligent recommendations for business optimization</CardDescription>
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
                          <p className="text-sm font-medium text-foreground">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">ID: {rec.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rec.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{rec.confidence}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${rec.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rec.status)}>
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(rec.createdAt)}
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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Training Status & Logs</CardTitle>
              <CardDescription>Monitor model training progress and view logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
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
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Fraud Detection Model</p>
                      <p className="text-xs text-muted-foreground">Training completed successfully</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">100%</p>
                    <p className="text-xs text-muted-foreground">Accuracy: 94.5%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
    </div>
  );
}