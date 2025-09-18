"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Users,
  Database,
  Lock,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  standard: 'SOC2' | 'GDPR' | 'ISO27001' | 'HIPAA' | 'PCI-DSS' | 'CCPA' | 'SOX';
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'pending' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'privacy' | 'data_protection' | 'access_control' | 'audit' | 'governance';
  requirements: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
  lastAudit: string;
  nextAudit: string;
  score: number;
  issues: {
    id: string;
    description: string;
    severity: string;
    status: string;
    dueDate: string;
  }[];
  controls: {
    id: string;
    name: string;
    description: string;
    status: string;
    evidence: string[];
  }[];
}

export default function ComplianceDashboard() {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterStandard, setFilterStandard] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        // Mock compliance data - in production this would come from API
        const mockData: ComplianceItem[] = [
          {
            id: 'soc2-001',
            name: 'SOC 2 Type II Compliance',
            description: 'Service Organization Control 2 Type II certification',
            standard: 'SOC2',
            status: 'compliant',
            severity: 'high',
            category: 'security',
            requirements: { total: 64, completed: 64, pending: 0, failed: 0 },
            lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
            score: 100,
            issues: [],
            controls: [
              { id: 'cc1', name: 'Control Environment', description: 'Control environment controls', status: 'compliant', evidence: ['Policy Document', 'Training Records'] },
              { id: 'cc2', name: 'Communication and Information', description: 'Communication controls', status: 'compliant', evidence: ['Communication Plan'] }
            ]
          },
          {
            id: 'gdpr-001',
            name: 'GDPR Compliance',
            description: 'General Data Protection Regulation compliance',
            standard: 'GDPR',
            status: 'in_progress',
            severity: 'critical',
            category: 'privacy',
            requirements: { total: 45, completed: 38, pending: 7, failed: 0 },
            lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            score: 84,
            issues: [
              { id: 'issue-1', description: 'Data retention policy needs update', severity: 'medium', status: 'open', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
            ],
            controls: [
              { id: 'art6', name: 'Lawfulness of Processing', description: 'Legal basis for processing', status: 'compliant', evidence: ['Legal Basis Document'] },
              { id: 'art32', name: 'Security of Processing', description: 'Technical and organizational measures', status: 'in_progress', evidence: ['Security Assessment'] }
            ]
          },
          {
            id: 'iso27001-001',
            name: 'ISO 27001 Certification',
            description: 'Information Security Management System',
            standard: 'ISO27001',
            status: 'pending',
            severity: 'high',
            category: 'security',
            requirements: { total: 114, completed: 89, pending: 25, failed: 0 },
            lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            score: 78,
            issues: [
              { id: 'issue-2', description: 'Risk assessment incomplete', severity: 'high', status: 'open', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() }
            ],
            controls: [
              { id: 'a5', name: 'Information Security Policies', description: 'Security policy framework', status: 'compliant', evidence: ['Security Policy'] },
              { id: 'a6', name: 'Organization of Information Security', description: 'Security organization', status: 'in_progress', evidence: ['Org Chart'] }
            ]
          }
        ];

        setComplianceItems(mockData);
        if (mockData.length > 0) {
          setSelectedItem(mockData[0]);
        }
      } catch (error) {
        console.error('Failed to load compliance data:', error);
        setComplianceItems([]);
      }
    };

    loadComplianceData();
  }, []);

  const getStandardColor = (standard: string) => {
    switch (standard) {
      case 'SOC2': return 'bg-blue-100 text-blue-800';
      case 'GDPR': return 'bg-green-100 text-green-800';
      case 'ISO27001': return 'bg-purple-100 text-purple-800';
      case 'HIPAA': return 'bg-red-100 text-red-800';
      case 'PCI-DSS': return 'bg-orange-100 text-orange-800';
      case 'CCPA': return 'bg-yellow-100 text-yellow-800';
      case 'SOX': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = complianceItems.filter(item => {
    const standardMatch = filterStandard === 'all' || item.standard === filterStandard;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return standardMatch && statusMatch;
  });

  const totalRequirements = complianceItems.reduce((sum, item) => sum + item.requirements.total, 0);
  const completedRequirements = complianceItems.reduce((sum, item) => sum + item.requirements.completed, 0);
  const pendingRequirements = complianceItems.reduce((sum, item) => sum + item.requirements.pending, 0);
  const failedRequirements = complianceItems.reduce((sum, item) => sum + item.requirements.failed, 0);
  const overallScore = complianceItems.length > 0 
    ? Math.round(complianceItems.reduce((sum, item) => sum + item.score, 0) / complianceItems.length)
    : 0;
  const compliantItems = complianceItems.filter(item => item.status === 'compliant').length;
  const criticalIssues = complianceItems.reduce((sum, item) => 
    sum + item.issues.filter(issue => issue.severity === 'critical').length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Dashboard
            </CardTitle>
            <CardDescription>
              SOC2, GDPR, ISO27001, HIPAA, PCI-DSS, CCPA, and SOX compliance tracking
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
            >
              {isMonitoring ? <Eye className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
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
        {/* Compliance Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overallScore}%</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{compliantItems}</div>
            <div className="text-sm text-muted-foreground">Compliant Standards</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingRequirements}</div>
            <div className="text-sm text-muted-foreground">Pending Requirements</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
            <div className="text-sm text-muted-foreground">Critical Issues</div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Compliance Status Overview</h4>
              <p className="text-sm text-muted-foreground">
                Multi-standard compliance tracking with automated audit preparation
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {complianceItems.length}
              </div>
              <div className="text-sm text-muted-foreground">standards tracked</div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={overallScore} className="h-2" />
          </div>
        </div>

        {/* Compliance Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Compliance Standards</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Standard:</span>
              {['all', 'SOC2', 'GDPR', 'ISO27001', 'HIPAA', 'PCI-DSS', 'CCPA', 'SOX'].map((standard) => (
                <Button
                  key={standard}
                  variant={filterStandard === standard ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStandard(standard)}
                >
                  {standard}
                </Button>
              ))}
              <span className="text-sm ml-4">Status:</span>
              {['all', 'compliant', 'non_compliant', 'in_progress', 'pending', 'failed'].map((status) => (
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
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStandardColor(item.standard)}>
                      {item.standard}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                    <div className="text-sm font-medium">
                      {item.score}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Requirements: {item.requirements.completed}/{item.requirements.total}</span>
                  <span>Issues: {item.issues.length}</span>
                  <span>Controls: {item.controls.length}</span>
                  <span>Last Audit: {new Date(item.lastAudit).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Compliance Details - {selectedItem.name}</h4>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="controls">Controls</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Compliance Information</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Standard:</span>
                        <Badge className={getStandardColor(selectedItem.standard)}>
                          {selectedItem.standard}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className={getStatusColor(selectedItem.status)}>
                          {selectedItem.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Severity:</span>
                        <Badge className={getSeverityColor(selectedItem.severity)}>
                          {selectedItem.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Score:</span>
                        <span className="font-medium">{selectedItem.score}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Requirements Status</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{selectedItem.requirements.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium text-green-600">{selectedItem.requirements.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-medium text-yellow-600">{selectedItem.requirements.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="font-medium text-red-600">{selectedItem.requirements.failed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Requirements Progress</h5>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round((selectedItem.requirements.completed / selectedItem.requirements.total) * 100)}%</span>
                      </div>
                      <Progress value={(selectedItem.requirements.completed / selectedItem.requirements.total) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Compliance Issues</h5>
                  <div className="space-y-2">
                    {selectedItem.issues.length > 0 ? (
                      selectedItem.issues.map((issue) => (
                        <div key={issue.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{issue.description}</span>
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status: {issue.status} | Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No compliance issues found
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="controls" className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Security Controls</h5>
                  <div className="space-y-2">
                    {selectedItem.controls.map((control) => (
                      <div key={control.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{control.name}</span>
                          <Badge className={getStatusColor(control.status)}>
                            {control.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {control.description}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Evidence:</span> {control.evidence.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
