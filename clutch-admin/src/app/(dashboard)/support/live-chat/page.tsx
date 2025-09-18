'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  Send,
  Phone,
  Mail,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { productionApi } from '@/lib/production-api';

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'active' | 'waiting' | 'resolved';
  startTime: string;
  lastMessage: string;
  messages: number;
  rating?: number;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent';
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export default function LiveChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [webSocketConnection, setWebSocketConnection] = useState<WebSocket | null>(null);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      // Mock data since we don't have a specific chat sessions endpoint
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          status: 'active',
          startTime: '2024-01-15T10:30:00Z',
          lastMessage: 'I need help with my order',
          messages: 12
        },
        {
          id: '2',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@example.com',
          status: 'waiting',
          startTime: '2024-01-15T11:15:00Z',
          lastMessage: 'How do I track my shipment?',
          messages: 8
        },
        {
          id: '3',
          customerName: 'Mike Wilson',
          customerEmail: 'mike@example.com',
          status: 'resolved',
          startTime: '2024-01-15T09:45:00Z',
          lastMessage: 'Thank you for your help!',
          messages: 15,
          rating: 5
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      // Fetch messages from API
      const messages = await productionApi.getChatMessages(sessionId);
      setMessages(messages);
      
      // Set up WebSocket connection for real-time updates
      const wsUrl = `wss://clutch-main-nk7x.onrender.com/ws/chat/${sessionId}?token=${localStorage.getItem('token')}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected for chat session:', sessionId);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            setMessages(prev => [...prev, data.message]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected for chat session:', sessionId);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      // Store WebSocket connection for cleanup
      setWebSocketConnection(ws);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to empty messages if API fails
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    try {
      const messageData = {
        sessionId: activeSession.id,
        message: newMessage,
        type: 'text'
      };

      // Send message via API
      await apiService.sendMessage(messageData);
      
      // Add message to local state
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'waiting':
        return <Badge variant="default" className="bg-yellow-500">Waiting</Badge>;
      case 'resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading chat sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Live Chat Support</h1>
          <p className="text-muted-foreground font-sans">
            Manage customer support chat sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchChatSessions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Sessions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Active Sessions</CardTitle>
              <CardDescription className="font-sans">
                {sessions.length} total sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    activeSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setActiveSession(session);
                    fetchMessages(session.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(session.status)}
                      <h3 className="font-medium font-sans">{session.customerName}</h3>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-sm text-muted-foreground font-sans mb-2">
                    {session.customerEmail}
                  </p>
                  <p className="text-sm font-sans truncate">
                    {session.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground font-sans">
                      {new Date(session.startTime).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">
                      {session.messages} messages
                    </span>
                  </div>
                  {session.rating && (
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-sans ml-1">{session.rating}/5</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {activeSession ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-sans">{activeSession.customerName}</CardTitle>
                    <CardDescription className="font-sans">
                      {activeSession.customerEmail}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activeSession.status)}
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'agent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-sans">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium font-sans mb-2">No chat selected</h3>
                <p className="text-muted-foreground font-sans">
                  Select a chat session from the list to start responding
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Active Chats</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {sessions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {sessions.filter(s => s.status === 'waiting').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">
              {sessions.filter(s => s.status === 'resolved').length}
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
              {sessions.filter(s => s.rating).length > 0 
                ? (sessions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.filter(s => s.rating).length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
