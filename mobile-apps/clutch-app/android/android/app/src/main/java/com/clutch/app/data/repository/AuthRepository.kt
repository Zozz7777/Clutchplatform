/**
 * Authentication Repository
 * Handles authentication data operations
 */

package com.clutch.app.data.repository

import com.clutch.app.data.api.ApiService
import com.clutch.app.data.model.AuthData
import com.clutch.app.data.model.LoginRequest
import com.clutch.app.data.model.RegisterRequest
import com.clutch.app.data.model.OtpRequest
import com.clutch.app.data.model.RefreshRequest
import com.clutch.app.data.TokenManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {
    
    /**
     * Login user
     */
    suspend fun login(email: String, password: String): AuthData {
        val request = LoginRequest(email, password)
        val response = apiService.login(request)
        
        if (response.isSuccessful && response.body()?.success == true) {
            val authData = response.body()!!.data
            tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
            return authData
        } else {
            throw Exception(response.body()?.message ?: "Login failed")
        }
    }
    
    /**
     * Register user
     */
    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String
    ): AuthData {
        val request = RegisterRequest(email, password, firstName, lastName, phone)
        val response = apiService.register(request)
        
        if (response.isSuccessful && response.body()?.success == true) {
            val authData = response.body()!!.data
            tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
            return authData
        } else {
            throw Exception(response.body()?.message ?: "Registration failed")
        }
    }
    
    /**
     * Verify OTP
     */
    suspend fun verifyOTP(otp: String): AuthData {
        val otpRequest = OtpRequest("", otp) // Email would be stored in token manager
        val response = apiService.verifyOtp(otpRequest)
        
        if (response.isSuccessful && response.body()?.success == true) {
            val authData = response.body()!!.data
            tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
            return authData
        } else {
            throw Exception(response.body()?.message ?: "OTP verification failed")
        }
    }
    
    /**
     * Resend OTP
     */
    suspend fun resendOTP() {
        val response = apiService.resendOtp(com.clutch.app.data.model.ResendOtpRequest(""))
        
        if (response.isSuccessful && response.body()?.success == true) {
            // OTP resent successfully
            return
        } else {
            throw Exception(response.body()?.message ?: "Failed to resend OTP")
        }
    }
    
    /**
     * Get current user
     */
    suspend fun getCurrentUser(): AuthData? {
        return try {
            val token = tokenManager.getAccessToken()
            if (token != null && !tokenManager.isTokenExpired()) {
                // TODO: Implement get current user API call
                // For now, return null as this endpoint needs to be implemented
                null
            } else if (token != null && tokenManager.isTokenExpired()) {
                // Try to refresh token
                try {
                    refreshToken()
                    // Retry getting user after token refresh
                    null // TODO: Implement actual user data retrieval
                } catch (e: Exception) {
                    // Refresh failed, clear tokens
                    tokenManager.clearTokens()
                    null
                }
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Refresh token
     */
    suspend fun refreshToken(): AuthData {
        val refreshToken = tokenManager.getRefreshToken()
        if (refreshToken == null) {
            throw Exception("No refresh token available")
        }
        
        val refreshRequest = RefreshRequest(refreshToken)
        val response = apiService.refreshToken(refreshRequest)
        
        if (response.isSuccessful && response.body()?.success == true) {
            val authData = response.body()!!.data
            tokenManager.saveTokens(authData.accessToken, authData.refreshToken)
            return authData
        } else {
            throw Exception(response.body()?.message ?: "Token refresh failed")
        }
    }
    
    /**
     * Logout user
     */
    suspend fun logout() {
        try {
            val token = tokenManager.getAccessToken()
            if (token != null) {
                val response = apiService.logout(token)
                // Even if the API call fails, we should clear local tokens
            }
        } catch (e: Exception) {
            // Log error but continue with local logout
        } finally {
            tokenManager.clearTokens()
        }
    }
    
    /**
     * Check if user is authenticated
     */
    suspend fun isAuthenticated(): Boolean {
        return try {
            val token = tokenManager.getAccessToken()
            token != null && !tokenManager.isTokenExpired()
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Get authentication state as Flow
     */
    fun getAuthState(): Flow<AuthData?> = flow {
        emit(getCurrentUser())
    }
}

