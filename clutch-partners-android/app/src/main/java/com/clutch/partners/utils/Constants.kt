package com.clutch.partners.utils

object Constants {
    // API Endpoints
    const val BASE_URL = "https://api.clutch.com/"
    const val AUTH_SIGNIN = "partners/auth/signin"
    const val AUTH_SIGNUP = "partners/auth/signup"
    const val AUTH_REQUEST_JOIN = "partners/auth/request-to-join"
    const val ORDERS = "partners/orders"
    const val PAYMENTS_WEEKLY = "partners/payments/weekly"
    const val PAYMENTS_HISTORY = "partners/payments/history"
    const val SETTINGS = "partners/settings"
    const val DASHBOARD_REVENUE = "partners/dashboard/revenue"
    const val DASHBOARD_INVENTORY = "partners/dashboard/inventory"
    const val DASHBOARD_ORDERS = "partners/dashboard/orders"
    
    // SharedPreferences Keys
    const val PREFS_NAME = "app_prefs"
    const val KEY_LANGUAGE = "selected_language"
    const val KEY_THEME = "selected_theme"
    const val KEY_AUTH_TOKEN = "auth_token"
    const val KEY_USER_DATA = "user_data"
    const val KEY_IS_LOGGED_IN = "is_logged_in"
    
    // Partner Types
    const val PARTNER_TYPE_REPAIR_CENTER = "repair_center"
    const val PARTNER_TYPE_AUTO_PARTS = "auto_parts_shop"
    const val PARTNER_TYPE_ACCESSORIES = "accessories_shop"
    const val PARTNER_TYPE_IMPORTER = "importer_manufacturer"
    const val PARTNER_TYPE_SERVICE = "service_center"
    
    // Order Status
    const val ORDER_STATUS_PENDING = "Pending"
    const val ORDER_STATUS_PAID = "Paid"
    const val ORDER_STATUS_REJECTED = "Rejected"
    
    // UI Constants
    const val DEFAULT_PADDING = 16
    const val DEFAULT_SPACING = 8
    const val DEFAULT_CORNER_RADIUS = 12
    const val DEFAULT_ELEVATION = 4
    
    // Animation Durations
    const val SPLASH_DURATION = 3000L
    const val ANIMATION_DURATION = 300L
}
