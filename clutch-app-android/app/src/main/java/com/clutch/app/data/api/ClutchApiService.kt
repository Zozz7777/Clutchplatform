package com.clutch.app.data.api

import com.clutch.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ClutchApiService {
    
    // Authentication
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Body refreshRequest: RefreshTokenRequest): Response<AuthResponse>
    
    @POST("auth/logout")
    suspend fun logout(@Header("Authorization") token: String): Response<Unit>
    
    // User Profile
    @GET("users/profile")
    suspend fun getUserProfile(@Header("Authorization") token: String): Response<User>
    
    @PUT("users/profile")
    suspend fun updateUserProfile(
        @Header("Authorization") token: String,
        @Body user: User
    ): Response<User>
    
    // Cars
    @GET("cars")
    suspend fun getUserCars(@Header("Authorization") token: String): Response<List<Car>>
    
    @POST("cars")
    suspend fun addCar(
        @Header("Authorization") token: String,
        @Body car: Car
    ): Response<Car>
    
    @PUT("cars/{carId}")
    suspend fun updateCar(
        @Header("Authorization") token: String,
        @Path("carId") carId: String,
        @Body car: Car
    ): Response<Car>
    
    @DELETE("cars/{carId}")
    suspend fun deleteCar(
        @Header("Authorization") token: String,
        @Path("carId") carId: String
    ): Response<Unit>
    
    @GET("cars/{carId}/health")
    suspend fun getCarHealth(
        @Header("Authorization") token: String,
        @Path("carId") carId: String
    ): Response<CarHealthScore>
    
    // Community
    @GET("community/tips")
    suspend fun getCommunityTips(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("category") category: String? = null,
        @Query("sortBy") sortBy: String = "createdAt",
        @Query("sortOrder") sortOrder: String = "desc",
        @Query("language") language: String = "en",
        @Query("search") search: String? = null
    ): Response<CommunityTipsResponse>
    
    @GET("community/tips/{tipId}")
    suspend fun getCommunityTip(
        @Header("Authorization") token: String,
        @Path("tipId") tipId: String
    ): Response<CommunityTip>
    
    @POST("community/tips")
    suspend fun createCommunityTip(
        @Header("Authorization") token: String,
        @Body tip: CreateCommunityTipRequest
    ): Response<CommunityTip>
    
    @POST("community/tips/{tipId}/vote")
    suspend fun voteOnTip(
        @Header("Authorization") token: String,
        @Path("tipId") tipId: String,
        @Body vote: VoteRequest
    ): Response<VoteResponse>
    
    @DELETE("community/tips/{tipId}/vote")
    suspend fun removeVote(
        @Header("Authorization") token: String,
        @Path("tipId") tipId: String
    ): Response<VoteResponse>
    
    @POST("community/tips/{tipId}/comments")
    suspend fun addComment(
        @Header("Authorization") token: String,
        @Path("tipId") tipId: String,
        @Body comment: CommentRequest
    ): Response<CommunityComment>
    
    @GET("community/leaderboard")
    suspend fun getCommunityLeaderboard(
        @Header("Authorization") token: String,
        @Query("period") period: String = "all",
        @Query("limit") limit: Int = 50
    ): Response<CommunityLeaderboard>
    
    @GET("community/stats")
    suspend fun getCommunityStats(
        @Header("Authorization") token: String
    ): Response<CommunityStats>
    
    // Loyalty
    @GET("loyalty/points")
    suspend fun getLoyaltyPoints(@Header("Authorization") token: String): Response<LoyaltyAccount>
    
    @POST("loyalty/redeem")
    suspend fun redeemPoints(
        @Header("Authorization") token: String,
        @Body redeemRequest: RedeemPointsRequest
    ): Response<RedeemPointsResponse>
    
    @GET("loyalty/badges")
    suspend fun getLoyaltyBadges(@Header("Authorization") token: String): Response<LoyaltyBadgesResponse>
    
    @GET("loyalty/leaderboard")
    suspend fun getLoyaltyLeaderboard(
        @Header("Authorization") token: String,
        @Query("period") period: String = "all",
        @Query("limit") limit: Int = 50,
        @Query("tier") tier: String? = null
    ): Response<LoyaltyLeaderboard>
    
    @GET("loyalty/rewards")
    suspend fun getLoyaltyRewards(
        @Header("Authorization") token: String,
        @Query("tier") tier: String? = null,
        @Query("category") category: String? = null
    ): Response<LoyaltyRewardsResponse>
    
    @POST("loyalty/rewards/{rewardId}/redeem")
    suspend fun redeemReward(
        @Header("Authorization") token: String,
        @Path("rewardId") rewardId: String
    ): Response<RedeemRewardResponse>
    
    @PUT("loyalty/preferences")
    suspend fun updateLoyaltyPreferences(
        @Header("Authorization") token: String,
        @Body preferences: LoyaltyPreferences
    ): Response<LoyaltyPreferences>
}

// Request/Response Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null
)

data class RefreshTokenRequest(
    val refreshToken: String
)

data class AuthResponse(
    val success: Boolean,
    val data: AuthData,
    val message: String
)

data class AuthData(
    val user: User,
    val accessToken: String,
    val refreshToken: String
)

data class CreateCommunityTipRequest(
    val type: String,
    val title: String,
    val content: String,
    val category: String,
    val images: List<CommunityImage> = emptyList(),
    val rating: Int? = null,
    val partnerId: String? = null,
    val serviceId: String? = null,
    val tags: List<String> = emptyList(),
    val language: String = "en"
)

data class VoteRequest(
    val voteType: String // "up" or "down"
)

data class VoteResponse(
    val success: Boolean,
    val data: VoteData,
    val message: String
)

data class VoteData(
    val votes: CommunityVotes,
    val totalVotes: Int
)

data class CommentRequest(
    val content: String
)

data class CommunityTipsResponse(
    val success: Boolean,
    val data: CommunityTipsData
)

data class CommunityTipsData(
    val tips: List<CommunityTip>,
    val pagination: Pagination
)

data class Pagination(
    val current: Int,
    val pages: Int,
    val total: Int
)

data class RedeemPointsRequest(
    val points: Int,
    val description: String,
    val referenceType: String? = null
)

data class RedeemPointsResponse(
    val success: Boolean,
    val data: RedeemPointsData,
    val message: String
)

data class RedeemPointsData(
    val pointsBalance: Int,
    val redeemedPoints: Int
)

data class LoyaltyBadgesResponse(
    val success: Boolean,
    val data: LoyaltyBadgesData
)

data class LoyaltyBadgesData(
    val badges: List<LoyaltyBadge>,
    val badgesByCategory: Map<String, List<LoyaltyBadge>>,
    val totalBadges: Int
)

data class LoyaltyRewardsResponse(
    val success: Boolean,
    val data: LoyaltyRewardsData
)

data class LoyaltyRewardsData(
    val rewards: List<LoyaltyReward>,
    val categories: List<String>,
    val totalRewards: Int
)

data class RedeemRewardResponse(
    val success: Boolean,
    val data: RedeemRewardData,
    val message: String
)

data class RedeemRewardData(
    val reward: LoyaltyReward,
    val pointsBalance: Int,
    val redeemedPoints: Int
)
