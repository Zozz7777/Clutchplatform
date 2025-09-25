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
        val locale = getDeviceLocale(context)
        // Check if the locale is RTL by checking the language code
        return locale.language in listOf("ar", "he", "fa", "ur", "ps", "sd", "ku", "dv")
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
}
