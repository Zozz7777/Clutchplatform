"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
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
  Pin
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
  id: string;
  sender: string;
  senderType: "user" | "bot" | "system";
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: string[];
}

interface ChatChannel {
  id: string;
  name: string;
  type: "direct" | "group" | "support";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

export default function ChatPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const loadChatData = async () => {
      try {
        // Mock data for chat channels
        const mockChannels: ChatChannel[] = [
          {
            id: "1",
            name: "Ahmed Hassan",
            type: "direct",
            lastMessage: "Thanks for the help with the fleet management setup",
            lastMessageTime: "2024-01-15T10:30:00Z",
            unreadCount: 2,
            isOnline: true
          },
          {
            id: "2",
            name: "Support Team",
            type: "group",
            lastMessage: "New ticket #1234 has been assigned",
            lastMessageTime: "2024-01-15T09:15:00Z",
            unreadCount: 0,
            isOnline: true
          },
          {
            id: "3",
            name: "Fatma Mohamed",
            type: "direct",
            lastMessage: "Can you help me with the billing issue?",
            lastMessageTime: "2024-01-14T16:45:00Z",
            unreadCount: 1,
            isOnline: false
          },
          {
            id: "4",
            name: "Omar Ali",
            type: "direct",
            lastMessage: "The new features look great!",
            lastMessageTime: "2024-01-14T14:20:00Z",
            unreadCount: 0,
            isOnline: true
          }
        ];

        const mockMessages: ChatMessage[] = [
          {
            id: "1",
            sender: "Ahmed Hassan",
            senderType: "user",
            message: "Hi, I need help setting up fleet tracking for my vehicles",
            timestamp: "2024-01-15T10:00:00Z",
            status: "read"
          },
          {
            id: "2",
            sender: "You",
            senderType: "user",
            message: "I'll help you with that. Let me guide you through the setup process",
            timestamp: "2024-01-15T10:05:00Z",
            status: "read"
          },
          {
            id: "3",
            sender: "Ahmed Hassan",
            senderType: "user",
            message: "That would be great! I have 15 vehicles in my fleet",
            timestamp: "2024-01-15T10:10:00Z",
            status: "read"
          },
          {
            id: "4",
            sender: "You",
            senderType: "user",
            message: "Perfect! I'll create a custom configuration for your fleet size. Do you need GPS tracking for all vehicles?",
            timestamp: "2024-01-15T10:15:00Z",
            status: "read"
          },
          {
            id: "5",
            sender: "Ahmed Hassan",
            senderType: "user",
            message: "Yes, GPS tracking for all vehicles would be ideal. Also, I need real-time monitoring",
            timestamp: "2024-01-15T10:20:00Z",
            status: "read"
          },
          {
            id: "6",
            sender: "You",
            senderType: "user",
            message: "Excellent! I've set up real-time GPS tracking for all 15 vehicles. You can monitor them from the dashboard",
            timestamp: "2024-01-15T10:25:00Z",
            status: "read"
          },
          {
            id: "7",
            sender: "Ahmed Hassan",
            senderType: "user",
            message: "Thanks for the help with the fleet management setup",
            timestamp: "2024-01-15T10:30:00Z",
            status: "delivered"
          }
        ];

        setChannels(mockChannels);
        setMessages(mockMessages);
      } catch (error) {
        console.error("Failed to load chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "You",
        senderType: "user",
        message: newMessage,
        timestamp: new Date().toISOString(),
        status: "sent"
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "bot":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sans">Loading chat...</p>
        </div>
      </div>
    );
  }

  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Chat & Messaging</h1>
          <p className="text-muted-foreground font-sans">
            Real-time communication with users and service providers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-sm">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Channels List */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-card-foreground">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChannel === channel.id ? "bg-muted border-r-2 border-primary" : ""
                  }`}
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-medium">
                          {channel.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {channel.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{channel.name}</p>
                        {channel.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{channel.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(channel.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {selectedChannelData?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{selectedChannelData?.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChannelData?.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
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
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Star className="mr-2 h-4 w-4" />
                      Star Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin Conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.sender === "You" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      {getSenderIcon(message.senderType)}
                    </div>
                    <div className={`rounded-lg p-3 ${message.sender === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center space-x-1 mt-1 ${message.sender === "You" ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs opacity-70">
                          {formatRelativeTime(message.timestamp)}
                        </span>
                        {message.sender === "You" && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                </div>
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat History Search */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-foreground">Search Chat History</CardTitle>
          <CardDescription>Find messages across all conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages, users, or keywords..."
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline" className="shadow-sm">
              <Clock className="mr-2 h-4 w-4" />
              Filter by Date
            </Button>
            <Button variant="outline" className="shadow-sm">
              <Users className="mr-2 h-4 w-4" />
              Filter by User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}