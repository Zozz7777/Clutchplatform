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
  LineChart
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { productionApi } from '@/lib/production-api';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_access' | 'suspicious_activity' | 'admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os: string;
    browser: string;
    userAgent: string;
  };
  details: {
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  };
  riskScore: number;
  tags: string[];
}

interface AccessSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  status: 'active' | 'expired' | 'terminated' | 'suspicious';
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os: string;
    browser: string;
    userAgent: string;
  };
  permissions: string[];
  riskScore: number;
  flags: string[];
}

interface SecurityMetrics {
  totalEvents: number;
  activeSessions: number;
  suspiciousActivities: number;
  failedLogins: number;
  riskScore: number;
  complianceScore: number;
  lastUpdated: string;
}

export default function GlobalSecurityCenter() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [accessSessions, setAccessSessions] = useState<AccessSession[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedSession, setSelectedSession] = useState<AccessSession | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        // Mock security data - in production this would come from API
        const mockEvents: SecurityEvent[] = [
          {
            id: 'event-001',
            type: 'failed_login',
            severity: 'high',
            status: 'active',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            userId: 'user-123',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            userRole: 'user',
            ipAddress: '192.168.1.100',
            location: {
              country: 'United States',
              city: 'New York',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            device: {
              type: 'desktop',
              os: 'Windows 10',
              browser: 'Chrome 120.0',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            details: {
              action: 'Failed login attempt',
              resource: 'authentication',
              metadata: { attempts: 5, reason: 'invalid_password' }
            },
            riskScore: 85,
            tags: ['brute_force', 'suspicious_ip']
          },
          {
            id: 'event-002',
            type: 'suspicious_activity',
            severity: 'critical',
            status: 'investigating',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            userId: 'user-456',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            userRole: 'admin',
            ipAddress: '10.0.0.50',
            location: {
              country: 'Canada',
              city: 'Toronto',
              coordinates: { lat: 43.6532, lng: -79.3832 }
            },
            device: {
              type: 'mobile',
              os: 'iOS 17.2',
              browser: 'Safari 17.2',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)'
            },
            details: {
              action: 'Unusual data access pattern',
              resource: 'user_data',
              resourceId: 'data-789',
              metadata: { records_accessed: 1000, time_range: '5_minutes' }
            },
            riskScore: 95,
            tags: ['data_exfiltration', 'privilege_escalation']
          },
          {
            id: 'event-003',
            type: 'admin_action',
            severity: 'medium',
            status: 'resolved',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            userId: 'admin-001',
            userName: 'Admin User',
            userEmail: 'admin@clutch.com',
            userRole: 'head_administrator',
            ipAddress: '192.168.1.1',
            location: {
              country: 'United States',
              city: 'San Francisco',
              coordinates: { lat: 37.7749, lng: -122.4194 }
            },
            device: {
              type: 'desktop',
              os: 'macOS 14.2',
              browser: 'Chrome 120.0',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            },
            details: {
              action: 'User role modification',
              resource: 'user_management',
              resourceId: 'user-789',
              metadata: { old_role: 'user', new_role: 'manager' }
            },
            riskScore: 45,
            tags: ['role_change', 'admin_action']
          }
        ];

        const mockSessions: AccessSession[] = [
          {
            id: 'session-001',
            userId: 'user-123',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            userRole: 'user',
            status: 'active',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            ipAddress: '192.168.1.100',
            location: {
              country: 'United States',
              city: 'New York',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            },
            device: {
              type: 'desktop',
              os: 'Windows 10',
              browser: 'Chrome 120.0',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            permissions: ['read:users', 'read:data', 'write:profile'],
            riskScore: 25,
            flags: ['normal_activity']
          },
          {
            id: 'session-002',
            userId: 'user-456',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            userRole: 'admin',
            status: 'suspicious',
            startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
            ipAddress: '10.0.0.50',
            location: {
              country: 'Canada',
              city: 'Toronto',
              coordinates: { lat: 43.6532, lng: -79.3832 }
            },
            device: {
              type: 'mobile',
              os: 'iOS 17.2',
              browser: 'Safari 17.2',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)'
            },
            permissions: ['read:all', 'write:all', 'admin:all'],
            riskScore: 90,
            flags: ['unusual_location', 'high_privilege_access']
          }
        ];

        const mockMetrics: SecurityMetrics = {
          totalEvents: mockEvents.length,
          activeSessions: mockSessions.filter(s => s.status === 'active').length,
          suspiciousActivities: mockEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length,
          failedLogins: mockEvents.filter(e => e.type === 'failed_login').length,
          riskScore: 75,
          complianceScore: 92,
          lastUpdated: new Date().toISOString()
        };

        setSecurityEvents(mockEvents);
        setAccessSessions(mockSessions);
        setMetrics(mockMetrics);
        
        if (mockEvents.length > 0) {
          setSelectedEvent(mockEvents[0]);
        }
        if (mockSessions.length > 0) {
          setSelectedSession(mockSessions[0]);
        }
      } catch (error) {
        console.error('Failed to load security data:', error);
        setSecurityEvents([]);
        setAccessSessions([]);
        setMetrics(null);
      }
    };

    loadSecurityData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSecurityEvents(prev => prev.map(event => ({
        ...event,
        riskScore: Math.min(100, event.riskScore + Math.random() * 5 - 2.5)
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-blue-100 text-blue-800';
      case 'failed_login': return 'bg-red-100 text-red-800';
      case 'permission_change': return 'bg-yellow-100 text-yellow-800';
      case 'data_access': return 'bg-purple-100 text-purple-800';
      case 'suspicious_activity': return 'bg-red-100 text-red-800';
      case 'admin_action': return 'bg-orange-100 text-orange-800';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      case 'suspicious': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const severityMatch = filterSeverity === 'all' || event.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || event.status === filterStatus;
    return typeMatch && severityMatch && statusMatch;
  });

  const filteredSessions = accessSessions.filter(session => {
    const statusMatch = filterStatus === 'all' || session.status === filterStatus;
    return statusMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Global Security Center
            </CardTitle>
            <CardDescription>
              Real-time security monitoring, access control, and threat detection
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
        {/* Security Metrics */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivities}</div>
              <div className="text-sm text-muted-foreground">Suspicious Activities</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.failedLogins}</div>
              <div className="text-sm text-muted-foreground">Failed Logins</div>
            </div>
          </div>
        )}

        {/* Security Overview */}
        {metrics && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Security Status Overview</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time threat detection and access monitoring across all systems
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.riskScore}%
                </div>
                <div className="text-sm text-muted-foreground">risk score</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Score</span>
                  <span>{metrics.riskScore}%</span>
                </div>
                <Progress value={metrics.riskScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Compliance Score</span>
                  <span>{metrics.complianceScore}%</span>
                </div>
                <Progress value={metrics.complianceScore} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Security Events and Sessions */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="sessions">Access Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Security Events</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Type:</span>
                {['all', 'login', 'logout', 'failed_login', 'permission_change', 'data_access', 'suspicious_activity', 'admin_action'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.replace('_', ' ')}
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
                <span className="text-sm ml-4">Status:</span>
                {['all', 'active', 'investigating', 'resolved', 'false_positive'].map((status) => (
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
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{event.details.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.userName} ({event.userEmail}) - {event.location.city}, {event.location.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        Risk: {event.riskScore}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>IP: {event.ipAddress}</span>
                    <span>Device: {event.device.type} ({event.device.os})</span>
                    <span>Time: {new Date(event.timestamp).toLocaleString()}</span>
                    <span>Tags: {event.tags.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Active Access Sessions</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                {['all', 'active', 'suspicious', 'expired', 'terminated'].map((status) => (
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
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device.type)}
                      <div>
                        <div className="font-medium">{session.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.userEmail} ({session.userRole}) - {session.location.city}, {session.location.country}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium">
                        Risk: {session.riskScore}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>IP: {session.ipAddress}</span>
                    <span>Device: {session.device.type} ({session.device.os})</span>
                    <span>Last Activity: {new Date(session.lastActivity).toLocaleString()}</span>
                    <span>Flags: {session.flags.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Selected Event/Session Details */}
        {(selectedEvent || selectedSession) && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">
              {selectedEvent ? 'Event Details' : 'Session Details'} - {selectedEvent?.details.action || selectedSession?.userName}
            </h4>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {selectedEvent && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Event Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getEventTypeColor(selectedEvent.type)}>
                            {selectedEvent.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Severity:</span>
                          <Badge className={getSeverityColor(selectedEvent.severity)}>
                            {selectedEvent.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedEvent.status)}>
                            {selectedEvent.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Score:</span>
                          <span className="font-medium">{selectedEvent.riskScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">User Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedEvent.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedEvent.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="font-medium">{selectedEvent.userRole}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">{selectedEvent.location.city}, {selectedEvent.location.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSession && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Session Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={getStatusColor(selectedSession.status)}>
                            {selectedSession.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Score:</span>
                          <span className="font-medium">{selectedSession.riskScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Time:</span>
                          <span className="font-medium">{new Date(selectedSession.startTime).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Activity:</span>
                          <span className="font-medium">{new Date(selectedSession.lastActivity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">User Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedSession.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{selectedSession.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="font-medium">{selectedSession.userRole}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">{selectedSession.location.city}, {selectedSession.location.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {selectedEvent && (
                  <div>
                    <h5 className="font-medium mb-2">Event Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Action:</span>
                        <span className="font-medium">{selectedEvent.details.action}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resource:</span>
                        <span className="font-medium">{selectedEvent.details.resource}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IP Address:</span>
                        <span className="font-medium">{selectedEvent.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span className="font-medium">{selectedEvent.device.type} ({selectedEvent.device.os})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Browser:</span>
                        <span className="font-medium">{selectedEvent.device.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tags:</span>
                        <span className="font-medium">{selectedEvent.tags.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSession && (
                  <div>
                    <h5 className="font-medium mb-2">Session Details</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>IP Address:</span>
                        <span className="font-medium">{selectedSession.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span className="font-medium">{selectedSession.device.type} ({selectedSession.device.os})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Browser:</span>
                        <span className="font-medium">{selectedSession.device.browser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Permissions:</span>
                        <span className="font-medium">{selectedSession.permissions.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flags:</span>
                        <span className="font-medium">{selectedSession.flags.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">Available Actions</h5>
                  <div className="flex items-center gap-2">
                    {selectedEvent && (
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
                    {selectedSession && (
                      <>
                        <Button size="sm" variant="outline">
                          <Lock className="h-4 w-4 mr-2" />
                          Terminate Session
                        </Button>
                        <Button size="sm" variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          View User Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Flag Suspicious
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
                Configure Alerts
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
