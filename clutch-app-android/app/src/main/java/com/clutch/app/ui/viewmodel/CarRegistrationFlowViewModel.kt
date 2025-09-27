package com.clutch.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.Car
import com.clutch.app.data.model.CarRegistrationRequest
import com.clutch.app.data.model.MaintenanceRequest
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CarRegistrationFlowViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CarRegistrationFlowUiState())
    val uiState: StateFlow<CarRegistrationFlowUiState> = _uiState.asStateFlow()
    
    fun checkUserCars() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val result = repository.getUserCars()
                result.fold(
                    onSuccess = { cars ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            userCars = cars,
                            hasCars = cars.isNotEmpty(),
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to load cars"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Unknown error occurred"
                )
            }
        }
    }
    
    fun registerCar(
        year: Int,
        brand: String,
        model: String,
        trim: String,
        kilometers: Int,
        color: String,
        licensePlate: String
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val carRequest = CarRegistrationRequest(
                    year = year,
                    brand = brand,
                    model = model,
                    trim = trim,
                    kilometers = kilometers,
                    color = color,
                    licensePlate = licensePlate
                )
                
                val result = repository.registerCar(carRequest)
                result.fold(
                    onSuccess = { car ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            registeredCar = car,
                            isCarRegistered = true,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to register car"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Unknown error occurred"
                )
            }
        }
    }
    
    fun updateCarMaintenance(
        carId: String,
        maintenanceDate: String,
        services: List<Pair<String, String>>,
        kilometers: Int
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                val maintenanceRequest = MaintenanceRequest(
                    maintenanceDate = maintenanceDate,
                    services = services.map { (serviceGroup, serviceName) ->
                        com.clutch.app.data.model.MaintenanceServiceRequest(
                            serviceGroup = serviceGroup,
                            serviceName = serviceName
                        )
                    },
                    kilometers = kilometers
                )
                
                val result = repository.updateCarMaintenance(carId, maintenanceRequest)
                result.fold(
                    onSuccess = { car ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            isMaintenanceCompleted = true,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to update maintenance"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Unknown error occurred"
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
    
    fun resetFlow() {
        _uiState.value = CarRegistrationFlowUiState()
    }
}

data class CarRegistrationFlowUiState(
    val isLoading: Boolean = false,
    val userCars: List<Car> = emptyList(),
    val hasCars: Boolean = false,
    val registeredCar: Car? = null,
    val isCarRegistered: Boolean = false,
    val isMaintenanceCompleted: Boolean = false,
    val errorMessage: String? = null
)
