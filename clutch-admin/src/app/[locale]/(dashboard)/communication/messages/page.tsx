'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Search, Plus, Mail, Phone, Clock, User } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/communication/messages')
      if (response.success && response.data) {
        setMessages(response.data as any[])
      } else {
        setMessages([])
        if (!response.success) {
          toast.error('Failed to load messages')
          setError('Failed to load messages')
        }
      }
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      setError('Failed to load messages')
      setMessages([])
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    try {
      const response = await apiClient.post('/communication/messages', {
        recipient: selectedMessage?.sender,
        subject: 'Re: ' + selectedMessage?.subject,
        content: 'Message content'
      })
      if (response.success) {
        toast.success('Message sent successfully')
        loadMessages()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const filteredMessages = messages.filter(message =>
    message.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading messages: {error}</p>
          <SnowButton onClick={loadMessages}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">Messages</h1>
          <p className="text-slate-600 text-slate-600">
            Manage communication and messaging across the platform
          </p>
        </div>
        <SnowButton>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </SnowButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Messages</SnowCardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+12% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Unread</SnowCardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.unread).length}</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-red-600">+8% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Sent Today</SnowCardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{messages.filter(m => m.sentToday).length}</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+15% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Response Rate</SnowCardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+2% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <SnowCard className="lg:col-span-1">
          <SnowCardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-slate-400" />
              <SnowInput 
                placeholder="Search messages..." 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-muted-foreground">No messages found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No messages available'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      message.unread 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : 'hover:bg-slate-50 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{message.sender || 'Unknown'}</h4>
                        <p className="text-sm font-medium text-slate-900 text-slate-900">
                          {message.subject || 'No subject'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{message.preview || 'No preview'}</p>
                      </div>
                      <div className="text-xs text-slate-400 ml-2">
                        {message.time || 'Unknown time'}
                      </div>
                    </div>
                    {message.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard className="lg:col-span-2">
          <SnowCardHeader>
            <SnowCardTitle>{selectedMessage?.subject || 'Select a message'}</SnowCardTitle>
            <SnowCardDescription>
              {selectedMessage ? `From: ${selectedMessage.sender} â€¢ ${selectedMessage.time}` : 'No message selected'}
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="bg-slate-50 bg-slate-100 p-4 rounded-lg">
                  <p className="text-sm text-slate-700 text-slate-700">
                    {selectedMessage.content || 'No content available'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Textarea 
                    placeholder="Type your reply..." 
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <SnowButton onClick={handleSendMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </SnowButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No message selected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a message from the list to view its content
                </p>
              </div>
            )}
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}



