'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageSquare, Calendar, User, AlertTriangle } from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface Communication {
  id: string;
  leadId: string;
  partnerId?: string;
  type: 'call' | 'visit' | 'email' | 'whatsapp';
  subject: string;
  body: string;
  outcome: 'left-msg' | 'no-answer' | 'successful';
  date: string;
  createdBy: string;
  lead?: {
    title: string;
    companyName: string;
  };
  partner?: {
    name: string;
  };
}

export default function CommunicationHistory() {
  const { t } = useLanguage();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productionApi.getCommunications();
      if (response.success) {
        setCommunications(response.communications || []);
      } else {
        setError(response.message || 'Failed to fetch communications');
      }
    } catch (err) {
      setError('Failed to fetch communications');
      console.error('Error fetching communications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'visit': return <User className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-primary';
      case 'visit': return 'bg-success/10 text-success';
      case 'email': return 'bg-info/10 text-info';
      case 'whatsapp': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'successful': return 'bg-success/10 text-success';
      case 'left-msg': return 'bg-warning/10 text-warning';
      case 'no-answer': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeStats = () => {
    return communications.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getOutcomeStats = () => {
    return communications.reduce((acc, comm) => {
      acc[comm.outcome] = (acc[comm.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const typeStats = getTypeStats();
  const outcomeStats = getOutcomeStats();
  const totalCommunications = communications.length;
  const successfulRate = totalCommunications > 0 ? 
    ((outcomeStats.successful || 0) / totalCommunications) * 100 : 0;

  if (loading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication History
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
            <MessageSquare className="h-5 w-5" />
            Communication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCommunications} variant="outline">
              Retry
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
          <MessageSquare className="h-5 w-5" />
          {t('communicationHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Communication Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{totalCommunications}</p>
            <p className="text-sm text-primary">Total Communications</p>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <Phone className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">
              {successfulRate.toFixed(0)}%
            </p>
            <p className="text-sm text-success/80">Success Rate</p>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Recent Communications</h4>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No communications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {communications.slice(0, 5).map((comm) => (
                <div key={comm.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(comm.type)}
                      <span className="font-medium">{comm.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(comm.type)}>
                        {comm.type}
                      </Badge>
                      <Badge className={getOutcomeColor(comm.outcome)}>
                        {comm.outcome}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{comm.body}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(comm.date).toLocaleDateString()}
                      </span>
                      <span>
                        {comm.lead?.title || comm.partner?.name || comm.leadId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communication Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Communication Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">By Type</h5>
              <div className="space-y-1">
                {Object.entries(typeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">By Outcome</h5>
              <div className="space-y-1">
                {Object.entries(outcomeStats).map(([outcome, count]) => (
                  <div key={outcome} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{outcome}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
