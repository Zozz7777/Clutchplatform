import Foundation

// MARK: - User Models
struct ClutchUser: Codable, Identifiable {
    let id: String
    let email: String
    let phone: String?
    let firstName: String?
    let lastName: String?
    let name: String?
    let profileImage: String?
    let isEmailVerified: Bool?
    let isPhoneVerified: Bool?
    let createdAt: String?
    let updatedAt: String?
    let role: String?
    let isActive: Bool?
    
    var fullName: String {
        if let name = name, !name.isEmpty {
            return name
        }
        if let firstName = firstName, let lastName = lastName {
            return "\(firstName) \(lastName)"
        }
        return email
    }
    
    var displayName: String {
        return fullName.isEmpty ? email : fullName
    }
}

// MARK: - Car Models
struct ClutchCar: Codable, Identifiable {
    let id: String
    let make: String
    let model: String
    let year: Int
    let licensePlate: String
    let mileage: Int
    let lastServiceDate: String?
    let nextServiceDate: String?
    
    var displayName: String {
        return "\(year) \(make) \(model)"
    }
    
    var formattedMileage: String {
        return "\(mileage.formatted()) km"
    }
}

struct CarHealthStatus: Codable {
    let carId: String
    let overallHealth: Int
    let engine: HealthComponent
    let brakes: HealthComponent
    let tires: HealthComponent
    let battery: HealthComponent
    let lastCheck: String
    
    var healthColor: String {
        switch overallHealth {
        case 80...100:
            return "green"
        case 60...79:
            return "yellow"
        case 40...59:
            return "orange"
        default:
            return "red"
        }
    }
    
    var healthStatus: String {
        switch overallHealth {
        case 80...100:
            return "Excellent"
        case 60...79:
            return "Good"
        case 40...59:
            return "Fair"
        default:
            return "Poor"
        }
    }
}

struct HealthComponent: Codable {
    let status: String
    let score: Int
    
    var statusColor: String {
        switch status {
        case "excellent", "good":
            return "green"
        case "warning", "fair":
            return "yellow"
        case "critical", "poor":
            return "red"
        default:
            return "gray"
        }
    }
}

// MARK: - Maintenance Models
struct MaintenanceRecord: Codable, Identifiable {
    let id: String
    let carId: String
    let serviceType: String
    let date: String
    let mileage: Int
    let cost: Double
    let description: String
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: date) {
            return formatter.string(from: date)
        }
        return date
    }
    
    var formattedCost: String {
        return String(format: "EGP %.2f", cost)
    }
}

struct MaintenanceReminder: Codable, Identifiable {
    let id: String
    let carId: String
    let serviceType: String
    let dueDate: String
    let mileage: Int
    let priority: String
    
    var formattedDueDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: dueDate) {
            return formatter.string(from: date)
        }
        return dueDate
    }
    
    var priorityColor: String {
        switch priority {
        case "high":
            return "red"
        case "medium":
            return "orange"
        case "low":
            return "green"
        default:
            return "gray"
        }
    }
    
    var isOverdue: Bool {
        guard let dueDate = ISO8601DateFormatter().date(from: dueDate) else { return false }
        return dueDate < Date()
    }
}

// MARK: - Service Models
struct ServicePartner: Codable, Identifiable {
    let id: String
    let name: String
    let type: String
    let rating: Double
    let distance: Double
    let services: [String]
    let location: String
    
    var formattedRating: String {
        return String(format: "%.1f", rating)
    }
    
    var formattedDistance: String {
        return String(format: "%.1f km", distance)
    }
    
    var typeDisplayName: String {
        switch type {
        case "repair_center":
            return "Repair Center"
        case "auto_parts_shop":
            return "Auto Parts Shop"
        case "service_station":
            return "Service Station"
        default:
            return type.capitalized
        }
    }
}

struct ServiceBooking: Codable, Identifiable {
    let id: String
    let partnerId: String
    let carId: String
    let serviceType: String
    let status: String
    let scheduledDate: String
    let estimatedCost: Double
    let notes: String?
    
    var formattedScheduledDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        if let date = ISO8601DateFormatter().date(from: scheduledDate) {
            return formatter.string(from: date)
        }
        return scheduledDate
    }
    
    var formattedCost: String {
        return String(format: "EGP %.2f", estimatedCost)
    }
    
    var statusColor: String {
        switch status {
        case "confirmed", "completed":
            return "green"
        case "pending", "scheduled":
            return "yellow"
        case "cancelled", "rejected":
            return "red"
        default:
            return "gray"
        }
    }
}

// MARK: - Parts Models
struct PartCategory: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
}

struct CarPart: Codable, Identifiable {
    let id: String
    let name: String
    let category: String
    let price: Double
    let brand: String
    let compatibleCars: [String]
    let inStock: Bool
    
    var formattedPrice: String {
        return String(format: "EGP %.2f", price)
    }
    
    var stockStatus: String {
        return inStock ? "In Stock" : "Out of Stock"
    }
    
    var stockColor: String {
        return inStock ? "green" : "red"
    }
}

// MARK: - Order Models
struct Order: Codable, Identifiable {
    let id: String
    let type: String
    let status: String
    let total: Double
    let items: [OrderItem]
    let orderDate: String
    let deliveryDate: String?
    
    var formattedTotal: String {
        return String(format: "EGP %.2f", total)
    }
    
