'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Download,
  MoreHorizontal,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Edit
} from 'lucide-react'
import { InteractiveChart, ChartDataPoint, ChartSeries, ChartConfig, chartPresets } from '@/components/charts/interactive-chart'
import { useRealtimeData } from '@/lib/websocket-service'

// Widget types
export type WidgetType = 'chart' | 'metric' | 'table' | 'text' | 'image' | 'iframe'

// Widget configuration
export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  description?: string
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
  refreshInterval?: number
  dataSource?: string
  config?: Record<string, any>
}

// Widget data
export interface WidgetData {
  id: string
  config: WidgetConfig
  data?: any
  lastUpdated?: Date
  isLoading?: boolean
  error?: string
}

// Widget component props
interface WidgetProps {
  widget: WidgetData
  onUpdate: (widget: WidgetData) => void
  onDelete: (widgetId: string) => void
  onDuplicate: (widget: WidgetData) => void
  onEdit: (widget: WidgetData) => void
  isEditing?: boolean
  className?: string
}

export function Widget({ 
  widget, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onEdit, 
  isEditing = false,
  className = '' 
}: WidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real-time data for widget
  const { data: realtimeData, isLoading, error, refresh } = useRealtimeData(
    widget.config.dataSource || `widget-${widget.id}`,
    widget.data,
    {
      autoConnect: true,
      onUpdate: (newData) => {
        onUpdate({
          ...widget,
          data: newData,
          lastUpdated: new Date()
        })
      }
    }
  )

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [refresh])

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(() => {
    onUpdate({
      ...widget,
      config: {
        ...widget.config,
        visible: !widget.config.visible
      }
    })
  }, [widget, onUpdate])

  // Handle expand/collapse
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  // Render widget content based on type
  const renderWidgetContent = () => {
    switch (widget.config.type) {
      case 'chart':
        return <ChartWidget widget={widget} data={realtimeData} />
      case 'metric':
        return <MetricWidget widget={widget} data={realtimeData} />
      case 'table':
        return <TableWidget widget={widget} data={realtimeData} />
      case 'text':
        return <TextWidget widget={widget} data={realtimeData} />
      case 'image':
        return <ImageWidget widget={widget} data={realtimeData} />
      case 'iframe':
        return <IframeWidget widget={widget} data={realtimeData} />
      default:
        return <div className="text-center text-muted-foreground">Unknown widget type</div>
    }
  }

  if (!widget.config.visible) {
    return null
  }

  return (
    <Card 
      className={`relative group ${isExpanded ? 'fixed inset-4 z-50' : ''} ${className}`}
      style={{
        gridColumn: `span ${widget.config.position.w}`,
        gridRow: `span ${widget.config.position.h}`
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button variant="ghost" size="sm" className="cursor-move">
                <GripVertical className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-sm font-medium">{widget.config.title}</CardTitle>
            {widget.config.refreshInterval && (
              <Badge variant="outline" className="text-xs">
                Auto-refresh
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleExpand}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {isEditing && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onEdit(widget)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDuplicate(widget)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToggleVisibility}>
                  <EyeOff className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(widget.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        {widget.config.description && (
          <CardDescription className="text-xs">{widget.config.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm">
            <p>Error loading widget data</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          renderWidgetContent()
        )}
        {widget.lastUpdated && (
          <div className="text-xs text-muted-foreground mt-2">
            Last updated: {widget.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Chart Widget Component
function ChartWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const chartConfig: ChartConfig = (widget.config.config as ChartConfig) || chartPresets.revenue
  const chartData: ChartSeries[] = data || [
    {
      name: 'Revenue',
      data: [
        { label: 'Jan', value: 1000 },
        { label: 'Feb', value: 1200 },
        { label: 'Mar', value: 1100 },
        { label: 'Apr', value: 1300 }
      ]
    }
  ]

  return (
    <InteractiveChart
      config={chartConfig}
      data={chartData}
      onDrillDown={(dataPoint, series) => {
        console.log('Chart drill-down:', dataPoint, series)
      }}
      onExport={(format) => {
        console.log('Export chart as:', format)
      }}
    />
  )
}

// Metric Widget Component
function MetricWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const metric = data || { value: 0, change: 0, label: 'Metric' }
  
  return (
    <div className="text-center">
      <div className="text-3xl font-bold">{metric.value}</div>
      <div className="text-sm text-muted-foreground">{metric.label}</div>
      {metric.change !== undefined && (
        <div className={`text-xs ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {metric.change >= 0 ? '+' : ''}{metric.change}%
        </div>
      )}
    </div>
  )
}

// Table Widget Component
function TableWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const tableData = data || [
    { name: 'Item 1', value: 100 },
    { name: 'Item 2', value: 200 },
    { name: 'Item 3', value: 150 }
  ]

  return (
    <div className="space-y-2">
      {tableData.map((row: any, index: number) => (
        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
          <span className="text-sm">{row.name}</span>
          <span className="text-sm font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

// Text Widget Component
function TextWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const text = data || widget.config.config?.text || 'No content'

  return (
    <div className="prose prose-sm max-w-none">
      <p>{text}</p>
    </div>
  )
}

// Image Widget Component
function ImageWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const imageUrl = data || widget.config.config?.imageUrl

  return (
    <div className="text-center">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={widget.config.title}
          className="max-w-full h-auto rounded"
        />
      ) : (
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
          <span className="text-muted-foreground">No image</span>
        </div>
      )}
    </div>
  )
}

// Iframe Widget Component
function IframeWidget({ widget, data }: { widget: WidgetData; data: any }) {
  const iframeUrl = data || widget.config.config?.iframeUrl

  return (
    <div className="h-64">
      {iframeUrl ? (
        <iframe 
          src={iframeUrl}
          className="w-full h-full border-0 rounded"
          title={widget.config.title}
        />
      ) : (
        <div className="h-full bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
          <span className="text-muted-foreground">No iframe URL</span>
        </div>
      )}
    </div>
  )
}

// Widget Library
export const widgetLibrary = {
  chart: {
    name: 'Chart',
    description: 'Interactive charts and graphs',
    icon: '📊',
    defaultConfig: {
      type: 'chart' as WidgetType,
      title: 'New Chart',
      position: { x: 0, y: 0, w: 6, h: 4 },
      visible: true,
      config: chartPresets.revenue
    }
  },
  metric: {
    name: 'Metric',
    description: 'Key performance indicators',
    icon: '📈',
    defaultConfig: {
      type: 'metric' as WidgetType,
      title: 'New Metric',
      position: { x: 0, y: 0, w: 3, h: 2 },
      visible: true,
      config: {}
    }
  },
  table: {
    name: 'Table',
    description: 'Data tables and lists',
    icon: '📋',
    defaultConfig: {
      type: 'table' as WidgetType,
      title: 'New Table',
      position: { x: 0, y: 0, w: 6, h: 4 },
      visible: true,
      config: {}
    }
  },
  text: {
    name: 'Text',
    description: 'Rich text content',
    icon: '📝',
    defaultConfig: {
      type: 'text' as WidgetType,
      title: 'New Text',
      position: { x: 0, y: 0, w: 4, h: 2 },
      visible: true,
      config: { text: 'Enter your text here...' }
    }
  },
  image: {
    name: 'Image',
    description: 'Images and media',
    icon: '🖼️',
    defaultConfig: {
      type: 'image' as WidgetType,
      title: 'New Image',
      position: { x: 0, y: 0, w: 4, h: 3 },
      visible: true,
      config: {}
    }
  },
  iframe: {
    name: 'Iframe',
    description: 'Embedded content',
    icon: '🌐',
    defaultConfig: {
      type: 'iframe' as WidgetType,
      title: 'New Iframe',
      position: { x: 0, y: 0, w: 6, h: 4 },
      visible: true,
      config: {}
    }
  }
}
