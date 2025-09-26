package com.clutch.partners.data.api

import com.clutch.partners.data.model.Order
import com.clutch.partners.data.model.Payment

data class OrdersResponse(
    val success: Boolean,
    val message: String,
    val data: OrdersData? = null
)

data class OrdersData(
    val orders: List<Order>,
    val pagination: Pagination? = null
)

data class WeeklyIncomeResponse(
    val success: Boolean,
    val message: String,
    val data: WeeklyIncomeData? = null
)

data class WeeklyIncomeData(
    val weeklyIncome: Double,
    val orderCount: Int,
    val nextPayoutDate: String,
    val currency: String
)

data class PaymentHistoryResponse(
    val success: Boolean,
    val message: String,
    val data: PaymentHistoryData? = null
)

data class PaymentHistoryData(
    val payments: List<Payment>,
    val pagination: Pagination? = null
)

data class DashboardResponse(
    val success: Boolean,
    val message: String,
    val data: Any? = null
)

data class SettingsResponse(
    val success: Boolean,
    val message: String,
    val data: SettingsData? = null
)

data class SettingsData(
    val partner: Any? = null
)

data class NotificationResponse(
    val success: Boolean,
    val message: String
)

data class Pagination(
    val current: Int,
    val pages: Int,
    val total: Int
)

data class OrderStatusUpdateRequest(
    val status: String,
    val notes: String? = null
)

data class SettingsUpdateRequest(
    val businessName: String? = null,
    val businessAddress: BusinessAddress? = null,
    val workingHours: Map<String, Any>? = null,
    val businessSettings: Map<String, Any>? = null,
    val notificationPreferences: Map<String, Any>? = null,
    val appPreferences: Map<String, Any>? = null
)

data class NotificationRequest(
    val title: String,
    val message: String,
    val type: String,
    val recipientId: String
)
