'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton, ListSkeleton, CardSkeleton } from '@/components/ui/skeleton'
import { DataLoadingWrapper, ErrorState, EmptyState, ArticleSkeleton } from '@/components/ui/loading-states'
import { useToast } from '@/components/ui/toast'
import { useKnowledgeBase, useCreateKnowledgeBaseArticle, useUpdateKnowledgeBaseArticle, useDeleteKnowledgeBaseArticle } from '@/hooks/use-react-query-data'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  Filter,
  SortAsc,
  BookOpen,
  FileText,
  HelpCircle,
  Settings,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch data from API
  const { data: knowledgeBaseData, isLoading, error, refetch } = useKnowledgeBase()
  
  // Mutation hooks for CRUD operations
  const createArticleMutation = useCreateKnowledgeBaseArticle()
  const updateArticleMutation = useUpdateKnowledgeBaseArticle()
  const deleteArticleMutation = useDeleteKnowledgeBaseArticle()
  
  // Toast notifications
  const toast = useToast()

  // Fallback data structure
  const categories = knowledgeBaseData?.categories || [
    { id: 'all', name: 'All Articles', count: 0 },
    { id: 'getting-started', name: 'Getting Started', count: 0 },
    { id: 'account', name: 'Account Management', count: 0 },
    { id: 'billing', name: 'Billing & Payments', count: 0 },
    { id: 'technical', name: 'Technical Support', count: 0 },
    { id: 'mobile', name: 'Mobile App', count: 0 }
  ]

  const articles = knowledgeBaseData?.articles || []
  const popularSearches = knowledgeBaseData?.popularSearches || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'draft': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'archived': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handler functions for CRUD operations
  const handleCreateArticle = async (articleData: any) => {
    try {
      await createArticleMutation.mutateAsync(articleData)
      toast.success('Article created successfully!')
    } catch (error) {
      console.error('Failed to create article:', error)
      toast.error('Failed to create article', 'Please try again later.')
    }
  }

  const handleUpdateArticle = async (id: string, articleData: any) => {
    try {
      await updateArticleMutation.mutateAsync({ id, data: articleData })
      toast.success('Article updated successfully!')
    } catch (error) {
      console.error('Failed to update article:', error)
      toast.error('Failed to update article', 'Please try again later.')
    }
  }

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticleMutation.mutateAsync(id)
      toast.success('Article deleted successfully!')
    } catch (error) {
      console.error('Failed to delete article:', error)
      toast.error('Failed to delete article', 'Please try again later.')
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Knowledge Base</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage help articles and documentation</p>
          </div>
        </div>
        <ErrorState 
          error={error} 
          onRetry={() => refetch()}
          title="Failed to load knowledge base"
          description="We couldn't load the knowledge base data. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Knowledge Base</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage help articles and documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => handleCreateArticle({ title: 'New Article', category: 'getting-started', status: 'draft' })}
            disabled={createArticleMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {createArticleMutation.isPending ? 'Creating...' : 'New Article'}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ListSkeleton items={6} />
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-clutch-primary text-white'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm opacity-75">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ListSkeleton items={5} />
              ) : (
                <div className="space-y-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Articles ({filteredArticles.length})</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataLoadingWrapper
                data={filteredArticles}
                isLoading={isLoading}
                error={null}
                loadingComponent={
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ArticleSkeleton key={i} />
                    ))}
                  </div>
                }
                emptyComponent={
                  <EmptyState
                    title="No articles found"
                    description={searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first article'}
                    icon={FileText}
                    action={
                      <Button onClick={() => handleCreateArticle({ title: 'New Article', category: 'getting-started', status: 'draft' })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Article
                      </Button>
                    }
                  />
                }
              >
                {(articles) => (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {article.title}
                              </h3>
                              <Badge className={getStatusColor(article.status)}>
                                {article.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {article.views} views
                              </span>
                              <span className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {article.helpful} helpful
                              </span>
                              <span>Updated {article.lastUpdated}</span>
                              <span>by {article.author}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateArticle(article.id, { ...article, status: 'published' })}
                              disabled={updateArticleMutation.isPending}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteArticle(article.id)}
                              disabled={deleteArticleMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DataLoadingWrapper>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
