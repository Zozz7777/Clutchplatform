"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Download,
  Bell,
  BellOff,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Key,
  Database,
  Server,
  Network,
  Wifi,
  HardDrive,
  Cpu,
  Memory,
  Zap,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  Download as DownloadIcon,
  Upload,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Crosshair,
  Radar,
  Scan,
  Search as SearchIcon,
  Fingerprint,
  QrCode,
  Smartphone as PhoneIcon,
  Mail,
  Phone,
  Calendar,
  Star,
  Heart,
  MessageSquare,
  CreditCard,
  Building,
  Car,
  Truck,
  Bike,
  Flag
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';
import { useTranslations } from 'next-intl';

interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  type: 'access_control' | 'device_trust' | 'network_segmentation' | 'data_protection' | 'identity_verification' | 'behavioral_analysis';
  status: 'active' | 'inactive' | 'testing' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enforcement: 'strict' | 'moderate' | 'lenient';
  coverage: {
    users: number;
    devices: number;
    networks: number;
    applications: number;
    data: number;
  };
  compliance: {
    score: number;
    violations: number;
    exceptions: number;
    lastAudit: string;
  };
  rules: {
    id: string;
    name: string;
    condition: string;
    action: string;
    status: 'enabled' | 'disabled' | 'testing';
    violations: number;
  }[];
  metrics: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    blockedAccess: number;
    allowedAccess: number;
  };
  lastUpdated: string;
  nextAudit: string;
}

interface AnomalyDetection {
  id: string;
  type: 'unusual_location' | 'suspicious_device' | 'abnormal_behavior' | 'privilege_escalation' | 'data_exfiltration' | 'network_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  confidence: number;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  details: {
    description: string;
    riskFactors: string[];
    evidence: string[];
    context: Record<string, unknown>;
  };
  impact: {
    users: number;
    systems: number;
    data: number;
    reputation: number;
  };
  mitigation: {
    actions: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    effectiveness: number;
  };
}

interface ZeroTrustMetrics {
  overallScore: number;
  policyCompliance: number;
  anomalyDetection: number;
  accessControl: number;
  deviceTrust: number;
  networkSecurity: number;
  dataProtection: number;
  totalPolicies: number;
  activePolicies: number;
  totalAnomalies: number;
  criticalAnomalies: number;
  lastUpdated: string;
}

