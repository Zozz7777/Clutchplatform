package com.clutch.app.data.cache

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.clutch.app.data.model.Part
import com.clutch.app.data.model.Service
import com.clutch.app.data.model.ServiceCenter
import com.clutch.app.data.model.PartCategory
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CacheManager @Inject constructor(
    private val context: Context
) {
    
    private val cacheDatabase: CacheDatabase by lazy {
        Room.databaseBuilder(
            context,
            CacheDatabase::class.java,
            "clutch_cache.db"
        )
        .fallbackToDestructiveMigration()
        .build()
    }
    
    private val partsDao = cacheDatabase.partsDao()
    private val servicesDao = cacheDatabase.servicesDao()
    private val serviceCentersDao = cacheDatabase.serviceCentersDao()
    private val categoriesDao = cacheDatabase.categoriesDao()
    
    /**
     * Cache parts data
     */
    suspend fun cacheParts(parts: List<Part>) {
        partsDao.insertAll(parts.map { it.toCacheEntity() })
    }
    
    /**
     * Get cached parts
     */
    suspend fun getCachedParts(): List<Part> {
        return partsDao.getAll().map { it.toPart() }
    }
    
    /**
     * Cache services data
     */
    suspend fun cacheServices(services: List<Service>) {
        servicesDao.insertAll(services.map { it.toCacheEntity() })
    }
    
    /**
     * Get cached services
     */
    suspend fun getCachedServices(): List<Service> {
        return servicesDao.getAll().map { it.toCacheEntity() }
    }
    
    /**
     * Cache service centers data
     */
    suspend fun cacheServiceCenters(centers: List<ServiceCenter>) {
        serviceCentersDao.insertAll(centers.map { it.toCacheEntity() })
    }
    
    /**
     * Get cached service centers
     */
    suspend fun getCachedServiceCenters(): List<ServiceCenter> {
        return serviceCentersDao.getAll().map { it.toServiceCenter() }
    }
    
    /**
     * Cache categories data
     */
    suspend fun cacheCategories(categories: List<PartCategory>) {
        categoriesDao.insertAll(categories.map { it.toCacheEntity() })
    }
    
    /**
     * Get cached categories
     */
    suspend fun getCachedCategories(): List<PartCategory> {
        return categoriesDao.getAll().map { it.toPartCategory() }
    }
    
    /**
     * Clear all cache
     */
    suspend fun clearAllCache() {
        partsDao.deleteAll()
        servicesDao.deleteAll()
        serviceCentersDao.deleteAll()
        categoriesDao.deleteAll()
    }
    
    /**
     * Clear expired cache entries
     */
    suspend fun clearExpiredCache() {
        val currentTime = System.currentTimeMillis()
        val cacheExpiryTime = 24 * 60 * 60 * 1000L // 24 hours
        
        partsDao.deleteExpired(currentTime - cacheExpiryTime)
        servicesDao.deleteExpired(currentTime - cacheExpiryTime)
        serviceCentersDao.deleteExpired(currentTime - cacheExpiryTime)
        categoriesDao.deleteExpired(currentTime - cacheExpiryTime)
    }
}

/**
 * Cache Database
 */
@Database(
    entities = [
        PartCacheEntity::class,
        ServiceCacheEntity::class,
        ServiceCenterCacheEntity::class,
        CategoryCacheEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class CacheDatabase : RoomDatabase() {
    abstract fun partsDao(): PartCacheDao
    abstract fun servicesDao(): ServiceCacheDao
    abstract fun serviceCentersDao(): ServiceCenterCacheDao
    abstract fun categoriesDao(): CategoryCacheDao
}

/**
 * Cache Entities
 */
@Entity(tableName = "parts_cache")
data class PartCacheEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val brand: String,
    val partNumber: String,
    val description: String,
    val price: Double,
    val imageUrl: String?,
    val inStock: Boolean,
    val stockQuantity: Int,
    val vehicleCompatibility: String, // JSON string
    val specifications: String, // JSON string
    val createdAt: String,
    val updatedAt: String,
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "services_cache")
data class ServiceCacheEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val category: String,
    val price: Double,
    val duration: Int,
    val imageUrl: String?,
    val isAvailable: Boolean,
    val serviceCenters: String, // JSON string
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "service_centers_cache")
data class ServiceCenterCacheEntity(
    @PrimaryKey val id: String,
    val name: String,
    val address: String,
    val phone: String,
    val email: String,
    val rating: Double,
    val reviewCount: Int,
    val imageUrl: String?,
    val services: String, // JSON string
    val workingHours: String, // JSON string
    val location: String, // JSON string
    val cachedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "categories_cache")
data class CategoryCacheEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val imageUrl: String?,
    val partsCount: Int,
    val cachedAt: Long = System.currentTimeMillis()
)

/**
 * Cache DAOs
 */
@Dao
interface PartCacheDao {
    @Query("SELECT * FROM parts_cache")
    suspend fun getAll(): List<PartCacheEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(parts: List<PartCacheEntity>)
    
