"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
// // import { useTranslations } from 'next-intl';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Calendar,
  Eye,
  Mail,
  Phone
} from 'lucide-react';

interface TopEnterpriseClientsProps {
  className?: string;
}

interface ClientData {
  id: string;
  name: string;
  revenue: number;
  activity: number;
  growth: number;
}

export function TopEnterpriseClients({ className = '' }: TopEnterpriseClientsProps) {
  const t = (key: string, params?: any) => key;
  const [clients, setClients] = React.useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await businessIntelligence.getTopEnterpriseClients();
        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        // Failed to load enterprise clients
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-success';
    if (growth < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return Activity;
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) return 'bg-success/10 text-success';
    if (growth < 0) return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  const getActivityColor = (activity: number) => {
    if (activity >= 80) return 'text-success';
    if (activity >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getActivityBadge = (activity: number) => {
    if (activity >= 80) return 'bg-success/10 text-success';
    if (activity >= 60) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  const getActivityLevel = (activity: number) => {
    if (activity >= 80) return 'High';
    if (activity >= 60) return 'Medium';
    return 'Low';
  };

  const totalRevenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const averageGrowth = clients.length > 0 ? clients.reduce((sum, client) => sum + client.growth, 0) / clients.length : 0;

  if (isLoading) {
    return (
      <Card className={`${className} shadow-2xs`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{t('dashboard.top5EnterpriseClients')}</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Loading client data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded-[0.625rem] w-3/4"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-1/2"></div>
            <div className="h-4 bg-muted rounded-[0.625rem] w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-2xs`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground font-medium">
          <Building2 className="h-5 w-5 text-primary" />
          <span>{t('dashboard.top5EnterpriseClients')}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          By revenue contribution & activity level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
            <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">
              {totalRevenue.toLocaleString()} EGP
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">
              {averageGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Growth</p>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {clients.map((client, index) => {
            const GrowthIcon = getGrowthIcon(client.growth);
            const revenuePercentage = totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={client.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-[0.625rem] border border-border">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-card-foreground">{client.name}</p>
                      <Badge className={getActivityBadge(client.activity)}>
                        {getActivityLevel(client.activity)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {client.revenue.toLocaleString()} EGP
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GrowthIcon className={`h-3 w-3 ${getGrowthColor(client.growth)}`} />
                        <span className={`text-xs ${getGrowthColor(client.growth)}`}>
                          {client.growth > 0 ? '+' : ''}{client.growth.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Revenue Share</span>
                        <span>{revenuePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={revenuePercentage} className="h-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted focus:ring-2 focus:ring-ring">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Revenue Distribution</h4>
          <div className="space-y-2">
            {clients.map((client, index) => {
              const percentage = totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={client.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">{client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                    <span className="text-card-foreground font-medium">
                      {client.revenue.toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Growth Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem] border border-success/20">
              <p className="text-lg font-bold text-success">
                {clients.filter(c => c.growth > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Growing Clients</p>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem] border border-destructive/20">
              <p className="text-lg font-bold text-destructive">
                {clients.filter(c => c.growth < 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Declining Clients</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 hover:bg-muted focus:ring-2 focus:ring-ring">
            <Users className="h-4 w-4 mr-2" />
            View All Clients
          </Button>
          <Button variant="outline" size="sm" className="flex-1 hover:bg-muted focus:ring-2 focus:ring-ring">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-[0.625rem] border border-primary/20">
          <h5 className="text-sm font-medium text-primary mb-2">💡 Client Insights</h5>
          <ul className="text-xs text-primary/80 space-y-1">
            <li>• Top client contributes {(clients[0]?.revenue / totalRevenue * 100 || 0).toFixed(1)}% of total revenue</li>
            <li>• {clients.filter(c => c.growth > 0).length} out of {clients.length} clients showing positive growth</li>
            <li>• Average client activity level: {clients.reduce((sum, c) => sum + c.activity, 0) / clients.length || 0}%</li>
            <li>• Total enterprise revenue: {totalRevenue.toLocaleString()} EGP</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopEnterpriseClients;




