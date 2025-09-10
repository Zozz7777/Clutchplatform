# Session Management Fixes for "Unknown User" Issue

## Problem Description
The admin application was experiencing an issue where users would be logged in successfully but after some time would revert to "Unknown User No email Employee" state, indicating a session management problem.

## Root Causes Identified

### 1. JWT Token User ID Mismatch
- **Issue**: The `/employee-me` endpoint was trying to access `req.user.userId` but the authentication middleware was setting `req.user.id`
- **Fix**: Updated the endpoint to handle both `userId` (from JWT) and `id` (from session) for backward compatibility

### 2. Token Refresh Endpoint Issues
- **Issue**: The refresh token endpoint required authentication, creating a circular dependency when tokens expired
- **Fix**: Removed authentication requirement and implemented proper refresh token validation

### 3. Missing Refresh Token Implementation
- **Issue**: The login response didn't include a refresh token, making token refresh impossible
- **Fix**: Added refresh token generation in the login endpoint with 7-day expiry

### 4. Frontend Token Management
- **Issue**: Frontend wasn't properly storing or using refresh tokens
- **Fix**: Updated frontend to store and use refresh tokens for automatic session renewal

### 5. No Automatic Session Management
- **Issue**: No automatic token refresh or session validation
- **Fix**: Implemented comprehensive session management system

## Fixes Implemented

### Backend Fixes

#### 1. Updated `/employee-me` Endpoint (`shared-backend/routes/auth.js`)
```javascript
// Handle both userId (from JWT) and id (from session) for backward compatibility
const employeeId = req.user.userId || req.user.id;

if (!employeeId) {
    return res.status(401).json({
        success: false,
        error: 'USER_ID_MISSING',
        message: 'User ID not found in token'
    });
}
```

#### 2. Fixed Refresh Token Endpoint (`shared-backend/routes/auth.js`)
```javascript
// Refresh JWT token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'REFRESH_TOKEN_REQUIRED',
                message: 'Refresh token is required'
            });
        }

        // Verify the refresh token
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const employeeId = decoded.userId;
            // ... rest of implementation
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_REFRESH_TOKEN',
                message: 'Invalid or expired refresh token'
            });
        }
    } catch (error) {
        // ... error handling
    }
});
```

#### 3. Enhanced Login Response (`shared-backend/routes/auth.js`)
```javascript
// Generate refresh token (longer expiry)
const refreshTokenPayload = {
    userId: employee._id,
    type: 'refresh',
    tokenType: 'refresh'
};
const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 days
});

const responseData = {
    success: true,
    message: 'Employee login successful',
    data: {
        user: { /* user data */ },
        token,
        refreshToken, // Added refresh token
        permissions: permissions.data
    }
};
```

### Frontend Fixes

#### 1. Updated API Client (`clutch-admin/src/lib/api.ts`)
```typescript
// Fixed refresh token endpoint URL
const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
    },
    body: JSON.stringify({ refreshToken: this.refreshToken }),
});
```

#### 2. Enhanced Auth Store (`clutch-admin/src/store/index.ts`)
```typescript
// Store tokens in localStorage for better security
if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('refresh-token', refreshToken) // Added refresh token storage
    document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
}

// Start session management
sessionManager.login()
```

#### 3. Session Management System (`clutch-admin/src/utils/sessionManager.ts`)
```typescript
export class SessionManager {
    private readonly REFRESH_INTERVAL = 14 * 60 * 1000 // 14 minutes
    private readonly SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000 // 7 days

    private async refreshSession() {
        try {
            const response = await apiClient.refreshAuthToken()
            if (response.success && response.data) {
                apiClient.setTokens(response.data.token, response.data.refreshToken)
                const { setUser } = useAuthStore.getState()
                if (response.data.user) {
                    setUser(response.data.user)
                }
            }
        } catch (error) {
            this.handleSessionTimeout()
        }
    }

    private async checkSessionValidity() {
        try {
            const response = await apiClient.getCurrentUser()
            if (!response.success) {
                await this.refreshSession()
            }
        } catch (error) {
            this.handleSessionTimeout()
        }
    }
}
```

#### 4. Session Provider (`clutch-admin/src/components/providers/session-provider.tsx`)
```typescript
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (isAuthenticated) {
            const cleanup = setupActivityTracking()
            sessionManager.login()
            return () => cleanup?.()
        } else {
            sessionManager.logout()
        }
    }, [isAuthenticated])

    return <>{children}</>
}
```

#### 5. Activity Tracking (`clutch-admin/src/utils/sessionManager.ts`)
```typescript
export const setupActivityTracking = () => {
    if (typeof window === 'undefined') return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
        sessionManager.extendSession()
    }

    activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true })
    })
}
```

#### 6. Debug Utilities (`clutch-admin/src/utils/debugSession.ts`)
```typescript
export const debugSession = {
    log: (message: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 [Session Debug] ${message}`, data || '')
        }
    },
    logToken: (token: string | null) => {
        // Decode and log token payload for debugging
    },
    logUser: (user: any) => {
        // Log user data for debugging
    },
    logStorage: () => {
        // Log localStorage state for debugging
    }
}
```

## Session Management Features

### 1. Automatic Token Refresh
- Tokens are automatically refreshed every 14 minutes (before 15-minute expiry)
- Uses refresh tokens with 7-day expiry for long-term sessions

### 2. Session Validation
- Validates session on page focus/visibility change
- Automatically attempts token refresh if validation fails

### 3. Activity Tracking
- Extends session timeout on user activity
- Prevents premature session expiration during active use

### 4. Graceful Degradation
- Handles network errors gracefully
- Falls back to logout if refresh fails
- Provides clear error messages

### 5. Debug Support
- Comprehensive logging in development mode
- Token payload inspection
- User data tracking
- Storage state monitoring

## Testing Recommendations

1. **Login Test**: Verify login returns both access and refresh tokens
2. **Token Refresh Test**: Wait for token expiry and verify automatic refresh
3. **Session Validation Test**: Switch browser tabs and return to verify session validation
4. **Activity Tracking Test**: Use the application and verify session extension
5. **Network Error Test**: Simulate network issues and verify graceful handling
6. **Long Session Test**: Use the application for extended periods to verify session persistence

## Monitoring

The system now includes comprehensive logging that will help identify any remaining session issues:

- Session refresh attempts and results
- Token validation outcomes
- User data changes
- Storage state changes
- Error conditions and handling

All debug logs are prefixed with `🔍 [Session Debug]` for easy identification in the browser console.
