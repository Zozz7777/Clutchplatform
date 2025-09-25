package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class SettingsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("settings") val settings: PartnerSettings?
)
