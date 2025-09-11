/**
 * User Feedback Collection System
 * Comprehensive feedback collection and analysis
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'

export interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  category: string
  tags: string[]
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  metadata: {
    userAgent: string
    url: string
    timestamp: Date
    sessionId: string
    deviceType: 'mobile' | 'tablet' | 'desktop'
    browser: string
    os: string
  }
  attachments?: {
    type: 'screenshot' | 'video' | 'file'
    url: string
    name: string
    size: number
  }[]
  votes: number
  comments: FeedbackComment[]
}

export interface FeedbackComment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  isInternal: boolean
}

export interface FeedbackForm {
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  tags: string[]
  attachments?: File[]
}

export interface FeedbackAnalytics {
  totalFeedback: number
  feedbackByType: Record<string, number>
  feedbackByPriority: Record<string, number>
  feedbackByStatus: Record<string, number>
  feedbackByCategory: Record<string, number>
  averageResponseTime: number
  userSatisfaction: number
  topIssues: Array<{
    title: string
    count: number
    priority: string
  }>
}

export class UserFeedbackManager {
  private static instance: UserFeedbackManager
  private feedback: FeedbackItem[] = []
  private listeners: Array<(feedback: FeedbackItem[]) => void> = []

  static getInstance(): UserFeedbackManager {
    if (!UserFeedbackManager.instance) {
      UserFeedbackManager.instance = new UserFeedbackManager()
    }
    return UserFeedbackManager.instance
  }

  constructor() {
    this.loadFeedback()
    this.setupAutoSave()
  }

  private loadFeedback() {
    try {
      const stored = localStorage.getItem('userFeedback')
      if (stored) {
        this.feedback = JSON.parse(stored).map((item: any) => ({
          ...item,
          metadata: {
            ...item.metadata,
            timestamp: new Date(item.metadata.timestamp)
          },
          comments: item.comments?.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          })) || []
        }))
      }
    } catch (error) {
      console.error('Failed to load feedback:', error)
      this.feedback = []
    }
  }

  private saveFeedback() {
    try {
      localStorage.setItem('userFeedback', JSON.stringify(this.feedback))
    } catch (error) {
      console.error('Failed to save feedback:', error)
    }
  }

  private setupAutoSave() {
    setInterval(() => {
      this.saveFeedback()
    }, 30000) // Auto-save every 30 seconds
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.feedback]))
  }

  // Submit new feedback
  async submitFeedback(form: FeedbackForm, user: any): Promise<FeedbackItem> {
    const feedback: FeedbackItem = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: form.type,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: 'open',
      category: form.category,
      tags: form.tags,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date(),
        sessionId: this.getSessionId(),
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS()
      },
      attachments: form.attachments?.map(file => ({
        type: this.getFileType(file.type),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      })),
      votes: 0,
      comments: []
    }

    this.feedback.unshift(feedback)
    this.saveFeedback()
    this.notifyListeners()

    // Send to server
    try {
      await this.sendToServer(feedback)
    } catch (error) {
      console.error('Failed to send feedback to server:', error)
    }

    return feedback
  }

  // Get all feedback
  getFeedback(): FeedbackItem[] {
    return [...this.feedback]
  }

  // Get feedback by ID
  getFeedbackById(id: string): FeedbackItem | undefined {
    return this.feedback.find(item => item.id === id)
  }

  // Get feedback by user
  getFeedbackByUser(userId: string): FeedbackItem[] {
    return this.feedback.filter(item => item.user.id === userId)
  }

  // Get feedback by type
  getFeedbackByType(type: string): FeedbackItem[] {
    return this.feedback.filter(item => item.type === type)
  }

  // Get feedback by status
  getFeedbackByStatus(status: string): FeedbackItem[] {
    return this.feedback.filter(item => item.status === status)
  }

  // Update feedback status
  updateFeedbackStatus(id: string, status: string): boolean {
    const feedback = this.feedback.find(item => item.id === id)
    if (feedback) {
      feedback.status = status as any
      this.saveFeedback()
      this.notifyListeners()
      return true
    }
    return false
  }

  // Add comment to feedback
  addComment(feedbackId: string, comment: Omit<FeedbackComment, 'id' | 'timestamp'>): boolean {
    const feedback = this.feedback.find(item => item.id === feedbackId)
    if (feedback) {
      const newComment: FeedbackComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...comment
      }
      feedback.comments.push(newComment)
      this.saveFeedback()
      this.notifyListeners()
      return true
    }
    return false
  }

  // Vote on feedback
  voteOnFeedback(feedbackId: string, userId: string): boolean {
    const feedback = this.feedback.find(item => item.id === feedbackId)
    if (feedback) {
      feedback.votes++
      this.saveFeedback()
      this.notifyListeners()
      return true
    }
    return false
  }

  // Get feedback analytics
  getAnalytics(): FeedbackAnalytics {
    const totalFeedback = this.feedback.length
    const feedbackByType = this.feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const feedbackByPriority = this.feedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const feedbackByStatus = this.feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const feedbackByCategory = this.feedback.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topIssues = Object.entries(feedbackByType)
      .map(([type, count]) => ({
        title: type,
        count,
        priority: this.getAveragePriority(type)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalFeedback,
      feedbackByType,
      feedbackByPriority,
      feedbackByStatus,
      feedbackByCategory,
      averageResponseTime: this.getAverageResponseTime(),
      userSatisfaction: this.getUserSatisfaction(),
      topIssues
    }
  }

  // Subscribe to feedback changes
  subscribe(listener: (feedback: FeedbackItem[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('feedbackSessionId')
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('feedbackSessionId', sessionId)
    }
    return sessionId
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getFileType(mimeType: string): 'screenshot' | 'video' | 'file' {
    if (mimeType.startsWith('image/')) return 'screenshot'
    if (mimeType.startsWith('video/')) return 'video'
    return 'file'
  }

  private getAveragePriority(type: string): string {
    const items = this.feedback.filter(item => item.type === type)
    if (items.length === 0) return 'low'
    
    const priorityValues = { low: 1, medium: 2, high: 3, critical: 4 }
    const average = items.reduce((sum, item) => sum + priorityValues[item.priority], 0) / items.length
    
    if (average >= 3.5) return 'critical'
    if (average >= 2.5) return 'high'
    if (average >= 1.5) return 'medium'
    return 'low'
  }

  private getAverageResponseTime(): number {
    const resolvedItems = this.feedback.filter(item => item.status === 'resolved')
    if (resolvedItems.length === 0) return 0
    
    const totalTime = resolvedItems.reduce((sum, item) => {
      const responseComment = item.comments.find(comment => !comment.isInternal)
      const responseTime = responseComment ? responseComment.timestamp.getTime() - item.metadata.timestamp.getTime() : 0
      return sum + (responseTime || 0)
    }, 0)
    
    return totalTime / resolvedItems.length
  }

  private getUserSatisfaction(): number {
    // This would typically come from user satisfaction surveys
    // For now, we'll calculate based on feedback resolution rate
    const totalFeedback = this.feedback.length
    const resolvedFeedback = this.feedback.filter(item => item.status === 'resolved').length
    
    return totalFeedback > 0 ? (resolvedFeedback / totalFeedback) * 100 : 0
  }

  private async sendToServer(feedback: FeedbackItem): Promise<void> {
    // This would send feedback to your backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
    const response = await fetch(`${apiUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback)
    })

    if (!response.ok) {
      throw new Error('Failed to send feedback to server')
    }
  }
}

// Feedback collection hook
export function useUserFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const manager = useRef(UserFeedbackManager.getInstance())

  useEffect(() => {
    // Load initial feedback
    setFeedback(manager.current.getFeedback())
    setAnalytics(manager.current.getAnalytics())

    // Subscribe to changes
    const unsubscribe = manager.current.subscribe((newFeedback) => {
      setFeedback(newFeedback)
      setAnalytics(manager.current.getAnalytics())
    })

    return unsubscribe
  }, [])

  const submitFeedback = useCallback(async (form: FeedbackForm, user: any) => {
    return await manager.current.submitFeedback(form, user)
  }, [])

  const updateStatus = useCallback((id: string, status: string) => {
    return manager.current.updateFeedbackStatus(id, status)
  }, [])

  const addComment = useCallback((feedbackId: string, comment: Omit<FeedbackComment, 'id' | 'timestamp'>) => {
    return manager.current.addComment(feedbackId, comment)
  }, [])

  const vote = useCallback((feedbackId: string, userId: string) => {
    return manager.current.voteOnFeedback(feedbackId, userId)
  }, [])

  return {
    feedback,
    analytics,
    submitFeedback,
    updateStatus,
    addComment,
    vote
  }
}

const UserFeedback = {
  UserFeedbackManager,
  useUserFeedback
}

export default UserFeedback
