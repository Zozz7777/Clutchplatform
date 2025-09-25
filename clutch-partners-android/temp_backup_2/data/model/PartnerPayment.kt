package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class PartnerPayment(
    val paymentId: String,
    val partnerId: String,
    val amount: Double,
    val currency: String = "EGP",
    val paymentType: PaymentType,
    val status: PaymentStatus,
    val paymentMethod: PaymentMethod,
    val scheduledDate: String,
    val processedDate: String? = null,
    val completedDate: String? = null,
    val period: PaymentPeriod? = null,
    val relatedOrders: List<RelatedOrder> = emptyList(),
    val breakdown: PaymentBreakdown,
    val transaction: Transaction? = null,
    val notes: PaymentNotes,
    val failure: FailureInfo? = null,
    val approval: ApprovalInfo? = null,
    val notifications: NotificationInfo,
    val metadata: PaymentMetadata,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class PaymentMethod(
    val type: String, // "bank_transfer", "digital_wallet", "check", "cash"
    val details: Map<String, Any>
) : Parcelable

@Parcelize
data class PaymentPeriod(
    val startDate: String,
    val endDate: String,
    val weekNumber: Int? = null,
    val year: Int? = null
) : Parcelable

@Parcelize
data class RelatedOrder(
    val orderId: String,
    val amount: Double,
    val commission: Double = 0.0
) : Parcelable

@Parcelize
data class PaymentBreakdown(
    val totalEarnings: Double,
    val commission: Double = 0.0,
    val fees: Double = 0.0,
    val taxes: Double = 0.0,
    val netAmount: Double
) : Parcelable

@Parcelize
data class Transaction(
    val reference: String? = null,
    val externalId: String? = null,
    val gateway: String? = null,
    val fees: Double = 0.0,
    val exchangeRate: Double = 1.0
) : Parcelable

@Parcelize
data class PaymentNotes(
    val internal: String? = null,
    val partner: String? = null,
    val admin: String? = null
) : Parcelable

@Parcelize
data class FailureInfo(
    val reason: String? = null,
    val code: String? = null,
    val retryCount: Int = 0,
    val lastRetryDate: String? = null,
    val maxRetries: Int = 3
) : Parcelable

@Parcelize
data class ApprovalInfo(
    val required: Boolean = false,
    val approvedBy: String? = null,
    val approvedAt: String? = null,
    val approvalNotes: String? = null
) : Parcelable

@Parcelize
data class NotificationInfo(
    val sentToPartner: Boolean = false,
    val sentAt: String? = null,
    val notificationMethod: String? = null
) : Parcelable

@Parcelize
data class PaymentMetadata(
    val source: String = "clutch_system",
    val version: String = "1.0",
    val tags: List<String> = emptyList(),
    val customFields: Map<String, Any> = emptyMap()
) : Parcelable

enum class PaymentType(val displayName: String) {
    WEEKLY_PAYOUT("Weekly Payout"),
    BONUS("Bonus"),
    COMMISSION("Commission"),
    REFUND("Refund"),
    ADJUSTMENT("Adjustment");

    companion object {
        fun fromString(value: String): PaymentType {
            return when (value) {
                "weekly_payout" -> WEEKLY_PAYOUT
                "bonus" -> BONUS
                "commission" -> COMMISSION
                "refund" -> REFUND
                "adjustment" -> ADJUSTMENT
                else -> WEEKLY_PAYOUT
            }
        }
    }
}

enum class PaymentStatus(val displayName: String, val color: String) {
    PENDING("Pending", "#FFA500"),
    PROCESSING("Processing", "#2196F3"),
    COMPLETED("Completed", "#4CAF50"),
    FAILED("Failed", "#F44336"),
    CANCELLED("Cancelled", "#9E9E9E");

    companion object {
        fun fromString(value: String): PaymentStatus {
            return when (value) {
                "pending" -> PENDING
                "processing" -> PROCESSING
                "completed" -> COMPLETED
                "failed" -> FAILED
                "cancelled" -> CANCELLED
                else -> PENDING
            }
        }
    }
}
