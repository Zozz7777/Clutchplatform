import Foundation
import Combine

// MARK: - API Models
struct LoginRequest: Codable {
    let emailOrPhone: String
    let password: String
    let rememberMe: Bool
}

struct RegisterRequest: Codable {
    let email: String
    let phone: String
    let firstName: String
    let lastName: String
    let password: String
    let confirmPassword: String
    let agreeToTerms: Bool
}

struct ForgotPasswordRequest: Codable {
    let emailOrPhone: String
}

struct OtpRequest: Codable {
    let emailOrPhone: String
    let otp: String
}

struct AuthResponse: Codable {
    let success: Bool
    let data: AuthData
    let message: String
    let timestamp: String
}

struct AuthData: Codable {
    let user: User
    let token: String
    let refreshToken: String
}

struct User: Codable {
    let id: String
    let email: String
    let phone: String
    let firstName: String
    let lastName: String
    let profileImage: String?
    let isEmailVerified: Bool
    let isPhoneVerified: Bool
    let createdAt: String
    let updatedAt: String
}

struct Car: Codable, Identifiable {
    let id: String
    let make: String
    let model: String
    let year: Int
    let licensePlate: String
    let mileage: Int
    let lastServiceDate: String?
    let nextServiceDate: String?
}

struct CarHealth: Codable {
    let carId: String
    let overallHealth: Int
    let engine: HealthComponent
    let brakes: HealthComponent
    let tires: HealthComponent
    let battery: HealthComponent
    let lastCheck: String
}

struct HealthComponent: Codable {
    let status: String
    let score: Int
}

struct MaintenanceRecord: Codable, Identifiable {
    let id: String
    let carId: String
    let serviceType: String
    let date: String
    let mileage: Int
    let cost: Double
    let description: String
}

struct MaintenanceReminder: Codable, Identifiable {
    let id: String
    let carId: String
    let serviceType: String
    let dueDate: String
    let mileage: Int
    let priority: String
}

struct ServicePartner: Codable, Identifiable {
    let id: String
    let name: String
    let type: String
    let rating: Double
    let distance: Double
    let services: [String]
    let location: String
}

struct ServiceBookingRequest: Codable {
    let partnerId: String
    let carId: String
    let serviceType: String
    let preferredDate: String
    let notes: String?
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
}

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
}

struct Order: Codable, Identifiable {
    let id: String
    let type: String
    let status: String
    let total: Double
    let items: [OrderItem]
    let orderDate: String
    let deliveryDate: String?
}

struct OrderItem: Codable {
    let name: String
    let quantity: Int
    let price: Double
}

struct CommunityTip: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let author: String
    let category: String
    let likes: Int
    let createdAt: String
}

struct Review: Codable, Identifiable {
    let id: String
    let partnerId: String
    let rating: Int
    let comment: String
    let author: String
    let createdAt: String
}

struct Vote: Codable {
    let tipId: String
    let type: String // "like" or "dislike"
}

struct LeaderboardEntry: Codable, Identifiable {
    let id: String
    let username: String
    let points: Int
    let rank: Int
}

struct LoyaltyPoints: Codable {
    let totalPoints: Int
    let availablePoints: Int
    let usedPoints: Int
    let tier: String
    let nextTierPoints: Int
}

struct EarnPointsRequest: Codable {
    let action: String
    let points: Int
    let description: String
}

struct RedeemPointsRequest: Codable {
    let rewardId: String
    let points: Int
}

struct Badge: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let earned: Bool
    let earnedDate: String?
}

struct PaymentMethod: Codable, Identifiable {
    let id: String
    let type: String
    let last4: String
    let brand: String
    let expiryMonth: Int
    let expiryYear: Int
    let isDefault: Bool
}

struct PaymentRequest: Codable {
    let amount: Double
    let paymentMethodId: String
    let orderId: String?
}

struct PaymentResponse: Codable {
    let success: Bool
    let transactionId: String
    let status: String
}

struct ApiResponse: Codable {
    let success: Bool
    let message: String
    let timestamp: String
}

// MARK: - API Service
class ClutchApiService: ObservableObject {
    static let shared = ClutchApiService()
    
    private let baseURL = Config.apiBaseURL
    private let session = URLSession.shared
    private var authToken: String?
    
    private init() {}
    
    // MARK: - Authentication
    func login(emailOrPhone: String, password: String, rememberMe: Bool = false) async throws -> AuthResponse {
        let request = LoginRequest(emailOrPhone: emailOrPhone, password: password, rememberMe: rememberMe)
        return try await performRequest(endpoint: "/auth/login", method: "POST", body: request, responseType: AuthResponse.self)
    }
    
