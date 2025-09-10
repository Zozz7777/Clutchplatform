import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/Logo Red.png',
  '/Logo White.png'
]

// Define admin routes that require authentication
const adminRoutes = [
  '/dashboard',
  '/fleet',
  '/ai',
  '/enterprise',
  '/hr',
  '/finance',
  '/crm',
  '/partners',
  '/marketing',
  '/projects',
  '/analytics',
  '/security',
  '/legal',
  '/communication',
  '/settings'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === '/'
  )
  
  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Get the auth token from cookies or headers
  // Use a non-sensitive auth flag cookie for gating (token stays in localStorage)
  const hasAuthFlag = !!request.cookies.get('clutch-auth')?.value
  const authTokenHeader = request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If it's an admin route and no auth token, redirect to login
  if (isAdminRoute && !hasAuthFlag && !authTokenHeader) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If it's the login page and user has auth token, redirect to dashboard
  if (pathname === '/login' && (hasAuthFlag || authTokenHeader)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If it's the root path, redirect to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
