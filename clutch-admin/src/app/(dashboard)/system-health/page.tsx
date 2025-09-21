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
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Settings,
  Eye,
  Download,
  BarChart3,
  Monitor,
  Smartphone,
  Cloud,
  Database as DbIcon,
  FileText,
  Users,
  Calendar,
  Filter,
} from "lucide-react";
import { productionApi } from "@/lib/production-api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface SystemStatus {
  overall: "healthy" | "degraded" | "critical" | "down";
  uptime: number; // seconds
  lastCheck: string;
  services: {
    name: string;
    status: "healthy" | "degraded" | "critical" | "down";
    responseTime: number; // ms
    uptime: number; // percentage
    lastCheck: string;
  }[];
}

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number; // percentage
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number; // ms
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number; // ms
    slowQueries: number;
  };
}

interface PerformanceMetric {
  _id: string;
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  createdAt: string;
}

interface SystemAlert {
  _id: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  type: "cpu" | "memory" | "disk" | "network" | "database" | "service" | "security";
  title: string;
  description: string;
  source: string;
  status: "open" | "acknowledged" | "resolved" | "dismissed";
  acknowledgedBy?: {
    id: string;
    name: string;
  };
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface SystemLog {
  _id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  source: string;
  message: string;
  context: Record<string, unknown>;
  tags: string[];
  createdAt: string;
}

export default function SystemHealthPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // System status and metrics are loaded from API in loadSystemData function

  // Load real data from API
  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [healthData, alertsData, logsData] = await Promise.all([
        productionApi.getSystemHealth(),
        productionApi.getSystemAlerts(),
        productionApi.getSystemLogs()
      ]);
      
      setSystemStatus(healthData?.status || null);
      setSystemMetrics(healthData?.metrics || null);
      setAlerts(alertsData || []);
      setLogs(logsData || []);
    } catch (error) {
      logger.error('Failed to load system data:', error);
      // Set fallback data if API fails
      setAlerts([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-primary/10 text-primary-foreground";
      case "degraded":
        return "bg-secondary/10 text-primary-foreground";
      case "critical":
        return "bg-secondary/10 text-primary-foreground";
      case "down":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-secondary/10 text-primary-foreground";
      case "medium":
        return "bg-secondary/10 text-primary-foreground";
      case "low":
        return "bg-secondary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "fatal":
      case "error":
        return "bg-destructive/10 text-destructive-foreground";
      case "warn":
        return "bg-secondary/10 text-primary-foreground";
      case "info":
        return "bg-secondary/10 text-primary-foreground";
      case "debug":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-primary" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const openAlerts = alerts.filter(a => a.status === "open").length;
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const errorLogs = logs.filter(l => l.level === "error" || l.level === "fatal").length;

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system performance, alerts, and infrastructure status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-primary/10 border-primary/20" : ""}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" onClick={loadSystemData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {systemStatus?.overall === "healthy" ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : systemStatus?.overall === "degraded" ? (
                <AlertTriangle className="h-5 w-5 text-secondary" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className="text-2xl font-bold capitalize">{systemStatus?.overall}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemStatus ? formatUptime(systemStatus.uptime) : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Logs</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorLogs}</div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus?.services.filter(s => s.status === "healthy").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              / {systemStatus?.services.length || 0} healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.cpu.usage.toFixed(1)}%</div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${systemMetrics.cpu.usage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {systemMetrics.cpu.cores} cores
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.memory.usage.toFixed(1)}%</div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${systemMetrics.memory.usage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.disk.usage.toFixed(1)}%</div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full" 
                    style={{ width: `${systemMetrics.disk.usage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.network.latency}ms</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(systemMetrics.network.bytesIn)} in / {formatBytes(systemMetrics.network.bytesOut)} out
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Services Status</CardTitle>
          <CardDescription>
            Real-time status of all system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus?.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-[0.625rem]">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Response time: {service.responseTime}ms • Uptime: {service.uptime}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last check: {new Date(service.lastCheck).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  {service.status === "healthy" ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : service.status === "degraded" ? (
                    <AlertTriangle className="h-5 w-5 text-secondary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>
            Active and recent system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert._id} className="flex items-center justify-between p-4 border rounded-[0.625rem]">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-destructive/10 rounded-[0.625rem]">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.source} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">
                    {alert.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowAlertDialog(true);
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

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Logs</CardTitle>
          <CardDescription>
            Latest system log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.slice(0, 20).map((log) => (
              <div key={log._id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                <div className="flex items-center space-x-4">
                  <Badge className={getLogLevelColor(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{log.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.source} • {new Date(log.timestamp).toLocaleString()}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected alert
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{selectedAlert.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Severity</Label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-muted-foreground">{selectedAlert.source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline">{selectedAlert.status}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Timestamp</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAlert.timestamp).toLocaleString()}
                </p>
              </div>
              {selectedAlert.metadata && (
                <div>
                  <Label className="text-sm font-medium">Metadata</Label>
                  <pre className="text-sm text-muted-foreground bg-muted p-2 rounded-[0.625rem]">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Close
            </Button>
            {selectedAlert?.status === "open" && (
              <Button onClick={async () => {
                try {
                  // Acknowledge the alert via API
                  await productionApi.acknowledgeAlert(selectedAlert.id);
                  // Update local state
                  setAlerts(prev => prev.map(alert => 
                    alert.id === selectedAlert.id 
                      ? { ...alert, status: 'acknowledged' }
                      : alert
                  ));
                  setShowAlertDialog(false);
                  logger.log('Alert acknowledged successfully');
                } catch (error) {
                  logger.error('Failed to acknowledge alert:', error);
                  toast.error('Failed to acknowledge alert. Please try again.');
                }
              }}>
                Acknowledge Alert
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