    @Query("DELETE FROM parts_cache WHERE cachedAt < :expiryTime")
    suspend fun deleteExpired(expiryTime: Long)
    
    @Query("DELETE FROM parts_cache")
    suspend fun deleteAll()
}

@Dao
interface ServiceCacheDao {
    @Query("SELECT * FROM services_cache")
    suspend fun getAll(): List<ServiceCacheEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(services: List<ServiceCacheEntity>)
    
    @Query("DELETE FROM services_cache WHERE cachedAt < :expiryTime")
    suspend fun deleteExpired(expiryTime: Long)
    
    @Query("DELETE FROM services_cache")
    suspend fun deleteAll()
}

@Dao
interface ServiceCenterCacheDao {
    @Query("SELECT * FROM service_centers_cache")
    suspend fun getAll(): List<ServiceCenterCacheEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(centers: List<ServiceCenterCacheEntity>)
    
    @Query("DELETE FROM service_centers_cache WHERE cachedAt < :expiryTime")
    suspend fun deleteExpired(expiryTime: Long)
    
    @Query("DELETE FROM service_centers_cache")
    suspend fun deleteAll()
}

@Dao
interface CategoryCacheDao {
    @Query("SELECT * FROM categories_cache")
    suspend fun getAll(): List<CategoryCacheEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(categories: List<CategoryCacheEntity>)
    
    @Query("DELETE FROM categories_cache WHERE cachedAt < :expiryTime")
    suspend fun deleteExpired(expiryTime: Long)
    
    @Query("DELETE FROM categories_cache")
    suspend fun deleteAll()
}

/**
 * Extension functions for data conversion
 */
private fun Part.toCacheEntity(): PartCacheEntity {
    return PartCacheEntity(
        id = id,
        name = name,
        category = category,
        brand = brand,
        partNumber = partNumber,
        description = description,
        price = price,
        imageUrl = imageUrl,
        inStock = inStock,
        stockQuantity = stockQuantity,
        vehicleCompatibility = com.google.gson.Gson().toJson(vehicleCompatibility),
        specifications = com.google.gson.Gson().toJson(specifications),
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

private fun PartCacheEntity.toPart(): Part {
    return Part(
        id = id,
        name = name,
        category = category,
        brand = brand,
        partNumber = partNumber,
        description = description,
        price = price,
        imageUrl = imageUrl,
        inStock = inStock,
        stockQuantity = stockQuantity,
        vehicleCompatibility = com.google.gson.Gson().fromJson(vehicleCompatibility, Array<String>::class.java).toList(),
        specifications = com.google.gson.Gson().fromJson(specifications, Map::class.java) as Map<String, String>,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

private fun Service.toCacheEntity(): ServiceCacheEntity {
    return ServiceCacheEntity(
        id = id,
        name = name,
        description = description,
        category = category,
        price = price,
        duration = duration,
        imageUrl = imageUrl,
        isAvailable = isAvailable,
        serviceCenters = com.google.gson.Gson().toJson(serviceCenters)
    )
}

private fun ServiceCacheEntity.toService(): Service {
    return Service(
        id = id,
        name = name,
        description = description,
        category = category,
        price = price,
        duration = duration,
        imageUrl = imageUrl,
        isAvailable = isAvailable,
        serviceCenters = com.google.gson.Gson().fromJson(serviceCenters, Array<String>::class.java).toList()
    )
}

private fun ServiceCenter.toCacheEntity(): ServiceCenterCacheEntity {
    return ServiceCenterCacheEntity(
        id = id,
        name = name,
        address = address,
        phone = phone,
        email = email,
        rating = rating,
        reviewCount = reviewCount,
        imageUrl = imageUrl,
        services = com.google.gson.Gson().toJson(services),
        workingHours = com.google.gson.Gson().toJson(workingHours),
        location = com.google.gson.Gson().toJson(location)
    )
}

private fun ServiceCenterCacheEntity.toServiceCenter(): ServiceCenter {
    return ServiceCenter(
        id = id,
        name = name,
        address = address,
        phone = phone,
        email = email,
        rating = rating,
        reviewCount = reviewCount,
        imageUrl = imageUrl,
        services = com.google.gson.Gson().fromJson(services, Array<String>::class.java).toList(),
        workingHours = com.google.gson.Gson().fromJson(workingHours, Map::class.java) as Map<String, String>,
        location = com.google.gson.Gson().fromJson(location, com.clutch.app.data.model.Location::class.java)
    )
}

private fun PartCategory.toCacheEntity(): CategoryCacheEntity {
    return CategoryCacheEntity(
        id = id,
        name = name,
        description = description,
        imageUrl = imageUrl,
        partsCount = partsCount
    )
}

private fun CategoryCacheEntity.toPartCategory(): PartCategory {
    return PartCategory(
        id = id,
        name = name,
        description = description,
        imageUrl = imageUrl,
        partsCount = partsCount
    )
}
