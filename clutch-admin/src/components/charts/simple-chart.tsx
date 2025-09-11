'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'

interface ChartDataPoint {
  label: string
  value: number
  change?: number
  color?: string
}

interface SimpleChartProps {
  title: string
  data: ChartDataPoint[]
  type?: 'bar' | 'line' | 'donut'
  height?: number
  showTrend?: boolean
  className?: string
}

export default function SimpleChart({
  title,
  data,
  type = 'bar',
  height = 200,
  showTrend = true,
  className = ''
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const totalValue = data.reduce((sum, d) => sum + d.value, 0)

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4 text-slate-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success" />
    return <TrendingDown className="h-4 w-4 text-error" />
  }

  const getTrendColor = (change?: number) => {
    if (!change) return 'text-slate-500'
    if (change > 0) return 'text-success'
    return 'text-error'
  }

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
              {showTrend && item.change !== undefined && (
                <div className={`flex items-center space-x-1 ${getTrendColor(item.change)}`}>
                  {getTrendIcon(item.change)}
                  <span className="text-xs font-medium">
                    {Math.abs(item.change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                item.color || 'bg-clutch-primary'
              }`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent, index) => (
          <line
            key={index}
            x1="0"
            y1={`${percent}%`}
            x2="100%"
            y2={`${percent}%`}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#ED1B24"
          strokeWidth="2"
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return `${x},${y}`
          }).join(' ')}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (item.value / maxValue) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#ED1B24"
              className="hover:r-6 transition-all"
            />
          )
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500">
        {data.map((item, index) => (
          <span key={index} className="text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )

  const renderDonutChart = () => {
    const radius = 60
    const strokeWidth = 20
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI

    let cumulativePercentage = 0

    return (
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / totalValue) * 100
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
              
              cumulativePercentage += percentage
              
              return (
                <circle
                  key={index}
                  stroke={item.color || '#ED1B24'}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || '#ED1B24' }}
              />
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">
                {((item.value / totalValue) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart()
      case 'donut':
        return renderDonutChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <SnowCard className={className}>
      <SnowCardHeader>
        <SnowCardTitle>{title}</SnowCardTitle>
      </SnowCardHeader>
      <SnowCardContent>
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="text-center">
              <div className="text-sm">No data available</div>
              <div className="text-xs mt-1">Data will appear here when available</div>
            </div>
          </div>
        )}
      </SnowCardContent>
    </SnowCard>
  )
}
