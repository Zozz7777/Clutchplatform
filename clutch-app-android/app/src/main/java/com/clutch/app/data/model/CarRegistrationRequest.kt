package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class CarRegistrationRequest(
    @SerializedName("year")
    val year: Int,
    @SerializedName("brand")
    val brand: String,
    @SerializedName("model")
    val model: String,
    @SerializedName("trim")
    val trim: String,
    @SerializedName("kilometers")
    val kilometers: Int,
    @SerializedName("color")
    val color: String,
    @SerializedName("licensePlate")
    val licensePlate: String
)
