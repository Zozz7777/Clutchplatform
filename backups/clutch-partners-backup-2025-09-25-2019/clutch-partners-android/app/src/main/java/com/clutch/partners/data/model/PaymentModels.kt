package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class PaymentsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("payments") val payments: List<PartnerPayment>?
)
