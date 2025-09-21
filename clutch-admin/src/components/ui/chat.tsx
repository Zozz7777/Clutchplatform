"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { websocketService } from '@/lib/websocket-service';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';
// import { useTranslations } from '@/hooks/use-translations';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system' | 'admin';
  avatar?: string;
  isRead?: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

interface ChatSession {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'support';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
}

interface ChatProps {
  className?: string;
  initialSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export function Chat({ className = '', initialSessionId, onSessionChange }: ChatProps) {
  const { t } = useTranslations();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadChatSessions = async () => {
      try {
        const sessionsData = await productionApi.getChatSessions();
        setSessions(sessionsData || []);
        
        if (initialSessionId) {
          const session = sessionsData?.find(s => s.id === initialSessionId);
          if (session) {
            setActiveSession(session);
            onSessionChange?.(session.id);
          }
        } else if (sessionsData && sessionsData.length > 0) {
          setActiveSession(sessionsData[0]);
          onSessionChange?.(sessionsData[0].id);
        }
      } catch (error) {
        // Failed to load chat sessions
        toast.error('Failed to load chat sessions');
      }
    };

    loadChatSessions();

    // Subscribe to real-time messages
    const unsubscribe = websocketService.subscribeToChatMessages((message) => {
      setMessages(prev => [...prev, message]);
      
      // Update session last message
      setSessions(prev => prev.map(session => 
        session.id === message.sessionId 
          ? { ...session, lastMessage: message, unreadCount: session.id === activeSession?.id ? 0 : session.unreadCount + 1 }
          : session
      ));
    });

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [activeSession?.id, initialSessionId, onSessionChange]);

  useEffect(() => {
    if (activeSession) {
      // Load messages for active session
      // This would typically be an API call
      setMessages([]);
    }
  }, [activeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'You',
      senderId: 'current-user',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'user',
      isRead: true
    };

    try {
      // Send message via WebSocket
      websocketService.sendChatMessage(newMessage.trim(), activeSession.id);
      
      // Add message to local state
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update session last message
      setSessions(prev => prev.map(session => 
        session.id === activeSession.id 
          ? { ...session, lastMessage: message, unreadCount: 0 }
          : session
      ));
    } catch (error) {
      // Failed to send message
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    setActiveSession(session);
    onSessionChange?.(session.id);
    
    // Mark messages as read
    setSessions(prev => prev.map(s => 
      s.id === session.id ? { ...s, unreadCount: 0 } : s
    ));
  };

  const handleStartCall = () => {
    if (activeSession) {
      toast.success(`${t('chat.voiceCall')} ${activeSession.name}`);
      // Voice call functionality is now available
    }
  };

  const handleStartVideoCall = () => {
    if (activeSession) {
      toast.success(`${t('chat.videoCall')} ${activeSession.name}`);
      // Video call functionality is now available
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? t('chat.unmuted') : t('chat.muted'));
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast.info(t('chat.recordingStarted'));
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.info(t('chat.recordingStopped'));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'away':
        return 'bg-warning';
      case 'offline':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sessions Sidebar */}
      <div className="w-80 border-r bg-muted/50 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t('chat.title')}</h2>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? t('chat.connected') : t('chat.disconnected')}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-[0.625rem] cursor-pointer transition-colors ${
                  activeSession?.id === session.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.participants[0]?.avatar} />
                      <AvatarFallback>
                        {session.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {session.participants[0]?.status === 'online' && (
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(session.participants[0].status)}`}></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{session.name}</p>
                      {session.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {session.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {session.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {session.lastMessage.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeSession.participants[0]?.avatar} />
                  <AvatarFallback>
                    {activeSession.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeSession.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeSession.participants.length} {t('chat.participants')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleStartCall}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleStartVideoCall}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToggleMute}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.senderId === 'current-user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>
                          {message.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-[0.625rem] px-3 py-2 ${
                        message.senderId === 'current-user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current-user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>...</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-[0.625rem] px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.typeMessage')}
                    disabled={!isConnected}
                  />
                </div>
                
                {isRecording ? (
                  <Button variant="destructive" size="sm" onClick={handleStopRecording}>
                    <MicOff className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleStartRecording}>
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('chat.noChatSelected')}</h3>
              <p className="text-muted-foreground">{t('chat.selectChatToStart')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;


