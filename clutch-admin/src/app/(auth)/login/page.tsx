'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { LuxuryButton } from '@/components/ui/luxury-button'
import { LuxuryInput } from '@/components/ui/luxury-input'
import { LuxuryCard, LuxuryCardContent, LuxuryCardDescription, LuxuryCardHeader, LuxuryCardTitle } from '@/components/ui/luxury-card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Crown,
  Sparkles,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard-consolidated')
    }
  }, [isAuthenticated, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await login(formData.email, formData.password, formData.rememberMe)
      
      if (response.success) {
        setSuccess('Login successful! Redirecting...')
        toast.success('Welcome back!', {
          description: 'You have been successfully logged in.'
        })
        // Redirect will be handled by the auth context
      } else {
        setError(response.message || 'Login failed. Please try again.')
        toast.error('Login Failed', {
          description: response.message || 'Please check your credentials and try again.'
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
      toast.error('Login Error', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    toast.info('Forgot Password', {
      description: 'Password reset functionality will be implemented soon.'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clutch-white-50 via-clutch-white-100 to-clutch-red-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Crown className="h-8 w-8 text-clutch-red-500 animate-pulse" />
            <Sparkles className="h-4 w-4 text-clutch-red-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <span className="text-clutch-red-700 font-luxury-sans font-medium">Loading Clutch experience...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clutch-white-50 via-clutch-white-100 to-clutch-red-50 p-4 relative overflow-hidden">
      {/* Clutch Brand Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFRDFCMjQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      {/* Floating Clutch Brand Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-clutch-red-300 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-clutch-red-400 rounded-full animate-bounce opacity-40"></div>
      <div className="absolute bottom-32 left-32 w-3 h-3 bg-clutch-red-500 rounded-full animate-pulse opacity-50"></div>
      <div className="absolute bottom-20 right-20 w-5 h-5 bg-clutch-red-600 rounded-full animate-bounce opacity-30"></div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Clutch Brand Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-clutch-red-500 to-clutch-red-600 rounded-luxury-2xl mb-6 shadow-luxury-lg relative">
            <Crown className="h-10 w-10 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-clutch-red-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-4xl font-luxury-serif font-bold bg-gradient-to-r from-clutch-red-600 to-clutch-red-700 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-clutch-red-700 font-luxury-sans text-lg">Sign in to your Clutch Admin account</p>
        </div>

        {/* Clutch Brand Login Form */}
        <LuxuryCard variant="glass" className="shadow-luxury-xl border-0 bg-white/90 backdrop-blur-md">
          <LuxuryCardHeader className="space-y-2 pb-6">
            <LuxuryCardTitle className="text-3xl text-center font-luxury-serif bg-gradient-to-r from-clutch-red-600 to-clutch-red-700 bg-clip-text text-transparent">
              Sign In
            </LuxuryCardTitle>
            <LuxuryCardDescription className="text-center text-clutch-red-700 font-luxury-sans">
              Enter your credentials to access the Clutch admin dashboard
            </LuxuryCardDescription>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-clutch-red-700 font-luxury-sans font-medium">Email Address</Label>
                <LuxuryInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@clutch.com"
                  variant="glass"
                  className="h-12"
                  required
                  disabled={isLoading}
                  icon={<Mail className="h-5 w-5 text-clutch-red-500" />}
                  iconPosition="left"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-clutch-red-700 font-luxury-sans font-medium">Password</Label>
                <div className="relative">
                  <LuxuryInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    variant="glass"
                    className="h-12"
                    required
                    disabled={isLoading}
                    icon={<Lock className="h-5 w-5 text-clutch-red-500" />}
                    iconPosition="left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-clutch-red-500 hover:text-clutch-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: !!checked }))
                    }
                    disabled={isLoading}
                    className="border-clutch-red-300 data-[state=checked]:bg-clutch-red-500 data-[state=checked]:border-clutch-red-500"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-clutch-red-700 font-luxury-sans">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-clutch-red-600 hover:text-clutch-red-700 transition-colors font-luxury-sans"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <LuxuryButton
                type="submit"
                variant="luxury"
                size="lg"
                className="w-full h-12 font-luxury-sans font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </LuxuryButton>
            </form>

            {/* Clutch Brand Demo Credentials */}
            <div className="mt-6 p-5 bg-gradient-to-r from-clutch-red-50 to-clutch-white-100 rounded-luxury-lg border border-clutch-red-200 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Crown className="h-4 w-4 text-clutch-red-500" />
              </div>
              <h4 className="text-sm font-luxury-sans font-semibold text-clutch-red-700 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-clutch-red-500" />
                Demo Credentials
              </h4>
              <div className="text-xs text-clutch-red-600 space-y-2 font-luxury-mono">
                <p className="flex items-center">
                  <Mail className="h-3 w-3 mr-2 text-clutch-red-500" />
                  <strong>Email:</strong> admin@clutch.com
                </p>
                <p className="flex items-center">
                  <Lock className="h-3 w-3 mr-2 text-clutch-red-500" />
                  <strong>Password:</strong> admin123
                </p>
              </div>
            </div>
          </LuxuryCardContent>
        </LuxuryCard>

        {/* Clutch Brand Footer */}
        <div className="text-center mt-8 text-sm text-clutch-red-600 font-luxury-sans">
          <p className="flex items-center justify-center">
            <Crown className="h-4 w-4 mr-2 text-clutch-red-500" />
            © 2024 Clutch Platform. All rights reserved.
            <Sparkles className="h-4 w-4 ml-2 text-clutch-red-500" />
          </p>
        </div>
      </div>
    </div>
  )
}