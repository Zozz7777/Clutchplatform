package com.clutch.app.utils

import android.content.Context
import android.content.res.Configuration
import android.os.Build
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import java.util.*

class LanguageManager(private val context: Context) {
    private val prefs = context.getSharedPreferences("clutch_prefs", Context.MODE_PRIVATE)
    
    var currentLanguage by mutableStateOf(getStoredLanguage())
        private set
    
    fun setLanguage(language: String) {
        currentLanguage = language
        prefs.edit().putString("language", language).apply()
        updateLocale(language)
    }
    
    fun getStoredLanguage(): String {
        return prefs.getString("language", "en") ?: "en"
    }
    
    fun localizedString(key: String): String {
        return when (currentLanguage) {
            "ar" -> getArabicString(key)
            else -> getEnglishString(key)
        }
    }
    
    private fun updateLocale(language: String) {
        val locale = Locale(language)
        Locale.setDefault(locale)
        
        val config = Configuration(context.resources.configuration)
        config.setLocale(locale)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            context.createConfigurationContext(config)
        } else {
            @Suppress("DEPRECATION")
            context.resources.updateConfiguration(config, context.resources.displayMetrics)
        }
    }
    
    private fun getEnglishString(key: String): String {
        return when (key) {
            // Common
            "app_name" -> "Clutch"
            "app_tagline" -> "Your Car's Best Friend"
            "loading" -> "Loading..."
            "error" -> "Error"
            "success" -> "Success"
            "cancel" -> "Cancel"
            "save" -> "Save"
            "delete" -> "Delete"
            "edit" -> "Edit"
            "done" -> "Done"
            "next" -> "Next"
            "previous" -> "Previous"
            "skip" -> "Skip"
            "get_started" -> "Get Started"
            
            // Authentication
            "login" -> "Login"
            "register" -> "Register"
            "logout" -> "Logout"
            "email" -> "Email"
            "password" -> "Password"
            "confirm_password" -> "Confirm Password"
            "name" -> "Name"
            "phone" -> "Phone"
            "forgot_password" -> "Forgot Password?"
            "sign_in_with_google" -> "Sign in with Google"
            "sign_in_with_apple" -> "Sign in with Apple"
            "sign_in_with_facebook" -> "Sign in with Facebook"
            "already_have_account" -> "Already have an account?"
            "dont_have_account" -> "Don't have an account?"
            
            // Dashboard
            "dashboard" -> "Dashboard"
            "good_morning" -> "Good morning!"
            "good_afternoon" -> "Good afternoon!"
            "good_evening" -> "Good evening!"
            "car_health_score" -> "Car Health Score"
            "view_details" -> "View Details"
            "overall" -> "Overall"
            "battery" -> "Battery"
            "tires" -> "Tires"
            "engine" -> "Engine"
            "fluids" -> "Fluids"
            "brakes" -> "Brakes"
            "quick_actions" -> "Quick Actions"
            "book_service" -> "Book Service"
            "order_parts" -> "Order Parts"
            "maintenance" -> "Maintenance"
            "emergency" -> "Emergency"
            "loyalty_points" -> "Loyalty Points"
            "view_rewards" -> "View Rewards"
            "active_orders" -> "Active Orders"
            "community_highlights" -> "Community Highlights"
            "view_all" -> "View All"
            
            // Car Health
            "car_health" -> "Car Health"
            "health_recommendations" -> "Health Recommendations"
            "priority" -> "Priority"
            "low" -> "Low"
            "medium" -> "Medium"
            "high" -> "High"
            "critical" -> "Critical"
            "estimated_cost" -> "Estimated Cost"
            "estimated_time" -> "Estimated Time"
            
            // Community
            "community" -> "Community"
            "tips" -> "Tips"
            "reviews" -> "Reviews"
            "create_tip" -> "Create Tip"
            "create_review" -> "Create Review"
            "title" -> "Title"
            "content" -> "Content"
            "category" -> "Category"
            "tags" -> "Tags"
            "rating" -> "Rating"
            "vote" -> "Vote"
            "comment" -> "Comment"
            "share" -> "Share"
            "leaderboard" -> "Leaderboard"
            "top_contributors" -> "Top Contributors"
            "top_tip_creators" -> "Top Tip Creators"
            "top_reviewers" -> "Top Reviewers"
            
            // Loyalty
            "loyalty" -> "Loyalty"
            "points" -> "Points"
            "tier" -> "Tier"
            "bronze" -> "Bronze"
            "silver" -> "Silver"
            "gold" -> "Gold"
            "platinum" -> "Platinum"
            "badges" -> "Badges"
            "rewards" -> "Rewards"
            "redeem" -> "Redeem"
            "earned" -> "Earned"
            "redeemed" -> "Redeemed"
            "expiring_soon" -> "Expiring Soon"
            "first_order" -> "First Order"
            "loyal_owner" -> "Loyal Owner"
            "power_user" -> "Power User"
            "community_starter" -> "Community Starter"
            "review_master" -> "Review Master"
            
            // Profile
            "profile" -> "Profile"
            "settings" -> "Settings"
            "my_cars" -> "My Cars"
            "add_car" -> "Add Car"
            "edit_profile" -> "Edit Profile"
            "notifications" -> "Notifications"
            "privacy" -> "Privacy"
            "language" -> "Language"
            "theme" -> "Theme"
            "light_theme" -> "Light Theme"
            "dark_theme" -> "Dark Theme"
            "system_theme" -> "System Theme"
            "english" -> "English"
            "arabic" -> "العربية"
            
            // Onboarding
            "check_car_health" -> "Check Car Health Instantly"
            "check_car_health_desc" -> "Get real-time insights about your car's condition with our advanced diagnostics"
            "book_services_parts" -> "Book Services & Buy Parts Easily"
            "book_services_parts_desc" -> "Find trusted mechanics and order genuine parts with just a few taps"
            "earn_rewards" -> "Earn Rewards While Driving"
            "earn_rewards_desc" -> "Get points for every service, review, and tip you share with the community"
            
            else -> key
        }
    }
    
    private fun getArabicString(key: String): String {
        return when (key) {
            // Common
            "app_name" -> "كلتش"
            "app_tagline" -> "أفضل صديق لسيارتك"
            "loading" -> "جاري التحميل..."
            "error" -> "خطأ"
            "success" -> "نجح"
            "cancel" -> "إلغاء"
            "save" -> "حفظ"
            "delete" -> "حذف"
            "edit" -> "تعديل"
            "done" -> "تم"
            "next" -> "التالي"
            "previous" -> "السابق"
            "skip" -> "تخطي"
            "get_started" -> "ابدأ الآن"
            
            // Authentication
            "login" -> "تسجيل الدخول"
            "register" -> "إنشاء حساب"
            "logout" -> "تسجيل الخروج"
            "email" -> "البريد الإلكتروني"
            "password" -> "كلمة المرور"
            "confirm_password" -> "تأكيد كلمة المرور"
            "name" -> "الاسم"
            "phone" -> "الهاتف"
            "forgot_password" -> "نسيت كلمة المرور؟"
            "sign_in_with_google" -> "تسجيل الدخول بجوجل"
            "sign_in_with_apple" -> "تسجيل الدخول بآبل"
            "sign_in_with_facebook" -> "تسجيل الدخول بفيسبوك"
            "already_have_account" -> "لديك حساب بالفعل؟"
            "dont_have_account" -> "ليس لديك حساب؟"
            
            // Dashboard
            "dashboard" -> "لوحة التحكم"
            "good_morning" -> "صباح الخير!"
            "good_afternoon" -> "مساء الخير!"
            "good_evening" -> "مساء الخير!"
            "car_health_score" -> "درجة صحة السيارة"
            "view_details" -> "عرض التفاصيل"
            "overall" -> "الإجمالي"
            "battery" -> "البطارية"
            "tires" -> "الإطارات"
            "engine" -> "المحرك"
            "fluids" -> "السوائل"
            "brakes" -> "الفرامل"
            "quick_actions" -> "الإجراءات السريعة"
            "book_service" -> "حجز خدمة"
            "order_parts" -> "طلب قطع غيار"
            "maintenance" -> "الصيانة"
            "emergency" -> "الطوارئ"
            "loyalty_points" -> "نقاط الولاء"
            "view_rewards" -> "عرض المكافآت"
            "active_orders" -> "الطلبات النشطة"
            "community_highlights" -> "أبرز المجتمع"
            "view_all" -> "عرض الكل"
            
            // Car Health
            "car_health" -> "صحة السيارة"
            "health_recommendations" -> "توصيات الصحة"
            "priority" -> "الأولوية"
            "low" -> "منخفضة"
            "medium" -> "متوسطة"
            "high" -> "عالية"
            "critical" -> "حرجة"
            "estimated_cost" -> "التكلفة المقدرة"
            "estimated_time" -> "الوقت المقدر"
            
            // Community
            "community" -> "المجتمع"
            "tips" -> "النصائح"
            "reviews" -> "التقييمات"
            "create_tip" -> "إنشاء نصيحة"
            "create_review" -> "إنشاء تقييم"
            "title" -> "العنوان"
            "content" -> "المحتوى"
            "category" -> "الفئة"
            "tags" -> "العلامات"
            "rating" -> "التقييم"
            "vote" -> "التصويت"
            "comment" -> "تعليق"
            "share" -> "مشاركة"
            "leaderboard" -> "لوحة المتصدرين"
            "top_contributors" -> "أفضل المساهمين"
            "top_tip_creators" -> "أفضل منشئي النصائح"
            "top_reviewers" -> "أفضل المقيّمين"
            
            // Loyalty
            "loyalty" -> "الولاء"
            "points" -> "النقاط"
            "tier" -> "المستوى"
            "bronze" -> "برونزي"
            "silver" -> "فضي"
            "gold" -> "ذهبي"
            "platinum" -> "بلاتيني"
            "badges" -> "الشارات"
            "rewards" -> "المكافآت"
            "redeem" -> "استرداد"
            "earned" -> "مكتسب"
            "redeemed" -> "مسترد"
            "expiring_soon" -> "ينتهي قريباً"
            "first_order" -> "الطلب الأول"
            "loyal_owner" -> "مالك مخلص"
            "power_user" -> "مستخدم قوي"
            "community_starter" -> "مبادر المجتمع"
            "review_master" -> "سيد التقييم"
            
            // Profile
            "profile" -> "الملف الشخصي"
            "settings" -> "الإعدادات"
            "my_cars" -> "سياراتي"
            "add_car" -> "إضافة سيارة"
            "edit_profile" -> "تعديل الملف الشخصي"
            "notifications" -> "الإشعارات"
            "privacy" -> "الخصوصية"
            "language" -> "اللغة"
            "theme" -> "المظهر"
            "light_theme" -> "المظهر الفاتح"
            "dark_theme" -> "المظهر الداكن"
            "system_theme" -> "مظهر النظام"
            "english" -> "English"
            "arabic" -> "العربية"
            
            // Onboarding
            "check_car_health" -> "تحقق من صحة السيارة فوراً"
            "check_car_health_desc" -> "احصل على رؤى فورية حول حالة سيارتك مع تشخيصاتنا المتقدمة"
            "book_services_parts" -> "احجز الخدمات واشتر القطع بسهولة"
            "book_services_parts_desc" -> "اعثر على ميكانيكيين موثوقين واطلب قطع غيار أصلية بضغطة واحدة"
            "earn_rewards" -> "اكسب مكافآت أثناء القيادة"
            "earn_rewards_desc" -> "احصل على نقاط لكل خدمة وتقييم ونصيحة تشاركها مع المجتمع"
            
            else -> key
        }
    }
}

// Composition Local for Language Manager
val LocalLanguageManager = staticCompositionLocalOf<LanguageManager> {
    error("No LanguageManager provided")
}

@Composable
fun rememberLanguageManager(context: Context): LanguageManager {
    return remember { LanguageManager(context) }
}
