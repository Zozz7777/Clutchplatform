package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.PartnersApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val partnersApiService: PartnersApiService
) : ViewModel() {
    
    private val _revenueState = MutableStateFlow<RevenueState>(RevenueState.Loading)
    val revenueState: StateFlow<RevenueState> = _revenueState.asStateFlow()
    
    private val _inventoryState = MutableStateFlow<InventoryState>(InventoryState.Loading)
    val inventoryState: StateFlow<InventoryState> = _inventoryState.asStateFlow()
    
    private val _orderStatsState = MutableStateFlow<OrderStatsState>(OrderStatsState.Loading)
    val orderStatsState: StateFlow<OrderStatsState> = _orderStatsState.asStateFlow()
    
    fun loadRevenueAnalytics(period: String = "30d") {
        viewModelScope.launch {
            _revenueState.value = RevenueState.Loading
            try {
                // Use period parameter in API call when backend supports it
                val response = partnersApiService.getRevenueData("Bearer token")
                if (response.isSuccessful && response.body()?.success == true) {
                    val revenueData = response.body()?.data
                    _revenueState.value = RevenueState.Success(revenueData)
                } else {
                    _revenueState.value = RevenueState.Error("Failed to load revenue analytics")
                }
            } catch (e: Exception) {
                _revenueState.value = RevenueState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun loadInventoryAnalytics() {
        viewModelScope.launch {
            _inventoryState.value = InventoryState.Loading
            try {
                val response = partnersApiService.getInventoryData("Bearer token")
                if (response.isSuccessful && response.body()?.success == true) {
                    val inventoryData = response.body()?.data
                    _inventoryState.value = InventoryState.Success(inventoryData)
                } else {
                    _inventoryState.value = InventoryState.Error("Failed to load inventory analytics")
                }
            } catch (e: Exception) {
                _inventoryState.value = InventoryState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun loadOrderStats() {
        viewModelScope.launch {
            _orderStatsState.value = OrderStatsState.Loading
            try {
                val response = partnersApiService.getOrderStats("Bearer token")
                if (response.isSuccessful && response.body()?.success == true) {
                    val orderStatsData = response.body()?.data
                    _orderStatsState.value = OrderStatsState.Success(orderStatsData)
                } else {
                    _orderStatsState.value = OrderStatsState.Error("Failed to load order statistics")
                }
            } catch (e: Exception) {
                _orderStatsState.value = OrderStatsState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class RevenueState {
    object Loading : RevenueState()
    data class Success(val data: Any?) : RevenueState()
    data class Error(val message: String) : RevenueState()
}

sealed class InventoryState {
    object Loading : InventoryState()
    data class Success(val data: Any?) : InventoryState()
    data class Error(val message: String) : InventoryState()
}

sealed class OrderStatsState {
    object Loading : OrderStatsState()
    data class Success(val data: Any?) : OrderStatsState()
    data class Error(val message: String) : OrderStatsState()
}