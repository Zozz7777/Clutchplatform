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
  User, 
  MapPin, 
  Clock, 
  Activity,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Flag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ThreatEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  threatType: 'suspicious_login' | 'unusual_location' | 'privilege_escalation' | 'data_exfiltration' | 'brute_force' | 'anomalous_behavior';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  description: string;
  location: {
    ip: string;
    country: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  timestamp: string;
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  riskScore: number; // 0-100
  indicators: string[];
  actions: {
    id: string;
    type: 'block' | 'monitor' | 'alert' | 'investigate';
    description: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: string;
  }[];
  metadata: {
    deviceInfo: string;
    userAgent: string;
    sessionDuration: number;
    previousLogins: number;
    accountAge: number;
  };
}

interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  frequency: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: number;
  lastDetected: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface IdentityThreatDetectionProps {
  className?: string;
}

export default function IdentityThreatDetection({ className }: IdentityThreatDetectionProps) {
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [threatPatterns, setThreatPatterns] = useState<ThreatPattern[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadThreatData = () => {
      const mockThreatEvents: ThreatEvent[] = [
        {
          id: 'THREAT-001',
          userId: 'user-123',
          userName: 'John Smith',
          userEmail: 'john.smith@company.com',
          threatType: 'suspicious_login',
          severity: 'critical',
          confidence: 95,
          description: 'Login attempt from new location with unusual timing pattern',
          location: {
            ip: '192.168.1.100',
            country: 'Russia',
            city: 'Moscow',
            coordinates: { lat: 55.7558, lng: 37.6176 }
          },
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'investigating',
          riskScore: 87,
          indicators: ['New location', 'Unusual time', 'VPN detected', 'Multiple failed attempts'],
          actions: [
            {
              id: 'act-001',
              type: 'block',
              description: 'Temporarily block account access',
              status: 'completed',
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
            },
            {
              id: 'act-002',
              type: 'alert',
              description: 'Notify security team',
              status: 'completed',
              timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
            }
          ],
          metadata: {
            deviceInfo: 'Unknown device',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            sessionDuration: 0,
            previousLogins: 0,
            accountAge: 30
          }
        },
        {
          id: 'THREAT-002',
          userId: 'user-456',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@company.com',
          threatType: 'privilege_escalation',
          severity: 'high',
          confidence: 82,
          description: 'Attempted to access admin functions without proper authorization',
          location: {
            ip: '10.0.0.50',
            country: 'United States',
            city: 'New York',
            coordinates: { lat: 40.7128, lng: -74.0060 }
          },
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'confirmed',
          riskScore: 75,
          indicators: ['Unauthorized access attempt', 'Role escalation', 'Suspicious API calls'],
          actions: [
            {
              id: 'act-003',
              type: 'monitor',
              description: 'Enhanced monitoring for this user',
              status: 'completed',
              timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString()
            }
          ],
          metadata: {
            deviceInfo: 'MacBook Pro',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            sessionDuration: 120,
            previousLogins: 45,
            accountAge: 180
          }
        },
        {
          id: 'THREAT-003',
          userId: 'user-789',
          userName: 'Mike Chen',
          userEmail: 'mike.chen@company.com',
          threatType: 'unusual_location',
          severity: 'medium',
          confidence: 68,
          description: 'Login from location significantly different from usual patterns',
          location: {
            ip: '203.0.113.42',
            country: 'China',
            city: 'Beijing',
            coordinates: { lat: 39.9042, lng: 116.4074 }
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'detected',
          riskScore: 45,
          indicators: ['Geographic anomaly', 'Time zone difference', 'New IP range'],
          actions: [
            {
              id: 'act-004',
              type: 'investigate',
              description: 'Verify user identity',
              status: 'pending',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ],
          metadata: {
            deviceInfo: 'iPhone 13',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
            sessionDuration: 30,
            previousLogins: 12,
            accountAge: 90
          }
        }
      ];

      const mockThreatPatterns: ThreatPattern[] = [
        {
          id: 'pattern-001',
          name: 'Brute Force Attacks',
          description: 'Multiple failed login attempts from same IP',
          pattern: 'Failed login attempts > 5 within 10 minutes',
          frequency: 23,
          riskLevel: 'high',
          affectedUsers: 8,
          lastDetected: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          trend: 'increasing'
        },
        {
          id: 'pattern-002',
          name: 'Geographic Anomalies',
          description: 'Logins from unusual geographic locations',
          pattern: 'Login from country not in user history',
          frequency: 15,
          riskLevel: 'medium',
          affectedUsers: 12,
          lastDetected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          trend: 'stable'
        },
        {
          id: 'pattern-003',
          name: 'Privilege Escalation',
          description: 'Attempts to access unauthorized resources',
          pattern: 'API calls to admin endpoints without proper role',
          frequency: 7,
          riskLevel: 'critical',
          affectedUsers: 3,
          lastDetected: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          trend: 'decreasing'
        }
      ];

      setThreatEvents(mockThreatEvents);
      setThreatPatterns(mockThreatPatterns);
      setSelectedEvent(mockThreatEvents[0]);
    };

    loadThreatData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new threat events occasionally
      if (Math.random() > 0.8) {
        const newThreat: ThreatEvent = {
          id: `THREAT-${Date.now()}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          userName: 'Unknown User',
          userEmail: 'unknown@example.com',
          threatType: 'suspicious_login',
          severity: 'medium',
          confidence: Math.floor(Math.random() * 40) + 60,
          description: 'New suspicious activity detected',
          location: {
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: 'Unknown',
            city: 'Unknown',
            coordinates: { lat: 0, lng: 0 }
          },
          timestamp: new Date().toISOString(),
          status: 'detected',
          riskScore: Math.floor(Math.random() * 50) + 30,
          indicators: ['New pattern detected'],
          actions: [],
          metadata: {
            deviceInfo: 'Unknown',
            userAgent: 'Unknown',
            sessionDuration: 0,
            previousLogins: 0,
            accountAge: 0
          }
        };
        setThreatEvents(prev => [newThreat, ...prev.slice(0, 9)]);
      }
    }, 30000);

    return () => clearInterval(interval);
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
      case 'detected': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-orange-100 text-orange-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious_login': return <User className="h-4 w-4" />;
      case 'unusual_location': return <MapPin className="h-4 w-4" />;
      case 'privilege_escalation': return <Shield className="h-4 w-4" />;
      case 'data_exfiltration': return <Download className="h-4 w-4" />;
      case 'brute_force': return <Zap className="h-4 w-4" />;
      case 'anomalous_behavior': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleActionUpdate = (eventId: string, actionId: string, newStatus: string) => {
    setThreatEvents(prev => prev.map(event =>
      event.id === eventId
        ? {
            ...event,
            actions: event.actions.map(action =>
              action.id === actionId ? { ...action, status: newStatus as any } : action
            )
          }
        : event
    ));
  };

  const handleStatusUpdate = (eventId: string, newStatus: string) => {
    setThreatEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, status: newStatus as any } : event
    ));
  };

  const filteredEvents = filterSeverity === 'all' 
    ? threatEvents 
    : threatEvents.filter(event => event.severity === filterSeverity);

  const criticalThreats = threatEvents.filter(event => event.severity === 'critical').length;
  const activeThreats = threatEvents.filter(event => event.status !== 'resolved' && event.status !== 'false_positive').length;
  const avgRiskScore = threatEvents.length > 0 
    ? Math.round(threatEvents.reduce((sum, event) => sum + event.riskScore, 0) / threatEvents.length)
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Identity Threat Detection
              </CardTitle>
              <CardDescription>
                AI-powered detection of suspicious user activities and security threats
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
          {/* Threat Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-red-600">{criticalThreats}</div>
              <div className="text-sm text-muted-foreground">Critical Threats</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-orange-600">{activeThreats}</div>
              <div className="text-sm text-muted-foreground">Active Threats</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg-lg">
              <div className="text-2xl font-bold text-purple-600">{avgRiskScore}</div>
              <div className="text-sm text-muted-foreground">Avg Risk Score</div>
            </div>
          </div>

          {/* Threat Patterns */}
          <div>
            <h4 className="font-medium mb-3">Threat Patterns</h4>
            <div className="grid gap-3">
              {threatPatterns.map((pattern) => (
                <div key={pattern.id} className="p-3 border rounded-lg-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">{pattern.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(pattern.trend)}
                      <Badge className={getRiskLevelColor(pattern.riskLevel)}>
                        {pattern.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Frequency: {pattern.frequency} events</span>
                    <span>Affected Users: {pattern.affectedUsers}</span>
                    <span>Last: {new Date(pattern.lastDetected).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Threat Events</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Filter:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Button
                    key={severity}
                    variant={filterSeverity === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity(severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getThreatTypeIcon(event.threatType)}
                      <div>
                        <div className="font-medium">{event.userName}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <span>{event.location.city}, {event.location.country}</span>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Threat Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Event Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">User:</span> {selectedEvent.userName}</div>
                    <div><span className="font-medium">Email:</span> {selectedEvent.userEmail}</div>
                    <div><span className="font-medium">Type:</span> {selectedEvent.threatType.replace('_', ' ')}</div>
                    <div><span className="font-medium">Confidence:</span> {selectedEvent.confidence}%</div>
                    <div><span className="font-medium">Risk Score:</span> {selectedEvent.riskScore}%</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Location Details</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">IP:</span> {selectedEvent.location.ip}</div>
                    <div><span className="font-medium">Location:</span> {selectedEvent.location.city}, {selectedEvent.location.country}</div>
                    <div><span className="font-medium">Device:</span> {selectedEvent.metadata.deviceInfo}</div>
                    <div><span className="font-medium">Session:</span> {selectedEvent.metadata.sessionDuration} minutes</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Indicators</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.indicators.map((indicator, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Actions</h5>
                <div className="space-y-2">
                  {selectedEvent.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{action.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(action.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Block User
                </Button>
                <Button size="sm" variant="outline">
                  <Flag className="h-4 w-4 mr-2" />
                  Mark as False Positive
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
