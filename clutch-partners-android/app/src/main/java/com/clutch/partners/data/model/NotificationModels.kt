package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class NotificationRequest(
    @SerializedName("title") val title: String,
    @SerializedName("body") val body: String,
    @SerializedName("recipient") val recipient: String
)

data class NotificationResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?
)