    var formattedOrderDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: orderDate) {
            return formatter.string(from: date)
        }
        return orderDate
    }
    
    var formattedDeliveryDate: String? {
        guard let deliveryDate = deliveryDate else { return nil }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: deliveryDate) {
            return formatter.string(from: date)
        }
        return deliveryDate
    }
    
    var statusColor: String {
        switch status {
        case "delivered", "completed":
            return "green"
        case "processing", "shipped":
            return "blue"
        case "pending", "confirmed":
            return "yellow"
        case "cancelled", "failed":
            return "red"
        default:
            return "gray"
        }
    }
}

struct OrderItem: Codable {
    let name: String
    let quantity: Int
    let price: Double
    
    var formattedPrice: String {
        return String(format: "EGP %.2f", price)
    }
    
    var totalPrice: Double {
        return price * Double(quantity)
    }
    
    var formattedTotalPrice: String {
        return String(format: "EGP %.2f", totalPrice)
    }
}

// MARK: - Community Models
struct CommunityTip: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let author: String
    let category: String
    let likes: Int
    let createdAt: String
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: createdAt) {
            return formatter.string(from: date)
        }
        return createdAt
    }
    
    var categoryDisplayName: String {
        return category.capitalized
    }
}

struct Review: Codable, Identifiable {
    let id: String
    let partnerId: String
    let rating: Int
    let comment: String
    let author: String
    let createdAt: String
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: createdAt) {
            return formatter.string(from: date)
        }
        return createdAt
    }
    
    var starRating: String {
        return String(repeating: "★", count: rating) + String(repeating: "☆", count: 5 - rating)
    }
}

struct LeaderboardEntry: Codable, Identifiable {
    let id: String
    let username: String
    let points: Int
    let rank: Int
    
    var formattedPoints: String {
        return "\(points) pts"
    }
    
    var rankDisplay: String {
        switch rank {
        case 1:
            return "🥇"
        case 2:
            return "🥈"
        case 3:
            return "🥉"
        default:
            return "#\(rank)"
        }
    }
}

// MARK: - Loyalty Models
struct LoyaltyPoints: Codable {
    let totalPoints: Int
    let availablePoints: Int
    let usedPoints: Int
    let tier: String
    let nextTierPoints: Int
    
    var formattedTotalPoints: String {
        return "\(totalPoints) pts"
    }
    
    var formattedAvailablePoints: String {
        return "\(availablePoints) pts"
    }
    
    var tierColor: String {
        switch tier.lowercased() {
        case "gold":
            return "yellow"
        case "silver":
            return "gray"
        case "bronze":
            return "orange"
        default:
            return "blue"
        }
    }
    
    var progressPercentage: Double {
        guard nextTierPoints > 0 else { return 1.0 }
        return Double(availablePoints) / Double(nextTierPoints)
    }
}

struct Badge: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let earned: Bool
    let earnedDate: String?
    
    var formattedEarnedDate: String? {
        guard let earnedDate = earnedDate else { return nil }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        if let date = ISO8601DateFormatter().date(from: earnedDate) {
            return formatter.string(from: date)
        }
        return earnedDate
    }
}

// MARK: - Payment Models
struct PaymentMethod: Codable, Identifiable {
    let id: String
    let type: String
    let last4: String
    let brand: String
    let expiryMonth: Int
    let expiryYear: Int
    let isDefault: Bool
    
    var displayName: String {
        return "\(brand) •••• \(last4)"
    }
    
    var formattedExpiry: String {
        return String(format: "%02d/%d", expiryMonth, expiryYear)
    }
    
    var typeIcon: String {
        switch type {
        case "credit_card":
            return "creditcard"
        case "debit_card":
            return "creditcard"
        case "bank_account":
            return "building.columns"
        default:
            return "creditcard"
        }
    }
}

struct PaymentRequest: Codable {
    let amount: Double
    let paymentMethodId: String
    let orderId: String?
    
    var formattedAmount: String {
        return String(format: "EGP %.2f", amount)
    }
}

struct PaymentResponse: Codable {
    let success: Bool
    let transactionId: String
    let status: String
    
    var statusColor: String {
        switch status {
        case "completed", "success":
            return "green"
        case "pending", "processing":
            return "yellow"
        case "failed", "declined":
            return "red"
        default:
            return "gray"
        }
    }
}

// MARK: - API Request Models
struct LoginRequest: Codable {
    let emailOrPhone: String
    let password: String
    let rememberMe: Bool
    
    init(emailOrPhone: String, password: String, rememberMe: Bool = false) {
        self.emailOrPhone = emailOrPhone
        self.password = password
        self.rememberMe = rememberMe
    }
}

struct RegisterRequest: Codable {
    let email: String
    let phone: String
    let firstName: String
    let lastName: String
    let password: String
    let confirmPassword: String
    let agreeToTerms: Bool
    
    init(email: String, phone: String, firstName: String, lastName: String, password: String, confirmPassword: String, agreeToTerms: Bool) {
        self.email = email
        self.phone = phone
        self.firstName = firstName
        self.lastName = lastName
        self.password = password
        self.confirmPassword = confirmPassword
        self.agreeToTerms = agreeToTerms
    }
}

struct ForgotPasswordRequest: Codable {
    let emailOrPhone: String
    
    init(emailOrPhone: String) {
        self.emailOrPhone = emailOrPhone
    }
}

struct OtpRequest: Codable {
    let emailOrPhone: String
    let otp: String
    
    init(emailOrPhone: String, otp: String) {
        self.emailOrPhone = emailOrPhone
        self.otp = otp
    }
}

// MARK: - API Response Models
struct ApiResponse: Codable {
    let success: Bool
    let message: String
    let timestamp: String
}

struct AuthResponse: Codable {
    let success: Bool
    let data: AuthData
    let message: String
    let timestamp: String
}

struct AuthData: Codable {
    let user: ClutchUser
    let token: String
    let refreshToken: String
}
