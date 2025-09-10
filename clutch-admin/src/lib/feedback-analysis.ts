/**
 * Feedback Analysis & Iteration System
 * Advanced analytics and insights for user feedback
 */

export interface FeedbackAnalysis {
  id: string
  timestamp: Date
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalFeedback: number
    newFeedback: number
    resolvedFeedback: number
    averageResolutionTime: number
    userSatisfaction: number
  }
  trends: {
    feedbackVolume: TrendData
    resolutionTime: TrendData
    userSatisfaction: TrendData
    categoryDistribution: TrendData
  }
  insights: FeedbackInsight[]
  recommendations: FeedbackRecommendation[]
  topIssues: TopIssue[]
  userSegments: UserSegment[]
}

export interface TrendData {
  current: number
  previous: number
  change: number
  changePercentage: number
  direction: 'up' | 'down' | 'stable'
  dataPoints: Array<{
    date: Date
    value: number
  }>
}

export interface FeedbackInsight {
  id: string
  type: 'trend' | 'pattern' | 'anomaly' | 'correlation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: string
  tags: string[]
  data: any
  actionable: boolean
  priority: number
}

export interface FeedbackRecommendation {
  id: string
  type: 'feature' | 'improvement' | 'bug_fix' | 'ux_enhancement'
  title: string
  description: string
  rationale: string
  expectedImpact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  priority: number
  category: string
  relatedFeedback: string[]
  estimatedValue: number
  implementationPlan: string[]
}

export interface TopIssue {
  id: string
  title: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  affectedUsers: number
  businessImpact: 'low' | 'medium' | 'high'
  resolutionStatus: 'open' | 'in_progress' | 'resolved' | 'closed'
  relatedFeedback: string[]
  suggestedActions: string[]
}

export interface UserSegment {
  id: string
  name: string
  description: string
  criteria: Record<string, any>
  size: number
  feedbackPatterns: {
    mostCommonIssues: string[]
    satisfactionScore: number
    averageResolutionTime: number
    preferredChannels: string[]
  }
  recommendations: string[]
}

export interface FeedbackIteration {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed' | 'paused'
  goals: string[]
  metrics: {
    targetSatisfaction: number
    targetResolutionTime: number
    targetVolume: number
  }
  actions: IterationAction[]
  results: IterationResults
}

export interface IterationAction {
  id: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'process' | 'training'
  priority: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo: string
  dueDate: Date
  completedDate?: Date
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

export interface IterationResults {
  satisfactionImprovement: number
  resolutionTimeImprovement: number
  volumeChange: number
  userAdoption: number
  businessImpact: number
  lessonsLearned: string[]
  nextIterationRecommendations: string[]
}

export class FeedbackAnalyzer {
  private static instance: FeedbackAnalyzer
  private feedback: any[] = []
  private analysis: FeedbackAnalysis[] = []
  private iterations: FeedbackIteration[] = []

  static getInstance(): FeedbackAnalyzer {
    if (!FeedbackAnalyzer.instance) {
      FeedbackAnalyzer.instance = new FeedbackAnalyzer()
    }
    return FeedbackAnalyzer.instance
  }

  constructor() {
    this.loadData()
  }

  private loadData() {
    // Load feedback data from storage or API
    try {
      const stored = localStorage.getItem('feedbackAnalysis')
      if (stored) {
        const data = JSON.parse(stored)
        this.feedback = data.feedback || []
        this.analysis = data.analysis || []
        this.iterations = data.iterations || []
      }
    } catch (error) {
      console.error('Failed to load feedback analysis data:', error)
    }
  }

  private saveData() {
    try {
      localStorage.setItem('feedbackAnalysis', JSON.stringify({
        feedback: this.feedback,
        analysis: this.analysis,
        iterations: this.iterations
      }))
    } catch (error) {
      console.error('Failed to save feedback analysis data:', error)
    }
  }

  // Analyze feedback data
  public analyzeFeedback(period: { start: Date; end: Date }): FeedbackAnalysis {
    const periodFeedback = this.feedback.filter(f => 
      f.metadata.timestamp >= period.start && f.metadata.timestamp <= period.end
    )

    const analysis: FeedbackAnalysis = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date(),
      period,
      summary: this.calculateSummary(periodFeedback),
      trends: this.calculateTrends(periodFeedback, period),
      insights: this.generateInsights(periodFeedback),
      recommendations: this.generateRecommendations(periodFeedback),
      topIssues: this.identifyTopIssues(periodFeedback),
      userSegments: this.analyzeUserSegments(periodFeedback)
    }

    this.analysis.push(analysis)
    this.saveData()

    return analysis
  }

