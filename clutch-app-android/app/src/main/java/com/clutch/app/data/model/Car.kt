package com.clutch.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Car(
    val id: String,
    val userId: String,
    val make: String,
    val model: String,
    val year: Int,
    val color: String,
    val licensePlate: String,
    val vin: String? = null,
    val mileage: Int,
    val fuelType: String,
    val transmission: String,
    val engineSize: String,
    val isDefault: Boolean = false,
    val createdAt: String,
    val updatedAt: String,
    val healthScore: CarHealthScore? = null,
    val maintenanceHistory: List<MaintenanceRecord> = emptyList()
) : Parcelable

@Parcelize
data class CarHealthScore(
    val overall: Int, // 0-100
    val battery: Int,
    val tires: Int,
    val engine: Int,
    val fluids: Int,
    val brakes: Int,
    val lastUpdated: String,
    val recommendations: List<HealthRecommendation> = emptyList()
) : Parcelable

@Parcelize
data class HealthRecommendation(
    val id: String,
    val category: String,
    val title: String,
    val description: String,
    val priority: String, // low, medium, high, critical
    val estimatedCost: Double? = null,
    val estimatedTime: String? = null
) : Parcelable

@Parcelize
data class MaintenanceRecord(
    val id: String,
    val carId: String,
    val serviceType: String,
    val description: String,
    val date: String,
    val mileage: Int,
    val cost: Double,
    val partnerId: String? = null,
    val partnerName: String? = null,
    val invoiceUrl: String? = null,
    val nextServiceDate: String? = null,
    val nextServiceMileage: Int? = null
) : Parcelable
