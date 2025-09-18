"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type: 'input' | 'confirm' | 'form' | 'info';
  fields?: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'textarea';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
  }[];
  onSubmit: (data: any) => Promise<void>;
  submitText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export function CommandModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  fields = [],
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  variant = 'default'
}: CommandModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
      toast.success('Operation completed successfully!');
      onClose();
      setFormData({});
    } catch (error) {
      console.error('Command modal error:', error);
      toast.error('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      default:
        return <Info className="h-6 w-6 text-info" />;
    }
  };

  const getSubmitButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {type === 'confirm' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to proceed? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={getSubmitButtonVariant()}
                  onClick={() => onSubmit({})}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : submitText}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'select' ? (
                    <Select
                      value={formData[field.name] || ''}
                      onValueChange={(value) => handleInputChange(field.name, value)}
                      required={field.required}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  ) : field.type === 'file' ? (
                    <Input
                      id={field.name}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleInputChange(field.name, file);
                        }
                      }}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  type="submit"
                  variant={getSubmitButtonVariant()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : submitText}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized modals for common use cases
export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
}) {
  return (
    <CommandModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type="confirm"
      onSubmit={onConfirm}
      submitText={confirmText}
      cancelText={cancelText}
      variant={variant}
    />
  );
}

export function InputModal({
  isOpen,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel'
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'textarea';
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
  }[];
  onSubmit: (data: any) => Promise<void>;
  submitText?: string;
  cancelText?: string;
}) {
  return (
    <CommandModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type="form"
      fields={fields}
      onSubmit={onSubmit}
      submitText={submitText}
      cancelText={cancelText}
    />
  );
}
