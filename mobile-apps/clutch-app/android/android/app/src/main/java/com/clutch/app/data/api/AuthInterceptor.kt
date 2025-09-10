package com.clutch.app.data.api

import com.clutch.app.data.TokenManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Skip auth for login, register, and other public endpoints
        if (isPublicEndpoint(originalRequest.url.encodedPath)) {
            return chain.proceed(originalRequest)
        }
        
        val token = tokenManager.getAccessToken()
        
        // If no token, proceed without authorization header
        if (token == null) {
            return chain.proceed(originalRequest)
        }
        
        // Check if token is expired
        if (tokenManager.isTokenExpired()) {
            // TODO: Implement automatic token refresh
            // For now, proceed with expired token and let the server handle it
        }
        
        // Add authorization header
        val authenticatedRequest = originalRequest.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()
        
        val response = chain.proceed(authenticatedRequest)
        
        // Handle 401 Unauthorized responses
        if (response.code == 401) {
            // TODO: Implement automatic token refresh and retry
            // For now, just return the response
        }
        
        return response
    }
    
    private fun isPublicEndpoint(path: String): Boolean {
        val publicEndpoints = listOf(
            "/auth/login",
            "/auth/register",
            "/auth/verify-otp",
            "/auth/resend-otp",
            "/auth/forgot-password",
            "/health",
            "/api-docs"
        )
        
        return publicEndpoints.any { path.contains(it) }
    }
}
