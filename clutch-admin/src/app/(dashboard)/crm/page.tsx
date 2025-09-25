'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Handshake, 
  Phone, 
  Mail, 
  Calendar,
  Plus,
  Filter,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { productionApi } from '@/lib/production-api';

// Import sales widgets
import SalesPipeline from '@/components/widgets/sales-pipeline';
import LeadConversion from '@/components/widgets/lead-conversion';
import RevenueForecast from '@/components/widgets/revenue-forecast';
import TeamPerformance from '@/components/widgets/team-performance';
import ContractStatus from '@/components/widgets/contract-status';
import CommunicationHistory from '@/components/widgets/communication-history';
import CreateLeadDialog from '@/components/dialogs/create-lead-dialog';

interface Lead {
  id: string;
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
  createdAt: string;
  value?: number;
}

interface Deal {
  id: string;
  leadId: string;
  pipeline: 'b2b' | 'partners';
  stage: 'prospect' | 'proposal' | 'negotiation' | 'signed';
  valueEGP: number;
  probability: number;
  assignedTo: string;
  createdAt: string;
}

interface Contract {
  id: string;
  leadId: string;
  status: 'draft' | 'printed' | 'signed_uploaded' | 'pending_legal' | 'approved' | 'rejected';
  templateId: string;
  createdAt: string;
}

export default function SalesPage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads, deals, and contracts in parallel
      const [leadsResponse, dealsResponse, contractsResponse] = await Promise.all([
        productionApi.getLeads(),
        productionApi.getDeals(),
        productionApi.getContracts()
      ]);

      if (leadsResponse.success) {
        setLeads(leadsResponse.leads || []);
      }
      
      if (dealsResponse.success) {
        setDeals(dealsResponse.deals || []);
      }
      
      if (contractsResponse.success) {
        setContracts(contractsResponse.contracts || []);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary/10 text-primary';
      case 'contacted': return 'bg-secondary/10 text-secondary';
      case 'qualified': return 'bg-success/10 text-success';
      case 'converted': return 'bg-success/20 text-success';
      case 'lost': return 'bg-destructive/10 text-destructive';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'signed_uploaded': return 'bg-primary/10 text-primary';
      case 'pending_legal': return 'bg-secondary/10 text-secondary';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shop': return '🏪';
      case 'importer': return '📦';
      case 'manufacturer': return '🏭';
      case 'fleet': return '🚛';
      case 'insurance': return '🛡️';
      default: return '🏢';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesType = typeFilter === 'all' || lead.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + deal.valueEGP, 0),
    contractsPending: contracts.filter(c => c.status === 'pending_legal').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button size="sm" onClick={() => setShowCreateLead(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newLead')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-2xs rounded-[0.625rem] font-sans">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalLeads')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs rounded-[0.625rem] font-sans">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('qualifiedLeads')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.qualifiedLeads}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs rounded-[0.625rem] font-sans">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalDeals')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDeals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs rounded-[0.625rem] font-sans">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalValue')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalValue.toLocaleString()} EGP</p>
              </div>
              <FileText className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="leads">{t('leads')}</TabsTrigger>
          <TabsTrigger value="deals">{t('deals')}</TabsTrigger>
          <TabsTrigger value="contracts">{t('contracts')}</TabsTrigger>
          <TabsTrigger value="partners">{t('partners')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesPipeline />
            <LeadConversion />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueForecast />
            <TeamPerformance />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractStatus />
            <CommunicationHistory />
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card className="shadow-2xs rounded-[0.625rem] font-sans">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('leads')}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('searchLeads')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="new">{t('new')}</SelectItem>
                      <SelectItem value="contacted">{t('contacted')}</SelectItem>
                      <SelectItem value="qualified">{t('qualified')}</SelectItem>
                      <SelectItem value="converted">{t('converted')}</SelectItem>
                      <SelectItem value="lost">{t('lost')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allTypes')}</SelectItem>
                      <SelectItem value="shop">{t('shop')}</SelectItem>
                      <SelectItem value="importer">{t('importer')}</SelectItem>
                      <SelectItem value="manufacturer">{t('manufacturer')}</SelectItem>
                      <SelectItem value="fleet">{t('fleet')}</SelectItem>
                      <SelectItem value="insurance">{t('insurance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('company')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('contact')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('assignedTo')}</TableHead>
                    <TableHead>{t('value')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead className="w-[50px]">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.title}</div>
                          <div className="text-sm text-muted-foreground">{lead.companyName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(lead.type)}</span>
                          <span className="capitalize">{lead.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.contact.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.contact.email}</div>
                          <div className="text-sm text-muted-foreground">{lead.contact.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {t(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.assignedTo}</TableCell>
                      <TableCell>
                        {lead.value ? `${lead.value.toLocaleString()} EGP` : '-'}
                      </TableCell>
                      <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              {t('call')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              {t('email')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          <Card className="shadow-2xs rounded-[0.625rem] font-sans">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('deals')}
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newDeal')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('deal')}</TableHead>
                    <TableHead>{t('pipeline')}</TableHead>
                    <TableHead>{t('stage')}</TableHead>
                    <TableHead>{t('value')}</TableHead>
                    <TableHead>{t('probability')}</TableHead>
                    <TableHead>{t('assignedTo')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead className="w-[50px]">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div className="font-medium">Deal #{deal.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {leads.find(l => l.id === deal.leadId)?.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {deal.pipeline}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(deal.stage)}>
                          {t(deal.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {deal.valueEGP.toLocaleString()} EGP
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{deal.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{deal.assignedTo}</TableCell>
                      <TableCell>{new Date(deal.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              {t('createContract')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card className="shadow-2xs rounded-[0.625rem] font-sans">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('contracts')}
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newContract')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('contract')}</TableHead>
                    <TableHead>{t('lead')}</TableHead>
                    <TableHead>{t('template')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead className="w-[50px]">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="font-medium">Contract #{contract.id}</div>
                      </TableCell>
                      <TableCell>
                        {leads.find(l => l.id === contract.leadId)?.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contract.templateId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.status)}>
                          {t(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              {t('download')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <Card className="shadow-2xs rounded-[0.625rem] font-sans">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('partners')}
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newPartner')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Handshake className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>{t('partnersComingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Lead Dialog */}
      <CreateLeadDialog
        open={showCreateLead}
        onOpenChange={setShowCreateLead}
        onLeadCreated={(newLead) => {
          setLeads(prev => [newLead, ...prev]);
        }}
      />
    </div>
  );
}