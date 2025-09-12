'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Flag, ToggleLeft, ToggleRight, Users, Target, Clock, Settings } from 'lucide-react'

export default function MobileFeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = useState([
    {
      id: 1,
      name: 'dark_mode',
      displayName: 'Dark Mode',
      description: 'Enable dark mode for the mobile app',
      enabled: true,
      rollout: 100,
      targetUsers: 'All Users',
      lastModified: '2024-01-15 2:30 PM',
      createdBy: 'John Doe'
    },
    {
      id: 2,
      name: 'new_dashboard',
      displayName: 'New Dashboard',
      description: 'Roll out the redesigned dashboard interface',
      enabled: false,
      rollout: 25,
      targetUsers: 'Beta Users',
      lastModified: '2024-01-14 10:15 AM',
      createdBy: 'Jane Smith'
    },
    {
      id: 3,
      name: 'push_notifications',
      displayName: 'Push Notifications',
      description: 'Enable push notification system',
      enabled: true,
      rollout: 100,
      targetUsers: 'All Users',
      lastModified: '2024-01-13 4:45 PM',
      createdBy: 'Mike Johnson'
    },
    {
      id: 4,
      name: 'ai_recommendations',
      displayName: 'AI Recommendations',
      description: 'Enable AI-powered content recommendations',
      enabled: false,
      rollout: 0,
      targetUsers: 'Premium Users',
      lastModified: '2024-01-12 9:20 AM',
      createdBy: 'Sarah Wilson'
    }
  ])

  const [newFlag, setNewFlag] = useState({
    name: '',
    displayName: '',
    description: '',
    enabled: false,
    rollout: 0,
    targetUsers: 'All Users'
  })

  const toggleFlag = (id: number) => {
    setFeatureFlags(flags => 
      flags.map(flag => 
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    )
  }

  const updateRollout = (id: number, rollout: number) => {
    setFeatureFlags(flags => 
      flags.map(flag => 
        flag.id === id ? { ...flag, rollout } : flag
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Control feature rollouts and A/B testing for your mobile app
          </p>
        </div>
        <Button>
          <Flag className="mr-2 h-4 w-4" />
          Create Flag
        </Button>
      </div>

      {/* Feature Flag Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureFlags.length}</div>
            <p className="text-xs text-muted-foreground">
              {featureFlags.filter(f => f.enabled).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
            <ToggleRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureFlags.filter(f => f.enabled).length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((featureFlags.filter(f => f.enabled).length / featureFlags.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rollout Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(featureFlags.reduce((acc, flag) => acc + flag.rollout, 0) / featureFlags.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average rollout percentage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">
              ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Feature Flag */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Feature Flag</CardTitle>
          <CardDescription>
            Add a new feature flag to control app functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flag-name">Flag Name</Label>
              <Input
                id="flag-name"
                placeholder="e.g., new_checkout_flow"
                value={newFlag.name}
                onChange={(e) => setNewFlag({...newFlag, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="e.g., New Checkout Flow"
                value={newFlag.displayName}
                onChange={(e) => setNewFlag({...newFlag, displayName: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Describe what this feature flag controls"
              value={newFlag.description}
              onChange={(e) => setNewFlag({...newFlag, description: e.target.value})}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rollout">Rollout Percentage</Label>
              <Input
                id="rollout"
                type="number"
                min="0"
                max="100"
                value={newFlag.rollout}
                onChange={(e) => setNewFlag({...newFlag, rollout: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-users">Target Users</Label>
              <select
                id="target-users"
                className="w-full p-2 border rounded-md"
                value={newFlag.targetUsers}
                onChange={(e) => setNewFlag({...newFlag, targetUsers: e.target.value})}
              >
                <option value="All Users">All Users</option>
                <option value="Beta Users">Beta Users</option>
                <option value="Premium Users">Premium Users</option>
                <option value="New Users">New Users</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="enabled"
                checked={newFlag.enabled}
                onCheckedChange={(checked) => setNewFlag({...newFlag, enabled: checked})}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
          <Button className="w-full">
            <Flag className="mr-2 h-4 w-4" />
            Create Feature Flag
          </Button>
        </CardContent>
      </Card>

      {/* Feature Flags List */}
      <div className="space-y-4">
        {featureFlags.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{flag.displayName}</h3>
                    <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline">{flag.rollout}% rollout</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{flag.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {flag.targetUsers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Modified {flag.lastModified}
                    </span>
                    <span>by {flag.createdBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => toggleFlag(flag.id)}
                    />
                    <Label className="text-sm">
                      {flag.enabled ? 'On' : 'Off'}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Rollout:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={flag.rollout}
                      onChange={(e) => updateRollout(flag.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-8"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
