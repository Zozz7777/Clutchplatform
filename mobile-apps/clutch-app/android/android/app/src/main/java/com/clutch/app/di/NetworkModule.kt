package com.clutch.app.di

import com.clutch.app.data.TokenManager
import com.clutch.app.data.TokenManagerImpl
import com.clutch.app.data.api.ApiClient
import com.clutch.app.data.api.ApiService
import com.clutch.app.data.api.AuthInterceptor
import com.clutch.app.data.repository.AuthRepository
import com.clutch.app.data.repository.PartsRepository
import com.clutch.app.data.repository.ServicesRepository
import com.clutch.app.data.repository.OrdersRepository
import com.clutch.app.data.repository.NotificationsRepository
import com.clutch.app.data.storage.SecureTokenManager
import com.clutch.app.data.api.ApiErrorHandler
import com.clutch.app.data.api.RetryInterceptor
import com.clutch.app.data.cache.CacheManager
import com.clutch.app.security.SecurityManager
import com.clutch.app.config.AppConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideTokenManager(secureTokenManager: SecureTokenManager): TokenManager {
        return TokenManagerImpl(secureTokenManager)
    }
    
    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): AuthInterceptor {
        return AuthInterceptor(tokenManager)
    }
    
    @Provides
    @Singleton
    fun provideApiClient(authInterceptor: AuthInterceptor): ApiClient {
        return ApiClient(authInterceptor)
    }
    
    @Provides
    @Singleton
    fun provideApiService(apiClient: ApiClient): ApiService {
        return apiClient.apiService
    }
    
    @Provides
    @Singleton
    fun provideAuthRepository(
        apiService: ApiService,
        tokenManager: TokenManager
    ): AuthRepository {
        return AuthRepository(apiService, tokenManager)
    }
    
    @Provides
    @Singleton
    fun providePartsRepository(apiService: ApiService): PartsRepository {
        return PartsRepository(apiService)
    }
    
    @Provides
    @Singleton
    fun provideServicesRepository(apiService: ApiService): ServicesRepository {
        return ServicesRepository(apiService)
    }
    
    @Provides
    @Singleton
    fun provideOrdersRepository(apiService: ApiService): OrdersRepository {
        return OrdersRepository(apiService)
    }
    
    @Provides
    @Singleton
    fun provideNotificationsRepository(): NotificationsRepository {
        return NotificationsRepository()
    }
    
    @Provides
    @Singleton
    fun provideApiErrorHandler(): ApiErrorHandler {
        return ApiErrorHandler()
    }
    
    @Provides
    @Singleton
    fun provideRetryInterceptor(): RetryInterceptor {
        return RetryInterceptor()
    }
    
    @Provides
    @Singleton
    fun provideCacheManager(@ApplicationContext context: Context): CacheManager {
        return CacheManager(context)
    }
    
    @Provides
    @Singleton
    fun provideSecurityManager(
        @ApplicationContext context: Context,
        secureTokenManager: SecureTokenManager
    ): SecurityManager {
        return SecurityManager(context, secureTokenManager)
    }
    
    @Provides
    @Singleton
    fun provideAppConfig(@ApplicationContext context: Context): AppConfig {
        return AppConfig(context)
    }
}
