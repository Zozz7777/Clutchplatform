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
import { useTranslations } from "next-intl";
import { handleError, handleWarning, handleDataLoadError } from "@/lib/error-handler";

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
  // Safely get quick actions with error handling
  let generateReport: (() => void) | null = null;
  let exportData: (() => void) | null = null;
  
  try {
    // Ensure hasPermission is a function before using it
    const permissionCheck = typeof hasPermission === 'function' ? hasPermission : () => true;
    const quickActions = useQuickActions(permissionCheck);
    generateReport = quickActions.generateReport;
    exportData = quickActions.exportData;
  } catch (error) {
    handleError(error, { component: 'ReportsPage', action: 'initialize_quick_actions' });
  }
  const t = useTranslations();


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
          handleWarning(`Failed to load reports: ${reportsData.reason}`, { component: 'ReportsPage' });
          setReports([]);
        }

        // Handle templates data
        if (templatesData.status === 'fulfilled') {
          const templates = templatesData.value || [];
          setTemplates(Array.isArray(templates) ? templates as unknown as ReportTemplate[] : []);
        } else {
          handleWarning(`Failed to load templates: ${templatesData.reason}`, { component: 'ReportsPage' });
          setTemplates([]);
        }
        
      } catch (error) {
        handleDataLoadError(error, 'reports_data');
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
          name: t('reports.currentUser'),
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
            <CardTitle className="text-sm font-medium">{t('reports.totalReports')}</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {completedReports} {t('reports.completed')}, {scheduledReports} {t('reports.scheduled')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.reportTemplates')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.availableTemplates')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.scheduledReports')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledReports}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.autoGeneratedReports')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.dataProcessed')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(reports || []).reduce((sum, r) => sum + (r.results?.totalRecords || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.totalRecordsProcessed')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.title')}</CardTitle>
          <CardDescription>
            {t('reports.manageAndViewReports')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
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
                  {t('reports.reportType')}: {typeFilter === "all" ? t('common.all') : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                  {t('common.all')} {t('reports.reportType')}s
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("financial")}>
                  {t('reports.financial')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("operational")}>
                  {t('reports.operational')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("user_analytics")}>
                  {t('reports.userAnalytics')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("fleet")}>
                  {t('reports.fleet')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {t('reports.status')}: {statusFilter === "all" ? t('common.all') : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {t('common.all')} {t('reports.status')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  {t('reports.completed')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("generating")}>
                  {t('reports.generating')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  {t('reports.scheduled')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  {t('reports.failed')}
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
                          <p className="text-sm font-medium">{t('reports.createdBy')}</p>
                          <p className="text-sm text-muted-foreground">{report.createdBy.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('reports.schedule')}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.schedule.frequency}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('reports.records')}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.results.totalRecords.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('reports.fileSize')}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(report.results.fileSize)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{t('reports.createdAt')}: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.results.generatedAt && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{t('reports.generatedAt')}: {new Date(report.results.generatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {report.schedule.nextRun && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{t('reports.nextRun')}: {new Date(report.schedule.nextRun).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.status === "completed" && report.results.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          {t('reports.downloadReport')}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        {t('reports.viewReport')}
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
            <DialogTitle>{t('reports.createReport')}</DialogTitle>
            <DialogDescription>
              {t('reports.createReportDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportName">{t('reports.reportName')}</Label>
                <Input 
                  id="reportName" 
                  placeholder={t('reports.enterReportName')} 
                  value={createReportData.name}
                  onChange={(e) => setCreateReportData({...createReportData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="reportType">{t('reports.reportType')}</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={createReportData.type}
                  onChange={(e) => setCreateReportData({...createReportData, type: e.target.value})}
                >
                  <option value="financial">{t('reports.financial')}</option>
                  <option value="operational">{t('reports.operational')}</option>
                  <option value="user_analytics">{t('reports.userAnalytics')}</option>
                  <option value="fleet">{t('reports.fleet')}</option>
                  <option value="custom">{t('reports.custom')}</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="reportDescription">{t('reports.reportDescription')}</Label>
              <Input 
                id="reportDescription" 
                placeholder={t('reports.reportDescription')} 
                value={createReportData.description}
                onChange={(e) => setCreateReportData({...createReportData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">{t('reports.startDate')}</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={createReportData.startDate}
                  onChange={(e) => setCreateReportData({...createReportData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">{t('reports.endDate')}</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={createReportData.endDate}
                  onChange={(e) => setCreateReportData({...createReportData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schedule">{t('reports.schedule')}</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={createReportData.schedule}
                onChange={(e) => setCreateReportData({...createReportData, schedule: e.target.value})}
              >
                <option value="once">{t('reports.once')}</option>
                <option value="daily">{t('reports.daily')}</option>
                <option value="weekly">{t('reports.weekly')}</option>
                <option value="monthly">{t('reports.monthly')}</option>
                <option value="quarterly">{t('reports.quarterly')}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={createReport}>
              {t('reports.createReport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('reports.reportTemplates')}</DialogTitle>
            <DialogDescription>
              {t('reports.useTemplatesDescription')}
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
                        {t('reports.usedTimes').replace('{count}', template.usageCount.toString())}
                      </span>
                      <Button size="sm" variant="outline">
                        {t('reports.useTemplate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 2: Reports Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('reports.reportsAnalytics')}</h2>
            <p className="text-muted-foreground">
              {t('reports.automateAndMeasure')}
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
