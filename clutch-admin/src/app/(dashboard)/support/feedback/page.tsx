'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Filter,
  Search,
  Reply,
  Archive,
  Trash2,
  User,
  Calendar,
  Tag
} from 'lucide-react';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'general' | 'complaint';
  title: string;
  description: string;
  user: {
    name: string;
    email: string;
  };
  rating?: number;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  responses: number;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockFeedback: Feedback[] = [
    {
      id: '1',
      type: 'bug',
      title: 'Login button not working on mobile',
      description: 'The login button on the mobile app is not responding when tapped. This happens on both iOS and Android devices.',
      user: { name: 'John Smith', email: 'john@example.com' },
      rating: 2,
      status: 'new',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      tags: ['mobile', 'login', 'bug'],
      responses: 0
    },
    {
      id: '2',
      type: 'feature',
      title: 'Add dark mode support',
      description: 'It would be great to have a dark mode option for the dashboard. Many users prefer dark themes.',
      user: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      rating: 5,
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2024-01-14T15:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      tags: ['ui', 'theme', 'feature'],
      responses: 2
    },
    {
      id: '3',
      type: 'general',
      title: 'Great service!',
      description: 'I\'ve been using Clutch for 6 months now and it has significantly improved our fleet management. Keep up the great work!',
      user: { name: 'Mike Wilson', email: 'mike@example.com' },
      rating: 5,
      status: 'resolved',
      priority: 'low',
      createdAt: '2024-01-13T11:45:00Z',
      updatedAt: '2024-01-14T16:30:00Z',
      tags: ['praise', 'general'],
      responses: 1
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFeedback(mockFeedback);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bug':
        return <Badge variant="destructive">Bug</Badge>;
      case 'feature':
        return <Badge variant="default" className="bg-blue-500">Feature</Badge>;
      case 'general':
        return <Badge variant="secondary">General</Badge>;
      case 'complaint':
        return <Badge variant="default" className="bg-red-500">Complaint</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-green-500">New</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-blue-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Customer Feedback</h1>
          <p className="text-muted-foreground font-sans">
            Manage customer feedback and feature requests
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="general">General</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeBadge(item.type)}
                          {getStatusBadge(item.status)}
                          {getPriorityBadge(item.priority)}
                        </div>
                        <CardTitle className="font-sans">{item.title}</CardTitle>
                        <CardDescription className="font-sans mt-2">
                          {item.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span className="font-sans">{item.user.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-sans">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-sans">{item.responses} responses</span>
                        </div>
                      </div>
                      {item.rating && (
                        <div className="flex items-center space-x-1">
                          {renderStars(item.rating)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{feedback.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">New</CardTitle>
                <Badge variant="default" className="bg-green-500">New</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {feedback.filter(f => f.status === 'new').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {feedback.filter(f => f.rating).length > 0 
                    ? (feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
                    : '0.0'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Feature Requests</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {feedback.filter(f => f.type === 'feature').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Feedback by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['bug', 'feature', 'general', 'complaint'].map(type => {
                    const count = feedback.filter(f => f.type === type).length;
                    const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-sans capitalize">{type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-sans w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Feedback by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['new', 'in_progress', 'resolved', 'closed'].map(status => {
                    const count = feedback.filter(f => f.status === status).length;
                    const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-sans capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-sans w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
