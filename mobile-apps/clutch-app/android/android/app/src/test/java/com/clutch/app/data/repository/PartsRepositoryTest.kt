package com.clutch.app.data.repository

import com.clutch.app.data.api.ApiService
import com.clutch.app.data.model.Part
import com.clutch.app.data.model.PaginatedResponse
import com.clutch.app.data.model.PartCategory
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import retrofit2.Response

class PartsRepositoryTest {
    
    private lateinit var apiService: ApiService
    private lateinit var partsRepository: PartsRepository
    
    @Before
    fun setup() {
        apiService = mockk()
        partsRepository = PartsRepository(apiService)
    }
    
    @Test
    fun `getParts should return success when API call succeeds`() = runTest {
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
        
        coEvery { apiService.getParts(any(), any(), any(), any(), any()) } returns Response.success(mockResponse)
        
        // When
        val result = partsRepository.getParts()
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockParts, result.getOrNull()?.data)
    }
    
    @Test
    fun `getParts should return failure when API call fails`() = runTest {
        // Given
        coEvery { apiService.getParts(any(), any(), any(), any(), any()) } returns Response.error(500, okhttp3.ResponseBody.create(null, "Server Error"))
        
        // When
        val result = partsRepository.getParts()
        
        // Then
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message?.contains("Failed to fetch parts") == true)
    }
    
    @Test
    fun `getPart should return success when API call succeeds`() = runTest {
        // Given
        val mockPart = Part(
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
        
        val mockResponse = com.clutch.app.data.model.ApiResponse(
            success = true,
            message = "Success",
            data = mockPart
        )
        
        coEvery { apiService.getPart(any()) } returns Response.success(mockResponse)
        
        // When
        val result = partsRepository.getPart("1")
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockPart, result.getOrNull())
    }
    
    @Test
    fun `getPartCategories should return success when API call succeeds`() = runTest {
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
        
        coEvery { apiService.getPartCategories() } returns Response.success(mockCategories)
        
        // When
        val result = partsRepository.getPartCategories()
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockCategories, result.getOrNull())
    }
    
    @Test
    fun `getExpiringParts should return success when API call succeeds`() = runTest {
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
        
        coEvery { apiService.getExpiringParts() } returns Response.success(mockParts)
        
        // When
        val result = partsRepository.getExpiringParts()
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockParts, result.getOrNull())
    }
    
    @Test
    fun `searchParts should call getParts with search parameter`() = runTest {
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
        
        coEvery { apiService.getParts(any(), any(), any(), any(), any()) } returns Response.success(mockResponse)
        
        // When
        val result = partsRepository.searchParts(searchQuery)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockParts, result.getOrNull()?.data)
    }
    
    @Test
    fun `getPartsByCategory should call getParts with category parameter`() = runTest {
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
        
        coEvery { apiService.getParts(any(), any(), any(), any(), any()) } returns Response.success(mockResponse)
        
        // When
        val result = partsRepository.getPartsByCategory(category)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockParts, result.getOrNull()?.data)
    }
    
    @Test
    fun `getPartsByBrand should call getParts with brand parameter`() = runTest {
        // Given
        val brand = "Toyota"
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
        
        coEvery { apiService.getParts(any(), any(), any(), any(), any()) } returns Response.success(mockResponse)
        
        // When
        val result = partsRepository.getPartsByBrand(brand)
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(mockParts, result.getOrNull()?.data)
    }
}
