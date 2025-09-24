import Foundation
import Combine

class AuthService: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: PartnerUser?
    @Published var selectedPartnerType: PartnerType?
    
    private let networkService = NetworkService.shared
    private let userDefaults = UserDefaults.standard
    private let tokenKey = "auth_token"
    private let userKey = "current_user"
    private let partnerTypeKey = "selected_partner_type"
    
    var cancellables = Set<AnyCancellable>()
    
    init() {
        loadStoredData()
    }
    
    func checkAuthenticationStatus() {
        if let token = userDefaults.string(forKey: tokenKey),
           let userData = userDefaults.data(forKey: userKey),
           let user = try? JSONDecoder().decode(PartnerUser.self, from: userData) {
            currentUser = user
            isAuthenticated = true
        }
    }
    
    func signIn(_ request: SignInRequest) -> AnyPublisher<Bool, Error> {
        guard let requestData = try? JSONEncoder().encode(request) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/partners/auth/signin",
            method: .POST,
            body: requestData,
            responseType: AuthResponse.self
        )
        .map { [weak self] response in
            self?.storeAuthData(token: response.token, user: response.user)
            return true
        }
        .eraseToAnyPublisher()
    }
    
    func signUp(_ request: SignUpRequest) -> AnyPublisher<Bool, Error> {
        guard let requestData = try? JSONEncoder().encode(request) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/partners/auth/signup",
            method: .POST,
            body: requestData,
            responseType: AuthResponse.self
        )
        .map { [weak self] response in
            self?.storeAuthData(token: response.token, user: response.user)
            return true
        }
        .eraseToAnyPublisher()
    }
    
    func requestToJoin(_ request: RequestToJoinRequest) -> AnyPublisher<Bool, Error> {
        guard let requestData = try? JSONEncoder().encode(request) else {
            return Fail(error: NetworkError.decodingError)
                .eraseToAnyPublisher()
        }
        
        return networkService.request(
            endpoint: "/partners/auth/request-to-join",
            method: .POST,
            body: requestData,
            responseType: RequestToJoinResponse.self
        )
        .map { _ in true }
        .eraseToAnyPublisher()
    }
    
    func logout() {
        userDefaults.removeObject(forKey: tokenKey)
        userDefaults.removeObject(forKey: userKey)
        userDefaults.removeObject(forKey: partnerTypeKey)
        
        currentUser = nil
        isAuthenticated = false
        selectedPartnerType = nil
    }
    
    func setSelectedPartnerType(_ type: PartnerType) {
        selectedPartnerType = type
        if let data = try? JSONEncoder().encode(type) {
            userDefaults.set(data, forKey: partnerTypeKey)
        }
    }
    
    private func storeAuthData(token: String, user: PartnerUser) {
        userDefaults.set(token, forKey: tokenKey)
        if let userData = try? JSONEncoder().encode(user) {
            userDefaults.set(userData, forKey: userKey)
        }
        
        currentUser = user
        isAuthenticated = true
    }
    
    private func loadStoredData() {
        if let data = userDefaults.data(forKey: partnerTypeKey),
           let type = try? JSONDecoder().decode(PartnerType.self, from: data) {
            selectedPartnerType = type
        }
    }
}

struct SignInRequest: Codable {
    let emailOrPhone: String
    let password: String
}

struct SignUpRequest: Codable {
    let partnerId: String
    let email: String
    let phone: String
    let password: String
    let businessName: String
    let ownerName: String
    let partnerType: String
    let businessAddress: BusinessAddress
    let workingHours: WorkingHours?
    let businessSettings: BusinessSettings?
}

struct RequestToJoinRequest: Codable {
    let businessName: String
    let ownerName: String
    let email: String
    let phone: String
    let businessType: String
    let businessDescription: String
    let yearsInBusiness: Int
    let numberOfEmployees: Int
    let website: String?
    let socialMedia: String?
    let businessAddress: BusinessAddress
    let preferredPartnerType: String
    let reasonForJoining: String
    let expectedMonthlyOrders: Int
    let hasExistingCustomers: Bool
    let existingCustomerCount: Int?
    let businessLicense: String
    let taxId: String
    let bankAccountInfo: String
    let references: String?
    let additionalInfo: String?
}

struct AuthResponse: Codable {
    let token: String
    let user: PartnerUser
}

struct RequestToJoinResponse: Codable {
    let success: Bool
    let message: String
}