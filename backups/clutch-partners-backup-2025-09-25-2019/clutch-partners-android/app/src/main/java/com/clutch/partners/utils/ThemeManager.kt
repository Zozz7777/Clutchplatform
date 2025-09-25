package com.clutch.partners.utils

import android.content.Context
import android.content.res.Configuration

object ThemeManager {
    
    fun isSystemDarkTheme(context: Context): Boolean {
        return try {
            val nightModeFlags = context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
            nightModeFlags == Configuration.UI_MODE_NIGHT_YES
        } catch (e: Exception) {
            false // Default to light theme if detection fails
        }
    }
    
    fun getThemeMode(context: Context): String {
        return if (isSystemDarkTheme(context)) {
            "dark"
        } else {
            "light"
        }
    }
}
