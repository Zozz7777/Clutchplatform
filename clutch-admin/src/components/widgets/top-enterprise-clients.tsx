"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { businessIntelligence } from '@/lib/business-intelligence';
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
  const [clients, setClients] = React.useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await businessIntelligence.getTopEnterpriseClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to load enterprise clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return Activity;
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) return 'bg-green-100 text-green-800';
    if (growth < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActivityColor = (activity: number) => {
    if (activity >= 80) return 'text-green-600';
    if (activity >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityBadge = (activity: number) => {
    if (activity >= 80) return 'bg-green-100 text-green-800';
    if (activity >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>Top 5 Enterprise Clients</span>
          </CardTitle>
          <CardDescription>Loading client data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span>Top 5 Enterprise Clients</span>
        </CardTitle>
        <CardDescription>
          By revenue contribution & activity level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg-lg">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">
              {averageGrowth.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Avg Growth</p>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {clients.map((client, index) => {
            const GrowthIcon = getGrowthIcon(client.growth);
            const revenuePercentage = totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg-full">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <Badge className={getActivityBadge(client.activity)}>
                        {getActivityLevel(client.activity)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          ${client.revenue.toLocaleString()}
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
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Revenue Share</span>
                        <span>{revenuePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={revenuePercentage} className="h-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Revenue Distribution</h4>
          <div className="space-y-2">
            {clients.map((client, index) => {
              const percentage = totalRevenue > 0 ? (client.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={client.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-lg-full"></div>
                    <span className="text-gray-600">{client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                    <span className="text-gray-900 font-medium">
                      ${client.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Growth Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg-lg">
              <p className="text-lg font-bold text-green-600">
                {clients.filter(c => c.growth > 0).length}
              </p>
              <p className="text-xs text-gray-500">Growing Clients</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <p className="text-lg font-bold text-red-600">
                {clients.filter(c => c.growth < 0).length}
              </p>
              <p className="text-xs text-gray-500">Declining Clients</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            View All Clients
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Client Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Top client contributes {(clients[0]?.revenue / totalRevenue * 100 || 0).toFixed(1)}% of total revenue</li>
            <li>• {clients.filter(c => c.growth > 0).length} out of {clients.length} clients showing positive growth</li>
            <li>• Average client activity level: {clients.reduce((sum, c) => sum + c.activity, 0) / clients.length || 0}%</li>
            <li>• Total enterprise revenue: ${totalRevenue.toLocaleString()}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopEnterpriseClients;
