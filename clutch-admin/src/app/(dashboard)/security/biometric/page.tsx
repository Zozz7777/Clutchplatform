'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { 
  Fingerprint,
  Camera,
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Users,
  Activity,
  Calendar,
  MapPin,
  Globe,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Scan,
  ScanLine,
  QrCode,
  Key,
  KeyRound
} from 'lucide-react'
import { useSecurityBiometricDashboard } from '@/hooks/useSecurityBiometricDashboard'
import { toast } from 'sonner'

export default function SecurityBiometricPage() {
  // Use consolidated security biometric dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    biometricStats,
    biometricEvents
  } = useSecurityBiometricDashboard()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('devices')

  // Map consolidated data to component state
  const devices = biometricStats.map(stat => ({
    id: stat.id,
    name: stat.name,
    type: stat.name.toLowerCase().includes('fingerprint') ? 'fingerprint' : 
          stat.name.toLowerCase().includes('face') ? 'face_id' : 'touch_id',
    status: 'active',
    lastUsed: new Date().toISOString(),
    accuracy: stat.accuracy,
    enrolledUsers: stat.value,
    platform: 'mobile',
    biometricType: stat.name.toLowerCase().includes('fingerprint') ? 'fingerprint' : 
                   stat.name.toLowerCase().includes('face') ? 'face_recognition' : 'voice_authentication',
    securityLevel: stat.accuracy > 98 ? 'high' : stat.accuracy > 95 ? 'medium' : 'low'
  }))

  const sessions = biometricEvents.map(event => ({
    id: event.id,
    userId: event.user,
    deviceId: 'device-1',
    biometricType: event.method,
    timestamp: event.timestamp,
    status: event.status,
    location: 'New York, US',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    success: event.status === 'success',
    confidence: 95 + Math.random() * 5,
    duration: Math.floor(Math.random() * 5) + 1
  }))

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load biometric data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-6 w-6" />
      case 'desktop': return <Monitor className="h-6 w-6" />
      case 'tablet': return <Tablet className="h-6 w-6" />
      default: return <Monitor className="h-6 w-6" />
    }
  }

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'face_id': return <Camera className="h-4 w-4" />
      case 'touch_id': return <Fingerprint className="h-4 w-4" />
      case 'fingerprint': return <Fingerprint className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-slate-100 text-slate-800 bg-white dark:text-slate-200'
    }
  }

  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleTrustDevice = (device: any) => {
    toast.success(`Device ${device.name} marked as trusted`)
  }

  const handleUntrustDevice = (device: any) => {
    toast.warning(`Device ${device.name} marked as untrusted`)
  }

  const handleRemoveDevice = (device: any) => {
    toast.error(`Removing device: ${device.name}`)
  }

  const handleViewSession = (session: any) => {
    toast.info(`Viewing session details for ${session.deviceId}`)
  }

  const handleBlockSession = (session: any) => {
    toast.warning(`Blocking session from ${session.deviceId}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <SnowCard className="w-full max-w-md">
          <SnowCardHeader>
            <SnowCardTitle className="text-red-600">Error Loading Biometric Data</SnowCardTitle>
            <SnowCardDescription>{error}</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <SnowButton onClick={refreshData} className="w-full">
              Retry
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading biometric data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Biometric Security
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage biometric authentication and device security
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </SnowButton>
          <SnowButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Trusted Devices</p>
                <p className="text-2xl font-bold">{devices.filter(d => d.status === 'active').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Sessions</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'success').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Failed Attempts</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'failed').length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <div className="flex space-x-1 bg-slate-100 bg-slate-100 p-1 rounded-lg">
        <SnowButton
          onClick={() => setActiveTab('devices')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'devices'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Devices
        </SnowButton>
        <SnowButton
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sessions
        </SnowButton>
      </div>
      {activeTab === 'devices' && (
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Registered Devices</SnowCardTitle>
            <SnowCardDescription>Manage your trusted devices and biometric settings</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-6 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{device.name}</h3>
                          <Badge className={getStatusColor(device.status)}>
                            {device.status}
                          </Badge>
                          {device.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Trusted
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 text-slate-600 mb-3">
                          {device.type} â€¢ {device.platform}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Biometric Type</p>
                            <div className="flex items-center space-x-1 text-slate-500">
                              {getBiometricIcon(device.biometricType)}
                              <span>{device.biometricType?.replace('_', ' ').toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Last Used</p>
                            <p className="text-slate-500">{formatDate(device.lastUsed)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>{device.platform}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">IP Address</p>
                            <p className="text-slate-500">{device.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Fingerprint className="h-3 w-3 text-slate-600" />
                            <span className="text-slate-500">{device.enrolledUsers} enrolled</span>
                          </div>
                          {device.biometricType === 'face' && (
                            <div className="flex items-center space-x-1">
                              <Camera className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-500">Face ID enabled</span>
                            </div>
                          )}
                          {device.securityLevel === 'high' && (
                            <div className="flex items-center space-x-1">
                              <Lock className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-500">Passcode enabled</span>
                            </div>
                          )}
                          {device.status === 'active' && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 text-slate-600" />
                              <span className="text-slate-500">2FA enabled</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => device.status === 'active' ? handleUntrustDevice(device) : handleTrustDevice(device)}
                      >
                        {device.status === 'active' ? (
                          <>
                            <ShieldX className="h-4 w-4 mr-2" />
                            Untrust
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Trust
                          </>
                        )}
                      </SnowButton>
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveDevice(device)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
      {activeTab === 'sessions' && (
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Authentication Sessions</SnowCardTitle>
            <SnowCardDescription>Monitor login attempts and authentication history</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        {getBiometricIcon(session.biometricType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{session.deviceId}</h4>
                          <Badge className={getSessionStatusColor(session.status)}>
                            {getSessionStatusIcon(session.status)}
                            <span className="ml-1">{session.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {session.biometricType} via {session.biometricType?.replace('_', ' ').toUpperCase()} â€¢ {formatDate(session.timestamp)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span>{session.userAgent}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SnowButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSession(session)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </SnowButton>
                      {session.status === 'failed' && (
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleBlockSession(session)}
                        >
                          <ShieldX className="h-4 w-4 mr-2" />
                          Block
                        </SnowButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



