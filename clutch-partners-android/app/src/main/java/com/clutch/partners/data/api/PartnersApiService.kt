package com.clutch.partners.data.api

import com.clutch.partners.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface PartnersApiService {
    
    // Authentication endpoints
    @POST("partners/auth/signin")
    suspend fun signIn(@Body request: SignInRequest): Response<AuthResponse>
    
    @POST("partners/auth/signup")
    suspend fun signUp(@Body request: SignUpRequest): Response<AuthResponse>
    
    @POST("partners/auth/request-to-join")
    suspend fun requestToJoin(@Body request: RequestToJoinRequest): Response<AuthResponse>
    
    // Orders endpoints
    @GET("partners/orders")
    suspend fun getOrders(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null
    ): Response<OrdersResponse>
    
    @PATCH("partners/orders/{orderId}/status")
    suspend fun updateOrderStatus(
        @Header("Authorization") token: String,
        @Path("orderId") orderId: String,
        @Body request: OrderStatusUpdateRequest
    ): Response<OrdersResponse>
    
    // Payments endpoints
    @GET("partners/payments/weekly")
    suspend fun getWeeklyIncome(
        @Header("Authorization") token: String
    ): Response<WeeklyIncomeResponse>
    
    @GET("partners/payments/history")
    suspend fun getPaymentHistory(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<PaymentHistoryResponse>
    
    // Settings endpoints
    @GET("partners/settings")
    suspend fun getSettings(
        @Header("Authorization") token: String
    ): Response<SettingsResponse>
    
    @PATCH("partners/settings")
    suspend fun updateSettings(
        @Header("Authorization") token: String,
        @Body request: SettingsUpdateRequest
    ): Response<SettingsResponse>
    
    // Business Dashboard endpoints
    @GET("partners/dashboard/revenue")
    suspend fun getRevenueData(
        @Header("Authorization") token: String
    ): Response<DashboardResponse>
    
    @GET("partners/dashboard/inventory")
    suspend fun getInventoryData(
        @Header("Authorization") token: String
    ): Response<DashboardResponse>
    
    @GET("partners/dashboard/orders")
    suspend fun getOrderStats(
        @Header("Authorization") token: String
    ): Response<DashboardResponse>
    
    // Notifications endpoints
    @POST("notifications/push")
    suspend fun sendPushNotification(
        @Header("Authorization") token: String,
        @Body request: NotificationRequest
    ): Response<NotificationResponse>
    
    @POST("notifications/email")
    suspend fun sendEmailNotification(
        @Header("Authorization") token: String,
        @Body request: NotificationRequest
    ): Response<NotificationResponse>
    
    @POST("notifications/sms")
    suspend fun sendSmsNotification(
        @Header("Authorization") token: String,
        @Body request: NotificationRequest
    ): Response<NotificationResponse>
}

