"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { EmployeeInvitationForm } from "@/components/employee-invitation-form";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { 
  UserCog, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Send,
  FileText,
  Award,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  status: "active" | "inactive" | "on_leave" | "terminated";
  employmentType: "full_time" | "part_time" | "contract" | "intern";
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills: string[];
  certifications: string[];
  performanceRating: number;
  lastReviewDate: string;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

interface JobApplication {
  _id: string;
  applicationId: string;
  jobTitle: string;
  department: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  priority: "low" | "medium" | "high";
  experience: number;
  education: string;
  skills: string[];
  resumeUrl: string;
  coverLetter: string;
  appliedDate: string;
  interviewDate?: string;
  offerDate?: string;
  startDate?: string;
  salary?: number;
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  openPositions: number;
  pendingApplications: number;
  averageSalary: number;
  turnoverRate: number;
  satisfactionScore: number;
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"employees" | "recruitment" | "invitations">("employees");
  const [isLoading, setIsLoading] = useState(true);
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadHRData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load employees
        const employeesResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/employees", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData.data || employeesData);
        }

        // Load job applications
        const applicationsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/applications", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.data || applicationsData);
        }

        // Load employee invitations
        const invitationsResponse = await apiService.getEmployeeInvitations();
        if (invitationsResponse.success) {
          setInvitations(invitationsResponse.data?.invitations || []);
        }

        // Load HR stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || statsData);
        } else {
          // Calculate stats from loaded data
          const totalEmployees = employees.length;
          const activeEmployees = employees.filter(e => e.status === "active").length;
          const newHires = employees.filter(e => 
            new Date(e.startDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length;
          const pendingApplications = applications.filter(a => 
            a.status === "applied" || a.status === "screening" || a.status === "interview"
          ).length;
          const averageSalary = employees.length > 0 
            ? employees.reduce((sum, e) => sum + e.salary, 0) / employees.length 
            : 0;

          setStats({
            totalEmployees,
            activeEmployees,
            newHires,
            openPositions: 5, // Default value
            pendingApplications,
            averageSalary,
            turnoverRate: 5.2, // Default value
            satisfactionScore: 4.3, // Default value
          });
        }
      } catch (error) {
        console.error("Failed to load HR data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHRData();
  }, []);

  useEffect(() => {
    let filteredEmps = employees || [];
    let filteredApps = applications || [];

    // Search filter
    if (searchQuery) {
      filteredEmps = filteredEmps.filter(employee =>
        employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredApps = filteredApps.filter(application =>
        application.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredEmps = filteredEmps.filter(employee => employee.status === statusFilter);
      filteredApps = filteredApps.filter(application => application.status === statusFilter);
    }

    setFilteredEmployees(filteredEmps);
    setFilteredApplications(filteredApps);
  }, [employees, applications, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "hired":
        return "success";
      case "inactive":
      case "terminated":
      case "rejected":
        return "destructive";
      case "on_leave":
      case "applied":
      case "screening":
        return "warning";
      case "interview":
      case "offer":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "full_time":
        return "success";
      case "part_time":
        return "info";
      case "contract":
        return "warning";
      case "intern":
        return "default";
      default:
        return "default";
    }
  };

  const handleEmployeeAction = async (employeeId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "activate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/employees/${employeeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "active" }),
          });
          break;
        case "terminate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/employees/${employeeId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "terminated", endDate: new Date().toISOString() }),
          });
          break;
        case "promote":
          // This would open a promotion modal/form
          console.log("Promote employee:", employeeId);
          break;
      }
      
      // Reload employees
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/employees", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} employee:`, error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await apiService.resendInvitation(invitationId);
      if (response.success) {
        toast.success("Invitation resent successfully");
        // Reload invitations
        const invitationsResponse = await apiService.getEmployeeInvitations();
        if (invitationsResponse.success) {
          setInvitations(invitationsResponse.data?.invitations || []);
        }
      } else {
        toast.error("Failed to resend invitation");
      }
    } catch (error) {
      console.error("Resend invitation error:", error);
      toast.error("Failed to resend invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      const response = await apiService.cancelInvitation(invitationId);
      if (response.success) {
        toast.success("Invitation cancelled successfully");
        // Reload invitations
        const invitationsResponse = await apiService.getEmployeeInvitations();
        if (invitationsResponse.success) {
          setInvitations(invitationsResponse.data?.invitations || []);
        }
      } else {
        toast.error("Failed to cancel invitation");
      }
    } catch (error) {
      console.error("Cancel invitation error:", error);
      toast.error("Failed to cancel invitation");
    }
  };

  const handleInvitationSuccess = async () => {
    setShowInvitationForm(false);
    // Reload invitations
    const invitationsResponse = await apiService.getEmployeeInvitations();
    if (invitationsResponse.success) {
      setInvitations(invitationsResponse.data?.invitations || []);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "schedule_interview":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/applications/${applicationId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              status: "interview",
              interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }),
          });
          break;
        case "make_offer":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/applications/${applicationId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              status: "offer",
              offerDate: new Date().toISOString()
            }),
          });
          break;
        case "hire":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/applications/${applicationId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              status: "hired",
              startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }),
          });
          break;
        case "reject":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/applications/${applicationId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "rejected" }),
          });
          break;
      }
      
      // Reload applications
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/applications", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading HR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-sans">Human Resources</h1>
          <p className="text-muted-foreground font-sans">
            Manage employees, recruitment, and HR operations
          </p>
        </div>
        {hasPermission("manage_hr") && (
          <div className="flex space-x-2">
            <Button onClick={() => setShowInvitationForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Employee
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.totalEmployees : employees.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.activeEmployees : employees.filter(e => e.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.newHires : employees.filter(e => 
                new Date(e.startDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.pendingApplications : applications.filter(a => 
                a.status === "applied" || a.status === "screening" || a.status === "interview"
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.openPositions : 5} open positions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats ? Math.round(stats.averageSalary).toLocaleString() : 
                employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "employees" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("employees")}
        >
          <Users className="mr-2 h-4 w-4" />
          Employees
        </Button>
        <Button
          variant={activeTab === "invitations" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("invitations")}
        >
          <Mail className="mr-2 h-4 w-4" />
          Invitations ({invitations.filter(i => i.status === 'pending').length})
        </Button>
        <Button
          variant={activeTab === "recruitment" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("recruitment")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Recruitment
        </Button>
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>
              Manage employee information and records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {employee.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                      <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(employee.status) as any}>
                          {employee.status}
                        </Badge>
                        <Badge variant={getEmploymentTypeColor(employee.employmentType) as any}>
                          {employee.employmentType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {employee.employeeId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${employee.salary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Started: {formatDate(employee.startDate)}</p>
                      <p>Manager: {employee.manager}</p>
                      <p>Performance: {employee.performanceRating}/5</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Records
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEmployeeAction(employee._id, "promote")}
                          className="text-green-600"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Promote
                        </DropdownMenuItem>
                        {employee.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleEmployeeAction(employee._id, "terminate")}
                            className="text-red-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Terminate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employees found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invitations Tab */}
      {activeTab === "invitations" && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Invitations</CardTitle>
            <CardDescription>
              Manage pending employee invitations and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">
                        {invitation.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{invitation.name}</p>
                      <p className="text-sm text-muted-foreground">{invitation.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(invitation.status) as any}>
                          {invitation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {invitation.role} • {invitation.department}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Expires: {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {invitation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation._id)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelInvitation(invitation._id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {invitations.length === 0 && (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invitations found</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowInvitationForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Send First Invitation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recruitment Tab */}
      {activeTab === "recruitment" && (
        <Card>
          <CardHeader>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription>
              Manage recruitment and hiring process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">
                        {application.candidateName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{application.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{application.jobTitle} • {application.department}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(application.status) as any}>
                          {application.status}
                        </Badge>
                        <Badge variant={getPriorityColor(application.priority) as any}>
                          {application.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {application.experience} years exp
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {application.education}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Applied: {formatDate(application.appliedDate)}</p>
                      {application.interviewDate && (
                        <p>Interview: {formatDate(application.interviewDate)}</p>
                      )}
                      {application.salary && (
                        <p>Salary: ${application.salary.toLocaleString()}</p>
                      )}
                      <p>Assigned: {application.assignedTo}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Application
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Resume
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Candidate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {application.status === "applied" && (
                          <DropdownMenuItem 
                            onClick={() => handleApplicationAction(application._id, "schedule_interview")}
                            className="text-blue-600"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                        )}
                        {application.status === "interview" && (
                          <DropdownMenuItem 
                            onClick={() => handleApplicationAction(application._id, "make_offer")}
                            className="text-green-600"
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Make Offer
                          </DropdownMenuItem>
                        )}
                        {application.status === "offer" && (
                          <DropdownMenuItem 
                            onClick={() => handleApplicationAction(application._id, "hire")}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Hire Candidate
                          </DropdownMenuItem>
                        )}
                        {application.status !== "hired" && application.status !== "rejected" && (
                          <DropdownMenuItem 
                            onClick={() => handleApplicationAction(application._id, "reject")}
                            className="text-red-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Reject Application
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invitation Form Modal */}
      {showInvitationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EmployeeInvitationForm
              onSuccess={handleInvitationSuccess}
              onCancel={() => setShowInvitationForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
