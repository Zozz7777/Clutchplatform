"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { productionApi } from "@/lib/production-api";
import { realApi } from "@/lib/real-api";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";

// Import new Phase 2 widgets
import UserGrowthCohort from "@/components/widgets/user-growth-cohort";
import EngagementHeatmap from "@/components/widgets/engagement-heatmap";
import OnboardingCompletion from "@/components/widgets/onboarding-completion";
import RoleDistribution from "@/components/widgets/role-distribution";
import ChurnRiskCard from "@/components/widgets/churn-risk-card";
import WidgetErrorBoundary from "@/components/widgets/widget-error-boundary";

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

// Additional interfaces for merged functionality
interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  userCount: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
}

interface UserCohort {
  id: string;
  name: string;
  description: string;
  userCount: number;
  retentionRate: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface UserJourney {
  id: string;
  stage: string;
  userCount: number;
  conversionRate: number;
  averageTime: string;
  nextStage: string;
}

interface UserProvider {
  id: string;
  name: string;
  type: string;
  userCount: number;
  status: 'active' | 'inactive';
  lastSync: string;
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
  Package,
  Target,
  Clock,
  Route,
  Database,
  ShoppingCart,
  CreditCard
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
  // Main users state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active'
  });

  // Additional state for merged functionality
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [cohorts, setCohorts] = useState<UserCohort[]>([]);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [providers, setProviders] = useState<UserProvider[]>([]);
  const [b2cUsers, setB2cUsers] = useState<User[]>([]);
  const [b2bUsers, setB2bUsers] = useState<User[]>([]);

  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Load all user-related data
        const [usersData, segmentsData, cohortsData, journeysData, providersData, b2cData, b2bData] = await Promise.allSettled([
          productionApi.getUsers(),
          productionApi.getUserSegments?.() || Promise.resolve([]),
          productionApi.getUserCohorts?.() || Promise.resolve([]),
          productionApi.getUserJourneys?.() || Promise.resolve([]),
          productionApi.getUserProviders?.() || Promise.resolve([]),
          realApi.getUsers?.() || Promise.resolve([]),
          realApi.getUsers?.() || Promise.resolve([])
        ]);

        // Set users data
        if (usersData.status === 'fulfilled') {
          setUsers(usersData.value || []);
          setFilteredUsers(usersData.value || []);
        }

        // Set additional data
        if (segmentsData.status === 'fulfilled') setSegments(segmentsData.value || []);
        if (cohortsData.status === 'fulfilled') setCohorts(cohortsData.value || []);
        if (journeysData.status === 'fulfilled') setJourneys(journeysData.value || []);
        if (providersData.status === 'fulfilled') setProviders(providersData.value || []);
        if (b2cData.status === 'fulfilled') setB2cUsers(b2cData.value || []);
        if (b2bData.status === 'fulfilled') setB2bUsers(b2bData.value || []);

      } catch (error) {
        handleError(error, { component: 'UsersPage', action: 'load_data' });
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleCreateUser = async () => {
    try {
      const result = await productionApi.createUser(newUser);
      if (result) {
        setUsers(prev => [...prev, result]);
        setNewUser({ name: '', email: '', role: '', status: 'active' });
        setIsCreateDialogOpen(false);
        toast.success('User created successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create user: ${errorMessage}`);
    }
  };

  useEffect(() => {
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
          <p className="text-muted-foreground font-sans">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">User Management</h1>
          <p className="text-muted-foreground font-sans">
            Manage all users, segments, cohorts, and user analytics
          </p>
        </div>
        {hasPermission("create_users") && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-2xs">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter user name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateUser}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="b2c">B2C Users</TabsTrigger>
          <TabsTrigger value="b2b">B2B Users</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all-users" className="space-y-4">
          {/* Analytics Widgets */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <WidgetErrorBoundary>
              <UserGrowthCohort />
            </WidgetErrorBoundary>
            <WidgetErrorBoundary>
              <EngagementHeatmap />
            </WidgetErrorBoundary>
            <WidgetErrorBoundary>
              <OnboardingCompletion />
            </WidgetErrorBoundary>
            <WidgetErrorBoundary>
              <RoleDistribution />
            </WidgetErrorBoundary>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage and view all system users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
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
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
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
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                              ) : (
                                <Users className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(user.createdAt)}
                          </div>
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* B2C Users Tab */}
        <TabsContent value="b2c" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>B2C Users</CardTitle>
              <CardDescription>
                Consumer users and their activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total B2C Users</p>
                    <p className="text-2xl font-bold">{b2cUsers.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Active Subscriptions</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Growth Rate</p>
                    <p className="text-2xl font-bold">+12.5%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* B2B Users Tab */}
        <TabsContent value="b2b" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>B2B Users</CardTitle>
              <CardDescription>
                Business users and enterprise accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Enterprise Accounts</p>
                    <p className="text-2xl font-bold">{b2bUsers.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Team Members</p>
                    <p className="text-2xl font-bold">5,678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ARPU</p>
                    <p className="text-2xl font-bold">$2,450</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>
                Create and manage user segments for targeted campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{segment.name}</h3>
                        <p className="text-sm text-muted-foreground">{segment.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {segment.userCount} users • {segment.criteria.length} criteria
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={segment.status === 'active' ? 'default' : 'secondary'}>
                        {segment.status}
                      </Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Cohorts</CardTitle>
              <CardDescription>
                Analyze user retention and behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohorts.map((cohort) => (
                  <div key={cohort.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{cohort.name}</h3>
                        <p className="text-sm text-muted-foreground">{cohort.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {cohort.userCount} users • {cohort.retentionRate}% retention
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                        {cohort.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Analytics</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey Tab */}
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
              <CardDescription>
                Track user progression through different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journeys.map((journey) => (
                  <div key={journey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Route className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{journey.stage}</h3>
                        <p className="text-sm text-muted-foreground">
                          {journey.userCount} users • {journey.conversionRate}% conversion
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Avg time: {journey.averageTime} • Next: {journey.nextStage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Providers</CardTitle>
              <CardDescription>
                Manage authentication providers and user sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.type} • {provider.userCount} users
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: {formatRelativeTime(provider.lastSync)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                        {provider.status}
                      </Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}