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
import { useTranslations } from "@/hooks/use-translations";

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
  { value: "employee", label: "employeeInvitation.roles.employee", description: "employeeInvitation.roles.employeeDesc" },
  { value: "hr", label: "employeeInvitation.roles.hr", description: "employeeInvitation.roles.hrDesc" },
  { value: "manager", label: "employeeInvitation.roles.manager", description: "employeeInvitation.roles.managerDesc" },
  { value: "admin", label: "employeeInvitation.roles.admin", description: "employeeInvitation.roles.adminDesc" },
];

const DEPARTMENT_OPTIONS = [
  { value: "engineering", label: "employeeInvitation.departments.engineering" },
  { value: "marketing", label: "employeeInvitation.departments.marketing" },
  { value: "sales", label: "employeeInvitation.departments.sales" },
  { value: "hr", label: "employeeInvitation.departments.hr" },
  { value: "finance", label: "employeeInvitation.departments.finance" },
  { value: "operations", label: "employeeInvitation.departments.operations" },
  { value: "customerSupport", label: "employeeInvitation.departments.customerSupport" },
  { value: "product", label: "employeeInvitation.departments.product" },
  { value: "design", label: "employeeInvitation.departments.design" },
  { value: "executive", label: "employeeInvitation.departments.executive" },
];

const PERMISSION_OPTIONS = [
  { value: "read", label: "employeeInvitation.permissions.read", description: "employeeInvitation.permissions.readDesc" },
  { value: "write", label: "employeeInvitation.permissions.write", description: "employeeInvitation.permissions.writeDesc" },
  { value: "delete", label: "employeeInvitation.permissions.delete", description: "employeeInvitation.permissions.deleteDesc" },
  { value: "admin", label: "employeeInvitation.permissions.admin", description: "employeeInvitation.permissions.adminDesc" },
  { value: "hr", label: "employeeInvitation.permissions.hr", description: "employeeInvitation.permissions.hrDesc" },
  { value: "finance", label: "employeeInvitation.permissions.finance", description: "employeeInvitation.permissions.financeDesc" },
  { value: "fleet", label: "employeeInvitation.permissions.fleet", description: "employeeInvitation.permissions.fleetDesc" },
  { value: "reports", label: "employeeInvitation.permissions.reports", description: "employeeInvitation.permissions.reportsDesc" },
];

export function EmployeeInvitationForm({ onSuccess, onCancel }: EmployeeInvitationFormProps) {
  const t = useTranslations();
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
      newErrors.name = t('employeeInvitation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('employeeInvitation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('employeeInvitation.validEmail');
    }

    if (!formData.role) {
      newErrors.role = t('employeeInvitation.roleRequired');
    }

    if (!formData.department.trim()) {
      newErrors.department = t('employeeInvitation.departmentRequired');
    }

    if (!formData.position.trim()) {
      newErrors.position = t('employeeInvitation.positionRequired');
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = t('employeeInvitation.permissionsRequired');
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
        toast.success(t('employeeInvitation.invitationSent'), {
          description: t('employeeInvitation.invitationSentDesc').replace('{email}', formData.email)
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
        toast.error(t('employeeInvitation.invitationFailed'), {
          description: response.error || t('employeeInvitation.invitationFailedDesc')
        });
      }
    } catch (error) {
      // Invitation error
      toast.error(t('employeeInvitation.invitationFailed'), {
        description: t('employeeInvitation.connectionError')
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
          {t('employeeInvitation.title')}
        </CardTitle>
        <CardDescription className="font-sans">
          {t('employeeInvitation.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-sans">{t('employeeInvitation.basicInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('employeeInvitation.fullName')} *</Label>
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
                <Label htmlFor="email">{t('employeeInvitation.emailAddress')} *</Label>
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
            <h3 className="text-lg font-medium font-sans">{t('employeeInvitation.jobInformation')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">{t('employeeInvitation.role')} *</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder={t('employeeInvitation.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{t(role.label)}</div>
                          <div className="text-sm text-muted-foreground">{t(role.description)}</div>
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
                <Label htmlFor="department">{t('employeeInvitation.department')} *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder={t('employeeInvitation.selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {t(dept.label)}
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
                <Label htmlFor="position">{t('employeeInvitation.position')} *</Label>
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
            <h3 className="text-lg font-medium font-sans">{t('employeeInvitation.permissions')}</h3>
            <p className="text-sm text-muted-foreground font-sans">
              {t('employeeInvitation.permissionsDescription')}
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
                      {t(permission.label)}
                    </Label>
                    <p className="text-xs text-muted-foreground font-sans">
                      {t(permission.description)}
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
{t('common.cancel')}
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
                  {t('employeeInvitation.sending')}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('employeeInvitation.sendInvitation')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
