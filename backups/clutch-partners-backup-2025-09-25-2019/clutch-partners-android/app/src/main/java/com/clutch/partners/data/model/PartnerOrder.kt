package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class PartnerOrder(
    @SerializedName("_id")
    val id: String? = null,
    @SerializedName("partnerId")
    val partnerId: String,
    @SerializedName("customerName")
    val customerName: String,
    @SerializedName("customerPhone")
    val customerPhone: String? = null,
    @SerializedName("customerEmail")
    val customerEmail: String? = null,
    @SerializedName("serviceOrProduct")
    val serviceOrProduct: String,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("totalAmount")
    val totalAmount: Double,
    @SerializedName("status")
    val status: String, // Pending, Paid, Rejected, Completed
    @SerializedName("orderType")
    val orderType: String? = null, // Service, Product, Appointment
    @SerializedName("appointmentDate")
    val appointmentDate: String? = null,
    @SerializedName("appointmentTime")
    val appointmentTime: String? = null,
    @SerializedName("notes")
    val notes: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
)

