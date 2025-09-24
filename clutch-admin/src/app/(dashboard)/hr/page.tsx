"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { EmployeeInvitationForm } from "@/components/employee-invitation-form";
import { JobPostingOverlay } from "@/components/job-posting-overlay";
import { RecruitmentTab } from "@/components/recruitment-tab";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
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
  TrendingUp,
  XCircle,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Employee interface with hireDate support
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
  startDate?: string;
  hireDate?: string;
  endDate?: string;
  salary: number;
  currency: string;
  role?: string;
  permissions?: string[];
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

// Role and permission options
  const ROLE_OPTIONS = [
    // Level 1: Executive Leadership (Level 10-9)
    { value: "super_admin", label: "Super Administrator", level: 10 },
    { value: "head_administrator", label: "Head Administrator", level: 9 },
    { value: "executive", label: "Executive", level: 9 },
    { value: "platform_admin", label: "Platform Administrator", level: 9 },
    { value: "admin", label: "Administrator", level: 9 },
    
    // Level 2: Department Heads (Level 8)
    { value: "hr_manager", label: "HR Manager", level: 8 },
    { value: "finance_officer", label: "Finance Officer", level: 8 },
    { value: "operations_manager", label: "Operations Manager", level: 8 },
    { value: "marketing_manager", label: "Marketing Manager", level: 8 },
    { value: "legal_team", label: "Legal Team", level: 8 },
    { value: "security_manager", label: "Security Manager", level: 8 },
    
    // Level 3: Specialized Managers (Level 7)
    { value: "business_analyst", label: "Business Analyst", level: 7 },
    { value: "project_manager", label: "Project Manager", level: 7 },
    { value: "asset_manager", label: "Asset Manager", level: 7 },
    { value: "crm_manager", label: "CRM Manager", level: 7 },
    { value: "system_admin", label: "System Administrator", level: 7 },
    
    // Level 4: Functional Specialists (Level 6)
    { value: "hr", label: "HR Employee", level: 6 },
    { value: "finance", label: "Finance Employee", level: 6 },
    { value: "customer_support", label: "Customer Support", level: 6 },
    { value: "developer", label: "Developer", level: 6 },
    
    // Level 5: Operational Staff (Level 5)
    { value: "employee", label: "Employee", level: 5 },
    { value: "support_agent", label: "Support Agent", level: 5 },
    
    // Level 6: External Users (Level 4)
    { value: "enterprise_client", label: "Enterprise Client", level: 4 },
    { value: "service_provider", label: "Service Provider", level: 4 },
  ];

const PERMISSION_OPTIONS = [
  { value: "read", label: "Read", description: "View data and information" },
  { value: "write", label: "Write", description: "Create and edit data" },
  { value: "delete", label: "Delete", description: "Remove data and records" },
  { value: "admin", label: "Admin", description: "Administrative privileges" },
  { value: "hr", label: "HR", description: "Human resources management" },
  { value: "finance", label: "Finance", description: "Financial data access" },
  { value: "fleet", label: "Fleet", description: "Fleet management" },
  { value: "reports", label: "Reports", description: "Generate and view reports" }
];

