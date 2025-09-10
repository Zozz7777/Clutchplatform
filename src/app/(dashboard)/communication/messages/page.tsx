'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Send,
  Inbox,
  Archive,
  Star,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { Message, MessageFormData } from '@/types'
import { formatDate } from '@/lib/utils'

export default function MessagesPage() {
  const { messages, fetchMessages, createMessage, updateMessage, deleteMessage } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [formData, setFormData] = useState<MessageFormData>({
    subject: '',
    content: '',
    recipientId: '',
    recipientEmail: '',
    type: 'internal',
    priority: 'normal',
    attachments: [],
    notes: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter
    const matchesType = typeFilter === 'all' || message.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const messageStats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    sent: messages.filter(m => m.status === 'sent').length,
    draft: messages.filter(m => m.status === 'draft').length,
    archived: messages.filter(m => m.status === 'archived').length,
    internal: messages.filter(m => m.type === 'internal').length,
    external: messages.filter(m => m.type === 'external').length,
    highPriority: messages.filter(m => m.priority === 'high').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-purple-100 text-purple-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'external': return 'bg-green-100 text-green-800'
      case 'notification': return 'bg-yellow-100 text-yellow-800'
      case 'alert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMessage(formData)
      setShowComposeModal(false)
      setFormData({
        subject: '',
        content: '',
        recipientId: '',
        recipientEmail: '',
        type: 'internal',
        priority: 'normal',
        attachments: [],
        notes: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleView = (message: Message) => {
    setSelectedMessage(message)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id)
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    }
  }

  const handleReply = (message: Message) => {
    setFormData({
      subject: `Re: ${message.subject}`,
      content: '',
      recipientId: message.senderId || '',
      recipientEmail: message.senderEmail || '',
      type: message.type,
      priority: 'normal',
      attachments: [],
      notes: ''
    })
    setShowComposeModal(true)
  }

  const handleForward = (message: Message) => {
    setFormData({
      subject: `Fwd: ${message.subject}`,
      content: `\n\n--- Forwarded message ---\n${message.content}`,
      recipientId: '',
      recipientEmail: '',
      type: message.type,
      priority: message.priority,
      attachments: message.attachments || [],
      notes: ''
    })
    setShowComposeModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage internal and external communications</p>
        </div>
        <SnowButton onClick={() => setShowComposeModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Compose Message
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{messageStats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{messageStats.unread}</p>
              </div>
              <Inbox className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
                <p className="text-2xl font-bold text-green-600">{messageStats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{messageStats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-yellow-600">{messageStats.archived}</p>
              </div>
              <Archive className="h-8 w-8 text-yellow-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Internal</p>
                <p className="text-2xl font-bold text-blue-600">{messageStats.internal}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">External</p>
                <p className="text-2xl font-bold text-green-600">{messageStats.external}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{messageStats.highPriority}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <SnowInput
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="notification">Notification</option>
                <option value="alert">Alert</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Messages Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Message Center</SnowCardTitle>
          <SnowCardDescription>
            {filteredMessages.length} messages found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} className={message.status === 'unread' ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {message.subject}
                      </div>
                      {message.content && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {message.content}
                        </div>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Paperclip className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.attachments.length} attachment(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {message.recipientEmail || message.recipientId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    {message.createdAt ? formatDate(message.createdAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(message)}
                      >
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(message)}
                      >
                        <Reply className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleForward(message)}
                      >
                        <Forward className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(message.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SnowCardContent>
      </SnowCard>

      {/* Compose Message Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => {
          setShowComposeModal(false)
          setFormData({
            subject: '',
            content: '',
            recipientId: '',
            recipientEmail: '',
            type: 'internal',
            priority: 'normal',
            attachments: [],
            notes: ''
          })
        }}
        title="Compose Message"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject *
              </label>
              <SnowInput
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipient Email *
              </label>
              <SnowInput
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="notification">Notification</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <SnowButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowComposeModal(false)
                setFormData({
                  subject: '',
                  content: '',
                  recipientId: '',
                  recipientEmail: '',
                  type: 'internal',
                  priority: 'normal',
                  attachments: [],
                  notes: ''
                })
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Message Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedMessage(null)
        }}
        title="Message Details"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedMessage.subject}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      To: {selectedMessage.recipientEmail || selectedMessage.recipientId}
                    </span>
                  </div>
                  {selectedMessage.senderEmail && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        From: {selectedMessage.senderEmail}
                      </span>
                    </div>
                  )}
                  {selectedMessage.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatDate(selectedMessage.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedMessage.type)}`}>
                        {selectedMessage.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                        {selectedMessage.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Message Content</span>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
            </div>
            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">Attachments</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMessage.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md"
                    >
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMessage.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500">Notes</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedMessage.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  handleReply(selectedMessage)
                }}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </SnowButton>
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  handleForward(selectedMessage)
                }}
              >
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </SnowButton>
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedMessage(null)
                }}
              >
                Close
              </SnowButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

