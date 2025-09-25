'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users, 
  Building2,
  Store,
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Award,
  Zap,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Handshake,
  Shield,
  CreditCard,
  Car,
  Truck,
  Wrench,
  Package
} from 'lucide-react';
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

interface ExecutiveKPIs {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  totalPartners: number;
  activePartners: number;
  newPartnersThisMonth: number;
  partnerGrowth: number;
  totalEnterprise: number;
  activeEnterprise: number;
  newEnterpriseThisMonth: number;
  enterpriseGrowth: number;
  conversionRate: number;
  avgDealSize: number;
  salesCycle: number;
  marketShare: number;
  customerSatisfaction: number;
  churnRate: number;
  ltv: number;
  cac: number;
  roi: number;
}

interface MarketData {
  region: string;
  partners: number;
  revenue: number;
  growth: number;
  marketShare: number;
}

interface TeamPerformance {
  team: string;
  members: number;
  leads: number;
  deals: number;
  revenue: number;
  conversionRate: number;
  avgDealSize: number;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

interface ForecastData {
  period: string;
  actual: number;
  forecast: number;
  target: number;
  probability: number;
}

export default function ExecutiveDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [kpis, setKpis] = useState<ExecutiveKPIs>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    totalPartners: 0,
    activePartners: 0,
    newPartnersThisMonth: 0,
    partnerGrowth: 0,
    totalEnterprise: 0,
    activeEnterprise: 0,
    newEnterpriseThisMonth: 0,
    enterpriseGrowth: 0,
    conversionRate: 0,
    avgDealSize: 0,
    salesCycle: 0,
    marketShare: 0,
    customerSatisfaction: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0,
    roi: 0
  });

  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);

  useEffect(() => {
    loadExecutiveData();
  }, [timeframe]);

  const loadExecutiveData = async () => {
    try {
      setIsLoading(true);
      
      // Load executive KPIs
      const kpisResponse = await productionApi.getSalesReports('executive');
      if (kpisResponse.success) {
        setKpis(kpisResponse.data.kpis || kpis);
      }

      // Load market data
      const marketResponse = await productionApi.getSalesReports('market');
      if (marketResponse.success) {
        setMarketData(marketResponse.data.marketData || []);
      }

      // Load team performance
      const teamResponse = await productionApi.getTeamPerformance();
      if (teamResponse.success) {
        setTeamPerformance(teamResponse.metrics || []);
      }

      // Load forecast data
      const forecastResponse = await productionApi.getSalesReports('forecast');
      if (forecastResponse.success) {
        setForecastData(forecastResponse.data.forecastData || []);
      }

      toast.success(t('sales.executiveDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadExecutiveData'));
    } finally {
      setIsLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-success" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    }
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-success';
    if (growth < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-success/10 text-success';
      case 'good': return 'bg-primary/10 text-primary';
      case 'average': return 'bg-warning/10 text-warning';
      case 'needs_improvement': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-foreground';
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
      {/* Executive Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            {t('sales.executiveDashboard')}
          </h1>
          <p className="text-muted-foreground font-sans">
            {t('sales.executiveDashboardDescription')}
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

      {/* Key Business Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              EGP {(kpis.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center space-x-1">
              {getGrowthIcon(kpis.revenueGrowth)}
              <p className={`text-xs ${getGrowthColor(kpis.revenueGrowth)}`}>
                {kpis.revenueGrowth > 0 ? '+' : ''}{kpis.revenueGrowth}% {t('sales.fromLastPeriod')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.activePartners')}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis.activePartners}</div>
            <div className="flex items-center space-x-1">
              {getGrowthIcon(kpis.partnerGrowth)}
              <p className={`text-xs ${getGrowthColor(kpis.partnerGrowth)}`}>
                {kpis.partnerGrowth > 0 ? '+' : ''}{kpis.partnerGrowth}% {t('sales.growth')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.activeEnterprise')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis.activeEnterprise}</div>
            <div className="flex items-center space-x-1">
              {getGrowthIcon(kpis.enterpriseGrowth)}
              <p className={`text-xs ${getGrowthColor(kpis.enterpriseGrowth)}`}>
                {kpis.enterpriseGrowth > 0 ? '+' : ''}{kpis.enterpriseGrowth}% {t('sales.growth')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.marketShare')}
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis.marketShare}%</div>
            <Progress value={kpis.marketShare} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('sales.ofTotalMarket')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.conversionRate')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis.conversionRate}%</div>
            <Progress value={kpis.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {t('sales.industryBenchmark')}: 15%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.avgDealSize')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              EGP {(kpis.avgDealSize / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sales.perDeal')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.customerLTV')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              EGP {(kpis.ltv / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sales.lifetimeValue')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              {t('sales.roi')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{kpis.roi}%</div>
            <p className="text-xs text-muted-foreground">
              {t('sales.returnOnInvestment')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('sales.overview')}</TabsTrigger>
          <TabsTrigger value="market">{t('sales.marketAnalysis')}</TabsTrigger>
          <TabsTrigger value="teams">{t('sales.teamPerformance')}</TabsTrigger>
          <TabsTrigger value="forecast">{t('sales.forecasting')}</TabsTrigger>
          <TabsTrigger value="strategy">{t('sales.strategy')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('sales.revenueBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{t('sales.partnersRevenue')}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">EGP {(kpis.monthlyRevenue * 0.7 / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">70%</p>
                    </div>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{t('sales.enterpriseRevenue')}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">EGP {(kpis.monthlyRevenue * 0.3 / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">30%</p>
                    </div>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('sales.businessHealth')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.customerSatisfaction')}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={kpis.customerSatisfaction} className="w-20 h-2" />
                      <span className="text-sm font-bold">{kpis.customerSatisfaction}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.churnRate')}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={kpis.churnRate} className="w-20 h-2" />
                      <span className="text-sm font-bold">{kpis.churnRate}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.salesCycle')}</span>
                    <span className="text-sm font-bold">{kpis.salesCycle} {t('sales.days')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.customerAcquisitionCost')}</span>
                    <span className="text-sm font-bold">EGP {(kpis.cac / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('sales.regionalPerformance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-muted-foreground">
                          {region.partners} {t('sales.partners')} • {region.marketShare}% {t('sales.marketShare')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">EGP {(region.revenue / 1000000).toFixed(1)}M</p>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(region.growth)}
                          <span className={`text-xs ${getGrowthColor(region.growth)}`}>
                            {region.growth > 0 ? '+' : ''}{region.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {t('sales.marketShare')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-foreground mb-2">{kpis.marketShare}%</div>
                  <p className="text-muted-foreground">{t('sales.ofTotalMarket')}</p>
                  <div className="mt-4">
                    <Progress value={kpis.marketShare} className="h-3" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('sales.targetMarketShare')}: 25%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="teams" className="space-y-6">
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('sales.teamPerformance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {team.team === 'partners' ? (
                          <Store className="h-6 w-6 text-primary" />
                        ) : (
                          <Building2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{t(`sales.${team.team}Team`)}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.members} {t('sales.members')} • {team.leads} {t('sales.leads')} • {team.deals} {t('sales.deals')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">EGP {(team.revenue / 1000000).toFixed(1)}M</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPerformanceColor(team.performance)}>
                          {t(`sales.${team.performance}`)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {team.conversionRate}% {t('sales.conversion')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('sales.revenueForecast')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{forecast.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('sales.actual')}: EGP {(forecast.actual / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">EGP {(forecast.forecast / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">
                          {forecast.probability}% {t('sales.probability')}
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
                  <Target className="h-5 w-5" />
                  {t('sales.targetsVsActual')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.quarterlyTarget')}</span>
                    <span className="font-bold">EGP {(kpis.quarterlyRevenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('sales.quarterlyActual')}</span>
                    <span className="font-bold">EGP {(kpis.quarterlyRevenue * 0.85 / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={85} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    85% {t('sales.ofTarget')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('sales.strategicInitiatives')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">{t('sales.expandToNewCities')}</p>
                    <p className="text-sm text-blue-600">{t('sales.expandToNewCitiesDescription')}</p>
                    <div className="mt-2">
                      <Progress value={60} className="h-2" />
                      <p className="text-xs text-blue-600 mt-1">60% {t('sales.complete')}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <p className="font-medium text-success">{t('sales.enterpriseExpansion')}</p>
                    <p className="text-sm text-success">{t('sales.enterpriseExpansionDescription')}</p>
                    <div className="mt-2">
                      <Progress value={40} className="h-2" />
                      <p className="text-xs text-success mt-1">40% {t('sales.complete')}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-medium text-purple-800">{t('sales.digitalTransformation')}</p>
                    <p className="text-sm text-purple-600">{t('sales.digitalTransformationDescription')}</p>
                    <div className="mt-2">
                      <Progress value={25} className="h-2" />
                      <p className="text-xs text-purple-600 mt-1">25% {t('sales.complete')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('sales.riskAssessment')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                    <p className="font-medium text-warning">{t('sales.marketCompetition')}</p>
                    <p className="text-sm text-warning/80">{t('sales.marketCompetitionDescription')}</p>
                    <Badge className="bg-yellow-100 text-warning mt-2">Medium Risk</Badge>
                  </div>
                  
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="font-medium text-destructive">{t('sales.economicFactors')}</p>
                    <p className="text-sm text-destructive/80">{t('sales.economicFactorsDescription')}</p>
                    <Badge className="bg-red-100 text-destructive mt-2">High Risk</Badge>
                  </div>
                  
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <p className="font-medium text-success">{t('sales.technologyAdoption')}</p>
                    <p className="text-sm text-success">{t('sales.technologyAdoptionDescription')}</p>
                    <Badge className="bg-green-100 text-success mt-2">Low Risk</Badge>
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
