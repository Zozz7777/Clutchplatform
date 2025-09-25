package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class PartnerOrder(
    val orderId: String,
    val partnerId: String,
    val customer: Customer,
    val service: Service,
    val orderType: OrderType,
    val scheduledDate: String? = null,
    val scheduledTime: String? = null,
    val status: OrderStatus,
    val invoice: Invoice,
    val delivery: Delivery,
    val notes: OrderNotes,
    val priority: Priority,
    val isEmergency: Boolean = false,
    val tracking: Tracking,
    val communication: Communication,
    val rating: Rating? = null,
    val financial: Financial,
    val metadata: Metadata,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val address: CustomerAddress
) : Parcelable

@Parcelize
data class CustomerAddress(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val coordinates: Coordinates? = null
) : Parcelable

@Parcelize
data class Service(
    val type: String,
    val name: String,
    val description: String? = null,
    val category: String,
    val price: Double,
    val quantity: Int = 1
) : Parcelable

@Parcelize
data class Invoice(
    val id: String? = null,
    val status: InvoiceStatus,
    val amount: Double,
    val currency: String = "EGP",
    val dueDate: String? = null,
    val paidDate: String? = null,
    val paymentMethod: String? = null,
    val paymentReference: String? = null,
    val rejectionReason: String? = null
) : Parcelable

@Parcelize
data class Delivery(
    val type: DeliveryType,
    val address: DeliveryAddress? = null,
    val scheduledDeliveryDate: String? = null,
    val actualDeliveryDate: String? = null,
    val deliveryNotes: String? = null
) : Parcelable

@Parcelize
data class DeliveryAddress(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val coordinates: Coordinates? = null
) : Parcelable

@Parcelize
data class OrderNotes(
    val customer: String? = null,
    val partner: String? = null,
    val internal: String? = null
) : Parcelable

@Parcelize
data class Tracking(
    val estimatedCompletion: String? = null,
    val actualCompletion: String? = null,
    val progress: Int = 0,
    val milestones: List<Milestone> = emptyList()
) : Parcelable

@Parcelize
data class Milestone(
    val name: String,
    val description: String? = null,
    val completed: Boolean = false,
    val completedAt: String? = null
) : Parcelable

@Parcelize
data class Communication(
    val lastContact: String? = null,
    val contactMethod: String? = null,
    val messages: List<Message> = emptyList()
) : Parcelable

@Parcelize
data class Message(
    val type: String, // "customer", "partner", "system"
    val message: String,
    val timestamp: String,
    val read: Boolean = false
) : Parcelable

@Parcelize
data class Rating(
    val customerRating: Int? = null,
    val customerReview: String? = null,
    val partnerRating: Int? = null,
    val partnerReview: String? = null,
    val ratedAt: String? = null
) : Parcelable

@Parcelize
data class Financial(
    val subtotal: Double,
    val tax: Double = 0.0,
    val discount: Double = 0.0,
    val total: Double,
    val commission: Double = 0.0,
    val partnerEarnings: Double = 0.0
) : Parcelable

@Parcelize
data class Metadata(
    val source: String = "clutch_app",
    val version: String = "1.0",
    val tags: List<String> = emptyList(),
    val customFields: Map<String, Any> = emptyMap()
) : Parcelable

enum class OrderType(val displayName: String) {
    SERVICE("Service"),
    PRODUCT("Product"),
    APPOINTMENT("Appointment");

    companion object {
        fun fromString(value: String): OrderType {
            return when (value) {
                "service" -> SERVICE
                "product" -> PRODUCT
                "appointment" -> APPOINTMENT
                else -> SERVICE
            }
        }
    }
}

enum class OrderStatus(val displayName: String, val color: String) {
    PENDING("Pending", "#FFA500"),
    CONFIRMED("Confirmed", "#2196F3"),
    IN_PROGRESS("In Progress", "#FF9800"),
    COMPLETED("Completed", "#4CAF50"),
    CANCELLED("Cancelled", "#F44336"),
    REJECTED("Rejected", "#F44336");

    companion object {
        fun fromString(value: String): OrderStatus {
            return when (value) {
                "pending" -> PENDING
                "confirmed" -> CONFIRMED
                "in_progress" -> IN_PROGRESS
                "completed" -> COMPLETED
                "cancelled" -> CANCELLED
                "rejected" -> REJECTED
                else -> PENDING
            }
        }
    }
}

enum class InvoiceStatus(val displayName: String, val color: String) {
    PENDING("Pending", "#FFA500"),
    PAID("Paid", "#4CAF50"),
    REJECTED("Rejected", "#F44336"),
    REFUNDED("Refunded", "#9C27B0");

    companion object {
        fun fromString(value: String): InvoiceStatus {
            return when (value) {
                "pending" -> PENDING
                "paid" -> PAID
                "rejected" -> REJECTED
                "refunded" -> REFUNDED
                else -> PENDING
            }
        }
    }
}

enum class DeliveryType(val displayName: String) {
    PICKUP("Pickup"),
    DELIVERY("Delivery"),
    ONSITE("Onsite");

    companion object {
        fun fromString(value: String): DeliveryType {
            return when (value) {
                "pickup" -> PICKUP
                "delivery" -> DELIVERY
                "onsite" -> ONSITE
                else -> PICKUP
            }
        }
    }
}

enum class Priority(val displayName: String, val color: String) {
    LOW("Low", "#4CAF50"),
    NORMAL("Normal", "#2196F3"),
    HIGH("High", "#FF9800"),
    URGENT("Urgent", "#F44336");

    companion object {
        fun fromString(value: String): Priority {
            return when (value) {
                "low" -> LOW
                "normal" -> NORMAL
                "high" -> HIGH
                "urgent" -> URGENT
                else -> NORMAL
            }
        }
    }
}
