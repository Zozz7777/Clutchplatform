package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.PartnerOrder
import com.clutch.partners.data.model.PartnerPayment
import com.clutch.partners.data.model.PartnerUser
import com.clutch.partners.data.repository.PartnersRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardState(
    val isLoading: Boolean = false,
    val orders: List<PartnerOrder> = emptyList(),
    val payments: List<PartnerPayment> = emptyList(),
    val weeklyIncome: Double = 0.0,
    val payoutCountdown: String = "",
    val user: PartnerUser? = null,
    val error: String? = null
)

class DashboardViewModel(
    private val repository: PartnersRepository
) : ViewModel() {

    private val _dashboardState = MutableStateFlow(DashboardState())
    val dashboardState: StateFlow<DashboardState> = _dashboardState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _dashboardState.value = _dashboardState.value.copy(isLoading = true, error = null)
            try {
                val user = repository.getCurrentUser()
                val orders = repository.getOrders()
                val payments = repository.getPayments()
                val weeklyIncome = repository.getWeeklyIncome()
                val payoutCountdown = repository.getPayoutCountdown()

                _dashboardState.value = DashboardState(
                    isLoading = false,
                    orders = orders,
                    payments = payments,
                    weeklyIncome = weeklyIncome,
                    payoutCountdown = payoutCountdown,
                    user = user
                )
            } catch (e: Exception) {
                _dashboardState.value = _dashboardState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load dashboard data"
                )
            }
        }
    }

    fun refreshData() {
        loadDashboardData()
    }

    fun updateOrderStatus(orderId: String, status: String) {
        viewModelScope.launch {
            try {
                repository.updateOrderStatus(orderId, status)
                loadDashboardData() // Refresh data after update
            } catch (e: Exception) {
                _dashboardState.value = _dashboardState.value.copy(
                    error = e.message ?: "Failed to update order status"
                )
            }
        }
    }

    fun clearError() {
        _dashboardState.value = _dashboardState.value.copy(error = null)
    }
}
