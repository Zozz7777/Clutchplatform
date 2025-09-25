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
  AlertTriangle,
  Building2,
  Store,
  Truck,
  Shield,
  CreditCard,
  Target,
  BarChart3,
  Activity,
  UserCheck,
  FileCheck,
  Globe,
  Settings,
  Bell,
  Star,
  Award,
  Zap,
  MapPin,
  Package,
  Wrench,
  Car,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown
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
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';
import CreateLeadDialog from '@/components/dialogs/create-lead-dialog';

// Import sales widgets
import SalesPipeline from '@/components/widgets/sales-pipeline';
import LeadConversion from '@/components/widgets/lead-conversion';
import RevenueForecast from '@/components/widgets/revenue-forecast';
import TeamPerformance from '@/components/widgets/team-performance';
import ContractStatus from '@/components/widgets/contract-status';
import CommunicationHistory from '@/components/widgets/communication-history';

interface ClutchLead {
  id: string;
  title: string;
  type: 'shop' | 'repair_center' | 'accessories_store' | 'parts_importer' | 'manufacturer' | 'fleet_company' | 'insurance_company' | 'installment_company';
  companyName: string;
  businessType: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  businessDetails: {
    address: string;
    city: string;
    governorate: string;
    businessLicense: string;
    taxId: string;
  };
  team: 'partners' | 'b2b';
  pipeline: 'partners' | 'b2b_enterprise';
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'contract_sent' | 'signed' | 'onboarded' | 'live' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  source: string;
  contract: {
    status: 'not_started' | 'draft' | 'sent' | 'signed' | 'approved' | 'rejected';
    templateId: string;
    draftUrl: string;
    signedUrl: string;
    signedDate: string;
  };
  accounts: {
    partnersApp: { created: boolean; status: string };
    partsSystem: { created: boolean; status: string };
    enterpriseDashboard: { created: boolean; status: string };
  };
  createdAt: string;
  lastActivityAt: string;
  estimatedValue?: number;
}

