"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productionApi } from "@/lib/production-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { useQuickActions } from "@/lib/quick-actions";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

// Import new Phase 2 widgets
import UserGrowthCohort from "@/components/widgets/user-growth-cohort";
import EngagementHeatmap from "@/components/widgets/engagement-heatmap";
import OnboardingCompletion from "@/components/widgets/onboarding-completion";
import RoleDistribution from "@/components/widgets/role-distribution";
import ChurnRiskCard from "@/components/widgets/churn-risk-card";

// Define User type locally since we're not using mock API
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  avatar?: string;
  department?: string;
  permissions?: string[];
}
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  Building2,
  UserCog,
  TrendingUp,
  Activity,
  Crown,
  BarChart3,
  Headphones,
  DollarSign,
  Scale,
  FolderKanban,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();
  // Safely get quick actions with error handling
  let addUser: (() => void) | null = null;
  
  try {
    // Ensure hasPermission is a function before using it
    const permissionCheck = typeof hasPermission === 'function' ? hasPermission : () => true;
    const quickActions = useQuickActions(permissionCheck);
    addUser = quickActions.addUser;
  } catch (error) {
    handleError(error, { component: 'UsersPage', action: 'initialize_quick_actions' });
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const userData = await productionApi.getUsers();
        setUsers(userData || []);
        setFilteredUsers(userData || []);
      } catch (error) {
        // Error handled by API service
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to load users: ${errorMessage}`);
        // Set empty arrays on error - no mock data fallback
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    // Ensure users is always an array and handle null/undefined values
    const usersArray = Array.isArray(users) ? users : [];
    let filtered = usersArray.filter(user => user != null);

    if (searchQuery) {
      filtered = filtered.filter(user =>
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user && user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user && user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter, roleFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-secondary/10 text-secondary-foreground";
      case "suspended":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "head_administrator":
        return <Shield className="h-4 w-4" />;
      case "platform_admin":
        return <Shield className="h-4 w-4" />;
      case "executive":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "enterprise_client":
        return <Building2 className="h-4 w-4" />;
      case "service_provider":
        return <UserCog className="h-4 w-4" />;
      case "business_analyst":
        return <BarChart3 className="h-4 w-4" />;
      case "customer_support":
        return <Headphones className="h-4 w-4" />;
      case "hr_manager":
        return <Users className="h-4 w-4" />;
      case "finance_officer":
        return <DollarSign className="h-4 w-4" />;
      case "legal_team":
        return <Scale className="h-4 w-4" />;
      case "project_manager":
        return <FolderKanban className="h-4 w-4" />;
      case "asset_manager":
        return <Package className="h-4 w-4" />;
      case "vendor_manager":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">{t('users.loadingUsers')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('users.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('users.description')}
          </p>
        </div>
        {hasPermission("create_users") && (
          <Button className="shadow-2xs" onClick={addUser || (() => {})}>
            <Plus className="mr-2 h-4 w-4" />
            {t('users.addUser')}
          </Button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('users.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Array.isArray(users) ? users.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">N/A</span> {t('users.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('users.activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(users) ? users.filter(u => u && u.status === "active").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">N/A</span> {t('users.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('users.enterpriseClients')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(users) ? users.filter(u => u && u.role === "enterprise_client").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">N/A</span> {t('users.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{t('users.serviceProviders')}</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Array.isArray(users) ? users.filter(u => u && u.role === "service_provider").length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-muted-foreground">N/A</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t('dashboard.allUsers')}</TabsTrigger>
          <TabsTrigger value="customers">{t('dashboard.b2cCustomers')}</TabsTrigger>
          <TabsTrigger value="clients">{t('dashboard.enterpriseClients')}</TabsTrigger>
          <TabsTrigger value="providers">{t('dashboard.serviceProviders')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.allUsers')}</CardTitle>
              <CardDescription>{t('dashboard.completeUserDirectory')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('users.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('users.filterByRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="head_administrator">Head Administrator</SelectItem>
                    <SelectItem value="platform_admin">Platform Admin</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="enterprise_client">Enterprise Client</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="customer_support">Customer Support</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="finance_officer">Finance Officer</SelectItem>
                    <SelectItem value="legal_team">Legal Team</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="asset_manager">Asset Manager</SelectItem>
                    <SelectItem value="vendor_manager">Vendor Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.user')}</TableHead>
                    <TableHead>{t('dashboard.role')}</TableHead>
                    <TableHead>{t('dashboard.status')}</TableHead>
                    <TableHead>{t('dashboard.lastLogin')}</TableHead>
                    <TableHead>{t('dashboard.created')}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    if (!user || !user.id) return null;
                    
                    return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role || 'user')}
                          <span className="text-sm capitalize">{(user.role || 'user').replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status || 'unknown')}>
                          {user.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
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
                              <UserCheck className="mr-2 h-4 w-4" />
                              {t('dashboard.viewProfile')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              {t('dashboard.manageRoles')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="mr-2 h-4 w-4" />
                              {t('dashboard.suspendUser')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.b2cCustomers')}</CardTitle>
              <CardDescription>{t('dashboard.individualCustomersUsing')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {Array.isArray(users) ? users.filter(u => u && ["enterprise_client", "service_provider"].includes(u.role)).length : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalCustomers')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.growthRate')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">87%</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.activeRate')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Customer Activity</h3>
                  <div className="space-y-2">
                    {Array.isArray(users) ? users
                      .filter(u => u && ["enterprise_client", "service_provider"].includes(u.role))
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {(user.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status || 'unknown')}>
                              {user.status || 'Unknown'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                            </p>
                          </div>
                        </div>
                      )) : []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.enterpriseClients')}</CardTitle>
              <CardDescription>{t('dashboard.b2bEnterpriseAccounts')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {Array.isArray(users) ? users.filter(u => u && u.role === "enterprise_client").length : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.enterpriseClients')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.growthRate')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">92%</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.activeRate')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enterprise Client Overview</h3>
                  <div className="space-y-2">
                    {Array.isArray(users) ? users
                      .filter(u => u && u.role === "enterprise_client")
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status || 'unknown')}>
                              {user.status || 'Unknown'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                            </p>
                          </div>
                        </div>
                      )) : []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('dashboard.serviceProviders')}</CardTitle>
              <CardDescription>{t('dashboard.thirdPartyServiceProviders')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <UserCog className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {Array.isArray(users) ? users.filter(u => u && u.role === "service_provider").length : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.totalServiceProviders')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.growthRate')}</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">89%</p>
                    <p className="text-sm text-muted-foreground">{t('dashboard.activeRate')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Provider Overview</h3>
                  <div className="space-y-2">
                    {Array.isArray(users) ? users
                      .filter(u => u && u.role === "service_provider")
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                              <UserCog className="h-4 w-4 text-success" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status || 'unknown')}>
                              {user.status || 'Unknown'}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                            </p>
                          </div>
                        </div>
                      )) : []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 2: User Analytics Widgets */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.userAnalytics')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.deepInsightsIntoUser')}
            </p>
          </div>
        </div>

        {/* Top Row - Growth & Engagement */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UserGrowthCohort className="lg:col-span-2" />
          <EngagementHeatmap />
        </div>

        {/* Second Row - Onboarding & Roles */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <OnboardingCompletion />
          <RoleDistribution />
          <ChurnRiskCard />
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