  private calculateSummary(feedback: any[]): FeedbackAnalysis['summary'] {
    const totalFeedback = feedback.length
    const newFeedback = feedback.filter(f => f.status === 'open').length
    const resolvedFeedback = feedback.filter(f => f.status === 'resolved').length
    
    const resolutionTimes = feedback
      .filter(f => f.status === 'resolved' && f.resolvedAt)
      .map(f => new Date(f.resolvedAt).getTime() - new Date(f.metadata.timestamp).getTime())
    
    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0

    const satisfactionScores = feedback
      .filter(f => f.satisfactionScore)
      .map(f => f.satisfactionScore)
    
    const userSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0

    return {
      totalFeedback,
      newFeedback,
      resolvedFeedback,
      averageResolutionTime,
      userSatisfaction
    }
  }

  private calculateTrends(feedback: any[], period: { start: Date; end: Date }): FeedbackAnalysis['trends'] {
    const previousPeriod = {
      start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
      end: period.start
    }

    const previousFeedback = this.feedback.filter(f => 
      f.metadata.timestamp >= previousPeriod.start && f.metadata.timestamp <= previousPeriod.end
    )

    return {
      feedbackVolume: this.calculateTrend(feedback.length, previousFeedback.length),
      resolutionTime: this.calculateResolutionTimeTrend(feedback, previousFeedback),
      userSatisfaction: this.calculateSatisfactionTrend(feedback, previousFeedback),
      categoryDistribution: this.calculateCategoryTrend(feedback, previousFeedback)
    }
  }

  private calculateTrend(current: number, previous: number): TrendData {
    const change = current - previous
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

    return {
      current,
      previous,
      change,
      changePercentage,
      direction,
      dataPoints: [] // Would be populated with time series data
    }
  }

  private calculateResolutionTimeTrend(current: any[], previous: any[]): TrendData {
    const currentAvg = this.calculateAverageResolutionTime(current)
    const previousAvg = this.calculateAverageResolutionTime(previous)
    
    return this.calculateTrend(currentAvg, previousAvg)
  }

  private calculateSatisfactionTrend(current: any[], previous: any[]): TrendData {
    const currentAvg = this.calculateAverageSatisfaction(current)
    const previousAvg = this.calculateAverageSatisfaction(previous)
    
    return this.calculateTrend(currentAvg, previousAvg)
  }

  private calculateCategoryTrend(current: any[], previous: any[]): TrendData {
    const currentCategories = this.getCategoryDistribution(current)
    const previousCategories = this.getCategoryDistribution(previous)
    
    // Calculate change in most common category
    const currentTop = Object.keys(currentCategories).reduce((a, b) => 
      currentCategories[a] > currentCategories[b] ? a : b, '')
    const previousTop = Object.keys(previousCategories).reduce((a, b) => 
      previousCategories[a] > previousCategories[b] ? a : b, '')
    
    return this.calculateTrend(
      currentCategories[currentTop] || 0,
      previousCategories[previousTop] || 0
    )
  }

  private calculateAverageResolutionTime(feedback: any[]): number {
    const resolutionTimes = feedback
      .filter(f => f.status === 'resolved' && f.resolvedAt)
      .map(f => new Date(f.resolvedAt).getTime() - new Date(f.metadata.timestamp).getTime())
    
    return resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0
  }

  private calculateAverageSatisfaction(feedback: any[]): number {
    const satisfactionScores = feedback
      .filter(f => f.satisfactionScore)
      .map(f => f.satisfactionScore)
    
    return satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0
  }

