package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class MaintenanceService(
    @SerializedName("_id")
    val id: String,
    @SerializedName("serviceGroup")
    val serviceGroup: String,
    @SerializedName("serviceName")
    val serviceName: String,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("icon")
    val icon: String? = null,
    @SerializedName("isActive")
    val isActive: Boolean = true
)

data class MaintenanceServiceGroup(
    val groupName: String,
    val services: List<MaintenanceService>
)
