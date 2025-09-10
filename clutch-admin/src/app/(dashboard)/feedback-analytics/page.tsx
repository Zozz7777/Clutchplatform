/**
 * Feedback Analytics Page
 * Comprehensive feedback analysis and iteration management
 */

import React from 'react'
import { FeedbackAnalyticsDashboard } from '@/components/feedback/feedback-analytics-dashboard'
import { FeedbackIterationManager } from '@/components/feedback/feedback-iteration-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Target } from 'lucide-react'

export default function FeedbackAnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Analytics</h1>
          <p className="text-muted-foreground">
            Analyze user feedback and manage improvement iterations
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="iterations" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Iterations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <FeedbackAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="iterations">
          <FeedbackIterationManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
