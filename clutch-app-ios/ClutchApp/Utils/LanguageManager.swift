import Foundation
import SwiftUI

class LanguageManager: ObservableObject {
    @Published var currentLanguage: String
    
    private let userDefaults = UserDefaults.standard
    private let languageKey = "selected_language"
    
    init() {
        self.currentLanguage = userDefaults.string(forKey: languageKey) ?? "en"
    }
    
    func setLanguage(_ language: String) {
        currentLanguage = language
        userDefaults.set(language, forKey: languageKey)
    }
    
    func localizedString(_ key: String) -> String {
        switch currentLanguage {
        case "ar":
            return getArabicString(key)
        default:
            return getEnglishString(key)
        }
    }
    
    private func getEnglishString(_ key: String) -> String {
        switch key {
        // Common
        case "app_name": return "Clutch"
        case "app_tagline": return "Your Car's Best Friend"
        case "loading": return "Loading..."
        case "error": return "Error"
        case "success": return "Success"
        case "cancel": return "Cancel"
        case "save": return "Save"
        case "delete": return "Delete"
        case "edit": return "Edit"
        case "done": return "Done"
        case "next": return "Next"
        case "previous": return "Previous"
        case "skip": return "Skip"
        case "get_started": return "Get Started"
        
        // Authentication
        case "login": return "Login"
        case "register": return "Register"
        case "logout": return "Logout"
        case "email": return "Email"
        case "password": return "Password"
        case "confirm_password": return "Confirm Password"
        case "name": return "Name"
        case "phone": return "Phone"
        case "forgot_password": return "Forgot Password?"
        case "sign_in_with_google": return "Sign in with Google"
        case "sign_in_with_apple": return "Sign in with Apple"
        case "sign_in_with_facebook": return "Sign in with Facebook"
        case "already_have_account": return "Already have an account?"
        case "dont_have_account": return "Don't have an account?"
        
        // Dashboard
        case "dashboard": return "Dashboard"
        case "good_morning": return "Good morning!"
        case "good_afternoon": return "Good afternoon!"
        case "good_evening": return "Good evening!"
        case "car_health_score": return "Car Health Score"
        case "view_details": return "View Details"
        case "overall": return "Overall"
        case "battery": return "Battery"
        case "tires": return "Tires"
        case "engine": return "Engine"
        case "fluids": return "Fluids"
        case "brakes": return "Brakes"
        case "quick_actions": return "Quick Actions"
        case "book_service": return "Book Service"
        case "order_parts": return "Order Parts"
        case "maintenance": return "Maintenance"
        case "emergency": return "Emergency"
        case "loyalty_points": return "Loyalty Points"
        case "view_rewards": return "View Rewards"
        case "active_orders": return "Active Orders"
        case "community_highlights": return "Community Highlights"
        case "view_all": return "View All"
        
        // Car Health
        case "car_health": return "Car Health"
        case "health_recommendations": return "Health Recommendations"
        case "priority": return "Priority"
        case "low": return "Low"
        case "medium": return "Medium"
        case "high": return "High"
        case "critical": return "Critical"
        case "estimated_cost": return "Estimated Cost"
        case "estimated_time": return "Estimated Time"
        
        // Community
        case "community": return "Community"
        case "tips": return "Tips"
        case "reviews": return "Reviews"
        case "create_tip": return "Create Tip"
        case "create_review": return "Create Review"
        case "title": return "Title"
        case "content": return "Content"
        case "category": return "Category"
        case "tags": return "Tags"
        case "rating": return "Rating"
        case "vote": return "Vote"
        case "comment": return "Comment"
        case "share": return "Share"
        case "leaderboard": return "Leaderboard"
        case "top_contributors": return "Top Contributors"
        case "top_tip_creators": return "Top Tip Creators"
        case "top_reviewers": return "Top Reviewers"
        
        // Loyalty
        case "loyalty": return "Loyalty"
        case "points": return "Points"
        case "tier": return "Tier"
        case "bronze": return "Bronze"
        case "silver": return "Silver"
        case "gold": return "Gold"
        case "platinum": return "Platinum"
        case "badges": return "Badges"
        case "rewards": return "Rewards"
        case "redeem": return "Redeem"
        case "earned": return "Earned"
        case "redeemed": return "Redeemed"
        case "expiring_soon": return "Expiring Soon"
        case "first_order": return "First Order"
        case "loyal_owner": return "Loyal Owner"
        case "power_user": return "Power User"
        case "community_starter": return "Community Starter"
        case "review_master": return "Review Master"
        
        // Profile
        case "profile": return "Profile"
        case "settings": return "Settings"
        case "my_cars": return "My Cars"
        case "add_car": return "Add Car"
        case "edit_profile": return "Edit Profile"
        case "notifications": return "Notifications"
        case "privacy": return "Privacy"
        case "language": return "Language"
        case "theme": return "Theme"
        case "light_theme": return "Light Theme"
        case "dark_theme": return "Dark Theme"
        case "system_theme": return "System Theme"
        case "english": return "English"
        case "arabic": return "العربية"
        
        // Onboarding
        case "check_car_health": return "Check Car Health Instantly"
        case "check_car_health_desc": return "Get real-time insights about your car's condition with our advanced diagnostics"
        case "book_services_parts": return "Book Services & Buy Parts Easily"
        case "book_services_parts_desc": return "Find trusted mechanics and order genuine parts with just a few taps"
        case "earn_rewards": return "Earn Rewards While Driving"
        case "earn_rewards_desc": return "Get points for every service, review, and tip you share with the community"
        
        default: return key
        }
    }
    
