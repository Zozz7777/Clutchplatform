package com.clutch.partners.utils

import android.content.Context
import android.content.res.Configuration
import androidx.compose.ui.unit.LayoutDirection
import java.util.Locale

object LanguageManager {
    
    fun getDeviceLanguage(context: Context): String {
        return try {
            val locale = context.resources.configuration.locales[0]
            locale.language
        } catch (e: Exception) {
            "ar" // Default to Arabic
        }
    }
    
    fun getDeviceLocale(context: Context): Locale {
        return try {
            context.resources.configuration.locales[0]
        } catch (e: Exception) {
            Locale("ar") // Default to Arabic locale
        }
    }
    
    fun isRTL(context: Context): Boolean {
        val selectedLanguage = getSelectedLanguage(context)
        return selectedLanguage == "ar"
    }
    
    fun getLayoutDirection(context: Context): LayoutDirection {
        return if (isRTL(context)) {
            LayoutDirection.Rtl
        } else {
            LayoutDirection.Ltr
        }
    }
    
    fun getSupportedLanguage(context: Context): String {
        val deviceLanguage = getDeviceLanguage(context)
        return when (deviceLanguage) {
            "ar" -> "ar" // Arabic
            "en" -> "en" // English
            else -> "ar" // Default to Arabic for unsupported languages
        }
    }
    
    fun isArabic(context: Context): Boolean {
        return getSupportedLanguage(context) == "ar"
    }
    
    fun isEnglish(context: Context): Boolean {
        return getSupportedLanguage(context) == "en"
    }
    
    fun toggleLanguage(context: Context) {
        val currentLanguage = getSelectedLanguage(context)
        val newLanguage = if (currentLanguage == "ar") "en" else "ar"
        
        // Save the language preference to SharedPreferences
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("selected_language", newLanguage).apply()
        
        // Restart the activity to apply the new language
        // This will be handled by the calling activity
    }
    
    fun getSelectedLanguage(context: Context): String {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getString("selected_language", getSupportedLanguage(context)) ?: getSupportedLanguage(context)
    }
}
