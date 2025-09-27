package com.clutch.app.data.repository

import com.clutch.app.data.api.ClutchApiService
import com.clutch.app.data.model.*
import com.google.gson.Gson
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClutchRepository @Inject constructor(
    private val apiService: ClutchApiService
) {
    
    // Authentication
    suspend fun login(emailOrPhone: String, password: String, rememberMe: Boolean = false): Result<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(emailOrPhone, password, rememberMe))
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.success(body)
                } else {
                    Result.failure(Exception("Login failed: Empty response body"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (errorBody != null) {
                    try {
                        // Try to parse JSON error response
                        val gson = Gson()
                        val errorResponse = gson.fromJson(errorBody, Map::class.java)
                        errorResponse["message"] as? String ?: "Login failed"
                    } catch (e: Exception) {
                        "Login failed: ${response.message()}"
                    }
                } else {
                    "Login failed: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error: ${e.message}"))
        }
    }
    
    suspend fun register(
        email: String,
        phone: String,
        firstName: String,
        lastName: String,
        password: String,
        confirmPassword: String,
        agreeToTerms: Boolean
    ): Result<AuthResponse> {
        return try {
            val response = apiService.register(
                RegisterRequest(email, phone, firstName, lastName, password, confirmPassword, agreeToTerms)
            )
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = if (errorBody != null) {
                    try {
                        // Try to parse JSON error response
                        val gson = com.google.gson.Gson()
                        val errorResponse = gson.fromJson(errorBody, Map::class.java)
                        errorResponse["message"] as? String ?: "Registration failed"
                    } catch (e: Exception) {
                        "Registration failed: ${response.message()}"
                    }
                } else {
                    "Registration failed: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun forgotPassword(emailOrPhone: String): Result<ApiResponse> {
        return try {
            val response = apiService.forgotPassword(ForgotPasswordRequest(emailOrPhone))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Forgot password failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun verifyOtp(emailOrPhone: String, otp: String): Result<ApiResponse> {
        return try {
            val response = apiService.verifyOtp(OtpRequest(emailOrPhone, otp))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("OTP verification failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // User Profile
    suspend fun getUserProfile(): Result<User> {
        return try {
            val response = apiService.getUserProfile()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user profile: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateUserProfile(user: User): Result<User> {
        return try {
            val response = apiService.updateUserProfile(user)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update user profile: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Car Brands, Models, Trims
    suspend fun getCarBrands(search: String? = null): Result<List<CarBrand>> {
        return try {
            val response = apiService.getCarBrands(search)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val brands = apiResponse.data as List<Map<String, Any>>
                    val carBrands = brands.map { brandMap ->
                        CarBrand(
                            id = brandMap["_id"] as String,
                            name = brandMap["name"] as String,
                            logo = brandMap["logo"] as? String,
                            isActive = brandMap["isActive"] as? Boolean ?: true
                        )
                    }
                    Result.success(carBrands)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to get car brands: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCarModels(brandName: String, search: String? = null): Result<List<CarModel>> {
        return try {
            val response = apiService.getCarModels(brandName, search)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val models = apiResponse.data as List<Map<String, Any>>
                    val carModels = models.map { modelMap ->
                        CarModel(
                            id = modelMap["_id"] as String,
                            brandId = modelMap["brandId"] as String,
                            brandName = modelMap["brandName"] as String,
                            name = modelMap["name"] as String,
                            yearStart = modelMap["yearStart"] as? Int,
                            yearEnd = modelMap["yearEnd"] as? Int,
                            isActive = modelMap["isActive"] as? Boolean ?: true
                        )
                    }
                    Result.success(carModels)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to get car models: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCarTrims(brandName: String, modelName: String, search: String? = null): Result<List<CarTrim>> {
        return try {
            val response = apiService.getCarTrims(brandName, modelName, search)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val trims = apiResponse.data as List<Map<String, Any>>
                    val carTrims = trims.map { trimMap ->
                        CarTrim(
                            id = trimMap["_id"] as String,
                            modelId = trimMap["modelId"] as String,
                            brandName = trimMap["brandName"] as String,
                            modelName = trimMap["modelName"] as String,
                            name = trimMap["name"] as String,
                            isActive = trimMap["isActive"] as? Boolean ?: true
                        )
                    }
                    Result.success(carTrims)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to get car trims: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Cars
    suspend fun getUserCars(): Result<List<Car>> {
        return try {
            val response = apiService.getUserCars()
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val cars = apiResponse.data as List<Map<String, Any>>
                    val carList = cars.map { carMap ->
                        Car(
                            id = carMap["_id"] as String,
                            userId = carMap["userId"] as String,
                            year = (carMap["year"] as Number).toInt(),
                            brand = carMap["brand"] as String,
                            model = carMap["model"] as String,
                            trim = carMap["trim"] as String,
                            kilometers = (carMap["kilometers"] as Number).toInt(),
                            color = carMap["color"] as String,
                            licensePlate = carMap["licensePlate"] as String,
                            currentMileage = (carMap["currentMileage"] as Number).toInt(),
                            lastMaintenanceDate = carMap["lastMaintenanceDate"] as? String,
                            lastMaintenanceKilometers = (carMap["lastMaintenanceKilometers"] as? Number)?.toInt() ?: 0,
                            lastMaintenanceServices = (carMap["lastMaintenanceServices"] as? List<Map<String, Any>>)?.map { serviceMap ->
                                MaintenanceServiceItem(
                                    serviceGroup = serviceMap["serviceGroup"] as String,
                                    serviceName = serviceMap["serviceName"] as String,
                                    date = serviceMap["date"] as String
                                )
                            } ?: emptyList(),
                            isActive = carMap["isActive"] as? Boolean ?: true,
                            createdAt = carMap["createdAt"] as String,
                            updatedAt = carMap["updatedAt"] as String
                        )
                    }
                    Result.success(carList)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to get user cars: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun registerCar(carRegistrationRequest: CarRegistrationRequest): Result<Car> {
        return try {
            val response = apiService.registerCar(carRegistrationRequest)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val carMap = apiResponse.data as Map<String, Any>
                    val car = Car(
                        id = carMap["_id"] as String,
                        userId = carMap["userId"] as String,
                        year = (carMap["year"] as Number).toInt(),
                        brand = carMap["brand"] as String,
                        model = carMap["model"] as String,
                        trim = carMap["trim"] as String,
                        kilometers = (carMap["kilometers"] as Number).toInt(),
                        color = carMap["color"] as String,
                        licensePlate = carMap["licensePlate"] as String,
                        currentMileage = (carMap["currentMileage"] as Number).toInt(),
                        lastMaintenanceDate = carMap["lastMaintenanceDate"] as? String,
                        lastMaintenanceKilometers = (carMap["lastMaintenanceKilometers"] as? Number)?.toInt() ?: 0,
                        lastMaintenanceServices = (carMap["lastMaintenanceServices"] as? List<Map<String, Any>>)?.map { serviceMap ->
                            MaintenanceServiceItem(
                                serviceGroup = serviceMap["serviceGroup"] as String,
                                serviceName = serviceMap["serviceName"] as String,
                                date = serviceMap["date"] as String
                            )
                        } ?: emptyList(),
                        isActive = carMap["isActive"] as? Boolean ?: true,
                        createdAt = carMap["createdAt"] as String,
                        updatedAt = carMap["updatedAt"] as String
                    )
                    Result.success(car)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to register car: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateCarMaintenance(carId: String, maintenanceRequest: MaintenanceRequest): Result<Car> {
        return try {
            val response = apiService.updateCarMaintenance(carId, maintenanceRequest)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val carMap = apiResponse.data as Map<String, Any>
                    val car = Car(
                        id = carMap["_id"] as String,
                        userId = carMap["userId"] as String,
                        year = (carMap["year"] as Number).toInt(),
                        brand = carMap["brand"] as String,
                        model = carMap["model"] as String,
                        trim = carMap["trim"] as String,
                        kilometers = (carMap["kilometers"] as Number).toInt(),
                        color = carMap["color"] as String,
                        licensePlate = carMap["licensePlate"] as String,
                        currentMileage = (carMap["currentMileage"] as Number).toInt(),
                        lastMaintenanceDate = carMap["lastMaintenanceDate"] as? String,
                        lastMaintenanceKilometers = (carMap["lastMaintenanceKilometers"] as? Number)?.toInt() ?: 0,
                        lastMaintenanceServices = (carMap["lastMaintenanceServices"] as? List<Map<String, Any>>)?.map { serviceMap ->
                            MaintenanceServiceItem(
                                serviceGroup = serviceMap["serviceGroup"] as String,
                                serviceName = serviceMap["serviceName"] as String,
                                date = serviceMap["date"] as String
                            )
                        } ?: emptyList(),
                        isActive = carMap["isActive"] as? Boolean ?: true,
                        createdAt = carMap["createdAt"] as String,
                        updatedAt = carMap["updatedAt"] as String
                    )
                    Result.success(car)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to update car maintenance: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMaintenanceServices(search: String? = null): Result<Map<String, List<MaintenanceService>>> {
        return try {
            val response = apiService.getMaintenanceServices(search)
            if (response.isSuccessful) {
                val apiResponse = response.body()!!
                if (apiResponse.success) {
                    val servicesMap = apiResponse.data as Map<String, List<Map<String, Any>>>
                    val groupedServices = servicesMap.mapValues { (_, services) ->
                        services.map { serviceMap ->
                            MaintenanceService(
                                id = serviceMap["_id"] as String,
                                serviceGroup = serviceMap["serviceGroup"] as String,
                                serviceName = serviceMap["serviceName"] as String,
                                description = serviceMap["description"] as? String,
                                icon = serviceMap["icon"] as? String,
                                isActive = serviceMap["isActive"] as? Boolean ?: true
                            )
                        }
                    }
                    Result.success(groupedServices)
                } else {
                    Result.failure(Exception(apiResponse.message))
                }
            } else {
                Result.failure(Exception("Failed to get maintenance services: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCarHealth(carId: String): Result<CarHealth> {
        return try {
            val response = apiService.getCarHealth(carId)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get car health: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Maintenance
    suspend fun getMaintenanceHistory(carId: String? = null): Result<List<MaintenanceRecord>> {
        return try {
            val response = apiService.getMaintenanceHistory(carId)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get maintenance history: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMaintenanceReminders(): Result<List<MaintenanceReminder>> {
        return try {
            val response = apiService.getMaintenanceReminders()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get maintenance reminders: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Services
    suspend fun getServicePartners(location: String? = null): Result<List<ServicePartner>> {
        return try {
            val response = apiService.getServicePartners(location)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get service partners: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun bookService(bookingRequest: ServiceBookingRequest): Result<ServiceBooking> {
        return try {
            val response = apiService.bookService(bookingRequest)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to book service: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Parts
    suspend fun getPartCategories(): Result<List<PartCategory>> {
        return try {
            val response = apiService.getPartCategories()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get part categories: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getParts(category: String? = null, search: String? = null): Result<List<CarPart>> {
        return try {
            val response = apiService.getParts(category, search)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get parts: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Community
    suspend fun getCommunityTips(): Result<List<CommunityTip>> {
        return try {
            val response = apiService.getCommunityTips()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get community tips: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createTip(tip: CommunityTip): Result<CommunityTip> {
        return try {
            val response = apiService.createTip(tip)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create tip: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Loyalty
    suspend fun getUserPoints(): Result<LoyaltyPoints> {
        return try {
            val response = apiService.getUserPoints()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user points: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserBadges(): Result<List<Badge>> {
        return try {
            val response = apiService.getUserBadges()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user badges: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
