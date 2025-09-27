'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Settings
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: OnboardingField[];
  validation: (data: any) => boolean;
}

interface OnboardingField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    icon: User,
    fields: [
      { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Enter your first name' },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter your last name' },
      { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Enter your email' },
      { name: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: 'Enter your phone number' },
      { name: 'jobTitle', label: 'Job Title', type: 'text', required: true, placeholder: 'Enter your job title' },
      { name: 'department', label: 'Department', type: 'select', required: true, options: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support'] }
    ],
    validation: (data) => data.firstName && data.lastName && data.email && data.phone && data.jobTitle && data.department
  },
  {
    id: 'organization',
    title: 'Organization Setup',
    description: 'Configure your organization',
    icon: Building,
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true, placeholder: 'Enter company name' },
      { name: 'companySize', label: 'Company Size', type: 'select', required: true, options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
      { name: 'industry', label: 'Industry', type: 'select', required: true, options: ['Automotive', 'Technology', 'Manufacturing', 'Retail', 'Healthcare', 'Finance', 'Other'] },
      { name: 'address', label: 'Company Address', type: 'textarea', required: true, placeholder: 'Enter company address' },
      { name: 'website', label: 'Website', type: 'text', required: false, placeholder: 'Enter company website' },
      { name: 'timezone', label: 'Timezone', type: 'select', required: true, options: ['UTC', 'EST', 'PST', 'GMT', 'CET', 'JST'] }
    ],
    validation: (data) => data.companyName && data.companySize && data.industry && data.address && data.timezone
  },
  {
    id: 'security',
    title: 'Security & Access',
    description: 'Set up security preferences',
    icon: Shield,
    fields: [
      { name: 'password', label: 'Password', type: 'text', required: true, placeholder: 'Enter secure password' },
      { name: 'confirmPassword', label: 'Confirm Password', type: 'text', required: true, placeholder: 'Confirm your password' },
      { name: 'twoFactor', label: 'Two-Factor Authentication', type: 'select', required: true, options: ['Enabled', 'Disabled'] },
      { name: 'sessionTimeout', label: 'Session Timeout', type: 'select', required: true, options: ['15 minutes', '30 minutes', '1 hour', '2 hours', '8 hours'] },
      { name: 'ipRestriction', label: 'IP Restrictions', type: 'select', required: false, options: ['None', 'Office Only', 'Custom'] },
      { name: 'backupFrequency', label: 'Backup Frequency', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly'] }
    ],
    validation: (data) => data.password && data.confirmPassword && data.password === data.confirmPassword && data.twoFactor && data.sessionTimeout && data.backupFrequency
  },
  {
    id: 'preferences',
    title: 'Preferences & Settings',
    description: 'Customize your experience',
    icon: Settings,
    fields: [
      { name: 'language', label: 'Language', type: 'select', required: true, options: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Chinese'] },
      { name: 'theme', label: 'Theme', type: 'select', required: true, options: ['Light', 'Dark', 'Auto'] },
      { name: 'notifications', label: 'Notifications', type: 'select', required: true, options: ['All', 'Important Only', 'None'] },
      { name: 'emailUpdates', label: 'Email Updates', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Never'] },
      { name: 'dashboardLayout', label: 'Dashboard Layout', type: 'select', required: true, options: ['Compact', 'Standard', 'Expanded'] },
      { name: 'defaultView', label: 'Default View', type: 'select', required: true, options: ['Dashboard', 'Analytics', 'Users', 'Settings'] }
    ],
    validation: (data) => data.language && data.theme && data.notifications && data.emailUpdates && data.dashboardLayout && data.defaultView
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const step = onboardingSteps[stepIndex];
    const isValid = step.validation(formData);
    
    if (!isValid) {
      const newErrors: Record<string, string> = {};
      step.fields.forEach(field => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
      setErrors(newErrors);
    }
    
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Submit onboarding data
      const response = await fetch('/api/v1/admin/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setErrors({ general: 'Failed to complete onboarding. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: OnboardingField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
            <textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Clutch Admin</h1>
          <p className="text-gray-600">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isCurrent ? 'bg-blue-100 text-blue-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <currentStepData.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentStepData.fields.map(renderField)}
              
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <span>
                  {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Next'}
                </span>
                {currentStep === onboardingSteps.length - 1 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@clutch.com" className="text-blue-600 hover:underline">
              support@clutch.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
