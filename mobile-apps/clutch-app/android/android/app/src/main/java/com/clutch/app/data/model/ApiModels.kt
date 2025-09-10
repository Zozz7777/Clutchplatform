package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

// Base API response
data class ApiResponse(
    val success: Boolean,
    val message: String,
    val data: Any? = null
)

// Authentication models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val phone: String
)

data class OtpRequest(
    val email: String,
    val otp: String
)

data class RefreshRequest(
    val refreshToken: String
)

data class ResendOtpRequest(
    val email: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData
)

data class AuthData(
    val accessToken: String,
    val refreshToken: String,
    val user: User
)

data class User(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val profileImage: String? = null,
    val isEmailVerified: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

// Parts models
data class Part(
    val id: String,
    val name: String,
    val category: String,
    val brand: String,
    val partNumber: String,
    val description: String,
    val price: Double,
    val imageUrl: String? = null,
    val inStock: Boolean = true,
    val stockQuantity: Int = 0,
    val vehicleCompatibility: List<String> = emptyList(),
    val specifications: Map<String, String> = emptyMap(),
    val createdAt: String,
    val updatedAt: String
)

data class PartCategory(
    val id: String,
    val name: String,
    val description: String,
    val imageUrl: String? = null,
    val partsCount: Int = 0
)

// Service models
data class Service(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    val price: Double,
    val duration: Int, // in minutes
    val imageUrl: String? = null,
    val isAvailable: Boolean = true,
    val serviceCenters: List<String> = emptyList()
)

data class ServiceCenter(
    val id: String,
    val name: String,
    val address: String,
    val phone: String,
    val email: String,
    val rating: Double,
    val reviewCount: Int,
    val imageUrl: String? = null,
    val services: List<String> = emptyList(),
    val workingHours: Map<String, String> = emptyMap(),
    val location: Location? = null
)

data class Location(
    val latitude: Double,
    val longitude: Double,
    val address: String
)

// Booking models
data class Booking(
    val id: String,
    val userId: String,
    val serviceId: String,
    val serviceCenterId: String,
    val vehicleId: String,
    val scheduledDate: String,
    val scheduledTime: String,
    val status: BookingStatus,
    val totalPrice: Double,
    val notes: String? = null,
    val createdAt: String,
    val updatedAt: String
)

enum class BookingStatus {
    PENDING,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

// Order models
data class Order(
    val id: String,
    val userId: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: OrderStatus,
    val shippingAddress: Address,
    val paymentMethod: String,
    val createdAt: String,
    val updatedAt: String
)

data class OrderItem(
    val partId: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double
)

enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

data class Address(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String
)

// Vehicle models
data class Vehicle(
    val id: String,
    val userId: String,
    val make: String,
    val model: String,
    val year: Int,
    val vin: String? = null,
    val licensePlate: String? = null,
    val color: String? = null,
    val mileage: Int? = null,
    val imageUrl: String? = null,
    val createdAt: String,
    val updatedAt: String
)

// User Profile models
data class UserProfile(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val profileImage: String? = null,
    val dateOfBirth: String? = null,
    val address: Address? = null,
    val preferences: UserPreferences? = null,
    val createdAt: String,
    val updatedAt: String
)

data class UserPreferences(
    val notifications: NotificationPreferences,
    val privacy: PrivacyPreferences,
    val language: String = "en",
    val currency: String = "USD"
)

data class NotificationPreferences(
    val email: Boolean = true,
    val push: Boolean = true,
    val sms: Boolean = false,
    val marketing: Boolean = false
)

data class PrivacyPreferences(
    val profileVisibility: String = "private",
    val dataSharing: Boolean = false
)

// Error models
data class ApiError(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null
)

// Pagination models
data class PaginatedResponse<T>(
    val data: List<T>,
    val pagination: Pagination
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrev: Boolean
)
