'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Wrench, 
  Package, 
  Truck, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Settings,
  Users,
  Activity
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
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

interface Partner {
  id: string;
  companyName: string;
  type: 'shop' | 'repair_center' | 'accessories_store' | 'parts_importer' | 'manufacturer';
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  businessDetails: {
    address: string;
    city: string;
    governorate: string;
    businessLicense: string;
    taxId: string;
    workingHours: string;
    services: string[];
  };
  onboardingStatus: 'pending' | 'in_progress' | 'onboarded' | 'rejected';
  onboardingProgress: {
    profileCreated: boolean;
    documentsUploaded: boolean;
    contractSigned: boolean;
    accountCreated: boolean;
    inventorySynced: boolean;
    trainingCompleted: boolean;
    goLive: boolean;
  };
  assignedTo: string;
  createdAt: string;
  onboardedAt?: string;
  notes?: string;
}

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  inProgress: boolean;
  required: boolean;
  estimatedTime: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile_creation',
    name: 'profile_creation',
    description: 'profile_creation_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '5 minutes'
  },
  {
    id: 'document_upload',
    name: 'document_upload',
    description: 'document_upload_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '10 minutes'
  },
  {
    id: 'contract_signing',
    name: 'contract_signing',
    description: 'contract_signing_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '15 minutes'
  },
  {
    id: 'account_creation',
    name: 'account_creation',
    description: 'account_creation_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '5 minutes'
  },
  {
    id: 'inventory_sync',
    name: 'inventory_sync',
    description: 'inventory_sync_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '30 minutes'
  },
  {
    id: 'training',
    name: 'training',
    description: 'training_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '45 minutes'
  },
  {
    id: 'go_live',
    name: 'go_live',
    description: 'go_live_description',
    completed: false,
    inProgress: false,
    required: true,
    estimatedTime: '5 minutes'
  }
];

