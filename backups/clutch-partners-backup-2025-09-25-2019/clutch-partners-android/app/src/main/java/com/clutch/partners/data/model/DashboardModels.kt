package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class BusinessDashboardResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("businessDashboard") val businessDashboard: BusinessDashboard?
)
