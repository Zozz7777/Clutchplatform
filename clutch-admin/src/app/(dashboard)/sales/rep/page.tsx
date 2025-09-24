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
  TrendingDown,
  CheckSquare,
  Square,
  Timer,
  Navigation,
  Camera,
  Upload,
  MessageSquare,
  Calendar as CalendarIcon,
  MapPin as LocationIcon
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
import { Checkbox } from '@/components/ui/checkbox';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

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
  activities: any[];
  notes: any[];
  tasks: any[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'visit' | 'email' | 'follow_up' | 'contract' | 'proposal';
  dueDate: string;
  completed: boolean;
  leadId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function SalesRepDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('my-leads');
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<ClutchLead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'partners' | 'b2b'>('partners');
  const [searchTerm, setSearchTerm] = useState('');

  // Rep's personal KPIs
  const [repKPIs, setRepKPIs] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    contractsSent: 0,
    signedContracts: 0,
    monthlyTarget: 0,
    targetProgress: 0,
    conversionRate: 0,
    avgCycleTime: 0,
    thisWeekActivities: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    loadRepData();
  }, []);

  const loadRepData = async () => {
    try {
      setIsLoading(true);
      
      // Load rep's leads
      const leadsResponse = await productionApi.getLeads();
      if (leadsResponse.success) {
        // Filter leads assigned to current rep
        const myLeads = leadsResponse.leads?.filter(lead => lead.assignedTo === 'current_user_id') || [];
        setLeads(myLeads);
      }

      // Load rep's tasks
      const tasksResponse = await productionApi.getSalesActivities();
      if (tasksResponse.success) {
        setTasks(tasksResponse.activities || []);
      }

      // Load rep's KPIs
      const kpisResponse = await productionApi.getTeamPerformance();
      if (kpisResponse.success) {
        setRepKPIs(kpisResponse.kpis || repKPIs);
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
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesTeam = lead.team === selectedTeam;
    const matchesSearch = searchTerm === '' || 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessDetails.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTeam && matchesSearch;
  });

  const todayTasks = tasks.filter(task => 
    new Date(task.dueDate).toDateString() === new Date().toDateString()
  );

  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && !task.completed
  );

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
      {/* Rep Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.repDashboard')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.repDashboardDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Navigation className="mr-2 h-4 w-4" />
            {t('sales.planRoute')}
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('sales.newLead')}
          </Button>
        </div>
      </div>

      {/* Rep's Personal KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.myLeads')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{repKPIs.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+3</span> {t('sales.thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.qualifiedLeads')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{repKPIs.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              {repKPIs.conversionRate}% {t('sales.conversionRate')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.contractsSent')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{repKPIs.contractsSent}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> {t('sales.thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.signedContracts')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{repKPIs.signedContracts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+1</span> {t('sales.thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.monthlyTarget')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{repKPIs.targetProgress}%</div>
            <Progress value={repKPIs.targetProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {repKPIs.signedContracts} / {repKPIs.monthlyTarget} {t('sales.contracts')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('sales.todayTasks')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => {
                        // Handle task completion
                      }}
                    />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {t(`sales.${task.priority}`)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t('sales.noTasksToday')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('sales.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800">
                  {overdueTasks.length} {t('sales.overdueTasks')}
                </p>
                <p className="text-sm text-red-600">{t('sales.overdueTasksDescription')}</p>
              </div>
            )}
            
            {leads.filter(lead => lead.priority === 'urgent').length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="font-medium text-orange-800">
                  {leads.filter(lead => lead.priority === 'urgent').length} {t('sales.urgentLeads')}
                </p>
                <p className="text-sm text-orange-600">{t('sales.urgentLeadsDescription')}</p>
              </div>
            )}

            {leads.filter(lead => lead.contract.status === 'pending_legal').length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-800">
                  {leads.filter(lead => lead.contract.status === 'pending_legal').length} {t('sales.contractsPendingLegal')}
                </p>
                <p className="text-sm text-blue-600">{t('sales.contractsPendingLegalDescription')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-leads">{t('sales.myLeads')}</TabsTrigger>
          <TabsTrigger value="activities">{t('sales.activities')}</TabsTrigger>
          <TabsTrigger value="tasks">{t('sales.tasks')}</TabsTrigger>
          <TabsTrigger value="performance">{t('sales.performance')}</TabsTrigger>
        </TabsList>

        {/* My Leads Tab */}
        <TabsContent value="my-leads" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partners">{t('sales.partnersTeam')}</SelectItem>
                  <SelectItem value="b2b">{t('sales.b2bTeam')}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={t('sales.searchLeads')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('sales.newLead')}
            </Button>
          </div>

          <Card className="shadow-2xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.company')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.contact')}</TableHead>
                    <TableHead>{t('sales.location')}</TableHead>
                    <TableHead>{t('sales.status')}</TableHead>
                    <TableHead>{t('sales.priority')}</TableHead>
                    <TableHead>{t('sales.lastActivity')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
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
                          <LocationIcon className="h-3 w-3" />
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
                        <div className="text-sm">
                          {new Date(lead.lastActivityAt).toLocaleDateString()}
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
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              {t('sales.scheduleVisit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              {t('sales.createContract')}
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

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{t('sales.myActivities')}</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('sales.logActivity')}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {t('sales.quickActions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  {t('sales.logCall')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('sales.logVisit')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('sales.logEmail')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('sales.logWhatsApp')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  {t('sales.uploadPhoto')}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('sales.recentActivities')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(lead.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{lead.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('sales.lastActivity')}: {new Date(lead.lastActivityAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {t(`sales.${lead.status}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{t('sales.myTasks')}</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('sales.newTask')}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('sales.todayTasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {todayTasks.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {todayTasks.filter(t => !t.completed).length} {t('sales.pending')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('sales.overdueTasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive mb-2">
                  {overdueTasks.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('sales.requiresAttention')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t('sales.completedThisWeek')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-2">
                  {tasks.filter(t => t.completed && 
                    new Date(t.dueDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('sales.tasksCompleted')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle>{t('sales.allTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.task')}</TableHead>
                    <TableHead>{t('sales.type')}</TableHead>
                    <TableHead>{t('sales.lead')}</TableHead>
                    <TableHead>{t('sales.dueDate')}</TableHead>
                    <TableHead>{t('sales.priority')}</TableHead>
                    <TableHead>{t('sales.status')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.slice(0, 10).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={(checked) => {
                              // Handle task completion
                            }}
                          />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(`sales.${task.type}`)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {leads.find(l => l.id === task.leadId)?.companyName || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {t(`sales.${task.priority}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={task.completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                          {task.completed ? t('sales.completed') : t('sales.pending')}
                        </Badge>
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
                              <Edit className="mr-2 h-4 w-4" />
                              {t('sales.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('sales.markComplete')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('sales.delete')}
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

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{t('sales.myPerformance')}</h2>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('sales.exportReport')}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {t('sales.conversionRate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{repKPIs.conversionRate}%</div>
                <Progress value={repKPIs.conversionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('sales.industryAverage')}: 15%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {t('sales.avgCycleTime')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{repKPIs.avgCycleTime}</div>
                <p className="text-xs text-muted-foreground">
                  {t('sales.daysToClose')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {t('sales.activitiesThisWeek')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{repKPIs.thisWeekActivities}</div>
                <p className="text-xs text-muted-foreground">
                  {t('sales.callsVisitsEmails')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {t('sales.ranking')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">#3</div>
                <p className="text-xs text-muted-foreground">
                  {t('sales.ofTeam')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle>{t('sales.performanceTrends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('sales.performanceChartComingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
