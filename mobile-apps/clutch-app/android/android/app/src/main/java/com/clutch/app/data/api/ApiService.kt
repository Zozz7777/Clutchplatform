package com.clutch.app.data.api

import com.clutch.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // Authentication endpoints
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body otpRequest: OtpRequest): Response<AuthResponse>
    
    @POST("auth/resend-otp")
    suspend fun resendOtp(@Body resendOtpRequest: ResendOtpRequest): Response<ApiResponse>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Body refreshRequest: RefreshRequest): Response<AuthResponse>
    
    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse>
    
    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse>
    
    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse>
    
    // User endpoints
    @GET("user/profile")
    suspend fun getUserProfile(): Response<ApiResponse>
    
    @PUT("user/profile")
    suspend fun updateUserProfile(@Body profile: UserProfile): Response<ApiResponse>
    
    @GET("user/vehicles")
    suspend fun getUserVehicles(): Response<PaginatedResponse<Vehicle>>
    
    @POST("user/vehicles")
    suspend fun addVehicle(@Body vehicle: Vehicle): Response<ApiResponse>
    
    @PUT("user/vehicles/{vehicleId}")
    suspend fun updateVehicle(@Path("vehicleId") vehicleId: String, @Body vehicle: Vehicle): Response<ApiResponse>
    
    @DELETE("user/vehicles/{vehicleId}")
    suspend fun deleteVehicle(@Path("vehicleId") vehicleId: String): Response<ApiResponse>
    
    // Parts endpoints
    @GET("parts")
    suspend fun getParts(
        @Query("category") category: String? = null,
        @Query("brand") brand: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Part>>
    
    @GET("parts/{partId}")
    suspend fun getPart(@Path("partId") partId: String): Response<ApiResponse>
    
    @GET("parts/categories")
    suspend fun getPartCategories(): Response<List<PartCategory>>
    
    @GET("parts/expiring")
    suspend fun getExpiringParts(): Response<List<Part>>
    
    // Service endpoints
    @GET("services")
    suspend fun getServices(
        @Query("category") category: String? = null,
        @Query("centerId") centerId: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Service>>
    
    @GET("services/{serviceId}")
    suspend fun getService(@Path("serviceId") serviceId: String): Response<ApiResponse>
    
    @GET("services/categories")
    suspend fun getServiceCategories(): Response<List<PartCategory>>
    
    @GET("service-centers")
    suspend fun getServiceCenters(
        @Query("latitude") latitude: Double? = null,
        @Query("longitude") longitude: Double? = null,
        @Query("radius") radius: Int? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<ServiceCenter>>
    
    @GET("service-centers/{centerId}")
    suspend fun getServiceCenter(@Path("centerId") centerId: String): Response<ApiResponse>
    
    // Booking endpoints
    @GET("bookings")
    suspend fun getUserBookings(
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Booking>>
    
    @GET("bookings/{bookingId}")
    suspend fun getBooking(@Path("bookingId") bookingId: String): Response<ApiResponse>
    
    @POST("bookings")
    suspend fun createBooking(@Body booking: CreateBookingRequest): Response<ApiResponse>
    
    @PUT("bookings/{bookingId}")
    suspend fun updateBooking(@Path("bookingId") bookingId: String, @Body booking: UpdateBookingRequest): Response<ApiResponse>
    
    @DELETE("bookings/{bookingId}")
    suspend fun cancelBooking(@Path("bookingId") bookingId: String): Response<ApiResponse>
    
    // Order endpoints
    @GET("orders")
    suspend fun getUserOrders(
        @Query("status") status: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaginatedResponse<Order>>
    
    @GET("orders/{orderId}")
    suspend fun getOrder(@Path("orderId") orderId: String): Response<ApiResponse>
    
    @POST("orders")
    suspend fun createOrder(@Body order: CreateOrderRequest): Response<ApiResponse>
    
    @PUT("orders/{orderId}")
    suspend fun updateOrder(@Path("orderId") orderId: String, @Body order: UpdateOrderRequest): Response<ApiResponse>
    
    @DELETE("orders/{orderId}")
    suspend fun cancelOrder(@Path("orderId") orderId: String): Response<ApiResponse>
    
    // Cart endpoints
    @GET("cart")
    suspend fun getCart(): Response<ApiResponse>
    
    @POST("cart/items")
    suspend fun addToCart(@Body item: AddToCartRequest): Response<ApiResponse>
    
    @PUT("cart/items/{itemId}")
    suspend fun updateCartItem(@Path("itemId") itemId: String, @Body item: UpdateCartItemRequest): Response<ApiResponse>
    
    @DELETE("cart/items/{itemId}")
    suspend fun removeFromCart(@Path("itemId") itemId: String): Response<ApiResponse>
    
    @DELETE("cart")
    suspend fun clearCart(): Response<ApiResponse>
    
    // Payment endpoints
    @POST("payments/process")
    suspend fun processPayment(@Body payment: PaymentRequest): Response<ApiResponse>
    
    @GET("payments/{paymentId}")
    suspend fun getPayment(@Path("paymentId") paymentId: String): Response<ApiResponse>
    
    // Health check
    @GET("health")
    suspend fun healthCheck(): Response<ApiResponse>
}

// Request models
data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val token: String,
    val newPassword: String
)

data class CreateBookingRequest(
    val serviceId: String,
    val serviceCenterId: String,
    val vehicleId: String,
    val scheduledDate: String,
    val scheduledTime: String,
    val notes: String? = null
)

data class UpdateBookingRequest(
    val scheduledDate: String? = null,
    val scheduledTime: String? = null,
    val notes: String? = null
)

data class CreateOrderRequest(
    val items: List<OrderItem>,
    val shippingAddress: Address,
    val paymentMethod: String
)

data class UpdateOrderRequest(
    val status: String? = null,
    val shippingAddress: Address? = null
)

data class AddToCartRequest(
    val partId: String,
    val quantity: Int
)

data class UpdateCartItemRequest(
    val quantity: Int
)

data class PaymentRequest(
    val orderId: String,
    val paymentMethod: String,
    val amount: Double,
    val currency: String = "USD"
)
