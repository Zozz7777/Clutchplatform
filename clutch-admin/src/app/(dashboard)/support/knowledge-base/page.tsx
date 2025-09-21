'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { productionApi } from '@/lib/production-api';

interface KnowledgeArticle {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  status: 'published' | 'draft' | 'archived';
}

export default function KnowledgeBasePage() {
  const { t } = useTranslations();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  
  // Form data state
  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    category: 'Getting Started',
    tags: '',
    status: 'draft' as 'published' | 'draft' | 'archived'
  });

  const categories = ['all', 'Getting Started', 'Account Management', 'Billing', 'Technical Support', 'API Documentation'];


  useEffect(() => {
    loadArticles();
  }, []);
  
  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getKnowledgeArticles();
      setArticles(data || []);
    } catch (error) {
      // Error handled by API service
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };
  
  const createArticle = async () => {
    try {
      const newArticleData = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        tags: articleData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: articleData.status,
        author: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com'
        },
        views: 0
      };
      
      const newArticle = await productionApi.createKnowledgeArticle(newArticleData);
      if (newArticle) {
        setArticles(prev => [...prev, newArticle]);
        setShowCreateDialog(false);
        setArticleData({
          title: '',
          content: '',
          category: 'Getting Started',
          tags: '',
          status: 'draft'
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const updateArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      const updatedArticleData = {
        title: articleData.title,
        content: articleData.content,
        category: articleData.category,
        tags: articleData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: articleData.status
      };
      
      const updatedArticle = await productionApi.updateKnowledgeArticle(selectedArticle._id, updatedArticleData);
      if (updatedArticle) {
        setArticles(prev => prev.map(article => 
          article._id === selectedArticle._id ? updatedArticle : article
        ));
        setShowEditDialog(false);
        setSelectedArticle(null);
        setArticleData({
          title: '',
          content: '',
          category: 'Getting Started',
          tags: '',
          status: 'draft'
        });
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const deleteArticle = async (articleId: string) => {
    try {
      const success = await productionApi.deleteKnowledgeArticle(articleId);
      if (success) {
        setArticles(prev => prev.filter(article => article._id !== articleId));
      }
    } catch (error) {
      // Error handled by API service
    }
  };
  
  const openEditDialog = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setArticleData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      status: article.status
    });
    setShowEditDialog(true);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-success/100">Published</Badge>;
      case 'draft':
        return <Badge variant="default" className="bg-warning/100">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">{t('support.knowledgeBase')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('support.manageHelpArticles')}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('support.searchArticles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card key={article._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-sans">{article.title}</CardTitle>
                        <CardDescription className="font-sans">
                          {article.content.substring(0, 100)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(article.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(article)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteArticle(article._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span className="font-sans">{article.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="font-sans">{article.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-sans">{new Date(article.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-sans">{article.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {article.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.filter(cat => cat !== 'all').map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="font-sans">{category}</CardTitle>
                  <CardDescription className="font-sans">
                    {articles.filter(article => article.category === category).length} articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{articles.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Published</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {articles.filter(a => a.status === 'published').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Categories</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {categories.length - 1}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>
              Create a new knowledge base article.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder={t('support.articleTitle')} 
                value={articleData.title}
                onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={articleData.category}
                onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Getting Started">{t('support.gettingStarted')}</option>
                <option value="Account Management">{t('support.accountManagement')}</option>
                <option value="Billing">{t('support.billing')}</option>
                <option value="Technical Support">{t('support.technicalSupport')}</option>
                <option value="API Documentation">API Documentation</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <textarea 
                id="content" 
                placeholder={t('support.articleContent')} 
                className="w-full p-2 border rounded-md h-32"
                value={articleData.content}
                onChange={(e) => setArticleData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input 
                id="tags" 
                placeholder="tag1, tag2, tag3" 
                value={articleData.tags}
                onChange={(e) => setArticleData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={articleData.status}
                onChange={(e) => setArticleData(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' | 'archived' }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createArticle}>
              Create Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Edit the knowledge base article.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="editTitle">Title</Label>
              <Input 
                id="editTitle" 
                placeholder={t('support.articleTitle')} 
                value={articleData.title}
                onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editCategory">Category</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={articleData.category}
                onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Getting Started">{t('support.gettingStarted')}</option>
                <option value="Account Management">{t('support.accountManagement')}</option>
                <option value="Billing">{t('support.billing')}</option>
                <option value="Technical Support">{t('support.technicalSupport')}</option>
                <option value="API Documentation">API Documentation</option>
              </select>
            </div>
            <div>
              <Label htmlFor="editContent">Content</Label>
              <textarea 
                id="editContent" 
                placeholder={t('support.articleContent')} 
                className="w-full p-2 border rounded-md h-32"
                value={articleData.content}
                onChange={(e) => setArticleData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editTags">Tags (comma-separated)</Label>
              <Input 
                id="editTags" 
                placeholder="tag1, tag2, tag3" 
                value={articleData.tags}
                onChange={(e) => setArticleData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={articleData.status}
                onChange={(e) => setArticleData(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' | 'archived' }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateArticle}>
              Update Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


