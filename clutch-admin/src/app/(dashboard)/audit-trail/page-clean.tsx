"use client";

import React, { useState, useEffect } from "react";

// Prevent static generation for this page
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Database,
  Lock,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
// import { useTranslations } from "next-intl";
import { realApi } from "@/lib/real-api";
import { toast } from "sonner";

interface AuditLog {
  _id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  resourceName: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: "success" | "failure" | "pending";
  location: {
    country: string;
    city: string;
  };
  tags: string[];
  createdAt: string;
}

interface SecurityEvent {
  _id: string;
  timestamp: string;
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  description: string;
  details: Record<string, unknown>;
  status: string;
  assignedTo: string;
  createdAt: string;
}

interface UserActivity {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  activity: string;
  timestamp: string;
  details: Record<string, unknown>;
  status: string;
  sessionId: string;
}

export default function AuditTrailPage() {
  const t = (key: string, params?: any) => key;
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setLoading(true);
        
        const [logsData, eventsData, activitiesData] = await Promise.all([
          realApi.getAuditLogs(),
          realApi.getSecurityEvents(),
          realApi.getUserActivities()
        ]);

        setAuditLogs((logsData || []) as AuditLog[]);
        setSecurityEvents((eventsData || []) as SecurityEvent[]);
        setUserActivities((activitiesData || []) as UserActivity[]);
        
      } catch (error) {
        // Error handled by API service
        toast.error(t('auditTrail.failedToLoadAuditData'));
        setAuditLogs([]);
        setSecurityEvents([]);
        setUserActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, [t]);

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch = log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const totalLogs = auditLogs.length;
  const criticalEvents = auditLogs.filter(l => l.severity === "critical").length;
  const failedActions = auditLogs.filter(l => l.status === "failure").length;
  const activeUsers = userActivities.filter(a => a.status === "active").length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failure":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success(t('auditTrail.exportStarted'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">{t('auditTrail.title')}</h1>
          <p className="text-muted-foreground">
            Monitor and track all system activities and security events
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Audit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{failedActions}</div>
            <p className="text-xs text-muted-foreground">
              Failed operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="data_modification">Data Modification</SelectItem>
                  <SelectItem value="system_configuration">System Configuration</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Detailed log of all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-sm text-muted-foreground">{log.userEmail}</div>
                        <div className="text-xs text-muted-foreground">{log.userRole}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">{log.resourceName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.resource}</div>
                        <div className="text-sm text-muted-foreground">ID: {log.resourceId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div>{log.location.city}</div>
                          <div className="text-muted-foreground">{log.location.country}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Session ID</Label>
                  <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Agent</Label>
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(selectedLog.userAgent)}
                    <p className="text-sm truncate">{selectedLog.userAgent}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">User Information</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.userName}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.userEmail}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Role</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.userRole}</div>
                  </div>
                </div>
              </div>

              {/* Action Details */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Action Details</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Action</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.action}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Resource</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.resource}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Resource ID</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.resourceId}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">Resource Name</div>
                    <div className="text-sm text-muted-foreground">{selectedLog.resourceName}</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedLog.tags && selectedLog.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedLog.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Additional Details</Label>
                  <div className="p-3 border rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


