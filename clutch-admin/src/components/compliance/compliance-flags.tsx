"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  User,
  Database,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ComplianceFlag {
  id: string;
  title: string;
  description: string;
  category: 'kyc' | 'gdpr' | 'pci' | 'sox' | 'hipaa' | 'iso27001';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  regulation: string;
  requirement: string;
  affectedData: {
    type: string;
    volume: number;
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  risk: {
    financial: number;
    reputational: number;
    operational: number;
    legal: number;
  };
  detectedAt: string;
  dueDate: string;
  assignee: {
    id: string;
    name: string;
    role: string;
  };
  actions: {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    dueDate: string;
    assignee: string;
  }[];
  evidence: {
    id: string;
    type: 'document' | 'screenshot' | 'log' | 'test_result';
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  auditTrail: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }[];
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  score: number;
  lastAssessment: string;
  nextAssessment: string;
  requirements: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
}

interface ComplianceFlagsProps {
  className?: string;
}

export default function ComplianceFlags({ className }: ComplianceFlagsProps) {
  const [flags, setFlags] = useState<ComplianceFlag[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<ComplianceFlag | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadComplianceData = () => {
      const mockFlags: ComplianceFlag[] = [
        {
          id: 'FLAG-001',
          title: 'GDPR Data Retention Violation',
          description: 'Customer data retained beyond the 7-year limit specified in GDPR Article 5(1)(e)',
          category: 'gdpr',
          severity: 'critical',
          status: 'open',
          regulation: 'GDPR',
          requirement: 'Article 5(1)(e) - Data Minimization',
          affectedData: {
            type: 'Personal Identifiable Information',
            volume: 15420,
            sensitivity: 'confidential'
          },
          risk: {
            financial: 85,
            reputational: 90,
            operational: 60,
            legal: 95
          },
          detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: {
            id: 'user-001',
            name: 'Sarah Chen',
            role: 'Data Protection Officer'
          },
          actions: [
            {
              id: 'act-001',
              description: 'Audit all customer data retention policies',
              status: 'in_progress',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: 'Data Team'
            },
            {
              id: 'act-002',
              description: 'Implement automated data deletion process',
              status: 'pending',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: 'Engineering Team'
            }
          ],
          evidence: [
            {
              id: 'ev-001',
              type: 'document',
              name: 'Data Retention Policy Review',
              url: '/documents/retention-policy.pdf',
              uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          auditTrail: [
            {
              id: 'audit-001',
              action: 'Flag Created',
              user: 'Compliance System',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Automated scan detected data retention violation'
            },
            {
              id: 'audit-002',
              action: 'Assigned',
              user: 'Compliance Manager',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Assigned to Data Protection Officer'
            }
          ]
        },
        {
          id: 'FLAG-002',
          title: 'KYC Documentation Incomplete',
          description: 'Missing identity verification documents for 23 high-risk customers',
          category: 'kyc',
          severity: 'high',
          status: 'investigating',
          regulation: 'AML/KYC',
          requirement: 'Customer Due Diligence (CDD)',
          affectedData: {
            type: 'Customer Identity Documents',
            volume: 23,
            sensitivity: 'restricted'
          },
          risk: {
            financial: 75,
            reputational: 60,
            operational: 80,
            legal: 85
          },
          detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: {
            id: 'user-002',
            name: 'Mike Rodriguez',
            role: 'Compliance Analyst'
          },
          actions: [
            {
              id: 'act-003',
              description: 'Contact customers for missing documents',
              status: 'in_progress',
              dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: 'Customer Success Team'
            }
          ],
          evidence: [],
          auditTrail: [
            {
              id: 'audit-003',
              action: 'Flag Created',
              user: 'KYC System',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Automated KYC check failed for high-risk customers'
            }
          ]
        },
        {
          id: 'FLAG-003',
          title: 'PCI DSS Network Segmentation Gap',
          description: 'Payment card data network not properly segmented from other systems',
          category: 'pci',
          severity: 'high',
          status: 'open',
          regulation: 'PCI DSS',
          requirement: 'Requirement 1 - Network Segmentation',
          affectedData: {
            type: 'Payment Card Data',
            volume: 0,
            sensitivity: 'restricted'
          },
          risk: {
            financial: 90,
            reputational: 85,
            operational: 70,
            legal: 80
          },
          detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: {
            id: 'user-003',
            name: 'Alex Kim',
            role: 'Security Engineer'
          },
          actions: [
            {
              id: 'act-004',
              description: 'Implement network segmentation controls',
              status: 'pending',
              dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: 'Network Team'
            }
          ],
          evidence: [],
          auditTrail: [
            {
              id: 'audit-004',
              action: 'Flag Created',
              user: 'Security Scanner',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Network scan detected segmentation gap'
            }
          ]
        }
      ];

      const mockFrameworks: ComplianceFramework[] = [
        {
          id: 'framework-001',
          name: 'GDPR',
          description: 'General Data Protection Regulation',
          status: 'partial',
          score: 78,
          lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: {
            total: 25,
            compliant: 18,
            nonCompliant: 4,
            pending: 3
          }
        },
        {
          id: 'framework-002',
          name: 'PCI DSS',
          description: 'Payment Card Industry Data Security Standard',
          status: 'partial',
          score: 85,
          lastAssessment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: {
            total: 12,
            compliant: 10,
            nonCompliant: 1,
            pending: 1
          }
        },
        {
          id: 'framework-003',
          name: 'SOC 2',
          description: 'Service Organization Control 2',
          status: 'compliant',
          score: 92,
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: {
            total: 8,
            compliant: 8,
            nonCompliant: 0,
            pending: 0
          }
        }
      ];

      setFlags(mockFlags);
      setFrameworks(mockFrameworks);
      setSelectedFlag(mockFlags[0]);
    };

    loadComplianceData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kyc': return <User className="h-4 w-4" />;
      case 'gdpr': return <Globe className="h-4 w-4" />;
      case 'pci': return <Shield className="h-4 w-4" />;
      case 'sox': return <FileText className="h-4 w-4" />;
      case 'hipaa': return <Database className="h-4 w-4" />;
      case 'iso27001': return <Lock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getFrameworkStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'not_assessed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionUpdate = (flagId: string, actionId: string, newStatus: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId
        ? {
            ...flag,
            actions: flag.actions.map(action =>
              action.id === actionId ? { ...action, status: newStatus as any } : action
            )
          }
        : flag
    ));
  };

  const handleStatusUpdate = (flagId: string, newStatus: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, status: newStatus as any } : flag
    ));
  };

  const filteredFlags = flags.filter(flag => {
    const categoryMatch = filterCategory === 'all' || flag.category === filterCategory;
    const statusMatch = filterStatus === 'all' || flag.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const criticalFlags = flags.filter(flag => flag.severity === 'critical').length;
  const openFlags = flags.filter(flag => flag.status === 'open').length;
  const avgComplianceScore = frameworks.length > 0 
    ? Math.round(frameworks.reduce((sum, framework) => sum + framework.score, 0) / frameworks.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Flags
              </CardTitle>
              <CardDescription>
                KYC/GDPR policy breach detection and compliance monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Compliance Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalFlags}</div>
              <div className="text-sm text-muted-foreground">Critical Flags</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{openFlags}</div>
              <div className="text-sm text-muted-foreground">Open Issues</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{avgComplianceScore}%</div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
          </div>

          {/* Compliance Frameworks */}
          <div>
            <h4 className="font-medium mb-3">Compliance Frameworks</h4>
            <div className="grid gap-3">
              {frameworks.map((framework) => (
                <div key={framework.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{framework.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getFrameworkStatusColor(framework.status)}>
                        {framework.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-lg font-bold">{framework.score}%</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{framework.description}</p>
                  <div className="mb-2">
                    <Progress value={framework.score} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {framework.requirements.compliant}/{framework.requirements.total} requirements met
                    </span>
                    <span>Next assessment: {new Date(framework.nextAssessment).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Flags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Compliance Flags</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category:</span>
                {['all', 'kyc', 'gdpr', 'pci', 'sox', 'hipaa', 'iso27001'].map((category) => (
                  <Button
                    key={category}
                    variant={filterCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(category)}
                  >
                    {category.toUpperCase()}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'open', 'investigating', 'resolved', 'false_positive'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredFlags.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFlag?.id === flag.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFlag(flag)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(flag.category)}
                      <div>
                        <div className="font-medium">{flag.title}</div>
                        <div className="text-sm text-muted-foreground">{flag.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(flag.severity)}>
                        {flag.severity}
                      </Badge>
                      <Badge className={getStatusColor(flag.status)}>
                        {flag.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{flag.regulation} - {flag.requirement}</span>
                    <span>Due: {new Date(flag.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Flag Details */}
          {selectedFlag && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Flag Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Compliance Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Regulation:</span> {selectedFlag.regulation}</div>
                    <div><span className="font-medium">Requirement:</span> {selectedFlag.requirement}</div>
                    <div><span className="font-medium">Assignee:</span> {selectedFlag.assignee.name}</div>
                    <div><span className="font-medium">Due Date:</span> {new Date(selectedFlag.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Risk Assessment</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Financial:</span>
                      <span className="font-medium">{selectedFlag.risk.financial}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reputational:</span>
                      <span className="font-medium">{selectedFlag.risk.reputational}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operational:</span>
                      <span className="font-medium">{selectedFlag.risk.operational}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal:</span>
                      <span className="font-medium">{selectedFlag.risk.legal}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Affected Data</h5>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{selectedFlag.affectedData.type}</span>
                  <Badge className={getSensitivityColor(selectedFlag.affectedData.sensitivity)}>
                    {selectedFlag.affectedData.sensitivity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({formatNumber(selectedFlag.affectedData.volume)} records)
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Remediation Actions</h5>
                <div className="space-y-2">
                  {selectedFlag.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{action.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(action.dueDate).toLocaleDateString()} | Assignee: {action.assignee}
                        </div>
                      </div>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button size="sm" variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  False Positive
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
