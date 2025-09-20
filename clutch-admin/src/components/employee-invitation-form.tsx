"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail, Building2, Shield, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface InvitationFormData {
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  permissions: string[];
}

interface EmployeeInvitationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee", description: "Standard employee access" },
  { value: "hr", label: "HR", description: "Human resources access" },
  { value: "manager", label: "Manager", description: "Team management access" },
  { value: "admin", label: "Admin", description: "Full administrative access" },
];

const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Customer Support",
  "Product",
  "Design",
  "Executive",
];

const PERMISSION_OPTIONS = [
  { value: "read", label: "Read", description: "View data and reports" },
  { value: "write", label: "Write", description: "Create and edit data" },
  { value: "delete", label: "Delete", description: "Remove data" },
  { value: "admin", label: "Admin", description: "Full system access" },
  { value: "hr", label: "HR", description: "HR management access" },
  { value: "finance", label: "Finance", description: "Financial data access" },
  { value: "fleet", label: "Fleet", description: "Fleet management access" },
  { value: "reports", label: "Reports", description: "Generate reports" },
];

export function EmployeeInvitationForm({ onSuccess, onCancel }: EmployeeInvitationFormProps) {
  const [formData, setFormData] = useState<InvitationFormData>({
    name: "",
    email: "",
    role: "employee",
    department: "",
    position: "",
    permissions: ["read"]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.inviteEmployee(formData);
      
      if (response.success) {
        toast.success("Employee invitation sent successfully!", {
          description: `Invitation sent to ${formData.email}`
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "employee",
          department: "",
          position: "",
          permissions: ["read"]
        });
        
        onSuccess?.();
      } else {
        toast.error("Failed to send invitation", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      // Invitation error
      toast.error("Failed to send invitation", {
        description: "Please check your connection and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case "admin":
        return ["read", "write", "delete", "admin", "hr", "finance", "fleet", "reports"];
      case "hr":
        return ["read", "write", "hr", "reports"];
      case "manager":
        return ["read", "write", "reports"];
      case "employee":
      default:
        return ["read"];
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: getRolePermissions(role)
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans">
          <UserPlus className="h-5 w-5" />
          Invite New Employee
        </CardTitle>
        <CardDescription className="font-sans">
          Send an invitation to a new employee to join the Clutch platform
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-sans">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                    disabled={isLoading}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-sans">Job Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {dept}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Software Engineer"
                  disabled={isLoading}
                  className={errors.position ? "border-red-500" : ""}
                />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-sans">Permissions</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Select the permissions this employee should have. Some permissions are automatically assigned based on the role.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERMISSION_OPTIONS.map((permission) => (
                <div key={permission.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.value, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={permission.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-sans"
                    >
                      {permission.label}
                    </Label>
                    <p className="text-xs text-muted-foreground font-sans">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.permissions && (
              <p className="text-sm text-destructive">{errors.permissions}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {formData.permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
