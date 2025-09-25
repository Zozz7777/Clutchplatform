'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  DollarSign,
  Shield,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ContractTemplate {
  id: string;
  name: string;
  type: 'service' | 'supply' | 'partnership' | 'maintenance';
  description: string;
  template: string;
  requiredFields: string[];
}

interface ContractData {
  partnerId: string;
  partnerName: string;
  partnerType: string;
  contractType: string;
  startDate: string;
  endDate: string;
  value: number;
  paymentTerms: string;
  deliveryTerms: string;
  warranty: string;
  termination: string;
  specialTerms: string;
}

interface ContractGeneratorProps {
  partnerId?: string;
  partnerName?: string;
  partnerType?: string;
  onContractGenerated?: (contract: any) => void;
}

const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'service_agreement',
    name: 'Service Agreement',
    type: 'service',
    description: 'Standard service agreement for repair centers and maintenance services',
    template: `
# SERVICE AGREEMENT

**Contract ID:** {CONTRACT_ID}
**Date:** {DATE}
**Partner:** {PARTNER_NAME}
**Type:** {PARTNER_TYPE}

## 1. SERVICE DESCRIPTION
{SPECIAL_TERMS}

## 2. TERM AND DURATION
- **Start Date:** {START_DATE}
- **End Date:** {END_DATE}
- **Duration:** {DURATION}

## 3. FINANCIAL TERMS
- **Contract Value:** {VALUE} EGP
- **Payment Terms:** {PAYMENT_TERMS}
- **Delivery Terms:** {DELIVERY_TERMS}

## 4. WARRANTY AND SUPPORT
{WARRANTY}

## 5. TERMINATION
{TERMINATION}

## 6. LEGAL COMPLIANCE
- All services must comply with Egyptian automotive regulations
- Partner must maintain valid business licenses
- Insurance coverage required for all services

## 7. SIGNATURES
**Clutch Representative:** _________________ Date: _______
**Partner Representative:** _________________ Date: _______
    `,
    requiredFields: ['partnerName', 'startDate', 'endDate', 'value', 'paymentTerms']
  },
  {
    id: 'supply_agreement',
    name: 'Supply Agreement',
    type: 'supply',
    description: 'Parts and accessories supply agreement',
    template: `
# SUPPLY AGREEMENT

**Contract ID:** {CONTRACT_ID}
**Date:** {DATE}
**Supplier:** {PARTNER_NAME}
**Type:** {PARTNER_TYPE}

## 1. SUPPLY DESCRIPTION
{SPECIAL_TERMS}

## 2. TERM AND DURATION
- **Start Date:** {START_DATE}
- **End Date:** {END_DATE}
- **Duration:** {DURATION}

## 3. FINANCIAL TERMS
- **Contract Value:** {VALUE} EGP
- **Payment Terms:** {PAYMENT_TERMS}
- **Delivery Terms:** {DELIVERY_TERMS}

## 4. QUALITY AND WARRANTY
{WARRANTY}

## 5. TERMINATION
{TERMINATION}

## 6. LEGAL COMPLIANCE
- All parts must meet Egyptian automotive standards
- Supplier must provide certificates of compliance
- Regular quality audits required

## 7. SIGNATURES
**Clutch Representative:** _________________ Date: _______
**Supplier Representative:** _________________ Date: _______
    `,
    requiredFields: ['partnerName', 'startDate', 'endDate', 'value', 'paymentTerms']
  },
  {
    id: 'partnership_agreement',
    name: 'Partnership Agreement',
    type: 'partnership',
    description: 'Strategic partnership agreement for long-term collaboration',
    template: `
# PARTNERSHIP AGREEMENT

**Contract ID:** {CONTRACT_ID}
**Date:** {DATE}
**Partner:** {PARTNER_NAME}
**Type:** {PARTNER_TYPE}

## 1. PARTNERSHIP SCOPE
{SPECIAL_TERMS}

## 2. TERM AND DURATION
- **Start Date:** {START_DATE}
- **End Date:** {END_DATE}
- **Duration:** {DURATION}

## 3. FINANCIAL TERMS
- **Partnership Value:** {VALUE} EGP
- **Payment Terms:** {PAYMENT_TERMS}
- **Revenue Sharing:** {DELIVERY_TERMS}

## 4. RESPONSIBILITIES
{WARRANTY}

## 5. TERMINATION
{TERMINATION}

## 6. LEGAL COMPLIANCE
- Both parties must maintain valid business licenses
- Regular compliance audits required
- Confidentiality agreements in place

## 7. SIGNATURES
**Clutch Representative:** _________________ Date: _______
**Partner Representative:** _________________ Date: _______
    `,
    requiredFields: ['partnerName', 'startDate', 'endDate', 'value', 'paymentTerms']
  }
];

