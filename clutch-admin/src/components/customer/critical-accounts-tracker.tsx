'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Building,
  Target,
  Activity,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { realApi } from '@/lib/real-api';

interface CriticalAccount {
  id: string;
  name: string;
  company: string;
  industry: string;
  tier: 'enterprise' | 'premium' | 'standard';
  status: 'healthy' | 'warning' | 'at_risk' | 'churned';
  healthScore: number;
  revenue: {
    monthly: number;
    annual: number;
    growth: number;
    potential: number;
  };
  engagement: {
    score: number;
    lastActivity: string;
    supportTickets: number;
    featureUsage: number;
    satisfaction: number;
  };
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    churnProbability: number;
    lastAssessment: string;
  };
  contact: {
    primary: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    secondary?: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    decisionMaker?: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
  };
  contract: {
    startDate: string;
    endDate: string;
    value: number;
    renewalDate: string;
    terms: string;
  };
  lastInteraction: string;
  nextAction: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface CriticalAccountsTrackerProps {
  className?: string;
}

export default function CriticalAccountsTracker({ className }: CriticalAccountsTrackerProps) {
  const [accounts, setAccounts] = useState<CriticalAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CriticalAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCriticalAccountsData = async () => {
      try {
        setIsLoading(true);
        
        // Load critical accounts from API
        const accountsData = await realApi.getCriticalAccounts();
        setAccounts(accountsData || []);
        
        if (accountsData && accountsData.length > 0) {
          setSelectedAccount(accountsData[0]);
        }
      } catch (error) {
        // Error handled by API service
        // Set empty array on error - no mock data fallback
        setAccounts([]);
        setSelectedAccount(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCriticalAccountsData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success/100 text-success-foreground';
      case 'warning': return 'bg-warning/100 text-warning-foreground';
      case 'at_risk': return 'bg-destructive/100 text-destructive-foreground';
      case 'churned': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-muted text-muted-foreground';
      case 'medium': return 'bg-warning/100 text-warning-foreground';
      case 'high': return 'bg-destructive/100 text-destructive-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Accounts Tracker
          </CardTitle>
          <CardDescription>
            Monitoring high-value customer accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading critical accounts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Critical Accounts Tracker
        </CardTitle>
        <CardDescription>
          Monitoring {accounts.length} high-value customer accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No critical accounts found</h3>
            <p className="text-muted-foreground">
              All customer accounts are currently healthy
            </p>
          </div>
        ) : (
          <>
            {/* Account List */}
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAccount?.id === account.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAccount(account)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{account.name}</h3>
                        <Badge className={getStatusColor(account.status)}>
                          {account.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(account.priority)}>
                          {account.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {account.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${account.revenue.annual.toLocaleString()}/year
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {account.healthScore}% health
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {account.risk.churnProbability}% churn risk
                      </div>
                      <div className={`text-sm ${getRiskColor(account.risk.level)}`}>
                        {account.risk.level} risk
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Account Details */}
            {selectedAccount && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Health & Risk */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health Score</span>
                        <span className="text-sm text-muted-foreground">{selectedAccount.healthScore}%</span>
                      </div>
                      <Progress value={selectedAccount.healthScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Churn Risk</span>
                        <span className="text-sm text-muted-foreground">{selectedAccount.risk.churnProbability}%</span>
                      </div>
                      <Progress value={selectedAccount.risk.churnProbability} className="h-2" />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-1">
                        {selectedAccount.risk.factors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-warning" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Primary Contact</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {selectedAccount.contact.primary.name} - {selectedAccount.contact.primary.role}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedAccount.contact.primary.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedAccount.contact.primary.phone}
                        </div>
                      </div>
                    </div>

                    {selectedAccount.contact.decisionMaker && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Decision Maker</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            {selectedAccount.contact.decisionMaker.name} - {selectedAccount.contact.decisionMaker.role}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {selectedAccount.contact.decisionMaker.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue & Contract */}
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Revenue Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly Revenue:</span>
                        <span className="font-medium">${selectedAccount.revenue.monthly.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Revenue:</span>
                        <span className="font-medium">${selectedAccount.revenue.annual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth:</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          selectedAccount.revenue.growth >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {selectedAccount.revenue.growth >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {selectedAccount.revenue.growth}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Contract Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Contract Value:</span>
                        <span className="font-medium">${selectedAccount.contract.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewal Date:</span>
                        <span className="font-medium">
                          {new Date(selectedAccount.contract.renewalDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Action:</span>
                        <span className="font-medium">{selectedAccount.nextAction}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