export default function PartnerOnboarding() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setIsLoading(true);
      
      const response = await productionApi.getPartners();
      if (response.success) {
        setPartners(response.partners || []);
      }

      toast.success(t('sales.partnerDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadPartnerData'));
    } finally {
      setIsLoading(false);
    }
  };

  const startOnboarding = async (partnerId: string) => {
    try {
      setIsOnboarding(true);
      
      const response = await productionApi.startPartnerOnboarding(partnerId);
      if (response.success) {
        toast.success(t('sales.onboardingStarted'));
        loadPartnerData();
      } else {
        toast.error(response.message || t('sales.failedToStartOnboarding'));
      }
    } catch (error) {
      toast.error(t('sales.failedToStartOnboarding'));
    } finally {
      setIsOnboarding(false);
    }
  };

  const completeOnboardingStep = async (partnerId: string, stepId: string) => {
    try {
      const response = await productionApi.completeOnboardingStep(partnerId, stepId);
      if (response.success) {
        toast.success(t('sales.stepCompleted'));
        loadPartnerData();
      } else {
        toast.error(response.message || t('sales.failedToCompleteStep'));
      }
    } catch (error) {
      toast.error(t('sales.failedToCompleteStep'));
    }
  };

  const goLive = async (partnerId: string) => {
    try {
      const response = await productionApi.goLivePartner(partnerId);
      if (response.success) {
        toast.success(t('sales.partnerGoLive'));
        loadPartnerData();
      } else {
        toast.error(response.message || t('sales.failedToGoLive'));
      }
    } catch (error) {
      toast.error(t('sales.failedToGoLive'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-muted text-foreground';
      case 'in_progress': return 'bg-blue-100 text-primary';
      case 'onboarded': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shop': return <Store className="h-4 w-4" />;
      case 'repair_center': return <Wrench className="h-4 w-4" />;
      case 'accessories_store': return <Package className="h-4 w-4" />;
      case 'parts_importer': return <Truck className="h-4 w-4" />;
      case 'manufacturer': return <Building2 className="h-4 w-4" />;
      default: return <Store className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (partner: Partner) => {
    const steps = Object.values(partner.onboardingProgress);
    const completed = steps.filter(step => step).length;
    return Math.round((completed / steps.length) * 100);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = searchTerm === '' || 
      partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || partner.onboardingStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('sales.partnerOnboarding')}
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
            <Users className="h-5 w-5" />
            {t('sales.partnerOnboarding')}
          </CardTitle>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('sales.newPartner')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline">{t('sales.onboardingPipeline')}</TabsTrigger>
            <TabsTrigger value="progress">{t('sales.progress')}</TabsTrigger>
            <TabsTrigger value="workflow">{t('sales.workflow')}</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder={t('sales.searchPartners')}
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
                    <SelectItem value="pending">{t('sales.pending')}</SelectItem>
                    <SelectItem value="in_progress">{t('sales.in_progress')}</SelectItem>
                    <SelectItem value="onboarded">{t('sales.onboarded')}</SelectItem>
                    <SelectItem value="rejected">{t('sales.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.partner')}</TableHead>
                  <TableHead>{t('sales.type')}</TableHead>
                  <TableHead>{t('sales.status')}</TableHead>
                  <TableHead>{t('sales.progress')}</TableHead>
                  <TableHead>{t('sales.assignedTo')}</TableHead>
                  <TableHead>{t('sales.createdAt')}</TableHead>
                  <TableHead className="text-right">{t('sales.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(partner.type)}
                        <div>
                          <p className="font-medium">{partner.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {partner.contact.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`sales.${partner.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(partner.onboardingStatus)}>
                        {t(`sales.${partner.onboardingStatus}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={getProgressPercentage(partner)} className="w-20 h-2" />
                        <span className="text-sm font-medium">
                          {getProgressPercentage(partner)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {partner.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(partner.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => setSelectedPartner(partner)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('sales.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          {partner.onboardingStatus === 'pending' && (
                            <DropdownMenuItem onClick={() => startOnboarding(partner.id)}>
                              <Activity className="mr-2 h-4 w-4" />
                              {t('sales.startOnboarding')}
                            </DropdownMenuItem>
                          )}
                          {partner.onboardingStatus === 'in_progress' && getProgressPercentage(partner) === 100 && (
                            <DropdownMenuItem onClick={() => goLive(partner.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('sales.goLive')}
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

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.map((partner) => (
                <Card key={partner.id} className="shadow-2xs">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(partner.type)}
                      <span className="text-sm">{partner.companyName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{t('sales.progress')}</span>
                          <span className="text-sm font-bold">
                            {getProgressPercentage(partner)}%
                          </span>
                        </div>
                        <Progress value={getProgressPercentage(partner)} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        {ONBOARDING_STEPS.map((step) => {
                          const isCompleted = partner.onboardingProgress[step.id as keyof typeof partner.onboardingProgress];
                          return (
                            <div key={step.id} className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={`text-sm ${isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                                {t(`sales.${step.name}`)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge className={getStatusColor(partner.onboardingStatus)}>
                          {t(`sales.${partner.onboardingStatus}`)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedPartner(partner)}
                        >
                          {t('sales.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('sales.onboardingWorkflow')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ONBOARDING_STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {t(`sales.${step.name}`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(`sales.${step.description}`)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {t('sales.estimatedTime')}: {step.estimatedTime}
                          </span>
                          {step.required && (
                            <Badge variant="outline" className="text-xs">
                              {t('sales.required')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : step.inProgress ? (
                          <Clock className="h-5 w-5 text-primary" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Partner Details Dialog */}
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('sales.partnerDetails')}</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('sales.company')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.type')}</Label>
                    <Badge variant="outline">
                      {t(`sales.${selectedPartner.type}`)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.contact')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.contact.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.phone')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.contact.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.address')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.businessDetails.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('sales.city')}</Label>
                    <p className="text-sm text-muted-foreground">{selectedPartner.businessDetails.city}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('sales.onboardingProgress')}</Label>
                  <div className="mt-2">
                    <Progress value={getProgressPercentage(selectedPartner)} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {getProgressPercentage(selectedPartner)}% {t('sales.complete')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {selectedPartner.onboardingStatus === 'pending' && (
                    <Button onClick={() => startOnboarding(selectedPartner.id)}>
                      {t('sales.startOnboarding')}
                    </Button>
                  )}
                  {selectedPartner.onboardingStatus === 'in_progress' && getProgressPercentage(selectedPartner) === 100 && (
                    <Button onClick={() => goLive(selectedPartner.id)}>
                      {t('sales.goLive')}
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
