'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Lock, 
  Shield, 
  Key, 
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  bio: string
  company: string
  position: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  passwordLastChanged: string
  activeSessions: number
  recoveryEmail: string
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    passwordLastChanged: '',
    activeSessions: 0,
    recoveryEmail: ''
  })

  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: (user as any)?.address || '',
    bio: (user as any)?.bio || '',
    company: (user as any)?.company || '',
    position: (user as any)?.position || ''
  })

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 2FA setup form
  const [twoFactorForm, setTwoFactorForm] = useState({
    phone: '',
    code: ''
  })

  useEffect(() => {
    loadSecuritySettings()
    loadActiveSessions()
  }, [])

  const loadSecuritySettings = async () => {
    try {
      const response = await apiClient.getSecuritySettings()
      if (response.success) {
        setSecuritySettings(response.data)
      }
    } catch (error) {
      console.error('Failed to load security settings:', error)
    }
  }

  const loadActiveSessions = async () => {
    setIsLoadingSessions(true)
    try {
      const response = await apiClient.getActiveSessions()
      if (response.success) {
        setActiveSessions(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploading(true)
    try {
      const response = await apiClient.uploadFile(file, 'profile-picture')

      if (response.success) {
        // Update user in store with new profile picture
        if (user) {
          setUser({
            ...user,
            profilePicture: (response.data as any).profilePicture
          })
        }
        toast.success('Profile picture updated successfully')
        setPreviewImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(response.message || 'Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await apiClient.updateProfile(formData)
      if (response.success) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      const response = await apiClient.changePassword(passwordForm)
      if (response.success) {
        toast.success('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Update security settings
        loadSecuritySettings()
      } else {
        toast.error(response.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password')
    }
  }

  const handleEnable2FA = async () => {
    try {
      const response = await apiClient.enable2FA(twoFactorForm.phone)
      if (response.success) {
        toast.success('2FA setup initiated. Please check your phone for the verification code.')
      } else {
        toast.error(response.message || 'Failed to setup 2FA')
      }
    } catch (error) {
      console.error('2FA setup error:', error)
      toast.error('Failed to setup 2FA')
    }
  }

  const handleVerify2FA = async () => {
    try {
      const response = await apiClient.verify2FA(twoFactorForm.code)
      if (response.success) {
        toast.success('2FA verification successful')
        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }))
        setTwoFactorForm({ phone: '', code: '' })
      } else {
        toast.error(response.message || 'Failed to verify 2FA')
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      toast.error('Failed to verify 2FA')
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await apiClient.revokeSession(sessionId)
      if (response.success) {
        toast.success('Session revoked successfully')
        loadActiveSessions()
      } else {
        toast.error(response.message || 'Failed to revoke session')
      }
    } catch (error) {
      console.error('Session revocation error:', error)
      toast.error('Failed to revoke session')
    }
  }

  const handleSetRecoveryOptions = async () => {
    try {
      const response = await apiClient.setRecoveryOptions(securitySettings.recoveryEmail)
      if (response.success) {
        toast.success('Recovery options updated successfully')
      } else {
        toast.error(response.message || 'Failed to update recovery options')
      }
    } catch (error) {
      console.error('Recovery options error:', error)
      toast.error('Failed to update recovery options')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </SnowCardTitle>
            <SnowCardDescription>
              Update your personal details and contact information
            </SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={previewImage || user?.profilePicture || 'https://ui-avatars.com/api/?name=User&background=E5E7EB&color=374151'}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
                <SnowButton
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                </SnowButton>
              </div>
              <div>
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
            <SnowInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <SnowInput
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <SnowInput
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <SnowInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <SnowInput
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                autoComplete="tel"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <SnowInput
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <SnowInput
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <SnowButton 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </SnowButton>
          </SnowCardContent>
        </SnowCard>
        <div className="space-y-6">
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </SnowCardTitle>
              <SnowCardDescription>
                Update your password to keep your account secure
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <SnowInput
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <SnowButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </SnowButton>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <SnowInput
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <SnowButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </SnowButton>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <SnowInput
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <SnowButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </SnowButton>
                </div>
              </div>

              <SnowButton onClick={handleChangePassword} className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </SnowButton>
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </SnowCardTitle>
              <SnowCardDescription>
                Add an extra layer of security to your account
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">SMS Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Receive codes via SMS
                  </p>
                </div>
                <Badge variant={securitySettings.twoFactorEnabled ? 'default' : 'secondary'}>
                  {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              {!securitySettings.twoFactorEnabled && (
                <div className="space-y-3">
                  <SnowInput
                    placeholder="Enter phone number"
                    value={twoFactorForm.phone}
                    onChange={(e) => setTwoFactorForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <SnowButton onClick={handleEnable2FA} className="w-full">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </SnowButton>
                </div>
              )}

              {securitySettings.twoFactorEnabled && (
                <div className="space-y-3">
                  <SnowInput
                    placeholder="Enter verification code"
                    value={twoFactorForm.code}
                    onChange={(e) => setTwoFactorForm(prev => ({ ...prev, code: e.target.value }))}
                  />
                  <SnowButton onClick={handleVerify2FA} className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Code
                  </SnowButton>
                </div>
              )}
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </SnowCardTitle>
              <SnowCardDescription>
                Manage your active login sessions
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              {isLoadingSessions ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 bg-slate-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.location} â€¢ {session.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.current && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {!session.current && (
                          <SnowButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            <LogOut className="h-3 w-3" />
                          </SnowButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SnowCardContent>
          </SnowCard>
          <SnowCard>
            <SnowCardHeader>
              <SnowCardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recovery Options
              </SnowCardTitle>
              <SnowCardDescription>
                Set up account recovery methods
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent className="space-y-4">
              <div>
                <Label htmlFor="recoveryEmail">Recovery Email</Label>
                <SnowInput
                  id="recoveryEmail"
                  type="email"
                  value={securitySettings.recoveryEmail}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, recoveryEmail: e.target.value }))}
                  placeholder="Enter recovery email"
                />
              </div>
              <SnowButton onClick={handleSetRecoveryOptions} className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Set Recovery Options
              </SnowButton>
            </SnowCardContent>
          </SnowCard>
        </div>
      </div>
    </div>
  )
}




