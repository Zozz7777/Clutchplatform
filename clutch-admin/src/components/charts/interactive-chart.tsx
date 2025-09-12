'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { useRealtimeData } from '@/lib/websocket-service'

// Chart types
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter'

// Chart data interfaces
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  color?: string
  type?: ChartType
}

export interface ChartConfig {
  type: ChartType
  title: string
  description?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
  showGrid?: boolean
  animated?: boolean
  drillDownEnabled?: boolean
  exportEnabled?: boolean
  realtimeEnabled?: boolean
}

interface InteractiveChartProps {
  config: ChartConfig
  data: ChartSeries[]
  onDrillDown?: (dataPoint: ChartDataPoint, series: ChartSeries) => void
  onExport?: (format: 'png' | 'svg' | 'csv') => void
  className?: string
}

export function InteractiveChart({
  config,
  data,
  onDrillDown,
  onExport,
  className = ''
}: InteractiveChartProps) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<ChartSeries | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isDrilledDown, setIsDrilledDown] = useState(false)
  const [drillDownHistory, setDrillDownHistory] = useState<Array<{ dataPoint: ChartDataPoint; series: ChartSeries }>>([])

  // Real-time data integration
  const { data: realtimeData, isConnected } = useRealtimeData(
    `chart-${config.title.toLowerCase().replace(/\s+/g, '-')}`,
    data,
    {
      autoConnect: config.realtimeEnabled,
      onUpdate: (newData) => {
        // Update chart data when real-time data arrives
        console.log('Real-time chart data updated:', newData)
      }
    }
  )

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return realtimeData

    return realtimeData.map(series => ({
      ...series,
      data: series.data.filter(point => {
        return Object.entries(filters).every(([key, value]) => {
          if (point.metadata && point.metadata[key] !== undefined) {
            return point.metadata[key] === value
          }
          return true
        })
      })
    }))
  }, [realtimeData, filters])

  // Handle data point click for drill-down
  const handleDataPointClick = useCallback((dataPoint: ChartDataPoint, series: ChartSeries) => {
    if (config.drillDownEnabled && onDrillDown) {
      setSelectedDataPoint(dataPoint)
      setSelectedSeries(series)
      setIsDrilledDown(true)
      setDrillDownHistory(prev => [...prev, { dataPoint, series }])
      onDrillDown(dataPoint, series)
    }
  }, [config.drillDownEnabled, onDrillDown])

  // Handle drill-up (go back)
  const handleDrillUp = useCallback(() => {
    if (drillDownHistory.length > 0) {
      const newHistory = drillDownHistory.slice(0, -1)
      setDrillDownHistory(newHistory)
      
      if (newHistory.length === 0) {
        setIsDrilledDown(false)
        setSelectedDataPoint(null)
        setSelectedSeries(null)
      } else {
        const lastItem = newHistory[newHistory.length - 1]
        setSelectedDataPoint(lastItem.dataPoint)
        setSelectedSeries(lastItem.series)
      }
    }
  }, [drillDownHistory])

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  // Handle export
  const handleExport = useCallback((format: 'png' | 'svg' | 'csv') => {
    if (onExport) {
      onExport(format)
    }
  }, [onExport])

  // Render chart based on type
  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return <LineChartComponent data={filteredData} onDataPointClick={handleDataPointClick} zoomLevel={zoomLevel} />
      case 'bar':
        return <BarChartComponent data={filteredData} onDataPointClick={handleDataPointClick} zoomLevel={zoomLevel} />
      case 'pie':
        return <PieChartComponent data={filteredData} onDataPointClick={handleDataPointClick} />
      case 'area':
        return <AreaChartComponent data={filteredData} onDataPointClick={handleDataPointClick} zoomLevel={zoomLevel} />
      case 'scatter':
        return <ScatterChartComponent data={filteredData} onDataPointClick={handleDataPointClick} zoomLevel={zoomLevel} />
      default:
        return <div className="text-center text-muted-foreground">Unsupported chart type</div>
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {config.type === 'line' && <LineChart className="h-5 w-5" />}
              {config.type === 'bar' && <BarChart3 className="h-5 w-5" />}
              {config.type === 'pie' && <PieChart className="h-5 w-5" />}
              {config.title}
              {isConnected && (
                <Badge variant="secondary" className="ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Live
                </Badge>
              )}
            </CardTitle>
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDrilledDown && (
              <Button variant="outline" size="sm" onClick={handleDrillUp}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            {config.exportEnabled && (
              <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Zoom: {Math.round(zoomLevel * 100)}%</span>
              {Object.keys(filters).length > 0 && (
                <Badge variant="outline">
                  <Filter className="h-3 w-3 mr-1" />
                  {Object.keys(filters).length} filter(s)
                </Badge>
              )}
            </div>
            {selectedDataPoint && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedDataPoint.label} ({selectedDataPoint.value})
              </div>
            )}
          </div>

          {/* Chart Container */}
          <div 
            className="relative overflow-hidden rounded-lg border"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {renderChart()}
          </div>

          {/* Chart Legend */}
          {config.showLegend && (
            <div className="flex flex-wrap gap-2">
              {filteredData.map((series, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: series.color || `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span className="text-sm">{series.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Individual chart components (simplified implementations)
function LineChartComponent({ 
  data, 
  onDataPointClick, 
  zoomLevel 
}: { 
  data: ChartSeries[]
  onDataPointClick: (point: ChartDataPoint, series: ChartSeries) => void
  zoomLevel: number
}) {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
      <div className="text-center">
        <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Line Chart</p>
        <p className="text-xs text-muted-foreground">Interactive line chart with {data.length} series</p>
      </div>
    </div>
  )
}

function BarChartComponent({ 
  data, 
  onDataPointClick, 
  zoomLevel 
}: { 
  data: ChartSeries[]
  onDataPointClick: (point: ChartDataPoint, series: ChartSeries) => void
  zoomLevel: number
}) {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Bar Chart</p>
        <p className="text-xs text-muted-foreground">Interactive bar chart with {data.length} series</p>
      </div>
    </div>
  )
}

function PieChartComponent({ 
  data, 
  onDataPointClick 
}: { 
  data: ChartSeries[]
  onDataPointClick: (point: ChartDataPoint, series: ChartSeries) => void
}) {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
      <div className="text-center">
        <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Pie Chart</p>
        <p className="text-xs text-muted-foreground">Interactive pie chart with {data.length} series</p>
      </div>
    </div>
  )
}

function AreaChartComponent({ 
  data, 
  onDataPointClick, 
  zoomLevel 
}: { 
  data: ChartSeries[]
  onDataPointClick: (point: ChartDataPoint, series: ChartSeries) => void
  zoomLevel: number
}) {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
      <div className="text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Area Chart</p>
        <p className="text-xs text-muted-foreground">Interactive area chart with {data.length} series</p>
      </div>
    </div>
  )
}

function ScatterChartComponent({ 
  data, 
  onDataPointClick, 
  zoomLevel 
}: { 
  data: ChartSeries[]
  onDataPointClick: (point: ChartDataPoint, series: ChartSeries) => void
  zoomLevel: number
}) {
  return (
    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded">
      <div className="text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Scatter Chart</p>
        <p className="text-xs text-muted-foreground">Interactive scatter chart with {data.length} series</p>
      </div>
    </div>
  )
}

// Chart configuration presets
export const chartPresets = {
  revenue: {
    type: 'line' as ChartType,
    title: 'Revenue Trends',
    description: 'Monthly revenue trends over time',
    xAxisLabel: 'Month',
    yAxisLabel: 'Revenue (£)',
    showLegend: true,
    showGrid: true,
    animated: true,
    drillDownEnabled: true,
    exportEnabled: true,
    realtimeEnabled: true
  },
  users: {
    type: 'bar' as ChartType,
    title: 'User Growth',
    description: 'User registration and activity metrics',
    xAxisLabel: 'Period',
    yAxisLabel: 'Users',
    showLegend: true,
    showGrid: true,
    animated: true,
    drillDownEnabled: true,
    exportEnabled: true,
    realtimeEnabled: true
  },
  performance: {
    type: 'area' as ChartType,
    title: 'System Performance',
    description: 'Real-time system performance metrics',
    xAxisLabel: 'Time',
    yAxisLabel: 'Performance (%)',
    showLegend: true,
    showGrid: true,
    animated: true,
    drillDownEnabled: false,
    exportEnabled: true,
    realtimeEnabled: true
  }
}
