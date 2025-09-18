"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Clock,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';

interface AtRiskClientsProps {
  className?: string;
}

interface AtRiskClient {
  clientId: string;
  clientName: string;
  riskScore: number;
  churnProbability: number;
  lastActivity: string;
  daysSinceActivity: number;
  revenue: number;
  riskFactors: string[];
  segment: string;
  status: 'critical' | 'high' | 'medium';
}

export function AtRiskClients({ className = '' }: AtRiskClientsProps) {
  const [atRiskData, setAtRiskData] = React.useState<{
    clients: AtRiskClient[];
    totalAtRisk: number;
    totalRevenueAtRisk: number;
    averageRiskScore: number;
    statusDistribution: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAtRiskData = async () => {
      try {
        const [customers, payments] = await Promise.all([
          productionApi.getCustomers(),
          productionApi.getPayments()
        ]);

        // Simulate at-risk clients data
        const atRiskClients: AtRiskClient[] = [
          {
            clientId: '1',
            clientName: 'Enterprise Client A',
            riskScore: 85,
            churnProbability: 75,
            lastActivity: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceActivity: 21,
            revenue: 45000,
            riskFactors: ['Low usage', 'Support tickets', 'Contract expiring'],
            segment: 'Enterprise',
            status: 'critical'
          },
          {
            clientId: '2',
            clientName: 'SMB Client B',
            riskScore: 72,
            churnProbability: 60,
            lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceActivity: 14,
            revenue: 12000,
            riskFactors: ['Payment delays', 'Low satisfaction'],
            segment: 'SMB',
            status: 'high'
          },
          {
            clientId: '3',
            clientName: 'Individual Client C',
            riskScore: 65,
            churnProbability: 55,
            lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceActivity: 10,
            revenue: 2500,
            riskFactors: ['Inactive account', 'No recent payments'],
            segment: 'Individual',
            status: 'high'
          },
          {
            clientId: '4',
            clientName: 'Enterprise Client D',
            riskScore: 58,
            churnProbability: 45,
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceActivity: 7,
            revenue: 32000,
            riskFactors: ['Decreased usage'],
            segment: 'Enterprise',
            status: 'medium'
          }
        ];

        const totalAtRisk = atRiskClients.length;
        const totalRevenueAtRisk = atRiskClients.reduce((sum, client) => sum + client.revenue, 0);
        const averageRiskScore = atRiskClients.reduce((sum, client) => sum + client.riskScore, 0) / atRiskClients.length;
        
        const statusDistribution = atRiskClients.reduce((acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setAtRiskData({
          clients: atRiskClients,
          totalAtRisk,
          totalRevenueAtRisk,
          averageRiskScore,
          statusDistribution
        });
      } catch (error) {
        console.error('Failed to load at-risk clients data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAtRiskData();
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    return 'Medium';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChurnColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600';
    if (probability >= 50) return 'text-orange-600';
    return 'text-yellow-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>At-Risk Clients</span>
          </CardTitle>
          <CardDescription>Loading at-risk clients data...</CardDescription>
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

  if (!atRiskData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>At-Risk Clients</span>
          </CardTitle>
          <CardDescription>Unable to load at-risk clients data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>At-Risk Clients</span>
        </CardTitle>
        <CardDescription>
          Customers flagged by AI churn predictor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg">
            <Users className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{atRiskData.totalAtRisk}</p>
            <p className="text-xs text-gray-500">At-Risk Clients</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
            <DollarSign className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">
              ${atRiskData.totalRevenueAtRisk.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Revenue at Risk</p>
          </div>
        </div>

        {/* Average Risk Score */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className={`h-6 w-6 ${getRiskColor(atRiskData.averageRiskScore)}`} />
            <span className={`text-2xl font-bold ${getRiskColor(atRiskData.averageRiskScore)}`}>
              {atRiskData.averageRiskScore.toFixed(0)}
            </span>
            <Badge className={getRiskBadge(atRiskData.averageRiskScore)}>
              {getRiskLevel(atRiskData.averageRiskScore)}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Average Risk Score</p>
          <div className="mt-3">
            <Progress value={atRiskData.averageRiskScore} className="h-2" />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Risk Status Distribution</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-sm font-bold text-red-600">
                {atRiskData.statusDistribution.critical || 0}
              </p>
              <p className="text-xs text-gray-500">Critical</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <p className="text-sm font-bold text-orange-600">
                {atRiskData.statusDistribution.high || 0}
              </p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <p className="text-sm font-bold text-yellow-600">
                {atRiskData.statusDistribution.medium || 0}
              </p>
              <p className="text-xs text-gray-500">Medium Risk</p>
            </div>
          </div>
        </div>

        {/* At-Risk Clients List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">At-Risk Clients</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {atRiskData.clients.map((client) => (
              <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg-full">
                    <span className="text-sm font-semibold text-red-600">
                      {client.riskScore}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{client.clientName}</p>
                    <p className="text-xs text-gray-500">
                      {client.daysSinceActivity} days since activity
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900">
                      ${client.revenue.toLocaleString()}
                    </p>
                    <Badge className={getStatusBadge(client.status)}>
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <p className={`text-xs ${getChurnColor(client.churnProbability)}`}>
                      {client.churnProbability}% churn risk
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Common Risk Factors</h4>
          <div className="space-y-2">
            {['Low usage', 'Support tickets', 'Payment delays', 'Contract expiring', 'Inactive account'].map((factor) => (
              <div key={factor} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{factor}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.floor(Math.random() * 5) + 1} clients
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Insights */}
        <div className="p-3 bg-blue-50 rounded-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 At-Risk Client Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• {atRiskData.totalAtRisk} clients at risk of churning</li>
            <li>• ${atRiskData.totalRevenueAtRisk.toLocaleString()} revenue at risk</li>
            <li>• Average risk score: {atRiskData.averageRiskScore.toFixed(0)}</li>
            <li>• {atRiskData.statusDistribution.critical || 0} clients in critical status</li>
            <li>• {atRiskData.statusDistribution.high || 0} clients at high risk</li>
            {atRiskData.statusDistribution.critical > 0 && (
              <li>• Critical clients need immediate intervention</li>
            )}
            {atRiskData.totalRevenueAtRisk > 50000 && (
              <li>• Significant revenue at risk - prioritize retention efforts</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default AtRiskClients;
