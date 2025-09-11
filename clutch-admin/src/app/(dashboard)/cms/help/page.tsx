'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function HelpCMSPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const helpCategories = [
    { id: 'all', name: 'All Articles', count: 89 },
    { id: 'getting-started', name: 'Getting Started', count: 15 },
    { id: 'account', name: 'Account & Profile', count: 12 },
    { id: 'billing', name: 'Billing & Payments', count: 18 },
    { id: 'technical', name: 'Technical Issues', count: 24 },
    { id: 'mobile', name: 'Mobile App', count: 20 }
  ]

  const helpArticles = [
    {
      id: 1,
      title: 'How to Create Your First Account',
      category: 'getting-started',
      status: 'published',
      views: 1247,
      helpful: 89,
      lastUpdated: '2 days ago',
      author: 'Sarah Johnson',
      tags: ['account', 'setup', 'beginner']
    },
    {
      id: 2,
      title: 'Understanding Your Dashboard',
      category: 'getting-started',
      status: 'published',
      views: 892,
      helpful: 67,
      lastUpdated: '1 week ago',
      author: 'Tom Brown',
      tags: ['dashboard', 'navigation', 'overview']
    },
    {
      id: 3,
      title: 'Payment Methods and Billing',
      category: 'billing',
      status: 'published',
      views: 654,
      helpful: 45,
      lastUpdated: '3 days ago',
      author: 'Emily Davis',
      tags: ['payment', 'billing', 'subscription']
    },
    {
      id: 4,
      title: 'Mobile App Troubleshooting',
      category: 'mobile',
      status: 'draft',
      views: 0,
      helpful: 0,
      lastUpdated: '5 days ago',
      author: 'Mike Wilson',
      tags: ['mobile', 'troubleshooting', 'app']
    },
    {
      id: 5,
      title: 'API Integration Guide',
      category: 'technical',
      status: 'published',
      views: 789,
      helpful: 56,
      lastUpdated: '1 week ago',
      author: 'Alex Chen',
      tags: ['api', 'integration', 'developer']
    }
  ]

  const helpStats = [
    {
      name: 'Total Articles',
      value: '89',
      change: '+12',
      trend: 'up'
    },
    {
      name: 'Total Views',
      value: '45.2K',
      change: '+8.5%',
      trend: 'up'
    },
    {
      name: 'Helpful Votes',
      value: '3.2K',
      change: '+15%',
      trend: 'up'
    },
    {
      name: 'Search Success Rate',
      value: '87%',
      change: '+3%',
      trend: 'up'
    }
  ]

  const popularSearches = [
    'How to reset password',
    'Account settings',
    'Payment issues',
    'Mobile app login',
    'API documentation',
    'Dashboard overview',
    'Billing questions',
    'Technical support'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Center CMS</h1>
          <p className="text-muted-foreground">
            Manage help articles, documentation, and support content
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Help Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {helpStats.map((stat) => (
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
          <CardTitle>Search & Filter Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {helpCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {helpCategories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Help Articles ({filteredArticles.length})</CardTitle>
            <CardDescription>
              {searchQuery ? `Search results for "${searchQuery}"` : 'All articles in selected category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{article.title}</h3>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.views} views
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {article.helpful} helpful
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Updated {article.lastUpdated}
                        </span>
                        <span>By {article.author}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Searches</CardTitle>
          <CardDescription>
            Most searched topics by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Center Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Help Center Overview</CardTitle>
          <CardDescription>
            Summary of help center performance and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Most Viewed</h3>
              <p className="text-sm text-muted-foreground">Account Setup Guide</p>
              <p className="text-lg font-bold">1,247 views</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Most Helpful</h3>
              <p className="text-sm text-muted-foreground">Payment Methods</p>
              <p className="text-lg font-bold">89% helpful</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Search Success</h3>
              <p className="text-sm text-muted-foreground">Users find answers</p>
              <p className="text-lg font-bold">87% success rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
