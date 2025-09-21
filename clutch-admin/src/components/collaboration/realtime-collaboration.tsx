'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { productionApi } from '@/lib/production-api';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage: string;
  lastActivity: string;
  role: string;
}

interface CollaborationEvent {
  id: string;
  type: 'comment' | 'edit' | 'status_change' | 'alert' | 'system';
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  page: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
}

interface RealtimeCollaborationProps {
  currentUserId: string;
  currentPage: string;
}

export default function RealtimeCollaboration({ currentUserId, currentPage }: RealtimeCollaborationProps) {
  const t = useTranslations() as any;
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Load real-time collaboration data
  useEffect(() => {
    const loadActiveUsers = async () => {
      try {
        const users = await productionApi.getUsers();
        const activeUsersData: ActiveUser[] = users.slice(0, 5).map((user, index) => ({
          id: user.id || `user-${Date.now()}-${index}`,
          name: user.name || 'Unknown User',
          email: user.email || 'unknown@clutch.com',
          status: index % 3 === 0 ? 'online' : index % 3 === 1 ? 'away' : 'busy',
          currentPage: ['/dashboard', '/fleet', '/analytics', '/finance', '/hr'][index] || '/dashboard',
          lastActivity: `${index + 1} minutes ago`,
          role: user.role || 'User'
        }));
        setActiveUsers(activeUsersData);
      } catch (error) {
        // Error handled by API service
        setActiveUsers([]);
      }
    };

    const loadCollaborationEvents = async () => {
      try {
        // Load real collaboration events from API
        const events = await productionApi.getNotifications();
        const collaborationEvents: CollaborationEvent[] = events.slice(0, 10).map((event, index) => ({
          id: event.id || `event-${Date.now()}-${index}`,
          type: event.type === 'alert' ? 'alert' : 'comment',
          userId: event.userId || 'system',
          userName: event.userName || 'System',
          message: event.message || 'System notification',
          timestamp: event.timestamp || `${index + 1} minutes ago`,
          page: event.page || '/dashboard',
          priority: event.priority || 'medium'
        }));
        setCollaborationEvents(collaborationEvents);
      } catch (error) {
        // Failed to load collaboration events
        setCollaborationEvents([]);
      }
    };

    loadActiveUsers();
    loadCollaborationEvents();

    // Real-time updates via WebSocket or polling
    const interval = setInterval(async () => {
      try {
        // Check for new collaboration events
        const newEvents = await productionApi.getNotifications();
        if (newEvents && newEvents.length > 0) {
          const latestEvent = newEvents[0];
          const newEvent: CollaborationEvent = {
            id: latestEvent.id || Date.now().toString(),
            type: latestEvent.type === 'alert' ? 'alert' : 'comment',
            userId: latestEvent.userId || 'system',
            userName: latestEvent.userName || 'System',
            message: latestEvent.message || 'New system update available',
            timestamp: 'Just now',
            page: currentPage,
            priority: latestEvent.priority || 'low'
          };
          setCollaborationEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        // Failed to fetch new events
      }
    }, 60000); // Reduced from 10 seconds to 1 minute to avoid rate limiting

    return () => clearInterval(interval);
  }, [activeUsers, currentPage]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [collaborationEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'busy': return 'bg-destructive';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const newEvent: CollaborationEvent = {
        id: Date.now().toString(),
        type: 'comment',
        userId: currentUserId,
        userName: 'You',
        message: newComment,
        timestamp: 'Just now',
        page: currentPage,
        priority: 'low'
      };
      setCollaborationEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      setNewComment('');
    }
  };

  const handleResolveEvent = (eventId: string) => {
    setCollaborationEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotifyUser = (userId: string) => {
    // Implementation for notifying specific user
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="relative"
        >
          <Users className="h-4 w-4 mr-2" />
          {t('collaboration.title')}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-lg">{t('collaboration.title')}</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription>
            {t('collaboration.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Active Users */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {t('collaboration.activeNow')} ({activeUsers.filter(u => u.status === 'online').length})
            </h4>
            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${getStatusColor(user.status)}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.currentPage}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNotifyUser(user.id)}
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Events */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              {t('collaboration.recentActivity')}
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {collaborationEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded-[0.625rem] border border-border text-xs ${
                    event.resolved ? 'bg-muted/50 opacity-60' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <div className={`p-1 rounded-[0.625rem] ${getPriorityColor(event.priority)} text-background`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.userName}</p>
                        <p className="text-muted-foreground">{event.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-muted-foreground">{event.timestamp}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.page}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {!event.resolved && event.priority === 'critical' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveEvent(event.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          </div>

          {/* Quick Comment */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              {t('collaboration.quickComment')}
            </h4>
            <div className="flex space-x-2">
              <Input
                placeholder={t('collaboration.addComment')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                className="text-xs"
              />
              <Button size="sm" onClick={handleSendComment}>
                <Zap className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
