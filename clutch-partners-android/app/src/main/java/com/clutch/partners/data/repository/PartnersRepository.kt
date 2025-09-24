package com.clutch.partners.data.repository

import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.*
import com.clutch.partners.data.local.PartnersLocalDataSource
import com.clutch.partners.data.local.PreferencesManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PartnersRepository @Inject constructor(
    private val apiService: PartnersApiService,
    private val localDataSource: PartnersLocalDataSource,
    private val preferencesManager: PreferencesManager
) {

    // Authentication
    suspend fun signIn(email: String, password: String): Result<SignInResponse> {
        return try {
            val response = apiService.signIn(SignInRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Save token and user data
                    preferencesManager.saveAuthToken(data.token)
                    localDataSource.savePartnerUser(data.partner)
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Sign in failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUp(signUpRequest: SignUpRequest): Result<SignUpResponse> {
        return try {
            val response = apiService.signUp(signUpRequest)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Sign up failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun requestToJoin(request: RequestToJoinRequest): Result<RequestToJoinResponse> {
        return try {
            val response = apiService.requestToJoin(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Request to join failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Orders
    suspend fun getOrders(
        status: String? = null,
        type: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<OrdersResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getOrders("Bearer $token", status, type, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Cache orders locally
                    localDataSource.saveOrders(data.orders)
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch orders"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateOrderStatus(orderId: String, status: String, notes: String? = null): Result<PartnerOrder> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.updateOrderStatus(
                "Bearer $token",
                orderId,
                UpdateOrderStatusRequest(status, notes)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Update local cache
                    localDataSource.updateOrder(data.order)
                    Result.success(data.order)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to update order status"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Invoices
    suspend fun getInvoices(
        status: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<InvoicesResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getInvoices("Bearer $token", status, page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch invoices"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateInvoiceStatus(invoiceId: String, status: String, reason: String? = null): Result<PartnerOrder> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.updateInvoiceStatus(
                "Bearer $token",
                invoiceId,
                UpdateInvoiceStatusRequest(status, reason)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Update local cache
                    localDataSource.updateOrder(data.order)
                    Result.success(data.order)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to update invoice status"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Payments
    suspend fun getWeeklyPayments(): Result<WeeklyPaymentsResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getWeeklyPayments("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch weekly payments"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPaymentHistory(page: Int = 1, limit: Int = 20): Result<PaymentHistoryResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getPaymentHistory("Bearer $token", page, limit)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Cache payments locally
                    localDataSource.savePayments(data.payments)
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch payment history"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Settings
    suspend fun getSettings(): Result<PartnerUser> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getSettings("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Update local cache
                    localDataSource.savePartnerUser(data.partner)
                    Result.success(data.partner)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch settings"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateSettings(request: UpdateSettingsRequest): Result<PartnerUser> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.updateSettings("Bearer $token", request)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    // Update local cache
                    localDataSource.savePartnerUser(data.partner)
                    Result.success(data.partner)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to update settings"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Dashboard
    suspend fun getRevenueAnalytics(period: String = "30d"): Result<RevenueAnalyticsResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getRevenueAnalytics("Bearer $token", period)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch revenue analytics"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getInventoryAnalytics(): Result<InventoryAnalyticsResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getInventoryAnalytics("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch inventory analytics"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrderAnalytics(): Result<OrderAnalyticsResponse> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getOrderAnalytics("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch order analytics"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Notifications
    suspend fun registerDeviceToken(token: String, platform: String): Result<DeviceTokenResponse> {
        return try {
            val authToken = preferencesManager.getAuthToken()
            if (authToken == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.registerDeviceToken(
                "Bearer $authToken",
                DeviceTokenRequest(token, platform)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to register device token"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun removeDeviceToken(token: String): Result<DeviceTokenResponse> {
        return try {
            val authToken = preferencesManager.getAuthToken()
            if (authToken == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.removeDeviceToken(
                "Bearer $authToken",
                DeviceTokenRequest(token, "android")
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to remove device token"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getNotificationPreferences(): Result<NotificationPreferences> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.getNotificationPreferences("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data.preferences)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to fetch notification preferences"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateNotificationPreferences(preferences: NotificationPreferences): Result<NotificationPreferences> {
        return try {
            val token = preferencesManager.getAuthToken()
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = apiService.updateNotificationPreferences(
                "Bearer $token",
                UpdateNotificationPreferencesRequest(preferences)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    Result.success(data.preferences)
                } else {
                    Result.failure(Exception("No data received"))
                }
            } else {
                val errorMessage = response.body()?.message ?: "Failed to update notification preferences"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Local data access
    fun getCurrentUser(): Flow<PartnerUser?> = localDataSource.getCurrentUser()
    
    suspend fun getCurrentUser(): PartnerUser? {
        return localDataSource.getCurrentUserSync()
    }
    
    suspend fun getOrders(): List<PartnerOrder> {
        return try {
            val response = apiService.getOrders()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getPayments(): List<PartnerPayment> {
        return try {
            val response = apiService.getPayments()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data ?: emptyList()
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getWeeklyIncome(): Double {
        return try {
            val response = apiService.getWeeklyIncome()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.weeklyIncome ?: 0.0
            } else {
                0.0
            }
        } catch (e: Exception) {
            0.0
        }
    }
    
    suspend fun getPayoutCountdown(): String {
        return try {
            val response = apiService.getWeeklyIncome()
            if (response.isSuccessful && response.body()?.success == true) {
                response.body()?.data?.payoutCountdown ?: "N/A"
            } else {
                "N/A"
            }
        } catch (e: Exception) {
            "N/A"
        }
    }
    fun getCachedOrders(): Flow<List<PartnerOrder>> = localDataSource.getCachedOrders()
    fun getCachedPayments(): Flow<List<PartnerPayment>> = localDataSource.getCachedPayments()

    // Auth state
    fun isAuthenticated(): Boolean = preferencesManager.getAuthToken() != null
    fun getAuthToken(): String? = preferencesManager.getAuthToken()
    fun logout() {
        preferencesManager.clearAuthToken()
        localDataSource.clearAllData()
    }
}
