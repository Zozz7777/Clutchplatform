"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Bell,
  Mail,
  Phone,
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Settings,
  BarChart3,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { productionApi, type Notification } from "@/lib/production-api";
import { toast } from "@/lib/toast";

interface CommunicationNotification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  channel: "push" | "email" | "sms" | "in_app";
  status: "draft" | "scheduled" | "sent" | "failed";
  targetAudience: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

interface ChatChannel {
  _id: string;
  name: string;
  type: "support" | "internal" | "customer" | "group";
  participants: number;
  unreadMessages: number;
  lastMessage: {
    content: string;
    sender: string;
    timestamp: string;
  };
  status: "active" | "inactive" | "archived";
}

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  responseTime: number;
}

export default function CommunicationPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<CommunicationNotification[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunicationData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API with proper error handling
        const [notificationsData, channelsData, ticketsData] = await Promise.allSettled([
          productionApi.getNotifications(),
          productionApi.getChatChannels(),
          productionApi.getTickets()
        ]);

        // Handle notifications data
        if (notificationsData.status === 'fulfilled') {
          const notifications = notificationsData.value || [];
          // Ensure notifications is an array and convert to communication format
          const communicationNotifications: CommunicationNotification[] = Array.isArray(notifications) 
            ? notifications.map((notification: any) => ({
                _id: notification.id || notification._id || `notification_${Date.now()}`,
                title: notification.title || 'Untitled Notification',
                message: notification.message || 'No message',
                type: notification.type || 'info',
                channel: "in_app" as const,
                status: "sent" as const,
                targetAudience: t('communication.allUsers'),
                sentAt: notification.timestamp || notification.sentAt || new Date().toISOString(),
                deliveryRate: 95,
                openRate: 75,
                clickRate: 25,
                createdAt: notification.timestamp || notification.createdAt || new Date().toISOString()
              }))
            : [];
          setNotifications(communicationNotifications);
        } else {
          console.warn('Failed to load notifications:', notificationsData.reason);
          setNotifications([]);
        }

        // Handle channels data
        if (channelsData.status === 'fulfilled') {
          const channels = channelsData.value || [];
          setChannels(Array.isArray(channels) ? channels as unknown as ChatChannel[] : []);
        } else {
          console.warn('Failed to load chat channels:', channelsData.reason);
          setChannels([]);
        }

        // Handle tickets data
        if (ticketsData.status === 'fulfilled') {
          const tickets = ticketsData.value || [];
          setTickets(Array.isArray(tickets) ? tickets as unknown as SupportTicket[] : []);
        } else {
          console.warn('Failed to load tickets:', ticketsData.reason);
          setTickets([]);
        }
        
        // Only show error toast if all requests failed
        if (notificationsData.status === 'rejected' && channelsData.status === 'rejected' && ticketsData.status === 'rejected') {
          toast.error(t('communication.failedToLoadCommunicationData'));
        }
        
      } catch (error) {
        console.error('Unexpected error loading communication data:', error);
        // Set empty arrays on error
        setNotifications([]);
        setChannels([]);
        setTickets([]);
        toast.error(t('communication.failedToLoadCommunicationData'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunicationData();
  }, [t]);


  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-secondary/10 text-secondary-foreground";
      case "warning":
        return "bg-secondary/10 text-secondary-foreground";
      case "error":
        return "bg-destructive/10 text-destructive-foreground";
      case "success":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-primary/10 text-primary-foreground";
      case "scheduled":
        return "bg-secondary/10 text-secondary-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      case "failed":
        return "bg-destructive/10 text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive-foreground";
      case "high":
        return "bg-secondary/10 text-secondary-foreground";
      case "medium":
        return "bg-secondary/10 text-secondary-foreground";
      case "low":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "support":
        return <MessageSquare className="h-4 w-4" />;
      case "internal":
        return <Users className="h-4 w-4" />;
      case "customer":
        return <Globe className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: "notifications", label: t('communication.notifications'), icon: Bell },
    { id: "chat", label: t('communication.chatChannels'), icon: MessageSquare },
    { id: "tickets", label: t('communication.supportTickets'), icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('communication.title')}</h1>
          <p className="text-muted-foreground">
            {t('communication.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Notification
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(channels || []).filter(c => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {(channels || []).reduce((sum, c) => sum + (c.unreadMessages || 0), 0)} unread messages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(tickets || []).filter(t => t.status === "open" || t.status === "in_progress").length}</div>
            <p className="text-xs text-muted-foreground">
              Avg response time: 2.3 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          {(notifications || []).map((notification) => (
            <Card key={notification._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{notification.title}</h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{notification.message}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        {notification.channel === "push" && <Smartphone className="h-4 w-4" />}
                        {notification.channel === "email" && <Mail className="h-4 w-4" />}
                        {notification.channel === "sms" && <Phone className="h-4 w-4" />}
                        {notification.channel === "in_app" && <Monitor className="h-4 w-4" />}
                        <span className="capitalize">{notification.channel}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{notification.targetAudience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {notification.sentAt 
                            ? new Date(notification.sentAt).toLocaleDateString()
                            : notification.scheduledAt 
                            ? `Scheduled: ${new Date(notification.scheduledAt).toLocaleDateString()}`
                            : "Draft"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-sm font-medium">{notification.deliveryRate}%</div>
                      <div className="text-xs text-muted-foreground">Delivery</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{notification.openRate}%</div>
                      <div className="text-xs text-muted-foreground">Open Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{notification.clickRate}%</div>
                      <div className="text-xs text-muted-foreground">Click Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "chat" && (
        <div className="space-y-4">
          {(channels || []).map((channel) => (
            <Card key={channel._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(channel.type)}
                      <h3 className="text-lg font-semibold">{channel.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {channel.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{channel.participants} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(channel.lastMessage.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {channel.unreadMessages > 0 && (
                      <Badge className="bg-destructive/10 text-destructive-foreground">
                        {channel.unreadMessages} unread
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium">{channel.lastMessage.sender}</div>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {channel.lastMessage.content}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="space-y-4">
          {(tickets || []).map((ticket) => (
            <Card key={ticket._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.ticketNumber}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <h4 className="font-medium mb-2">{ticket.subject}</h4>
                    <p className="text-muted-foreground mb-4">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{ticket.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{ticket.customer.email}</span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Assigned to: {ticket.assignedTo}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {ticket.responseTime > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium">{ticket.responseTime}h</div>
                        <div className="text-xs text-muted-foreground">Response Time</div>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
