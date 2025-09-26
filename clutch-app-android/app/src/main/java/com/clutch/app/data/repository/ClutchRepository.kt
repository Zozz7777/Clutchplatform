package com.clutch.app.data.repository

import com.clutch.app.data.api.ClutchApiService
import com.clutch.app.data.model.*
import com.clutch.app.data.local.ClutchLocalDataSource
import com.clutch.app.utils.SessionManager
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClutchRepository @Inject constructor(
    private val apiService: ClutchApiService,
    private val localDataSource: ClutchLocalDataSource,
    private val sessionManager: SessionManager
) {
    
    // Authentication
    suspend fun login(email: String, password: String): Result<AuthData> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val authData = response.body()!!.data
                sessionManager.saveAuthToken(authData.accessToken)
                sessionManager.saveRefreshToken(authData.refreshToken)
                sessionManager.saveUser(authData.user)
                localDataSource.saveUser(authData.user)
                Result.success(authData)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun register(name: String, email: String, password: String, phone: String? = null): Result<AuthData> {
        return try {
            val response = apiService.register(RegisterRequest(name, email, password, phone))
            if (response.isSuccessful && response.body()?.success == true) {
                val authData = response.body()!!.data
                sessionManager.saveAuthToken(authData.accessToken)
                sessionManager.saveRefreshToken(authData.refreshToken)
                sessionManager.saveUser(authData.user)
                localDataSource.saveUser(authData.user)
                Result.success(authData)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<Unit> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token != null) {
                apiService.logout("Bearer $token")
            }
            sessionManager.clearSession()
            localDataSource.clearUserData()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // User Profile
    suspend fun getUserProfile(): Result<User> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getUserProfile("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                val user = response.body()!!
                sessionManager.saveUser(user)
                localDataSource.saveUser(user)
                Result.success(user)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateUserProfile(user: User): Result<User> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.updateUserProfile("Bearer $token", user)
            if (response.isSuccessful && response.body() != null) {
                val updatedUser = response.body()!!
                sessionManager.saveUser(updatedUser)
                localDataSource.saveUser(updatedUser)
                Result.success(updatedUser)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Cars
    suspend fun getUserCars(): Result<List<Car>> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getUserCars("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                val cars = response.body()!!
                localDataSource.saveCars(cars)
                Result.success(cars)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addCar(car: Car): Result<Car> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.addCar("Bearer $token", car)
            if (response.isSuccessful && response.body() != null) {
                val newCar = response.body()!!
                localDataSource.addCar(newCar)
                Result.success(newCar)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCarHealth(carId: String): Result<CarHealthScore> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getCarHealth("Bearer $token", carId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Community
    suspend fun getCommunityTips(
        page: Int = 1,
        limit: Int = 20,
        type: String? = null,
        category: String? = null,
        sortBy: String = "createdAt",
        sortOrder: String = "desc",
        language: String = "en",
        search: String? = null
    ): Result<CommunityTipsData> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getCommunityTips(
                "Bearer $token",
                page, limit, type, category, sortBy, sortOrder, language, search
            )
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createCommunityTip(tip: CreateCommunityTipRequest): Result<CommunityTip> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.createCommunityTip("Bearer $token", tip)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun voteOnTip(tipId: String, voteType: String): Result<VoteData> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.voteOnTip("Bearer $token", tipId, VoteRequest(voteType))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCommunityLeaderboard(period: String = "all", limit: Int = 50): Result<CommunityLeaderboard> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getCommunityLeaderboard("Bearer $token", period, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Loyalty
    suspend fun getLoyaltyPoints(): Result<LoyaltyAccount> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getLoyaltyPoints("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun redeemPoints(points: Int, description: String, referenceType: String? = null): Result<RedeemPointsData> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.redeemPoints("Bearer $token", RedeemPointsRequest(points, description, referenceType))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getLoyaltyBadges(): Result<LoyaltyBadgesData> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getLoyaltyBadges("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getLoyaltyRewards(tier: String? = null, category: String? = null): Result<LoyaltyRewardsData> {
        return try {
            val token = sessionManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("No auth token"))
            }
            
            val response = apiService.getLoyaltyRewards("Bearer $token", tier, category)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Local data access
    fun getCurrentUser(): User? = sessionManager.getCurrentUser()
    fun getCachedCars(): List<Car> = localDataSource.getCars()
    fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()
}
