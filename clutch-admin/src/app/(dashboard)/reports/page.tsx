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
import { useTranslations } from "@/hooks/use-translations";

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
  const [createReportData, setCreateReportData] = useState({
    name: "",
    description: "",
    type: "financial",
    startDate: "",
    endDate: "",
    schedule: "once"
  });
  const { hasPermission } = useAuth();
  const { generateReport, exportData } = useQuickActions(hasPermission);
  const { t } = useTranslations();


  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load both reports and templates with proper error handling
        const [reportsData, templatesData] = await Promise.allSettled([
          productionApi.getReports(),
          productionApi.getReports() // Note: This should probably be a different API call for templates
        ]);

        // Handle reports data
        if (reportsData.status === 'fulfilled') {
          const reports = reportsData.value || [];
          setReports(Array.isArray(reports) ? reports as unknown as Report[] : []);
        } else {
          console.warn('Failed to load reports:', reportsData.reason);
          setReports([]);
        }

        // Handle templates data
        if (templatesData.status === 'fulfilled') {
          const templates = templatesData.value || [];
          setTemplates(Array.isArray(templates) ? templates as unknown as ReportTemplate[] : []);
        } else {
          console.warn('Failed to load templates:', templatesData.reason);
          setTemplates([]);
        }
        
      } catch (error) {
        console.error('Unexpected error loading reports data:', error);
        setReports([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);


  const createReport = async () => {
    try {
      const reportData = {
        name: createReportData.name,
        description: createReportData.description,
        type: createReportData.type,
        status: "draft",
        createdBy: {
          id: "current-user",
          name: "Current User",
          email: "user@example.com"
        },
        schedule: {
          frequency: createReportData.schedule,
          nextRun: createReportData.schedule !== "once" ? new Date().toISOString() : undefined
        },
        parameters: {
          dateRange: {
            start: createReportData.startDate,
            end: createReportData.endDate
          },
          filters: {},
          groupBy: [],
          metrics: []
        },
        results: {
          totalRecords: 0,
          generatedAt: "",
          fileSize: 0
        }
      };

      const newReport = await productionApi.createReport(reportData);
      if (newReport) {
        setReports(prev => [...prev, newReport as unknown as Report]);
        setShowCreateDialog(false);
        setCreateReportData({
          name: "",
          description: "",
          type: "financial",
          startDate: "",
          endDate: "",
          schedule: "once"
        });
      }
    } catch (error) {
      // Error handled by API service
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

  // Ensure we have arrays before filtering
  const reportsArray = Array.isArray(reports) ? reports : [];
  const templatesArray = Array.isArray(templates) ? templates : [];
  
  const filteredReports = reportsArray.filter((report) => {
    const matchesSearch = (report.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalReports = reportsArray.length;
  const completedReports = reportsArray.filter(r => r.status === "completed").length;
  const scheduledReports = reportsArray.filter(r => r.status === "scheduled").length;
  const totalTemplates = templatesArray.length;

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
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {t('reports.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowTemplateDialog(true)} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            {t('reports.reportTemplates')}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('reports.createReport')}
          </Button>
          <Button variant="outline" onClick={generateReport}>
            <FileBarChart className="mr-2 h-4 w-4" />
            {t('reports.generateReport')}
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
              {(reports || []).reduce((sum, r) => sum + (r.results?.totalRecords || 0), 0).toLocaleString()}
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
              <Card key={report._id} className="hover:shadow-sm transition-shadow">
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
                <Input 
                  id="reportName" 
                  placeholder="Enter report name" 
                  value={createReportData.name}
                  onChange={(e) => setCreateReportData({...createReportData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reportType">Type</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createReportData.type}
                  onChange={(e) => setCreateReportData({...createReportData, type: e.target.value})}
                >
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
              <Input 
                id="reportDescription" 
                placeholder="Report description" 
                value={createReportData.description}
                onChange={(e) => setCreateReportData({...createReportData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={createReportData.startDate}
                  onChange={(e) => setCreateReportData({...createReportData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={createReportData.endDate}
                  onChange={(e) => setCreateReportData({...createReportData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createReportData.schedule}
                onChange={(e) => setCreateReportData({...createReportData, schedule: e.target.value})}
              >
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
            <Button onClick={createReport}>
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
                <Card key={template._id} className="hover:shadow-sm transition-shadow">
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
