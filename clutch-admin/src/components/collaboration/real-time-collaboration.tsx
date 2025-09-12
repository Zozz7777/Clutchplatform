'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  Edit, 
  Eye, 
  Bell, 
  AtSign,
  Send,
  MoreHorizontal,
  ThumbsUp,
  Reply,
  Flag,
  Trash2,
  Edit3
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useWebSocket } from '@/lib/websocket-service'

// User interface
export interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  isOnline: boolean
  lastSeen?: Date
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
}

// Comment interface
export interface Comment {
  id: string
  content: string
  author: Collaborator
  createdAt: Date
  updatedAt?: Date
  replies?: Comment[]
  mentions?: string[]
  resolved?: boolean
  position?: { x: number; y: number }
}

// Activity interface
export interface Activity {
  id: string
  type: 'edit' | 'comment' | 'mention' | 'join' | 'leave' | 'resolve'
  user: Collaborator
  content?: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Real-time collaboration provider
export function CollaborationProvider({ 
  children, 
  documentId 
}: { 
  children: React.ReactNode
  documentId: string 
}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const { send, subscribe } = useWebSocket()

  // Subscribe to collaboration events
  useEffect(() => {
    if (!isConnected) return

    const unsubscribeCollaborators = subscribe('collaborators-update', (data: any) => {
      setCollaborators(data.collaborators)
    })

    const unsubscribeComments = subscribe('comments-update', (data: any) => {
      setComments(data.comments)
    })

    const unsubscribeActivities = subscribe('activities-update', (data: any) => {
      setActivities(prev => [data.activity, ...prev.slice(0, 49)]) // Keep last 50 activities
    })

    const unsubscribeCursor = subscribe('cursor-update', (data: any) => {
      setCollaborators(prev => prev.map(collaborator => 
        collaborator.id === data.userId 
          ? { ...collaborator, cursor: data.cursor, selection: data.selection }
          : collaborator
      ))
    })

    return () => {
      unsubscribeCollaborators()
      unsubscribeComments()
      unsubscribeActivities()
      unsubscribeCursor()
    }
  }, [isConnected, subscribe])

  // Send cursor updates
  const updateCursor = useCallback((cursor: { x: number; y: number }, selection?: { start: number; end: number }) => {
    if (currentUser) {
      send('cursor-update', {
        documentId,
        userId: currentUser.id,
        cursor,
        selection
      })
    }
  }, [currentUser, documentId, send])

  // Add comment
  const addComment = useCallback((content: string, position?: { x: number; y: number }) => {
    if (!currentUser) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      author: currentUser,
      createdAt: new Date(),
      position
    }

    send('add-comment', {
      documentId,
      comment
    })
  }, [currentUser, documentId, send])

  // Resolve comment
  const resolveComment = useCallback((commentId: string) => {
    send('resolve-comment', {
      documentId,
      commentId
    })
  }, [documentId, send])

  // Add activity
  const addActivity = useCallback((type: Activity['type'], content?: string, metadata?: Record<string, any>) => {
    if (!currentUser) return

    const activity: Activity = {
      id: `activity-${Date.now()}`,
      type,
      user: currentUser,
      content,
      timestamp: new Date(),
      metadata
    }

    send('add-activity', {
      documentId,
      activity
    })
  }, [currentUser, documentId, send])

  return (
    <CollaborationContext.Provider value={{
      collaborators,
      comments,
      activities,
      currentUser,
      isConnected,
      updateCursor,
      addComment,
      resolveComment,
      addActivity
    }}>
      {children}
    </CollaborationContext.Provider>
  )
}

// Collaboration context
const CollaborationContext = React.createContext<{
  collaborators: Collaborator[]
  comments: Comment[]
  activities: Activity[]
  currentUser: Collaborator | null
  isConnected: boolean
  updateCursor: (cursor: { x: number; y: number }, selection?: { start: number; end: number }) => void
  addComment: (content: string, position?: { x: number; y: number }) => void
  resolveComment: (commentId: string) => void
  addActivity: (type: Activity['type'], content?: string, metadata?: Record<string, any>) => void
} | null>(null)

export const useCollaboration = () => {
  const context = React.useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider')
  }
  return context
}

