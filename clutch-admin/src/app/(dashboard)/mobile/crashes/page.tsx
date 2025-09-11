'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Bug, Smartphone, Users, TrendingDown, Clock, Filter } from 'lucide-react'

export default function MobileCrashesPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  const crashes = [
    {
      id: 1,
      error: 'NullPointerException',
      message: 'Attempt to invoke virtual method on null object reference',
      appVersion: '2.1.0',
      osVersion: 'Android 14',
      device: 'Samsung Galaxy S24',
      users: 45,
      occurrences: 127,
      firstSeen: '2024-01-15 10:30 AM',
      lastSeen: '2024-01-15 2:45 PM',
      status: 'new',
      severity: 'high'
    },
    {
      id: 2,
      error: 'OutOfMemoryError',
      message: 'Java heap space',
      appVersion: '2.0.8',
      osVersion: 'iOS 17.2',
      device: 'iPhone 15 Pro',
      users: 23,
      occurrences: 89,
      firstSeen: '2024-01-14 3:15 PM',
      lastSeen: '2024-01-15 1:20 PM',
      status: 'investigating',
      severity: 'medium'
    },
    {
      id: 3,
      error: 'NetworkException',
      message: 'Connection timeout after 30 seconds',
      appVersion: '2.1.0',
      osVersion: 'Android 13',
      device: 'Google Pixel 7',
      users: 12,
      occurrences: 34,
      firstSeen: '2024-01-13 9:45 AM',
      lastSeen: '2024-01-15 11:30 AM',
      status: 'resolved',
      severity: 'low'
    },
    {
      id: 4,
      error: 'IllegalStateException',
      message: 'Fragment not attached to Activity',
      appVersion: '2.0.8',
      osVersion: 'iOS 16.7',
      device: 'iPhone 14',
      users: 8,
      occurrences: 22,
      firstSeen: '2024-01-12 2:20 PM',
      lastSeen: '2024-01-14 6:15 PM',
      status: 'resolved',
      severity: 'low'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'destructive'
      case 'investigating': return 'default'
      case 'resolved': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crash Analytics</h1>
          <p className="text-muted-foreground">
            Monitor and analyze app crashes and errors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Crash Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crashes</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">272</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88</div>
            <p className="text-xs text-muted-foreground">
              -5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crash Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">
              -0.01% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Crash List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Crashes</CardTitle>
          <CardDescription>
            Latest crash reports and error details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crashes.map((crash) => (
              <div key={crash.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-red-600">{crash.error}</h4>
                      <Badge variant={getSeverityColor(crash.severity)}>
                        {crash.severity}
                      </Badge>
                      <Badge variant={getStatusColor(crash.status)}>
                        {crash.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{crash.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {crash.device} ({crash.osVersion})
                      </span>
                      <span>v{crash.appVersion}</span>
                      <span>{crash.users} users affected</span>
                      <span>{crash.occurrences} occurrences</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Mark Resolved
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    First seen: {crash.firstSeen}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last seen: {crash.lastSeen}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crash Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crash Trends</CardTitle>
            <CardDescription>
              Crash frequency over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingDown className="h-12 w-12 mx-auto mb-2" />
                <p>Crash trend chart would be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Crash Sources</CardTitle>
            <CardDescription>
              Most common crash locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">MainActivity.java:45</span>
                <Badge variant="destructive">127 crashes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">NetworkManager.swift:23</span>
                <Badge variant="default">89 crashes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">UserProfileFragment.kt:78</span>
                <Badge variant="secondary">34 crashes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PaymentProcessor.java:156</span>
                <Badge variant="secondary">22 crashes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
