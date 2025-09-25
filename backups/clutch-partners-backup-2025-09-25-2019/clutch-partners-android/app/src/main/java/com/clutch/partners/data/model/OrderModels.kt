package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class OrderStatusUpdateRequest(
    @SerializedName("status") val status: String
)

data class OrdersResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("orders") val orders: List<PartnerOrder>?
)

data class InvoiceStatusUpdateRequest(
    @SerializedName("status") val status: String
)

data class InvoicesResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("invoices") val invoices: List<PartnerOrder>? // Assuming invoices are similar to orders
)
