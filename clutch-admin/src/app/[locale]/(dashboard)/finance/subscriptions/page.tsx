'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { PoundSterling, CreditCard, Users, Calendar, Search, Plus, Building2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

export default function FinanceSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/finance/subscriptions')
      if (response.success && response.data) {
        setSubscriptions(response.data as any[])
      } else {
        setSubscriptions([])
        if (!response.success) {
          toast.error('Failed to load subscriptions')
          setError('Failed to load subscriptions')
        }
      }
    } catch (error: any) {
      console.error('Failed to load subscriptions:', error)
      setError('Failed to load subscriptions')
      setSubscriptions([])
      toast.error('Failed to load subscriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = () => {
    // Filter functionality will be implemented when needed
    toast.info('Filter applied')
  }

  const handleSubscribe = async (plan: string) => {
    try {
      const response = await apiClient.post('/finance/subscriptions', { plan })
      if (response.success) {
        toast.success(`Successfully subscribed to ${plan} plan`)
      } else {
        toast.error('Failed to subscribe to plan')
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
      toast.error('Failed to subscribe to plan')
    }
  }

  const handleManageSubscription = async (subscription: any) => {
    try {
      const response = await apiClient.get(`/finance/subscriptions/${subscription.id}`)
      if (response.success) {
        toast.success(`Managing subscription: ${subscription.name || subscription.company}`)
        // TODO: Open management modal with subscription data
      } else {
        toast.error('Failed to load subscription details')
      }
    } catch (error) {
      console.error('Failed to manage subscription:', error)
      toast.error('Failed to manage subscription')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and billing across the platform
          </p>
        </div>
        <SnowButton>
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </SnowButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Revenue</SnowCardTitle>
            <PoundSterling className="h-4 w-4 text-green-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">$2,847,500</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Subscriptions</SnowCardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Monthly Recurring</SnowCardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">$284,750</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Churn Rate</SnowCardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+0.5% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <SnowInput
                placeholder="Search subscriptions..."
                className="pl-10"
              />
            </div>
            <SnowButton variant="outline" onClick={handleFilter}>Filter</SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-3">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Plan
            </SnowCardTitle>
            <SnowCardDescription>Essential features for small businesses</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Up to 10 users</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Basic analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Email support</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-muted-foreground">Advanced features</span>
                </div>
              </div>
              <SnowButton className="w-full" onClick={() => handleSubscribe('Basic')}>Subscribe</SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard className="border-2 border-blue-500">
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Professional Plan
            </SnowCardTitle>
            <SnowCardDescription>Advanced features for growing businesses</SnowCardDescription>
            <Badge className="w-fit">Most Popular</Badge>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">$299<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Up to 50 users</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">API access</span>
                </div>
              </div>
              <SnowButton className="w-full" onClick={() => handleSubscribe('Professional')}>Subscribe</SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Enterprise Plan
            </SnowCardTitle>
            <SnowCardDescription>Full features for large organizations</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold">$999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Unlimited users</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Custom analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">24/7 support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">White-label options</span>
                </div>
              </div>
              <SnowButton className="w-full" onClick={() => handleSubscribe('Enterprise')}>Subscribe</SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Active Subscriptions</SnowCardTitle>
          <SnowCardDescription>Manage current subscription plans</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
                     <div className="space-y-4">
             {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{subscription.company}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{subscription.plan} Plan</span>
                      <span>{subscription.users} users</span>
                      <span>Next billing: {subscription.nextBilling}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-medium">{subscription.amount}</div>
                  </div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                  <SnowButton variant="outline" size="sm" onClick={() => handleManageSubscription(subscription)}>Manage</SnowButton>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



