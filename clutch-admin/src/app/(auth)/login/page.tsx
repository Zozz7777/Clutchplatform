'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Building2,
  Users,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { ErrorTracker } from '@/components/debug/error-tracker'
import Image from 'next/image'

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
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

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
      // Connect to real backend authentication
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      await login(formData.email, formData.password)
      
      setSuccess('Login successful! Redirecting...')
      toast.success('Welcome back!', {
        description: 'You have been successfully logged in.'
      })
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      toast.error('Login Error', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.info('Forgot Password', {
      description: 'Password reset functionality will be implemented soon.'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clutch-gray-50 via-white to-clutch-red-50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Building2 className="h-8 w-8 text-clutch-red-500 animate-pulse" />
            <Sparkles className="h-4 w-4 text-clutch-red-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <span className="text-clutch-gray-700 font-medium">Loading Clutch experience...</span>
        </div>
      </div>
    )
  }

  return (
    <ErrorTracker>
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundImage: `url('CUPRA-accelerates-growth-journey-with-Tindaya-World-Premiere-new-Tribe-editions-and-Middle-East-ambitions_01_HQ.avif')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-clutch-red-500/20 via-clutch-red-600/30 to-clutch-red-700/40 backdrop-blur-sm"></div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-clutch-red-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-clutch-red-300 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-32 left-32 w-16 h-16 bg-clutch-red-400 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-clutch-red-500 rounded-full opacity-35 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-clutch-gray-300 rounded-full opacity-25 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-clutch-gray-400 rounded-full opacity-30 animate-bounce"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-clutch-red-500 via-clutch-red-600 to-clutch-red-700 p-12 flex-col justify-center text-white relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 p-2">
                  <Image 
                    src="/Assets/logos/logowhite.png" 
                    alt="Clutch Logo" 
                    width={32} 
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Clutch Admin</h1>
                  <p className="text-clutch-red-100">Enterprise Management Platform</p>
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Manage Your Automotive Empire
              </h2>
              
              <p className="text-xl text-clutch-red-100 mb-12 leading-relaxed">
                Comprehensive admin dashboard for fleet management, customer relations, 
                financial operations, and business intelligence.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">HR & Employee Management</h3>
                    <p className="text-clutch-red-100 text-sm">Complete workforce administration</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Financial Analytics</h3>
                    <p className="text-clutch-red-100 text-sm">Real-time business intelligence</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Team Collaboration</h3>
                    <p className="text-clutch-red-100 text-sm">Integrated chat and communication</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-clutch-red-500 to-clutch-red-600 rounded-2xl mb-4 shadow-lg p-3">
                  <Image 
                    src="/Assets/logos/Logored.png" 
                    alt="Clutch Logo" 
                    width={40} 
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-clutch-gray-700">Clutch Admin</h1>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-clutch-gray-700 mb-2">Employee Login</h2>
                <p className="text-clutch-gray-600">Sign in to drive the automotive revolution</p>
        </div>

              {/* Login Form */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Glassmorphism inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
              )}

              {/* Success Alert */}
              {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{success}</span>
                    </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-clutch-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-clutch-gray-400" />
                      <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                        placeholder="employee@clutch.com"
                        className="w-full pl-10 pr-4 py-3 border border-clutch-gray-300 rounded-lg focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500 bg-white/90 text-clutch-gray-900 placeholder-clutch-gray-400 transition-all duration-200 hover:border-clutch-red-300"
                  required
                  disabled={isLoading}
                />
                    </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-clutch-gray-700">
                      Password
                    </label>
                <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-clutch-gray-400" />
                      <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 border border-clutch-gray-300 rounded-lg focus:ring-2 focus:ring-clutch-red-500 focus:border-clutch-red-500 bg-white/90 text-clutch-gray-900 placeholder-clutch-gray-400 transition-all duration-200 hover:border-clutch-red-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-clutch-gray-400 hover:text-clutch-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                    id="rememberMe"
                    name="rememberMe"
                        type="checkbox"
                    checked={formData.rememberMe}
                        onChange={handleInputChange}
                    disabled={isLoading}
                        className="w-4 h-4 text-clutch-red-500 border-clutch-gray-300 rounded focus:ring-clutch-red-500"
                  />
                      <label htmlFor="rememberMe" className="ml-2 text-sm text-clutch-gray-700">
                    Remember me
                      </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                      className="text-sm text-clutch-red-600 hover:text-clutch-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
                  <button
                type="submit"
                disabled={isLoading}
                    className="w-full bg-gradient-to-r from-clutch-red-500 to-clutch-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-clutch-red-600 hover:to-clutch-red-700 focus:ring-2 focus:ring-clutch-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
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
                  </button>
            </form>

                {/* Employee Access Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-clutch-red-50 to-clutch-gray-50 rounded-lg border border-clutch-red-200">
                  <div className="flex items-center mb-3">
                    <Shield className="h-4 w-4 text-clutch-red-500 mr-2" />
                    <h4 className="text-sm font-semibold text-clutch-gray-700">Secure Employee Access</h4>
                  </div>
                  <div className="text-xs text-clutch-gray-600">
                    <p>Use your company email and password to access the Clutch Admin system.</p>
                    <p className="mt-1">Contact your administrator if you need assistance.</p>
                  </div>
                </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-sm text-clutch-gray-600">
                <p className="flex items-center justify-center">
                  <Image 
                    src="/Assets/logos/Logored.png" 
                    alt="Clutch Logo" 
                    width={16} 
                    height={16}
                    className="object-contain mr-2"
                  />
                  © 2025 Z Garage. All rights reserved.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
    </ErrorTracker>
  )
}