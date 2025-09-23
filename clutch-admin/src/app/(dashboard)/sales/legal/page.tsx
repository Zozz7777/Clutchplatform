'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Store,
  Truck,
  Shield,
  CreditCard,
  Car,
  Wrench,
  Package,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Handshake,
  Award,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

interface Contract {
  id: string;
  leadId: string;
  type: 'partners' | 'b2b_enterprise';
  category: 'shop' | 'repair_center' | 'accessories_store' | 'parts_importer' | 'manufacturer' | 'fleet_company' | 'insurance_company' | 'installment_company';
  status: 'draft' | 'sent' | 'signed' | 'pending_legal' | 'approved' | 'rejected';
  templateId: string;
  draftUrl: string;
  signedUrl: string;
  signedDate: string;
  submittedDate: string;
  lead: {
    companyName: string;
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
    };
    assignedTo: string;
  };
  legalReview: {
    reviewerId: string;
    reviewerName: string;
    approved: boolean;
    reason: string;
    reviewedAt: string;
    notes: string;
  } | null;
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedValue: number;
  terms: {
    duration: string;
    commission: number;
    exclusivity: string;
    territory: string;
  };
}

interface LegalKPIs {
  totalContracts: number;
  pendingReview: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  avgReviewTime: number;
  highRiskContracts: number;
  urgentContracts: number;
  complianceRate: number;
}

