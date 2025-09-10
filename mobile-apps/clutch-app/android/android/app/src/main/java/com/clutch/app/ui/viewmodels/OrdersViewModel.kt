package com.clutch.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.Order
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.model.CreateOrderRequest
import com.clutch.app.data.model.UpdateOrderRequest
import com.clutch.app.data.repository.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val ordersRepository: OrdersRepository
) : ViewModel() {
    
    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _pagination = MutableStateFlow<PaginatedResponse<Order>?>(null)
    val pagination: StateFlow<PaginatedResponse<Order>?> = _pagination.asStateFlow()
    
    private val _selectedStatus = MutableStateFlow<String?>(null)
    val selectedStatus: StateFlow<String?> = _selectedStatus.asStateFlow()
    
    private val _orderStats = MutableStateFlow(OrderStats())
    val orderStats: StateFlow<OrderStats> = _orderStats.asStateFlow()
    
    init {
        loadOrders()
    }
    
    /**
     * Load user orders
     */
    fun loadOrders(
        status: String? = null,
        page: Int = 1,
        refresh: Boolean = false
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = ordersRepository.getUserOrders(status, page)
                result.fold(
                    onSuccess = { paginatedResponse ->
                        if (refresh || page == 1) {
                            _orders.value = paginatedResponse.data
                        } else {
                            _orders.value = _orders.value + paginatedResponse.data
                        }
                        _pagination.value = paginatedResponse
                        updateOrderStats()
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load orders"
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Load orders by status
     */
    fun loadOrdersByStatus(status: String) {
        _selectedStatus.value = status
        loadOrders(status = status, refresh = true)
    }
    
    /**
     * Load pending orders
     */
    fun loadPendingOrders() {
        loadOrdersByStatus("PENDING")
    }
    
    /**
     * Load completed orders
     */
    fun loadCompletedOrders() {
        loadOrdersByStatus("COMPLETED")
    }
    
    /**
     * Load cancelled orders
     */
    fun loadCancelledOrders() {
        loadOrdersByStatus("CANCELLED")
    }
    
    /**
     * Load more orders (pagination)
     */
    fun loadMoreOrders() {
        val currentPagination = _pagination.value
        if (currentPagination?.hasNext == true && !_isLoading.value) {
            val nextPage = currentPagination.pagination.page + 1
            loadOrders(
                status = _selectedStatus.value,
                page = nextPage
            )
        }
    }
    
    /**
     * Refresh orders
     */
    fun refreshOrders() {
        loadOrders(
            status = _selectedStatus.value,
            refresh = true
        )
    }
    
    /**
     * Create new order
     */
    fun createOrder(orderRequest: CreateOrderRequest, onResult: (Result<Order>) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = ordersRepository.createOrder(orderRequest)
                result.fold(
                    onSuccess = { order ->
                        // Add new order to the list
                        _orders.value = listOf(order) + _orders.value
                        updateOrderStats()
                        onResult(Result.success(order))
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to create order"
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
                onResult(Result.failure(e))
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Update order
     */
    fun updateOrder(orderId: String, updateRequest: UpdateOrderRequest, onResult: (Result<Order>) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = ordersRepository.updateOrder(orderId, updateRequest)
                result.fold(
                    onSuccess = { updatedOrder ->
                        // Update order in the list
                        _orders.value = _orders.value.map { order ->
                            if (order.id == orderId) updatedOrder else order
                        }
                        updateOrderStats()
                        onResult(Result.success(updatedOrder))
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to update order"
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
                onResult(Result.failure(e))
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Cancel order
     */
    fun cancelOrder(orderId: String, onResult: (Result<Boolean>) -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = ordersRepository.cancelOrder(orderId)
                result.fold(
                    onSuccess = { success ->
                        if (success) {
                            // Update order status in the list
                            _orders.value = _orders.value.map { order ->
                                if (order.id == orderId) {
                                    order.copy(status = com.clutch.app.data.model.OrderStatus.CANCELLED)
                                } else order
                            }
                            updateOrderStats()
                        }
                        onResult(Result.success(success))
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to cancel order"
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
                onResult(Result.failure(e))
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Get order by ID
     */
    fun getOrder(orderId: String, onResult: (Result<Order>) -> Unit) {
        viewModelScope.launch {
            try {
                val result = ordersRepository.getOrder(orderId)
                onResult(result)
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }
    
    /**
     * Clear filters
     */
    fun clearFilters() {
        _selectedStatus.value = null
        loadOrders(refresh = true)
    }
    
    /**
     * Clear error
     */
    fun clearError() {
        _error.value = null
    }
    
    /**
     * Update order statistics
     */
    private fun updateOrderStats() {
        val orders = _orders.value
        val stats = OrderStats(
            total = orders.size,
            pending = orders.count { it.status == com.clutch.app.data.model.OrderStatus.PENDING },
            completed = orders.count { it.status == com.clutch.app.data.model.OrderStatus.COMPLETED },
            cancelled = orders.count { it.status == com.clutch.app.data.model.OrderStatus.CANCELLED },
            totalAmount = orders.sumOf { it.totalAmount }
        )
        _orderStats.value = stats
    }
}

/**
 * Order statistics data class
 */
data class OrderStats(
    val total: Int = 0,
    val pending: Int = 0,
    val completed: Int = 0,
    val cancelled: Int = 0,
    val totalAmount: Double = 0.0
)