  private getCategoryDistribution(feedback: any[]): Record<string, number> {
    return feedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private generateInsights(feedback: any[]): FeedbackInsight[] {
    const insights: FeedbackInsight[] = []

    // Trend insights
    const volumeTrend = this.calculateTrend(feedback.length, 0)
    if (volumeTrend.changePercentage > 20) {
      insights.push({
        id: `insight-${Date.now()}-1`,
        type: 'trend',
        title: 'Significant Increase in Feedback Volume',
        description: `Feedback volume has increased by ${volumeTrend.changePercentage.toFixed(1)}% compared to the previous period.`,
        confidence: 0.8,
        impact: 'medium',
        category: 'volume',
        tags: ['trend', 'volume'],
        data: volumeTrend,
        actionable: true,
        priority: 3
      })
    }

    // Pattern insights
    const categoryDistribution = this.getCategoryDistribution(feedback)
    const topCategory = Object.keys(categoryDistribution).reduce((a, b) => 
      categoryDistribution[a] > categoryDistribution[b] ? a : b, '')
    
    if (categoryDistribution[topCategory] / feedback.length > 0.4) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        type: 'pattern',
        title: 'Concentrated Feedback in Single Category',
        description: `${topCategory} accounts for ${((categoryDistribution[topCategory] / feedback.length) * 100).toFixed(1)}% of all feedback.`,
        confidence: 0.9,
        impact: 'high',
        category: 'distribution',
        tags: ['pattern', 'category'],
        data: { category: topCategory, percentage: (categoryDistribution[topCategory] / feedback.length) * 100 },
        actionable: true,
        priority: 2
      })
    }

    // Anomaly insights
    const satisfactionScores = feedback.filter(f => f.satisfactionScore).map(f => f.satisfactionScore)
    if (satisfactionScores.length > 0) {
      const avgSatisfaction = satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      if (avgSatisfaction < 3.0) {
        insights.push({
          id: `insight-${Date.now()}-3`,
          type: 'anomaly',
          title: 'Low User Satisfaction',
          description: `Average user satisfaction is ${avgSatisfaction.toFixed(1)}/5, which is below acceptable levels.`,
          confidence: 0.95,
          impact: 'critical',
          category: 'satisfaction',
          tags: ['anomaly', 'satisfaction'],
          data: { average: avgSatisfaction },
          actionable: true,
          priority: 1
        })
      }
    }

    return insights
  }

  private generateRecommendations(feedback: any[]): FeedbackRecommendation[] {
    const recommendations: FeedbackRecommendation[] = []

    // Analyze common issues
    const issueFrequency = this.analyzeIssueFrequency(feedback)
    const topIssues = Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    topIssues.forEach(([issue, frequency], index) => {
      recommendations.push({
        id: `recommendation-${Date.now()}-${index}`,
        type: 'improvement',
        title: `Address ${issue} Issues`,
        description: `${issue} is mentioned in ${frequency} feedback items, indicating a significant user concern.`,
        rationale: `High frequency of ${issue} feedback suggests this is a critical user pain point that needs immediate attention.`,
        expectedImpact: frequency > 10 ? 'high' : frequency > 5 ? 'medium' : 'low',
        effort: 'medium',
        priority: index + 1,
        category: issue,
        relatedFeedback: feedback.filter(f => f.title.toLowerCase().includes(issue.toLowerCase())).map(f => f.id),
        estimatedValue: frequency * 100, // Estimated value per resolved issue
        implementationPlan: [
          'Analyze root cause of the issue',
          'Design solution approach',
          'Implement fix or improvement',
          'Test solution thoroughly',
          'Deploy and monitor results'
        ]
      })
    })

    return recommendations
  }

  private identifyTopIssues(feedback: any[]): TopIssue[] {
    const issueFrequency = this.analyzeIssueFrequency(feedback)
    
    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([issue, frequency], index) => ({
        id: `issue-${Date.now()}-${index}`,
        title: issue,
        description: `This issue has been reported ${frequency} times in the current period.`,
        category: this.categorizeIssue(issue),
        severity: frequency > 15 ? 'critical' : frequency > 10 ? 'high' : frequency > 5 ? 'medium' : 'low',
        frequency,
        trend: 'stable', // Would be calculated based on historical data
        affectedUsers: frequency, // Simplified assumption
        businessImpact: frequency > 15 ? 'high' : frequency > 10 ? 'medium' : 'low',
        resolutionStatus: 'open',
        relatedFeedback: feedback.filter(f => f.title.toLowerCase().includes(issue.toLowerCase())).map(f => f.id),
        suggestedActions: this.getSuggestedActions(issue)
      }))
  }

  private analyzeUserSegments(feedback: any[]): UserSegment[] {
    // Group feedback by user characteristics
    const segments: UserSegment[] = []

    // Segment by user role
    const roleGroups = feedback.reduce((acc, f) => {
      const role = f.user.role || 'unknown'
      if (!acc[role]) acc[role] = []
      acc[role].push(f)
      return acc
    }, {} as Record<string, any[]>)

    Object.entries(roleGroups).forEach(([role, roleFeedback]) => {
      const feedbackArray = roleFeedback as any[]
      segments.push({
        id: `segment-${role}`,
        name: `${role} Users`,
        description: `Feedback from users with ${role} role`,
        criteria: { role },
        size: feedbackArray.length,
        feedbackPatterns: {
          mostCommonIssues: this.getMostCommonIssues(feedbackArray),
          satisfactionScore: this.calculateAverageSatisfaction(feedbackArray),
          averageResolutionTime: this.calculateAverageResolutionTime(feedbackArray),
          preferredChannels: ['feedback_widget', 'email'] // Simplified
        },
        recommendations: this.getSegmentRecommendations(role, feedbackArray)
      })
    })

    return segments
  }

  private analyzeIssueFrequency(feedback: any[]): Record<string, number> {
    const issues: Record<string, number> = {}
    
    feedback.forEach(f => {
      // Simple keyword extraction - in a real system, this would be more sophisticated
      const keywords = f.title.toLowerCase().split(' ').filter((word: string) => word.length > 3)
      keywords.forEach((keyword: string) => {
        issues[keyword] = (issues[keyword] || 0) + 1
      })
    })

    return issues
  }

  private categorizeIssue(issue: string): string {
    // Simple categorization logic
    if (issue.includes('slow') || issue.includes('performance')) return 'Performance'
    if (issue.includes('error') || issue.includes('bug')) return 'Bug'
    if (issue.includes('feature') || issue.includes('request')) return 'Feature Request'
    if (issue.includes('ui') || issue.includes('interface')) return 'UI/UX'
    return 'General'
  }

  private getSuggestedActions(issue: string): string[] {
    // Generate suggested actions based on issue type
    const actions: string[] = []
    
    if (issue.includes('slow') || issue.includes('performance')) {
      actions.push('Performance optimization')
      actions.push('Code profiling and analysis')
      actions.push('Database query optimization')
    } else if (issue.includes('error') || issue.includes('bug')) {
      actions.push('Bug investigation and reproduction')
      actions.push('Code review and testing')
      actions.push('Fix implementation and testing')
    } else if (issue.includes('feature') || issue.includes('request')) {
      actions.push('Feature requirement analysis')
      actions.push('Design and planning')
      actions.push('Implementation roadmap')
    } else {
      actions.push('Issue investigation')
      actions.push('Root cause analysis')
      actions.push('Solution design and implementation')
    }

    return actions
  }

  private getMostCommonIssues(feedback: any[]): string[] {
    const issueFrequency = this.analyzeIssueFrequency(feedback)
    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue)
  }

  private getSegmentRecommendations(role: string, feedback: any[]): string[] {
    const recommendations: string[] = []
    
    if (role === 'admin') {
      recommendations.push('Provide advanced admin training')
      recommendations.push('Create admin-specific documentation')
      recommendations.push('Implement admin feedback channel')
    } else if (role === 'user') {
      recommendations.push('Improve user onboarding process')
      recommendations.push('Create user-friendly tutorials')
      recommendations.push('Implement user feedback incentives')
    }

    return recommendations
  }

  // Create feedback iteration
  public createIteration(name: string, description: string, goals: string[]): FeedbackIteration {
    const iteration: FeedbackIteration = {
      id: `iteration-${Date.now()}`,
      name,
      description,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'planning',
      goals,
      metrics: {
        targetSatisfaction: 4.0,
        targetResolutionTime: 24 * 60 * 60 * 1000, // 24 hours
        targetVolume: 0 // No specific target
      },
      actions: [],
      results: {
        satisfactionImprovement: 0,
        resolutionTimeImprovement: 0,
        volumeChange: 0,
        userAdoption: 0,
        businessImpact: 0,
        lessonsLearned: [],
        nextIterationRecommendations: []
      }
    }

    this.iterations.push(iteration)
    this.saveData()

    return iteration
  }

  // Add action to iteration
  public addIterationAction(iterationId: string, action: Omit<IterationAction, 'id'>): IterationAction {
    const iteration = this.iterations.find(i => i.id === iterationId)
    if (!iteration) throw new Error('Iteration not found')

    const newAction: IterationAction = {
      id: `action-${Date.now()}`,
      ...action
    }

    iteration.actions.push(newAction)
    this.saveData()

    return newAction
  }

  // Complete iteration
  public completeIteration(iterationId: string, results: IterationResults): FeedbackIteration {
    const iteration = this.iterations.find(i => i.id === iterationId)
    if (!iteration) throw new Error('Iteration not found')

    iteration.status = 'completed'
    iteration.results = results
    this.saveData()

    return iteration
  }

  // Get analysis data
  public getAnalysis(period?: { start: Date; end: Date }): FeedbackAnalysis[] {
    if (period) {
      return this.analysis.filter(a => 
        a.period.start >= period.start && a.period.end <= period.end
      )
    }
    return [...this.analysis]
  }

  public getIterations(): FeedbackIteration[] {
    return [...this.iterations]
  }

  public getLatestAnalysis(): FeedbackAnalysis | null {
    return this.analysis.length > 0 ? this.analysis[this.analysis.length - 1] : null
  }
}

const FeedbackAnalysis = {
  FeedbackAnalyzer
}

export default FeedbackAnalysis
