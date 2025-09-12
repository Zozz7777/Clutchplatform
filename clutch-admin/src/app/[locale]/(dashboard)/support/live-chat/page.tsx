'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Phone,
  Video,
  MoreHorizontal
} from 'lucide-react'

export default function LiveChatPage() {
  const [activeChat, setActiveChat] = useState(1)
  const [message, setMessage] = useState('')

  const chatSessions = [
    {
      id: 1,
      customer: 'John Smith',
      email: 'john@example.com',
      status: 'active',
      lastMessage: 'I need help with my account',
      timestamp: '2 min ago',
      priority: 'high',
      agent: 'Sarah Johnson'
    },
    {
      id: 2,
      customer: 'Emily Davis',
      email: 'emily@example.com',
      status: 'waiting',
      lastMessage: 'How do I reset my password?',
      timestamp: '5 min ago',
      priority: 'medium',
      agent: null
    },
    {
      id: 3,
      customer: 'Mike Wilson',
      email: 'mike@example.com',
      status: 'resolved',
      lastMessage: 'Thank you for your help!',
      timestamp: '1 hour ago',
      priority: 'low',
      agent: 'Tom Brown'
    }
  ]

  const messages = [
    {
      id: 1,
      sender: 'customer',
      message: 'Hi, I need help with my account settings',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      sender: 'agent',
      message: 'Hello John! I\'d be happy to help you with your account settings. What specific issue are you experiencing?',
      timestamp: '10:31 AM'
    },
    {
      id: 3,
      sender: 'customer',
      message: 'I can\'t seem to update my profile information',
      timestamp: '10:32 AM'
    },
    {
      id: 4,
      sender: 'agent',
      message: 'I can help you with that. Let me check your account permissions. Can you tell me what happens when you try to update your profile?',
      timestamp: '10:33 AM'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'waiting': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Chat Support</h1>
          <p className="text-muted-foreground">
            Manage customer support chat sessions in real-time
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            View All Agents
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
            <CardDescription>
              {chatSessions.filter(s => s.status === 'active').length} active, {chatSessions.filter(s => s.status === 'waiting').length} waiting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {chatSessions.map((session) => (
              <div 
                key={session.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  activeChat === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveChat(session.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{session.customer}</h4>
                  <div className="flex space-x-1">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <Badge className={getPriorityColor(session.priority)}>
                      {session.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {session.lastMessage}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {session.timestamp}
                  </span>
                  {session.agent && (
                    <span className="text-xs text-muted-foreground">
                      Agent: {session.agent}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {chatSessions.find(s => s.id === activeChat)?.customer}
                </CardTitle>
                <CardDescription>
                  {chatSessions.find(s => s.id === activeChat)?.email}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === 'agent' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'agent' ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
            <p className="text-xs text-muted-foreground">
              -0.5m from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +3% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
