package com.clutch.partners.data.local

import android.content.Context
import android.content.SharedPreferences
import com.clutch.partners.data.model.PartnerUser
import com.clutch.partners.data.model.PartnerOrder
import com.clutch.partners.data.model.PartnerPayment
import com.clutch.partners.data.model.PartnerSettings
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PartnersLocalDataSource @Inject constructor(
    private val context: Context,
    private val gson: Gson
) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences("clutch_partners_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_DATA = "user_data"
        private const val KEY_ORDERS_CACHE = "orders_cache"
        private const val KEY_PAYMENTS_CACHE = "payments_cache"
        private const val KEY_SETTINGS_CACHE = "settings_cache"
        private const val KEY_LAST_SYNC = "last_sync"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
    }
    
    // Authentication data
    fun saveAuthToken(token: String) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }
    
    fun getAuthToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }
    
    fun clearAuthToken() {
        prefs.edit().remove(KEY_AUTH_TOKEN).apply()
    }
    
    fun saveUserData(user: PartnerUser) {
        val userJson = gson.toJson(user)
        prefs.edit().putString(KEY_USER_DATA, userJson).apply()
    }
    
    fun getUserData(): PartnerUser? {
        val userJson = prefs.getString(KEY_USER_DATA, null)
        return if (userJson != null) {
            try {
                gson.fromJson(userJson, PartnerUser::class.java)
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    fun clearUserData() {
        prefs.edit().remove(KEY_USER_DATA).apply()
    }
    
    fun setLoggedIn(isLoggedIn: Boolean) {
        prefs.edit().putBoolean(KEY_IS_LOGGED_IN, isLoggedIn).apply()
    }
    
    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    }
    
    // Orders cache
    fun saveOrdersCache(orders: List<PartnerOrder>) {
        val ordersJson = gson.toJson(orders)
        prefs.edit().putString(KEY_ORDERS_CACHE, ordersJson).apply()
    }
    
    fun getOrdersCache(): List<PartnerOrder>? {
        val ordersJson = prefs.getString(KEY_ORDERS_CACHE, null)
        return if (ordersJson != null) {
            try {
                val listType = object : TypeToken<List<PartnerOrder>>() {}.type
                gson.fromJson(ordersJson, listType)
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    fun clearOrdersCache() {
        prefs.edit().remove(KEY_ORDERS_CACHE).apply()
    }
    
    // Payments cache
    fun savePaymentsCache(payments: List<PartnerPayment>) {
        val paymentsJson = gson.toJson(payments)
        prefs.edit().putString(KEY_PAYMENTS_CACHE, paymentsJson).apply()
    }
    
    fun getPaymentsCache(): List<PartnerPayment>? {
        val paymentsJson = prefs.getString(KEY_PAYMENTS_CACHE, null)
        return if (paymentsJson != null) {
            try {
                val listType = object : TypeToken<List<PartnerPayment>>() {}.type
                gson.fromJson(paymentsJson, listType)
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    fun clearPaymentsCache() {
        prefs.edit().remove(KEY_PAYMENTS_CACHE).apply()
    }
    
    // Settings cache
    fun saveSettingsCache(settings: PartnerSettings) {
        val settingsJson = gson.toJson(settings)
        prefs.edit().putString(KEY_SETTINGS_CACHE, settingsJson).apply()
    }
    
    fun getSettingsCache(): PartnerSettings? {
        val settingsJson = prefs.getString(KEY_SETTINGS_CACHE, null)
        return if (settingsJson != null) {
            try {
                gson.fromJson(settingsJson, PartnerSettings::class.java)
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    fun clearSettingsCache() {
        prefs.edit().remove(KEY_SETTINGS_CACHE).apply()
    }
    
    // Sync timestamp
    fun saveLastSyncTime(timestamp: Long) {
        prefs.edit().putLong(KEY_LAST_SYNC, timestamp).apply()
    }
    
    fun getLastSyncTime(): Long {
        return prefs.getLong(KEY_LAST_SYNC, 0)
    }
    
    // Clear all data (logout)
    fun clearAllData() {
        prefs.edit().clear().apply()
    }
}
