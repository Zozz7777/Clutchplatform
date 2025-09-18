"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Activity,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Clock,
  Car,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  FileText,
  CreditCard,
  Building,
  Globe
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CriticalAccount {
  id: string;
  name: string;
  company: string;
  industry: string;
  tier: 'enterprise' | 'premium' | 'standard';
  status: 'healthy' | 'at_risk' | 'critical' | 'churned';
  healthScore: number; // 0-100
  revenue: {
    monthly: number;
    annual: number;
    growth: number;
    potential: number;
  };
  engagement: {
    score: number; // 0-100
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
    decisionMaker: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
  };
  contract: {
    startDate: string;
    endDate: string;
    renewalDate: string;
    value: number;
    terms: string;
    autoRenewal: boolean;
  };
  usage: {
    activeUsers: number;
    totalUsers: number;
    apiCalls: number;
    storage: number;
    features: string[];
  };
  support: {
    priority: 'high' | 'medium' | 'low';
    assignedCSM: string;
    lastTouch: string;
    nextReview: string;
    escalationLevel: number;
  };
  opportunities: {
    upsell: number;
    crossSell: number;
    expansion: number;
    total: number;
  };
  alerts: {
    id: string;
    type: 'renewal' | 'churn_risk' | 'usage_drop' | 'support_escalation' | 'contract_expiry';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    createdAt: string;
    status: 'active' | 'acknowledged' | 'resolved';
  }[];
}

interface AccountHealthMetric {
  metric: string;
  current: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  weight: number;
}

interface CriticalAccountsTrackerProps {
  className?: string;
}

