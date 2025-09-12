'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  TrendingUp
} from 'lucide-react'

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Articles', count: 156 },
    { id: 'getting-started', name: 'Getting Started', count: 23 },
    { id: 'account', name: 'Account Management', count: 34 },
    { id: 'billing', name: 'Billing & Payments', count: 28 },
    { id: 'technical', name: 'Technical Support', count: 45 },
    { id: 'mobile', name: 'Mobile App', count: 26 }
  ]

  const articles = [
    {
      id: 1,
      title: 'How to Set Up Your Account',
      category: 'getting-started',
      views: 1247,
      helpful: 89,
      lastUpdated: '2 days ago',
      status: 'published',
      author: 'Sarah Johnson'
    },
    {
      id: 2,
      title: 'Understanding Your Dashboard',
      category: 'getting-started',
      views: 892,
      helpful: 67,
      lastUpdated: '1 week ago',
      status: 'published',
      author: 'Tom Brown'
    },
    {
      id: 3,
      title: 'Payment Methods and Billing',
      category: 'billing',
      views: 654,
      helpful: 45,
      lastUpdated: '3 days ago',
      status: 'published',
      author: 'Emily Davis'
    },
    {
      id: 4,
      title: 'Mobile App Troubleshooting',
      category: 'mobile',
      views: 432,
      helpful: 23,
      lastUpdated: '5 days ago',
      status: 'draft',
      author: 'Mike Wilson'
    },
    {
      id: 5,
      title: 'API Integration Guide',
      category: 'technical',
      views: 789,
      helpful: 56,
      lastUpdated: '1 week ago',
      status: 'published',
      author: 'Alex Chen'
    }
  ]

  const popularSearches = [
    'How to reset password',
    'Account settings',
    'Payment issues',
    'Mobile app login',
    'API documentation'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100'
      case 'draft': return 'text-yellow-600 bg-yellow-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage help articles and documentation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
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
                {categories.map((category) => (
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
            {categories.map((category) => (
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
            <CardTitle>Articles ({filteredArticles.length})</CardTitle>
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
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.views} views
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {article.helpful} helpful
                        </span>
                        <span>Updated {article.lastUpdated}</span>
                        <span>By {article.author}</span>
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

      {/* Knowledge Base Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">
              +8.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2K</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              -12% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
