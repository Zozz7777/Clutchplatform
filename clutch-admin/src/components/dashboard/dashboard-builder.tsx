'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  Grid3X3, 
  Layout, 
  Palette,
  Download,
  Upload,
  Trash2,
  Copy,
  Edit,
  GripVertical
} from 'lucide-react'
import { Widget, WidgetData, WidgetConfig, widgetLibrary } from './widget-system'
import { useToast } from '@/components/ui/toast'

// Dashboard configuration
export interface DashboardConfig {
  id: string
  name: string
  description?: string
  layout: 'grid' | 'freeform'
  gridSize: { columns: number; rows: number }
  widgets: WidgetData[]
  theme?: 'light' | 'dark' | 'auto'
  createdAt: Date
  updatedAt: Date
}

// Dashboard builder props
interface DashboardBuilderProps {
  initialConfig?: DashboardConfig
  onSave?: (config: DashboardConfig) => void
  onPreview?: (config: DashboardConfig) => void
  className?: string
}

export function DashboardBuilder({
  initialConfig,
  onSave,
  onPreview,
  className = ''
}: DashboardBuilderProps) {
  const [config, setConfig] = useState<DashboardConfig>(
    initialConfig || {
      id: `dashboard-${Date.now()}`,
      name: 'New Dashboard',
      description: '',
      layout: 'grid',
      gridSize: { columns: 12, rows: 8 },
      widgets: [],
      theme: 'auto',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  )
  
  const [isEditing, setIsEditing] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<WidgetData | null>(null)
  const toast = useToast()

  // Add widget to dashboard
  const addWidget = useCallback((widgetType: keyof typeof widgetLibrary) => {
    const widgetTemplate = widgetLibrary[widgetType]
    const newWidget: WidgetData = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      config: {
        ...widgetTemplate.defaultConfig,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      data: null,
      lastUpdated: new Date()
    }

    setConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date()
    }))

    toast.success('Widget added successfully')
  }, [toast])

  // Update widget
  const updateWidget = useCallback((updatedWidget: WidgetData) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === updatedWidget.id ? updatedWidget : widget
      ),
      updatedAt: new Date()
    }))
  }, [])

  // Delete widget
  const deleteWidget = useCallback((widgetId: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
      updatedAt: new Date()
    }))
    toast.success('Widget deleted')
  }, [toast])

  // Duplicate widget
  const duplicateWidget = useCallback((widget: WidgetData) => {
    const duplicatedWidget: WidgetData = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      config: {
        ...widget.config,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${widget.config.title} (Copy)`
      }
    }

    setConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, duplicatedWidget],
      updatedAt: new Date()
    }))

    toast.success('Widget duplicated')
  }, [toast])

  // Edit widget
  const editWidget = useCallback((widget: WidgetData) => {
    setSelectedWidget(widget.id)
    // Open widget editor modal
    console.log('Edit widget:', widget)
  }, [])

  // Save dashboard
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(config)
    }
    toast.success('Dashboard saved successfully')
  }, [config, onSave, toast])

  // Preview dashboard
  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(config)
    }
  }, [config, onPreview])

  // Export dashboard
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${config.name.replace(/\s+/g, '-').toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Dashboard exported successfully')
  }, [config, toast])

  // Import dashboard
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig(importedConfig)
        toast.success('Dashboard imported successfully')
      } catch (error) {
        toast.error('Failed to import dashboard', 'Invalid file format')
      }
    }
    reader.readAsText(file)
  }, [toast])

  // Grid layout styles
  const gridStyles = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${config.gridSize.columns}, 1fr)`,
    gridTemplateRows: `repeat(${config.gridSize.rows}, 1fr)`,
    gap: '1rem',
    minHeight: '600px'
  }), [config.gridSize])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Builder Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Builder</h1>
          <p className="text-muted-foreground">
            Create and customize your dashboard with drag-and-drop widgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Dashboard Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Dashboard Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Layout</label>
              <select
                value={config.layout}
                onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value as 'grid' | 'freeform' }))}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grid Layout</option>
                <option value="freeform">Freeform Layout</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Theme</label>
              <select
                value={config.theme}
                onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Library */}
      {showWidgetLibrary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Widget Library
            </CardTitle>
            <CardDescription>
              Choose from available widgets to add to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {Object.entries(widgetLibrary).map(([key, widget]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="h-auto p-4 flex-col items-center gap-2"
                  onClick={() => addWidget(key as keyof typeof widgetLibrary)}
                >
                  <span className="text-2xl">{widget.icon}</span>
                  <div className="text-center">
                    <div className="font-medium text-sm">{widget.name}</div>
                    <div className="text-xs text-muted-foreground">{widget.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Canvas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Dashboard Canvas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {config.widgets.length} widgets
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {config.widgets.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your dashboard by adding widgets from the library
              </p>
              <Button onClick={() => setShowWidgetLibrary(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          ) : (
            <div 
              className="dashboard-grid"
              style={gridStyles}
            >
              {config.widgets.map((widget) => (
                <Widget
                  key={widget.id}
                  widget={widget}
                  onUpdate={updateWidget}
                  onDelete={deleteWidget}
                  onDuplicate={duplicateWidget}
                  onEdit={editWidget}
                  isEditing={isEditing}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: {config.updatedAt.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Dashboard
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

// Dashboard preview component
export function DashboardPreview({ config }: { config: DashboardConfig }) {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.gridSize.columns}, 1fr)`,
    gridTemplateRows: `repeat(${config.gridSize.rows}, 1fr)`,
    gap: '1rem',
    minHeight: '600px'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.name}</h1>
          {config.description && (
            <p className="text-muted-foreground">{config.description}</p>
          )}
        </div>
        <Badge variant="outline">
          {config.widgets.length} widgets
        </Badge>
      </div>

      <div className="dashboard-grid" style={gridStyles}>
        {config.widgets.map((widget) => (
          <Widget
            key={widget.id}
            widget={widget}
            onUpdate={() => {}}
            onDelete={() => {}}
            onDuplicate={() => {}}
            onEdit={() => {}}
            isEditing={false}
          />
        ))}
      </div>
    </div>
  )
}
