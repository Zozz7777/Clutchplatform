'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Filter,
  Search,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function FeedbackPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const feedbackItems = [
    {
      id: 1,
      user: 'John Smith',
      email: 'john@example.com',
      rating: 5,
      type: 'feature_request',
      title: 'Great mobile app experience!',
      message: 'The new mobile app is fantastic. The interface is clean and intuitive. Would love to see dark mode support.',
      timestamp: '2 hours ago',
      status: 'new',
      category: 'mobile',
      helpful: 12
    },
    {
      id: 2,
      user: 'Emily Davis',
      email: 'emily@example.com',
      rating: 4,
      type: 'bug_report',
      title: 'Dashboard loading issue',
      message: 'The dashboard sometimes takes too long to load, especially on slower connections. This affects productivity.',
      timestamp: '4 hours ago',
      status: 'in_progress',
      category: 'performance',
      helpful: 8
    },
    {
      id: 3,
      user: 'Mike Wilson',
      email: 'mike@example.com',
      rating: 5,
      type: 'general',
      title: 'Excellent customer support',
      message: 'The support team was very helpful and resolved my issue quickly. Great service!',
      timestamp: '1 day ago',
      status: 'resolved',
      category: 'support',
      helpful: 15
    },
    {
      id: 4,
      user: 'Sarah Johnson',
      email: 'sarah@example.com',
      rating: 3,
      type: 'improvement',
      title: 'API documentation could be better',
      message: 'The API docs are good but could use more examples and better error handling documentation.',
      timestamp: '2 days ago',
      status: 'reviewing',
      category: 'documentation',
      helpful: 6
    }
  ]

  const feedbackStats = [
    {
      name: 'Total Feedback',
      value: '1,247',
      change: '+12%',
      trend: 'up'
    },
    {
      name: 'Average Rating',
      value: '4.2/5',
      change: '+0.3',
      trend: 'up'
    },
    {
      name: 'Response Rate',
      value: '94%',
      change: '+2%',
      trend: 'up'
    },
    {
      name: 'Resolved Issues',
      value: '89%',
      change: '+5%',
      trend: 'up'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'reviewing': return 'text-purple-600 bg-purple-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature_request': return 'text-green-600 bg-green-100'
      case 'bug_report': return 'text-red-600 bg-red-100'
      case 'improvement': return 'text-blue-600 bg-blue-100'
      case 'general': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer feedback and suggestions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Survey
          </Button>
        </div>
      </div>

      {/* Feedback Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {feedbackStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{feedback.title}</h3>
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status}
                    </Badge>
                    <Badge className={getTypeColor(feedback.type)}>
                      {feedback.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{feedback.user}</span>
                    <span>{feedback.email}</span>
                    <span className="flex items-center">
                      {renderStars(feedback.rating)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {feedback.timestamp}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {feedback.helpful}
                  </Button>
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{feedback.message}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{feedback.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: #{feedback.id}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Mark as Resolved
                  </Button>
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Summary</CardTitle>
          <CardDescription>
            Overview of customer feedback trends and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold">Top Rated Features</h3>
              <p className="text-sm text-muted-foreground">Mobile app, Dashboard, Support</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Most Common Requests</h3>
              <p className="text-sm text-muted-foreground">Dark mode, API improvements, Performance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Resolution Rate</h3>
              <p className="text-sm text-muted-foreground">89% of issues resolved within 48 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
