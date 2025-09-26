package com.clutch.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val profilePicture: String? = null,
    val language: String = "en",
    val theme: String = "light",
    val isEmailVerified: Boolean = false,
    val isPhoneVerified: Boolean = false,
    val createdAt: String,
    val updatedAt: String,
    val preferences: UserPreferences? = null
) : Parcelable

@Parcelize
data class UserPreferences(
    val notifications: NotificationPreferences,
    val privacy: PrivacyPreferences,
    val language: String = "en",
    val theme: String = "light"
) : Parcelable

@Parcelize
data class NotificationPreferences(
    val pushNotifications: Boolean = true,
    val emailNotifications: Boolean = true,
    val smsNotifications: Boolean = false,
    val maintenanceReminders: Boolean = true,
    val orderUpdates: Boolean = true,
    val communityUpdates: Boolean = true,
    val loyaltyUpdates: Boolean = true
) : Parcelable

@Parcelize
data class PrivacyPreferences(
    val shareLocation: Boolean = false,
    val shareData: Boolean = true,
    val analytics: Boolean = true
) : Parcelable
