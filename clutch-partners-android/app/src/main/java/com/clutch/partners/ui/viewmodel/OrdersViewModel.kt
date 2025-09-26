package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.Order
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val partnersApiService: PartnersApiService
) : ViewModel() {
    
    private val _ordersState = MutableStateFlow<OrdersState>(OrdersState.Loading)
    val ordersState: StateFlow<OrdersState> = _ordersState.asStateFlow()
    
    private val _selectedFilter = MutableStateFlow(0)
    val selectedFilter: StateFlow<Int> = _selectedFilter.asStateFlow()
    
    fun loadOrders() {
        viewModelScope.launch {
            _ordersState.value = OrdersState.Loading
            try {
                val response = partnersApiService.getOrders()
                if (response.isSuccessful && response.body()?.success == true) {
                    val orders = response.body()?.data?.orders ?: emptyList()
                    _ordersState.value = OrdersState.Success(orders)
                } else {
                    _ordersState.value = OrdersState.Error("Failed to load orders")
                }
            } catch (e: Exception) {
                _ordersState.value = OrdersState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun updateOrderStatus(orderId: String, status: String, notes: String? = null) {
        viewModelScope.launch {
            try {
                val response = partnersApiService.updateOrderStatus(orderId, status, notes)
                if (response.isSuccessful && response.body()?.success == true) {
                    // Reload orders after successful update
                    loadOrders()
                } else {
                    _ordersState.value = OrdersState.Error("Failed to update order status")
                }
            } catch (e: Exception) {
                _ordersState.value = OrdersState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun setFilter(filterIndex: Int) {
        _selectedFilter.value = filterIndex
    }
}

sealed class OrdersState {
    object Loading : OrdersState()
    data class Success(val orders: List<Order>) : OrdersState()
    data class Error(val message: String) : OrdersState()
}
