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
import { useLanguage } from '@/contexts/language-context';
import { productionApi } from '@/lib/production-api';

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
  const { t } = useLanguage();
  const [flags, setFlags] = useState<ComplianceFlag[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<ComplianceFlag | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        // Load compliance flags from production API
        const flagsData = await productionApi.getComplianceFlags();
        setFlags(Array.isArray(flagsData) ? flagsData : []);

        // Load compliance frameworks from production API
        const frameworksData = await productionApi.getComplianceFrameworks();
        setFrameworks(Array.isArray(frameworksData) ? frameworksData : []);
      } catch (error) {
        // Failed to load compliance data - set empty arrays as fallback
        setFlags([]);
        setFrameworks([]);
      }
    };

    loadComplianceData();
  }, []);


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/100';
      case 'high': return 'bg-warning/100';
      case 'medium': return 'bg-warning/100';
      case 'low': return 'bg-success/100';
      default: return 'bg-muted/500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive/10 text-red-800';
      case 'investigating': return 'bg-warning/10 text-yellow-800';
      case 'resolved': return 'bg-success/10 text-green-800';
      case 'false_positive': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
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
      case 'compliant': return 'bg-success/10 text-green-800';
      case 'partial': return 'bg-warning/10 text-yellow-800';
      case 'non_compliant': return 'bg-destructive/10 text-red-800';
      case 'not_assessed': return 'bg-muted text-gray-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'public': return 'bg-success/10 text-green-800';
      case 'internal': return 'bg-primary/10 text-blue-800';
      case 'confidential': return 'bg-warning/10 text-yellow-800';
      case 'restricted': return 'bg-destructive/10 text-red-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const handleActionUpdate = (flagId: string, actionId: string, newStatus: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId
        ? {
            ...flag,
            actions: flag.actions.map(action =>
              action.id === actionId ? { ...action, status: newStatus as string } : action
            )
          }
        : flag
    ));
  };

  const handleStatusUpdate = (flagId: string, newStatus: string) => {
    setFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, status: newStatus as string } : flag
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
                {t('compliance.title')}
              </CardTitle>
              <CardDescription>
                {t('compliance.description')}
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
            <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-destructive">{criticalFlags}</div>
              <div className="text-sm text-muted-foreground">Critical Flags</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-warning">{openFlags}</div>
              <div className="text-sm text-muted-foreground">Open Issues</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
              <div className="text-2xl font-bold text-success">{avgComplianceScore}%</div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
            </div>
          </div>

          {/* Compliance Frameworks */}
          <div>
            <h4 className="font-medium mb-3">Compliance Frameworks</h4>
            <div className="grid gap-3">
              {frameworks.map((framework) => (
                <div key={framework.id} className="p-3 border rounded-[0.625rem]">
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
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedFlag?.id === flag.id ? 'border-blue-500 bg-primary/10' : 'hover:bg-muted/50'
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
                    <div key={action.id} className="flex items-center justify-between p-2 border rounded-[0.625rem]">
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


