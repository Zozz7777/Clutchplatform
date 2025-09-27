package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class CarBrand(
    @SerializedName("_id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("logo")
    val logo: String? = null,
    @SerializedName("isActive")
    val isActive: Boolean = true
)
