"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { productionApi } from '@/lib/production-api';
import { 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Download,
  Eye,
  Target,
  Activity,
  BarChart3,
  Calendar,
  User
} from 'lucide-react';

interface OverdueInvoicesProps {
  className?: string;
}

interface OverdueInvoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'overdue' | 'partial' | 'disputed';
  lastContact: string;
}

export function OverdueInvoices({ className = '' }: OverdueInvoicesProps) {
  const [overdueData, setOverdueData] = React.useState<{
    invoices: OverdueInvoice[];
    totalOverdue: number;
    count: number;
    averageDaysOverdue: number;
    riskDistribution: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOverdueData = async () => {
      try {
        const payments = await productionApi.getPayments();
        
        // Simulate overdue invoices based on payment data
        const overdueInvoices: OverdueInvoice[] = [
          {
            id: '1',
            clientName: 'Enterprise Client A',
            amount: 25000,
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 15,
            riskLevel: 'medium',
            status: 'overdue',
            lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            clientName: 'SMB Client B',
            amount: 8500,
            dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 30,
            riskLevel: 'high',
            status: 'overdue',
            lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            clientName: 'Individual Client C',
            amount: 1200,
            dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 45,
            riskLevel: 'critical',
            status: 'disputed',
            lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            clientName: 'Enterprise Client D',
            amount: 18000,
            dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 7,
            riskLevel: 'low',
            status: 'overdue',
            lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            clientName: 'SMB Client E',
            amount: 5500,
            dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            daysOverdue: 20,
            riskLevel: 'medium',
            status: 'partial',
            lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const averageDaysOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.daysOverdue, 0) / overdueInvoices.length;
        
        const riskDistribution = overdueInvoices.reduce((acc, invoice) => {
          acc[invoice.riskLevel] = (acc[invoice.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setOverdueData({
          invoices: overdueInvoices,
          totalOverdue,
          count: overdueInvoices.length,
          averageDaysOverdue,
          riskDistribution
        });
      } catch (error) {
        console.error('Failed to load overdue invoices data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOverdueData();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600';
      case 'partial': return 'text-yellow-600';
      case 'disputed': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysOverdueColor = (days: number) => {
    if (days <= 7) return 'text-green-600';
    if (days <= 30) return 'text-yellow-600';
    if (days <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Overdue Invoices</span>
          </CardTitle>
          <CardDescription>Loading overdue invoices data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded-lg-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg-lg w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!overdueData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Overdue Invoices</span>
          </CardTitle>
          <CardDescription>Unable to load overdue invoices data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Overdue Invoices</span>
        </CardTitle>
        <CardDescription>
          Count, total, and risk rating
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg-lg-lg">
            <DollarSign className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">
              ${overdueData.totalOverdue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total Overdue</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg-lg-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{overdueData.count}</p>
            <p className="text-xs text-gray-500">Overdue Count</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Risk Distribution</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-green-50 rounded-lg-lg">
              <p className="text-sm font-bold text-green-600">
                {overdueData.riskDistribution.low || 0}
              </p>
              <p className="text-xs text-gray-500">Low Risk</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg-lg">
              <p className="text-sm font-bold text-yellow-600">
                {overdueData.riskDistribution.medium || 0}
              </p>
              <p className="text-xs text-gray-500">Medium Risk</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg-lg">
              <p className="text-sm font-bold text-orange-600">
                {overdueData.riskDistribution.high || 0}
              </p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg-lg">
              <p className="text-sm font-bold text-red-600">
                {overdueData.riskDistribution.critical || 0}
              </p>
              <p className="text-xs text-gray-500">Critical Risk</p>
            </div>
          </div>
        </div>

        {/* Overdue Invoices List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Overdue Invoices</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {overdueData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg-lg-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg-lg-full">
                    <span className="text-sm font-semibold text-red-600">
                      {invoice.daysOverdue}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invoice.clientName}</p>
                    <p className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900">
                      ${invoice.amount.toLocaleString()}
                    </p>
                    <Badge className={getRiskBadge(invoice.riskLevel)}>
                      {invoice.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className={getStatusBadge(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <span className={`text-xs ${getDaysOverdueColor(invoice.daysOverdue)}`}>
                      {invoice.daysOverdue} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Days Overdue */}
        <div className="text-center p-4 bg-gray-50 rounded-lg-lg-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-6 w-6 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">
              {overdueData.averageDaysOverdue.toFixed(0)}
            </span>
            <Badge className="bg-orange-100 text-orange-800">
              Days
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Average Days Overdue</p>
          <div className="mt-3">
            <Progress value={Math.min((overdueData.averageDaysOverdue / 60) * 100, 100)} className="h-2" />
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
        <div className="p-3 bg-blue-50 rounded-lg-lg-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Overdue Invoice Insights</h5>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Total overdue amount: ${overdueData.totalOverdue.toLocaleString()}</li>
            <li>• {overdueData.count} overdue invoices</li>
            <li>• Average days overdue: {overdueData.averageDaysOverdue.toFixed(0)} days</li>
            <li>• {overdueData.riskDistribution.critical || 0} critical risk invoices</li>
            <li>• {overdueData.riskDistribution.high || 0} high risk invoices</li>
            {overdueData.riskDistribution.critical > 0 && (
              <li>• Critical risk invoices need immediate attention</li>
            )}
            {overdueData.averageDaysOverdue > 30 && (
              <li>• High average overdue - consider payment terms review</li>
            )}
            {overdueData.totalOverdue > 50000 && (
              <li>• Significant overdue amount - cash flow impact</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default OverdueInvoices;
