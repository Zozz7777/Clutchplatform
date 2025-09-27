package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("message")
    val message: String,
    
    @SerializedName("timestamp")
    val timestamp: String
)
