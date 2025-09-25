package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class PartnerUser(
    @SerializedName("_id")
    val id: String? = null,
    @SerializedName("emailOrPhone")
    val emailOrPhone: String,
    @SerializedName("password")
    val password: String? = null,
    @SerializedName("role")
    val role: String, // Owner, Manager, Staff, Accountant
    @SerializedName("partnerId")
    val partnerId: String? = null,
    @SerializedName("businessName")
    val businessName: String? = null,
    @SerializedName("ownerName")
    val ownerName: String? = null,
    @SerializedName("partnerType")
    val partnerType: String? = null, // Repair Center, Auto Parts Shop, etc.
    @SerializedName("businessAddress")
    val businessAddress: BusinessAddress? = null,
    @SerializedName("workingHours")
    val workingHours: WorkingHours? = null,
    @SerializedName("businessSettings")
    val businessSettings: BusinessSettings? = null,
    @SerializedName("financialInfo")
    val financialInfo: FinancialInfo? = null,
    @SerializedName("notificationPreferences")
    val notificationPreferences: NotificationPreferences? = null,
    @SerializedName("appPreferences")
    val appPreferences: AppPreferences? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
)

data class BusinessAddress(
    @SerializedName("street")
    val street: String? = null,
    @SerializedName("city")
    val city: String? = null,
    @SerializedName("state")
    val state: String? = null,
    @SerializedName("zip")
    val zip: String? = null,
    @SerializedName("country")
    val country: String? = null
)

data class WorkingHours(
    @SerializedName("monday")
    val monday: DayHours? = null,
    @SerializedName("tuesday")
    val tuesday: DayHours? = null,
    @SerializedName("wednesday")
    val wednesday: DayHours? = null,
    @SerializedName("thursday")
    val thursday: DayHours? = null,
    @SerializedName("friday")
    val friday: DayHours? = null,
    @SerializedName("saturday")
    val saturday: DayHours? = null,
    @SerializedName("sunday")
    val sunday: DayHours? = null
)

data class DayHours(
    @SerializedName("open")
    val open: String? = null,
    @SerializedName("close")
    val close: String? = null
)

data class BusinessSettings(
    @SerializedName("acceptsOnlineOrders")
    val acceptsOnlineOrders: Boolean? = null,
    @SerializedName("deliveryAvailable")
    val deliveryAvailable: Boolean? = null
)

data class FinancialInfo(
    @SerializedName("bankName")
    val bankName: String? = null,
    @SerializedName("accountNumber")
    val accountNumber: String? = null,
    @SerializedName("swiftCode")
    val swiftCode: String? = null
)

data class NotificationPreferences(
    @SerializedName("push")
    val push: Boolean? = null,
    @SerializedName("email")
    val email: Boolean? = null,
    @SerializedName("sms")
    val sms: Boolean? = null
)

data class AppPreferences(
    @SerializedName("language")
    val language: String? = null,
    @SerializedName("theme")
    val theme: String? = null
)