    func register(email: String, phone: String, firstName: String, lastName: String, password: String, confirmPassword: String, agreeToTerms: Bool) async throws -> AuthResponse {
        let request = RegisterRequest(email: email, phone: phone, firstName: firstName, lastName: lastName, password: password, confirmPassword: confirmPassword, agreeToTerms: agreeToTerms)
        return try await performRequest(endpoint: "/auth/register", method: "POST", body: request, responseType: AuthResponse.self)
    }
    
    func forgotPassword(emailOrPhone: String) async throws -> ApiResponse {
        let request = ForgotPasswordRequest(emailOrPhone: emailOrPhone)
        return try await performRequest(endpoint: "/auth/forgot-password", method: "POST", body: request, responseType: ApiResponse.self)
    }
    
    func verifyOtp(emailOrPhone: String, otp: String) async throws -> ApiResponse {
        let request = OtpRequest(emailOrPhone: emailOrPhone, otp: otp)
        return try await performRequest(endpoint: "/auth/verify-otp", method: "POST", body: request, responseType: ApiResponse.self)
    }
    
    // MARK: - User Profile
    func getUserProfile() async throws -> User {
        return try await performRequest(endpoint: "/users/profile", method: "GET", responseType: User.self)
    }
    
    func updateUserProfile(_ user: User) async throws -> User {
        return try await performRequest(endpoint: "/users/profile", method: "PUT", body: user, responseType: User.self)
    }
    
    // MARK: - Cars
    func getUserCars() async throws -> [Car] {
        return try await performRequest(endpoint: "/cars", method: "GET", responseType: [Car].self)
    }
    
    func addCar(_ car: Car) async throws -> Car {
        return try await performRequest(endpoint: "/cars", method: "POST", body: car, responseType: Car.self)
    }
    
    func updateCar(carId: String, car: Car) async throws -> Car {
        return try await performRequest(endpoint: "/cars/\(carId)", method: "PUT", body: car, responseType: Car.self)
    }
    
    func deleteCar(carId: String) async throws -> ApiResponse {
        return try await performRequest(endpoint: "/cars/\(carId)", method: "DELETE", responseType: ApiResponse.self)
    }
    
    func getCarHealth(carId: String) async throws -> CarHealth {
        return try await performRequest(endpoint: "/cars/\(carId)/health", method: "GET", responseType: CarHealth.self)
    }
    
    // MARK: - Maintenance
    func getMaintenanceHistory(carId: String? = nil) async throws -> [MaintenanceRecord] {
        var endpoint = "/maintenance/history"
        if let carId = carId {
            endpoint += "?carId=\(carId)"
        }
        return try await performRequest(endpoint: endpoint, method: "GET", responseType: [MaintenanceRecord].self)
    }
    
    func addMaintenanceRecord(_ maintenance: MaintenanceRecord) async throws -> MaintenanceRecord {
        return try await performRequest(endpoint: "/maintenance", method: "POST", body: maintenance, responseType: MaintenanceRecord.self)
    }
    
    func getMaintenanceReminders() async throws -> [MaintenanceReminder] {
        return try await performRequest(endpoint: "/maintenance/reminders", method: "GET", responseType: [MaintenanceReminder].self)
    }
    
    // MARK: - Services
    func getServicePartners(location: String? = nil) async throws -> [ServicePartner] {
        var endpoint = "/services/partners"
        if let location = location {
            endpoint += "?location=\(location)"
        }
        return try await performRequest(endpoint: endpoint, method: "GET", responseType: [ServicePartner].self)
    }
    
    func getServicePartner(partnerId: String) async throws -> ServicePartner {
        return try await performRequest(endpoint: "/services/partners/\(partnerId)", method: "GET", responseType: ServicePartner.self)
    }
    
    func bookService(_ booking: ServiceBookingRequest) async throws -> ServiceBooking {
        return try await performRequest(endpoint: "/services/book", method: "POST", body: booking, responseType: ServiceBooking.self)
    }
    
    func getUserBookings() async throws -> [ServiceBooking] {
        return try await performRequest(endpoint: "/services/bookings", method: "GET", responseType: [ServiceBooking].self)
    }
    
    // MARK: - Parts
    func getPartCategories() async throws -> [PartCategory] {
        return try await performRequest(endpoint: "/parts/categories", method: "GET", responseType: [PartCategory].self)
    }
    
    func getParts(category: String? = nil, search: String? = nil) async throws -> [CarPart] {
        var endpoint = "/parts"
        var queryParams: [String] = []
        
        if let category = category {
            queryParams.append("category=\(category)")
        }
        if let search = search {
            queryParams.append("search=\(search)")
        }
        
        if !queryParams.isEmpty {
            endpoint += "?" + queryParams.joined(separator: "&")
        }
        
        return try await performRequest(endpoint: endpoint, method: "GET", responseType: [CarPart].self)
    }
    
