package com.clutch.partners.data.api

import com.clutch.partners.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface PartnersApiService {

    // Authentication
    @POST("partners/auth/signin")
    suspend fun signIn(@Body request: SignInRequest): Response<ApiResponse<SignInResponse>>

    @POST("partners/auth/signup")
    suspend fun signUp(@Body request: SignUpRequest): Response<ApiResponse<SignUpResponse>>

    @POST("partners/auth/request-to-join")
    suspend fun requestToJoin(@Body request: RequestToJoinRequest): Response<ApiResponse<RequestToJoinResponse>>

    // Orders
    @GET("partners/orders")
    suspend fun getOrders(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null,
        @Query("type") type: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<OrdersResponse>>

    @PATCH("partners/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Header("Authorization") token: String,
        @Path("id") orderId: String,
        @Body request: UpdateOrderStatusRequest
    ): Response<ApiResponse<OrderResponse>>

    // Invoices
    @GET("partners/invoices")
    suspend fun getInvoices(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<InvoicesResponse>>

    @PATCH("partners/invoices/{id}/status")
    suspend fun updateInvoiceStatus(
        @Header("Authorization") token: String,
        @Path("id") invoiceId: String,
        @Body request: UpdateInvoiceStatusRequest
    ): Response<ApiResponse<OrderResponse>>

    // Payments
    @GET("partners/payments/weekly")
    suspend fun getWeeklyPayments(
        @Header("Authorization") token: String
    ): Response<ApiResponse<WeeklyPaymentsResponse>>

    @GET("partners/payments/history")
    suspend fun getPaymentHistory(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<PaymentHistoryResponse>>

    // Settings
    @GET("partners/settings")
    suspend fun getSettings(
        @Header("Authorization") token: String
    ): Response<ApiResponse<SettingsResponse>>

    @PATCH("partners/settings")
    suspend fun updateSettings(
        @Header("Authorization") token: String,
        @Body request: UpdateSettingsRequest
    ): Response<ApiResponse<SettingsResponse>>

    // Dashboard
    @GET("partners/dashboard/revenue")
    suspend fun getRevenueAnalytics(
        @Header("Authorization") token: String,
        @Query("period") period: String = "30d"
    ): Response<ApiResponse<RevenueAnalyticsResponse>>

    @GET("partners/dashboard/inventory")
    suspend fun getInventoryAnalytics(
        @Header("Authorization") token: String
    ): Response<ApiResponse<InventoryAnalyticsResponse>>

    @GET("partners/dashboard/orders")
    suspend fun getOrderAnalytics(
        @Header("Authorization") token: String
    ): Response<ApiResponse<OrderAnalyticsResponse>>

    // Notifications
    @POST("partners/notifications/device-token")
    suspend fun registerDeviceToken(
        @Header("Authorization") token: String,
        @Body request: DeviceTokenRequest
    ): Response<ApiResponse<DeviceTokenResponse>>

    @DELETE("partners/notifications/device-token")
    suspend fun removeDeviceToken(
        @Header("Authorization") token: String,
        @Body request: DeviceTokenRequest
    ): Response<ApiResponse<DeviceTokenResponse>>

    @GET("partners/notifications/preferences")
    suspend fun getNotificationPreferences(
        @Header("Authorization") token: String
    ): Response<ApiResponse<NotificationPreferencesResponse>>

    @PATCH("partners/notifications/preferences")
    suspend fun updateNotificationPreferences(
        @Header("Authorization") token: String,
        @Body request: UpdateNotificationPreferencesRequest
    ): Response<ApiResponse<NotificationPreferencesResponse>>
}

// Request/Response Models
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null,
    val errors: List<ApiError>? = null
)

data class ApiError(
    val field: String,
    val message: String
)

// Authentication Requests/Responses
data class SignInRequest(
    val email: String,
    val password: String
)

data class SignInResponse(
    val partner: PartnerUser,
    val token: String
)

data class SignUpRequest(
    val partnerId: String,
    val email: String,
    val phone: String,
    val password: String,
    val businessName: String,
    val ownerName: String,
    val partnerType: String,
    val businessAddress: BusinessAddress,
    val workingHours: WorkingHours? = null,
    val businessSettings: BusinessSettings? = null
)

data class SignUpResponse(
    val partner: PartnerUser
)

data class RequestToJoinRequest(
    val businessName: String,
    val ownerName: String,
    val phone: String,
    val email: String,
    val address: String,
    val partnerType: String
)

data class RequestToJoinResponse(
    val requestId: String
)

// Orders Requests/Responses
data class OrdersResponse(
    val orders: List<PartnerOrder>,
    val pagination: Pagination
)

data class OrderResponse(
    val order: PartnerOrder
)

data class UpdateOrderStatusRequest(
    val status: String,
    val notes: String? = null
)

// Invoices Requests/Responses
data class InvoicesResponse(
    val invoices: List<PartnerOrder>,
    val pagination: Pagination
)

data class UpdateInvoiceStatusRequest(
    val status: String,
    val reason: String? = null
)

// Payments Requests/Responses
data class WeeklyPaymentsResponse(
    val weeklyIncome: Double,
    val orderCount: Int,
    val nextPayoutDate: String,
    val currency: String
)

data class PaymentHistoryResponse(
    val payments: List<PartnerPayment>,
    val pagination: Pagination
)

// Settings Requests/Responses
data class SettingsResponse(
    val partner: PartnerUser
)

data class UpdateSettingsRequest(
    val businessName: String? = null,
    val businessAddress: BusinessAddress? = null,
    val workingHours: WorkingHours? = null,
    val businessSettings: BusinessSettings? = null,
    val notificationPreferences: NotificationPreferences? = null,
    val appPreferences: AppPreferences? = null
)

// Dashboard Requests/Responses
data class RevenueAnalyticsResponse(
    val revenue: Double,
    val orderCount: Int,
    val averageOrderValue: Double,
    val period: String,
    val currency: String
)

data class InventoryAnalyticsResponse(
    val totalItems: Int,
    val lowStockItems: Int,
    val outOfStockItems: Int,
    val totalValue: Double,
    val message: String
)

data class OrderAnalyticsResponse(
    val totalOrders: Int,
    val pendingOrders: Int,
    val paidOrders: Int,
    val rejectedOrders: Int,
    val totalRevenue: Double,
    val totalEarnings: Double
)

// Notifications Requests/Responses
data class DeviceTokenRequest(
    val token: String,
    val platform: String
)

data class DeviceTokenResponse(
    val tokenCount: Int
)

data class NotificationPreferencesResponse(
    val preferences: NotificationPreferences
)

data class UpdateNotificationPreferencesRequest(
    val preferences: NotificationPreferences
)

// Common
data class Pagination(
    val current: Int,
    val pages: Int,
    val total: Int
)
