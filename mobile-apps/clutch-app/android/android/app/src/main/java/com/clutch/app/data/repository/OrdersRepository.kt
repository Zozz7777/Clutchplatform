package com.clutch.app.data.repository

import com.clutch.app.data.api.ApiService
import com.clutch.app.data.model.Order
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.model.CreateOrderRequest
import com.clutch.app.data.model.UpdateOrderRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrdersRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    /**
     * Get user orders with optional status filter
     */
    suspend fun getUserOrders(
        status: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<PaginatedResponse<Order>> {
        return try {
            val response = apiService.getUserOrders(status, page, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch orders"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get order by ID
     */
    suspend fun getOrder(orderId: String): Result<Order> {
        return try {
            val response = apiService.getOrder(orderId)
            if (response.isSuccessful && response.body()?.success == true) {
                val order = response.body()?.data as? Order
                if (order != null) {
                    Result.success(order)
                } else {
                    Result.failure(Exception("Invalid order data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create new order
     */
    suspend fun createOrder(orderRequest: CreateOrderRequest): Result<Order> {
        return try {
            val response = apiService.createOrder(orderRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                val order = response.body()?.data as? Order
                if (order != null) {
                    Result.success(order)
                } else {
                    Result.failure(Exception("Invalid order data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to create order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update order
     */
    suspend fun updateOrder(orderId: String, updateRequest: UpdateOrderRequest): Result<Order> {
        return try {
            val response = apiService.updateOrder(orderId, updateRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                val order = response.body()?.data as? Order
                if (order != null) {
                    Result.success(order)
                } else {
                    Result.failure(Exception("Invalid order data"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to update order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Cancel order
     */
    suspend fun cancelOrder(orderId: String): Result<Boolean> {
        return try {
            val response = apiService.cancelOrder(orderId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(true)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to cancel order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get orders by status
     */
    suspend fun getOrdersByStatus(status: String, page: Int = 1): Result<PaginatedResponse<Order>> {
        return getUserOrders(status = status, page = page)
    }
    
    /**
     * Get pending orders
     */
    suspend fun getPendingOrders(page: Int = 1): Result<PaginatedResponse<Order>> {
        return getOrdersByStatus("PENDING", page)
    }
    
    /**
     * Get completed orders
     */
    suspend fun getCompletedOrders(page: Int = 1): Result<PaginatedResponse<Order>> {
        return getOrdersByStatus("COMPLETED", page)
    }
    
    /**
     * Get cancelled orders
     */
    suspend fun getCancelledOrders(page: Int = 1): Result<PaginatedResponse<Order>> {
        return getOrdersByStatus("CANCELLED", page)
    }
}