    private func getArabicString(_ key: String) -> String {
        switch key {
        // Common
        case "app_name": return "كلتش"
        case "app_tagline": return "أفضل صديق لسيارتك"
        case "loading": return "جاري التحميل..."
        case "error": return "خطأ"
        case "success": return "نجح"
        case "cancel": return "إلغاء"
        case "save": return "حفظ"
        case "delete": return "حذف"
        case "edit": return "تعديل"
        case "done": return "تم"
        case "next": return "التالي"
        case "previous": return "السابق"
        case "skip": return "تخطي"
        case "get_started": return "ابدأ الآن"
        
        // Authentication
        case "login": return "تسجيل الدخول"
        case "register": return "إنشاء حساب"
        case "logout": return "تسجيل الخروج"
        case "email": return "البريد الإلكتروني"
        case "password": return "كلمة المرور"
        case "confirm_password": return "تأكيد كلمة المرور"
        case "name": return "الاسم"
        case "phone": return "الهاتف"
        case "forgot_password": return "نسيت كلمة المرور؟"
        case "sign_in_with_google": return "تسجيل الدخول بجوجل"
        case "sign_in_with_apple": return "تسجيل الدخول بآبل"
        case "sign_in_with_facebook": return "تسجيل الدخول بفيسبوك"
        case "already_have_account": return "لديك حساب بالفعل؟"
        case "dont_have_account": return "ليس لديك حساب؟"
        
        // Dashboard
        case "dashboard": return "لوحة التحكم"
        case "good_morning": return "صباح الخير!"
        case "good_afternoon": return "مساء الخير!"
        case "good_evening": return "مساء الخير!"
        case "car_health_score": return "درجة صحة السيارة"
        case "view_details": return "عرض التفاصيل"
        case "overall": return "الإجمالي"
        case "battery": return "البطارية"
        case "tires": return "الإطارات"
        case "engine": return "المحرك"
        case "fluids": return "السوائل"
        case "brakes": return "الفرامل"
        case "quick_actions": return "الإجراءات السريعة"
        case "book_service": return "حجز خدمة"
        case "order_parts": return "طلب قطع غيار"
        case "maintenance": return "الصيانة"
        case "emergency": return "الطوارئ"
        case "loyalty_points": return "نقاط الولاء"
        case "view_rewards": return "عرض المكافآت"
        case "active_orders": return "الطلبات النشطة"
        case "community_highlights": return "أبرز المجتمع"
        case "view_all": return "عرض الكل"
        
        // Car Health
        case "car_health": return "صحة السيارة"
        case "health_recommendations": return "توصيات الصحة"
        case "priority": return "الأولوية"
        case "low": return "منخفضة"
        case "medium": return "متوسطة"
        case "high": return "عالية"
        case "critical": return "حرجة"
        case "estimated_cost": return "التكلفة المقدرة"
        case "estimated_time": return "الوقت المقدر"
        
        // Community
        case "community": return "المجتمع"
        case "tips": return "النصائح"
        case "reviews": return "التقييمات"
        case "create_tip": return "إنشاء نصيحة"
        case "create_review": return "إنشاء تقييم"
        case "title": return "العنوان"
        case "content": return "المحتوى"
        case "category": return "الفئة"
        case "tags": return "العلامات"
        case "rating": return "التقييم"
        case "vote": return "التصويت"
        case "comment": return "تعليق"
        case "share": return "مشاركة"
        case "leaderboard": return "لوحة المتصدرين"
        case "top_contributors": return "أفضل المساهمين"
        case "top_tip_creators": return "أفضل منشئي النصائح"
        case "top_reviewers": return "أفضل المقيّمين"
        
        // Loyalty
        case "loyalty": return "الولاء"
        case "points": return "النقاط"
        case "tier": return "المستوى"
        case "bronze": return "برونزي"
        case "silver": return "فضي"
        case "gold": return "ذهبي"
        case "platinum": return "بلاتيني"
        case "badges": return "الشارات"
        case "rewards": return "المكافآت"
        case "redeem": return "استرداد"
        case "earned": return "مكتسب"
        case "redeemed": return "مسترد"
        case "expiring_soon": return "ينتهي قريباً"
        case "first_order": return "الطلب الأول"
        case "loyal_owner": return "مالك مخلص"
        case "power_user": return "مستخدم قوي"
        case "community_starter": return "مبادر المجتمع"
        case "review_master": return "سيد التقييم"
        
        // Profile
        case "profile": return "الملف الشخصي"
        case "settings": return "الإعدادات"
        case "my_cars": return "سياراتي"
        case "add_car": return "إضافة سيارة"
        case "edit_profile": return "تعديل الملف الشخصي"
        case "notifications": return "الإشعارات"
        case "privacy": return "الخصوصية"
        case "language": return "اللغة"
        case "theme": return "المظهر"
        case "light_theme": return "المظهر الفاتح"
        case "dark_theme": return "المظهر الداكن"
        case "system_theme": return "مظهر النظام"
        case "english": return "English"
        case "arabic": return "العربية"
        
        // Onboarding
        case "check_car_health": return "تحقق من صحة السيارة فوراً"
        case "check_car_health_desc": return "احصل على رؤى فورية حول حالة سيارتك مع تشخيصاتنا المتقدمة"
        case "book_services_parts": return "احجز الخدمات واشتر القطع بسهولة"
        case "book_services_parts_desc": return "اعثر على ميكانيكيين موثوقين واطلب قطع غيار أصلية بضغطة واحدة"
        case "earn_rewards": return "اكسب مكافآت أثناء القيادة"
        case "earn_rewards_desc": return "احصل على نقاط لكل خدمة وتقييم ونصيحة تشاركها مع المجتمع"
        
        default: return key
        }
    }
}

extension LanguageManager {
    static let shared = LanguageManager()
}
