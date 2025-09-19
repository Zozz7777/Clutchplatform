"use client";

import React, { useState, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAPIDocsData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from API
        const [endpointsData, categoriesData] = await Promise.all([
          realApi.getAPIEndpoints(),
          realApi.getAPICategories()
        ]);

        setEndpoints(endpointsData || []);
        setCategories(categoriesData || []);
        
      } catch (error) {
        // Error handled by API service
        toast.error(t('apiDocs.failedToLoadAPIDocsData'));
        // Set empty arrays on error - no mock data fallback
        setEndpoints([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAPIDocsData();
  }, [t]);

  // No mock data - using real API data only

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-primary/10 text-primary-foreground";
      case "POST":
        return "bg-secondary/10 text-primary-foreground";
      case "PUT":
        return "bg-secondary/10 text-primary-foreground";
      case "DELETE":
        return "bg-destructive/10 text-destructive-foreground";
      case "PATCH":
        return "bg-primary/10 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getAuthIcon = (auth: string) => {
    switch (auth) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">{t('apiDocs.title')}</h1>
          <p className="text-muted-foreground">
            {t('apiDocs.description')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Postman Collection
          </Button>
        </div>
      </div>

      {/* API Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">API Version</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">v1</div>
            <p className="text-xs text-muted-foreground">
              Current version
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base URL</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">https://clutch-main-nk7x.onrender.com</div>
            <p className="text-xs text-muted-foreground">
              Production endpoint
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Bearer Token</div>
            <p className="text-xs text-muted-foreground">
              JWT-based auth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>API Categories</CardTitle>
          <CardDescription>
            Browse endpoints by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Code className="h-6 w-6" />
              <span className="text-sm">All</span>
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Search and explore all available API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEndpoints.map((endpoint) => (
              <Card key={endpoint._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        <Badge variant="outline">{endpoint.category}</Badge>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          {getAuthIcon(endpoint.authentication)}
                          <span className="text-sm">{endpoint.authentication}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Rate limit: {endpoint.rateLimit}/hour</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="h-4 w-4" />
                          <span>Version: {endpoint.version}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Tags: {endpoint.tags.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`curl -X ${endpoint.method} https://clutch-main-nk7x.onrender.com${endpoint.path}`)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy cURL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Details Modal */}
      {selectedEndpoint && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border-2">
          <CardHeader className="sticky top-0 bg-background border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <Badge className={getMethodColor(selectedEndpoint.method)}>
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                </CardTitle>
                <CardDescription className="mt-2">{selectedEndpoint.description}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedEndpoint(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Parameters */}
              {Object.keys(selectedEndpoint.parameters).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                  {Object.entries(selectedEndpoint.parameters).map(([type, params]) => (
                    <div key={type} className="mb-4">
                      <h4 className="font-medium capitalize mb-2">{type} Parameters</h4>
                      <div className="bg-muted p-4 rounded-[0.625rem]">
                        {Object.entries(params).map(([name, param]) => (
                          <div key={name} className="mb-2">
                            <div className="flex items-center space-x-2">
                              <code className="font-mono bg-background px-2 py-1 rounded-[0.625rem] border border-border">
                                {name}
                              </code>
                              <Badge variant={param.required ? "default" : "outline"}>
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge className="bg-destructive/10 text-destructive-foreground">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Responses */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Responses</h3>
                <div className="space-y-3">
                  {Object.entries(selectedEndpoint.responses).map(([status, response]) => (
                    <div key={status} className="border border-border rounded-[0.625rem] p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={status.startsWith("2") ? "bg-primary/10 text-primary-foreground" : "bg-destructive/10 text-destructive-foreground"}>
                          {status}
                        </Badge>
                        <span className="font-medium">{response.description}</span>
                      </div>
                      {response.schema && (
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {JSON.stringify(response.schema, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              {selectedEndpoint.examples && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEndpoint.examples.request && (
                      <div>
                        <h4 className="font-medium mb-2">Request</h4>
                        <div className="bg-muted text-primary p-4 rounded-[0.625rem]">
                          <pre className="text-sm overflow-x-auto">
                            {selectedEndpoint.examples.request}
                          </pre>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyToClipboard(selectedEndpoint.examples.request || "")}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Request
                        </Button>
                      </div>
                    )}
                    {selectedEndpoint.examples.response && (
                      <div>
                        <h4 className="font-medium mb-2">Response</h4>
                        <div className="bg-muted text-secondary p-4 rounded-[0.625rem]">
                          <pre className="text-sm overflow-x-auto">
                            {selectedEndpoint.examples.response}
                          </pre>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => copyToClipboard(selectedEndpoint.examples.response || "")}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Response
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
