package com.clutch.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.Service
import com.clutch.app.data.model.ServiceCenter
import com.clutch.app.data.model.PartCategory
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.repository.ServicesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ServicesViewModel @Inject constructor(
    private val servicesRepository: ServicesRepository
) : ViewModel() {
    
    private val _services = MutableStateFlow<List<Service>>(emptyList())
    val services: StateFlow<List<Service>> = _services.asStateFlow()
    
    private val _serviceCenters = MutableStateFlow<List<ServiceCenter>>(emptyList())
    val serviceCenters: StateFlow<List<ServiceCenter>> = _serviceCenters.asStateFlow()
    
    private val _categories = MutableStateFlow<List<PartCategory>>(emptyList())
    val categories: StateFlow<List<PartCategory>> = _categories.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _servicesPagination = MutableStateFlow<PaginatedResponse<Service>?>(null)
    val servicesPagination: StateFlow<PaginatedResponse<Service>?> = _servicesPagination.asStateFlow()
    
    private val _centersPagination = MutableStateFlow<PaginatedResponse<ServiceCenter>?>(null)
    val centersPagination: StateFlow<PaginatedResponse<ServiceCenter>?> = _centersPagination.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _selectedCenter = MutableStateFlow<String?>(null)
    val selectedCenter: StateFlow<String?> = _selectedCenter.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _userLocation = MutableStateFlow<Pair<Double, Double>?>(null)
    val userLocation: StateFlow<Pair<Double, Double>?> = _userLocation.asStateFlow()
    
    init {
        loadCategories()
    }
    
    /**
     * Load all services with optional filters
     */
    fun loadServices(
        category: String? = null,
        centerId: String? = null,
        page: Int = 1,
        refresh: Boolean = false
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = servicesRepository.getServices(category, centerId, page)
                result.fold(
                    onSuccess = { paginatedResponse ->
                        if (refresh || page == 1) {
                            _services.value = paginatedResponse.data
                        } else {
                            _services.value = _services.value + paginatedResponse.data
                        }
                        _servicesPagination.value = paginatedResponse
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load services"
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
     * Load service centers
     */
    fun loadServiceCenters(
        latitude: Double? = null,
        longitude: Double? = null,
        radius: Int? = null,
        page: Int = 1,
        refresh: Boolean = false
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = servicesRepository.getServiceCenters(latitude, longitude, radius, page)
                result.fold(
                    onSuccess = { paginatedResponse ->
                        if (refresh || page == 1) {
                            _serviceCenters.value = paginatedResponse.data
                        } else {
                            _serviceCenters.value = _serviceCenters.value + paginatedResponse.data
                        }
                        _centersPagination.value = paginatedResponse
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load service centers"
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
     * Load service categories
     */
    fun loadCategories() {
        viewModelScope.launch {
            try {
                val result = servicesRepository.getServiceCategories()
                result.fold(
                    onSuccess = { categories ->
                        _categories.value = categories
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load categories"
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
            }
        }
    }
    
    /**
     * Search services
     */
    fun searchServices(query: String) {
        _searchQuery.value = query
        loadServices(refresh = true)
    }
    
    /**
     * Filter services by category
     */
    fun filterByCategory(category: String?) {
        _selectedCategory.value = category
        loadServices(category = category, refresh = true)
    }
    
    /**
     * Filter services by center
     */
    fun filterByCenter(centerId: String?) {
        _selectedCenter.value = centerId
        loadServices(centerId = centerId, refresh = true)
    }
    
    /**
     * Load nearby service centers
     */
    fun loadNearbyServiceCenters(latitude: Double, longitude: Double, radiusKm: Int = 10) {
        _userLocation.value = Pair(latitude, longitude)
        loadServiceCenters(latitude, longitude, radiusKm, refresh = true)
    }
    
    /**
     * Load more services (pagination)
     */
    fun loadMoreServices() {
        val currentPagination = _servicesPagination.value
        if (currentPagination?.hasNext == true && !_isLoading.value) {
            val nextPage = currentPagination.pagination.page + 1
            loadServices(
                category = _selectedCategory.value,
                centerId = _selectedCenter.value,
                page = nextPage
            )
        }
    }
    
    /**
     * Load more service centers (pagination)
     */
    fun loadMoreServiceCenters() {
        val currentPagination = _centersPagination.value
        if (currentPagination?.hasNext == true && !_isLoading.value) {
            val nextPage = currentPagination.pagination.page + 1
            val location = _userLocation.value
            loadServiceCenters(
                latitude = location?.first,
                longitude = location?.second,
                page = nextPage
            )
        }
    }
    
    /**
     * Refresh services
     */
    fun refreshServices() {
        loadServices(
            category = _selectedCategory.value,
            centerId = _selectedCenter.value,
            refresh = true
        )
    }
    
    /**
     * Refresh service centers
     */
    fun refreshServiceCenters() {
        val location = _userLocation.value
        loadServiceCenters(
            latitude = location?.first,
            longitude = location?.second,
            refresh = true
        )
    }
    
    /**
     * Clear filters
     */
    fun clearFilters() {
        _searchQuery.value = ""
        _selectedCategory.value = null
        _selectedCenter.value = null
        loadServices(refresh = true)
    }
    
    /**
     * Clear error
     */
    fun clearError() {
        _error.value = null
    }
    
    /**
     * Get service by ID
     */
    fun getService(serviceId: String, onResult: (Result<Service>) -> Unit) {
        viewModelScope.launch {
            try {
                val result = servicesRepository.getService(serviceId)
                onResult(result)
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }
    
    /**
     * Get service center by ID
     */
    fun getServiceCenter(centerId: String, onResult: (Result<ServiceCenter>) -> Unit) {
        viewModelScope.launch {
            try {
                val result = servicesRepository.getServiceCenter(centerId)
                onResult(result)
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }
}
