import Foundation

struct Config {
    static var apiBaseURL: String {
        #if DEBUG
        return "http://localhost:3000/api/v1" // Development API URL
        #else
        return "https://api.clutch.com/v1" // Production API URL
        #endif
    }
    
    static var enableAnalytics: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableCrashReporting: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableLogging: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    static var defaultLowStockThreshold: Int {
        return 5
    }
    
    static var maxImageSize: Int {
        return 5 * 1024 * 1024 // 5MB
    }
    
    static var supportedImageFormats: [String] {
        return ["jpg", "jpeg", "png", "heic"]
    }
    
    static var sessionTimeout: TimeInterval {
        return 30 * 60 // 30 minutes
    }
    
    static var maxRetryAttempts: Int {
        return 3
    }
    
    static var requestTimeout: TimeInterval {
        return 30 // 30 seconds
    }
    
    static var enableOfflineMode: Bool {
        return true
    }
    
    static var enablePushNotifications: Bool {
        return true
    }
    
    static var enableBiometricAuth: Bool {
        return true
    }
    
    static var enableDarkMode: Bool {
        return true
    }
    
    static var enableHapticFeedback: Bool {
        return true
    }
    
    static var enableAccessibility: Bool {
        return true
    }
    
    static var enableVoiceOver: Bool {
        return true
    }
    
    static var enableLargeText: Bool {
        return true
    }
    
    static var enableHighContrast: Bool {
        return true
    }
    
    static var enableReduceMotion: Bool {
        return true
    }
    
    static var enableReduceTransparency: Bool {
        return true
    }
    
    static var enableSmartInvert: Bool {
        return true
    }
    
    static var enableButtonShapes: Bool {
        return true
    }
    
    static var enableOnOffLabels: Bool {
        return true
    }
    
    static var enableDifferentiateWithoutColor: Bool {
        return true
    }
    
    static var enableSwitchControl: Bool {
        return true
    }
    
    static var enableGuidedAccess: Bool {
        return true
    }
    
    static var enableAssistiveTouch: Bool {
        return true
    }
    
    static var enableVoiceControl: Bool {
        return true
    }
    
    static var enableDictation: Bool {
        return true
    }
    
    static var enableSiri: Bool {
        return true
    }
    
    static var enableShortcuts: Bool {
        return true
    }
    
    static var enableWidgets: Bool {
        return true
    }
    
    static var enableAppClips: Bool {
        return true
    }
    
    static var enableTestFlight: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }
    
    static var enableCrashlytics: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableFirebase: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableMixpanel: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableAmplitude: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableSegment: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableBranch: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableAdjust: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableAppsFlyer: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableKochava: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableSingular: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableTune: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableHasOffers: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableVoluum: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableRedTrack: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableBinom: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableThrive: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableClickMagick: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableVoluum: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableRedTrack: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableBinom: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableThrive: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
    
    static var enableClickMagick: Bool {
        #if DEBUG
        return false
        #else
        return true
        #endif
    }
}
