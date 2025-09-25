"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { toast } from 'sonner';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: (lead: any) => void;
}

interface LeadFormData {
  title: string;
  type: 'shop' | 'importer' | 'manufacturer' | 'fleet' | 'insurance';
  companyName: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo: string;
  value?: number;
  notes?: string;
}

export default function CreateLeadDialog({ 
  open, 
  onOpenChange, 
  onLeadCreated 
}: CreateLeadDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    title: '',
    type: 'shop',
    companyName: '',
    contact: {
      name: '',
      email: '',
      phone: '',
    },
    status: 'new',
    assignedTo: '',
    value: undefined,
    notes: '',
  });

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof LeadFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.contact.name || !formData.contact.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Here you would typically make an API call to create the lead
      // For now, we'll simulate the API call
      const newLead = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Lead created successfully');
      onLeadCreated?.(newLead);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        type: 'shop',
        companyName: '',
        contact: {
          name: '',
          email: '',
          phone: '',
        },
        status: 'new',
        assignedTo: '',
        value: undefined,
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your CRM system. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lead Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter lead title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Business Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="importer">Importer</SelectItem>
                  <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="fleet">Fleet Company</SelectItem>
                  <SelectItem value="insurance">Insurance Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contact.name}
                  onChange={(e) => handleInputChange('contact.name', e.target.value)}
                  placeholder="Enter contact name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Enter assigned person"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value (EGP)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value || ''}
              onChange={(e) => handleInputChange('value', Number(e.target.value) || undefined)}
              placeholder="Enter estimated value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
