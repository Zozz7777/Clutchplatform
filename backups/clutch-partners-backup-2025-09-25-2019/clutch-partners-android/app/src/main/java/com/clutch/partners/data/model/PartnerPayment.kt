package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class PartnerPayment(
    @SerializedName("_id")
    val id: String? = null,
    @SerializedName("partnerId")
    val partnerId: String,
    @SerializedName("amount")
    val amount: Double,
    @SerializedName("date")
    val date: String,
    @SerializedName("status")
    val status: String, // Pending, Issued, Completed
    @SerializedName("type")
    val type: String, // Weekly Payout, Bonus, etc.
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null
)

data class WeeklyIncomeResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("message")
    val message: String? = null,
    @SerializedName("weeklyIncome")
    val weeklyIncome: Double? = null,
    @SerializedName("nextPayoutDate")
    val nextPayoutDate: String? = null,
    @SerializedName("daysUntilPayout")
    val daysUntilPayout: Int? = null,
    @SerializedName("lastPayout")
    val lastPayout: PartnerPayment? = null
)

data class PaymentHistoryResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("message")
    val message: String? = null,
    @SerializedName("payments")
    val payments: List<PartnerPayment>? = null,
    @SerializedName("total")
    val total: Int? = null
)
