package com.clutch.partners.data.model

// API Request/Response Models
data class SignInRequest(
    val emailOrPhone: String,
    val password: String
)

data class SignInResponse(
    val token: String,
    val partner: PartnerUser
)

data class SignUpRequest(
    val partnerId: String,
    val email: String,
    val phone: String,
    val password: String,
    val businessName: String,
    val ownerName: String,
    val partnerType: PartnerType
)

data class SignUpResponse(
    val token: String,
    val partner: PartnerUser
)

data class RequestToJoinRequest(
    val businessName: String,
    val ownerName: String,
    val email: String,
    val phone: String,
    val partnerType: PartnerType,
    val businessAddress: String
)

data class RequestToJoinResponse(
    val message: String
)

data class OrdersResponse(
    val orders: List<PartnerOrder>,
    val totalCount: Int,
    val currentPage: Int,
    val totalPages: Int
)

data class UpdateOrderStatusRequest(
    val status: String
)

data class InvoicesResponse(
    val invoices: List<Invoice>,
    val totalCount: Int,
    val currentPage: Int,
    val totalPages: Int
)

data class UpdateInvoiceStatusRequest(
    val status: String
)

data class WeeklyPaymentsResponse(
    val weeklyIncome: Double,
    val payoutCountdown: String,
    val payments: List<PartnerPayment>
)

data class PaymentHistoryResponse(
    val payments: List<PartnerPayment>,
    val totalCount: Int,
    val currentPage: Int,
    val totalPages: Int
)

data class UpdateSettingsRequest(
    val businessName: String? = null,
    val ownerName: String? = null,
    val businessAddress: String? = null,
    val phone: String? = null,
    val workingHours: WorkingHours? = null
)

data class RevenueAnalyticsResponse(
    val totalRevenue: Double,
    val weeklyRevenue: Double,
    val monthlyRevenue: Double,
    val revenueGrowth: Double
)

data class InventoryAnalyticsResponse(
    val totalItems: Int,
    val lowStockItems: Int,
    val outOfStockItems: Int,
    val inventoryValue: Double
)

data class OrderAnalyticsResponse(
    val totalOrders: Int,
    val pendingOrders: Int,
    val completedOrders: Int,
    val averageOrderValue: Double
)

data class DeviceTokenRequest(
    val token: String,
    val platform: String = "android"
)

data class DeviceTokenResponse(
    val success: Boolean,
    val message: String
)

data class UpdateNotificationPreferencesRequest(
    val preferences: NotificationPreferences
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null
)

// Permission enum
enum class Permission(val displayName: String) {
    MANAGE_ORDERS("Manage Orders"),
    MANAGE_INVOICES("Manage Invoices"),
    MANAGE_SETTINGS("Manage Settings"),
    VIEW_PAYMENTS("View Payments"),
    MANAGE_USERS("Manage Users"),
    VIEW_ANALYTICS("View Analytics")
}
