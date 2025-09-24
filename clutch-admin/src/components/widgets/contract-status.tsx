'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface Contract {
  id: string;
  leadId: string;
  status: 'draft' | 'printed' | 'signed_uploaded' | 'pending_legal' | 'approved' | 'rejected';
  templateId: string;
  createdAt: string;
  lead?: {
    title: string;
    companyName: string;
  };
}

export default function ContractStatus() {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productionApi.getContracts();
      if (response.success) {
        setContracts(response.contracts || []);
      } else {
        setError(response.message || t('errorFetchingContracts'));
      }
    } catch (err) {
      setError(t('errorFetchingContracts'));
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-foreground';
      case 'printed': return 'bg-blue-100 text-blue-800';
      case 'signed_uploaded': return 'bg-yellow-100 text-yellow-800';
      case 'pending_legal': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'printed': return <FileText className="h-4 w-4" />;
      case 'signed_uploaded': return <Clock className="h-4 w-4" />;
      case 'pending_legal': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusCounts = () => {
    return contracts.reduce((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();
  const totalContracts = contracts.length;
  const pendingLegal = statusCounts.pending_legal || 0;
  const approved = statusCounts.approved || 0;

  if (loading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('contractStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('contractStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchContracts} variant="outline">
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('contractStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{pendingLegal}</p>
            <p className="text-sm text-orange-700">{t('pendingLegal')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{approved}</p>
            <p className="text-sm text-green-700">{t('approved')}</p>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">{t('recentContracts')}</h4>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>{t('noContracts')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.slice(0, 5).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(contract.status)}
                      <div>
                        <p className="font-medium">Contract #{contract.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.lead?.title || contract.leadId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(contract.status)}>
                      {t(contract.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">{t('statusBreakdown')}</h4>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="capitalize">{t(status)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({totalContracts > 0 ? ((count / totalContracts) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
