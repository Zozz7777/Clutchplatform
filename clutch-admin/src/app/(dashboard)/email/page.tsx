'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Trash2, 
  Star, 
  Search, 
  Plus, 
  MoreVertical, 
  Reply, 
  Forward, 
  Delete, 
  Archive as ArchiveIcon,
  Star as StarIcon,
  Paperclip,
  Calendar,
  User,
  Clock,
  Filter,
  RefreshCw,
  Settings,
  FolderPlus,
  Users,
  Phone,
  MapPin,
  Building,
  Shield
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowInput } from '@/components/ui/snow-input'
import { useAuthStore } from '@/store'

// Types
interface Email {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  html?: string
  attachments?: EmailAttachment[]
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  folder: string
  threadId: string
  messageId: string
  sentAt: string
  receivedAt: string
  labels: string[]
}

interface EmailAttachment {
  id: string
  filename: string
  contentType: string
  size: number
  url?: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  avatar?: string
}

interface Folder {
  id: string
  name: string
  type: 'system' | 'custom'
  unreadCount: number
  totalCount: number
}

// API Base URL
const API_BASE_URL = 'https://clutch-main-nk7x.onrender.com/api/v1/clutch-email'

// Email Service
class EmailService {
  private userId: string
  private getAuthHeaders: () => HeadersInit

  constructor(userId: string) {
    this.userId = userId
    this.getAuthHeaders = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
  }

  // Account Management
  async getAccountInfo() {
    const response = await fetch(`${API_BASE_URL}/accounts/${this.userId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Email Operations
  async getEmails(folder: string = 'inbox', page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/emails/${this.userId}/${folder}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async getEmail(emailId: string) {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async sendEmail(emailData: {
    from: string
    to: string[]
    subject: string
    body: string
    cc?: string[]
    bcc?: string[]
    attachments?: any[]
  }) {
    const response = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(emailData)
    })
    return response.json()
  }

  async moveEmail(emailId: string, folder: string) {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}/move`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ folder })
    })
    return response.json()
  }

  async deleteEmail(emailId: string) {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Folder Management
  async getFolders() {
    const response = await fetch(`${API_BASE_URL}/folders/${this.userId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async createFolder(name: string) {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId: this.userId, name })
    })
    return response.json()
  }

  // Contact Management
  async getContacts() {
    const response = await fetch(`${API_BASE_URL}/contacts/${this.userId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  async addContact(contact: Omit<Contact, 'id'>) {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId: this.userId, ...contact })
    })
    return response.json()
  }

  // Search
  async searchEmails(query: string, folder?: string) {
    const params = new URLSearchParams({ query })
    if (folder) params.append('folder', folder)
    const response = await fetch(`${API_BASE_URL}/search/${this.userId}?${params}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Admin Stats
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Health Check
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }
}

// Mock Data for Development
const mockEmails: Email[] = [
  {
    id: '1',
    from: 'john.doe@clutch.com',
    to: ['admin@clutch.com'],
    subject: 'Weekly Platform Update',
    body: 'Here is the weekly update on our platform performance and new features...',
    isRead: false,
    isStarred: true,
    isArchived: false,
    folder: 'inbox',
    threadId: 'thread-1',
    messageId: 'msg-1',
    sentAt: '2024-01-15T10:30:00Z',
    receivedAt: '2024-01-15T10:35:00Z',
    labels: ['important', 'work']
  },
  {
    id: '2',
    from: 'support@clutch.com',
    to: ['admin@clutch.com'],
    subject: 'New Customer Registration',
    body: 'A new customer has registered on the platform...',
    isRead: true,
    isStarred: false,
    isArchived: false,
    folder: 'inbox',
    threadId: 'thread-2',
    messageId: 'msg-2',
    sentAt: '2024-01-15T09:15:00Z',
    receivedAt: '2024-01-15T09:20:00Z',
    labels: ['notification']
  },
  {
    id: '3',
    from: 'finance@clutch.com',
    to: ['admin@clutch.com'],
    subject: 'Monthly Revenue Report',
    body: 'Please find attached the monthly revenue report...',
    isRead: true,
    isStarred: false,
    isArchived: false,
    folder: 'inbox',
    threadId: 'thread-3',
    messageId: 'msg-3',
    sentAt: '2024-01-14T16:45:00Z',
    receivedAt: '2024-01-14T16:50:00Z',
    labels: ['finance', 'report']
  }
]

const mockFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', type: 'system', unreadCount: 5, totalCount: 125 },
  { id: 'sent', name: 'Sent', type: 'system', unreadCount: 0, totalCount: 89 },
  { id: 'drafts', name: 'Drafts', type: 'system', unreadCount: 0, totalCount: 3 },
  { id: 'trash', name: 'Trash', type: 'system', unreadCount: 0, totalCount: 12 },
  { id: 'archive', name: 'Archive', type: 'system', unreadCount: 0, totalCount: 45 },
  { id: 'spam', name: 'Spam', type: 'system', unreadCount: 2, totalCount: 8 }
]

const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@clutch.com', phone: '+1-555-0123', company: 'Clutch Inc.', position: 'CTO' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@clutch.com', phone: '+1-555-0124', company: 'Clutch Inc.', position: 'CEO' },
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@clutch.com', phone: '+1-555-0125', company: 'Clutch Inc.', position: 'CFO' }
]

// Email List Item Component
const EmailListItem = ({ 
  email, 
  isSelected, 
  onSelect, 
  onStar, 
  onArchive, 
  onDelete 
}: {
  email: Email
  isSelected: boolean
  onSelect: (email: Email) => void
  onStar: (emailId: string) => void
  onArchive: (emailId: string) => void
  onDelete: (emailId: string) => void
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div 
      className={`flex items-center p-4 border-b border-slate-200 border-slate-200 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
          : 'hover:bg-slate-50 hover:bg-slate-50/50'
      } ${!email.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onClick={() => onSelect(email)}
    >
      <div className="mr-3">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={(e) => e.stopPropagation()}
          className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500"
        />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onStar(email.id)
        }}
        className="mr-3 p-1 hover:bg-slate-100 hover:bg-slate-100 rounded"
      >
        <StarIcon 
          className={`h-4 w-4 ${email.isStarred ? 'text-yellow-500 fill-current' : 'text-slate-400'}`} 
        />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
              {email.from}
            </p>
            <p className={`text-sm truncate ${!email.isRead ? 'font-semibold' : 'text-slate-600 text-slate-600'}`}>
              {email.subject}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              {email.body.substring(0, 100)}...
            </p>
          </div>
          <div className="ml-4 flex items-center space-x-2">
            {email.attachments && email.attachments.length > 0 && (
              <Paperclip className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {formatDate(email.receivedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="ml-2 flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onArchive(email.id)
          }}
          className="p-1 hover:bg-slate-100 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArchiveIcon className="h-4 w-4 text-slate-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(email.id)
          }}
          className="p-1 hover:bg-slate-100 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Delete className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </div>
  )
}

