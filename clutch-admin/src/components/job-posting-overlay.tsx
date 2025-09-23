"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { handleError } from "@/lib/error-handler";
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Eye, 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { apiService } from "@/lib/api";

interface JobPostingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingJob?: any;
}

interface Location {
  type: 'remote' | 'onsite' | 'hybrid';
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

interface CustomQuestion {
  question: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  options: string[];
  required: boolean;
  order: number;
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' }
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
];

const DEPARTMENTS = [
  'Executive', 'Human Resources', 'Finance', 'Operations', 
  'Marketing', 'Technology', 'Sales', 'Customer Service', 
  'Legal', 'Compliance', 'General'
];

export function JobPostingOverlay({ isOpen, onClose, onSuccess, editingJob }: JobPostingOverlayProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'settings' | 'preview'>('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[],
    skills: [] as string[],
    employmentType: 'full-time',
    experienceLevel: 'mid-level',
    salary: {
      min: 0,
      max: 0,
      currency: 'EGP',
      isNegotiable: true,
      isPublic: true
    },
    locations: [] as Location[],
    applicationDeadline: '',
    startDate: '',
    positions: 1,
    customQuestions: [] as CustomQuestion[],
    applicationSettings: {
      requireCoverLetter: false,
      requirePortfolio: false,
      requireReferences: false,
      allowMultipleApplications: false
    },
    visibility: 'public',
    status: 'draft'
  });

