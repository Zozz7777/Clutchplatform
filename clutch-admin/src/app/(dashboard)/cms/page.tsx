"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/hooks/use-translations";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { realApi } from "@/lib/real-api";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Image,
  Video,
  File,
  Globe,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Calendar,
  User,
  Tag,
  Archive,
  Send,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentItem {
  _id: string;
  title: string;
  type: "page" | "post" | "article" | "media" | "help_doc";
  status: "draft" | "published" | "archived" | "scheduled";
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  authorName: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
}

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  type: "image" | "video" | "document" | "audio";
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  usedIn: string[];
}

interface CMSCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parent?: string;
  children: string[];
  contentCount: number;
  createdAt: string;
}

export default function CMSPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"content" | "media" | "categories">("content");
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { t } = useTranslations();

  useEffect(() => {
    const loadCMSData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API using the proper API service
        const [contentData, mediaData, categoriesData] = await Promise.all([
          realApi.getCMSContent(),
          realApi.getCMSMedia(),
          realApi.getCMSCategories()
        ]);

        setContent(contentData || []);
        setMedia(mediaData || []);
        setCategories(categoriesData || []);
        setFilteredContent(contentData || []);
      } catch (error) {
        console.error("Failed to load CMS data:", error);
        // Set empty arrays on error - no mock data fallback
        setContent([]);
        setMedia([]);
        setCategories([]);
        setFilteredContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCMSData();
  }, []);

  useEffect(() => {
    let filtered = content;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "destructive";
      case "scheduled":
        return "info";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "page":
        return <FileText className="h-4 w-4" />;
      case "post":
        return <FileText className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      case "media":
        return <Image className="h-4 w-4" />;
      case "help_doc":
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "document":
        return <File className="h-4 w-4" />;
      case "audio":
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleContentAction = async (contentId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "publish":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/cms/content/${contentId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "published" }),
          });
          break;
        case "unpublish":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/cms/content/${contentId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "draft" }),
          });
          break;
        case "archive":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/cms/content/${contentId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "archived" }),
          });
          break;
        case "duplicate":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/cms/content/${contentId}/duplicate`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload content
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/cms/content", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
    }
  };

  const handleMediaAction = async (mediaId: string, action: string) => {
    try {
      const token = localStorage.getItem("clutch-admin-token");
      
      switch (action) {
        case "delete":
          await fetch(`https://clutch-main-nk7x.onrender.com/api/v1/cms/media/${mediaId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          break;
      }
      
      // Reload media
      const response = await fetch("https://clutch-main-nk7x.onrender.com/api/v1/cms/media", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedia(data.data || data);
      }
    } catch (error) {
      console.error(`Failed to ${action} media:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('cms.loadingCmsData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management System</h1>
          <p className="text-muted-foreground">
            Manage website content, media, and help documentation
          </p>
        </div>
        {hasPermission("manage_content") && (
          <div className="flex space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Content
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content.length}</div>
            <p className="text-xs text-muted-foreground">
              {content.filter(c => c.status === "published").length} published
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.length}</div>
            <p className="text-xs text-muted-foreground">
              {media.filter(m => m.type === "image").length} images
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Content categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All time views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-[0.625rem] w-fit">
        <Button
          variant={activeTab === "content" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("content")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Content
        </Button>
        <Button
          variant={activeTab === "media" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("media")}
        >
          <Image className="mr-2 h-4 w-4" />
          Media
        </Button>
        <Button
          variant={activeTab === "categories" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("categories")}
        >
          <Tag className="mr-2 h-4 w-4" />
          Categories
        </Button>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Manage pages, posts, articles, and help documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="page">Pages</option>
                <option value="post">Posts</option>
                <option value="article">Articles</option>
                <option value="help_doc">Help Docs</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(item.status) as "default" | "secondary" | "destructive" | "outline"}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {item.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created: {formatDate(item.createdAt)}</p>
                      <p>Updated: {formatRelativeTime(item.updatedAt)}</p>
                      {item.publishedAt && (
                        <p>Published: {formatDate(item.publishedAt)}</p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => handleContentAction(item._id, "publish")}
                            className="text-success"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {item.status === "published" && (
                          <DropdownMenuItem 
                            onClick={() => handleContentAction(item._id, "unpublish")}
                            className="text-warning"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleContentAction(item._id, "archive")}
                          className="text-destructive"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No content found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>
              Manage images, videos, and other media files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <div key={item._id} className="border rounded-[0.625rem] p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    {getMediaTypeIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.originalName}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                  
                  {item.type === "image" && item.thumbnailUrl && (
                    <div className="w-full h-32 bg-muted rounded mb-3 flex items-center justify-center">
                      <img 
                        src={item.thumbnailUrl} 
                        alt={item.alt || item.originalName}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploaded: {formatDate(item.uploadedAt)}</span>
                      <span>{item.usedIn.length} uses</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleMediaAction(item._id, "delete")}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {media.length === 0 && (
              <div className="text-center py-8">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No media files found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card>
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>
              Organize content with categories and tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between p-4 border rounded-[0.625rem] hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-[0.625rem] bg-muted flex items-center justify-center">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {category.contentCount} items
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {category.children.length} subcategories
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Created: {formatDate(category.createdAt)}</p>
                      <p>Slug: {category.slug}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
