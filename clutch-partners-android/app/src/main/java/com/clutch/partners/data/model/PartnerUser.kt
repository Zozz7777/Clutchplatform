package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class PartnerUser(
    val partnerId: String,
    val email: String,
    val phone: String,
    val businessName: String,
    val ownerName: String,
    val partnerType: PartnerType,
    val businessAddress: BusinessAddress,
    val workingHours: WorkingHours,
    val businessSettings: BusinessSettings,
    val status: PartnerStatus,
    val isVerified: Boolean,
    val role: PartnerRole,
    val permissions: List<String>,
    val financial: FinancialInfo,
    val notificationPreferences: NotificationPreferences,
    val appPreferences: AppPreferences,
    val lastLogin: String? = null
) : Parcelable

@Parcelize
data class BusinessAddress(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String = "Egypt",
    val coordinates: Coordinates? = null
) : Parcelable

@Parcelize
data class Coordinates(
    val latitude: Double,
    val longitude: Double
) : Parcelable

@Parcelize
data class WorkingHours(
    val monday: DayHours,
    val tuesday: DayHours,
    val wednesday: DayHours,
    val thursday: DayHours,
    val friday: DayHours,
    val saturday: DayHours,
    val sunday: DayHours
) : Parcelable

@Parcelize
data class DayHours(
    val open: String,
    val close: String,
    val available: Boolean = true
) : Parcelable

@Parcelize
data class BusinessSettings(
    val logo: String? = null,
    val description: String? = null,
    val services: List<String> = emptyList(),
    val isConnectedToPartsSystem: Boolean = false,
    val partsSystemCredentials: PartsSystemCredentials? = null
) : Parcelable

@Parcelize
data class PartsSystemCredentials(
    val apiKey: String,
    val endpoint: String
) : Parcelable

@Parcelize
data class FinancialInfo(
    val currency: String = "EGP",
    val weeklyIncome: Double = 0.0,
    val totalEarnings: Double = 0.0,
    val pendingPayout: Double = 0.0,
    val lastPayoutDate: String? = null,
    val nextPayoutDate: String? = null,
    val payoutMethod: PayoutMethod? = null
) : Parcelable

@Parcelize
data class PayoutMethod(
    val type: String, // "bank_transfer" or "digital_wallet"
    val details: Map<String, Any>
) : Parcelable

@Parcelize
data class NotificationPreferences(
    val push: Boolean = true,
    val email: Boolean = true,
    val sms: Boolean = true,
    val newOrder: Boolean = true,
    val paymentUpdate: Boolean = true,
    val payoutNotification: Boolean = true
) : Parcelable

@Parcelize
data class AppPreferences(
    val language: String = "ar", // "ar" or "en"
    val theme: String = "auto", // "light", "dark", or "auto"
    val currency: String = "EGP"
) : Parcelable

enum class PartnerType(val displayName: String, val icon: String) {
    REPAIR_CENTER("Repair Center", "🛠️"),
    AUTO_PARTS_SHOP("Auto Parts Shop", "⚙️"),
    ACCESSORIES_SHOP("Accessories Shop", "🎯"),
    IMPORTER_MANUFACTURER("Importer / Manufacturer", "🏭"),
    SERVICE_CENTER("Service Center", "🚗");

    companion object {
        fun fromString(value: String): PartnerType {
            return when (value) {
                "repair_center" -> REPAIR_CENTER
                "auto_parts_shop" -> AUTO_PARTS_SHOP
                "accessories_shop" -> ACCESSORIES_SHOP
                "importer_manufacturer" -> IMPORTER_MANUFACTURER
                "service_center" -> SERVICE_CENTER
                else -> REPAIR_CENTER
            }
        }
    }
}

enum class PartnerStatus(val displayName: String) {
    PENDING("Pending"),
    ACTIVE("Active"),
    SUSPENDED("Suspended"),
    TERMINATED("Terminated");

    companion object {
        fun fromString(value: String): PartnerStatus {
            return when (value) {
                "pending" -> PENDING
                "active" -> ACTIVE
                "suspended" -> SUSPENDED
                "terminated" -> TERMINATED
                else -> PENDING
            }
        }
    }
}

enum class PartnerRole(val displayName: String, val permissions: List<String>) {
    OWNER("Owner", listOf(
        "view_orders", "manage_orders", "view_payments", "manage_payments",
        "view_settings", "manage_settings", "view_dashboard", "manage_dashboard",
        "view_invoices", "manage_invoices", "view_analytics", "manage_analytics"
    )),
    MANAGER("Manager", listOf(
        "view_orders", "manage_orders", "view_payments", "view_settings", "manage_settings",
        "view_dashboard", "view_invoices", "manage_invoices", "view_analytics"
    )),
    STAFF("Staff", listOf(
        "view_orders", "manage_orders", "view_invoices", "manage_invoices"
    )),
    ACCOUNTANT("Accountant", listOf(
        "view_orders", "view_payments", "view_invoices", "view_analytics"
    ));

    companion object {
        fun fromString(value: String): PartnerRole {
            return when (value) {
                "owner" -> OWNER
                "manager" -> MANAGER
                "staff" -> STAFF
                "accountant" -> ACCOUNTANT
                else -> STAFF
            }
        }
    }
}
