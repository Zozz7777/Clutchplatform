package com.clutch.partners.data.model

data class Order(
    val id: String,
    val orderId: String,
    val customer: Customer,
    val service: String,
    val status: String,
    val price: String,
    val time: String,
    val createdAt: String,
    val invoice: Invoice? = null
)

data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null
)

data class Invoice(
    val id: String,
    val status: String,
    val amount: Double,
    val currency: String,
    val createdAt: String,
    val paidAt: String? = null,
    val rejectedAt: String? = null,
    val reason: String? = null
)
