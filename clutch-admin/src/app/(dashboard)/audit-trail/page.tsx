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
  History,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Shield,
  User,
  Calendar,
  Clock,
  FileText,
  Database,
  Settings,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  BarChart3,
  Activity,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
import { hybridApi } from "@/lib/hybrid-api";

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
  details: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  category: "authentication" | "authorization" | "data_access" | "data_modification" | "system" | "security" | "user_management" | "configuration";
  status: "success" | "failure" | "warning";
  location?: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  tags: string[];
  createdAt: string;
}

interface SecurityEvent {
  _id: string;
  timestamp: string;
  type: "login_attempt" | "failed_login" | "suspicious_activity" | "data_breach" | "unauthorized_access" | "system_intrusion" | "malware_detected" | "policy_violation";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  source: {
    ipAddress: string;
    userAgent: string;
    location?: {
      country: string;
      city: string;
    };
  };
  affectedResources: string[];
  userId?: string;
  userName?: string;
  status: "open" | "investigating" | "resolved" | "false_positive";
  assignedTo?: {
    id: string;
    name: string;
  };
  resolution?: {
    description: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
}

interface UserActivity {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  loginTime: string;
  logoutTime?: string;
  duration?: number; // minutes
  ipAddress: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
  };
  actions: {
    count: number;
    lastAction: string;
    lastActionTime: string;
  };
  pages: {
    name: string;
    visits: number;
    timeSpent: number; // minutes
  }[];
  device: {
    type: "desktop" | "mobile" | "tablet";
    os: string;
    browser: string;
  };
  status: "active" | "inactive" | "expired";
  createdAt: string;
}

