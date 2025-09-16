'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    const loadActiveUsers = () => {
      const mockUsers: ActiveUser[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@clutch.com',
          status: 'online',
          currentPage: '/dashboard',
          lastActivity: '2 minutes ago',
          role: 'Admin'
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@clutch.com',
          status: 'online',
          currentPage: '/fleet',
          lastActivity: '1 minute ago',
          role: 'Fleet Manager'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily@clutch.com',
          status: 'away',
          currentPage: '/analytics',
          lastActivity: '5 minutes ago',
          role: 'Analyst'
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david@clutch.com',
          status: 'busy',
          currentPage: '/finance',
          lastActivity: '30 seconds ago',
          role: 'Finance Manager'
        }
      ];
      setActiveUsers(mockUsers);
    };

    const loadCollaborationEvents = () => {
      const mockEvents: CollaborationEvent[] = [
        {
          id: '1',
          type: 'comment',
          userId: '2',
          userName: 'Mike Chen',
          message: 'Fleet maintenance scheduled for tomorrow - need approval',
          timestamp: '2 minutes ago',
          page: '/fleet',
          priority: 'high'
        },
        {
          id: '2',
          type: 'status_change',
          userId: '4',
          userName: 'David Kim',
          message: 'Updated budget allocation for Q4',
          timestamp: '5 minutes ago',
          page: '/finance',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'alert',
          userId: 'system',
          userName: 'System',
          message: 'High CPU usage detected on server-03',
          timestamp: '8 minutes ago',
          page: '/monitoring',
          priority: 'critical',
          resolved: false
        },
        {
          id: '4',
          type: 'edit',
          userId: '1',
          userName: 'Sarah Johnson',
          message: 'Modified user permissions for B2B segment',
          timestamp: '12 minutes ago',
          page: '/users',
          priority: 'medium'
        }
      ];
      setCollaborationEvents(mockEvents);
      setUnreadCount(mockEvents.filter(e => !e.resolved && e.priority === 'critical').length);
    };

    loadActiveUsers();
    loadCollaborationEvents();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add new events occasionally
      if (Math.random() > 0.7) {
        const newEvent: CollaborationEvent = {
          id: Date.now().toString(),
          type: 'comment',
          userId: activeUsers[Math.floor(Math.random() * activeUsers.length)]?.id || '1',
          userName: activeUsers[Math.floor(Math.random() * activeUsers.length)]?.name || 'User',
          message: 'New system update available',
          timestamp: 'Just now',
          page: currentPage,
          priority: 'low'
        };
        setCollaborationEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeUsers, currentPage]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [collaborationEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    console.log(`Notifying user ${userId}`);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="relative"
        >
          <Users className="h-4 w-4 mr-2" />
          Team
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
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
              <CardTitle className="text-lg">Live Team</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
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
            Real-time collaboration and team activity
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Active Users */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              Active Now ({activeUsers.filter(u => u.status === 'online').length})
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
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-lg-full border border-white ${getStatusColor(user.status)}`} />
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
              Recent Activity
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {collaborationEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded-lg-lg border text-xs ${
                    event.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <div className={`p-1 rounded-lg ${getPriorityColor(event.priority)} text-white`}>
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
              Quick Comment
            </h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a comment..."
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
