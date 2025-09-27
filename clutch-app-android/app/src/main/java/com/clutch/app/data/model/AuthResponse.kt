package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("data")
    val data: AuthData,
    
    @SerializedName("message")
    val message: String,
    
    @SerializedName("timestamp")
    val timestamp: String
)

data class AuthData(
    @SerializedName("token")
    val token: String,
    
    @SerializedName("refreshToken")
    val refreshToken: String,
    
    @SerializedName("user")
    val user: User
)
