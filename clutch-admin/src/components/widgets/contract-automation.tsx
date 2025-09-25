'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Store
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

interface Contract {
  id: string;
  leadId: string;
  partnerId?: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'generated' | 'sent' | 'signed' | 'pending_legal' | 'approved' | 'rejected';
  draftUrl?: string;
  signedUrl?: string;
  lead: {
    companyName: string;
    contact: {
      name: string;
      email: string;
      phone: string;
    };
    type: string;
    businessDetails: {
      address: string;
      city: string;
      governorate: string;
      businessLicense: string;
      taxId: string;
    };
  };
  metadata: {
    generatedAt: string;
    sentAt?: string;
    signedAt?: string;
    repId: string;
    repName: string;
  };
  legalReview?: {
    reviewerId: string;
    reviewerName: string;
    reviewedAt: string;
    approved: boolean;
    notes: string;
  };
  terms: {
    duration: string;
    commission: number;
    exclusivity: string;
    territory: string;
  };
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'partners' | 'b2b_enterprise';
  category: string;
  description: string;
  isActive: boolean;
}

export default function ContractAutomation() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('templates');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadContractData();
  }, []);

  const loadContractData = async () => {
    try {
      setIsLoading(true);
      
      // Load contracts
      const contractsResponse = await productionApi.getContracts();
      if (contractsResponse.success) {
        setContracts(contractsResponse.contracts || []);
      }

      // Load templates
      const templatesResponse = await productionApi.getContractTemplates();
      if (templatesResponse.success) {
        setTemplates(templatesResponse.templates || []);
      }

      toast.success(t('sales.contractDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadContractData'));
    } finally {
      setIsLoading(false);
    }
  };

  const generateContract = async (leadId: string, templateId: string) => {
    try {
      setIsGenerating(true);
      
      const response = await productionApi.generateContract(leadId, templateId);
      if (response.success) {
        toast.success(t('sales.contractGeneratedSuccessfully'));
        loadContractData();
      } else {
        toast.error(response.message || t('sales.failedToGenerateContract'));
      }
    } catch (error) {
      toast.error(t('sales.failedToGenerateContract'));
    } finally {
      setIsGenerating(false);
    }
  };

  const sendContract = async (contractId: string) => {
    try {
      const response = await productionApi.sendContract(contractId);
      if (response.success) {
        toast.success(t('sales.contractSentSuccessfully'));
        loadContractData();
      } else {
        toast.error(response.message || t('sales.failedToSendContract'));
      }
    } catch (error) {
      toast.error(t('sales.failedToSendContract'));
    }
  };

  const uploadSignedContract = async (contractId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('signedPdf', file);
      
      const response = await productionApi.uploadSignedContract(contractId, formData);
      if (response.success) {
        toast.success(t('sales.signedContractUploadedSuccessfully'));
        loadContractData();
      } else {
        toast.error(response.message || t('sales.failedToUploadSignedContract'));
      }
    } catch (error) {
      toast.error(t('sales.failedToUploadSignedContract'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-foreground';
      case 'generated': return 'bg-blue-100 text-primary';
      case 'sent': return 'bg-warning/10 text-warning';
      case 'signed': return 'bg-primary/10 text-primary';
      case 'pending_legal': return 'bg-info/10 text-info';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'generated': return <Download className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'signed': return <CheckCircle className="h-4 w-4" />;
      case 'pending_legal': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      contract.lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('sales.contractAutomation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('sales.contractAutomation')}
          </CardTitle>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('sales.newContract')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">{t('sales.templates')}</TabsTrigger>
            <TabsTrigger value="contracts">{t('sales.contracts')}</TabsTrigger>
            <TabsTrigger value="workflow">{t('sales.workflow')}</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="shadow-2xs">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {template.type === 'partners' ? (
                        <Store className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                      {template.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {t(`sales.${template.category}`)}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {t('sales.useTemplate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder={t('sales.searchContracts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('sales.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('sales.allStatuses')}</SelectItem>
                    <SelectItem value="draft">{t('sales.draft')}</SelectItem>
                    <SelectItem value="generated">{t('sales.generated')}</SelectItem>
                    <SelectItem value="sent">{t('sales.sent')}</SelectItem>
                    <SelectItem value="signed">{t('sales.signed')}</SelectItem>
                    <SelectItem value="pending_legal">{t('sales.pending_legal')}</SelectItem>
                    <SelectItem value="approved">{t('sales.approved')}</SelectItem>
                    <SelectItem value="rejected">{t('sales.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.contract')}</TableHead>
                  <TableHead>{t('sales.company')}</TableHead>
                  <TableHead>{t('sales.template')}</TableHead>
                  <TableHead>{t('sales.status')}</TableHead>
                  <TableHead>{t('sales.generatedAt')}</TableHead>
                  <TableHead>{t('sales.assignedTo')}</TableHead>
                  <TableHead className="text-right">{t('sales.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(contract.status)}
                        <span className="font-medium">
                          {contract.id.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.lead.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.lead.contact.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {contract.templateName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {t(`sales.${contract.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(contract.metadata.generatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {contract.metadata.repName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedContract(contract)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('sales.view')}
                          </DropdownMenuItem>
                          {contract.status === 'draft' && (
                            <DropdownMenuItem onClick={() => generateContract(contract.leadId, contract.templateId)}>
                              <Download className="mr-2 h-4 w-4" />
                              {t('sales.generate')}
                            </DropdownMenuItem>
                          )}
                          {contract.status === 'generated' && (
                            <DropdownMenuItem onClick={() => sendContract(contract.id)}>
                              <Upload className="mr-2 h-4 w-4" />
                              {t('sales.send')}
                            </DropdownMenuItem>
                          )}
                          {contract.status === 'signed' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('sales.submitForLegal')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-2xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    {t('sales.partnersWorkflow')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{t('sales.selectTemplate')}</p>
                        <p className="text-sm text-primary">{t('sales.selectTemplateDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-warning">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-warning">{t('sales.generateContract')}</p>
                        <p className="text-sm text-warning/80">{t('sales.generateContractDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{t('sales.sendToPartner')}</p>
                        <p className="text-sm text-primary">{t('sales.sendToPartnerDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-success">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-success">{t('sales.uploadSigned')}</p>
                        <p className="text-sm text-success/80">{t('sales.uploadSignedDescription')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('sales.b2bWorkflow')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{t('sales.createProposal')}</p>
                        <p className="text-sm text-primary">{t('sales.createProposalDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-warning">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-warning">{t('sales.negotiateTerms')}</p>
                        <p className="text-sm text-warning/80">{t('sales.negotiateTermsDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{t('sales.generateContract')}</p>
                        <p className="text-sm text-primary">{t('sales.generateContractDescription')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-success">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-success">{t('sales.legalReview')}</p>
                        <p className="text-sm text-success/80">{t('sales.legalReviewDescription')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contract Details Dialog */}
        <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('sales.contractDetails')}</DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('sales.company')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedContract.lead.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.status')}</Label>
                    <Badge className={getStatusColor(selectedContract.status)}>
                      {t(`sales.${selectedContract.status}`)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.template')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedContract.templateName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.generatedAt')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedContract.metadata.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">{t('sales.terms')}</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('sales.duration')}</p>
                      <p className="text-sm font-medium">{selectedContract.terms.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('sales.commission')}</p>
                      <p className="text-sm font-medium">{selectedContract.terms.commission}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('sales.exclusivity')}</p>
                      <p className="text-sm font-medium">{selectedContract.terms.exclusivity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('sales.territory')}</p>
                      <p className="text-sm font-medium">{selectedContract.terms.territory}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {selectedContract.draftUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('sales.downloadDraft')}
                    </Button>
                  )}
                  {selectedContract.signedUrl && (
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      {t('sales.viewSigned')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
