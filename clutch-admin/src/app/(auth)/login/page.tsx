'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Settings, Car, Zap, Wrench, Gauge } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { useAuthStore } from '@/store'

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

// Background Icons Component - Interactive floating icons with glass effect
const BackgroundIcons = () => {
  const icons = [
    { Icon: Settings, delay: 0, position: { left: '8%', top: '15%' } },
    { Icon: Wrench, delay: 3, position: { left: '88%', top: '20%' } },
    { Icon: Car, delay: 6, position: { left: '15%', top: '70%' } },
    { Icon: Zap, delay: 9, position: { left: '82%', top: '65%' } },
    { Icon: Gauge, delay: 12, position: { left: '6%', top: '80%' } },
    { Icon: Settings, delay: 15, position: { left: '92%', top: '85%' } },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-auto">
      {icons.map(({ Icon, delay, position }, index) => (
        <div
          key={index}
          className="absolute animate-float opacity-30 hover:opacity-100 hover:scale-150 transition-all duration-700 cursor-pointer group z-10"
          style={{
            left: position.left,
            top: position.top,
            animationDelay: `${delay}s`,
            animationDuration: `${10 + Math.random() * 6}s`,
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-sm group-hover:bg-red-400/40 group-hover:blur-md transition-all duration-500"></div>
            <Icon className="relative h-12 w-12 text-red-300 group-hover:text-red-100 group-hover:drop-shadow-2xl transition-all duration-500 transform group-hover:rotate-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  // Get redirect URL from search params
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, user, router, redirectTo])

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    clearError()
    
    try {
      await login(data.email, data.password)
      // The useEffect will handle the redirect if login is successful
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
         <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden backdrop-blur-xl">
      <BackgroundIcons />
      <div className="relative z-10 min-h-screen flex flex-col">
         <div className="flex-1 flex flex-col justify-center items-center px-4 py-4">
           <div className="text-center mb-4">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl mb-4 border border-red-400/30">
               <img
                 src="/Logo White.png"
                 alt="Clutch Logo"
                 className="w-10 h-10 object-contain"
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.src = "/LogoWhite.svg";
                 }}
               />
             </div>
             <p className="text-sm lg:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
               Sign in to drive the automotive revolution
             </p>
           </div>
         </div>
         <div className="flex justify-center items-center px-4 py-2">
           <div className="w-full max-w-md">
             <div className="text-center mb-4">
               <h2 className="text-xl font-bold text-white mb-1">
                 Welcome Back
               </h2>
               <p className="text-slate-400 text-xs">
                 Sign in to drive the automotive revolution
               </p>
             </div>
             <div className="bg-red-900/20 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-red-400/30 bg-gradient-to-b from-red-800/40 to-red-900/40">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                 <div className="space-y-1">
                   <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                     Email Address
                   </label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                     <SnowInput
                       id="email"
                       type="email"
                       placeholder="Enter your email"
                       autoComplete="email"
                       className="pl-10 h-10 bg-red-400/20 border-red-300/50 text-white placeholder-red-200 focus:border-white/50 focus:ring-white/20 focus:bg-red-400/30 transition-all duration-200"
                       {...register('email')}
                     />
                   </div>
                   {errors.email && (
                     <p className="text-xs text-red-400 flex items-center mt-1">
                       <AlertCircle className="h-3 w-3 mr-2" />
                       {errors.email.message}
                     </p>
                   )}
                 </div>
                 <div className="space-y-1">
                   <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                     Password
                   </label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                     <SnowInput
                       id="password"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="Enter your password"
                       autoComplete="current-password"
                       className="pl-10 pr-10 h-10 bg-red-400/20 border-red-300/50 text-white placeholder-red-200 focus:border-white/50 focus:ring-white/20 focus:bg-red-400/30 transition-all duration-200"
                       {...register('password')}
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-red-100 transition-colors duration-200"
                     >
                       {showPassword ? (
                         <EyeOff className="h-4 w-4" />
                       ) : (
                         <Eye className="h-4 w-4" />
                       )}
                     </button>
                   </div>
                   {errors.password && (
                     <p className="text-xs text-red-400 flex items-center mt-1">
                       <AlertCircle className="h-3 w-3 mr-2" />
                       {errors.password.message}
                     </p>
                   )}
                 </div>
                 {error && (
                   <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                     <p className="text-xs text-red-400 flex items-center">
                       <AlertCircle className="h-3 w-3 mr-2" />
                       {error}
                     </p>
                   </div>
                 )}
                 <SnowButton
                   type="submit"
                   className="w-full h-10 bg-clutch-primary hover:bg-clutch-primary-dark text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mt-3"
                   disabled={isLoading}
                 >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </SnowButton>
              </form>
            </div>
             <div className="text-center mt-3">
               <p className="text-slate-400 text-xs">
                 Need help?{' '}
                 <a href="#" className="text-red-400 hover:text-red-300 transition-colors duration-200">
                   Contact support
                 </a>
               </p>
             </div>
          </div>
        </div>
         <div className="flex-1 flex justify-center items-center px-4 py-3">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
             <div className="flex flex-col items-center text-center">
               <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                 <Car className="h-4 w-4 text-red-400" />
               </div>
               <h3 className="text-white font-semibold text-xs mb-1">Automotive Excellence</h3>
               <p className="text-slate-400 text-xs">Premium vehicles and services</p>
             </div>
             
             <div className="flex flex-col items-center text-center">
               <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                 <Zap className="h-4 w-4 text-red-400" />
               </div>
               <h3 className="text-white font-semibold text-xs mb-1">Lightning Fast</h3>
               <p className="text-slate-400 text-xs">Quick and efficient operations</p>
             </div>
             
             <div className="flex flex-col items-center text-center">
               <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-2">
                 <Settings className="h-4 w-4 text-red-400" />
               </div>
               <h3 className="text-white font-semibold text-xs mb-1">Smart Management</h3>
               <p className="text-slate-400 text-xs">Advanced admin tools</p>
             </div>
           </div>
         </div>
         <div className="text-center py-2">
           <p className="text-slate-500 text-xs">
             © 2025 ZGARAGE. All rights reserved.
           </p>
         </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clutch-primary mx-auto mb-3"></div>
          <p className="text-white text-base">Loading Clutch Admin...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}


