"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Code,
  Search,
  Copy,
  ExternalLink,
  BookOpen,
  Key,
  Globe,
  Database,
  Users,
  Truck,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  Activity,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { realApi } from "@/lib/real-api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface APIEndpoint {
  _id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  category: string;
  version: string;
  authentication: "none" | "api_key" | "bearer" | "oauth";
  parameters: {
    query?: Record<string, { type: string; required: boolean; description: string }>;
    path?: Record<string, { type: string; required: boolean; description: string }>;
    body?: Record<string, { type: string; required: boolean; description: string }>;
  };
  responses: {
    [statusCode: string]: {
      description: string;
      schema?: Record<string, unknown>;
    };
  };
  examples: {
    request?: string;
    response?: string;
  };
  rateLimit: number;
  tags: string[];
}

export default function APIDocsPage() {
  const { t } = useTranslations();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadAPIDocsData = async () => {
      try {
        // Prevent multiple simultaneous loads
        if (isLoading || hasLoadedRef.current) {
          return;
        }
        
        setIsLoading(true);
        
        // Only load data if user is authenticated and not loading
        if (!user || authLoading) {
          setIsLoading(false);
          return;
        }
        
        // Load real data from API with error handling
        const [endpointsData, categoriesData] = await Promise.allSettled([
          realApi.getAPIEndpoints(),
          realApi.getAPICategories()
        ]);

        // Handle endpoints data
        if (endpointsData.status === 'fulfilled') {
          const endpoints = endpointsData.value || [];
          setEndpoints(Array.isArray(endpoints) ? endpoints as unknown as APIEndpoint[] : []);
        } else {
          console.warn('Failed to load API endpoints:', endpointsData.reason);
          // Provide fallback endpoints data
          setEndpoints([
            {
              _id: "fallback-1",
              path: "/api/v1/auth/login",
              method: "POST" as const,
              description: "Authenticate user and return access token",
              category: "Authentication",
              version: "v1",
              authentication: "none" as const,
              parameters: {
                body: {
                  email: { type: "string", required: true, description: "User email address" },
                  password: { type: "string", required: true, description: "User password" }
                }
              },
              responses: {
                "200": {
                  description: "Login successful",
                  schema: { success: true, data: { user: {}, token: "string" } }
                },
                "401": { description: "Invalid credentials" }
              },
              examples: {
                request: '{"email": "user@example.com", "password": "password123"}',
                response: '{"success": true, "data": {"user": {...}, "token": "jwt_token"}}'
              },
              rateLimit: 100,
              tags: ["auth", "login"]
            }
          ]);
        }

        // Handle categories data
        if (categoriesData.status === 'fulfilled') {
          const categories = categoriesData.value || [];
          setCategories(Array.isArray(categories) ? categories : []);
        } else {
          console.warn('Failed to load API categories:', categoriesData.reason);
          // Provide fallback categories data
          setCategories([
            { _id: "fallback-1", name: t('apiDocs.authentication'), description: t('apiDocs.authenticationDesc') },
            { _id: "fallback-2", name: t('apiDocs.userManagement'), description: t('apiDocs.userManagementDesc') },
            { _id: "fallback-3", name: t('apiDocs.fleetManagement'), description: t('apiDocs.fleetManagementDesc') }
          ]);
        }

        // Only show error toast if both requests failed
        if (endpointsData.status === 'rejected' && categoriesData.status === 'rejected') {
          toast.error('Failed to load API documentation data');
        }

      } catch (error) {
        console.error('Unexpected error loading API docs:', error);
        // Set empty arrays on error - no mock data fallback
        setEndpoints([]);
        setCategories([]);
        toast.error('Failed to load API documentation data');
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    };

    loadAPIDocsData();
  }, [user, authLoading]); // Removed 't' from dependencies to prevent infinite reloads

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAuthIcon = (auth: string) => {
    switch (auth) {
      case "none":
        return <Globe className="h-4 w-4" />;
      case "api_key":
        return <Key className="h-4 w-4" />;
      case "bearer":
        return <Shield className="h-4 w-4" />;
      case "oauth":
        return <Globe className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loadingApiDocumentation')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.apiDocumentation')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.completeReferenceForAllClutchAdminApiEndpoints')}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('dashboard.openApiSpec')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              Available endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              API categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">
              {endpoints.length > 0 ? Math.round(endpoints.reduce((sum, e) => sum + e.rateLimit, 0) / endpoints.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">v1</div>
            <p className="text-xs text-muted-foreground">
              Current API version
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific endpoints by path, description, or tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category._id as string}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name as string)}
              >
                {category.name as string}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <div className="space-y-4">
        {filteredEndpoints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No endpoints found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEndpoints.map((endpoint) => (
            <Card key={endpoint._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                      <Badge variant="outline">{endpoint.version}</Badge>
                    </div>
                    <CardTitle className="text-lg">{endpoint.description}</CardTitle>
                    <CardDescription className="mt-2">
                      Category: {endpoint.category} • Rate Limit: {endpoint.rateLimit}/hour
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      {getAuthIcon(endpoint.authentication)}
                      <span className="capitalize">{endpoint.authentication}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {endpoint.tags && endpoint.tags.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {endpoint.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Endpoint Details Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                    <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                      {selectedEndpoint.path}
                    </code>
                  </div>
                  <CardTitle className="text-xl">{selectedEndpoint.description}</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEndpoint(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Parameters */}
              {selectedEndpoint.parameters && Object.keys(selectedEndpoint.parameters).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                  <div className="space-y-4">
                    {Object.entries(selectedEndpoint.parameters).map(([type, params]) => (
                      <div key={type}>
                        <h4 className="font-medium capitalize mb-2">{type} Parameters</h4>
                        <div className="space-y-2">
                          {Object.entries(params).map(([name, param]) => (
                            <div key={name} className="flex items-start space-x-3 p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <code className="font-mono text-sm">{name}</code>
                                  <Badge variant={param.required ? "destructive" : "secondary"}>
                                    {param.type}
                                  </Badge>
                                  {param.required && (
                                    <Badge variant="outline">Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {param.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses */}
              {selectedEndpoint.responses && Object.keys(selectedEndpoint.responses).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Responses</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedEndpoint.responses).map(([status, response]) => (
                      <div key={status} className="p-3 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={status.startsWith('2') ? "default" : "destructive"}>
                            {status}
                          </Badge>
                          <span className="font-medium">{response.description}</span>
                        </div>
                        {response.schema && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(response.schema, null, 2))}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Schema
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {selectedEndpoint.examples && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="space-y-4">
                    {selectedEndpoint.examples.request && (
                      <div>
                        <h4 className="font-medium mb-2">Request</h4>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{selectedEndpoint.examples.request}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(selectedEndpoint.examples.request || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedEndpoint.examples.response && (
                      <div>
                        <h4 className="font-medium mb-2">Response</h4>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{selectedEndpoint.examples.response}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(selectedEndpoint.examples.response || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
