"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";
import { handleDataLoadError } from "@/lib/error-handler";

// Define interfaces for merged functionality
interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  read: boolean;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  startTime: string;
  lastMessage: string;
  messages: number;
  rating?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
}

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

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
  status: 'published' | 'draft' | 'archived';
}

import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Users,
  Clock,
  CheckCircle,
  CheckCircle2,
  User,
  Bot,
  AlertCircle,
  Archive,
  Star,
  Pin,
  MessageCircle,
  Mail,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Reply,
  Trash2,
  Calendar,
  Tag,
  BookOpen,
  Eye,
  Heart,
  Edit
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ChatPage() {
  // Main chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Additional state for merged functionality
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Load all chat-related data
        const [sessionsData, feedbackData, knowledgeData] = await Promise.allSettled([
          productionApi.getChatSessions?.() || Promise.resolve([]),
          productionApi.getFeedback?.() || Promise.resolve([]),
          productionApi.getKnowledgeBase?.() || Promise.resolve([])
        ]);

        // Set data
        if (sessionsData.status === 'fulfilled') {
          setSessions(sessionsData.value || []);
        }
        if (feedbackData.status === 'fulfilled') {
          setFeedback(feedbackData.value || []);
          setFilteredFeedback(feedbackData.value || []);
        }
        if (knowledgeData.status === 'fulfilled') {
          setKnowledgeBase(knowledgeData.value || []);
        }

      } catch (error) {
        handleDataLoadError(error, { component: 'ChatPage', action: 'load_chat_data' });
        toast.error('Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    const feedbackArray = Array.isArray(feedback) ? feedback : [];
    let filtered = feedbackArray.filter(item => item != null);

    if (feedbackSearch) {
      filtered = filtered.filter(item =>
        (item.title || '').toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        (item.user.name || '').toLowerCase().includes(feedbackSearch.toLowerCase())
      );
    }

    if (feedbackFilter !== "all") {
      filtered = filtered.filter(item => item && item.status === feedbackFilter);
    }

    setFilteredFeedback(filtered);
  }, [feedback, feedbackSearch, feedbackFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return "bg-primary/10 text-primary-foreground";
      case "waiting":
      case "in_progress":
        return "bg-secondary/10 text-secondary-foreground";
      case "closed":
        return "bg-muted text-muted-foreground";
      case "new":
        return "bg-success/10 text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-warning/10 text-warning-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "waiting":
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "closed":
        return <Archive className="h-4 w-4 text-muted-foreground" />;
      case "new":
        return <AlertCircle className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        read: false
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update session last message
      setSessions(prev => prev.map(session => 
        session.id === activeSession.id 
          ? { ...session, lastMessage: newMessage, messages: session.messages + 1 }
          : session
      ));

      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading chat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Chat & Support</h1>
          <p className="text-muted-foreground font-sans">
            Manage live chat, customer feedback, and knowledge base
          </p>
        </div>
        {hasPermission("manage_support") && (
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="live-chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Chat Tab */}
        <TabsContent value="live-chat" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chat Sessions List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  {sessions.filter(s => s.status === 'active').length} active chats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeSession?.id === session.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-success rounded-full"></div>
                        <span className="font-medium text-sm">{session.customerName}</span>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {session.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(session.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.messages} messages
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {activeSession ? `Chat with ${activeSession.customerName}` : 'Select a chat session'}
                </CardTitle>
                <CardDescription>
                  {activeSession ? activeSession.customerEmail : 'Choose a customer to start chatting'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSession ? (
                  <>
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'agent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatRelativeTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a chat session to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>
                Manage customer feedback, bug reports, and feature requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {item.description}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{item.user.name}</div>
                            <div className="text-xs text-muted-foreground">{item.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatRelativeTime(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Reply</DropdownMenuItem>
                              <DropdownMenuItem>Change Status</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Manage help articles and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {knowledgeBase.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                          {article.status}
                        </Badge>
                      </div>
                      <CardDescription>{article.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{article.helpful}</span>
                          </div>
                        </div>
                        <span>{formatRelativeTime(article.lastUpdated)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {sessions.filter(s => s.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedback.length}</div>
                <p className="text-xs text-muted-foreground">
                  {feedback.filter(f => f.status === 'new').length} new
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Articles</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{knowledgeBase.length}</div>
                <p className="text-xs text-muted-foreground">
                  {knowledgeBase.filter(k => k.status === 'published').length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5m</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">-15%</span> from last week
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}