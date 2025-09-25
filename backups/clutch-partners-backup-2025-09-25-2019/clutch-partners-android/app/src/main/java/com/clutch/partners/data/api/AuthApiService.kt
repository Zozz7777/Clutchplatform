package com.clutch.partners.data.api

import retrofit2.Response
import retrofit2.http.*

data class SignInRequest(
    val email: String,
    val password: String
)

data class SignUpRequest(
    val partnerId: String,
    val email: String,
    val password: String
)

data class RequestToJoinRequest(
    val businessName: String,
    val address: String,
    val ownerName: String,
    val phoneNumber: String,
    val partnerType: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val token: String? = null,
    val user: User? = null
)

data class User(
    val id: String,
    val email: String,
    val partnerId: String? = null,
    val businessName: String? = null,
    val partnerType: String? = null
)

interface AuthApiService {
    @POST("auth/partner-login")
    suspend fun signIn(@Body request: SignInRequest): Response<AuthResponse>
    
    @POST("partners/validate-id")
    suspend fun validatePartnerId(@Body request: SignUpRequest): Response<AuthResponse>
    
    @POST("partners/request-join")
    suspend fun requestToJoin(@Body request: RequestToJoinRequest): Response<AuthResponse>
    
    @GET("partners/me")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<User>
}
