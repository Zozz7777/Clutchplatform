package com.clutch.app.config

import android.content.Context
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppConfig @Inject constructor(
    private val context: Context
) {
    
    companion object {
        // API Configuration
        const val BASE_URL = "https://clutch-main-nk7x.onrender.com/api/v1/"
        const val API_TIMEOUT_SECONDS = 30L
        const val MAX_RETRY_ATTEMPTS = 3
        
        // Cache Configuration
        const val CACHE_SIZE_MB = 50L
        const val CACHE_EXPIRY_HOURS = 24L
        
        // Security Configuration
        const val TOKEN_REFRESH_THRESHOLD_MINUTES = 5L
        const val MAX_LOGIN_ATTEMPTS = 5
        const val LOCKOUT_DURATION_MINUTES = 15L
        
        // UI Configuration
        const val ANIMATION_DURATION_MS = 300L
        const val DEBOUNCE_DELAY_MS = 500L
        const val PAGINATION_PAGE_SIZE = 20
        
        // Feature Flags
        const val ENABLE_BIOMETRIC_AUTH = true
        const val ENABLE_PUSH_NOTIFICATIONS = true
        const val ENABLE_ANALYTICS = true
        const val ENABLE_CRASH_REPORTING = true
        const val ENABLE_PERFORMANCE_MONITORING = true
        
        // App Information
        const val APP_NAME = "Clutch"
        const val APP_VERSION = "1.0.0"
        const val MIN_SDK_VERSION = 24
        const val TARGET_SDK_VERSION = 34
    }
    
    /**
     * Get API base URL
     */
    fun getBaseUrl(): String {
        return BASE_URL
    }
    
    /**
     * Get API timeout in seconds
     */
    fun getApiTimeout(): Long {
        return API_TIMEOUT_SECONDS
    }
    
    /**
     * Get max retry attempts
     */
    fun getMaxRetryAttempts(): Int {
        return MAX_RETRY_ATTEMPTS
    }
    
    /**
     * Get cache size in MB
     */
    fun getCacheSize(): Long {
        return CACHE_SIZE_MB
    }
    
    /**
     * Get cache expiry in hours
     */
    fun getCacheExpiry(): Long {
        return CACHE_EXPIRY_HOURS
    }
    
    /**
     * Get token refresh threshold in minutes
     */
    fun getTokenRefreshThreshold(): Long {
        return TOKEN_REFRESH_THRESHOLD_MINUTES
    }
    
    /**
     * Get max login attempts
     */
    fun getMaxLoginAttempts(): Int {
        return MAX_LOGIN_ATTEMPTS
    }
    
    /**
     * Get lockout duration in minutes
     */
    fun getLockoutDuration(): Long {
        return LOCKOUT_DURATION_MINUTES
    }
    
    /**
     * Get animation duration in milliseconds
     */
    fun getAnimationDuration(): Long {
        return ANIMATION_DURATION_MS
    }
    
    /**
     * Get debounce delay in milliseconds
     */
    fun getDebounceDelay(): Long {
        return DEBOUNCE_DELAY_MS
    }
    
    /**
     * Get pagination page size
     */
    fun getPaginationPageSize(): Int {
        return PAGINATION_PAGE_SIZE
    }
    
    /**
     * Check if biometric authentication is enabled
     */
    fun isBiometricAuthEnabled(): Boolean {
        return ENABLE_BIOMETRIC_AUTH
    }
    
    /**
     * Check if push notifications are enabled
     */
    fun isPushNotificationsEnabled(): Boolean {
        return ENABLE_PUSH_NOTIFICATIONS
    }
    
    /**
     * Check if analytics is enabled
     */
    fun isAnalyticsEnabled(): Boolean {
        return ENABLE_ANALYTICS
    }
    
    /**
     * Check if crash reporting is enabled
     */
    fun isCrashReportingEnabled(): Boolean {
        return ENABLE_CRASH_REPORTING
    }
    
    /**
     * Check if performance monitoring is enabled
     */
    fun isPerformanceMonitoringEnabled(): Boolean {
        return ENABLE_PERFORMANCE_MONITORING
    }
    
    /**
     * Get app name
     */
    fun getAppName(): String {
        return APP_NAME
    }
    
    /**
     * Get app version
     */
    fun getAppVersion(): String {
        return APP_VERSION
    }
    
    /**
     * Get minimum SDK version
     */
    fun getMinSdkVersion(): Int {
        return MIN_SDK_VERSION
    }
    
    /**
     * Get target SDK version
     */
    fun getTargetSdkVersion(): Int {
        return TARGET_SDK_VERSION
    }
    
    /**
     * Check if app is in debug mode
     */
    fun isDebugMode(): Boolean {
        return try {
            (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * Get build type
     */
    fun getBuildType(): String {
        return try {
            val buildConfigClass = Class.forName("${context.packageName}.BuildConfig")
            val buildTypeField = buildConfigClass.getField("BUILD_TYPE")
            buildTypeField.get(null) as String
        } catch (e: Exception) {
            "unknown"
        }
    }
    
    /**
     * Get flavor
     */
    fun getFlavor(): String {
        return try {
            val buildConfigClass = Class.forName("${context.packageName}.BuildConfig")
            val flavorField = buildConfigClass.getField("FLAVOR")
            flavorField.get(null) as String
        } catch (e: Exception) {
            "unknown"
        }
    }
    
    /**
     * Get device information
     */
    fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            manufacturer = android.os.Build.MANUFACTURER,
            model = android.os.Build.MODEL,
            version = android.os.Build.VERSION.RELEASE,
            sdkVersion = android.os.Build.VERSION.SDK_INT,
            deviceId = getDeviceId()
        )
    }
    
    /**
     * Get device ID
     */
    private fun getDeviceId(): String {
        return try {
            val androidId = android.provider.Settings.Secure.getString(
                context.contentResolver,
                android.provider.Settings.Secure.ANDROID_ID
            )
            androidId ?: "unknown"
        } catch (e: Exception) {
            "unknown"
        }
    }
}

/**
 * Device Information Data Class
 */
data class DeviceInfo(
    val manufacturer: String,
    val model: String,
    val version: String,
    val sdkVersion: Int,
    val deviceId: String
)
