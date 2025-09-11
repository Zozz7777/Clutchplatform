'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Bell, Send, Users, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function MobileNotificationsPage() {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    target: 'all',
    schedule: 'now'
  })

  const notifications = [
    {
      id: 1,
      title: 'New Feature Available',
      message: 'Check out our latest update with improved performance and new features!',
      target: 'All Users',
      sent: '2024-01-15 10:30 AM',
      status: 'delivered',
      opens: 1250,
      clicks: 340
    },
    {
      id: 2,
      title: 'Maintenance Notice',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
      target: 'All Users',
      sent: '2024-01-14 3:45 PM',
      status: 'delivered',
      opens: 2100,
      clicks: 120
    },
    {
      id: 3,
      title: 'Welcome to Clutch!',
      message: 'Thanks for downloading our app. Get started with these helpful tips.',
      target: 'New Users',
      sent: '2024-01-13 9:15 AM',
      status: 'delivered',
      opens: 890,
      clicks: 450
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
          <p className="text-muted-foreground">
            Send targeted push notifications to your mobile app users
          </p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </div>

      {/* Notification Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.2%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.1%</div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2K</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Notification */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
            <CardDescription>
              Send a push notification to your users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={notification.title}
                onChange={(e) => setNotification({...notification, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Notification message"
                value={notification.message}
                onChange={(e) => setNotification({...notification, message: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target Audience</Label>
              <select
                id="target"
                className="w-full p-2 border rounded-md"
                value={notification.target}
                onChange={(e) => setNotification({...notification, target: e.target.value})}
              >
                <option value="all">All Users</option>
                <option value="new">New Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <select
                id="schedule"
                className="w-full p-2 border rounded-md"
                value={notification.schedule}
                onChange={(e) => setNotification({...notification, schedule: e.target.value})}
              >
                <option value="now">Send Now</option>
                <option value="schedule">Schedule for Later</option>
              </select>
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        {/* Notification Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
            <CardDescription>
              Use pre-built notification templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <h4 className="font-medium">Welcome Message</h4>
              <p className="text-sm text-muted-foreground">Welcome new users to your app</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <h4 className="font-medium">Feature Update</h4>
              <p className="text-sm text-muted-foreground">Announce new features and improvements</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <h4 className="font-medium">Maintenance Notice</h4>
              <p className="text-sm text-muted-foreground">Inform users about scheduled maintenance</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <h4 className="font-medium">Promotional Offer</h4>
              <p className="text-sm text-muted-foreground">Share special offers and discounts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Your recent push notification campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{notif.title}</h4>
                    <Badge variant={notif.status === 'delivered' ? 'default' : 'secondary'}>
                      {notif.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {notif.target}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.sent}
                    </span>
                    <span>{notif.opens} opens</span>
                    <span>{notif.clicks} clicks</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
