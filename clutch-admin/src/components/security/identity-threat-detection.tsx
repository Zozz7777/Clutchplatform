'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  Clock, 
  User, 
  Activity,
  Bell,
  BellOff,
  Play,
  Pause,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface ThreatEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  location: {
    ip: string;
    country: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  timestamp: string;
  status: 'investigating' | 'contained' | 'resolved' | 'false_positive';
  riskScore: number;
  indicators: string[];
  actions: Array<{
    id: string;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp: string;
  }>;
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  frequency: number;
  lastDetected: string;
  indicators: string[];
  affectedUsers: string[];
  mitigationActions: string[];
  riskScore: number;
}

export default function IdentityThreatDetection() {
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [threatPatterns, setThreatPatterns] = useState<ThreatPattern[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const loadThreatData = async () => {
      try {
        setIsLoading(true);
        
        // Load threat events
        const eventsResponse = await fetch('/api/v1/security/threat-events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setThreatEvents(eventsData.data || []);
          if (eventsData.data && eventsData.data.length > 0) {
            setSelectedEvent(eventsData.data[0]);
          }
        }
        
        // Load threat patterns
        const patternsResponse = await fetch('/api/v1/security/threat-patterns');
        if (patternsResponse.ok) {
          const patternsData = await patternsResponse.json();
          setThreatPatterns(patternsData.data || []);
        }
      } catch (error) {
        console.error('Failed to load threat data:', error);
        setThreatEvents([]);
        setThreatPatterns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadThreatData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'contained': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTakeAction = async (eventId: string, actionType: string) => {
    try {
      const response = await fetch(`/api/v1/security/threat-events/${eventId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });
      
      if (response.ok) {
        // Refresh threat events
        const eventsResponse = await fetch('/api/v1/security/threat-events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setThreatEvents(eventsData.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to take action:', error);
    }
  };

  const filteredEvents = threatEvents.filter(event => 
    filterSeverity === 'all' || event.severity === filterSeverity
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading threat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Identity Threat Detection</h1>
          <p className="text-gray-600 mt-1">Monitor and respond to identity-based security threats</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center space-x-2"
          >
            {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isMonitoring ? 'Pause' : 'Resume'} Monitoring</span>
          </Button>
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="flex items-center space-x-2"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span>Notifications</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">
                  {threatEvents.filter(e => e.status === 'investigating').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {threatEvents.filter(e => e.severity === 'critical').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {threatEvents.filter(e => e.status === 'resolved').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Threat Patterns</p>
                <p className="text-2xl font-bold text-blue-600">{threatPatterns.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Threat Events</TabsTrigger>
          <TabsTrigger value="patterns">Threat Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Events List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Threat Events</h3>
                    <p className="text-gray-600">No security threats detected at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">{event.userName}</h3>
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location.city}, {event.location.country}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {event.userEmail}
                          </span>
                        </div>
                        <span className="font-medium">Risk: {event.riskScore}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Event Details */}
            <div>
              {selectedEvent ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Threat Details</span>
                      <Badge className={getSeverityColor(selectedEvent.severity)}>
                        {selectedEvent.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">User:</span>
                          <span className="font-medium">{selectedEvent.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedEvent.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Threat Type:</span>
                          <span className="font-medium">{selectedEvent.threatType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium">{selectedEvent.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Score:</span>
                          <span className="font-medium">{selectedEvent.riskScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">IP Address:</span>
                          <span className="font-medium">{selectedEvent.location.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">
                            {selectedEvent.location.city}, {selectedEvent.location.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.indicators.map((indicator, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="space-y-2">
                        {selectedEvent.actions.map((action) => (
                          <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{action.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(action.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(action.status)}>
                              {action.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleTakeAction(selectedEvent.id, 'block')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Block User
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTakeAction(selectedEvent.id, 'investigate')}
                      >
                        Investigate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTakeAction(selectedEvent.id, 'resolve')}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Threat Event</h3>
                    <p className="text-gray-600">Choose a threat event from the list to view details.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threatPatterns.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-6 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Threat Patterns</h3>
                  <p className="text-gray-600">No threat patterns detected at this time.</p>
                </CardContent>
              </Card>
            ) : (
              threatPatterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm">{pattern.name}</span>
                      <Badge className={getSeverityColor(pattern.severity)}>
                        {pattern.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium">{pattern.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency:</span>
                        <span className="font-medium">{pattern.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Risk Score:</span>
                        <span className="font-medium">{pattern.riskScore}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Indicators:</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.indicators.slice(0, 3).map((indicator, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                        {pattern.indicators.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pattern.indicators.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-gray-500">
                        Last detected: {new Date(pattern.lastDetected).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
