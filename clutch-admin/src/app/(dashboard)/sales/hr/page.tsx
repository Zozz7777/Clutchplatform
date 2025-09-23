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
  TrendingDown,
  Target,
  BarChart3,
  Award,
  Star,
  Clock,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Handshake
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

interface SalesRep {
  id: string;
  name: string;
  email: string;
  team: 'partners' | 'b2b';
  role: 'sales_rep' | 'sales_manager';
  territory: string;
  joinDate: string;
  performance: {
    totalLeads: number;
    qualifiedLeads: number;
    dealsClosed: number;
    revenue: number;
    conversionRate: number;
    avgDealSize: number;
    activitiesThisMonth: number;
    targetAchievement: number;
    ranking: number;
    lastActivity: string;
  };
  training: {
    completed: number;
    pending: number;
    certifications: string[];
  };
  satisfaction: {
    score: number;
    feedback: string;
  };
}

interface TeamPerformance {
  team: string;
  members: number;
  avgPerformance: number;
  totalRevenue: number;
  conversionRate: number;
  satisfaction: number;
  turnover: number;
}

export default function HRPerformanceView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('individual');
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);

  useEffect(() => {
    loadHRData();
  }, [timeframe]);

  const loadHRData = async () => {
    try {
      setIsLoading(true);
      
      // Load sales team performance data
      const repsResponse = await productionApi.getTeamPerformance();
      if (repsResponse.success) {
        setSalesReps(repsResponse.metrics || []);
      }

      // Load team performance data
      const teamResponse = await productionApi.getSalesReports('team');
      if (teamResponse.success) {
        setTeamPerformance(teamResponse.data.teamPerformance || []);
      }

      toast.success(t('sales.hrDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadHRData'));
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-100 text-green-800';
    if (performance >= 70) return 'bg-blue-100 text-blue-800';
    if (performance >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (performance: number) => {
    if (performance >= 90) return t('sales.excellent');
    if (performance >= 70) return t('sales.good');
    if (performance >= 50) return t('sales.average');
    return t('sales.needs_improvement');
  };

  const getRankingIcon = (ranking: number) => {
    if (ranking === 1) return <Award className="h-4 w-4 text-yellow-500" />;
    if (ranking === 2) return <Award className="h-4 w-4 text-gray-400" />;
    if (ranking === 3) return <Award className="h-4 w-4 text-orange-500" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
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
      {/* HR Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.hrPerformanceView')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.hrPerformanceDescription')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{t('sales.weekly')}</SelectItem>
              <SelectItem value="monthly">{t('sales.monthly')}</SelectItem>
              <SelectItem value="quarterly">{t('sales.quarterly')}</SelectItem>
              <SelectItem value="yearly">{t('sales.yearly')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="shadow-2xs">
            <Download className="mr-2 h-4 w-4" />
            {t('sales.exportReport')}
          </Button>
        </div>
      </div>

      {/* Team Overview KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.totalSalesTeam')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {salesReps.length}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2</span> {t('sales.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.avgPerformance')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {salesReps.length > 0 ? Math.round(salesReps.reduce((sum, rep) => sum + rep.performance.targetAchievement, 0) / salesReps.length) : 0}%
            </div>
            <Progress 
              value={salesReps.length > 0 ? salesReps.reduce((sum, rep) => sum + rep.performance.targetAchievement, 0) / salesReps.length : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.teamSatisfaction')}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {salesReps.length > 0 ? Math.round(salesReps.reduce((sum, rep) => sum + rep.satisfaction.score, 0) / salesReps.length) : 0}/10
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sales.employeeSatisfaction')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.turnoverRate')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {teamPerformance.length > 0 ? Math.round(teamPerformance.reduce((sum, team) => sum + team.turnover, 0) / teamPerformance.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sales.annualTurnover')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual">{t('sales.individualPerformance')}</TabsTrigger>
          <TabsTrigger value="teams">{t('sales.teamPerformance')}</TabsTrigger>
          <TabsTrigger value="training">{t('sales.training')}</TabsTrigger>
          <TabsTrigger value="insights">{t('sales.insights')}</TabsTrigger>
        </TabsList>

        {/* Individual Performance Tab */}
        <TabsContent value="individual" className="space-y-6">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('sales.salesTeamPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.ranking')}</TableHead>
                    <TableHead>{t('sales.name')}</TableHead>
                    <TableHead>{t('sales.team')}</TableHead>
                    <TableHead>{t('sales.territory')}</TableHead>
                    <TableHead>{t('sales.performance')}</TableHead>
                    <TableHead>{t('sales.revenue')}</TableHead>
                    <TableHead>{t('sales.conversionRate')}</TableHead>
                    <TableHead>{t('sales.satisfaction')}</TableHead>
                    <TableHead>{t('sales.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesReps
                    .sort((a, b) => a.performance.ranking - b.performance.ranking)
                    .map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankingIcon(rep.performance.ranking)}
                          <span className="font-bold">#{rep.performance.ranking}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rep.name}</p>
                          <p className="text-sm text-muted-foreground">{rep.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(`sales.${rep.team}Team`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{rep.territory}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rep.performance.targetAchievement} className="w-20 h-2" />
                          <span className="text-sm font-medium">{rep.performance.targetAchievement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          EGP {(rep.performance.revenue / 1000).toFixed(0)}K
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{rep.performance.conversionRate}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{rep.satisfaction.score}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {teamPerformance.map((team, index) => (
              <Card key={index} className="shadow-2xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t(`sales.${team.team}Team`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('sales.members')}</p>
                        <p className="text-2xl font-bold">{team.members}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('sales.avgPerformance')}</p>
                        <p className="text-2xl font-bold">{team.avgPerformance}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('sales.totalRevenue')}</span>
                        <span className="font-medium">EGP {(team.totalRevenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('sales.conversionRate')}</span>
                        <span className="font-medium">{team.conversionRate}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('sales.satisfaction')}</span>
                        <span className="font-medium">{team.satisfaction}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('sales.turnover')}</span>
                        <span className="font-medium">{team.turnover}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {t('sales.trainingProgress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesReps.map((rep) => (
                    <div key={rep.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rep.training.completed}/{rep.training.completed + rep.training.pending} {t('sales.completed')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Progress 
                          value={(rep.training.completed / (rep.training.completed + rep.training.pending)) * 100} 
                          className="w-20 h-2" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((rep.training.completed / (rep.training.completed + rep.training.pending)) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t('sales.certifications')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800">{t('sales.salesFundamentals')}</p>
                    <p className="text-sm text-green-600">
                      {salesReps.filter(rep => rep.training.certifications.includes('sales_fundamentals')).length} {t('sales.certified')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">{t('sales.crmTraining')}</p>
                    <p className="text-sm text-blue-600">
                      {salesReps.filter(rep => rep.training.certifications.includes('crm_training')).length} {t('sales.certified')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-medium text-purple-800">{t('sales.negotiationSkills')}</p>
                    <p className="text-sm text-purple-600">
                      {salesReps.filter(rep => rep.training.certifications.includes('negotiation')).length} {t('sales.certified')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('sales.performanceAlerts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesReps
                    .filter(rep => rep.performance.targetAchievement < 70)
                    .map((rep) => (
                    <div key={rep.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800">{rep.name}</p>
                      <p className="text-sm text-red-600">
                        {t('sales.performanceBelowTarget')}: {rep.performance.targetAchievement}%
                      </p>
                    </div>
                  ))}
                  
                  {salesReps
                    .filter(rep => rep.satisfaction.score < 6)
                    .map((rep) => (
                    <div key={rep.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-yellow-800">{rep.name}</p>
                      <p className="text-sm text-yellow-600">
                        {t('sales.lowSatisfaction')}: {rep.satisfaction.score}/10
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('sales.recommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">{t('sales.trainingRecommendation')}</p>
                    <p className="text-sm text-blue-600">
                      {t('sales.trainingRecommendationDescription')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800">{t('sales.recognitionProgram')}</p>
                    <p className="text-sm text-green-600">
                      {t('sales.recognitionProgramDescription')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-medium text-purple-800">{t('sales.territoryOptimization')}</p>
                    <p className="text-sm text-purple-600">
                      {t('sales.territoryOptimizationDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
