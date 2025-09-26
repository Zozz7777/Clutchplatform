package com.clutch.app.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.repository.ClutchRepository
import com.clutch.app.data.model.Car
import com.clutch.app.data.model.CarHealth
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadUserData()
    }

    private fun loadUserData() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true)
                
                // Load user cars
                val carsResult = repository.getUserCars()
                val cars = if (carsResult.isSuccess) carsResult.getOrNull() ?: emptyList() else emptyList()
                val selectedCar = cars.firstOrNull()
                
                // Load car health if car exists
                val carHealth = selectedCar?.let { car ->
                    try {
                        val healthResult = repository.getCarHealth(car.id)
                        if (healthResult.isSuccess) healthResult.getOrNull() else null
                    } catch (e: Exception) {
                        null
                    }
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    cars = cars,
                    selectedCar = selectedCar,
                    carHealth = carHealth
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Failed to load data"
                )
            }
        }
    }

    fun refreshData() {
        loadUserData()
    }
}

data class DashboardUiState(
    val isLoading: Boolean = false,
    val errorMessage: String = "",
    val cars: List<Car> = emptyList(),
    val selectedCar: Car? = null,
    val carHealth: CarHealth? = null
)
