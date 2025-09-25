package com.clutch.partners.data.api

import retrofit2.Response
import retrofit2.http.*

data class SignInRequest(
    val emailOrPhone: String,
    val password: String
)

data class SignUpRequest(
    val partnerId: String,
    val email: String,
    val phone: String,
    val password: String,
    val businessName: String,
    val ownerName: String,
    val partnerType: String,
    val businessAddress: BusinessAddress,
    val workingHours: Map<String, Any>? = null,
    val businessSettings: Map<String, Any>? = null
)

data class BusinessAddress(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String
)

data class RequestToJoinRequest(
    val businessName: String,
    val ownerName: String,
    val phone: String,
    val email: String,
    val address: String,
    val partnerType: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData? = null
)

data class AuthData(
    val partner: Partner? = null,
    val token: String? = null,
    val requestId: String? = null
)

data class Partner(
    val _id: String,
    val partnerId: String,
    val email: String,
    val phone: String,
    val businessName: String,
    val ownerName: String,
    val partnerType: String,
    val status: String,
    val isVerified: Boolean,
    val businessAddress: BusinessAddress? = null
)

interface AuthApiService {
    @POST("partners/auth/signin")
    suspend fun signIn(@Body request: SignInRequest): Response<AuthResponse>
    
    @POST("partners/auth/signup")
    suspend fun signUp(@Body request: SignUpRequest): Response<AuthResponse>
    
    @POST("partners/auth/request-to-join")
    suspend fun requestToJoin(@Body request: RequestToJoinRequest): Response<AuthResponse>
    
    @GET("partners/settings")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<AuthResponse>
}
