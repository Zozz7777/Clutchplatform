package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ServicePartner(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("type") val type: String, // "Service Center", "Mechanic", etc.
    @SerializedName("description") val description: String,
    @SerializedName("location") val location: ServiceLocation,
    @SerializedName("rating") val rating: Double,
    @SerializedName("reviewCount") val reviewCount: Int,
    @SerializedName("services") val services: List<String>,
    @SerializedName("images") val images: List<String>,
    @SerializedName("availability") val availability: Availability,
    @SerializedName("contactInfo") val contactInfo: ContactInfo
)

data class ServiceLocation(
    @SerializedName("address") val address: String,
    @SerializedName("city") val city: String,
    @SerializedName("coordinates") val coordinates: Coordinates
)

data class Coordinates(
    @SerializedName("lat") val lat: Double,
    @SerializedName("lng") val lng: Double
)

data class Availability(
    @SerializedName("isAvailable") val isAvailable: Boolean,
    @SerializedName("nextAvailableSlot") val nextAvailableSlot: String?,
    @SerializedName("workingHours") val workingHours: WorkingHours
)

data class WorkingHours(
    @SerializedName("monday") val monday: DayHours,
    @SerializedName("tuesday") val tuesday: DayHours,
    @SerializedName("wednesday") val wednesday: DayHours,
    @SerializedName("thursday") val thursday: DayHours,
    @SerializedName("friday") val friday: DayHours,
    @SerializedName("saturday") val saturday: DayHours,
    @SerializedName("sunday") val sunday: DayHours
)

data class DayHours(
    @SerializedName("isOpen") val isOpen: Boolean,
    @SerializedName("openTime") val openTime: String?,
    @SerializedName("closeTime") val closeTime: String?
)

data class ContactInfo(
    @SerializedName("phone") val phone: String,
    @SerializedName("email") val email: String?,
    @SerializedName("website") val website: String?
)

data class ServiceBooking(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("carId") val carId: String,
    @SerializedName("partnerId") val partnerId: String,
    @SerializedName("serviceType") val serviceType: String,
    @SerializedName("scheduledDate") val scheduledDate: String,
    @SerializedName("scheduledTime") val scheduledTime: String,
    @SerializedName("status") val status: String, // "Pending", "Confirmed", "In Progress", "Completed", "Cancelled"
    @SerializedName("estimatedCost") val estimatedCost: Double?,
    @SerializedName("notes") val notes: String?,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class ServiceBookingRequest(
    @SerializedName("carId") val carId: String,
    @SerializedName("partnerId") val partnerId: String,
    @SerializedName("serviceType") val serviceType: String,
    @SerializedName("scheduledDate") val scheduledDate: String,
    @SerializedName("scheduledTime") val scheduledTime: String,
    @SerializedName("notes") val notes: String?
)
