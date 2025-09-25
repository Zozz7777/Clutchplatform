package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class PartnerSettings(
    @SerializedName("_id")
    val id: String? = null,
    @SerializedName("partnerId")
    val partnerId: String,
    @SerializedName("businessName")
    val businessName: String? = null,
    @SerializedName("ownerName")
    val ownerName: String? = null,
    @SerializedName("businessAddress")
    val businessAddress: BusinessAddress? = null,
    @SerializedName("phoneNumber")
    val phoneNumber: String? = null,
    @SerializedName("email")
    val email: String? = null,
    @SerializedName("workingHours")
    val workingHours: WorkingHours? = null,
    @SerializedName("businessSettings")
    val businessSettings: BusinessSettings? = null,
    @SerializedName("connectedToClutchParts")
    val connectedToClutchParts: Boolean? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
)

data class SettingsUpdateRequest(
    @SerializedName("businessName")
    val businessName: String? = null,
    @SerializedName("ownerName")
    val ownerName: String? = null,
    @SerializedName("businessAddress")
    val businessAddress: BusinessAddress? = null,
    @SerializedName("phoneNumber")
    val phoneNumber: String? = null,
    @SerializedName("email")
    val email: String? = null,
    @SerializedName("workingHours")
    val workingHours: WorkingHours? = null,
    @SerializedName("businessSettings")
    val businessSettings: BusinessSettings? = null,
    @SerializedName("connectedToClutchParts")
    val connectedToClutchParts: Boolean? = null
)

