'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Smartphone, Download, Star, Users, TrendingUp, AlertCircle } from 'lucide-react'

export default function MobileAppStorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Store Management</h1>
          <p className="text-muted-foreground">
            Manage your mobile app listings, reviews, and store performance
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Publish Update
        </Button>
      </div>

      {/* App Store Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2K</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.2K</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* App Store Listings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              iOS App Store
            </CardTitle>
            <CardDescription>
              Manage your iOS app listing and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Version</span>
              <Badge variant="secondary">2.1.0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="default">Live</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">4.6 (2.1K reviews)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Downloads</span>
              <span className="text-sm">820K</span>
            </div>
            <Button variant="outline" className="w-full">
              View in App Store
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Google Play Store
            </CardTitle>
            <CardDescription>
              Manage your Android app listing and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Version</span>
              <Badge variant="secondary">2.0.8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="default">Live</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">4.4 (1.8K reviews)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Downloads</span>
              <span className="text-sm">722K</span>
            </div>
            <Button variant="outline" className="w-full">
              View in Play Store
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            Latest app store reviews and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">5.0</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Excellent app!</p>
                <p className="text-sm text-muted-foreground">
                  "This app has completely transformed how I manage my business. The interface is intuitive and the features are exactly what I needed."
                </p>
                <p className="text-xs text-muted-foreground mt-1">- Sarah M. • iOS • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.0</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Good app, minor issues</p>
                <p className="text-sm text-muted-foreground">
                  "Overall great functionality, but I've noticed some lag when switching between screens. Otherwise very satisfied."
                </p>
                <p className="text-xs text-muted-foreground mt-1">- John D. • Android • 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">5.0</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Perfect for my needs</p>
                <p className="text-sm text-muted-foreground">
                  "Been using this for months now and it's been a game changer. Customer support is also very responsive."
                </p>
                <p className="text-xs text-muted-foreground mt-1">- Maria L. • iOS • 1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