export default function SalesDepartmentPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<ClutchLead[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'partners' | 'b2b'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateLead, setShowCreateLead] = useState(false);

  // Department KPIs
  const [departmentKPIs, setDepartmentKPIs] = useState({
    totalLeads: 0,
    partnersLeads: 0,
    b2bLeads: 0,
    totalContracts: 0,
    pendingLegal: 0,
    livePartners: 0,
    activeEnterprise: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    avgCycleTime: 0
  });

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setIsLoading(true);
      
      // Load leads data
      const leadsResponse = await productionApi.getLeads();
      if (leadsResponse.success) {
        setLeads(leadsResponse.leads || []);
      }

      // Load department KPIs
      const kpisResponse = await productionApi.getSalesPerformanceTeam('monthly');
      if (kpisResponse.success && Array.isArray(kpisResponse.kpis)) {
        // Transform array data into expected object structure
        const teamData = kpisResponse.kpis;
        const transformedKPIs = {
          totalLeads: teamData.reduce((sum, team) => sum + (team.leads || 0), 0),
          partnersLeads: teamData.find(t => t.team === 'Partners')?.leads || 0,
          b2bLeads: teamData.find(t => t.team === 'B2B')?.leads || 0,
          totalContracts: teamData.reduce((sum, team) => sum + (team.deals || 0), 0),
          pendingLegal: 0, // This would need to come from contracts API
          livePartners: teamData.find(t => t.team === 'Partners')?.members || 0,
          activeEnterprise: teamData.find(t => t.team === 'Enterprise')?.members || 0,
          monthlyRevenue: teamData.reduce((sum, team) => sum + (team.revenue || 0), 0),
          conversionRate: teamData.reduce((sum, team) => sum + (team.conversionRate || 0), 0) / teamData.length,
          avgCycleTime: 0 // This would need to come from a different API
        };
        setDepartmentKPIs(transformedKPIs);
      }

      toast.success(t('sales.dataLoadedSuccessfully'));
    } catch (error) {
      toast.error(t('sales.failedToLoadSalesData'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
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
      case 'new': return 'bg-primary/10 text-primary';
      case 'contacted': return 'bg-secondary/10 text-secondary';
      case 'qualified': return 'bg-success/10 text-success';
      case 'proposal_sent': return 'bg-warning/10 text-warning';
      case 'contract_sent': return 'bg-info/10 text-info';
      case 'signed': return 'bg-success/20 text-success';
      case 'onboarded': return 'bg-success/30 text-success';
      case 'live': return 'bg-success/40 text-success';
      case 'lost': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-info/10 text-info';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesTeam = selectedTeam === 'all' || lead.team === selectedTeam;
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessDetails.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTeam && matchesStatus && matchesSearch;
  });

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
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.departmentTitle')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.departmentDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Download className="mr-2 h-4 w-4" />
            {t('sales.exportReport')}
          </Button>
          <Button className="shadow-2xs" onClick={() => setShowCreateLead(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('sales.newLead')}
          </Button>
        </div>
      </div>

      {/* Department KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.totalLeads')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departmentKPIs.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12%</span> {t('sales.fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.partnersTeam')}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departmentKPIs.partnersLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8%</span> {t('sales.fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.b2bTeam')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departmentKPIs.b2bLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+15%</span> {t('sales.fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.livePartners')}
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departmentKPIs.livePartners}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+5</span> {t('sales.thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.monthlyRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              EGP {(departmentKPIs.monthlyRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+18%</span> {t('sales.fromLastMonth')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t('sales.overview')}</TabsTrigger>
          <TabsTrigger value="partners">{t('sales.partnersTeam')}</TabsTrigger>
          <TabsTrigger value="b2b">{t('sales.b2bTeam')}</TabsTrigger>
          <TabsTrigger value="contracts">{t('sales.contracts')}</TabsTrigger>
          <TabsTrigger value="activities">{t('sales.activities')}</TabsTrigger>
          <TabsTrigger value="reports">{t('sales.reports')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SalesPipeline />
            <LeadConversion />
            <RevenueForecast />
            <TeamPerformance />
            <ContractStatus />
            <CommunicationHistory />
          </div>
        </TabsContent>

        {/* Partners Team Tab */}
        <TabsContent value="partners" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('sales.partnersTeam')}</h2>
              <p className="text-muted-foreground">{t('sales.partnersDescription')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Store className="mr-2 h-4 w-4" />
                {t('sales.newPartner')}
              </Button>
            </div>
          </div>

          {/* Partners Pipeline */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {t('sales.partnersPipeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {['new', 'contacted', 'qualified', 'contract_sent', 'live'].map((stage) => (
                  <div key={stage} className="text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {filteredLeads.filter(lead => lead.team === 'partners' && lead.status === stage).length}
                      </p>
                      <p className="text-sm text-muted-foreground">{t(`sales.${stage}`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partners Leads Table */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle>{t('sales.partnersLeads')}</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder={t('sales.searchLeads')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('sales.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('sales.allStatuses')}</SelectItem>
                    <SelectItem value="new">{t('sales.new')}</SelectItem>
                    <SelectItem value="contacted">{t('sales.contacted')}</SelectItem>
                    <SelectItem value="qualified">{t('sales.qualified')}</SelectItem>
                    <SelectItem value="contract_sent">{t('sales.contract_sent')}</SelectItem>
                    <SelectItem value="live">{t('sales.live')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.contact')}</TableHead>
                    <TableHead>{t('sales.location')}</TableHead>
                    <TableHead>{t('sales.status')}</TableHead>
                    <TableHead>{t('sales.priority')}</TableHead>
                    <TableHead>{t('sales.assignedTo')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads
                    .filter(lead => lead.team === 'partners')
                    .slice(0, 10)
                    .map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(lead.type)}
                          <div>
                            <p className="font-medium">{lead.companyName}</p>
                            <p className="text-sm text-muted-foreground">{lead.businessType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${lead.type}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.contact.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.contact.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{lead.businessDetails.city}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {t(`sales.${lead.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {t(`sales.${lead.priority}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {lead.assignedTo?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-sm">{lead.assignedTo || t('sales.unassigned')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('sales.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('sales.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              {t('sales.call')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              {t('sales.email')}
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

        {/* B2B Team Tab */}
        <TabsContent value="b2b" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('sales.b2bTeam')}</h2>
              <p className="text-muted-foreground">{t('sales.b2bDescription')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                {t('sales.newEnterprise')}
              </Button>
            </div>
          </div>

          {/* B2B Pipeline */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('sales.b2bPipeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {['new', 'contacted', 'qualified', 'proposal_sent', 'signed'].map((stage) => (
                  <div key={stage} className="text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {filteredLeads.filter(lead => lead.team === 'b2b' && lead.status === stage).length}
                      </p>
                      <p className="text-sm text-muted-foreground">{t(`sales.${stage}`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* B2B Leads Table */}
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle>{t('sales.b2bLeads')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.contact')}</TableHead>
                    <TableHead>{t('sales.estimatedValue')}</TableHead>
                    <TableHead>{t('sales.status')}</TableHead>
                    <TableHead>{t('sales.priority')}</TableHead>
                    <TableHead>{t('sales.assignedTo')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads
                    .filter(lead => lead.team === 'b2b')
                    .slice(0, 10)
                    .map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(lead.type)}
                          <div>
                            <p className="font-medium">{lead.companyName}</p>
                            <p className="text-sm text-muted-foreground">{lead.businessType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${lead.type}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.contact.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.contact.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          EGP {lead.estimatedValue?.toLocaleString() || '0'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {t(`sales.${lead.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {t(`sales.${lead.priority}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {lead.assignedTo?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-sm">{lead.assignedTo || t('sales.unassigned')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('sales.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('sales.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              {t('sales.createProposal')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              {t('sales.configureDashboard')}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('sales.contracts')}</h2>
              <p className="text-muted-foreground">{t('sales.contractsDescription')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                {t('sales.generateContract')}
              </Button>
            </div>
          </div>

          <ContractStatus />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('sales.activities')}</h2>
              <p className="text-muted-foreground">{t('sales.activitiesDescription')}</p>
            </div>
          </div>

          <CommunicationHistory />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('sales.reports')}</h2>
              <p className="text-muted-foreground">{t('sales.reportsDescription')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('sales.exportReport')}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <LeadConversion />
            <RevenueForecast />
            <TeamPerformance />
          </div>
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