export default function CriticalAccountsTracker({ className }: CriticalAccountsTrackerProps) {
  const [accounts, setAccounts] = useState<CriticalAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CriticalAccount | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadCriticalAccountsData = () => {
      const mockAccounts: CriticalAccount[] = [
        {
          id: 'account-001',
          name: 'TechCorp Solutions',
          company: 'TechCorp Solutions Inc.',
          industry: 'Technology',
          tier: 'enterprise',
          status: 'at_risk',
          healthScore: 65,
          revenue: {
            monthly: 45000,
            annual: 540000,
            growth: -5.2,
            potential: 750000
          },
          engagement: {
            score: 72,
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            supportTickets: 8,
            featureUsage: 45,
            satisfaction: 3.2
          },
          risk: {
            level: 'high',
            factors: ['Decreased usage', 'Support escalation', 'Contract renewal approaching'],
            churnProbability: 35,
            lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          contact: {
            primary: {
              name: 'Sarah Johnson',
              email: 'sarah.johnson@techcorp.com',
              phone: '+1-555-0101',
              role: 'CTO'
            },
            secondary: {
              name: 'Mike Chen',
              email: 'mike.chen@techcorp.com',
              phone: '+1-555-0102',
              role: 'IT Director'
            },
            decisionMaker: {
              name: 'David Wilson',
              email: 'david.wilson@techcorp.com',
              phone: '+1-555-0103',
              role: 'CEO'
            }
          },
          contract: {
            startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            value: 540000,
            terms: 'Annual contract with auto-renewal',
            autoRenewal: true
          },
          usage: {
            activeUsers: 45,
            totalUsers: 60,
            apiCalls: 125000,
            storage: 2.5,
            features: ['Analytics', 'API Access', 'Custom Integrations', 'Priority Support']
          },
          support: {
            priority: 'high',
            assignedCSM: 'Jennifer Martinez',
            lastTouch: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            escalationLevel: 2
          },
          opportunities: {
            upsell: 25000,
            crossSell: 15000,
            expansion: 35000,
            total: 75000
          },
          alerts: [
            {
              id: 'alert-001',
              type: 'churn_risk',
              severity: 'high',
              message: 'High churn risk detected - usage decreased by 25%',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            },
            {
              id: 'alert-002',
              type: 'renewal',
              severity: 'medium',
              message: 'Contract renewal due in 30 days',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'acknowledged'
            }
          ]
        },
        {
          id: 'account-002',
          name: 'Global Manufacturing',
          company: 'Global Manufacturing Corp.',
          industry: 'Manufacturing',
          tier: 'enterprise',
          status: 'healthy',
          healthScore: 88,
          revenue: {
            monthly: 75000,
            annual: 900000,
            growth: 12.5,
            potential: 1200000
          },
          engagement: {
            score: 92,
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            supportTickets: 2,
            featureUsage: 78,
            satisfaction: 4.7
          },
          risk: {
            level: 'low',
            factors: ['High engagement', 'Growing usage', 'Positive feedback'],
            churnProbability: 5,
            lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          contact: {
            primary: {
              name: 'Lisa Wang',
              email: 'lisa.wang@globalmfg.com',
              phone: '+1-555-0201',
              role: 'VP Operations'
            },
            decisionMaker: {
              name: 'Robert Kim',
              email: 'robert.kim@globalmfg.com',
              phone: '+1-555-0202',
              role: 'COO'
            }
          },
          contract: {
            startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString(),
            renewalDate: new Date(Date.now() + 155 * 24 * 60 * 60 * 1000).toISOString(),
            value: 900000,
            terms: 'Multi-year contract with expansion options',
            autoRenewal: false
          },
          usage: {
            activeUsers: 120,
            totalUsers: 150,
            apiCalls: 450000,
            storage: 8.2,
            features: ['Analytics', 'API Access', 'Custom Integrations', 'Priority Support', 'Dedicated Infrastructure']
          },
          support: {
            priority: 'medium',
            assignedCSM: 'Alex Thompson',
            lastTouch: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            escalationLevel: 1
          },
          opportunities: {
            upsell: 50000,
            crossSell: 30000,
            expansion: 80000,
            total: 160000
          },
          alerts: [
            {
              id: 'alert-003',
              type: 'upsell',
              severity: 'low',
              message: 'Upsell opportunity identified - additional features requested',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            }
          ]
        },
        {
          id: 'account-003',
          name: 'RetailMax',
          company: 'RetailMax International',
          industry: 'Retail',
          tier: 'premium',
          status: 'critical',
          healthScore: 42,
          revenue: {
            monthly: 25000,
            annual: 300000,
            growth: -18.3,
            potential: 200000
          },
          engagement: {
            score: 38,
            lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            supportTickets: 15,
            featureUsage: 22,
            satisfaction: 2.1
          },
          risk: {
            level: 'critical',
            factors: ['Severe usage decline', 'Multiple support escalations', 'Negative feedback'],
            churnProbability: 78,
            lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          contact: {
            primary: {
              name: 'Maria Rodriguez',
              email: 'maria.rodriguez@retailmax.com',
              phone: '+1-555-0301',
              role: 'IT Manager'
            },
            decisionMaker: {
              name: 'James Anderson',
              email: 'james.anderson@retailmax.com',
              phone: '+1-555-0302',
              role: 'CFO'
            }
          },
          contract: {
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
            renewalDate: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000).toISOString(),
            value: 300000,
            terms: 'Annual contract with performance clauses',
            autoRenewal: false
          },
          usage: {
            activeUsers: 12,
            totalUsers: 25,
            apiCalls: 15000,
            storage: 0.8,
            features: ['Basic Analytics', 'Standard Support']
          },
          support: {
            priority: 'high',
            assignedCSM: 'Michael Davis',
            lastTouch: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            escalationLevel: 3
          },
          opportunities: {
            upsell: 0,
            crossSell: 0,
            expansion: 0,
            total: 0
          },
          alerts: [
            {
              id: 'alert-004',
              type: 'churn_risk',
              severity: 'critical',
              message: 'Critical churn risk - immediate intervention required',
              createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            },
            {
              id: 'alert-005',
              type: 'support_escalation',
              severity: 'high',
              message: 'Support escalation to management level',
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            }
          ]
        }
      ];

      setAccounts(mockAccounts);
      setSelectedAccount(mockAccounts[0]);
    };

    loadCriticalAccountsData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setAccounts(prev => prev.map(account => ({
        ...account,
        healthScore: Math.max(0, Math.min(100, account.healthScore + (Math.random() - 0.5) * 2)),
        engagement: {
          ...account.engagement,
          score: Math.max(0, Math.min(100, account.engagement.score + (Math.random() - 0.5) * 2))
        }
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'churned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'renewal': return <Calendar className="h-4 w-4" />;
      case 'churn_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'usage_drop': return <TrendingDown className="h-4 w-4" />;
      case 'support_escalation': return <MessageSquare className="h-4 w-4" />;
      case 'contract_expiry': return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredAccounts = accounts.filter(account => {
    const tierMatch = filterTier === 'all' || account.tier === filterTier;
    const statusMatch = filterStatus === 'all' || account.status === filterStatus;
    return tierMatch && statusMatch;
  });

  const healthyAccounts = accounts.filter(account => account.status === 'healthy').length;
  const atRiskAccounts = accounts.filter(account => account.status === 'at_risk').length;
  const criticalAccounts = accounts.filter(account => account.status === 'critical').length;
  const totalRevenue = accounts.reduce((sum, account) => sum + account.revenue.annual, 0);
  const avgHealthScore = accounts.length > 0 
    ? Math.round(accounts.reduce((sum, account) => sum + account.healthScore, 0) / accounts.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Critical Accounts Tracker
              </CardTitle>
              <CardDescription>
                Top enterprise clients monitoring and relationship management
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
              >
                {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Monitoring' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Account Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{healthyAccounts}</div>
              <div className="text-sm text-muted-foreground">Healthy Accounts</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{atRiskAccounts}</div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalAccounts}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </div>

          {/* Health Score Overview */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Average Health Score</h4>
                <p className="text-sm text-muted-foreground">
                  Overall account health across all critical accounts
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getHealthScoreColor(avgHealthScore)}`}>
                  {avgHealthScore}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={avgHealthScore} className="h-2" />
            </div>
          </div>

          {/* Critical Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Critical Accounts</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Tier:</span>
                {['all', 'enterprise', 'premium', 'standard'].map((tier) => (
                  <Button
                    key={tier}
                    variant={filterTier === tier ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTier(tier)}
                  >
                    {tier}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'healthy', 'at_risk', 'critical', 'churned'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAccount?.id === account.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAccount(account)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.company} • {account.industry}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierColor(account.tier)}>
                        {account.tier}
                      </Badge>
                      <Badge className={getStatusColor(account.status)}>
                        {account.status.replace('_', ' ')}
                      </Badge>
                      <div className={`text-sm font-medium ${getHealthScoreColor(account.healthScore)}`}>
                        {account.healthScore}% health
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Revenue: {formatCurrency(account.revenue.annual)}/year</span>
                    <span>CSM: {account.support.assignedCSM}</span>
                    <span>Churn Risk: {account.risk.churnProbability}%</span>
                    <span>Alerts: {account.alerts.filter(alert => alert.status === 'active').length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Account Details */}
          {selectedAccount && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Account Details - {selectedAccount.name}</h4>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Account Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Company:</span>
                          <span className="font-medium">{selectedAccount.company}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Industry:</span>
                          <span className="font-medium">{selectedAccount.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tier:</span>
                          <Badge className={getTierColor(selectedAccount.tier)}>
                            {selectedAccount.tier}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedAccount.status)}>
                            {selectedAccount.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Health Score:</span>
                          <span className={`font-medium ${getHealthScoreColor(selectedAccount.healthScore)}`}>
                            {selectedAccount.healthScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Revenue Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.revenue.monthly)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.revenue.annual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth:</span>
                          <span className={`font-medium ${selectedAccount.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAccount.revenue.growth > 0 ? '+' : ''}{selectedAccount.revenue.growth}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Potential:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.revenue.potential)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Primary Contact</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedAccount.contact.primary.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="font-medium">{selectedAccount.contact.primary.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedAccount.contact.primary.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-medium">{selectedAccount.contact.primary.phone}</span>
                        </div>
                      </div>
                      {selectedAccount.contact.secondary && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Secondary:</span>
                            <span className="font-medium">{selectedAccount.contact.secondary.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Role:</span>
                            <span className="font-medium">{selectedAccount.contact.secondary.role}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="font-medium">{selectedAccount.contact.secondary.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phone:</span>
                            <span className="font-medium">{selectedAccount.contact.secondary.phone}</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Decision Maker:</span>
                          <span className="font-medium">{selectedAccount.contact.decisionMaker.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="font-medium">{selectedAccount.contact.decisionMaker.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedAccount.contact.decisionMaker.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-medium">{selectedAccount.contact.decisionMaker.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Engagement Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Engagement Score:</span>
                          <span className="font-medium">{selectedAccount.engagement.score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Activity:</span>
                          <span className="font-medium">{new Date(selectedAccount.engagement.lastActivity).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Support Tickets:</span>
                          <span className="font-medium">{selectedAccount.engagement.supportTickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Feature Usage:</span>
                          <span className="font-medium">{selectedAccount.engagement.featureUsage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span className="font-medium">{selectedAccount.engagement.satisfaction}/5</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Usage Statistics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Active Users:</span>
                          <span className="font-medium">{selectedAccount.usage.activeUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <span className="font-medium">{selectedAccount.usage.totalUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Calls:</span>
                          <span className="font-medium">{formatNumber(selectedAccount.usage.apiCalls)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span className="font-medium">{selectedAccount.usage.storage} GB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Features Used</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccount.usage.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Risk Assessment</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge className={getRiskColor(selectedAccount.risk.level)}>
                          {selectedAccount.risk.level}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Churn Probability:</span>
                        <span className="font-medium">{selectedAccount.risk.churnProbability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Assessment:</span>
                        <span className="font-medium">{new Date(selectedAccount.risk.lastAssessment).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Risk Factors</h5>
                    <div className="space-y-1">
                      {selectedAccount.risk.factors.map((factor, index) => (
                        <div key={index} className="p-2 border rounded-lg text-sm">
                          • {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="opportunities" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Revenue Opportunities</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Upsell:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.opportunities.upsell)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cross-sell:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.opportunities.crossSell)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expansion:</span>
                          <span className="font-medium">{formatCurrency(selectedAccount.opportunities.expansion)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Opportunity:</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedAccount.opportunities.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Active Alerts</h5>
                    <div className="space-y-2">
                      {selectedAccount.alerts.map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getAlertTypeIcon(alert.type)}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getAlertSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact CSM
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Alerts
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