// Collaborators list component
export function CollaboratorsList({ className = "" }: { className?: string }) {
  const { collaborators } = useCollaboration()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborators ({collaborators.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  {collaborator.avatar ? (
                    <img 
                      src={collaborator.avatar} 
                      alt={collaborator.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {collaborator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {collaborator.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{collaborator.name}</div>
                <div className="text-xs text-muted-foreground">{collaborator.role}</div>
              </div>
              <Badge variant={collaborator.isOnline ? 'default' : 'secondary'} className="text-xs">
                {collaborator.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Comments system component
export function CommentsSystem({ className = "" }: { className?: string }) {
  const { comments, addComment, resolveComment } = useCollaboration()
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return

    setIsAddingComment(true)
    try {
      addComment(newComment.trim())
      setNewComment('')
    } finally {
      setIsAddingComment(false)
    }
  }, [newComment, addComment])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAddComment()
    }
  }, [handleAddComment])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add new comment */}
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a comment... (Cmd+Enter to send)"
              className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isAddingComment ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onResolve={() => resolveComment(comment.id)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Individual comment component
function CommentItem({ 
  comment, 
  onResolve 
}: { 
  comment: Comment
  onResolve: () => void
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [reply, setReply] = useState('')

  const handleReply = useCallback(() => {
    if (!reply.trim()) return
    // Handle reply logic here
    setReply('')
    setIsReplying(false)
  }, [reply])

  return (
    <div className={`p-3 border rounded-lg ${comment.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          {comment.author.avatar ? (
            <img 
              src={comment.author.avatar} 
              alt={comment.author.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <span className="text-xs font-medium">
              {comment.author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt.toLocaleTimeString()}
            </span>
            {comment.resolved && (
              <Badge variant="secondary" className="text-xs">Resolved</Badge>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {comment.content}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button variant="ghost" size="sm">
              <ThumbsUp className="h-3 w-3 mr-1" />
              Like
            </Button>
            {!comment.resolved && (
              <Button variant="ghost" size="sm" onClick={onResolve}>
                <Flag className="h-3 w-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleReply} disabled={!reply.trim()}>
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs">{reply.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {reply.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Activity feed component
export function ActivityFeed({ className = "" }: { className?: string }) {
  const { activities } = useCollaboration()

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'edit': return <Edit className="h-4 w-4" />
      case 'comment': return <MessageCircle className="h-4 w-4" />
      case 'mention': return <AtSign className="h-4 w-4" />
      case 'join': return <Users className="h-4 w-4" />
      case 'leave': return <Users className="h-4 w-4" />
      case 'resolve': return <Flag className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'edit': return 'text-blue-500'
      case 'comment': return 'text-green-500'
      case 'mention': return 'text-yellow-500'
      case 'join': return 'text-green-500'
      case 'leave': return 'text-red-500'
      case 'resolve': return 'text-purple-500'
      default: return 'text-slate-500'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{activity.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {activity.content || `${activity.type} action`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Real-time cursor tracking
export function CursorTracker({ className = "" }: { className?: string }) {
  const { collaborators } = useCollaboration()
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; user: Collaborator }>>(new Map())

  useEffect(() => {
    const newCursors = new Map()
    collaborators.forEach(collaborator => {
      if (collaborator.cursor && collaborator.isOnline) {
        newCursors.set(collaborator.id, {
          x: collaborator.cursor.x,
          y: collaborator.cursor.y,
          user: collaborator
        })
      }
    })
    setCursors(newCursors)
  }, [collaborators])

  return (
    <div className={`fixed inset-0 pointer-events-none z-10 ${className}`}>
      {Array.from(cursors.values()).map(({ x, y, user }) => (
        <div
          key={user.id}
          className="absolute pointer-events-none"
          style={{ left: x, top: y }}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg">
              {user.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Team workspace management
export function TeamWorkspaceManager({ className = "" }: { className?: string }) {
  const [workspaces, setWorkspaces] = useState([
    { id: '1', name: 'Main Workspace', members: 12, isActive: true },
    { id: '2', name: 'Development Team', members: 8, isActive: false },
    { id: '3', name: 'Design Team', members: 5, isActive: false }
  ])

  const switchWorkspace = useCallback((workspaceId: string) => {
    setWorkspaces(prev => prev.map(ws => ({
      ...ws,
      isActive: ws.id === workspaceId
    })))
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Team Workspaces</CardTitle>
        <CardDescription>
          Manage your team workspaces and collaboration settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                workspace.isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              onClick={() => switchWorkspace(workspace.id)}
            >
              <div>
                <div className="font-medium">{workspace.name}</div>
                <div className="text-sm text-muted-foreground">
                  {workspace.members} members
                </div>
              </div>
              {workspace.isActive && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
