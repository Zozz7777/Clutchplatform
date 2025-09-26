package com.clutch.partners.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.Payment
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PaymentsViewModel @Inject constructor(
    private val partnersApiService: PartnersApiService
) : ViewModel() {
    
    private val _paymentsState = MutableStateFlow<PaymentsState>(PaymentsState.Loading)
    val paymentsState: StateFlow<PaymentsState> = _paymentsState.asStateFlow()
    
    private val _weeklyIncomeState = MutableStateFlow<WeeklyIncomeState>(WeeklyIncomeState.Loading)
    val weeklyIncomeState: StateFlow<WeeklyIncomeState> = _weeklyIncomeState.asStateFlow()
    
    fun loadWeeklyIncome() {
        viewModelScope.launch {
            _weeklyIncomeState.value = WeeklyIncomeState.Loading
            try {
                val response = partnersApiService.getWeeklyIncome()
                if (response.isSuccessful && response.body()?.success == true) {
                    val weeklyData = response.body()?.data
                    _weeklyIncomeState.value = WeeklyIncomeState.Success(weeklyData)
                } else {
                    _weeklyIncomeState.value = WeeklyIncomeState.Error("Failed to load weekly income")
                }
            } catch (e: Exception) {
                _weeklyIncomeState.value = WeeklyIncomeState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun loadPaymentHistory() {
        viewModelScope.launch {
            _paymentsState.value = PaymentsState.Loading
            try {
                val response = partnersApiService.getPaymentHistory()
                if (response.isSuccessful && response.body()?.success == true) {
                    val payments = response.body()?.data?.payments ?: emptyList()
                    _paymentsState.value = PaymentsState.Success(payments)
                } else {
                    _paymentsState.value = PaymentsState.Error("Failed to load payment history")
                }
            } catch (e: Exception) {
                _paymentsState.value = PaymentsState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class PaymentsState {
    object Loading : PaymentsState()
    data class Success(val payments: List<Payment>) : PaymentsState()
    data class Error(val message: String) : PaymentsState()
}

sealed class WeeklyIncomeState {
    object Loading : WeeklyIncomeState()
    data class Success(val weeklyData: Any?) : WeeklyIncomeState()
    data class Error(val message: String) : WeeklyIncomeState()
}
