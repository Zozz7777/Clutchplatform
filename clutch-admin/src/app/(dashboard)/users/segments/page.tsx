'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  BarChart3,
  TrendingUp,
  Mail,
  MessageSquare
} from 'lucide-react';

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  userCount: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
}

export default function UserSegmentsPage() {
  const [segments, setSegments] = useState<UserSegment[]>([
    {
      id: '1',
      name: 'High-Value Customers',
      description: 'Customers with high lifetime value and engagement',
      criteria: ['LTV > $5000', 'Active in last 30 days', 'Plan: Professional or Enterprise'],
      userCount: 245,
      lastUpdated: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'At-Risk Users',
      description: 'Users showing signs of potential churn',
      criteria: ['Last login > 14 days ago', 'Support tickets > 3', 'Plan downgrade in last 30 days'],
      userCount: 89,
      lastUpdated: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'New Users',
      description: 'Recently registered users in their first month',
      criteria: ['Registration date < 30 days ago', 'Has completed onboarding'],
      userCount: 156,
      lastUpdated: '2024-01-13',
      status: 'active'
    }
  ]);

  const [analytics] = useState({
    totalSegments: 12,
    activeSegments: 8,
    totalUsers: 1250,
    averageSegmentSize: 104
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="default" className="bg-yellow-500">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">User Segments</h1>
          <p className="text-muted-foreground font-sans">
            Create and manage user segments for targeted campaigns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Segment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Segments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.totalSegments}</div>
            <p className="text-xs text-muted-foreground font-sans">
              All segments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Active Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.activeSegments}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Total Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Across all segments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-sans">Avg Segment Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{analytics.averageSegmentSize}</div>
            <p className="text-xs text-muted-foreground font-sans">
              Users per segment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="space-y-4">
            {segments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-sans">{segment.name}</CardTitle>
                      <CardDescription className="font-sans">
                        {segment.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(segment.status)}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium font-sans mb-2">Criteria</p>
                      <div className="space-y-1">
                        {segment.criteria.map((criterion, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Filter className="h-3 w-3 text-gray-400" />
                            <span className="text-sm font-sans">{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-2">Statistics</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-sans">Users:</span>
                          <span className="text-sm font-sans font-medium">{segment.userCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-sans">Updated:</span>
                          <span className="text-sm font-sans">{segment.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium font-sans mb-2">Actions</p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Push Notification
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Segment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium font-sans">{segment.name}</h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {segment.userCount} users
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(segment.userCount / 300) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground font-sans mt-1">
                          {((segment.userCount / analytics.totalUsers) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-sans">Segment Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: 'High-Value Customers', growth: 15.2, trend: 'up' },
                    { segment: 'At-Risk Users', growth: -8.5, trend: 'down' },
                    { segment: 'New Users', growth: 22.1, trend: 'up' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-sans">{item.segment}</span>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`h-4 w-4 ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={`text-sm font-sans ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans">Segment-Based Campaigns</CardTitle>
              <CardDescription className="font-sans">
                Campaigns targeting specific user segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Welcome Series for New Users',
                    segment: 'New Users',
                    type: 'Email',
                    status: 'Active',
                    sent: 156,
                    opened: 89,
                    clicked: 34
                  },
                  {
                    name: 'Retention Campaign for At-Risk Users',
                    segment: 'At-Risk Users',
                    type: 'Email + Push',
                    status: 'Active',
                    sent: 89,
                    opened: 45,
                    clicked: 12
                  },
                  {
                    name: 'Upsell Campaign for High-Value Customers',
                    segment: 'High-Value Customers',
                    type: 'Email',
                    status: 'Draft',
                    sent: 0,
                    opened: 0,
                    clicked: 0
                  }
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium font-sans">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        Target: {campaign.segment} • Type: {campaign.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-sans">Sent: {campaign.sent}</p>
                        <p className="text-sm font-sans">Opened: {campaign.opened}</p>
                        <p className="text-sm font-sans">Clicked: {campaign.clicked}</p>
                      </div>
                      <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
