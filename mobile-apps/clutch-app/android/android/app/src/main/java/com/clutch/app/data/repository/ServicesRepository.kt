package com.clutch.app.data.repository

import com.clutch.app.data.api.ApiService
import com.clutch.app.data.model.Service
import com.clutch.app.data.model.ServiceCenter
import com.clutch.app.data.model.PartCategory
import com.clutch.app.data.model.PaginatedResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ServicesRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    /**
     * Get all services with optional filters
     */
    suspend fun getServices(
        category: String? = null,
        centerId: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<PaginatedResponse<Service>> {
        return try {
            val response = apiService.getServices(category, centerId, page, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch services"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get service by ID
     */
    suspend fun getService(serviceId: String): Result<Service> {
        return try {
            val response = apiService.getService(serviceId)
            if (response.isSuccessful && response.body()?.success == true) {
                val service = response.body()?.data as? Service
                if (service != null) {
                    Result.success(service)
                } else {
                    Result.failure(Exception("Invalid service data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch service"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get all service categories
     */
    suspend fun getServiceCategories(): Result<List<PartCategory>> {
        return try {
            val response = apiService.getServiceCategories()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch service categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get service centers with optional location filters
     */
    suspend fun getServiceCenters(
        latitude: Double? = null,
        longitude: Double? = null,
        radius: Int? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<PaginatedResponse<ServiceCenter>> {
        return try {
            val response = apiService.getServiceCenters(latitude, longitude, radius, page, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch service centers"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get service center by ID
     */
    suspend fun getServiceCenter(centerId: String): Result<ServiceCenter> {
        return try {
            val response = apiService.getServiceCenter(centerId)
            if (response.isSuccessful && response.body()?.success == true) {
                val center = response.body()?.data as? ServiceCenter
                if (center != null) {
                    Result.success(center)
                } else {
                    Result.failure(Exception("Invalid service center data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch service center"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Search services by query
     */
    suspend fun searchServices(query: String, page: Int = 1): Result<PaginatedResponse<Service>> {
        return getServices(page = page) // API should support search parameter
    }
    
    /**
     * Get services by category
     */
    suspend fun getServicesByCategory(category: String, page: Int = 1): Result<PaginatedResponse<Service>> {
        return getServices(category = category, page = page)
    }
    
    /**
     * Get services by center
     */
    suspend fun getServicesByCenter(centerId: String, page: Int = 1): Result<PaginatedResponse<Service>> {
        return getServices(centerId = centerId, page = page)
    }
    
    /**
     * Get nearby service centers
     */
    suspend fun getNearbyServiceCenters(
        latitude: Double,
        longitude: Double,
        radiusKm: Int = 10
    ): Result<PaginatedResponse<ServiceCenter>> {
        return getServiceCenters(latitude, longitude, radiusKm)
    }
}