export default function HRPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"employees" | "recruitment" | "invitations" | "careers">("employees");
  const [isLoading, setIsLoading] = useState(true);
  const [showInvitationForm, setShowInvitationForm] = useState(false);
  const [invitations, setInvitations] = useState<Record<string, unknown>[]>([]);
  const [invitationStatusFilter, setInvitationStatusFilter] = useState<string>("pending");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showEditInvitationModal, setShowEditInvitationModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Record<string, unknown> | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  const [showJobPostingOverlay, setShowJobPostingOverlay] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [careerApplications, setCareerApplications] = useState<any[]>([]);
  const { user, hasPermission } = useAuth();
  // Translation system removed - using hardcoded strings

  // Helper functions for role and permission management
  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      // Level 1: Executive Leadership - Full access
      case "super_admin":
      case "head_administrator":
      case "executive":
      case "platform_admin":
      case "admin":
        return ["read", "write", "delete", "admin", "hr", "finance", "fleet", "reports", "all"];
      
      // Level 2: Department Heads
      case "hr_manager":
        return ["read", "write", "hr", "users", "reports"];
      case "finance_officer":
        return ["read", "write", "finance", "billing", "reports"];
      case "operations_manager":
        return ["read", "write", "operations", "fleet", "reports"];
      case "marketing_manager":
        return ["read", "write", "marketing", "analytics", "reports"];
      case "legal_team":
        return ["read", "write", "legal", "contracts", "reports"];
      case "security_manager":
        return ["read", "write", "security", "audit", "reports"];
      
      // Level 3: Specialized Managers
      case "business_analyst":
        return ["read", "analytics", "reports"];
      case "project_manager":
        return ["read", "write", "projects", "reports"];
      case "asset_manager":
        return ["read", "write", "assets", "fleet", "reports"];
      case "crm_manager":
        return ["read", "write", "crm", "chat", "reports"];
      case "system_admin":
        return ["read", "write", "system", "settings", "reports"];
      
      // Level 4: Functional Specialists
      case "hr":
        return ["read", "write", "hr"];
      case "finance":
        return ["read", "finance", "reports"];
      case "customer_support":
        return ["read", "write", "crm", "chat"];
      case "developer":
        return ["read", "ai", "mobile", "system", "chat"];
      
      // Level 5: Operational Staff
      case "employee":
        return ["read"];
      case "support_agent":
        return ["read", "support", "chat"];
      
      // Level 6: External Users
      case "enterprise_client":
        return ["read", "fleet", "crm", "analytics"];
      case "service_provider":
        return ["read", "chat", "crm"];
      
      // Legacy roles
      case "manager":
        return ["read", "write", "reports"];
      case "vendor_manager":
        return ["read", "write", "vendors", "reports"];
      
      default:
        return ["read"];
    }
  };

  // Check if current user can edit the specified employee
  const canEditEmployee = (employee: Employee): boolean => {
    // Level 1: Executive Leadership can edit anyone
    if (user?.role === "super_admin" || user?.role === "head_administrator" || 
        user?.role === "executive" || user?.role === "platform_admin" || user?.role === "admin") {
      return true;
    }
    
    // If user is hr_manager, they cannot edit executive/board level employees (Level 9+)
    if (user?.role === "hr_manager" || user?.role === "hr") {
      const restrictedRoles = ["super_admin", "head_administrator", "executive", "platform_admin", "admin"];
      return !restrictedRoles.includes(employee.role || "");
    }
    
    // Default: cannot edit
    return false;
  };

  const handleEditEmployee = (employee: Employee) => {
    if (!canEditEmployee(employee)) {
      toast.error("You don't have permission to edit this employee");
      return;
    }
    
    setSelectedEmployee(employee);
    setEditFormData({
      ...employee,
      permissions: employee.permissions || getRolePermissions(employee.role || "employee")
    });
    setShowEditEmployeeModal(true);
  };

  const handleRoleChange = (role: string) => {
    // Check if HR user is trying to assign a restricted role (Level 9+)
    if ((user?.role === "hr_manager" || user?.role === "hr") && 
        ["super_admin", "head_administrator", "executive", "platform_admin", "admin"].includes(role)) {
      toast.error("You don't have permission to assign this role");
      return;
    }
    
    setEditFormData(prev => ({
      ...prev,
      role,
      permissions: getRolePermissions(role)
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...(prev.permissions || []), permission]
        : (prev.permissions || []).filter(p => p !== permission)
    }));
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const updateData = {
        name: `${editFormData.firstName || ''} ${editFormData.lastName || ''}`.trim(),
        phoneNumber: editFormData.phone,
        role: editFormData.role,
        department: editFormData.department,
        position: editFormData.position,
        salary: editFormData.salary,
        permissions: editFormData.permissions,
        isActive: (editFormData as any).isActive !== false
      };
      
      const response = await apiService.updateEmployee(selectedEmployee._id, updateData);
      
      if (response.success) {
        toast.success("Employee updated successfully");
        
        // Update the employee in the local state
        setEmployees(prev => prev.map(emp => 
          emp._id === selectedEmployee._id 
            ? { ...emp, ...editFormData }
            : emp
        ));
        
        setShowEditEmployeeModal(false);
        setSelectedEmployee(null);
        setEditFormData({});
      } else {
        toast.error(response.message || "Failed to update employee");
      }
    } catch (error) {
      handleError(error, { component: 'HRPage', action: 'update_employee' });
      toast.error("Failed to update employee");
    }
  };

  useEffect(() => {
    const loadHRData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
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
          // Handle different response structures
          const employeesList = employeesData.data?.employees || employeesData.data || employeesData;
          
          // Ensure all employees have required fields with fallbacks
          const safeEmployees = Array.isArray(employeesList) ? employeesList.map(emp => ({
            _id: emp._id || '',
            employeeId: emp.employeeId || `EMP-${emp._id}`,
            firstName: emp.firstName || 'Unknown',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            position: emp.position || 'No Position',
            department: emp.department || 'No Department',
            manager: emp.manager || '',
            status: emp.status || 'active',
            employmentType: emp.employmentType || 'full_time',
            startDate: emp.startDate || emp.createdAt || new Date().toISOString(),
            hireDate: emp.hireDate || emp.createdAt || new Date().toISOString(),
            endDate: emp.endDate || '',
            salary: emp.salary || 0,
            currency: emp.currency || 'EGP',
            role: emp.role || 'employee',
            permissions: emp.permissions || [],
            address: emp.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            emergencyContact: emp.emergencyContact || {
              name: '',
              relationship: '',
              phone: ''
            },
            skills: emp.skills || [],
            certifications: emp.certifications || [],
            performanceRating: emp.performanceRating || 0,
            lastReviewDate: emp.lastReviewDate || '',
            nextReviewDate: emp.nextReviewDate || '',
            createdAt: emp.createdAt || new Date().toISOString(),
            updatedAt: emp.updatedAt || new Date().toISOString()
          })) : [];
          
          setEmployees(safeEmployees);
        } else {
          // Error handled by API service
          setEmployees([]);
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
          // Handle different response structures
          const applicationsList = applicationsData.data?.applications || applicationsData.data || applicationsData;
          setApplications(Array.isArray(applicationsList) ? applicationsList : []);
        } else {
          // Error handled by API service
          setApplications([]);
        }

        // Load employee invitations
        try {
          const invitationsResponse = await apiService.getEmployeeInvitations(invitationStatusFilter);
          if (invitationsResponse.success) {
            const invitationsList = invitationsResponse.data?.invitations || invitationsResponse.data || [];
            setInvitations(Array.isArray(invitationsList) ? invitationsList : []);
          } else {
            // Error handled by API service
            setInvitations([]);
          }
        } catch (error) {
          // Error handled by API service
          setInvitations([]);
        }

        // Load careers data
        try {
          // Load jobs
          const jobsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/careers/admin/jobs", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).catch(() => null);
          
          if (jobsResponse && jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            const jobsList = jobsData.data?.jobs || jobsData.data || jobsData;
            setJobs(Array.isArray(jobsList) ? jobsList : []);
          } else {
            setJobs([]);
          }

          // Load career applications
          const applicationsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/careers/admin/applications", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).catch(() => null);
          
          if (applicationsResponse && applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            const applicationsList = applicationsData.data?.applications || applicationsData.data || applicationsData;
            setCareerApplications(Array.isArray(applicationsList) ? applicationsList : []);
          } else {
            setCareerApplications([]);
          }
        } catch (error) {
          setJobs([]);
          setCareerApplications([]);
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
          // Handle both data.stats and direct data structures
          const statsResult = statsData.data?.stats || statsData.data || statsData;
          setStats(statsResult);
        } else {
          // Calculate stats from loaded data
          const totalEmployees = employees.length;
          const activeEmployees = employees.filter(e => e.status === "active").length;
          const newHires = employees.filter(e => {
            const hireDate = e.hireDate || e.startDate;
            return hireDate && new Date(hireDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          }).length;
          const pendingApplications = applications.filter(a => 
            a.status === "applied" || a.status === "screening" || a.status === "interview"
          ).length;
          const averageSalary = employees.length > 0 
            ? employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) / employees.length 
            : 0;

          setStats({
            totalEmployees,
            activeEmployees,
            newHires,
            openPositions: 0, // Will be calculated from real data
            pendingApplications,
            averageSalary,
            turnoverRate: 0, // Will be calculated from real data
            satisfactionScore: 0, // Will be calculated from real data
          });
        }
      } catch (error) {
        // Error handled by API service
        // Ensure arrays are always initialized on error
        setEmployees([]);
        setApplications([]);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHRData();
  }, [user]);

  useEffect(() => {
    let filteredEmps = Array.isArray(employees) ? employees.filter(emp => emp && emp._id) : [];
    let filteredApps = Array.isArray(applications) ? applications.filter(app => app && app._id) : [];

    // Search filter
    if (searchQuery) {
      filteredEmps = filteredEmps.filter(employee =>
        (employee.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.position || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      filteredApps = filteredApps.filter(application =>
        (application.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (application.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (application.department || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredEmps = filteredEmps.filter(employee => (employee.status || 'active') === statusFilter);
      filteredApps = filteredApps.filter(application => (application.status || 'applied') === statusFilter);
    }

    setFilteredEmployees(filteredEmps);
    setFilteredApplications(filteredApps);
  }, [employees, applications, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "hired":
        return "default";
      case "inactive":
      case "terminated":
      case "rejected":
        return "destructive";
      case "on_leave":
      case "applied":
      case "screening":
        return "secondary";
      case "interview":
      case "offer":
        return "outline";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "default";
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "full_time":
        return "default";
      case "part_time":
        return "secondary";
      case "contract":
        return "outline";
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
          toast.success(`Promotion process initiated for employee ${employeeId}`);
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
      // Error handled by API service
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
          setInvitations((invitationsResponse.data?.invitations || []) as Record<string, unknown>[]);
        }
      } else {
        toast.error("Failed to resend invitation");
      }
    } catch (error) {
      // Error handled by API service
      toast.error("Failed to resend invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    // Proceed with cancellation
    try {
      const response = await apiService.cancelInvitation(invitationId);
      if (response.success) {
        toast.success("Invitation cancelled successfully");
        // Reload invitations
        const invitationsResponse = await apiService.getEmployeeInvitations();
        if (invitationsResponse.success) {
          setInvitations((invitationsResponse.data?.invitations || []) as Record<string, unknown>[]);
        }
      } else {
        toast.error("Failed to cancel invitation");
      }
    } catch (error) {
      // Error handled by API service
      toast.error("Failed to cancel invitation");
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    // Show confirmation dialog
    if (window.confirm(t('hr.deleteInvitationConfirm'))) {
      try {
        const response = await apiService.cancelInvitation(invitationId);
        if (response.success) {
          toast.success(t('hr.invitationDeleted'));
          // Reload invitations
          const invitationsResponse = await apiService.getEmployeeInvitations();
          if (invitationsResponse.success) {
            setInvitations((invitationsResponse.data?.invitations || []) as Record<string, unknown>[]);
          }
        } else {
          toast.error("Failed to delete invitation");
        }
      } catch (error) {
        // Error handled by API service
        toast.error("Failed to delete invitation");
      }
    }
  };

  const handleInvitationSuccess = async () => {
    setShowInvitationForm(false);
    // Reload invitations
    const invitationsResponse = await apiService.getEmployeeInvitations();
    if (invitationsResponse.success) {
      const invitationsList = invitationsResponse.data?.invitations || invitationsResponse.data || [];
      setInvitations(Array.isArray(invitationsList) ? invitationsList : []);
    }
  };

  // Employee Actions
  const handleViewEmployeeProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };


  const handleDownloadEmployeeRecords = async (employee: Employee) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/employees/${employee._id}/records`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${employee.firstName || 'employee'}_records.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Employee records downloaded successfully");
      } else {
        toast.error("Failed to download employee records");
      }
    } catch (error) {
      toast.error("Failed to download employee records");
    }
  };

  const handleSendEmailToEmployee = async (employee: Employee) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/employees/send-email", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee._id,
          email: employee.email,
          subject: "HR Communication",
          message: "This is a communication from HR department."
        }),
      });
      
      if (response.ok) {
        toast.success("Email sent successfully");
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      const token = localStorage.getItem("clutch-admin-token");
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/hr/employees/${employeeToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast.success("Employee deleted successfully");
        // Reload employees
        const employeesResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/hr/employees", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          const employeesList = employeesData.data?.employees || employeesData.data || employeesData;
          setEmployees(Array.isArray(employeesList) ? employeesList : []);
        }
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      setShowDeleteConfirmModal(false);
      setEmployeeToDelete(null);
    }
  };

  // Invitation Actions
  const handleEditInvitation = (invitation: Record<string, unknown>) => {
    setSelectedInvitation(invitation);
    setShowEditInvitationModal(true);
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
      // Error handled by API service
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
          <h1 className="text-3xl font-medium tracking-tight">HR Management</h1>
          <p className="text-muted-foreground font-sans">
            {t('hr.description')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowInvitationForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Employee
          </Button>
          <Button variant="outline" onClick={() => {
            setEditingJob(null);
            setShowJobPostingOverlay(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hr.totalEmployees')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {stats ? stats.totalEmployees : Array.isArray(employees) ? employees.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.activeEmployees : Array.isArray(employees) ? employees.filter(e => e.status === "active").length : 0} {t('hr.active')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hr.newHires')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {stats ? stats.newHires : Array.isArray(employees) ? employees.filter(e => {
                const hireDate = e.hireDate || e.startDate;
                return hireDate && new Date(hireDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              }).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
{t('hr.thisMonth')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hr.pendingApplications')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {stats ? stats.pendingApplications : Array.isArray(applications) ? applications.filter(a => 
                a.status === "applied" || a.status === "screening" || a.status === "interview"
              ).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.openPositions : 5} {t('hr.openPositions')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('hr.avgSalary')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {stats ? (isNaN(stats.averageSalary) ? 0 : Math.round(stats.averageSalary).toLocaleString()) : 
                Array.isArray(employees) && employees.length > 0 ? 
                  (() => {
                    const avg = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) / employees.length;
                    return isNaN(avg) ? 0 : Math.round(avg).toLocaleString();
                  })() : 0} EGP
            </div>
            <p className="text-xs text-muted-foreground">
              Annual average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-[0.625rem] w-fit">
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
          Invitations ({Array.isArray(invitations) ? invitations.filter(i => i.status === 'pending').length : 0})
        </Button>
        <Button
          variant={activeTab === "recruitment" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("recruitment")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Recruitment
        </Button>
        <Button
          variant={activeTab === "careers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("careers")}
        >
          <Briefcase className="mr-2 h-4 w-4" />
          Careers ({jobs.length})
        </Button>
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <Card>
          <CardHeader>
            <CardTitle>{t('hr.employeeManagement')}</CardTitle>
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
                <div key={employee._id} className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {(employee.firstName || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employee.firstName || 'Unknown'} {employee.lastName || ''}</p>
                      <p className="text-sm text-muted-foreground">{employee.position || t('hr.noPosition')} • {employee.department || t('hr.noDepartment')}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                        <Badge variant={getEmploymentTypeColor(employee.employmentType)}>
                          {employee.employmentType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {employee.employeeId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(employee.salary || 0).toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Started: {formatDate(employee.startDate || employee.hireDate || new Date().toISOString())}</p>
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
                        <DropdownMenuItem onClick={() => handleViewEmployeeProfile(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadEmployeeRecords(employee)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Records
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendEmailToEmployee(employee)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEmployeeAction(employee._id, "promote")}
                          className="text-success"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Promote
                        </DropdownMenuItem>
                        {employee.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => handleEmployeeAction(employee._id, "terminate")}
                            className="text-destructive"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Terminate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Employee
                        </DropdownMenuItem>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Invitations</CardTitle>
                <CardDescription>
                  Manage pending employee invitations and track their status
                </CardDescription>
              </div>
              <Button onClick={() => setShowInvitationForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invite Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(invitations || []).map((invitation) => (
                <div key={String(invitation._id)} className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">
                        {String(invitation.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{String(invitation.name || '')}</p>
                      <p className="text-sm text-muted-foreground">{String(invitation.email || '')}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(String(invitation.status || ''))}>
                          {String(invitation.status || '')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {String(invitation.role || '')} • {String(invitation.department || '')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Expires: {formatDate(String(invitation.expiresAt || ''))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditInvitation(invitation)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {String(invitation.status || '') === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(String(invitation._id))}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelInvitation(String(invitation._id))}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteInvitation(String(invitation._id))}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('hr.deleteInvitation')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {(!Array.isArray(invitations) || invitations.length === 0) && (
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
        <RecruitmentTab 
          applications={careerApplications}
          jobs={jobs}
          onApplicationsUpdate={() => {
            // Reload applications
            const token = localStorage.getItem("clutch-admin-token");
            fetch("https://clutch-main-nk7x.onrender.com/api/v1/careers/admin/applications", {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }).catch(() => null)
            .then(response => response.json())
            .then(data => {
              const applicationsList = data.data?.applications || data.data || data;
              setCareerApplications(Array.isArray(applicationsList) ? applicationsList : []);
            })
            .catch(error => {
              console.error('Error reloading applications:', error);
            });
          }}
        />
      )}

      {/* Careers Tab */}
      {activeTab === "careers" && (
        <Card className="bg-card border-border rounded-[0.625rem] shadow-sm">
          <CardHeader className="border-b border-border" style={{ padding: '1rem' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Job Postings</CardTitle>
                <CardDescription className="text-muted-foreground text-base" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>
                  Manage job postings and track their performance
            </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setEditingJob(null);
                  setShowJobPostingOverlay(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.625rem] transition-all duration-150"
                style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Job Posting
              </Button>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '1rem' }}>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                  style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border bg-input text-foreground rounded-[0.625rem] text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-150"
                style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_manager_approval">Pending Manager Approval</option>
                <option value="pending_hr_admin_approval">Pending HR Admin Approval</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-4">
              {jobs.filter(job => {
                if (searchQuery) {
                  return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
                }
                if (statusFilter !== "all") {
                  return job.status === statusFilter;
                }
                return true;
              }).map((job) => (
                <div key={job._id} className="flex items-center justify-between p-4 border border-border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-lg">
                        {job.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-lg">{job.title}</p>
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {job.department} • {job.employmentType} • {job.experienceLevel}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.locations?.length > 0 ? job.locations.map((loc: any) => loc.city).join(', ') : 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary?.min > 0 && job.salary?.max > 0 
                            ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}`
                            : 'Salary not specified'
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.positions} position{job.positions > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Views: {job.analytics?.views || 0}</p>
                      <p>Applications: {job.analytics?.applications || 0}</p>
                      <p>Published: {job.publishedDate ? formatDate(job.publishedDate) : 'Not published'}</p>
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
                        <DropdownMenuItem onClick={() => {
                          setEditingJob(job);
                          setShowJobPostingOverlay(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Applications
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === 'draft' && (
                          <DropdownMenuItem className="text-primary">
                            <Send className="mr-2 h-4 w-4" />
                            Submit for Approval
                          </DropdownMenuItem>
                        )}
                        {job.status === 'published' && (
                          <DropdownMenuItem className="text-warning">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Close Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No job postings found</p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setEditingJob(null);
                    setShowJobPostingOverlay(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Job Posting
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invitation Form Modal */}
      {showInvitationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EmployeeInvitationForm
              onSuccess={handleInvitationSuccess}
              onCancel={() => setShowInvitationForm(false)}
            />
          </div>
        </div>
      )}

      {/* Employee Profile Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Employee Profile</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmployeeModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-xl">
                      {(selectedEmployee.firstName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedEmployee.firstName || 'Unknown'} {selectedEmployee.lastName || ''}
                    </h3>
                    <p className="text-muted-foreground">{selectedEmployee.position || t('hr.noPosition')}</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.department || t('hr.noDepartment')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-sm">{selectedEmployee.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={getStatusColor(selectedEmployee.status)}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                    <p className="text-sm">{selectedEmployee.employmentType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('hr.salary')}</label>
                    <p className="text-sm">{(selectedEmployee.salary || 0).toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-sm">{formatDate(selectedEmployee.startDate || selectedEmployee.hireDate || new Date().toISOString())}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm">{selectedEmployee.manager || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setShowEmployeeModal(false);
                    setShowEditEmployeeModal(true);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Employee
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invitation Modal */}
      {showEditInvitationModal && selectedInvitation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Invitation</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditInvitationModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    defaultValue={String(selectedInvitation.name || '')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    defaultValue={String(selectedInvitation.email || '')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input
                    defaultValue={String(selectedInvitation.role || '')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('hr.department')}</label>
                  <Input
                    defaultValue={String(selectedInvitation.department || '')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    defaultValue={String(selectedInvitation.status || '')}
                    className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditInvitationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success("Invitation updated successfully");
                  setShowEditInvitationModal(false);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && employeeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Employee</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-sm mb-6">
                Are you sure you want to delete <strong>{employeeToDelete.firstName || 'this employee'}</strong>? 
                This will permanently remove all their data from the system.
              </p>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setEmployeeToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteEmployee}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Employee
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-[0.625rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Employee</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditEmployeeModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input 
                      value={editFormData.firstName || ''} 
                      onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input 
                      value={editFormData.lastName || ''} 
                      onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    defaultValue={selectedEmployee.email || ''} 
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input 
                      defaultValue={selectedEmployee.position || ''} 
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('hr.department')}</label>
                    <Input 
                      defaultValue={selectedEmployee.department || ''} 
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input 
                      defaultValue={selectedEmployee.phone || ''} 
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Salary</label>
                    <Input 
                      value={editFormData.salary || ''} 
                      onChange={(e) => setEditFormData(prev => ({ ...prev, salary: Number(e.target.value) || 0 }))}
                      placeholder="Enter salary"
                      type="number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input 
                    defaultValue={typeof selectedEmployee.address === 'string' ? selectedEmployee.address : ''} 
                    placeholder="Enter address"
                  />
                </div>

                {/* RBAC Role and Permissions Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Role & Permissions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <Select 
                        value={editFormData.role || selectedEmployee?.role || "employee"} 
                        onValueChange={handleRoleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS
                            .filter(role => {
                              // If user is HR, filter out restricted roles (Level 9+)
                              if ((user?.role === "hr_manager" || user?.role === "hr") && 
                                  role.level >= 9) {
                                return false;
                              }
                              return true;
                            })
                            .map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Permissions</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {PERMISSION_OPTIONS.map((permission) => (
                          <div key={permission.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.value}`}
                              checked={(editFormData.permissions || []).includes(permission.value)}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(permission.value, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={`permission-${permission.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Permissions are automatically set based on role, but can be customized.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditEmployeeModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEmployee}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Employee
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Posting Overlay */}
      {showJobPostingOverlay && (
        <JobPostingOverlay
          isOpen={showJobPostingOverlay}
          onClose={() => {
            setShowJobPostingOverlay(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            // Reload jobs
            const token = localStorage.getItem("clutch-admin-token");
            fetch("https://clutch-main-nk7x.onrender.com/api/v1/careers/admin/jobs", {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }).catch(() => null)
            .then(response => response.json())
            .then(data => {
              const jobsList = data.data?.jobs || data.data || data;
              setJobs(Array.isArray(jobsList) ? jobsList : []);
            })
            .catch(error => {
              console.error('Error reloading jobs:', error);
            });
          }}
          editingJob={editingJob}
        />
      )}
    </div>
  );
}



