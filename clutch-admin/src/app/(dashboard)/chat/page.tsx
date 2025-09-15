"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Send,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Settings,
  Archive,
  Trash2,
  Star,
  StarOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  timestamp: string;
  isRead: boolean;
  isEdited: boolean;
  replyTo?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface Conversation {
  _id: string;
  title: string;
  type: "direct" | "group" | "support" | "internal";
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    isOnline: boolean;
  }>;
  lastMessage: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const token = localStorage.getItem("clutch-admin-token");
        
        // Load conversations
        const conversationsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/chat/conversations", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData.data || conversationsData);
        }

        // Load chat stats
        const statsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/chat/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || statsData);
        } else {
          // Calculate stats from loaded data
          const totalConversations = conversations.length;
          const activeConversations = conversations.filter(c => !c.isArchived).length;
          const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

          setStats({
            totalConversations,
            activeConversations,
            unreadMessages,
            averageResponseTime: 2.5, // minutes
            customerSatisfaction: 4.7, // out of 5
          });
        }
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/chat/conversations/${conversationId}/messages`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      const response = await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/chat/conversations/${selectedConversation}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          type: "text",
        }),
      });
      
      if (response.ok) {
        setNewMessage("");
        // Reload messages
        loadMessages(selectedConversation);
        // Update conversation list
        const conversationsResponse = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/chat/conversations", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData.data || conversationsData);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || conversation.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "direct":
        return "default";
      case "group":
        return "info";
      case "support":
        return "warning";
      case "internal":
        return "success";
      default:
        return "default";
    }
  };

  const getMessageStatusIcon = (message: ChatMessage) => {
    if (message.senderId === user?.id) {
      if (message.isRead) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else {
        return <Check className="h-3 w-3 text-muted-foreground" />;
      }
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat & Messaging</h1>
          <p className="text-muted-foreground">
            Real-time communication with customers and team members
          </p>
        </div>
        {hasPermission("send_messages") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeConversations : conversations.filter(c => !c.isArchived).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? stats.totalConversations : conversations.length} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.unreadMessages : conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.averageResponseTime : 2.5}m
            </div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.customerSatisfaction : 4.7}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Customer rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              Select a conversation to start chatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="direct">Direct</option>
                  <option value="group">Group</option>
                  <option value="support">Support</option>
                  <option value="internal">Internal</option>
                </select>
              </div>

              {/* Conversations */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation._id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedConversation(conversation._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {conversation.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{conversation.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <Badge variant={getTypeColor(conversation.type) as any} className="text-xs">
                          {conversation.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(conversation.lastMessage.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {conversations.find(c => c._id === selectedConversation)?.title}
                    </CardTitle>
                    <CardDescription>
                      {conversations.find(c => c._id === selectedConversation)?.participants.length} participants
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4" />
                          Pin Chat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}>
                        {message.senderId !== user?.id && (
                          <p className="text-xs font-medium mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {formatDate(message.timestamp)}
                          </p>
                          {getMessageStatusIcon(message)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
