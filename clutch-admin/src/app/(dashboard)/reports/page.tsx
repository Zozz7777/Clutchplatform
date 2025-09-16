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
  FileBarChart,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Truck,
  MessageSquare,
  FileText,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productionApi } from "@/lib/production-api";
import { useAuth } from "@/contexts/auth-context";

// Import new Phase 2 widgets
import ReportUsageStats from '@/components/widgets/report-usage-stats';
import { useQuickActions } from "@/lib/quick-actions";

interface Report {
  _id: string;
  name: string;
  description: string;
  type: "financial" | "operational" | "user_analytics" | "fleet" | "custom";
  category: string;
  status: "draft" | "scheduled" | "generating" | "completed" | "failed";
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  schedule: {
    frequency: "once" | "daily" | "weekly" | "monthly" | "quarterly";
    nextRun?: string;
    lastRun?: string;
  };
  parameters: {
    dateRange: {
      start: string;
      end: string;
    };
    filters: Record<string, unknown>;
    groupBy: string[];
    metrics: string[];
  };
  results: {
    totalRecords: number;
    generatedAt: string;
    fileSize: number;
    downloadUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReportTemplate {
  _id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  parameters: {
    defaultFilters: Record<string, unknown>;
    availableMetrics: string[];
    availableGroupBy: string[];
  };
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const { hasPermission } = useAuth();
  const { generateReport, exportData } = useQuickActions(hasPermission);

  // Mock data for development
  const mockReports: Report[] = [
    {
      _id: "1",
      name: "Monthly Financial Summary",
      description: "Comprehensive financial report for the current month",
      type: "financial",
      category: "Revenue & Expenses",
      status: "completed",
      createdBy: {
        id: "1",
        name: "Ahmed Hassan",
        email: "ahmed@yourclutch.com",
      },
      schedule: {
        frequency: "monthly",
        nextRun: "2024-04-01T00:00:00Z",
        lastRun: "2024-03-01T00:00:00Z",
      },
      parameters: {
        dateRange: {
          start: "2024-03-01",
          end: "2024-03-31",
        },
        filters: {
          includeRefunds: false,
          currency: "EGP",
        },
        groupBy: ["payment_method", "service_type"],
        metrics: ["total_revenue", "total_expenses", "net_profit"],
      },
      results: {
        totalRecords: 1250,
        generatedAt: "2024-03-01T08:30:00Z",
        fileSize: 2048576, // 2MB
        downloadUrl: "/reports/monthly-financial-march-2024.pdf",
      },
      createdAt: "2024-02-15T10:00:00Z",
      updatedAt: "2024-03-01T08:30:00Z",
    },
    {
      _id: "2",
      name: "User Activity Analytics",
      description: "Detailed analysis of user behavior and engagement",
      type: "user_analytics",
      category: "User Behavior",
      status: "generating",
      createdBy: {
        id: "2",
        name: "Fatma Ali",
        email: "fatma@yourclutch.com",
      },
      schedule: {
        frequency: "weekly",
        nextRun: "2024-03-18T00:00:00Z",
        lastRun: "2024-03-11T00:00:00Z",
      },
      parameters: {
        dateRange: {
          start: "2024-03-11",
          end: "2024-03-17",
        },
        filters: {
          userType: "all",
          includeInactive: false,
        },
        groupBy: ["user_segment", "device_type"],
        metrics: ["active_users", "session_duration", "feature_usage"],
      },
      results: {
        totalRecords: 0,
        generatedAt: "",
        fileSize: 0,
      },
      createdAt: "2024-03-10T14:00:00Z",
      updatedAt: "2024-03-17T09:15:00Z",
    },
    {
      _id: "3",
      name: "Fleet Performance Report",
      description: "Vehicle utilization and maintenance analysis",
      type: "fleet",
      category: "Fleet Operations",
      status: "scheduled",
      createdBy: {
        id: "3",
        name: "Mohamed Ibrahim",
        email: "mohamed@yourclutch.com",
      },
      schedule: {
        frequency: "weekly",
        nextRun: "2024-03-18T06:00:00Z",
        lastRun: "2024-03-11T06:00:00Z",
      },
      parameters: {
        dateRange: {
          start: "2024-03-11",
          end: "2024-03-17",
        },
        filters: {
          vehicleType: "all",
          includeMaintenance: true,
        },
        groupBy: ["vehicle_type", "driver"],
        metrics: ["utilization_rate", "fuel_efficiency", "maintenance_cost"],
      },
      results: {
        totalRecords: 0,
        generatedAt: "",
        fileSize: 0,
      },
      createdAt: "2024-03-05T11:30:00Z",
      updatedAt: "2024-03-17T10:00:00Z",
    },
  ];

  const mockTemplates: ReportTemplate[] = [
    {
      _id: "1",
      name: "Financial Summary Template",
      description: "Standard template for monthly financial reports",
      type: "financial",
      category: "Revenue & Expenses",
      parameters: {
        defaultFilters: {
          currency: "EGP",
          includeRefunds: false,
        },
        availableMetrics: ["total_revenue", "total_expenses", "net_profit", "transaction_count"],
        availableGroupBy: ["payment_method", "service_type", "date"],
      },
      isPublic: true,
      createdBy: "1",
      usageCount: 45,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      _id: "2",
      name: "User Engagement Report",
      description: "Template for analyzing user behavior and engagement metrics",
      type: "user_analytics",
      category: "User Behavior",
      parameters: {
        defaultFilters: {
          userType: "all",
          includeInactive: false,
        },
        availableMetrics: ["active_users", "session_duration", "feature_usage", "retention_rate"],
        availableGroupBy: ["user_segment", "device_type", "location"],
      },
      isPublic: true,
      createdBy: "2",
      usageCount: 32,
      createdAt: "2024-02-01T14:00:00Z",
    },
  ];

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getReports();
      setReports(data || mockReports);
    } catch (error) {
      console.error("Error loading reports:", error);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await productionApi.getReports({ type: 'templates' });
      setTemplates(data || mockTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates(mockTemplates);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary-foreground";
      case "generating":
        return "bg-secondary/10 text-secondary-foreground";
      case "scheduled":
        return "bg-secondary/10 text-secondary-foreground";
      case "failed":
        return "bg-destructive/10 text-destructive-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "operational":
        return <Settings className="h-4 w-4" />;
      case "user_analytics":
        return <Users className="h-4 w-4" />;
      case "fleet":
        return <Truck className="h-4 w-4" />;
      default:
        return <FileBarChart className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === "completed").length;
  const scheduledReports = reports.filter(r => r.status === "scheduled").length;
  const totalTemplates = templates.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
          <p className="text-muted-foreground">
            Generate and manage detailed reports from various modules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowTemplateDialog(true)} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
          <Button variant="outline" onClick={generateReport}>
            <FileBarChart className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {completedReports} completed, {scheduledReports} scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Available templates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledReports}</div>
            <p className="text-xs text-muted-foreground">
              Auto-generated reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, r) => sum + r.results.totalRecords, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total records processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            Manage and view all generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
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
                <DropdownMenuItem onClick={() => setTypeFilter("financial")}>
                  Financial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("operational")}>
                  Operational
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("user_analytics")}>
                  User Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("fleet")}>
                  Fleet
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
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("generating")}>
                  Generating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(report.type)}
                        <h3 className="text-lg font-semibold">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">
                          {report.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{report.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Created By</p>
                          <p className="text-sm text-muted-foreground">{report.createdBy.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Schedule</p>
                          <p className="text-sm text-muted-foreground">
                            {report.schedule.frequency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Records</p>
                          <p className="text-sm text-muted-foreground">
                            {report.results.totalRecords.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">File Size</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(report.results.fileSize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.results.generatedAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Generated: {new Date(report.results.generatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {report.schedule.nextRun && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Next: {new Date(report.schedule.nextRun).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.status === "completed" && report.results.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Generate a new report with custom parameters and filters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportName">Report Name</Label>
                <Input id="reportName" placeholder="Enter report name" />
              </div>
              <div>
                <Label htmlFor="reportType">Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="user_analytics">User Analytics</option>
                  <option value="fleet">Fleet</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="reportDescription">Description</Label>
              <Input id="reportDescription" placeholder="Report description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="once">Run Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Report Templates</DialogTitle>
            <DialogDescription>
              Use pre-built templates to quickly create reports.
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
                      </div>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Used {template.usageCount} times
                      </span>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 2: Reports Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Reports Analytics</h2>
            <p className="text-muted-foreground">
              Automate and measure report effectiveness
            </p>
          </div>
        </div>

        {/* Report Usage Stats */}
        <div className="grid gap-6">
          <ReportUsageStats />
        </div>
      </div>
    </div>
  );
}
