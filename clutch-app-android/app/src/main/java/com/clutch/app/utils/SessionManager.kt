package com.clutch.app.utils

import android.content.Context
import android.content.SharedPreferences
import com.clutch.app.data.model.User
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()
    
    companion object {
        private const val PREFS_NAME = "clutch_session"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER = "user"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_LANGUAGE = "language"
        private const val KEY_THEME = "theme"
    }
    
    fun saveAuthTokens(authToken: String, refreshToken: String) {
        prefs.edit()
            .putString(KEY_AUTH_TOKEN, authToken)
            .putString(KEY_REFRESH_TOKEN, refreshToken)
            .putBoolean(KEY_IS_LOGGED_IN, true)
            .apply()
    }
    
    fun getAuthToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }
    
    fun getRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)
    }
    
    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        prefs.edit()
            .putString(KEY_USER, userJson)
            .apply()
    }
    
    fun getUser(): User? {
        val userJson = prefs.getString(KEY_USER, null)
        return if (userJson != null) {
            try {
                gson.fromJson(userJson, User::class.java)
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }
    
    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false) && getAuthToken() != null
    }
    
    fun clearSession() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .remove(KEY_USER)
            .putBoolean(KEY_IS_LOGGED_IN, false)
            .apply()
    }
    
    fun saveLanguage(language: String) {
        prefs.edit()
            .putString(KEY_LANGUAGE, language)
            .apply()
    }
    
    fun getLanguage(): String {
        return prefs.getString(KEY_LANGUAGE, "en") ?: "en"
    }
    
    fun saveTheme(theme: String) {
        prefs.edit()
            .putString(KEY_THEME, theme)
            .apply()
    }
    
    fun getTheme(): String {
        return prefs.getString(KEY_THEME, "light") ?: "light"
    }
}
