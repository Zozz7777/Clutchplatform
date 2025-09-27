package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("emailOrPhone")
    val emailOrPhone: String,
    
    @SerializedName("password")
    val password: String,
    
    @SerializedName("rememberMe")
    val rememberMe: Boolean = false
)
