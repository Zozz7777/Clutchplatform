'use client';

/**
 * Feedback Iteration Manager
 * Create and manage feedback improvement iterations
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Target, 
  Plus, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { 
  FeedbackAnalyzer, 
  FeedbackIteration, 
  IterationAction 
} from '@/lib/feedback-analysis'

interface FeedbackIterationManagerProps {
  className?: string
}

export const FeedbackIterationManager: React.FC<FeedbackIterationManagerProps> = ({ 
  className = '' 
}) => {
  const [analyzer] = useState(() => FeedbackAnalyzer.getInstance())
  const [iterations, setIterations] = useState<FeedbackIteration[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [selectedIteration, setSelectedIteration] = useState<FeedbackIteration | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form states
  const [newIteration, setNewIteration] = useState({
    name: '',
    description: '',
    goals: [''] as string[]
  })

  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    type: 'improvement' as const,
    priority: 1,
    assignedTo: '',
    dueDate: '',
    impact: 'medium' as const,
    effort: 'medium' as const
  })

  useEffect(() => {
    loadIterations()
  }, [])

  const loadIterations = () => {
    try {
      const allIterations = analyzer.getIterations()
      setIterations(allIterations)
    } catch (error) {
      console.error('Failed to load iterations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateIteration = () => {
    if (!newIteration.name.trim() || !newIteration.description.trim()) {
      return
    }

    const goals = newIteration.goals.filter(goal => goal.trim())
    const iteration = analyzer.createIteration(
      newIteration.name,
      newIteration.description,
      goals
    )

    setIterations(prev => [...prev, iteration])
    setNewIteration({ name: '', description: '', goals: [''] })
    setIsCreateDialogOpen(false)
  }

  const handleAddAction = () => {
    if (!selectedIteration || !newAction.title.trim()) {
      return
    }

    const action = analyzer.addIterationAction(selectedIteration.id, {
      title: newAction.title,
      description: newAction.description,
      type: newAction.type,
      priority: newAction.priority,
      assignedTo: newAction.assignedTo,
      dueDate: new Date(newAction.dueDate),
      impact: newAction.impact,
      effort: newAction.effort,
      status: 'planned'
    })

    setIterations(prev => prev.map(iter => 
      iter.id === selectedIteration.id 
        ? { ...iter, actions: [...iter.actions, action] }
        : iter
    ))

    setNewAction({
      title: '',
      description: '',
      type: 'improvement',
      priority: 1,
      assignedTo: '',
      dueDate: '',
      impact: 'medium',
      effort: 'medium'
    })
    setIsActionDialogOpen(false)
  }

  const updateActionStatus = (iterationId: string, actionId: string, status: IterationAction['status']) => {
    setIterations(prev => prev.map(iter => 
      iter.id === iterationId 
        ? {
            ...iter,
            actions: iter.actions.map(action => 
              action.id === actionId 
                ? { ...action, status, completedDate: status === 'completed' ? new Date() : undefined }
                : action
            )
          }
        : iter
    ))
  }

  const updateIterationStatus = (iterationId: string, status: FeedbackIteration['status']) => {
    setIterations(prev => prev.map(iter => 
      iter.id === iterationId ? { ...iter, status } : iter
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <Play className="h-4 w-4" />
      case 'planning':
        return <Target className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (iteration: FeedbackIteration) => {
    if (iteration.actions.length === 0) return 0
    const completed = iteration.actions.filter(a => a.status === 'completed').length
    return (completed / iteration.actions.length) * 100
  }

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading iterations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feedback Iterations</h2>
          <p className="text-muted-foreground">
            Create and manage feedback improvement cycles
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Iteration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Feedback Iteration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Iteration Name</Label>
                <Input
                  id="name"
                  value={newIteration.name}
                  onChange={(e) => setNewIteration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q1 2024 Feedback Improvements"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newIteration.description}
                  onChange={(e) => setNewIteration(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the goals and scope of this iteration..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Goals</Label>
                <div className="space-y-2">
                  {newIteration.goals.map((goal, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...newIteration.goals]
                          newGoals[index] = e.target.value
                          setNewIteration(prev => ({ ...prev, goals: newGoals }))
                        }}
                        placeholder={`Goal ${index + 1}`}
                      />
                      {newIteration.goals.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newGoals = newIteration.goals.filter((_, i) => i !== index)
                            setNewIteration(prev => ({ ...prev, goals: newGoals }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewIteration(prev => ({ ...prev, goals: [...prev.goals, ''] }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIteration}>
                Create Iteration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {iterations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Iterations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first feedback iteration to start improving user experience.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Iteration
              </Button>
            </CardContent>
          </Card>
        ) : (
          iterations.map((iteration) => (
            <Card key={iteration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(iteration.status)}
                      <CardTitle className="text-xl">{iteration.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(iteration.status)}>
                      {iteration.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIteration(iteration)
                        setIsActionDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                    <Select
                      value={iteration.status}
                      onValueChange={(value) => updateIterationStatus(iteration.id, value as FeedbackIteration['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{iteration.description}</p>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {iteration.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {iteration.actions.filter(a => a.status === 'completed').length} / {iteration.actions.length} actions
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(iteration)} className="h-2" />
                </div>
                <div className="mb-4 flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Started: {iteration.startDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Ends: {iteration.endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{getDaysRemaining(iteration.endDate)} days remaining</span>
                  </div>
                </div>
                {iteration.actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Actions</h4>
                    <div className="space-y-2">
                      {iteration.actions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium">{action.title}</h5>
                              <Badge variant="outline" className={getStatusColor(action.status)}>
                                {action.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>Priority: {action.priority}</span>
                              <span>Impact: {action.impact}</span>
                              <span>Effort: {action.effort}</span>
                              {action.assignedTo && <span>Assigned to: {action.assignedTo}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={action.status}
                              onValueChange={(value) => updateActionStatus(iteration.id, action.id, value as IterationAction['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Action to {selectedIteration?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-title">Action Title</Label>
              <Input
                id="action-title"
                value={newAction.title}
                onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Implement user feedback widget"
              />
            </div>
            <div>
              <Label htmlFor="action-description">Description</Label>
              <Textarea
                id="action-description"
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what needs to be done..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="action-type">Type</Label>
                <Select
                  value={newAction.type}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action-priority">Priority</Label>
                <Select
                  value={newAction.priority.toString()}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Critical</SelectItem>
                    <SelectItem value="2">2 - High</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - Low</SelectItem>
                    <SelectItem value="5">5 - Nice to have</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="action-impact">Impact</Label>
                <Select
                  value={newAction.impact}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, impact: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action-effort">Effort</Label>
                <Select
                  value={newAction.effort}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, effort: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="action-assigned">Assigned To</Label>
                <Input
                  id="action-assigned"
                  value={newAction.assignedTo}
                  onChange={(e) => setNewAction(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Team member name"
                />
              </div>
              <div>
                <Label htmlFor="action-due">Due Date</Label>
                <Input
                  id="action-due"
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAction}>
              Add Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
