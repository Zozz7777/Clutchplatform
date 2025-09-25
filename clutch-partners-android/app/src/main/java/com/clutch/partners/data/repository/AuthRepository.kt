package com.clutch.partners.data.repository

import com.clutch.partners.data.api.AuthApiService
import com.clutch.partners.data.api.AuthResponse
import com.clutch.partners.data.api.RequestToJoinRequest
import com.clutch.partners.data.api.SignInRequest
import com.clutch.partners.data.api.SignUpRequest
import com.clutch.partners.data.api.BusinessAddress
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authApiService: AuthApiService
) {
    
    suspend fun signIn(emailOrPhone: String, password: String): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = SignInRequest(emailOrPhone, password)
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
    
    suspend fun signUp(
        partnerId: String, 
        email: String, 
        phone: String,
        password: String,
        businessName: String,
        ownerName: String,
        partnerType: String,
        businessAddress: BusinessAddress
    ): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = SignUpRequest(partnerId, email, phone, password, businessName, ownerName, partnerType, businessAddress)
                val response = authApiService.signUp(request)
                
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
        ownerName: String,
        phone: String,
        email: String,
        address: String,
        partnerType: String
    ): Result<AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val request = RequestToJoinRequest(businessName, ownerName, phone, email, address, partnerType)
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
