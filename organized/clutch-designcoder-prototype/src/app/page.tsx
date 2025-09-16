'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Palette, Sparkles, Download, Play, Eye } from 'lucide-react';

interface DesignPrompt {
  id: string;
  text: string;
  framework: string;
  timestamp: Date;
}

interface GeneratedDesign {
  id: string;
  prompt: string;
  html: string;
  css: string;
  js: string;
  framework: string;
  components: string[];
  accessibility: {
    score: number;
    issues: string[];
  };
  performance: {
    score: number;
    metrics: {
      loadTime: number;
      bundleSize: number;
    };
  };
}

export default function ClutchDesignCoder() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null);
  const [designHistory, setDesignHistory] = useState<DesignPrompt[]>([]);
  const [activeTab, setActiveTab] = useState('design');
  const previewRef = useRef<HTMLIFrameElement>(null);

  const frameworks = [
    { value: 'react', label: 'React + TypeScript' },
    { value: 'vue', label: 'Vue.js + TypeScript' },
    { value: 'angular', label: 'Angular' },
    { value: 'vanilla', label: 'Vanilla JS' }
  ];

  const generateDesign = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock generated design based on prompt
    const mockDesign: GeneratedDesign = {
      id: Date.now().toString(),
      prompt: prompt,
      html: generateHTML(prompt, framework),
      css: generateCSS(prompt),
      js: generateJS(prompt, framework),
      framework: framework,
      components: extractComponents(prompt),
      accessibility: {
        score: Math.floor(Math.random() * 20) + 80, // 80-100
        issues: ['Consider adding alt text for images', 'Ensure sufficient color contrast']
      },
      performance: {
        score: Math.floor(Math.random() * 15) + 85, // 85-100
        metrics: {
          loadTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
          bundleSize: Math.floor(Math.random() * 50) + 25 // 25-75KB
        }
      }
    };

    setGeneratedDesign(mockDesign);
    setDesignHistory(prev => [...prev, {
      id: mockDesign.id,
      text: prompt,
      framework: framework,
      timestamp: new Date()
    }]);
    setIsGenerating(false);
  };

  const generateHTML = (prompt: string, framework: string): string => {
    const isDashboard = prompt.toLowerCase().includes('dashboard');
    const isForm = prompt.toLowerCase().includes('form');
    const isCard = prompt.toLowerCase().includes('card');

    if (isDashboard) {
      return `<!-- Generated Dashboard Component -->
<div className="dashboard-container">
  <header className="dashboard-header">
    <h1>Dashboard</h1>
    <div className="user-profile">
      <span>Welcome, User</span>
    </div>
  </header>
  
  <div className="dashboard-grid">
    <div className="stats-card">
      <h3>Total Users</h3>
      <div className="stat-value">1,234</div>
    </div>
    <div className="stats-card">
      <h3>Revenue</h3>
      <div className="stat-value">$45,678</div>
    </div>
    <div className="stats-card">
      <h3>Orders</h3>
      <div className="stat-value">89</div>
    </div>
  </div>
  
  <div className="chart-container">
    <h2>Analytics</h2>
    <div className="chart-placeholder">Chart will be rendered here</div>
  </div>
</div>`;
    }

    if (isForm) {
      return `<!-- Generated Form Component -->
<form className="form-container">
  <h2>Contact Form</h2>
  
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input type="text" id="name" name="name" required />
  </div>
  
  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input type="email" id="email" name="email" required />
  </div>
  
  <div className="form-group">
    <label htmlFor="message">Message</label>
    <textarea id="message" name="message" rows={4} required></textarea>
  </div>
  
  <button type="submit" className="submit-btn">Send Message</button>
</form>`;
    }

    return `<!-- Generated Component -->
<div className="component-container">
  <h2>Generated Component</h2>
  <p>This is a ${framework} component generated from your prompt.</p>
  <button className="action-btn">Click Me</button>
</div>`;
  };

  const generateCSS = (prompt: string): string => {
    return `/* Generated CSS for ${prompt} */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #dc2626;
  margin-top: 0.5rem;
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.submit-btn,
.action-btn {
  background: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover,
.action-btn:hover {
  background: #b91c1c;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-placeholder {
  height: 300px;
  background: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}`;
  };

  const generateJS = (prompt: string, framework: string): string => {
    if (framework === 'react') {
      return `// Generated React Component
import React, { useState, useEffect } from 'react';

const GeneratedComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data logic here
    const fetchData = async () => {
      try {
        setLoading(true);
        // API call logic
        setData({});
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic
    console.log('Form submitted');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="generated-component">
      {/* Component JSX will be rendered here */}
    </div>
  );
};

export default GeneratedComponent;`;
    }

    return `// Generated JavaScript
class GeneratedComponent {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadData();
  }

  bindEvents() {
    // Event binding logic
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Component initialized');
    });
  }

  loadData() {
    // Data loading logic
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        console.log('Data loaded:', data);
      })
      .catch(error => {
        console.error('Error loading data:', error);
      });
  }
}

// Initialize component
new GeneratedComponent();`;
  };

  const extractComponents = (prompt: string): string[] => {
    const components = [];
    if (prompt.toLowerCase().includes('button')) components.push('Button');
    if (prompt.toLowerCase().includes('form')) components.push('Form');
    if (prompt.toLowerCase().includes('card')) components.push('Card');
    if (prompt.toLowerCase().includes('chart')) components.push('Chart');
    if (prompt.toLowerCase().includes('table')) components.push('Table');
    if (prompt.toLowerCase().includes('modal')) components.push('Modal');
    return components.length > 0 ? components : ['Container'];
  };

  const downloadCode = () => {
    if (!generatedDesign) return;

    const files = {
      'component.html': generatedDesign.html,
      'styles.css': generatedDesign.css,
      'script.js': generatedDesign.js
    };

    Object.entries(files).forEach(([filename, content]) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🎨 Clutch DesignCoder
          </h1>
          <p className="text-xl text-slate-600">
            AI-Powered UX Design & Frontend Coding Platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-red-500" />
                  Design Prompt
                </CardTitle>
                <CardDescription>
                  Describe what you want to create and let AI generate the design and code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Framework
                  </label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your design
                  </label>
                  <Textarea
                    placeholder="e.g., Create a modern dashboard with user statistics, charts, and a clean layout..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button
                  onClick={generateDesign}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Design & Code
                    </>
                  )}
                </Button>

                {/* Design History */}
                {designHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Recent Designs</h3>
                    <div className="space-y-2">
                      {designHistory.slice(-3).map((design) => (
                        <div
                          key={design.id}
                          className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                          onClick={() => setPrompt(design.text)}
                        >
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {design.text}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {design.framework}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {design.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            {generatedDesign ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="design" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="css" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    CSS
                  </TabsTrigger>
                  <TabsTrigger value="js" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    JS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="mt-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Live Preview</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Run
                          </Button>
                          <Button size="sm" onClick={downloadCode}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-4 bg-white">
                        <iframe
                          ref={previewRef}
                          srcDoc={`
                            <html>
                              <head>
                                <style>${generatedDesign.css}</style>
                              </head>
                              <body>
                                ${generatedDesign.html}
                                <script>${generatedDesign.js}</script>
                              </body>
                            </html>
                          `}
                          className="w-full h-96 border-0 rounded"
                        />
                      </div>

                      {/* Analytics */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Accessibility</span>
                              <Badge variant={generatedDesign.accessibility.score >= 90 ? "default" : "secondary"}>
                                {generatedDesign.accessibility.score}/100
                              </Badge>
                            </div>
                            {generatedDesign.accessibility.issues.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-slate-600">Issues:</p>
                                <ul className="text-xs text-slate-500">
                                  {generatedDesign.accessibility.issues.map((issue, i) => (
                                    <li key={i}>• {issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Performance</span>
                              <Badge variant={generatedDesign.performance.score >= 90 ? "default" : "secondary"}>
                                {generatedDesign.performance.score}/100
                              </Badge>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              <p>Load: {generatedDesign.performance.metrics.loadTime}ms</p>
                              <p>Size: {generatedDesign.performance.metrics.bundleSize}KB</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Components */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Generated Components</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedDesign.components.map((component, i) => (
                            <Badge key={i} variant="outline">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="html" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated HTML</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedDesign.html}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="css" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated CSS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedDesign.css}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="js" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated JavaScript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{generatedDesign.js}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Sparkles className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-slate-500">
                      Enter a design prompt to see the magic happen
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