export default function ZeroTrustAuditCard() {
  const t = useTranslations();
  const [policies, setPolicies] = useState<ZeroTrustPolicy[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<ZeroTrustPolicy | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null);
  const [metrics, setMetrics] = useState<ZeroTrustMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadZeroTrustData = async () => {
      try {
        // Load real zero-trust data from API
        const [policiesData, anomaliesData, metricsData] = await Promise.all([
          productionApi.getZeroTrustPolicies(),
          productionApi.getAnomalyDetections(),
          productionApi.getZeroTrustMetrics()
        ]);

        // Transform API data to component format
        const transformedPolicies: ZeroTrustPolicy[] = policiesData.map((policy: any, index: number) => ({
          id: policy.id || `policy-${index}`,
          name: policy.name || 'Zero Trust Policy',
          description: policy.description || 'Zero trust security policy',
          type: policy.type || 'device_trust',
          status: policy.status || 'active',
          severity: policy.severity || 'medium',
          enforcement: policy.enforcement || 'strict',
          coverage: policy.coverage || {
            users: 0,
            devices: 0,
            networks: 0,
            applications: 0,
            data: 0
          },
          compliance: policy.compliance || {
            score: 0,
            violations: 0,
            exceptions: 0,
            lastAudit: new Date().toISOString()
          },
          rules: policy.rules || [],
          metrics: policy.metrics || {
            totalChecks: 0,
            passedChecks: 0,
            failedChecks: 0,
            blockedAccess: 0,
            allowedAccess: 0
          },
          lastUpdated: policy.lastUpdated || new Date().toISOString(),
          nextAudit: policy.nextAudit || new Date().toISOString()
        }));

        const transformedAnomalies: AnomalyDetection[] = anomaliesData.map((anomaly: any, index: number) => ({
          id: anomaly.id || `anomaly-${index}`,
          type: anomaly.type || 'suspicious_activity',
          severity: anomaly.severity || 'medium',
          status: anomaly.status || 'detected',
          description: anomaly.description || 'Anomaly detected',
          detectedAt: anomaly.detectedAt || new Date().toISOString(),
          source: anomaly.source || 'system',
          confidence: anomaly.confidence || 0.5,
          affectedResources: anomaly.affectedResources || [],
          mitigationActions: anomaly.mitigationActions || []
        }));

        const transformedMetrics: ZeroTrustMetrics = {
          totalPolicies: transformedPolicies.length,
          activePolicies: transformedPolicies.filter(p => p.status === 'active').length,
          totalAnomalies: transformedAnomalies.length,
          criticalAnomalies: transformedAnomalies.filter(a => a.severity === 'critical').length,
          lastUpdated: new Date().toISOString()
        };
              passedChecks: 14200,
              failedChecks: 1220,
              blockedAccess: 850,
              allowedAccess: 13570
            },
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'policy-002',
            name: 'Network Segmentation',
            description: 'Enforce network segmentation and micro-segmentation',
            type: 'network_segmentation',
            status: 'active',
            severity: 'critical',
            enforcement: 'strict',
            coverage: {
              users: 1000,
              devices: 850,
              networks: 15,
              applications: 25,
              data: 100
            },
            compliance: {
              score: 88,
              violations: 12,
              exceptions: 1,
              lastAudit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            rules: [
              {
                id: 'rule-003',
                name: 'Network Access Control',
                condition: 'network.segment == user.assigned_segment',
                action: 'allow',
                status: 'enabled',
                violations: 8
              },
              {
                id: 'rule-004',
                name: 'Cross-Segment Communication',
                condition: 'communication.cross_segment == false',
                action: 'block',
                status: 'enabled',
                violations: 4
              }
            ],
            metrics: {
              totalChecks: 28450,
              passedChecks: 25020,
              failedChecks: 3430,
              blockedAccess: 2100,
              allowedAccess: 22920
            },
            lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'policy-003',
            name: 'Behavioral Analysis',
            description: 'Analyze user behavior patterns for anomalies',
            type: 'behavioral_analysis',
            status: 'testing',
            severity: 'medium',
            enforcement: 'moderate',
            coverage: {
              users: 500,
              devices: 400,
              networks: 8,
              applications: 15,
              data: 60
            },
            compliance: {
              score: 75,
              violations: 25,
              exceptions: 5,
              lastAudit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            rules: [
              {
                id: 'rule-005',
                name: 'Unusual Access Pattern',
                condition: 'user.access_pattern.anomaly_score > 0.8',
                action: 'challenge',
                status: 'testing',
                violations: 15
              },
              {
                id: 'rule-006',
                name: 'Time-based Anomaly',
                condition: 'user.access_time.unusual == true',
                action: 'challenge',
                status: 'testing',
                violations: 10
              }
            ],
            metrics: {
              totalChecks: 8750,
              passedChecks: 6560,
              failedChecks: 2190,
              blockedAccess: 450,
              allowedAccess: 6110
            },
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            nextAudit: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const mockAnomalies: AnomalyDetection[] = [
          {
            id: 'anomaly-001',
            type: 'unusual_location',
            severity: 'high',
            status: 'detected',
            confidence: 92,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            userId: 'user-123',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            details: {
              description: 'User accessed system from unusual geographic location',
              riskFactors: ['new_country', 'unusual_time', 'suspicious_ip'],
              evidence: ['IP geolocation', 'access_time', 'device_fingerprint'],
              context: {
                previousLocation: 'New York, US',
                currentLocation: 'Moscow, Russia',
                timeDifference: '2 hours',
                deviceChange: false
              }
            },
            impact: {
              users: 1,
              systems: 3,
              data: 2,
              reputation: 5
            },
            mitigation: {
              actions: ['challenge_authentication', 'notify_security_team', 'monitor_session'],
              status: 'in_progress',
              effectiveness: 85
            }
          },
          {
            id: 'anomaly-002',
            type: 'privilege_escalation',
            severity: 'critical',
            status: 'investigating',
            confidence: 98,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            userId: 'user-456',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            details: {
              description: 'Attempted privilege escalation detected',
              riskFactors: ['admin_access_request', 'unusual_permissions', 'suspicious_timing'],
              evidence: ['permission_logs', 'access_attempts', 'user_behavior'],
              context: {
                requestedPermissions: ['admin:all', 'user:delete', 'system:config'],
                currentRole: 'user',
                requestTime: 'off_hours',
                previousAttempts: 3
              }
            },
            impact: {
              users: 1,
              systems: 10,
              data: 8,
              reputation: 15
            },
            mitigation: {
              actions: ['block_access', 'escalate_to_security', 'investigate_user'],
              status: 'in_progress',
              effectiveness: 95
            }
          }
        ];

        const mockMetrics: ZeroTrustMetrics = {
          overallScore: 87,
          policyCompliance: 92,
          anomalyDetection: 85,
          accessControl: 90,
          deviceTrust: 88,
          networkSecurity: 85,
          dataProtection: 89,
          totalPolicies: mockPolicies.length,
          activePolicies: mockPolicies.filter(p => p.status === 'active').length,
          totalAnomalies: mockAnomalies.length,
          criticalAnomalies: mockAnomalies.filter(a => a.severity === 'critical').length,
          lastUpdated: new Date().toISOString()
        };

        setPolicies(transformedPolicies);
        setAnomalies(transformedAnomalies);
        setMetrics(transformedMetrics);
        
        if (transformedPolicies.length > 0) {
          setSelectedPolicy(transformedPolicies[0]);
        }
        if (transformedAnomalies.length > 0) {
          setSelectedAnomaly(transformedAnomalies[0]);
        }
      } catch (error) {
        // Failed to load zero-trust data
        setPolicies([]);
        setAnomalies([]);
        setMetrics(null);
      }
    };

    loadZeroTrustData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setPolicies(prev => prev.map(policy => ({
        ...policy,
        compliance: {
          ...policy.compliance,
          score: Math.min(100, Math.max(0, policy.compliance.score + Math.random() * 2 - 1))
        }
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'access_control': return 'bg-info/10 text-info';
      case 'device_trust': return 'bg-success/10 text-success';
      case 'network_segmentation': return 'bg-primary/10 text-primary';
      case 'data_protection': return 'bg-destructive/10 text-destructive';
      case 'identity_verification': return 'bg-warning/10 text-warning';
      case 'behavioral_analysis': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'testing': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-destructive/10 text-destructive';
      case 'detected': return 'bg-destructive/10 text-destructive';
      case 'investigating': return 'bg-warning/10 text-warning';
      case 'resolved': return 'bg-success/10 text-success';
      case 'false_positive': return 'bg-muted text-muted-foreground';
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

  const getEnforcementColor = (enforcement: string) => {
    switch (enforcement) {
      case 'strict': return 'bg-destructive/10 text-destructive';
      case 'moderate': return 'bg-warning/10 text-warning';
      case 'lenient': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAnomalyTypeColor = (type: string) => {
    switch (type) {
      case 'unusual_location': return 'bg-info/10 text-info';
      case 'suspicious_device': return 'bg-warning/10 text-warning';
      case 'abnormal_behavior': return 'bg-primary/10 text-primary';
      case 'privilege_escalation': return 'bg-destructive/10 text-destructive';
      case 'data_exfiltration': return 'bg-destructive/10 text-destructive';
      case 'network_anomaly': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const typeMatch = filterType === 'all' || policy.type === filterType;
    const statusMatch = filterStatus === 'all' || policy.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const filteredAnomalies = anomalies.filter(anomaly => {
    const typeMatch = filterType === 'all' || anomaly.type === filterType;
    const statusMatch = filterStatus === 'all' || anomaly.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || anomaly.severity === filterSeverity;
    return typeMatch && statusMatch && severityMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Zero-Trust Audit Card
            </CardTitle>
            <CardDescription>
              Comprehensive zero-trust policy enforcement and anomaly detection
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={isMonitoring ? 'bg-success/10 text-success' : ''}
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
        {/* Zero-Trust Metrics */}
        {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-info/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-info">{metrics.overallScore}%</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-success">{metrics.activePolicies}</div>
            <div className="text-sm text-muted-foreground">Active Policies</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-warning">{metrics.totalAnomalies}</div>
            <div className="text-sm text-muted-foreground">Total Anomalies</div>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-[0.625rem]">
            <div className="text-2xl font-bold text-destructive">{metrics.criticalAnomalies}</div>
            <div className="text-sm text-muted-foreground">Critical Anomalies</div>
          </div>
        </div>
        )}

        {/* Zero-Trust Overview */}
        {metrics && (
          <div className="p-4 bg-gradient-to-r from-info/10 to-primary/10 rounded-[0.625rem]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Zero-Trust Security Status</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive policy enforcement and anomaly detection across all systems
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-info">
                  {metrics.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">overall score</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Policy Compliance</span>
                  <span>{metrics.policyCompliance}%</span>
                </div>
                <Progress value={metrics.policyCompliance} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Anomaly Detection</span>
                  <span>{metrics.anomalyDetection}%</span>
                </div>
                <Progress value={metrics.anomalyDetection} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Access Control</span>
                  <span>{metrics.accessControl}%</span>
                </div>
                <Progress value={metrics.accessControl} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Zero-Trust Policies and Anomalies */}
        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="policies">Zero-Trust Policies</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Zero-Trust Policies</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'access_control', 'device_trust', 'network_segmentation', 'data_protection', 'identity_verification', 'behavioral_analysis'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'active', 'inactive', 'testing', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedPolicy?.id === policy.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-sm text-muted-foreground">{policy.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPolicyTypeColor(policy.type)}>
                        {policy.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <Badge className={getSeverityColor(policy.severity)}>
                        {policy.severity}
                      </Badge>
                      <Badge className={getEnforcementColor(policy.enforcement)}>
                        {policy.enforcement}
                      </Badge>
                      <div className="text-sm font-medium">
                        {policy.compliance.score}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Coverage: {policy.coverage.users} users, {policy.coverage.devices} devices</span>
                    <span>Violations: {policy.compliance.violations}</span>
                    <span>Rules: {policy.rules.length}</span>
                    <span>Last Audit: {new Date(policy.compliance.lastAudit).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Anomaly Detection</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'unusual_location', 'suspicious_device', 'abnormal_behavior', 'privilege_escalation', 'data_exfiltration', 'network_anomaly'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Status:</span>
                {['all', 'detected', 'investigating', 'resolved', 'false_positive'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
                <span className="text-sm ml-4">Severity:</span>
                {['all', 'low', 'medium', 'high', 'critical'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-3 border rounded-[0.625rem] cursor-pointer transition-colors ${
                    selectedAnomaly?.id === anomaly.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{anomaly.details.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {anomaly.userName} ({anomaly.userEmail}) - {new Date(anomaly.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAnomalyTypeColor(anomaly.type)}>
                        {anomaly.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                      <Badge className={getStatusColor(anomaly.status)}>
                        {anomaly.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        {anomaly.confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Risk Factors: {anomaly.details.riskFactors.join(', ')}</span>
                    <span>Impact: {anomaly.impact.users} users, {anomaly.impact.systems} systems</span>
                    <span>Mitigation: {anomaly.mitigation.status}</span>
                    <span>Effectiveness: {anomaly.mitigation.effectiveness}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Policy/Anomaly Details */}
        {(selectedPolicy || selectedAnomaly) && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">
              {selectedPolicy ? 'Policy Details' : 'Anomaly Details'} - {selectedPolicy?.name || selectedAnomaly?.details.description}
            </h4>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {selectedPolicy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Policy Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getPolicyTypeColor(selectedPolicy.type)}>
                            {selectedPolicy.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedPolicy.status)}>
                            {selectedPolicy.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedPolicy.severity)}>
                            {selectedPolicy.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Enforcement:</span>
                          <Badge className={getEnforcementColor(selectedPolicy.enforcement)}>
                            {selectedPolicy.enforcement}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance Score:</span>
                          <span className="font-medium">{selectedPolicy.compliance.score}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Coverage & Metrics</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <span className="font-medium">{selectedPolicy.coverage.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Devices:</span>
                          <span className="font-medium">{selectedPolicy.coverage.devices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Networks:</span>
                          <span className="font-medium">{selectedPolicy.coverage.networks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Applications:</span>
                          <span className="font-medium">{selectedPolicy.coverage.applications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Violations:</span>
                          <span className="font-medium text-destructive">{selectedPolicy.compliance.violations}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedAnomaly && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Anomaly Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getAnomalyTypeColor(selectedAnomaly.type)}>
                            {selectedAnomaly.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                            {selectedAnomaly.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedAnomaly.status)}>
                            {selectedAnomaly.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedAnomaly.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>User:</span>
                          <span className="font-medium">{selectedAnomaly.userName}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Impact & Mitigation</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Users Affected:</span>
                          <span className="font-medium">{selectedAnomaly.impact.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Systems Affected:</span>
                          <span className="font-medium">{selectedAnomaly.impact.systems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data Affected:</span>
                          <span className="font-medium">{selectedAnomaly.impact.data}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mitigation Status:</span>
                          <span className="font-medium">{selectedAnomaly.mitigation.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effectiveness:</span>
                          <span className="font-medium">{selectedAnomaly.mitigation.effectiveness}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {selectedPolicy && (
                  <div>
                    <h5 className="font-medium mb-2">Policy Rules</h5>
                    <div className="space-y-2">
                      {selectedPolicy.rules.map((rule) => (
                        <div key={rule.id} className="p-3 border rounded-[0.625rem]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rule.name}</span>
                            <Badge className={getStatusColor(rule.status)}>
                              {rule.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Condition: {rule.condition}</div>
                            <div>Action: {rule.action}</div>
                            <div>Violations: {rule.violations}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAnomaly && (
                  <div>
                    <h5 className="font-medium mb-2">Anomaly Details</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground">{selectedAnomaly.details.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">Risk Factors:</span>
                        <p className="text-muted-foreground">{selectedAnomaly.details.riskFactors.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Evidence:</span>
                        <p className="text-muted-foreground">{selectedAnomaly.details.evidence.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Context:</span>
                        <pre className="text-muted-foreground bg-muted p-2 rounded-[0.625rem] text-xs">
                          {JSON.stringify(selectedAnomaly.details.context, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Available Actions</h5>
                  <div className="flex items-center gap-2">
                    {selectedPolicy && (
                      <>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Policy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Rules
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Run Audit
                        </Button>
                      </>
                    )}
                    {selectedAnomaly && (
                      <>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-2" />
                          False Positive
                        </Button>
                      </>
                    )}
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
