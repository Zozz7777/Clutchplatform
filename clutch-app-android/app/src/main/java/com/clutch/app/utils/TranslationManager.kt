package com.clutch.app.utils

import android.content.Context
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import java.util.*

object TranslationManager {
    private var currentLanguage = "en"
    
    fun initializeLanguage(context: Context) {
        val deviceLanguage = getDeviceLanguage(context)
        setLanguage(context, deviceLanguage)
    }
    
    private fun getDeviceLanguage(context: Context): String {
        val locale = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            context.resources.configuration.locales[0]
        } else {
            @Suppress("DEPRECATION")
            context.resources.configuration.locale
        }
        
        return when (locale.language) {
            "ar" -> "ar"
            else -> "en"
        }
    }
    
    fun setLanguage(context: Context, language: String) {
        currentLanguage = language
        updateLanguage(context, language)
    }
    
    fun getCurrentLanguage(): String = currentLanguage
    
    fun toggleLanguage(context: Context) {
        val newLanguage = if (currentLanguage == "en") "ar" else "en"
        setLanguage(context, newLanguage)
    }
    
    private fun updateLanguage(context: Context, language: String) {
        val locale = Locale(language)
        Locale.setDefault(locale)
        
        val resources: Resources = context.resources
        val config: Configuration = resources.configuration
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocale(locale)
        } else {
            @Suppress("DEPRECATION")
            config.locale = locale
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            context.createConfigurationContext(config)
        } else {
            @Suppress("DEPRECATION")
            resources.updateConfiguration(config, resources.displayMetrics)
        }
    }
    
    fun isRTL(): Boolean = currentLanguage == "ar"
}
