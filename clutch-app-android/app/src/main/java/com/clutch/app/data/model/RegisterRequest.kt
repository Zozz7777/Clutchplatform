package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("email")
    val email: String,
    
    @SerializedName("phone")
    val phone: String,
    
    @SerializedName("firstName")
    val firstName: String,
    
    @SerializedName("lastName")
    val lastName: String,
    
    @SerializedName("password")
    val password: String,
    
    @SerializedName("confirmPassword")
    val confirmPassword: String,
    
    @SerializedName("agreeToTerms")
    val agreeToTerms: Boolean
)
