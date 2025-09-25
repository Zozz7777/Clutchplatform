package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class BusinessDashboard(
    @SerializedName("revenue")
    val revenue: RevenueData? = null,
    @SerializedName("inventory")
    val inventory: List<InventoryItem>? = null,
    @SerializedName("orders")
    val orders: OrderStats? = null,
    @SerializedName("analytics")
    val analytics: AnalyticsData? = null
)

data class RevenueData(
    @SerializedName("clutchOrders")
    val clutchOrders: Double? = null,
    @SerializedName("inStoreSales")
    val inStoreSales: Double? = null,
    @SerializedName("totalRevenue")
    val totalRevenue: Double? = null,
    @SerializedName("weeklyGrowth")
    val weeklyGrowth: Double? = null
)

data class InventoryItem(
    @SerializedName("_id")
    val id: String? = null,
    @SerializedName("name")
    val name: String,
    @SerializedName("quantity")
    val quantity: Int,
    @SerializedName("status")
    val status: String, // Available, Low, Out of Stock
    @SerializedName("category")
    val category: String? = null,
    @SerializedName("lastUpdated")
    val lastUpdated: String? = null
)

data class OrderStats(
    @SerializedName("totalOrders")
    val totalOrders: Int? = null,
    @SerializedName("pendingOrders")
    val pendingOrders: Int? = null,
    @SerializedName("completedOrders")
    val completedOrders: Int? = null,
    @SerializedName("rejectedOrders")
    val rejectedOrders: Int? = null
)

data class AnalyticsData(
    @SerializedName("weeklySales")
    val weeklySales: List<DailySales>? = null,
    @SerializedName("topProducts")
    val topProducts: List<ProductSales>? = null,
    @SerializedName("customerStats")
    val customerStats: CustomerStats? = null
)

data class DailySales(
    @SerializedName("date")
    val date: String,
    @SerializedName("amount")
    val amount: Double
)

data class ProductSales(
    @SerializedName("productName")
    val productName: String,
    @SerializedName("sales")
    val sales: Int,
    @SerializedName("revenue")
    val revenue: Double
)

data class CustomerStats(
    @SerializedName("newCustomers")
    val newCustomers: Int? = null,
    @SerializedName("returningCustomers")
    val returningCustomers: Int? = null,
    @SerializedName("averageOrderValue")
    val averageOrderValue: Double? = null
)

data class DashboardResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("message")
    val message: String? = null,
    @SerializedName("dashboard")
    val dashboard: BusinessDashboard? = null
)