export default function AuditTrailPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7d");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Mock data for development
  const mockAuditLogs: AuditLog[] = [
    {
      _id: "1",
      timestamp: "2024-03-15T14:30:00Z",
      userId: "1",
      userName: "Ahmed Hassan",
      userEmail: "ahmed@yourclutch.com",
      userRole: "admin",
      action: "UPDATE",
      resource: "user",
      resourceId: "123",
      resourceName: "Fatma Ali",
      details: {
        before: { status: "active", role: "user" },
        after: { status: "active", role: "manager" },
        changes: { role: "user -> manager" },
        metadata: { reason: "promotion" },
      },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      sessionId: "sess_abc123",
      severity: "medium",
      category: "user_management",
      status: "success",
      location: {
        country: "Egypt",
        city: "Cairo",
        coordinates: {
          lat: 30.0444,
          lng: 31.2357,
        },
      },
      tags: ["user", "role_change", "promotion"],
      createdAt: "2024-03-15T14:30:00Z",
    },
    {
      _id: "2",
      timestamp: "2024-03-15T13:45:00Z",
      userId: "2",
      userName: "Fatma Ali",
      userEmail: "fatma@yourclutch.com",
      userRole: "manager",
      action: "CREATE",
      resource: "project",
      resourceId: "456",
      resourceName: "Mobile App Redesign",
      details: {
        after: { name: "Mobile App Redesign", budget: 150000, status: "planning" },
        metadata: { client: "Clutch Technologies" },
      },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      sessionId: "sess_def456",
      severity: "low",
      category: "data_modification",
      status: "success",
      location: {
        country: "Egypt",
        city: "Alexandria",
      },
      tags: ["project", "creation", "planning"],
      createdAt: "2024-03-15T13:45:00Z",
    },
    {
      _id: "3",
      timestamp: "2024-03-15T12:20:00Z",
      userId: "3",
      userName: "Mohamed Ibrahim",
      userEmail: "mohamed@yourclutch.com",
      userRole: "user",
      action: "LOGIN",
      resource: "authentication",
      resourceId: "auth_789",
      resourceName: "User Login",
      details: {
        metadata: { method: "password", twoFactor: true },
      },
      ipAddress: "203.0.113.45",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
      sessionId: "sess_ghi789",
      severity: "low",
      category: "authentication",
      status: "success",
      location: {
        country: "Egypt",
        city: "Giza",
      },
      tags: ["login", "authentication", "mobile"],
      createdAt: "2024-03-15T12:20:00Z",
    },
    {
      _id: "4",
      timestamp: "2024-03-15T11:15:00Z",
      userId: "4",
      userName: "Nour El-Din",
      userEmail: "nour@yourclutch.com",
      userRole: "admin",
      action: "DELETE",
      resource: "asset",
      resourceId: "789",
      resourceName: "Old Laptop - Dell Inspiron",
      details: {
        before: { name: "Old Laptop - Dell Inspiron", status: "retired" },
        metadata: { reason: "end_of_life", disposal_method: "recycled" },
      },
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      sessionId: "sess_jkl012",
      severity: "medium",
      category: "data_modification",
      status: "success",
      location: {
        country: "Egypt",
        city: "Cairo",
      },
      tags: ["asset", "deletion", "disposal"],
      createdAt: "2024-03-15T11:15:00Z",
    },
    {
      _id: "5",
      timestamp: "2024-03-15T10:30:00Z",
      userId: "5",
      userName: "Omar Khaled",
      userEmail: "omar@yourclutch.com",
      userRole: "user",
      action: "FAILED_LOGIN",
      resource: "authentication",
      resourceId: "auth_fail_345",
      resourceName: "Failed Login Attempt",
      details: {
        metadata: { reason: "invalid_password", attempts: 3 },
      },
      ipAddress: "198.51.100.25",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      sessionId: "sess_mno345",
      severity: "high",
      category: "security",
      status: "failure",
      location: {
        country: "Egypt",
        city: "Cairo",
      },
      tags: ["security", "failed_login", "brute_force"],
      createdAt: "2024-03-15T10:30:00Z",
    },
  ];

  const mockSecurityEvents: SecurityEvent[] = [
    {
      _id: "1",
      timestamp: "2024-03-15T10:30:00Z",
      type: "failed_login",
      severity: "high",
      description: "Multiple failed login attempts detected for user omar@yourclutch.com",
      source: {
        ipAddress: "198.51.100.25",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: {
          country: "Egypt",
          city: "Cairo",
        },
      },
      affectedResources: ["authentication", "user_account"],
      userId: "5",
      userName: "Omar Khaled",
      status: "investigating",
      assignedTo: {
        id: "1",
        name: "Ahmed Hassan",
      },
      createdAt: "2024-03-15T10:30:00Z",
    },
    {
      _id: "2",
      timestamp: "2024-03-15T09:15:00Z",
      type: "suspicious_activity",
      severity: "medium",
      description: "Unusual data access pattern detected for user fatma@yourclutch.com",
      source: {
        ipAddress: "203.0.113.100",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: {
          country: "Egypt",
          city: "Alexandria",
        },
      },
      affectedResources: ["user_data", "project_files"],
      userId: "2",
      userName: "Fatma Ali",
      status: "open",
      createdAt: "2024-03-15T09:15:00Z",
    },
  ];

  const mockUserActivities: UserActivity[] = [
    {
      _id: "1",
      userId: "1",
      userName: "Ahmed Hassan",
      userEmail: "ahmed@yourclutch.com",
      sessionId: "sess_abc123",
      loginTime: "2024-03-15T08:00:00Z",
      logoutTime: "2024-03-15T17:30:00Z",
      duration: 570, // 9.5 hours
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: {
        country: "Egypt",
        city: "Cairo",
      },
      actions: {
        count: 45,
        lastAction: "UPDATE user profile",
        lastActionTime: "2024-03-15T17:25:00Z",
      },
      pages: [
        { name: "Dashboard", visits: 8, timeSpent: 45 },
        { name: "User Management", visits: 12, timeSpent: 120 },
        { name: "Project Management", visits: 6, timeSpent: 90 },
        { name: "Settings", visits: 3, timeSpent: 30 },
      ],
      device: {
        type: "desktop",
        os: "Windows 10",
        browser: "Chrome 91.0",
      },
      status: "inactive",
      createdAt: "2024-03-15T08:00:00Z",
    },
    {
      _id: "2",
      userId: "2",
      userName: "Fatma Ali",
      userEmail: "fatma@yourclutch.com",
      sessionId: "sess_def456",
      loginTime: "2024-03-15T09:30:00Z",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      location: {
        country: "Egypt",
        city: "Alexandria",
      },
      actions: {
        count: 23,
        lastAction: "CREATE new project",
        lastActionTime: "2024-03-15T13:45:00Z",
      },
      pages: [
        { name: "Dashboard", visits: 5, timeSpent: 30 },
        { name: "Project Management", visits: 8, timeSpent: 180 },
        { name: "Team Management", visits: 4, timeSpent: 60 },
      ],
      device: {
        type: "desktop",
        os: "macOS 11.0",
        browser: "Safari 14.0",
      },
      status: "active",
      createdAt: "2024-03-15T09:30:00Z",
    },
  ];

  useEffect(() => {
    loadAuditLogs();
    loadSecurityEvents();
    loadUserActivities();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await hybridApi.getAuditLogs();
      setAuditLogs(data || mockAuditLogs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      setAuditLogs(mockAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      const data = await hybridApi.getSecurityEvents();
      setSecurityEvents(data || mockSecurityEvents);
    } catch (error) {
      console.error("Error loading security events:", error);
      setSecurityEvents(mockSecurityEvents);
    }
  };

  const loadUserActivities = async () => {
    try {
      const data = await hybridApi.getUserActivities();
      setUserActivities(data || mockUserActivities);
    } catch (error) {
      console.error("Error loading user activities:", error);
      setUserActivities(mockUserActivities);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-secondary/10 text-secondary-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-primary/10 text-primary-foreground";
      case "failure":
        return "bg-destructive/10 text-destructive-foreground";
      case "warning":
        return "bg-secondary/10 text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Shield className="h-4 w-4" />;
      case "authorization":
        return <Lock className="h-4 w-4" />;
      case "data_access":
        return <Database className="h-4 w-4" />;
      case "data_modification":
        return <Edit className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "security":
        return <AlertTriangle className="h-4 w-4" />;
      case "user_management":
        return <User className="h-4 w-4" />;
      case "configuration":
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Plus className="h-4 w-4 text-primary" />;
      case "UPDATE":
        return <Edit className="h-4 w-4 text-primary" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-destructive" />;
      case "LOGIN":
        return <Unlock className="h-4 w-4 text-primary" />;
      case "LOGOUT":
        return <Lock className="h-4 w-4 text-gray-600" />;
      case "FAILED_LOGIN":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const totalLogs = auditLogs.length;
  const criticalEvents = auditLogs.filter(l => l.severity === "critical").length;
  const failedActions = auditLogs.filter(l => l.status === "failure").length;
  const activeUsers = userActivities.filter(a => a.status === "active").length;

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
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Monitor system activities, security events, and user actions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalEvents}</div>
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
            <div className="text-2xl font-bold text-secondary">{failedActions}</div>
            <p className="text-xs text-muted-foreground">
              Security concerns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Alert */}
      {securityEvents.filter(e => e.status === "open" || e.status === "investigating").length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Security Events Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityEvents.filter(e => e.status === "open" || e.status === "investigating").map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-red-800">{event.description}</p>
                    <p className="text-sm text-destructive">
                      {event.type} • {event.source.ipAddress} • {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Complete log of all system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
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
                  Category: {categoryFilter === "all" ? "All" : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("authentication")}>
                  Authentication
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("authorization")}>
                  Authorization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("data_access")}>
                  Data Access
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("data_modification")}>
                  Data Modification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("security")}>
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter("user_management")}>
                  User Management
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Severity: {severityFilter === "all" ? "All" : severityFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSeverityFilter("all")}>
                  All Severities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSeverityFilter("critical")}>
                  Critical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSeverityFilter("high")}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSeverityFilter("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSeverityFilter("low")}>
                  Low
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
                <DropdownMenuItem onClick={() => setStatusFilter("success")}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failure")}>
                  Failure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("warning")}>
                  Warning
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getActionIcon(log.action)}
                    {getCategoryIcon(log.category)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {log.userName} {log.action.toLowerCase()} {log.resource} "{log.resourceName}"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.category} • {log.ipAddress} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {log.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(log.severity)}>
                    {log.severity}
                  </Badge>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Activities */}
      <Card>
        <CardHeader>
          <CardTitle>User Activities</CardTitle>
          <CardDescription>
            Current and recent user sessions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActivities.map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {activity.device.type === "mobile" ? (
                      <Smartphone className="h-4 w-4 text-primary" />
                    ) : activity.device.type === "tablet" ? (
                      <Monitor className="h-4 w-4 text-primary" />
                    ) : (
                      <Monitor className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.device.type} • {activity.device.os} • {activity.device.browser}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.location.city}, {activity.location.country} • {activity.ipAddress}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.actions.count} actions</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.duration ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` : "Active"}
                  </p>
                  <Badge className={activity.status === "active" ? "bg-primary/10 text-primary-foreground" : "bg-muted text-muted-foreground"}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.userName} ({selectedLog.userEmail})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">{selectedLog.userRole}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <p className="text-sm text-muted-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resource</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.resource} - {selectedLog.resourceName}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm text-muted-foreground">{selectedLog.ipAddress}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedLog.location?.city}, {selectedLog.location?.country}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">User Agent</Label>
                <p className="text-sm text-muted-foreground break-all">{selectedLog.userAgent}</p>
              </div>
              {selectedLog.details.before && (
                <div>
                  <Label className="text-sm font-medium">Before</Label>
                  <pre className="text-sm text-muted-foreground bg-gray-100 p-2 rounded">
                    {JSON.stringify(selectedLog.details.before, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.details.after && (
                <div>
                  <Label className="text-sm font-medium">After</Label>
                  <pre className="text-sm text-muted-foreground bg-gray-100 p-2 rounded">
                    {JSON.stringify(selectedLog.details.after, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.details.changes && (
                <div>
                  <Label className="text-sm font-medium">Changes</Label>
                  <pre className="text-sm text-muted-foreground bg-gray-100 p-2 rounded">
                    {JSON.stringify(selectedLog.details.changes, null, 2)}
                  </pre>
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
