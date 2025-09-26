package com.clutch.partners.data.model

data class Payment(
    val id: String,
    val amount: Double,
    val currency: String,
    val status: String,
    val createdAt: String,
    val paidAt: String? = null,
    val orderCount: Int,
    val period: String
)