// Compose Email Modal Component
const ComposeEmailModal = ({ 
  isOpen, 
  onClose, 
  onSend,
  replyTo
}: {
  isOpen: boolean
  onClose: () => void
  onSend: (emailData: any) => void
  replyTo?: Email
}) => {
  const [formData, setFormData] = useState({
    to: replyTo ? replyTo.from : '',
    cc: '',
    bcc: '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: replyTo ? `\n\n--- Original Message ---\n${replyTo.body}` : ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailData = {
      from: 'admin@clutch.com', // Current user's email
      to: formData.to.split(',').map(email => email.trim()),
      cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
      bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
      subject: formData.subject,
      body: formData.body
    }
    onSend(emailData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {replyTo ? 'Reply' : 'Compose Email'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To *
                </label>
                <SnowInput
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CC
                </label>
                <SnowInput
                  value={formData.cc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="cc@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  BCC
                </label>
                <SnowInput
                  value={formData.bcc}
                  onChange={(e) => setFormData(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder="bcc@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject *
              </label>
              <SnowInput
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 text-slate-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your message here..."
                className="w-full h-full min-h-[300px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white bg-slate-100 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-slate-200 border-slate-200">
            <div className="flex items-center space-x-2">
              <SnowButton type="button" variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </SnowButton>
              <SnowButton type="button" variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </SnowButton>
            </div>
            <div className="flex items-center space-x-2">
              <SnowButton type="button" variant="outline" onClick={onClose}>
                Cancel
              </SnowButton>
              <SnowButton type="submit" variant="default">
                <Send className="h-4 w-4 mr-2" />
                Send
              </SnowButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Email Page Component
export default function EmailPage() {
  const { user } = useAuthStore()
  const [emails, setEmails] = useState<Email[]>(mockEmails)
  const [folders, setFolders] = useState<Folder[]>(mockFolders)
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailService] = useState(() => new EmailService(user?.id || 'admin'))

  // Load emails when folder changes
  useEffect(() => {
    loadEmails()
  }, [currentFolder])

  const loadEmails = async () => {
    setIsLoading(true)
    try {
      // In production, this would call the actual API
      // const response = await emailService.getEmails(currentFolder)
      // setEmails(response.data || [])
      
      // For now, filter mock data by folder
      const filteredEmails = mockEmails.filter(email => email.folder === currentFolder)
      setEmails(filteredEmails)
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email)
    if (!email.isRead) {
      // Mark as read
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      ))
    }
  }

  const handleEmailStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ))
  }

  const handleEmailArchive = async (emailId: string) => {
    try {
      // await emailService.moveEmail(emailId, 'archive')
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, isArchived: true, folder: 'archive' } : email
      ))
    } catch (error) {
      console.error('Failed to archive email:', error)
    }
  }

  const handleEmailDelete = async (emailId: string) => {
    try {
      // await emailService.deleteEmail(emailId)
      setEmails(prev => prev.filter(email => email.id !== emailId))
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
      }
    } catch (error) {
      console.error('Failed to delete email:', error)
    }
  }

  const handleSendEmail = async (emailData: any) => {
    try {
      // await emailService.sendEmail(emailData)
      console.log('Email sent:', emailData)
      // Refresh emails
      loadEmails()
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadEmails()
      return
    }
    
    try {
      // const response = await emailService.searchEmails(query, currentFolder)
      // setEmails(response.data || [])
      
      // Mock search
      const filteredEmails = mockEmails.filter(email => 
        email.subject.toLowerCase().includes(query.toLowerCase()) ||
        email.from.toLowerCase().includes(query.toLowerCase()) ||
        email.body.toLowerCase().includes(query.toLowerCase())
      )
      setEmails(filteredEmails)
    } catch (error) {
      console.error('Failed to search emails:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-white bg-white border-b border-slate-200 border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Mail className="h-8 w-8 text-red-600 mr-3" />
              Clutch Email
            </h1>
            <div className="flex items-center space-x-2">
              <SnowButton
                variant="outline"
                size="sm"
                onClick={() => setIsComposeOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </SnowButton>
              <SnowButton
                variant="ghost"
                size="sm"
                onClick={loadEmails}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </SnowButton>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <SnowInput
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10 w-80"
              />
            </div>
            <SnowButton variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </SnowButton>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white bg-white border-r border-slate-200 border-slate-200 flex flex-col">
          <div className="flex-1 p-4">
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentFolder === folder.id
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'text-slate-700 text-slate-700 hover:bg-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center">
                    {folder.id === 'inbox' && <Inbox className="h-4 w-4 mr-3" />}
                    {folder.id === 'sent' && <Send className="h-4 w-4 mr-3" />}
                    {folder.id === 'drafts' && <Mail className="h-4 w-4 mr-3" />}
                    {folder.id === 'trash' && <Trash2 className="h-4 w-4 mr-3" />}
                    {folder.id === 'archive' && <Archive className="h-4 w-4 mr-3" />}
                    {folder.id === 'spam' && <Shield className="h-4 w-4 mr-3" />}
                    {folder.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    {folder.unreadCount > 0 && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
                        {folder.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {folder.totalCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 border-slate-200">
              <SnowButton variant="outline" size="sm" className="w-full">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </SnowButton>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </h3>
            <div className="space-y-2">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 hover:bg-slate-50 cursor-pointer">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                      {contact.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-white bg-white">
          <div className="p-4 border-b border-slate-200 border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                {currentFolder}
              </h2>
              <div className="flex items-center space-x-2">
                <SnowButton variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </SnowButton>
                <SnowButton variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </SnowButton>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Mail className="h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No emails found
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Your inbox is empty'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {emails.map((email) => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={selectedEmails.includes(email.id)}
                    onSelect={handleEmailSelect}
                    onStar={handleEmailStar}
                    onArchive={handleEmailArchive}
                    onDelete={handleEmailDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedEmail && (
          <div className="w-1/2 bg-white bg-white border-l border-slate-200 border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200 border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center space-x-2">
                  <SnowButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsComposeOpen(true)}
                  >
                    <Reply className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton variant="ghost" size="sm">
                    <Forward className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmailArchive(selectedEmail.id)}
                  >
                    <ArchiveIcon className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmailDelete(selectedEmail.id)}
                  >
                    <Delete className="h-4 w-4" />
                  </SnowButton>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedEmail.from}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        to me
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      {new Date(selectedEmail.receivedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div 
                  className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html || selectedEmail.body }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
        replyTo={selectedEmail || undefined}
      />
    </div>
  )
}

