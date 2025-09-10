'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Settings, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Paperclip, 
  Smile, 
  User, 
  Users, 
  Clock, 
  Check, 
  CheckCheck, 
  Mic, 
  MicOff,
  Bell,
  BellOff,
  Star,
  Archive,
  Trash2,
  Edit,
  Reply,
  Download,
  Image,
  File,
  Hash,
  AtSign,
  Circle,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { format, isToday, isYesterday } from 'date-fns'

interface ChatUser {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  role: string
  department: string
  lastSeen?: string
}

interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  edited?: boolean
  editedAt?: string
  type: 'text' | 'image' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
  replyTo?: string
  reactions: Array<{ emoji: string; users: string[]; count: number }>
  readBy: Array<{ userId: string; readAt: string }>
}

interface ChatRoom {
  id: string
  name: string
  type: 'direct' | 'group' | 'channel'
  participants: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  description?: string
  isPrivate: boolean
}

interface TypingIndicator {
  userId: string
  userName: string
  roomId: string
}

export default function EmployeeChatPage() {
  const { user } = useAuthStore()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUserList, setShowUserList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setIsLoading(true)
        
        const [roomsResponse, usersResponse] = await Promise.all([
          apiClient.get<ChatRoom[]>('/chat/rooms'),
          apiClient.get<ChatUser[]>('/chat/users')
        ])

        if (roomsResponse.success && roomsResponse.data) {
          const rooms = roomsResponse.data as ChatRoom[]
          setChatRooms(rooms)
          if (rooms.length > 0) {
            setSelectedRoom(rooms[0])
            loadMessages(rooms[0].id)
          }
        } else {
          setChatRooms([])
        }

        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data as ChatUser[])
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('Failed to load chat data:', error)
        toast.error('Failed to load chat data')
        setChatRooms([])
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadChatData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (roomId: string) => {
    try {
      const response = await apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
      if (response.success && response.data) {
        setMessages(response.data as ChatMessage[])
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
      toast.error('Failed to load messages')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      reactions: [],
      readBy: []
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      await apiClient.post(`/chat/rooms/${selectedRoom.id}/messages`, {
        content: tempMessage.content,
        type: tempMessage.type
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-red-500'
    }
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday ' + format(date, 'HH:mm')
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherUserId = room.participants.find(p => p !== user?.id)
      const otherUser = getUserById(otherUserId || '')
      return otherUser?.name || 'Unknown User'
    }
    return room.name
  }

  const filteredRooms = chatRooms.filter(room => 
    getRoomDisplayName(room).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const createNewChat = () => {
    setShowUserList(true)
  }

  const startDirectMessage = (userId: string) => {
    const existingRoom = chatRooms.find(room => 
      room.type === 'direct' && 
      room.participants.includes(userId) && 
      room.participants.includes(user?.id || '')
    )

    if (existingRoom) {
      setSelectedRoom(existingRoom)
      loadMessages(existingRoom.id)
    } else {
      // Create new direct message room
      const newRoom: ChatRoom = {
        id: Date.now().toString(),
        name: getUserById(userId)?.name || 'Direct Message',
        type: 'direct',
        participants: [user?.id || '', userId],
        unreadCount: 0,
        isArchived: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        isPrivate: true
      }
      setChatRooms(prev => [newRoom, ...prev])
      setSelectedRoom(newRoom)
      setMessages([])
    }
    setShowUserList(false)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-slate-900 rounded-lg overflow-hidden">
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Team Chat</h2>
            <div className="flex space-x-2">
              <SnowButton variant="outline" size="sm" onClick={createNewChat}>
                <Plus className="h-4 w-4" />
              </SnowButton>
              <SnowButton variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </SnowButton>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <SnowInput
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map((room) => {
            const displayName = getRoomDisplayName(room)
            const lastMessage = room.lastMessage
            
            return (
              <div
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room)
                  loadMessages(room.id)
                }}
                className={`p-4 cursor-pointer hover:bg-slate-700 transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-slate-700 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      {room.type === 'direct' ? (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                      ) : room.type === 'group' ? (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-slate-300" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <Hash className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                      {room.type === 'direct' && (
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                          getStatusColor(getUserById(room.participants.find(p => p !== user?.id) || '')?.status || 'offline')
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{displayName}</p>
                      {lastMessage && (
                        <p className="text-sm text-slate-400 truncate">
                          {getUserById(lastMessage.senderId)?.name}: {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {lastMessage && (
                      <span className="text-xs text-slate-500">
                        {formatMessageTime(lastMessage.timestamp)}
                      </span>
                    )}
                    {room.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {room.unreadCount}
                      </Badge>
                    )}
                    {room.isPinned && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {selectedRoom.type === 'direct' ? (
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-300" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        {selectedRoom.type === 'group' ? (
                          <Users className="h-5 w-5 text-slate-300" />
                        ) : (
                          <Hash className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{getRoomDisplayName(selectedRoom)}</h3>
                    {selectedRoom.type === 'direct' ? (
                      <p className="text-sm text-slate-400">
                        {getUserById(selectedRoom.participants.find(p => p !== user?.id) || '')?.status || 'offline'}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">
                        {selectedRoom.participants.length} members
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <SnowButton variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </SnowButton>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const sender = getUserById(message.senderId)
                const isOwnMessage = message.senderId === user?.id
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-slate-300" />
                          </div>
                          <span className="text-sm font-medium text-slate-300">{sender?.name}</span>
                          <span className="text-xs text-slate-500">{formatMessageTime(message.timestamp)}</span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white ml-auto'
                            : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        <p>{message.content}</p>
                        {message.reactions.length > 0 && (
                          <div className="flex space-x-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <span
                                key={index}
                                className="bg-slate-600 text-xs px-2 py-1 rounded-full flex items-center space-x-1"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isOwnMessage && (
                        <div className="flex justify-end items-center space-x-1 mt-1">
                          <span className="text-xs text-slate-500">{formatMessageTime(message.timestamp)}</span>
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg">
                    <span className="text-sm">
                      {typingUsers.map(t => t.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex items-center space-x-2">
                <SnowButton variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </SnowButton>
                <div className="flex-1 relative">
                  <SnowInput
                    ref={messageInputRef}
                    placeholder={`Message ${getRoomDisplayName(selectedRoom)}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <SnowButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </div>
                <SnowButton
                  variant="default"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </SnowButton>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      {showUserList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <SnowCard className="w-96 max-h-96">
            <SnowCardHeader>
              <div className="flex items-center justify-between">
                <SnowCardTitle>Start New Chat</SnowCardTitle>
                <SnowButton variant="outline" size="sm" onClick={() => setShowUserList(false)}>
                  <X className="h-4 w-4" />
                </SnowButton>
              </div>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.filter(u => u.id !== user?.id).map((chatUser) => (
                  <div
                    key={chatUser.id}
                    onClick={() => startDirectMessage(chatUser.id)}
                    className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-300" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(chatUser.status)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{chatUser.name}</p>
                      <p className="text-sm text-slate-400">{chatUser.role} â€¢ {chatUser.department}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chatUser.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </div>
      )}
    </div>
  )
}



