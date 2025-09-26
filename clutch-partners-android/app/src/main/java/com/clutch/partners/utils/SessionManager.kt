package com.clutch.partners.utils

import android.content.Context
import android.content.SharedPreferences
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(
    private val context: Context
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_DATA = "user_data"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_TOKEN_EXPIRY = "token_expiry"
    }
    
    fun saveAuthToken(token: String, expiryTime: Long) {
        prefs.edit()
            .putString(KEY_AUTH_TOKEN, token)
            .putLong(KEY_TOKEN_EXPIRY, expiryTime)
            .putBoolean(KEY_IS_LOGGED_IN, true)
            .apply()
    }
    
    fun getAuthToken(): String? {
        val token = prefs.getString(KEY_AUTH_TOKEN, null)
        val expiryTime = prefs.getLong(KEY_TOKEN_EXPIRY, 0)
        
        return if (token != null && System.currentTimeMillis() < expiryTime) {
            token
        } else {
            clearSession()
            null
        }
    }
    
    fun saveUserData(userData: String) {
        prefs.edit()
            .putString(KEY_USER_DATA, userData)
            .apply()
    }
    
    fun getUserData(): String? {
        return prefs.getString(KEY_USER_DATA, null)
    }
    
    fun isLoggedIn(): Boolean {
        val token = getAuthToken()
        return token != null && prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    }
    
    fun clearSession() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_USER_DATA)
            .remove(KEY_IS_LOGGED_IN)
            .remove(KEY_TOKEN_EXPIRY)
            .apply()
    }
    
    fun refreshToken(newToken: String, newExpiryTime: Long) {
        saveAuthToken(newToken, newExpiryTime)
    }
}
