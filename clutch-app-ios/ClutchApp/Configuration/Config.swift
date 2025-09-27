import Foundation

struct Config {
    // MARK: - API Configuration
    static let apiBaseURL = "https://api.clutch.com/v1"
    static let apiTimeout: TimeInterval = 30.0
    
    // MARK: - App Configuration
    static let appName = "Clutch"
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    
    // MARK: - Feature Flags
    static let enableAnalytics = true
    static let enableCrashReporting = true
    static let enablePushNotifications = true
    static let enableOfflineMode = true
    
    // MARK: - UI Configuration
    static let defaultAnimationDuration: Double = 0.3
    static let maxRetryAttempts = 3
    static let cacheExpirationTime: TimeInterval = 300 // 5 minutes
    
    // MARK: - Security Configuration
    static let tokenRefreshThreshold: TimeInterval = 300 // 5 minutes before expiry
    static let maxLoginAttempts = 5
    static let lockoutDuration: TimeInterval = 900 // 15 minutes
    
    // MARK: - Environment Detection
    static var isDebug: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    static var isRelease: Bool {
        return !isDebug
    }
    
    // MARK: - API Endpoints
    struct Endpoints {
        static let auth = "/auth"
        static let users = "/users"
        static let cars = "/cars"
        static let maintenance = "/maintenance"
        static let services = "/services"
        static let parts = "/parts"
        static let orders = "/orders"
        static let community = "/community"
        static let loyalty = "/loyalty"
        static let payments = "/payments"
    }
    
    // MARK: - User Defaults Keys
    struct UserDefaultsKeys {
        static let authToken = "auth_token"
        static let refreshToken = "refresh_token"
        static let userData = "user_data"
        static let lastSyncDate = "last_sync_date"
        static let onboardingCompleted = "onboarding_completed"
        static let biometricEnabled = "biometric_enabled"
        static let themePreference = "theme_preference"
        static let languagePreference = "language_preference"
    }
    
    // MARK: - Notification Names
    struct NotificationNames {
        static let userDidLogin = Notification.Name("userDidLogin")
        static let userDidLogout = Notification.Name("userDidLogout")
        static let carHealthUpdated = Notification.Name("carHealthUpdated")
        static let maintenanceReminder = Notification.Name("maintenanceReminder")
        static let orderStatusChanged = Notification.Name("orderStatusChanged")
        static let networkStatusChanged = Notification.Name("networkStatusChanged")
    }
    
    // MARK: - Error Messages
    struct ErrorMessages {
        static let networkError = "Network connection error. Please check your internet connection."
        static let serverError = "Server error. Please try again later."
        static let authenticationError = "Authentication failed. Please sign in again."
        static let validationError = "Please check your input and try again."
        static let unknownError = "An unexpected error occurred. Please try again."
    }
    
    // MARK: - Success Messages
    struct SuccessMessages {
        static let loginSuccess = "Welcome back!"
        static let signupSuccess = "Account created successfully!"
        static let passwordResetSuccess = "Password reset code sent!"
        static let profileUpdated = "Profile updated successfully!"
        static let carAdded = "Car added successfully!"
        static let serviceBooked = "Service booked successfully!"
        static let orderPlaced = "Order placed successfully!"
    }
}
