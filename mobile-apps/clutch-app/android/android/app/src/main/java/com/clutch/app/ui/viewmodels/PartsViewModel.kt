package com.clutch.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.Part
import com.clutch.app.data.model.PartCategory
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.repository.PartsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PartsViewModel @Inject constructor(
    private val partsRepository: PartsRepository
) : ViewModel() {
    
    private val _parts = MutableStateFlow<List<Part>>(emptyList())
    val parts: StateFlow<List<Part>> = _parts.asStateFlow()
    
    private val _categories = MutableStateFlow<List<PartCategory>>(emptyList())
    val categories: StateFlow<List<PartCategory>> = _categories.asStateFlow()
    
    private val _expiringParts = MutableStateFlow<List<Part>>(emptyList())
    val expiringParts: StateFlow<List<Part>> = _expiringParts.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private val _pagination = MutableStateFlow<PaginatedResponse<Part>?>(null)
    val pagination: StateFlow<PaginatedResponse<Part>?> = _pagination.asStateFlow()
    
    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    init {
        loadCategories()
        loadExpiringParts()
    }
    
    /**
     * Load all parts with optional filters
     */
    fun loadParts(
        category: String? = null,
        brand: String? = null,
        search: String? = null,
        page: Int = 1,
        refresh: Boolean = false
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = partsRepository.getParts(category, brand, search, page)
                result.fold(
                    onSuccess = { paginatedResponse ->
                        if (refresh || page == 1) {
                            _parts.value = paginatedResponse.data
                        } else {
                            _parts.value = _parts.value + paginatedResponse.data
                        }
                        _pagination.value = paginatedResponse
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load parts"
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
     * Load part categories
     */
    fun loadCategories() {
        viewModelScope.launch {
            try {
                val result = partsRepository.getPartCategories()
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
     * Load expiring parts
     */
    fun loadExpiringParts() {
        viewModelScope.launch {
            try {
                val result = partsRepository.getExpiringParts()
                result.fold(
                    onSuccess = { parts ->
                        _expiringParts.value = parts
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Failed to load expiring parts"
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "An unexpected error occurred"
            }
        }
    }
    
    /**
     * Search parts
     */
    fun searchParts(query: String) {
        _searchQuery.value = query
        loadParts(search = query, refresh = true)
    }
    
    /**
     * Filter parts by category
     */
    fun filterByCategory(category: String?) {
        _selectedCategory.value = category
        loadParts(category = category, refresh = true)
    }
    
    /**
     * Load more parts (pagination)
     */
    fun loadMoreParts() {
        val currentPagination = _pagination.value
        if (currentPagination?.hasNext == true && !_isLoading.value) {
            val nextPage = currentPagination.pagination.page + 1
            loadParts(
                category = _selectedCategory.value,
                search = _searchQuery.value.takeIf { it.isNotEmpty() },
                page = nextPage
            )
        }
    }
    
    /**
     * Refresh parts
     */
    fun refreshParts() {
        loadParts(
            category = _selectedCategory.value,
            search = _searchQuery.value.takeIf { it.isNotEmpty() },
            refresh = true
        )
    }
    
    /**
     * Clear search
     */
    fun clearSearch() {
        _searchQuery.value = ""
        _selectedCategory.value = null
        loadParts(refresh = true)
    }
    
    /**
     * Clear error
     */
    fun clearError() {
        _error.value = null
    }
    
    /**
     * Get part by ID
     */
    fun getPart(partId: String, onResult: (Result<Part>) -> Unit) {
        viewModelScope.launch {
            try {
                val result = partsRepository.getPart(partId)
                onResult(result)
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }
}
