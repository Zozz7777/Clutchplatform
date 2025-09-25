package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class SignInRequest(
    @SerializedName("emailOrPhone") val emailOrPhone: String,
    @SerializedName("password") val password: String
)

data class SignUpRequest(
    @SerializedName("partnerId") val partnerId: String,
    @SerializedName("mobileOrEmail") val mobileOrEmail: String,
    @SerializedName("password") val password: String
)

data class RequestToJoinRequest(
    @SerializedName("businessName") val businessName: String,
    @SerializedName("ownerName") val ownerName: String,
    @SerializedName("mobile") val mobile: String,
    @SerializedName("businessAddress") val businessAddress: String,
    @SerializedName("partnerType") val partnerType: String
)

data class AuthResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("partnerUser") val partnerUser: PartnerUser?
)

data class GenericResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?
)
