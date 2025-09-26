package com.clutch.app.utils

import android.content.Context
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import java.util.*

object LanguageManager {
    private const val PREF_LANGUAGE = "pref_language"
    private const val ENGLISH = "en"
    private const val ARABIC = "ar"

    fun setLanguage(context: Context, language: String) {
        val locale = Locale(language)
        Locale.setDefault(locale)
        
        val config = Configuration(context.resources.configuration)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocale(locale)
        } else {
            @Suppress("DEPRECATION")
            config.locale = locale
        }
        
        context.resources.updateConfiguration(config, context.resources.displayMetrics)
        
        // Save preference
        val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(PREF_LANGUAGE, language).apply()
    }

    fun getCurrentLanguage(context: Context): String {
        val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
        return prefs.getString(PREF_LANGUAGE, ENGLISH) ?: ENGLISH
    }

    fun isRTL(context: Context): Boolean {
        return getCurrentLanguage(context) == ARABIC
    }
}

// Translation strings
object Strings {
    // App
    const val APP_NAME = "Clutch"
    const val APP_SLOGAN = "Your Car's Best Friend"
    
    // Splash
    const val LOADING = "Loading..."
    
    // Onboarding
    const val ONBOARDING_TITLE_1 = "Check Car Health Instantly"
    const val ONBOARDING_DESC_1 = "Get real-time insights about your car's condition with our advanced OBD integration"
    const val ONBOARDING_TITLE_2 = "Book Services & Buy Parts Easily"
    const val ONBOARDING_DESC_2 = "Find trusted mechanics and order genuine parts with just a few taps"
    const val ONBOARDING_TITLE_3 = "Earn Rewards While Driving"
    const val ONBOARDING_DESC_3 = "Earn loyalty points and unlock badges for every service and purchase"
    const val GET_STARTED = "Get Started"
    const val SKIP = "Skip"
    
    // Auth
    const val WELCOME_BACK = "Welcome Back"
    const val SIGN_IN_TO_CONTINUE = "Sign in to continue"
    const val EMAIL = "Email"
    const val PASSWORD = "Password"
    const val FORGOT_PASSWORD = "Forgot Password?"
    const val SIGN_IN = "Sign In"
    const val DONT_HAVE_ACCOUNT = "Don't have an account?"
    const val SIGN_UP = "Sign Up"
    const val OR_CONTINUE_WITH = "Or continue with"
    const val GOOGLE = "Google"
    const val FACEBOOK = "Facebook"
    const val APPLE = "Apple"
    
    // Dashboard
    const val WELCOME = "Welcome"
    const val CAR_HEALTH = "Car Health"
    const val HEALTH_SCORE = "Health Score"
    const val BATTERY = "Battery"
    const val TIRES = "Tires"
    const val ENGINE = "Engine"
    const val FLUIDS = "Fluids"
    const val BRAKES = "Brakes"
    const val QUICK_ACTIONS = "Quick Actions"
    const val BOOK_SERVICE = "Book Service"
    const val ORDER_PARTS = "Order Parts"
    const val COMMUNITY = "Community"
    const val LOYALTY = "Loyalty"
    const val MAINTENANCE_REMINDERS = "Maintenance Reminders"
    const val ACTIVE_ORDERS = "Active Orders"
    const val LOYALTY_POINTS = "Loyalty Points"
    
    // Navigation
    const val HOME = "Home"
    const val PARTS = "Parts"
    const val MAINTENANCE = "Maintenance"
    const val ACCOUNT = "Account"
    
    // Common
    const val VIEW_DETAILS = "View Details"
    const val COMING_SOON = "Coming Soon"
    const val LOADING_DATA = "Loading data..."
    const val ERROR_OCCURRED = "An error occurred"
    const val RETRY = "Retry"
    const val CANCEL = "Cancel"
    const val CONFIRM = "Confirm"
    const val SAVE = "Save"
    const val EDIT = "Edit"
    const val DELETE = "Delete"
    const val SHARE = "Share"
    const val SEARCH = "Search"
    const val FILTER = "Filter"
    const val SORT = "Sort"
    const val REFRESH = "Refresh"
    const val NOTIFICATIONS = "Notifications"
    const val SETTINGS = "Settings"
    const val PROFILE = "Profile"
    const val LOGOUT = "Logout"
    
    // Theme
    const val LIGHT_THEME = "Light Theme"
    const val DARK_THEME = "Dark Theme"
    const val AUTO_THEME = "Auto Theme"
    
    // Language
    const val LANGUAGE = "Language"
    const val ENGLISH_LANG = "English"
    const val ARABIC_LANG = "العربية"
}
