package com.clutch.partners.ui.theme

import android.content.Context
import android.content.res.Configuration
import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import java.util.*

enum class AppLanguage(val code: String, val displayName: String, val isRTL: Boolean) {
    ARABIC("ar", "العربية", true),
    ENGLISH("en", "English", false);
    
    companion object {
        fun fromCode(code: String): AppLanguage {
            return values().find { it.code == code } ?: ENGLISH
        }
    }
}

class LanguageManager(private val context: Context) {
    private var _currentLanguage by mutableStateOf(AppLanguage.ENGLISH)
    val currentLanguage: AppLanguage get() = _currentLanguage
    
    fun setLanguage(language: AppLanguage) {
        _currentLanguage = language
        updateLocale(language)
    }
    
    private fun updateLocale(language: AppLanguage) {
        val locale = Locale(language.code)
        Locale.setDefault(locale)
        
        val config = Configuration(context.resources.configuration)
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
            context.resources.updateConfiguration(config, context.resources.displayMetrics)
        }
    }
    
    fun isRTL(): Boolean = currentLanguage.isRTL
}

val LocalLanguageManager = staticCompositionLocalOf<LanguageManager> {
    error("No LanguageManager provided")
}

@Composable
fun rememberLanguageManager(): LanguageManager {
    val context = LocalContext.current
    return remember { LanguageManager(context) }
}

@Composable
fun isRTL(): Boolean {
    val languageManager = LocalLanguageManager.current
    return languageManager.isRTL()
}