  // Temporary input states
  const [tempRequirement, setTempRequirement] = useState('');
  const [tempResponsibility, setTempResponsibility] = useState('');
  const [tempBenefit, setTempBenefit] = useState('');
  const [tempSkill, setTempSkill] = useState('');
  const [tempLocation, setTempLocation] = useState<Location>({
    type: 'onsite',
    city: '',
    country: 'Egypt'
  });
  const [tempQuestion, setTempQuestion] = useState<CustomQuestion>({
    question: '',
    type: 'text',
    options: [],
    required: false,
    order: 0
  });

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        department: editingJob.department || '',
        description: editingJob.description || '',
        requirements: editingJob.requirements || [],
        responsibilities: editingJob.responsibilities || [],
        benefits: editingJob.benefits || [],
        skills: editingJob.skills || [],
        employmentType: editingJob.employmentType || 'full-time',
        experienceLevel: editingJob.experienceLevel || 'mid-level',
        salary: editingJob.salary || { min: 0, max: 0, currency: 'EGP', isNegotiable: true, isPublic: true },
        locations: editingJob.locations || [],
        applicationDeadline: editingJob.applicationDeadline ? new Date(editingJob.applicationDeadline).toISOString().split('T')[0] : '',
        startDate: editingJob.startDate ? new Date(editingJob.startDate).toISOString().split('T')[0] : '',
        positions: editingJob.positions || 1,
        customQuestions: editingJob.customQuestions || [],
        applicationSettings: editingJob.applicationSettings || {
          requireCoverLetter: false,
          requirePortfolio: false,
          requireReferences: false,
          allowMultipleApplications: false
        },
        visibility: editingJob.visibility || 'public',
        status: editingJob.status || 'draft'
      });
    }
  }, [editingJob]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const addToList = (listName: 'requirements' | 'responsibilities' | 'benefits' | 'skills', tempValue: string) => {
    if (tempValue.trim()) {
      setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], tempValue.trim()]
      }));
      
      // Clear temp input
      switch (listName) {
        case 'requirements':
          setTempRequirement('');
          break;
        case 'responsibilities':
          setTempResponsibility('');
          break;
        case 'benefits':
          setTempBenefit('');
          break;
        case 'skills':
          setTempSkill('');
          break;
      }
    }
  };

  const removeFromList = (listName: 'requirements' | 'responsibilities' | 'benefits' | 'skills', index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const addLocation = () => {
    if (tempLocation.city.trim()) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, { ...tempLocation }]
      }));
      setTempLocation({
        type: 'onsite',
        city: '',
        country: 'Egypt'
      });
    }
  };

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const addCustomQuestion = () => {
    if (tempQuestion.question.trim()) {
      setFormData(prev => ({
        ...prev,
        customQuestions: [...prev.customQuestions, { ...tempQuestion, order: prev.customQuestions.length }]
      }));
      setTempQuestion({
        question: '',
        type: 'text',
        options: [],
        required: false,
        order: 0
      });
    }
  };

  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (status: 'draft' | 'pending_manager_approval') => {
    try {
      setIsLoading(true);

      const submitData = {
        ...formData,
        status,
        hiringManager: user?.id,
        metadata: {
          createdBy: user?.id,
          updatedBy: user?.id
        }
      };

      let response;
      if (editingJob) {
        response = await apiService.updateJob(editingJob._id, submitData);
      } else {
        response = await apiService.createJob(submitData);
      }

      if (response.success) {
        toast.success(
          status === 'draft' 
            ? 'Job saved as draft successfully' 
            : 'Job submitted for approval successfully'
        );
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to save job');
      }
    } catch (error) {
      handleError(error, { component: 'JobPostingOverlay', action: 'submit_job' });
      toast.error('Failed to save job');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1200]">
      <div className="bg-card rounded-[0.625rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>
              {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
            </h2>
            <p className="text-muted-foreground text-base mt-1" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>
              {editingJob ? 'Update job details and settings' : 'Create a new job posting for your team'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'basic', label: 'Basic Info', icon: Briefcase },
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Users },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-none border-b-2 border-transparent px-6 py-3 text-base font-medium transition-all duration-150 ${
                  activeTab === tab.id 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]" style={{ padding: '1rem' }}>
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                    style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger className="border-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-[0.625rem] shadow-md">
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept} className="text-foreground hover:bg-muted">{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  rows={6}
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                  style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                    <SelectTrigger className="border-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-[0.625rem] shadow-md">
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-foreground hover:bg-muted">{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Experience Level *</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger className="border-border bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-[0.625rem] shadow-md">
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value} className="text-foreground hover:bg-muted">{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Minimum Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salary.min}
                    onChange={(e) => handleNestedInputChange('salary', 'min', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                    style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Maximum Salary</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salary.max}
                    onChange={(e) => handleNestedInputChange('salary', 'max', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                    style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                  />
                </div>
                <div>
                  <Label htmlFor="positions" className="text-base font-medium text-foreground mb-2 block" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>Number of Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    value={formData.positions}
                    onChange={(e) => handleInputChange('positions', parseInt(e.target.value) || 1)}
                    min="1"
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent rounded-[0.625rem] transition-all duration-150"
                    style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Requirements */}
              <div>
                <Label>Requirements</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempRequirement}
                    onChange={(e) => setTempRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => e.key === 'Enter' && addToList('requirements', tempRequirement)}
                  />
                  <Button onClick={() => addToList('requirements', tempRequirement)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{req}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromList('requirements', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <Label>Responsibilities</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempResponsibility}
                    onChange={(e) => setTempResponsibility(e.target.value)}
                    placeholder="Add a responsibility..."
                    onKeyPress={(e) => e.key === 'Enter' && addToList('responsibilities', tempResponsibility)}
                  />
                  <Button onClick={() => addToList('responsibilities', tempResponsibility)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{resp}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromList('responsibilities', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <Label>Benefits</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempBenefit}
                    onChange={(e) => setTempBenefit(e.target.value)}
                    placeholder="Add a benefit..."
                    onKeyPress={(e) => e.key === 'Enter' && addToList('benefits', tempBenefit)}
                  />
                  <Button onClick={() => addToList('benefits', tempBenefit)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{benefit}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromList('benefits', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tempSkill}
                    onChange={(e) => setTempSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addToList('skills', tempSkill)}
                  />
                  <Button onClick={() => addToList('skills', tempSkill)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeFromList('skills', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <Label>Job Locations</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Select value={tempLocation.type} onValueChange={(value: any) => setTempLocation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={tempLocation.city}
                    onChange={(e) => setTempLocation(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                  <Input
                    value={tempLocation.country}
                    onChange={(e) => setTempLocation(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                  <Button onClick={addLocation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">
                        {location.type} - {location.city}, {location.country}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Expected Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Application Settings</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireCoverLetter"
                      checked={formData.applicationSettings.requireCoverLetter}
                      onCheckedChange={(checked) => handleNestedInputChange('applicationSettings', 'requireCoverLetter', checked)}
                    />
                    <Label htmlFor="requireCoverLetter">Require Cover Letter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requirePortfolio"
                      checked={formData.applicationSettings.requirePortfolio}
                      onCheckedChange={(checked) => handleNestedInputChange('applicationSettings', 'requirePortfolio', checked)}
                    />
                    <Label htmlFor="requirePortfolio">Require Portfolio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowMultipleApplications"
                      checked={formData.applicationSettings.allowMultipleApplications}
                      onCheckedChange={(checked) => handleNestedInputChange('applicationSettings', 'allowMultipleApplications', checked)}
                    />
                    <Label htmlFor="allowMultipleApplications">Allow Multiple Applications</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Custom Application Questions</Label>
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={tempQuestion.question}
                      onChange={(e) => setTempQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Question text..."
                    />
                    <Select value={tempQuestion.type} onValueChange={(value: any) => setTempQuestion(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      checked={tempQuestion.required}
                      onCheckedChange={(checked) => setTempQuestion(prev => ({ ...prev, required: checked as boolean }))}
                    />
                    <Label htmlFor="required">Required</Label>
                    <Button onClick={addCustomQuestion} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.customQuestions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">
                        {question.question} ({question.type}) {question.required && '*'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{formData.title || 'Job Title'}</CardTitle>
                      <CardDescription className="text-lg">{formData.department}</CardDescription>
                    </div>
                    <Badge variant="outline">{formData.employmentType}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {formData.locations.length > 0 
                          ? formData.locations.map(loc => `${loc.city}, ${loc.country}`).join(', ')
                          : 'Location not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {formData.salary.min > 0 && formData.salary.max > 0
                          ? `${formData.salary.min.toLocaleString()} - ${formData.salary.max.toLocaleString()} ${formData.salary.currency}`
                          : 'Salary not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{formData.positions} position{formData.positions > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formData.experienceLevel}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>

                  {formData.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="text-sm space-y-1">
                        {formData.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.responsibilities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Responsibilities</h3>
                      <ul className="text-sm space-y-1">
                        {formData.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.benefits.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Benefits</h3>
                      <ul className="text-sm space-y-1">
                        {formData.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}>
            <AlertCircle className="h-4 w-4" />
            <span>All fields marked with * are required</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="border-border text-foreground hover:bg-muted hover:text-foreground rounded-[0.625rem] transition-all duration-150"
              style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSubmit('draft')} 
              disabled={isLoading}
              className="border-border text-foreground hover:bg-muted hover:text-foreground rounded-[0.625rem] transition-all duration-150"
              style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit('pending_manager_approval')} 
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.625rem] transition-all duration-150"
              style={{ fontFamily: 'Roboto, ui-sans-serif, sans-serif, system-ui' }}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
