package com.clutch.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.CarBrand
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BrandSelectionViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(BrandSelectionUiState())
    val uiState: StateFlow<BrandSelectionUiState> = _uiState.asStateFlow()

    init {
        loadBrands()
    }

    fun loadBrands() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            try {
                val result = repository.getCarBrands()
                result.fold(
                    onSuccess = { brands ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            brands = brands,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to load brands"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Failed to load brands"
                )
            }
        }
    }

    fun searchBrands(query: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(searchQuery = query)
            
            val currentBrands = _uiState.value.brands
            val filteredBrands = if (query.isBlank()) {
                currentBrands
            } else {
                currentBrands.filter { brand ->
                    brand.name.contains(query, ignoreCase = true)
                }
            }
            
            _uiState.value = _uiState.value.copy(filteredBrands = filteredBrands)
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}

data class BrandSelectionUiState(
    val isLoading: Boolean = false,
    val brands: List<CarBrand> = emptyList(),
    val filteredBrands: List<CarBrand> = emptyList(),
    val searchQuery: String = "",
    val errorMessage: String? = null
)
