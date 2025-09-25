package com.clutch.partners.utils

import android.content.Context
import androidx.activity.ComponentActivity

object ThemeManager {
    private const val THEME_PREF_KEY = "selected_theme"
    private const val LIGHT_THEME = "light"
    private const val DARK_THEME = "dark"
    
    fun getSelectedTheme(context: Context): String {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getString(THEME_PREF_KEY, LIGHT_THEME) ?: LIGHT_THEME
    }
    
    fun isDarkTheme(context: Context): Boolean {
        return getSelectedTheme(context) == DARK_THEME
    }
    
    fun toggleTheme(context: Context) {
        val currentTheme = getSelectedTheme(context)
        val newTheme = if (currentTheme == LIGHT_THEME) DARK_THEME else LIGHT_THEME
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(THEME_PREF_KEY, newTheme).apply()
    }
    
    fun setTheme(context: Context, theme: String) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(THEME_PREF_KEY, theme).apply()
    }
}