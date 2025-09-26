import Foundation

struct User: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let profilePicture: String?
    let language: String
    let theme: String
    let isEmailVerified: Bool
    let isPhoneVerified: Bool
    let createdAt: String
    let updatedAt: String
    let preferences: UserPreferences?
}

struct UserPreferences: Codable {
    let notifications: NotificationPreferences
    let privacy: PrivacyPreferences
    let language: String
    let theme: String
}

struct NotificationPreferences: Codable {
    let pushNotifications: Bool
    let emailNotifications: Bool
    let smsNotifications: Bool
    let maintenanceReminders: Bool
    let orderUpdates: Bool
    let communityUpdates: Bool
    let loyaltyUpdates: Bool
}

struct PrivacyPreferences: Codable {
    let shareLocation: Bool
    let shareData: Bool
    let analytics: Bool
}

// MARK: - Auth Models
struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let name: String
    let email: String
    let password: String
    let phone: String?
}

struct AuthResponse: Codable {
    let success: Bool
    let data: AuthData
    let message: String
}

struct AuthData: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
}