    func getPart(partId: String) async throws -> CarPart {
        return try await performRequest(endpoint: "/parts/\(partId)", method: "GET", responseType: CarPart.self)
    }
    
    // MARK: - Orders
    func createOrder(_ order: Order) async throws -> Order {
        return try await performRequest(endpoint: "/orders", method: "POST", body: order, responseType: Order.self)
    }
    
    func getUserOrders() async throws -> [Order] {
        return try await performRequest(endpoint: "/orders", method: "GET", responseType: [Order].self)
    }
    
    func getOrder(orderId: String) async throws -> Order {
        return try await performRequest(endpoint: "/orders/\(orderId)", method: "GET", responseType: Order.self)
    }
    
    // MARK: - Community
    func getCommunityTips() async throws -> [CommunityTip] {
        return try await performRequest(endpoint: "/community/tips", method: "GET", responseType: [CommunityTip].self)
    }
    
    func createTip(_ tip: CommunityTip) async throws -> CommunityTip {
        return try await performRequest(endpoint: "/community/tips", method: "POST", body: tip, responseType: CommunityTip.self)
    }
    
    func getReviews(partnerId: String? = nil) async throws -> [Review] {
        var endpoint = "/community/reviews"
        if let partnerId = partnerId {
            endpoint += "?partnerId=\(partnerId)"
        }
        return try await performRequest(endpoint: endpoint, method: "GET", responseType: [Review].self)
    }
    
    func createReview(_ review: Review) async throws -> Review {
        return try await performRequest(endpoint: "/community/reviews", method: "POST", body: review, responseType: Review.self)
    }
    
    func vote(_ vote: Vote) async throws -> ApiResponse {
        return try await performRequest(endpoint: "/community/votes", method: "POST", body: vote, responseType: ApiResponse.self)
    }
    
    func getLeaderboard() async throws -> [LeaderboardEntry] {
        return try await performRequest(endpoint: "/community/leaderboard", method: "GET", responseType: [LeaderboardEntry].self)
    }
    
    // MARK: - Loyalty
    func getUserPoints() async throws -> LoyaltyPoints {
        return try await performRequest(endpoint: "/loyalty/points", method: "GET", responseType: LoyaltyPoints.self)
    }
    
    func earnPoints(_ request: EarnPointsRequest) async throws -> ApiResponse {
        return try await performRequest(endpoint: "/loyalty/earn", method: "POST", body: request, responseType: ApiResponse.self)
    }
    
    func redeemPoints(_ request: RedeemPointsRequest) async throws -> ApiResponse {
        return try await performRequest(endpoint: "/loyalty/redeem", method: "POST", body: request, responseType: ApiResponse.self)
    }
    
    func getUserBadges() async throws -> [Badge] {
        return try await performRequest(endpoint: "/loyalty/badges", method: "GET", responseType: [Badge].self)
    }
    
    // MARK: - Payments
    func getPaymentMethods() async throws -> [PaymentMethod] {
        return try await performRequest(endpoint: "/payments/methods", method: "GET", responseType: [PaymentMethod].self)
    }
    
    func addPaymentMethod(_ paymentMethod: PaymentMethod) async throws -> PaymentMethod {
        return try await performRequest(endpoint: "/payments/methods", method: "POST", body: paymentMethod, responseType: PaymentMethod.self)
    }
    
    func processPayment(_ request: PaymentRequest) async throws -> PaymentResponse {
        return try await performRequest(endpoint: "/payments/process", method: "POST", body: request, responseType: PaymentResponse.self)
    }
    
    // MARK: - Helper Methods
    func setAuthToken(_ token: String) {
        self.authToken = token
    }
    
    func clearAuthToken() {
        self.authToken = nil
    }
    
    private func performRequest<T: Codable, R: Codable>(
        endpoint: String,
        method: String,
        body: T? = nil,
        responseType: R.Type
    ) async throws -> R {
        guard let url = URL(string: baseURL + endpoint) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let authToken = authToken {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw APIError.encodingError
            }
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            if httpResponse.statusCode == 401 {
                throw APIError.unauthorized
            }
            
            if httpResponse.statusCode >= 400 {
                throw APIError.serverError(httpResponse.statusCode)
            }
            
            do {
                let result = try JSONDecoder().decode(responseType, from: data)
                return result
            } catch {
                throw APIError.decodingError
            }
        } catch {
            if error is APIError {
                throw error
            } else {
                throw APIError.networkError
            }
        }
    }
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case encodingError
    case decodingError
    case networkError
    case invalidResponse
    case unauthorized
    case serverError(Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .encodingError:
            return "Failed to encode request"
        case .decodingError:
            return "Failed to decode response"
        case .networkError:
            return "Network error occurred"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Unauthorized access"
        case .serverError(let code):
            return "Server error: \(code)"
        }
    }
}
