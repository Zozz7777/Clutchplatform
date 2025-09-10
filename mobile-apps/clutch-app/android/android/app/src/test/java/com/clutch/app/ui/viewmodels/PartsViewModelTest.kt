package com.clutch.app.ui.viewmodels

import com.clutch.app.data.model.Part
import com.clutch.app.data.model.PartCategory
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.repository.PartsRepository
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class PartsViewModelTest {
    
    private lateinit var partsRepository: PartsRepository
    private lateinit var partsViewModel: PartsViewModel
    private val testDispatcher = StandardTestDispatcher()
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        partsRepository = mockk()
        partsViewModel = PartsViewModel(partsRepository)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `loadParts should update parts state when successful`() = runTest {
        // Given
        val mockParts = listOf(
            Part(
                id = "1",
                name = "Oil Filter",
                category = "Engine",
                brand = "Toyota",
                partNumber = "OF001",
                description = "High quality oil filter",
                price = 25.99,
                imageUrl = null,
                inStock = true,
                stockQuantity = 10,
                vehicleCompatibility = emptyList(),
                specifications = emptyMap(),
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        val mockResponse = PaginatedResponse(
            data = mockParts,
            pagination = com.clutch.app.data.model.Pagination(
                page = 1,
                limit = 20,
                total = 1,
                totalPages = 1,
                hasNext = false,
                hasPrev = false
            )
        )
        
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.success(mockResponse)
        
        // When
        partsViewModel.loadParts()
        advanceUntilIdle()
        
        // Then
        assertEquals(mockParts, partsViewModel.parts.value)
        assertFalse(partsViewModel.isLoading.value)
        assertNull(partsViewModel.error.value)
    }
    
    @Test
    fun `loadParts should update error state when failed`() = runTest {
        // Given
        val errorMessage = "Network error"
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.failure(Exception(errorMessage))
        
        // When
        partsViewModel.loadParts()
        advanceUntilIdle()
        
        // Then
        assertTrue(partsViewModel.parts.value.isEmpty())
        assertFalse(partsViewModel.isLoading.value)
        assertEquals(errorMessage, partsViewModel.error.value)
    }
    
    @Test
    fun `loadCategories should update categories state when successful`() = runTest {
        // Given
        val mockCategories = listOf(
            PartCategory(
                id = "1",
                name = "Engine",
                description = "Engine parts",
                imageUrl = null,
                partsCount = 10
            )
        )
        
        coEvery { partsRepository.getPartCategories() } returns Result.success(mockCategories)
        
        // When
        partsViewModel.loadCategories()
        advanceUntilIdle()
        
        // Then
        assertEquals(mockCategories, partsViewModel.categories.value)
    }
    
    @Test
    fun `loadExpiringParts should update expiringParts state when successful`() = runTest {
        // Given
        val mockParts = listOf(
            Part(
                id = "1",
                name = "Oil Filter",
                category = "Engine",
                brand = "Toyota",
                partNumber = "OF001",
                description = "High quality oil filter",
                price = 25.99,
                imageUrl = null,
                inStock = true,
                stockQuantity = 10,
                vehicleCompatibility = emptyList(),
                specifications = emptyMap(),
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        coEvery { partsRepository.getExpiringParts() } returns Result.success(mockParts)
        
        // When
        partsViewModel.loadExpiringParts()
        advanceUntilIdle()
        
        // Then
        assertEquals(mockParts, partsViewModel.expiringParts.value)
    }
    
    @Test
    fun `searchParts should update search query and load parts`() = runTest {
        // Given
        val searchQuery = "oil filter"
        val mockParts = listOf(
            Part(
                id = "1",
                name = "Oil Filter",
                category = "Engine",
                brand = "Toyota",
                partNumber = "OF001",
                description = "High quality oil filter",
                price = 25.99,
                imageUrl = null,
                inStock = true,
                stockQuantity = 10,
                vehicleCompatibility = emptyList(),
                specifications = emptyMap(),
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        val mockResponse = PaginatedResponse(
            data = mockParts,
            pagination = com.clutch.app.data.model.Pagination(
                page = 1,
                limit = 20,
                total = 1,
                totalPages = 1,
                hasNext = false,
                hasPrev = false
            )
        )
        
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.success(mockResponse)
        
        // When
        partsViewModel.searchParts(searchQuery)
        advanceUntilIdle()
        
        // Then
        assertEquals(searchQuery, partsViewModel.searchQuery.value)
        assertEquals(mockParts, partsViewModel.parts.value)
    }
    
    @Test
    fun `filterByCategory should update selected category and load parts`() = runTest {
        // Given
        val category = "Engine"
        val mockParts = listOf(
            Part(
                id = "1",
                name = "Oil Filter",
                category = "Engine",
                brand = "Toyota",
                partNumber = "OF001",
                description = "High quality oil filter",
                price = 25.99,
                imageUrl = null,
                inStock = true,
                stockQuantity = 10,
                vehicleCompatibility = emptyList(),
                specifications = emptyMap(),
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        val mockResponse = PaginatedResponse(
            data = mockParts,
            pagination = com.clutch.app.data.model.Pagination(
                page = 1,
                limit = 20,
                total = 1,
                totalPages = 1,
                hasNext = false,
                hasPrev = false
            )
        )
        
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.success(mockResponse)
        
        // When
        partsViewModel.filterByCategory(category)
        advanceUntilIdle()
        
        // Then
        assertEquals(category, partsViewModel.selectedCategory.value)
        assertEquals(mockParts, partsViewModel.parts.value)
    }
    
    @Test
    fun `clearSearch should reset search query and selected category`() = runTest {
        // Given
        val mockParts = listOf(
            Part(
                id = "1",
                name = "Oil Filter",
                category = "Engine",
                brand = "Toyota",
                partNumber = "OF001",
                description = "High quality oil filter",
                price = 25.99,
                imageUrl = null,
                inStock = true,
                stockQuantity = 10,
                vehicleCompatibility = emptyList(),
                specifications = emptyMap(),
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        val mockResponse = PaginatedResponse(
            data = mockParts,
            pagination = com.clutch.app.data.model.Pagination(
                page = 1,
                limit = 20,
                total = 1,
                totalPages = 1,
                hasNext = false,
                hasPrev = false
            )
        )
        
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.success(mockResponse)
        
        // When
        partsViewModel.clearSearch()
        advanceUntilIdle()
        
        // Then
        assertEquals("", partsViewModel.searchQuery.value)
        assertNull(partsViewModel.selectedCategory.value)
        assertEquals(mockParts, partsViewModel.parts.value)
    }
    
    @Test
    fun `clearError should reset error state`() = runTest {
        // Given
        val errorMessage = "Network error"
        coEvery { partsRepository.getParts(any(), any(), any(), any(), any()) } returns Result.failure(Exception(errorMessage))
        
        partsViewModel.loadParts()
        advanceUntilIdle()
        
        // Verify error is set
        assertEquals(errorMessage, partsViewModel.error.value)
        
        // When
        partsViewModel.clearError()
        
        // Then
        assertNull(partsViewModel.error.value)
    }
}
