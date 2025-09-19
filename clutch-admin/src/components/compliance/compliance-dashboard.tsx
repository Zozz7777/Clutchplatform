"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productionApi } from '@/lib/production-api';
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
        // Load compliance data from API
        const complianceData = await productionApi.getComplianceData();
        setComplianceItems(complianceData || []);
        if (complianceData && complianceData.length > 0) {
          setSelectedItem(complianceData[0]);
        }
      } catch (error) {
        // Failed to load compliance data
        setComplianceItems([]);
      }
    };

    loadComplianceData();
  }, []);

  const getStandardColor = (standard: string) => {
    switch (standard) {
      case 'SOC2': return 'bg-info/10 text-info';
      case 'GDPR': return 'bg-success/10 text-success';
      case 'ISO27001': return 'bg-primary/10 text-primary';
      case 'HIPAA': return 'bg-destructive/10 text-destructive';
      case 'PCI-DSS': return 'bg-warning/10 text-warning';
      case 'CCPA': return 'bg-warning/10 text-warning';
      case 'SOX': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success/10 text-success';
      case 'non_compliant': return 'bg-destructive/10 text-destructive';
      case 'in_progress': return 'bg-warning/10 text-warning';
      case 'pending': return 'bg-info/10 text-info';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
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
              className={isMonitoring ? 'bg-success/10 text-success' : ''}
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
          <div className="text-center p-3 bg-info/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-info">{overallScore}%</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-success">{compliantItems}</div>
            <div className="text-sm text-muted-foreground">Compliant Standards</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-warning">{pendingRequirements}</div>
            <div className="text-sm text-muted-foreground">Pending Requirements</div>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-destructive">{criticalIssues}</div>
            <div className="text-sm text-muted-foreground">Critical Issues</div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="p-4 bg-gradient-to-r from-info/10 to-success/10 rounded-[0.625rem]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Compliance Status Overview</h4>
              <p className="text-sm text-muted-foreground">
                Multi-standard compliance tracking with automated audit preparation
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-info">
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
                className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                  selectedItem?.id === item.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
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
                        <span className="font-medium text-success">{selectedItem.requirements.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-medium text-warning">{selectedItem.requirements.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="font-medium text-destructive">{selectedItem.requirements.failed}</span>
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
                        <div key={issue.id} className="p-3 border rounded-[0.625rem]">
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
                      <div key={control.id} className="p-3 border rounded-[0.625rem]">
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
