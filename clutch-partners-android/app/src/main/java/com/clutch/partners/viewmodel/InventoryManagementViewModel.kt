package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.InventoryItem
import com.clutch.partners.data.model.InventoryFilter
import com.clutch.partners.data.model.StockFilter
import com.clutch.partners.data.model.SortBy
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class InventoryManagementUiState(
    val items: List<InventoryItem> = emptyList(),
    val filteredItems: List<InventoryItem> = emptyList(),
    val searchQuery: String = "",
    val currentFilter: InventoryFilter = InventoryFilter(),
    val totalItems: Int = 0,
    val lowStockItems: Int = 0,
    val outOfStockItems: Int = 0,
    val totalValue: Double = 0.0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val showingAddItemDialog: Boolean = false,
    val showingFilterDialog: Boolean = false,
    val editingItem: InventoryItem? = null
)

@HiltViewModel
class InventoryManagementViewModel @Inject constructor(
    private val apiService: PartnersApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(InventoryManagementUiState())
    val uiState: StateFlow<InventoryManagementUiState> = _uiState.asStateFlow()

    fun loadInventory() {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
        
        viewModelScope.launch {
            try {
                val items = apiService.getInventoryItems()
                updateInventoryStats(items)
                applyFilters(items)
                
                _uiState.value = _uiState.value.copy(
                    items = items,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Failed to load inventory"
                )
            }
        }
    }

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters(_uiState.value.items)
    }

    fun showAddItemDialog() {
        _uiState.value = _uiState.value.copy(showingAddItemDialog = true)
    }

    fun hideAddItemDialog() {
        _uiState.value = _uiState.value.copy(showingAddItemDialog = false)
    }

    fun showFilterDialog() {
        _uiState.value = _uiState.value.copy(showingFilterDialog = true)
    }

    fun hideFilterDialog() {
        _uiState.value = _uiState.value.copy(showingFilterDialog = false)
    }

    fun editItem(item: InventoryItem) {
        _uiState.value = _uiState.value.copy(editingItem = item)
    }

    fun hideEditItemDialog() {
        _uiState.value = _uiState.value.copy(editingItem = null)
    }

    fun addItem(item: InventoryItem) {
        viewModelScope.launch {
            try {
                val newItem = apiService.addInventoryItem(item)
                val updatedItems = _uiState.value.items + newItem
                updateInventoryStats(updatedItems)
                applyFilters(updatedItems)
                
                _uiState.value = _uiState.value.copy(
                    items = updatedItems,
                    showingAddItemDialog = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Failed to add item"
                )
            }
        }
    }

    fun updateItem(item: InventoryItem) {
        viewModelScope.launch {
            try {
                val updatedItem = apiService.updateInventoryItem(item)
                val updatedItems = _uiState.value.items.map { 
                    if (it.id == item.id) updatedItem else it 
                }
                updateInventoryStats(updatedItems)
                applyFilters(updatedItems)
                
                _uiState.value = _uiState.value.copy(
                    items = updatedItems,
                    editingItem = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Failed to update item"
                )
            }
        }
    }

    fun deleteItem(item: InventoryItem) {
        viewModelScope.launch {
            try {
                apiService.deleteInventoryItem(item.id)
                val updatedItems = _uiState.value.items.filter { it.id != item.id }
                updateInventoryStats(updatedItems)
                applyFilters(updatedItems)
                
                _uiState.value = _uiState.value.copy(items = updatedItems)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = e.message ?: "Failed to delete item"
                )
            }
        }
    }

    fun updateStock(item: InventoryItem, newStock: Int) {
        val updatedItem = item.copy(stock = newStock)
        updateItem(updatedItem)
    }

    fun applyFilter(filter: InventoryFilter) {
        _uiState.value = _uiState.value.copy(currentFilter = filter)
        applyFilters(_uiState.value.items)
    }

    private fun applyFilters(items: List<InventoryItem>) {
        val currentState = _uiState.value
        var filteredItems = items

        // Apply search filter
        if (currentState.searchQuery.isNotBlank()) {
            filteredItems = filteredItems.filter { item ->
                item.name.contains(currentState.searchQuery, ignoreCase = true) ||
                item.sku.contains(currentState.searchQuery, ignoreCase = true) ||
                item.category.contains(currentState.searchQuery, ignoreCase = true)
            }
        }

        // Apply category filter
        if (currentState.currentFilter.category != "All") {
            filteredItems = filteredItems.filter { 
                it.category == currentState.currentFilter.category 
            }
        }

        // Apply stock filter
        filteredItems = when (currentState.currentFilter.stockFilter) {
            StockFilter.IN_STOCK -> filteredItems.filter { it.stock > it.lowStockThreshold }
            StockFilter.LOW_STOCK -> filteredItems.filter { 
                it.stock > 0 && it.stock <= it.lowStockThreshold 
            }
            StockFilter.OUT_OF_STOCK -> filteredItems.filter { it.stock == 0 }
            StockFilter.ALL -> filteredItems
        }

        // Apply sorting
        filteredItems = when (currentState.currentFilter.sortBy) {
            SortBy.NAME -> filteredItems.sortedBy { it.name }
            SortBy.PRICE -> filteredItems.sortedBy { it.price }
            SortBy.STOCK -> filteredItems.sortedBy { it.stock }
            SortBy.CATEGORY -> filteredItems.sortedBy { it.category }
        }

        _uiState.value = _uiState.value.copy(filteredItems = filteredItems)
    }

    private fun updateInventoryStats(items: List<InventoryItem>) {
        val totalItems = items.size
        val lowStockItems = items.count { 
            it.stock > 0 && it.stock <= it.lowStockThreshold 
        }
        val outOfStockItems = items.count { it.stock == 0 }
        val totalValue = items.sumOf { it.price * it.stock }

        _uiState.value = _uiState.value.copy(
            totalItems = totalItems,
            lowStockItems = lowStockItems,
            outOfStockItems = outOfStockItems,
            totalValue = totalValue
        )
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
