package com.clutch.partners.ui.theme

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext

enum class AppTheme(val displayName: String) {
    LIGHT("Light"),
    DARK("Dark"),
    AUTO("Auto");
    
    companion object {
        fun fromString(value: String): AppTheme {
            return values().find { it.name.equals(value, ignoreCase = true) } ?: AUTO
        }
    }
}

class ThemeManager(private val context: Context) {
    private var _currentTheme by mutableStateOf(AppTheme.AUTO)
    val currentTheme: AppTheme get() = _currentTheme
    
    fun setTheme(theme: AppTheme) {
        _currentTheme = theme
    }
    
    fun isDarkTheme(): Boolean {
        return when (_currentTheme) {
            AppTheme.LIGHT -> false
            AppTheme.DARK -> true
            AppTheme.AUTO -> isSystemDarkTheme()
        }
    }
    
    private fun isSystemDarkTheme(): Boolean {
        val nightModeFlags = context.resources.configuration.uiMode and 
            android.content.res.Configuration.UI_MODE_NIGHT_MASK
        return nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES
    }
}

val LocalThemeManager = staticCompositionLocalOf<ThemeManager> {
    error("No ThemeManager provided")
}

@Composable
fun rememberThemeManager(): ThemeManager {
    val context = LocalContext.current
    return remember { ThemeManager(context) }
}

@Composable
fun isDarkTheme(): Boolean {
    val themeManager = LocalThemeManager.current
    return themeManager.isDarkTheme()
}