export default function LegalContractsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | ''>('');

  const [legalKPIs, setLegalKPIs] = useState<LegalKPIs>({
    totalContracts: 0,
    pendingReview: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    avgReviewTime: 0,
    highRiskContracts: 0,
    urgentContracts: 0,
    complianceRate: 0
  });

  useEffect(() => {
    loadLegalData();
  }, []);

  const loadLegalData = async () => {
    try {
      setIsLoading(true);
      
      // Load contracts data
      const contractsResponse = await productionApi.getContracts();
      if (contractsResponse.success) {
        setContracts(contractsResponse.contracts || []);
      }

      // Load legal KPIs
      const kpisResponse = await productionApi.getSalesReports('legal');
      if (kpisResponse.success) {
        setLegalKPIs(kpisResponse.data.kpis || legalKPIs);
      }

      toast.success(t('sales.legalDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadLegalData'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'shop': return <Store className="h-4 w-4" />;
      case 'repair_center': return <Wrench className="h-4 w-4" />;
      case 'accessories_store': return <Package className="h-4 w-4" />;
      case 'parts_importer': return <Truck className="h-4 w-4" />;
      case 'manufacturer': return <Building2 className="h-4 w-4" />;
      case 'fleet_company': return <Car className="h-4 w-4" />;
      case 'insurance_company': return <Shield className="h-4 w-4" />;
      case 'installment_company': return <CreditCard className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_legal': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' || 
      contract.lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.lead.businessDetails.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || contract.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleReviewContract = async (contractId: string, decision: 'approve' | 'reject') => {
    try {
      const response = await productionApi.updateContract(contractId, {
        status: decision === 'approve' ? 'approved' : 'rejected',
        legalReview: {
          reviewerId: 'current_user_id',
          reviewerName: 'Current User',
          approved: decision === 'approve',
          reason: reviewNotes,
          reviewedAt: new Date().toISOString(),
          notes: reviewNotes
        }
      });

      if (response.success) {
        toast.success(t('sales.contractReviewSubmitted'));
        loadLegalData();
        setSelectedContract(null);
        setReviewNotes('');
        setReviewDecision('');
      } else {
        toast.error(t('sales.failedToReviewContract'));
      }
    } catch (error) {
      toast.error(t('sales.failedToReviewContract'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Legal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.legalContractsView')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.legalContractsDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Download className="mr-2 h-4 w-4" />
            {t('sales.exportReport')}
          </Button>
        </div>
      </div>

      {/* Legal KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.pendingReview')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{legalKPIs.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              {legalKPIs.urgentContracts} {t('sales.urgent')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.approvedThisMonth')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{legalKPIs.approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> {t('sales.fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.avgReviewTime')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{legalKPIs.avgReviewTime}</div>
            <p className="text-xs text-muted-foreground">
              {t('sales.hours')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.complianceRate')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{legalKPIs.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t('sales.contractsCompliant')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">{t('sales.pendingReview')}</TabsTrigger>
          <TabsTrigger value="approved">{t('sales.approved')}</TabsTrigger>
          <TabsTrigger value="rejected">{t('sales.rejected')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('sales.analytics')}</TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-6">
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
                  <SelectItem value="pending_legal">{t('sales.pending_legal')}</SelectItem>
                  <SelectItem value="signed">{t('sales.signed')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('sales.allRisks')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('sales.allRisks')}</SelectItem>
                  <SelectItem value="high">{t('sales.high')}</SelectItem>
                  <SelectItem value="medium">{t('sales.medium')}</SelectItem>
                  <SelectItem value="low">{t('sales.low')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="shadow-2xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.contact')}</TableHead>
                    <TableHead>{t('sales.submittedDate')}</TableHead>
                    <TableHead>{t('sales.riskLevel')}</TableHead>
                    <TableHead>{t('sales.priority')}</TableHead>
                    <TableHead>{t('sales.estimatedValue')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(contract => contract.status === 'pending_legal')
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(contract.category)}
                          <div>
                            <p className="font-medium">{contract.lead.companyName}</p>
                            <p className="text-sm text-muted-foreground">{contract.lead.businessDetails.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${contract.category}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.lead.contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contract.lead.contact.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(contract.submittedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(contract.riskLevel)}>
                          {t(`sales.${contract.riskLevel}Risk`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(contract.priority)}>
                          {t(`sales.${contract.priority}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          EGP {contract.estimatedValue?.toLocaleString() || '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-6">
          <Card className="shadow-2xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.approvedDate')}</TableHead>
                    <TableHead>{t('sales.reviewer')}</TableHead>
                    <TableHead>{t('sales.estimatedValue')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(contract => contract.status === 'approved')
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(contract.category)}
                          <div>
                            <p className="font-medium">{contract.lead.companyName}</p>
                            <p className="text-sm text-muted-foreground">{contract.lead.businessDetails.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${contract.category}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contract.legalReview ? new Date(contract.legalReview.reviewedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contract.legalReview?.reviewerName || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          EGP {contract.estimatedValue?.toLocaleString() || '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-6">
          <Card className="shadow-2xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.rejectedDate')}</TableHead>
                    <TableHead>{t('sales.reason')}</TableHead>
                    <TableHead>{t('sales.reviewer')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts
                    .filter(contract => contract.status === 'rejected')
                    .map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(contract.category)}
                          <div>
                            <p className="font-medium">{contract.lead.companyName}</p>
                            <p className="text-sm text-muted-foreground">{contract.lead.businessDetails.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${contract.category}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contract.legalReview ? new Date(contract.legalReview.reviewedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {contract.legalReview?.reason || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contract.legalReview?.reviewerName || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('sales.reviewTrends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('sales.reviewTrendsChartComingSoon')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('sales.complianceMetrics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.complianceRate')}</span>
                    <span className="font-bold">{legalKPIs.complianceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.avgReviewTime')}</span>
                    <span className="font-bold">{legalKPIs.avgReviewTime} {t('sales.hours')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.highRiskContracts')}</span>
                    <span className="font-bold">{legalKPIs.highRiskContracts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.urgentContracts')}</span>
                    <span className="font-bold">{legalKPIs.urgentContracts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contract Review Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('sales.reviewContract')}</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t('sales.company')}</Label>
                  <p className="text-sm text-muted-foreground">{selectedContract.lead.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('sales.type')}</Label>
                  <p className="text-sm text-muted-foreground">{t(`sales.${selectedContract.category}`)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('sales.contact')}</Label>
                  <p className="text-sm text-muted-foreground">{selectedContract.lead.contact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('sales.estimatedValue')}</Label>
                  <p className="text-sm text-muted-foreground">EGP {selectedContract.estimatedValue?.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">{t('sales.reviewNotes')}</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={t('sales.enterReviewNotes')}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleReviewContract(selectedContract.id, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!reviewNotes}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('sales.approve')}
                </Button>
                <Button
                  onClick={() => handleReviewContract(selectedContract.id, 'reject')}
                  variant="destructive"
                  disabled={!reviewNotes}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('sales.reject')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
