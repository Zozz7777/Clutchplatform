'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { use2FADashboard } from '@/hooks/use2FADashboard'

export default function Security2FAPage() {
  const [securityStats, setSecurityStats] = useState<any[]>([])
  const [twoFactorMethods, setTwoFactorMethods] = useState<any[]>([])
  const [recentSecurityEvents, setRecentSecurityEvents] = useState<any[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load2FAData()
  }, [])

  const load2FAData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [statsResponse, methodsResponse, eventsResponse, policiesResponse] = await Promise.all([
        apiClient.get<any[]>('/security/2fa/stats'),
        apiClient.get<any[]>('/security/2fa/methods'),
        apiClient.get<any[]>('/security/2fa/events'),
        apiClient.get<any[]>('/security/2fa/policies')
      ])
      
      if (statsResponse.success && statsResponse.data) {
        setSecurityStats(statsResponse.data as any[])
      } else {
        setSecurityStats([])
        if (!statsResponse.success) {
          toast.error('Failed to load security statistics')
          setError('Failed to load security statistics')
        }
      }
      
      if (methodsResponse.success && methodsResponse.data) {
        setTwoFactorMethods(methodsResponse.data as any[])
      } else {
        setTwoFactorMethods([])
        if (!methodsResponse.success) {
          toast.error('Failed to load 2FA methods')
        }
      }
      
      if (eventsResponse.success && eventsResponse.data) {
        setRecentSecurityEvents(eventsResponse.data as any[])
      } else {
        setRecentSecurityEvents([])
        if (!eventsResponse.success) {
          toast.error('Failed to load security events')
        }
      }
      
      if (policiesResponse.success && policiesResponse.data) {
        setSecurityPolicies(policiesResponse.data as any[])
      } else {
        setSecurityPolicies([])
        if (!policiesResponse.success) {
          toast.error('Failed to load security policies')
        }
      }
    } catch (error: any) {
      console.error('Failed to load 2FA data:', error)
      setSecurityStats([])
      setTwoFactorMethods([])
      setRecentSecurityEvents([])
      setSecurityPolicies([])
      setError('Failed to load 2FA data')
      toast.error('Failed to load 2FA data')
    } finally {
      setIsLoading(false)
    }
  }

  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 text-slate-900">Two-Factor Authentication</h1>
          <p className="text-slate-600 text-slate-600 mt-2">
            Manage 2FA settings and monitor authentication security
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <SnowButton variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Security Settings
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Enforce 2FA
          </SnowButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SnowCard>
              <SnowCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 text-slate-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 text-slate-900 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">from last week</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  2FA Adoption Overview
                </SnowCardTitle>
                <SnowCardDescription>
                  Current 2FA adoption rates and security metrics
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">2FA Enabled Users</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('/')[0]}/{securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('/')[1]}
                  </Badge>
                </div>
                <Progress value={securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('%')[0]} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('%')[0]}</div>
                    <div className="text-sm text-blue-600">SMS</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('%')[1]}</div>
                    <div className="text-sm text-purple-600">Email</div>
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Security Actions
                </SnowCardTitle>
                <SnowCardDescription>
                  Quick security management tasks
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent className="space-y-3">
                <SnowButton variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Enforce 2FA for All Users
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Backup Codes
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Security Report
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All 2FA
                </SnowButton>
              </SnowCardContent>
            </SnowCard>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle>2FA Methods</SnowCardTitle>
              <SnowCardDescription>
                Manage different two-factor authentication methods
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {twoFactorMethods.map((method, index) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {method.name.includes('SMS') ? (
                          <Smartphone className="h-5 w-5 text-blue-600" />
                        ) : method.name.includes('Email') ? (
                          <Mail className="h-5 w-5 text-blue-600" />
                        ) : method.name.includes('App') ? (
                          <Key className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-slate-500">{method.description}</p>
                        <p className="text-sm text-slate-500">{method.users} users</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Success Rate</p>
                        <p className="font-medium">{method.successRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Status</p>
                        <Badge variant={method.status === 'active' ? 'default' : 'outline'}>
                          {method.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SnowButton variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Recent Security Events
              </SnowCardTitle>
              <SnowCardDescription>
                Latest 2FA and authentication events
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {recentSecurityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        event.status === 'success' ? 'bg-green-500' :
                        event.status === 'failed' ? 'bg-red-500' :
                        event.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <h3 className="font-medium">{event.user}</h3>
                        <p className="text-sm text-slate-500">{event.event} via {event.method}</p>
                        <p className="text-sm text-slate-600">{event.ip} â€¢ {event.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        event.status === 'success' ? 'default' :
                        event.status === 'failed' ? 'destructive' :
                        event.status === 'warning' ? 'secondary' : 'outline'
                      }>
                        {event.status}
                      </Badge>
                      <p className="text-sm text-slate-500 mt-1">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle>Security Policies</SnowCardTitle>
                <SnowCardDescription>
                  Configure security policies and rules
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {securityPolicies.map((policy, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{policy.name}</h3>
                        <p className="text-sm text-slate-500">{policy.description}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={
                          policy.impact === 'high' ? 'default' :
                          policy.impact === 'medium' ? 'secondary' : 'outline'
                        }>
                          {policy.impact} impact
                        </Badge>
                        <Badge variant={policy.status === 'enabled' ? 'default' : 'outline'}>
                          {policy.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>

            <SnowCard>
              <SnowCardHeader>
                <SnowCardTitle>Security Metrics</SnowCardTitle>
                <SnowCardDescription>
                  Key security performance indicators
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Overall Security Score</span>
                    <span className="font-medium">{securityStats.find(stat => stat.title === 'Security Score')?.value}/100</span>
                  </div>
                  <Progress value={securityStats.find(stat => stat.title === 'Security Score')?.value} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>2FA Adoption Rate</span>
                    <span className="font-medium">{securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('%')[0]}%</span>
                  </div>
                  <Progress value={securityStats.find(stat => stat.title === '2FA Adoption')?.value.split('%')[0]} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Failed Login Attempts</span>
                    <span className="font-medium">{securityStats.find(stat => stat.title === 'Failed Attempts')?.value}</span>
                  </div>
                  <Progress value={Math.min(((securityStats.find(stat => stat.title === 'Failed Attempts')?.value || 0) / 50) * 100, 100)} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Successful Authentications</span>
                    <span className="font-medium">{securityStats.find(stat => stat.title === 'Successful Logins')?.value.toLocaleString()}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}



