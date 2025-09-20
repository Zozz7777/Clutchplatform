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
  Activity
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
    console.error('Failed to initialize quick actions:', error);
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
        toast.error(t('users.failedToLoadUsers'));
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
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
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
      case "platform_admin":
        return <Shield className="h-4 w-4" />;
      case "enterprise_client":
        return <Building2 className="h-4 w-4" />;
      case "service_provider":
        return <UserCog className="h-4 w-4" />;
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
          <Button className="shadow-2xs" onClick={addUser}>
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
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
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
              {users.filter(u => u.status === "active").length}
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
              {users.filter(u => u.role === "enterprise_client").length}
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
              {users.filter(u => u.role === "service_provider").length}
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
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="clients">Enterprise Clients</TabsTrigger>
          <TabsTrigger value="providers">Service Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">All Users</CardTitle>
              <CardDescription>Complete user directory with filtering and search</CardDescription>
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
                    <SelectItem value="platform_admin">Platform Admin</SelectItem>
                    <SelectItem value="enterprise_client">Enterprise Client</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="business_analyst">Business Analyst</SelectItem>
                    <SelectItem value="customer_support">Customer Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="text-sm capitalize">{user.role.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(user.lastLogin)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
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

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">B2C Customers</CardTitle>
              <CardDescription>Individual customers using the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {users.filter(u => u.role === "customer").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">87%</p>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Customer Activity</h3>
                  <div className="space-y-2">
                    {users
                      .filter(u => u.role === "customer")
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-primary-foreground text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatRelativeTime(user.lastLogin)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Enterprise Clients</CardTitle>
              <CardDescription>B2B enterprise accounts and their management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {users.filter(u => u.role === "enterprise_client").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Enterprise Clients</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">92%</p>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Enterprise Client Overview</h3>
                  <div className="space-y-2">
                    {users
                      .filter(u => u.role === "enterprise_client")
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatRelativeTime(user.lastLogin)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-card-foreground">Service Providers</CardTitle>
              <CardDescription>Service providers and their capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <UserCog className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {users.filter(u => u.role === "service_provider").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Service Providers</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">N/A</p>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-[0.625rem]">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">89%</p>
                    <p className="text-sm text-muted-foreground">Active Rate</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Provider Overview</h3>
                  <div className="space-y-2">
                    {users
                      .filter(u => u.role === "service_provider")
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                              <UserCog className="h-4 w-4 text-success" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatRelativeTime(user.lastLogin)}
                            </p>
                          </div>
                        </div>
                      ))}
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">User Analytics</h2>
            <p className="text-muted-foreground">
              Deep insights into user adoption, engagement, and retention
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