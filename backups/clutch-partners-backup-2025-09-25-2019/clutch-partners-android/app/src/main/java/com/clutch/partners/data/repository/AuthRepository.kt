package com.clutch.partners.data.repository

import com.clutch.partners.data.api.AuthApiService
import com.clutch.partners.data.api.AuthResponse
import com.clutch.partners.data.api.RequestToJoinRequest
import com.clutch.partners.data.api.SignInRequest
import com.clutch.partners.data.api.SignUpRequest
import com.clutch.partners.data.api.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApiService: AuthApiService
) {
    
    suspend fun signIn(email: String, password: String): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = SignInRequest(email, password)
                val response = authApiService.signIn(request)
                
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Sign in failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun signUp(partnerId: String, email: String, password: String): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = SignUpRequest(partnerId, email, password)
                val response = authApiService.validatePartnerId(request)
                
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Sign up failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun requestToJoin(
        businessName: String,
        address: String,
        ownerName: String,
        phoneNumber: String,
        partnerType: String
    ): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = RequestToJoinRequest(businessName, address, ownerName, phoneNumber, partnerType)
                val response = authApiService.requestToJoin(request)
                
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Request to join failed"
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
