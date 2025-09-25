package com.clutch.partners.utils

import android.content.Context

object TextManager {
    
    fun getText(context: Context, key: String): String {
        val language = LanguageManager.getSupportedLanguage(context)
        return when (language) {
            "ar" -> getArabicText(key)
            "en" -> getEnglishText(key)
            else -> getArabicText(key) // Default to Arabic
        }
    }
    
    private fun getArabicText(key: String): String {
        return when (key) {
            "app_name" -> "شركاء كلاتش"
            "splash_title" -> "شركاء كلاتش"
            "onboarding_manage_title" -> "إدارة متجرك من هاتفك"
            "onboarding_manage_desc" -> "يمكنك الآن إدارة جميع عمليات متجرك بسهولة من خلال تطبيق شركاء كلاتش"
            "onboarding_orders_title" -> "استقبال طلبات كلاتش"
            "onboarding_orders_desc" -> "احصل على طلبات العملاء ومواعيد الصيانة مباشرة من منصة كلاتش"
            "onboarding_earnings_title" -> "تتبع الأرباح والمدفوعات"
            "onboarding_earnings_desc" -> "راقب إيراداتك اليومية والأسبوعية ومواعيد استلام المدفوعات"
            "get_started" -> "ابدأ الآن"
            "choose_shop_type" -> "اختر نوع متجرك"
            "repair_center" -> "مركز إصلاح"
            "auto_parts" -> "متجر قطع غيار"
            "accessories" -> "متجر إكسسوارات"
            "importer" -> "مستورد / مصنع"
            "service_center" -> "مركز خدمة"
            "sign_in" -> "تسجيل الدخول"
            "sign_up" -> "إنشاء حساب جديد"
            "request_join" -> "طلب الانضمام"
            "email_phone" -> "البريد الإلكتروني أو رقم الهاتف"
            "password" -> "كلمة المرور"
            "partner_id" -> "كود الشريك"
            "business_name" -> "اسم المتجر"
            "address" -> "العنوان"
            "owner_name" -> "اسم المالك"
            "phone_number" -> "رقم الهاتف (01xxxxxxxxx)"
            "login_button" -> "تسجيل الدخول"
            "signup_button" -> "إنشاء حساب"
            "request_button" -> "إرسال الطلب"
            "back" -> "رجوع"
            "orders" -> "الطلبات"
            "payments" -> "المدفوعات"
            "business_dashboard" -> "لوحة الأعمال"
            "settings" -> "الإعدادات"
            else -> key
        }
    }
    
    private fun getEnglishText(key: String): String {
        return when (key) {
            "app_name" -> "Clutch Partners"
            "splash_title" -> "Clutch Partners"
            "onboarding_manage_title" -> "Manage Your Store from Your Phone"
            "onboarding_manage_desc" -> "You can now manage all your store operations easily through the Clutch Partners app"
            "onboarding_orders_title" -> "Receive Clutch Orders"
            "onboarding_orders_desc" -> "Get customer orders and maintenance appointments directly from the Clutch platform"
            "onboarding_earnings_title" -> "Track Earnings & Payments"
            "onboarding_earnings_desc" -> "Monitor your daily and weekly revenue and payment collection schedules"
            "get_started" -> "Get Started"
            "choose_shop_type" -> "Choose Your Shop Type"
            "repair_center" -> "Repair Center"
            "auto_parts" -> "Auto Parts Shop"
            "accessories" -> "Accessories Shop"
            "importer" -> "Importer / Manufacturer"
            "service_center" -> "Service Center"
            "sign_in" -> "Sign In"
            "sign_up" -> "Sign Up"
            "request_join" -> "Request to Join"
            "email_phone" -> "Email or Phone Number"
            "password" -> "Password"
            "partner_id" -> "Partner ID"
            "business_name" -> "Business Name"
            "address" -> "Address"
            "owner_name" -> "Owner Name"
            "phone_number" -> "Phone Number (01xxxxxxxxx)"
            "login_button" -> "Sign In"
            "signup_button" -> "Sign Up"
            "request_button" -> "Send Request"
            "back" -> "Back"
            "orders" -> "Orders"
            "payments" -> "Payments"
            "business_dashboard" -> "Business Dashboard"
            "settings" -> "Settings"
            else -> key
        }
    }
}
