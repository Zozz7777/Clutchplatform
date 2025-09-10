package com.clutch.app.data.repository

import com.clutch.app.data.api.ApiService
import com.clutch.app.data.model.Part
import com.clutch.app.data.model.PartCategory
import com.clutch.app.data.model.PaginatedResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PartsRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    /**
     * Get all parts with optional filters
     */
    suspend fun getParts(
        category: String? = null,
        brand: String? = null,
        search: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<PaginatedResponse<Part>> {
        return try {
            val response = apiService.getParts(category, brand, search, page, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch parts"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get part by ID
     */
    suspend fun getPart(partId: String): Result<Part> {
        return try {
            val response = apiService.getPart(partId)
            if (response.isSuccessful && response.body()?.success == true) {
                val part = response.body()?.data as? Part
                if (part != null) {
                    Result.success(part)
                } else {
                    Result.failure(Exception("Invalid part data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch part"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get all part categories
     */
    suspend fun getPartCategories(): Result<List<PartCategory>> {
        return try {
            val response = apiService.getPartCategories()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get expiring parts for user
     */
    suspend fun getExpiringParts(): Result<List<Part>> {
        return try {
            val response = apiService.getExpiringParts()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch expiring parts"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Search parts by query
     */
    suspend fun searchParts(query: String, page: Int = 1): Result<PaginatedResponse<Part>> {
        return getParts(search = query, page = page)
    }
    
    /**
     * Get parts by category
     */
    suspend fun getPartsByCategory(category: String, page: Int = 1): Result<PaginatedResponse<Part>> {
        return getParts(category = category, page = page)
    }
    
    /**
     * Get parts by brand
     */
    suspend fun getPartsByBrand(brand: String, page: Int = 1): Result<PaginatedResponse<Part>> {
        return getParts(brand = brand, page = page)
    }
}
