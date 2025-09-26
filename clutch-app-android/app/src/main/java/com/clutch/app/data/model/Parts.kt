package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class PartCategory(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("icon") val icon: String,
    @SerializedName("subcategories") val subcategories: List<String>
)

data class CarPart(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("category") val category: String,
    @SerializedName("subcategory") val subcategory: String,
    @SerializedName("brand") val brand: String,
    @SerializedName("partNumber") val partNumber: String,
    @SerializedName("price") val price: Double,
    @SerializedName("originalPrice") val originalPrice: Double?,
    @SerializedName("discount") val discount: Double?,
    @SerializedName("images") val images: List<String>,
    @SerializedName("compatibility") val compatibility: List<String>, // Car models this part fits
    @SerializedName("stock") val stock: Int,
    @SerializedName("rating") val rating: Double,
    @SerializedName("reviewCount") val reviewCount: Int,
    @SerializedName("specifications") val specifications: Map<String, String>,
    @SerializedName("warranty") val warranty: String?,
    @SerializedName("isBestSeller") val isBestSeller: Boolean = false,
    @SerializedName("isNewArrival") val isNewArrival: Boolean = false
)

data class Order(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("items") val items: List<OrderItem>,
    @SerializedName("totalAmount") val totalAmount: Double,
    @SerializedName("discount") val discount: Double = 0.0,
    @SerializedName("shippingCost") val shippingCost: Double = 0.0,
    @SerializedName("finalAmount") val finalAmount: Double,
    @SerializedName("status") val status: String, // "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"
    @SerializedName("paymentStatus") val paymentStatus: String, // "Pending", "Paid", "Failed", "Refunded"
    @SerializedName("shippingAddress") val shippingAddress: ShippingAddress,
    @SerializedName("paymentMethod") val paymentMethod: String,
    @SerializedName("trackingNumber") val trackingNumber: String?,
    @SerializedName("estimatedDelivery") val estimatedDelivery: String?,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class OrderItem(
    @SerializedName("partId") val partId: String,
    @SerializedName("part") val part: CarPart,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unitPrice") val unitPrice: Double,
    @SerializedName("totalPrice") val totalPrice: Double
)

data class ShippingAddress(
    @SerializedName("fullName") val fullName: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("address") val address: String,
    @SerializedName("city") val city: String,
    @SerializedName("state") val state: String,
    @SerializedName("postalCode") val postalCode: String,
    @SerializedName("country") val country: String
)
