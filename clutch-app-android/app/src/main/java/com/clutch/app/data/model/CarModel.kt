package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class CarModel(
    @SerializedName("_id")
    val id: String,
    @SerializedName("brandId")
    val brandId: String,
    @SerializedName("brandName")
    val brandName: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("yearStart")
    val yearStart: Int? = null,
    @SerializedName("yearEnd")
    val yearEnd: Int? = null,
    @SerializedName("isActive")
    val isActive: Boolean = true
)
