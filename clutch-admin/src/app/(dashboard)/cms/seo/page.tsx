'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface SEOData {
  page: string;
  title: string;
  description: string;
  keywords: string[];
  score: number;
  issues: string[];
  suggestions: string[];
}

export default function SEOCMSPage() {
  const [seoData, setSeoData] = useState<SEOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPage, setSelectedPage] = useState<SEOData | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-success/100">Excellent</Badge>;
    if (score >= 70) return <Badge variant="default" className="bg-warning/100">Good</Badge>;
    return <Badge variant="destructive">Needs Work</Badge>;
  };
  
  useEffect(() => {
    loadSEOData();
  }, []);
  
  const loadSEOData = async () => {
    try {
      setLoading(true);
      const data = await productionApi.getSEOData();
      setSeoData(data || []);
      if (data && data.length > 0) {
        setSelectedPage(data[0]);
      }
    } catch (error) {
      // Error handled by API service
      setSeoData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshAnalysis = async () => {
    try {
      setRefreshing(true);
      await productionApi.refreshSEOAnalysis();
      await loadSEOData();
    } catch (error) {
      // Error handled by API service
    } finally {
      setRefreshing(false);
    }
  };
  
  const optimizeAll = async () => {
    try {
      await productionApi.optimizeSEO();
      await loadSEOData();
    } catch (error) {
      // Error handled by API service
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">SEO Management</h1>
          <p className="text-muted-foreground font-sans">
            Optimize your website for search engines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshAnalysis} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
          </Button>
          <Button onClick={optimizeAll}>
            <Target className="h-4 w-4 mr-2" />
            Optimize All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Overall Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-sans ${getScoreColor(
                  seoData.length > 0 ? Math.round(seoData.reduce((sum, page) => sum + page.score, 0) / seoData.length) : 0
                )}`}>
                  {seoData.length > 0 ? Math.round(seoData.reduce((sum, page) => sum + page.score, 0) / seoData.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Average SEO score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Pages Analyzed</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">{seoData.length}</div>
                <p className="text-xs text-muted-foreground font-sans">
                  Total pages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Issues Found</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {seoData.reduce((sum, page) => sum + page.issues.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Total issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Suggestions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">
                  {seoData.reduce((sum, page) => sum + page.suggestions.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  Total suggestions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">SEO Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seoData.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-sans">{page.page}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              page.score >= 90 ? 'bg-success/100' :
                              page.score >= 70 ? 'bg-warning/100' : 'bg-destructive/100'
                            }`}
                            style={{ width: `${page.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-sans w-8 text-right">{page.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Analyze New Page
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Generate Sitemap
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Search Console
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="space-y-4">
            {seoData.map((page, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-sans">{page.page}</CardTitle>
                      <CardDescription className="font-sans">
                        {page.title}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getScoreBadge(page.score)}
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-2" />
                        Optimize
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium font-sans">Page Title</label>
                    <Input
                      value={page.title}
                      onChange={(e) => {
                        const newData = [...seoData];
                        newData[index].title = e.target.value;
                        setSeoData(newData);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium font-sans">Meta Description</label>
                    <Textarea
                      value={page.description}
                      onChange={(e) => {
                        const newData = [...seoData];
                        newData[index].description = e.target.value;
                        setSeoData(newData);
                      }}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium font-sans">Keywords</label>
                    <div className="flex items-center space-x-2">
                      {page.keywords.map((keyword, keywordIndex) => (
                        <Badge key={keywordIndex} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm">Add Keyword</Button>
                    </div>
                  </div>
                  
                  {page.issues.length > 0 && (
                    <div>
                      <label className="text-sm font-medium font-sans text-destructive">Issues</label>
                      <div className="space-y-1">
                        {page.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="flex items-center space-x-2 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-sans">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {page.suggestions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium font-sans text-primary">Suggestions</label>
                      <div className="space-y-1">
                        {page.suggestions.map((suggestion, suggestionIndex) => (
                          <div key={suggestionIndex} className="flex items-center space-x-2 text-sm text-primary">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-sans">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Keyword Research</CardTitle>
              <CardDescription className="font-sans">
                Track and analyze your target keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Enter keyword to research..." />
                  <Button>Research</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { keyword: 'fleet management', volume: 12000, difficulty: 'Medium', position: 3 },
                    { keyword: 'vehicle tracking', volume: 8500, difficulty: 'Low', position: 1 },
                    { keyword: 'fleet analytics', volume: 3200, difficulty: 'High', position: 8 },
                    { keyword: 'fleet maintenance', volume: 5600, difficulty: 'Medium', position: 5 }
                  ].map((keyword, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium font-sans">{keyword.keyword}</h3>
                          <Badge variant={keyword.difficulty === 'Low' ? 'default' : keyword.difficulty === 'Medium' ? 'default' : 'destructive'}>
                            {keyword.difficulty}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="font-sans">Volume: {keyword.volume.toLocaleString()}</p>
                          <p className="font-sans">Position: #{keyword.position}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Organic Traffic</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">12,450</div>
                <p className="text-xs text-muted-foreground font-sans">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Average Position</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">4.2</div>
                <p className="text-xs text-muted-foreground font-sans">
                  +0.8 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-sans">Click-Through Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-sans">3.8%</div>
                <p className="text-xs text-muted-foreground font-sans">
                  +0.5% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
