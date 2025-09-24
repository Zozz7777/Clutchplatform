'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-context';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FileText,
  Tag,
  Eye,
  BookOpen
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  views: number;
  lastUpdated: string;
}

export default function HelpCMSPage() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'all', 
    t('cms.help.categories.gettingStarted'), 
    t('cms.help.categories.fleetManagement'), 
    t('cms.help.categories.billing'), 
    t('cms.help.categories.technicalSupport')
  ];

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const data = await cmsService.getHelpArticles();
        // For now, using realistic mock data
        const mockArticles: HelpArticle[] = [
          {
            id: '1',
            title: t('cms.help.sampleArticles.gettingStarted.title'),
            content: t('cms.help.sampleArticles.gettingStarted.content'),
            category: t('cms.help.categories.gettingStarted'),
            tags: [t('cms.help.tags.basics'), t('cms.help.tags.tutorial')],
            status: 'published',
            views: 1250,
            lastUpdated: '2024-01-15'
          },
          {
            id: '2',
            title: t('cms.help.sampleArticles.fleetManagement.title'),
            content: t('cms.help.sampleArticles.fleetManagement.content'),
            category: t('cms.help.categories.fleetManagement'),
            tags: [t('cms.help.tags.fleet'), t('cms.help.tags.management')],
            status: 'published',
            views: 890,
            lastUpdated: '2024-01-14'
          },
          {
            id: '3',
            title: t('cms.help.sampleArticles.billing.title'),
            content: t('cms.help.sampleArticles.billing.content'),
            category: t('cms.help.categories.billing'),
            tags: [t('cms.help.tags.billing'), t('cms.help.tags.payment')],
            status: 'draft',
            views: 0,
            lastUpdated: '2024-01-13'
          }
        ];
        setArticles(mockArticles);
      } catch (error) {
        console.error('Failed to load help articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [t]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">{t('cms.help.title')}</h1>
          <p className="text-muted-foreground font-sans">
            {t('cms.help.description')}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('cms.help.newArticle')}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('cms.help.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-border rounded-md"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? t('cms.help.allCategories') : category}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">{t('cms.help.tabs.articles')}</TabsTrigger>
          <TabsTrigger value="categories">{t('cms.help.tabs.categories')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('cms.help.tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-sans">{article.title}</CardTitle>
                      <CardDescription className="font-sans">
                        {article.content.substring(0, 100)}...
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit')}
                      </Button>
                      <Button variant="outline" size="sm">
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
                      <Eye className="h-4 w-4" />
                      <span className="font-sans">{article.views} {t('cms.help.views')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-sans">{t('cms.help.updated')} {article.lastUpdated}</span>
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.filter(cat => cat !== 'all').map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="font-sans">{category}</CardTitle>
                  <CardDescription className="font-sans">
                    {articles.filter(article => article.category === category).length} {t('cms.help.articles')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.manage')}
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
                <CardTitle className="text-sm font-medium font-sans">{t('cms.help.analytics.totalArticles')}</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{articles.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('cms.help.analytics.published')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {articles.filter(a => a.status === 'published').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">{t('cms.help.analytics.totalViews')}</CardTitle>
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
                <CardTitle className="text-sm font-medium font-sans">{t('cms.help.analytics.categories')}</CardTitle>
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
    </div>
  );
}


