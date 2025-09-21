"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
// import { useTranslations } from "next-intl";
import { productionApi } from "@/lib/production-api";
import { toast } from "sonner";
import { handleDataLoadError } from "@/lib/error-handler";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const t = (key: string, params?: any) => key;
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelData, setNewChannelData] = useState({
    name: "",
    description: "",
    type: "group" as "direct" | "group" | "support",
    isPrivate: false
  });
  // const { hasPermission } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadChatData = async () => {
      if (!isMounted) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Add debouncing to prevent excessive API calls
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          // Load real data from API with error handling
          const [channelsData, messagesData] = await Promise.allSettled([
            productionApi.getChatChannels(),
            productionApi.getChatMessages()
          ]);

          // Handle channels data with proper validation
          let channelsArray: ChatChannel[] = [];
          if (channelsData.status === 'fulfilled' && Array.isArray(channelsData.value)) {
            channelsArray = channelsData.value.map((channel: any) => ({
              id: channel.id || channel._id || `channel_${Date.now()}_${Math.random()}`,
              name: channel.name || 'Unknown Channel',
              type: channel.type || 'group',
              lastMessage: channel.lastMessage || '',
              lastMessageTime: channel.lastMessageTime || channel.updatedAt || new Date().toISOString(),
              unreadCount: channel.unreadCount || 0,
              isOnline: channel.isOnline || false,
              avatar: channel.avatar
            }));
          }
          
          // Handle messages data with proper validation
          let messagesArray: ChatMessage[] = [];
          if (messagesData.status === 'fulfilled' && Array.isArray(messagesData.value)) {
            messagesArray = messagesData.value.map((msg: any) => ({
              id: msg.id || msg._id || `msg_${Date.now()}_${Math.random()}`,
              sender: msg.sender || msg.from || 'Unknown',
              senderType: msg.senderType || 'user',
              message: msg.message || msg.content || msg.text || '',
              timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
              status: msg.status || 'sent',
              attachments: msg.attachments || []
            }));
          }
          
          if (isMounted) {
            setChannels(channelsArray);
            setMessages(messagesArray);
          }
          
          // Log any errors
          if (channelsData.status === 'rejected') {
            handleDataLoadError(channelsData.reason, 'channels');
          }
          if (messagesData.status === 'rejected') {
            handleDataLoadError(messagesData.reason, 'messages');
          }
          
        }, 300); // 300ms debounce
        
      } catch (error) {
        if (!isMounted) return;
        
        handleDataLoadError(error, 'chat_data');
        toast.error(t('chat.failedToLoadChatData') || 'Failed to load chat data');
        // Set empty arrays on error - no mock data fallback
        setChannels([]);
        setMessages([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadChatData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedChannel, t]);

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

  const handleCreateChannel = async () => {
    if (!newChannelData.name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    setIsCreating(true);
    try {
      const result = await productionApi.createChatChannel(newChannelData);
      if (result) {
        toast.success("Chat channel created successfully");
        setIsCreateModalOpen(false);
        setNewChannelData({
          name: "",
          description: "",
          type: "group",
          isPrivate: false
        });
        // Refresh channels list
        const updatedChannels = await productionApi.getChatChannels();
        setChannels(updatedChannels as unknown as ChatChannel[]);
      }
    } catch (error) {
      toast.error("Failed to create chat channel");
    } finally {
      setIsCreating(false);
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
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-2xs">
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.newChat')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Chat Channel</DialogTitle>
                <DialogDescription>
                  Create a new chat channel for your team or project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newChannelData.name}
                    onChange={(e) => setNewChannelData({...newChannelData, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter channel name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newChannelData.description}
                    onChange={(e) => setNewChannelData({...newChannelData, description: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter channel description (optional)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newChannelData.type}
                    onValueChange={(value: "direct" | "group" | "support") => 
                      setNewChannelData({...newChannelData, type: value})
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select channel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      <SelectItem value="group">Group Chat</SelectItem>
                      <SelectItem value="support">Support Channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="private" className="text-right">
                    Private
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newChannelData.isPrivate}
                      onChange={(e) => setNewChannelData({...newChannelData, isPrivate: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="private" className="text-sm text-muted-foreground">
                      Make this channel private
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateChannel}
                  disabled={isCreating || !newChannelData.name.trim()}
                >
                  {isCreating ? "Creating..." : "Create Channel"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              {Array.isArray(channels) && channels.length > 0 ? channels.map((channel) => {
                // Validate channel object before rendering
                if (!channel || typeof channel !== 'object' || !channel.id) {
                  return null;
                }
                
                return (
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
                        {formatRelativeTime(channel.lastMessageTime || new Date())}
                      </p>
                    </div>
                  </div>
                </div>
                );
              }) : (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Create a new chat to get started</p>
                </div>
              )}
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
              {Array.isArray(messages) && messages.length > 0 ? messages.map((message) => {
                // Validate message object before rendering
                if (!message || typeof message !== 'object' || !message.id) {
                  return null;
                }
                
                return (
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
                          {formatRelativeTime(message.timestamp || new Date())}
                        </span>
                        {message.sender === t('chat.you') && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start a conversation by typing a message below</p>
                  </div>
                </div>
              )}
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

export const dynamic = 'force-dynamic';
