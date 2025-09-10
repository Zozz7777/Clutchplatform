'use client'

import React from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import Breadcrumbs from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Database, Shield, Settings, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function EnterprisePage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
          Enterprise B2B
        </h1>
        <p className="text-muted-foreground">
          Manage enterprise features and B2B operations
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Tenants</SnowCardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Users</SnowCardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +89 from last month
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">API Calls</SnowCardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Security Score</SnowCardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Multi-Tenant
            </SnowCardTitle>
            <SnowCardDescription>Manage multiple tenant organizations</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure and manage multiple tenant organizations with isolated data and settings.
            </p>
            <Link href="/enterprise/multi-tenant">
              <SnowButton className="w-full">
                Manage Tenants
                <ArrowRight className="h-4 w-4 ml-2" />
              </SnowButton>
            </Link>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              White-Label
            </SnowCardTitle>
            <SnowCardDescription>Customize branding and appearance</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the platform with your own branding, colors, and domain.
            </p>
            <SnowButton className="w-full" variant="outline">
              Configure Branding
              <ArrowRight className="h-4 w-4 ml-2" />
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              API Management
            </SnowCardTitle>
            <SnowCardDescription>Manage API keys and endpoints</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure API keys, rate limits, and monitor API usage across tenants.
            </p>
            <SnowButton className="w-full" variant="outline">
              Manage APIs
              <ArrowRight className="h-4 w-4 ml-2" />
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Corporate Accounts
            </SnowCardTitle>
            <SnowCardDescription>Manage corporate account settings</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure corporate account settings, billing, and user management.
            </p>
            <SnowButton className="w-full" variant="outline">
              Manage Accounts
              <ArrowRight className="h-4 w-4 ml-2" />
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Webhooks
            </SnowCardTitle>
            <SnowCardDescription>Configure webhook endpoints</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up webhook endpoints for real-time data synchronization.
            </p>
            <SnowButton className="w-full" variant="outline">
              Configure Webhooks
              <ArrowRight className="h-4 w-4 ml-2" />
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </SnowCardTitle>
            <SnowCardDescription>Enterprise security settings</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-slate-600 text-slate-600 mb-4">
              Configure enterprise-grade security settings and compliance.
            </p>
            <SnowButton className="w-full" variant="outline">
              Security Settings
              <ArrowRight className="h-4 w-4 ml-2" />
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}