export default function ContractGenerator({ 
  partnerId, 
  partnerName, 
  partnerType, 
  onContractGenerated 
}: ContractGeneratorProps) {
  const t = useTranslations('sales');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [contractData, setContractData] = useState<ContractData>({
    partnerId: partnerId || '',
    partnerName: partnerName || '',
    partnerType: partnerType || '',
    contractType: '',
    startDate: '',
    endDate: '',
    value: 0,
    paymentTerms: '',
    deliveryTerms: '',
    warranty: '12 months warranty on all services and parts',
    termination: 'Either party may terminate with 30 days written notice',
    specialTerms: ''
  });
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContractId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CLT-${timestamp}-${random}`.toUpperCase();
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    let duration = '';
    if (years > 0) duration += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) duration += `${months} month${months > 1 ? 's' : ''} `;
    if (days > 0) duration += `${days} day${days > 1 ? 's' : ''}`;
    
    return duration.trim();
  };

  const generateContract = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a contract template');
      return;
    }

    setIsGenerating(true);
    
    try {
      const contractId = generateContractId();
      const currentDate = new Date().toLocaleDateString('en-GB');
      const duration = calculateDuration(contractData.startDate, contractData.endDate);
      
      let contract = selectedTemplate.template
        .replace(/{CONTRACT_ID}/g, contractId)
        .replace(/{DATE}/g, currentDate)
        .replace(/{PARTNER_NAME}/g, contractData.partnerName)
        .replace(/{PARTNER_TYPE}/g, contractData.partnerType)
        .replace(/{START_DATE}/g, contractData.startDate)
        .replace(/{END_DATE}/g, contractData.endDate)
        .replace(/{DURATION}/g, duration)
        .replace(/{VALUE}/g, contractData.value.toLocaleString())
        .replace(/{PAYMENT_TERMS}/g, contractData.paymentTerms)
        .replace(/{DELIVERY_TERMS}/g, contractData.deliveryTerms)
        .replace(/{WARRANTY}/g, contractData.warranty)
        .replace(/{TERMINATION}/g, contractData.termination)
        .replace(/{SPECIAL_TERMS}/g, contractData.specialTerms);

      setGeneratedContract(contract);
      
      // Save contract to backend
      const contractRecord = {
        id: contractId,
        partnerId: contractData.partnerId,
        partnerName: contractData.partnerName,
        partnerType: contractData.partnerType,
        contractType: selectedTemplate.type,
        template: selectedTemplate.id,
        content: contract,
        status: 'draft',
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        value: contractData.value,
        createdAt: new Date().toISOString(),
        createdBy: 'current_user_id' // This should come from auth context
      };

      // Call API to save contract
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractRecord)
      });

      if (response.ok) {
        toast.success('Contract generated successfully');
        onContractGenerated?.(contractRecord);
      } else {
        toast.error('Failed to save contract');
      }

    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Failed to generate contract');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadContract = () => {
    const blob = new Blob([generatedContract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${generateContractId()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.requiredFields.every(field => {
      const value = contractData[field as keyof ContractData];
      return value && value.toString().trim() !== '';
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t('newContract')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('createContract')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Contract Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTRACT_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <Badge variant="outline">{template.type}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerName">Partner Name</Label>
                    <Input
                      id="partnerName"
                      value={contractData.partnerName}
                      onChange={(e) => setContractData(prev => ({ ...prev, partnerName: e.target.value }))}
                      placeholder="Enter partner name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerType">Partner Type</Label>
                    <Input
                      id="partnerType"
                      value={contractData.partnerType}
                      onChange={(e) => setContractData(prev => ({ ...prev, partnerType: e.target.value }))}
                      placeholder="Enter partner type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={contractData.endDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Contract Value (EGP)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={contractData.value}
                      onChange={(e) => setContractData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      placeholder="Enter contract value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={contractData.paymentTerms}
                      onChange={(e) => setContractData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      placeholder="e.g., Net 30 days"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                  <Input
                    id="deliveryTerms"
                    value={contractData.deliveryTerms}
                    onChange={(e) => setContractData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                    placeholder="Enter delivery terms"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialTerms">Special Terms</Label>
                  <Textarea
                    id="specialTerms"
                    value={contractData.specialTerms}
                    onChange={(e) => setContractData(prev => ({ ...prev, specialTerms: e.target.value }))}
                    placeholder="Enter any special terms or conditions"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Contract Preview */}
          {generatedContract && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Generated Contract</span>
                  <Button onClick={downloadContract} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContract}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateContract}
              disabled={!isFormValid() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Generate Contract
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
