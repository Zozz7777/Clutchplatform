package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class PaymentMethod(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("type") val type: String, // "card", "wallet", "bank_transfer"
    @SerializedName("provider") val provider: String, // "visa", "mastercard", "paypal", etc.
    @SerializedName("lastFourDigits") val lastFourDigits: String?,
    @SerializedName("expiryMonth") val expiryMonth: Int?,
    @SerializedName("expiryYear") val expiryYear: Int?,
    @SerializedName("isDefault") val isDefault: Boolean = false,
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("createdAt") val createdAt: String
)

data class PaymentRequest(
    @SerializedName("orderId") val orderId: String?,
    @SerializedName("amount") val amount: Double,
    @SerializedName("currency") val currency: String = "USD",
    @SerializedName("paymentMethodId") val paymentMethodId: String,
    @SerializedName("description") val description: String,
    @SerializedName("installments") val installments: Int? = null
)

data class PaymentResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("transactionId") val transactionId: String,
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("redirectUrl") val redirectUrl: String?
)
