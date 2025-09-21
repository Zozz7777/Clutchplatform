"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";
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
  const { t } = useTranslations();
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
        setIsLoading(true);
        
        // Load real data from API
        const [channelsData, messagesData] = await Promise.all([
          productionApi.getChatChannels(),
          productionApi.getChatMessages(selectedChannel)
        ]);

        // Ensure we always have arrays
        const channelsArray = Array.isArray(channelsData) ? channelsData as unknown as ChatChannel[] : [];
        const messagesArray = Array.isArray(messagesData) ? messagesData as unknown as ChatMessage[] : [];
        setChannels(channelsArray);
        setMessages(messagesArray);
        
      } catch (error) {
        // Error handled by API service
        toast.error(t('chat.failedToLoadChatData'));
        // Set empty arrays on error - no mock data fallback
        setChannels([]);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, [selectedChannel]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = {
          receiverId: selectedChannel,
          message: newMessage,
          type: "text"
        };
        
        const result = await productionApi.sendChatMessage(messageData);
        if (result) {
          // Type conversion for API response
          const newMessage = result as unknown as ChatMessage;
          setMessages([...messages, newMessage]);
          setNewMessage("");
        }
      } catch (error) {
        // Error handled by API service
        toast.error(t('chat.failedToSendMessage'));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCircle2 className="h-3 w-3 text-primary" />;
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

  const selectedChannelData = Array.isArray(channels) ? channels.find(c => c?.id === selectedChannel) : undefined;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">{t('chat.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('chat.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="shadow-2xs">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button className="shadow-2xs">
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.newChat')}
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Channels List */}
        <Card className="lg:col-span-1 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-card-foreground">{t('dashboard.conversations')}</CardTitle>
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
              {Array.isArray(channels) ? channels.map((channel) => (
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
                          {channel.name ? channel.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      {channel.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{channel.name || 'Unknown Channel'}</p>
                        {channel.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{channel.lastMessage || 'No messages'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(channel.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              )) : null}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-3 shadow-2xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {selectedChannelData?.name ? selectedChannelData.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{selectedChannelData?.name || 'Unknown Channel'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChannelData?.isOnline ? t('chat.online') : t('chat.offline')}
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
              {Array.isArray(messages) ? messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === t('chat.you') ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.sender === t('chat.you') ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      {getSenderIcon(message.senderType)}
                    </div>
                    <div className={`rounded-[0.625rem] p-3 ${message.sender === t('chat.you') ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{message.message}</p>
                      <div className={`flex items-center space-x-1 mt-1 ${message.sender === t('chat.you') ? "justify-end" : "justify-start"}`}>
                        <span className="text-xs opacity-70">
                          {formatRelativeTime(message.timestamp)}
                        </span>
                        {message.sender === t('chat.you') && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              )) : null}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder={t('dashboard.typeAMessage')}
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
      <Card className="shadow-2xs">
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
            <Button variant="outline" className="shadow-2xs">
              <Clock className="mr-2 h-4 w-4" />
              Filter by Date
            </Button>
            <Button variant="outline" className="shadow-2xs">
              <Users className="mr-2 h-4 w-4" />
              Filter by User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}