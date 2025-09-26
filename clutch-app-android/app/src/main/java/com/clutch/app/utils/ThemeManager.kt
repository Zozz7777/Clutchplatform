package com.clutch.app.utils

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

object ThemeManager {
    private const val PREF_THEME = "pref_theme"
    private const val THEME_LIGHT = "light"
    private const val THEME_DARK = "dark"
    private const val THEME_AUTO = "auto"

    var isDarkTheme by mutableStateOf(false)
        private set

    fun initializeTheme(context: Context) {
        val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
        val theme = prefs.getString(PREF_THEME, THEME_AUTO) ?: THEME_AUTO
        
        when (theme) {
            THEME_LIGHT -> isDarkTheme = false
            THEME_DARK -> isDarkTheme = true
            THEME_AUTO -> {
                // Use system theme
                val nightModeFlags = context.resources.configuration.uiMode and 
                    android.content.res.Configuration.UI_MODE_NIGHT_MASK
                isDarkTheme = nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES
            }
        }
    }

    fun setTheme(context: Context, theme: String) {
        val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(PREF_THEME, theme).apply()
        
        when (theme) {
            THEME_LIGHT -> isDarkTheme = false
            THEME_DARK -> isDarkTheme = true
            THEME_AUTO -> {
                val nightModeFlags = context.resources.configuration.uiMode and 
                    android.content.res.Configuration.UI_MODE_NIGHT_MASK
                isDarkTheme = nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES
            }
        }
    }

    fun getCurrentTheme(context: Context): String {
        val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
        return prefs.getString(PREF_THEME, THEME_AUTO) ?: THEME_AUTO
    }
}
