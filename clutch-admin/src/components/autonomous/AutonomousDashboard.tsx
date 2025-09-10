'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Brain, 
  Shield, 
  RefreshCw, 
  Play, 
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// Types
interface DashboardData {
  system: {
    performance: {
      uptime: number;
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    health: {
      status: string;
      errorCount: number;
      lastError: string | null;
    };
  };
  analytics: {
    userMetrics: {
      activeUsers: number;
      newUsers: number;
      userEngagement: number;
      retention: number;
    };
    systemMetrics: {
      requests: number;
      errors: number;
      responseTime: number;
      throughput: number;
    };
    businessMetrics: {
      revenue: number;
      conversions: number;
      growth: number;
      satisfaction: number;
    };
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    userActivity: {
      logins: number;
      sessions: number;
      pageViews: number;
    };
  };
  financial: {
    revenue: {
      daily: number;
      monthly: number;
      growth: number;
    };
    costs: {
      operational: number;
      infrastructure: number;
      marketing: number;
    };
    profitability: {
      margin: number;
      roi: number;
    };
  };
  insights: Array<{
    id: number;
    timestamp: string;
    type: string;
    insight: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  health: {
    status: string;
    active: boolean;
    lastUpdate: string;
    errorCount: number;
  };
}

interface DashboardStatus {
  orchestrator: {
    active: boolean;
    status: string;
    lastUpdate: string;
    errorCount: number;
  };
  dataSources: Record<string, any>;
  dataCache: Record<string, any>;
  analytics: {
    insightsCount: number;
    lastInsight: string | null;
  };
  selfHealing: {
    autoFixAttempts: number;
    lastHealingAction: any;
    healingHistoryCount: number;
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://clutch-main-nk7x.onrender.com/api/v1';

export default function AutonomousDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardStatus, setDashboardStatus] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/autonomous-dashboard/data`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    }
  }, []);

  // Fetch dashboard status
  const fetchDashboardStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/autonomous-dashboard/status`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardStatus(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Dashboard status fetch error:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchDashboardStatus()]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchDashboardData, fetchDashboardStatus]);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchDashboardStatus();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchDashboardData, fetchDashboardStatus]);

  // Control functions
  const refreshData = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const triggerHealing = async () => {
    try {
      const response = await fetch(`${API_BASE}/autonomous-dashboard/heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchDashboardData();
        await fetchDashboardStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger healing');
    }
  };

  const startDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/autonomous-dashboard/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchDashboardData();
        await fetchDashboardStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start dashboard');
    }
  };

  const stopDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/autonomous-dashboard/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchDashboardStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop dashboard');
    }
  };

  // Utility functions
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Autonomous Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎛️ Autonomous Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Self-healing, AI-powered analytics system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
          <Badge className={getStatusColor(dashboardStatus?.orchestrator.status || 'unknown')}>
            {dashboardStatus?.orchestrator.status || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={refreshData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        <Button onClick={triggerHealing} variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Trigger Healing
        </Button>
        <Button onClick={startDashboard} variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Start Dashboard
        </Button>
        <Button onClick={stopDashboard} variant="outline">
          <Square className="h-4 w-4 mr-2" />
          Stop Dashboard
        </Button>
        <Button 
          onClick={() => setIsAutoRefresh(!isAutoRefresh)} 
          variant={isAutoRefresh ? "default" : "outline"}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
        </Button>
      </div>

      {/* Last Update */}
      <div className="text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleString()}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.system?.performance?.uptime 
                    ? formatUptime(dashboardData.system.performance.uptime)
                    : '0s'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  System Uptime
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {dashboardData?.system?.health?.errorCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {dashboardStatus?.selfHealing?.healingHistoryCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Healing Actions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Metrics</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.users?.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active Users
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {dashboardData?.users?.newRegistrations || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">New Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {dashboardData?.analytics?.userMetrics?.userEngagement?.toFixed(1) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.analytics?.systemMetrics?.responseTime?.toFixed(1) || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Response Time
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {dashboardData?.analytics?.systemMetrics?.requests || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {dashboardData?.analytics?.systemMetrics?.throughput?.toFixed(1) || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Throughput</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.financial?.revenue?.daily?.toFixed(2) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily Revenue
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      ${dashboardData?.financial?.revenue?.monthly?.toFixed(2) || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Monthly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {dashboardData?.financial?.revenue?.growth?.toFixed(1) || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Users:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.userMetrics?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.userMetrics?.newUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.userMetrics?.userEngagement?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Retention:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.userMetrics?.retention?.toFixed(1) || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Requests:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.systemMetrics?.requests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Errors:</span>
                  <span className="font-semibold text-red-600">{dashboardData?.analytics?.systemMetrics?.errors || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.systemMetrics?.responseTime?.toFixed(1) || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.systemMetrics?.throughput?.toFixed(1) || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-semibold">${dashboardData?.analytics?.businessMetrics?.revenue?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversions:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.businessMetrics?.conversions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.businessMetrics?.growth?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction:</span>
                  <span className="font-semibold">{dashboardData?.analytics?.businessMetrics?.satisfaction?.toFixed(1) || 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData?.users?.totalUsers || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-green-600">
                      {dashboardData?.users?.activeUsers || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-orange-600">
                      {dashboardData?.users?.newRegistrations || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">New Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Logins:</span>
                  <span className="font-semibold">{dashboardData?.users?.userActivity?.logins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span className="font-semibold">{dashboardData?.users?.userActivity?.sessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Page Views:</span>
                  <span className="font-semibold">{dashboardData?.users?.userActivity?.pageViews || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Daily:</span>
                  <span className="font-semibold">${dashboardData?.financial?.revenue?.daily?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly:</span>
                  <span className="font-semibold">${dashboardData?.financial?.revenue?.monthly?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-semibold text-green-600">
                    {dashboardData?.financial?.revenue?.growth?.toFixed(1) || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Operational:</span>
                  <span className="font-semibold">${dashboardData?.financial?.costs?.operational?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure:</span>
                  <span className="font-semibold">${dashboardData?.financial?.costs?.infrastructure?.toFixed(2) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing:</span>
                  <span className="font-semibold">${dashboardData?.financial?.costs?.marketing?.toFixed(2) || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Margin:</span>
                  <span className="font-semibold text-green-600">
                    {dashboardData?.financial?.profitability?.margin?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className="font-semibold text-blue-600">
                    {dashboardData?.financial?.profitability?.roi?.toFixed(1) || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-semibold">
                    {dashboardData?.system?.performance?.uptime 
                      ? formatUptime(dashboardData.system.performance.uptime)
                      : '0s'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-semibold">
                    {dashboardData?.system?.performance?.responseTime?.toFixed(1) || 0}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="font-semibold">
                    {dashboardData?.system?.performance?.memoryUsage?.toFixed(1) || 0}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="font-semibold">
                    {dashboardData?.system?.performance?.cpuUsage?.toFixed(1) || 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getStatusColor(dashboardData?.system?.health?.status || 'unknown')}>
                    {dashboardData?.system?.health?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Error Count:</span>
                  <span className="font-semibold text-red-600">
                    {dashboardData?.system?.health?.errorCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-semibold">
                    {dashboardData?.health?.active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-semibold text-sm">
                    {dashboardData?.health?.lastUpdate 
                      ? new Date(dashboardData.health.lastUpdate).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Generated Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.insights && dashboardData.insights.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.insights.slice(-5).map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(insight.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{insight.insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available yet</p>
                  <p className="text-sm">AI insights will appear here as the system learns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
