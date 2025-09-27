package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class CarTrim(
    @SerializedName("_id")
    val id: String,
    @SerializedName("modelId")
    val modelId: String,
    @SerializedName("brandName")
    val brandName: String,
    @SerializedName("modelName")
    val modelName: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("isActive")
    val isActive: Boolean = true
)
