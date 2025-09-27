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
    
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body forgotPasswordRequest: ForgotPasswordRequest): Response<ApiResponse>
    
    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body otpRequest: OtpRequest): Response<ApiResponse>
    
    // User Profile
    @GET("users/profile")
    suspend fun getUserProfile(): Response<User>
    
    @PUT("users/profile")
    suspend fun updateUserProfile(@Body user: User): Response<User>
    
    // Car Brands, Models, Trims
    @GET("brands")
    suspend fun getCarBrands(@Query("search") search: String? = null): Response<ApiResponse>
    
    @GET("models/{brandName}")
    suspend fun getCarModels(@Path("brandName") brandName: String, @Query("search") search: String? = null): Response<ApiResponse>
    
    @GET("trims/{brandName}/{modelName}")
    suspend fun getCarTrims(@Path("brandName") brandName: String, @Path("modelName") modelName: String, @Query("search") search: String? = null): Response<ApiResponse>
    
    // Cars
    @GET("user-cars")
    suspend fun getUserCars(): Response<ApiResponse>
    
    @POST("register")
    suspend fun registerCar(@Body carRegistrationRequest: CarRegistrationRequest): Response<ApiResponse>
    
    @PUT("{carId}/maintenance")
    suspend fun updateCarMaintenance(@Path("carId") carId: String, @Body maintenanceRequest: MaintenanceRequest): Response<ApiResponse>
    
    @GET("{carId}/health")
    suspend fun getCarHealth(@Path("carId") carId: String): Response<CarHealth>
    
    // Maintenance Services
    @GET("maintenance-services")
    suspend fun getMaintenanceServices(@Query("search") search: String? = null): Response<ApiResponse>
    
    // Maintenance
    @GET("maintenance/history")
    suspend fun getMaintenanceHistory(@Query("carId") carId: String? = null): Response<List<MaintenanceRecord>>
    
    @POST("maintenance")
    suspend fun addMaintenanceRecord(@Body maintenance: MaintenanceRecord): Response<MaintenanceRecord>
    
    @GET("maintenance/reminders")
    suspend fun getMaintenanceReminders(): Response<List<MaintenanceReminder>>
    
    // Services
    @GET("services/partners")
    suspend fun getServicePartners(@Query("location") location: String? = null): Response<List<ServicePartner>>
    
    @GET("services/partners/{partnerId}")
    suspend fun getServicePartner(@Path("partnerId") partnerId: String): Response<ServicePartner>
    
    @POST("services/book")
    suspend fun bookService(@Body bookingRequest: ServiceBookingRequest): Response<ServiceBooking>
    
    @GET("services/bookings")
    suspend fun getUserBookings(): Response<List<ServiceBooking>>
    
    // Parts
    @GET("parts/categories")
    suspend fun getPartCategories(): Response<List<PartCategory>>
    
    @GET("parts")
    suspend fun getParts(@Query("category") category: String? = null, @Query("search") search: String? = null): Response<List<CarPart>>
    
    @GET("parts/{partId}")
    suspend fun getPart(@Path("partId") partId: String): Response<CarPart>
    
    @POST("orders")
    suspend fun createOrder(@Body order: Order): Response<Order>
    
    @GET("orders")
    suspend fun getUserOrders(): Response<List<Order>>
    
    @GET("orders/{orderId}")
    suspend fun getOrder(@Path("orderId") orderId: String): Response<Order>
    
    // Community
    @GET("community/tips")
    suspend fun getCommunityTips(): Response<List<CommunityTip>>
    
    @POST("community/tips")
    suspend fun createTip(@Body tip: CommunityTip): Response<CommunityTip>
    
    @GET("community/reviews")
    suspend fun getReviews(@Query("partnerId") partnerId: String? = null): Response<List<Review>>
    
    @POST("community/reviews")
    suspend fun createReview(@Body review: Review): Response<Review>
    
    @POST("community/votes")
    suspend fun vote(@Body vote: Vote): Response<ApiResponse>
    
    @GET("community/leaderboard")
    suspend fun getLeaderboard(): Response<List<LeaderboardEntry>>
    
    // Loyalty
    @GET("loyalty/points")
    suspend fun getUserPoints(): Response<LoyaltyPoints>
    
    @POST("loyalty/earn")
    suspend fun earnPoints(@Body earnRequest: EarnPointsRequest): Response<ApiResponse>
    
    @POST("loyalty/redeem")
    suspend fun redeemPoints(@Body redeemRequest: RedeemPointsRequest): Response<ApiResponse>
    
    @GET("loyalty/badges")
    suspend fun getUserBadges(): Response<List<Badge>>
    
    // Payments
    @GET("payments/methods")
    suspend fun getPaymentMethods(): Response<List<PaymentMethod>>
    
    @POST("payments/methods")
    suspend fun addPaymentMethod(@Body paymentMethod: PaymentMethod): Response<PaymentMethod>
    
    @POST("payments/process")
    suspend fun processPayment(@Body paymentRequest: PaymentRequest): Response<PaymentResponse>
}
