package com.clutch.app.data.repository

import com.clutch.app.data.api.ClutchApiService
import com.clutch.app.data.model.*
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
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
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
                Result.failure(Exception("Registration failed: ${response.message()}"))
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
    
    // Cars
    suspend fun getUserCars(): Result<List<Car>> {
        return try {
            val response = apiService.getUserCars()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user cars: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addCar(car: Car): Result<Car> {
        return try {
            val response = apiService.addCar(car)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to add car: ${response.message()}"))
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
