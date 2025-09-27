package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class MaintenanceRequest(
    @SerializedName("maintenanceDate")
    val maintenanceDate: String,
    @SerializedName("services")
    val services: List<MaintenanceServiceRequest>,
    @SerializedName("kilometers")
    val kilometers: Int
)

data class MaintenanceServiceRequest(
    @SerializedName("serviceGroup")
    val serviceGroup: String,
    @SerializedName("serviceName")
    val serviceName: String
)
