import Foundation
import Combine

class PartnersApiService: ObservableObject {
    static let shared = PartnersApiService()
    
    private let baseURL = Config.apiBaseURL
    private let session = URLSession.shared
    private var authToken: String?
    
    private init() {}
    
    // MARK: - Authentication
    
    func setAuthToken(_ token: String) {
        authToken = token
    }
    
    private func createRequest(for endpoint: String, method: HTTPMethod = .GET, body: Data? = nil) -> URLRequest? {
        guard let url = URL(string: "\(baseURL)/\(endpoint)") else { return nil }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        return request
    }
    
    // MARK: - Inventory Management
    
    func getInventoryItems() async throws -> [InventoryItem] {
        guard let request = createRequest(for: "partners/inventory") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[InventoryItem]>.self, from: data)
        return apiResponse.data
    }
    
    func addInventoryItem(_ item: InventoryItem) async throws -> InventoryItem {
        guard let request = createRequest(
            for: "partners/inventory",
            method: .POST,
            body: try JSONEncoder().encode(item)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 201 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<InventoryItem>.self, from: data)
        return apiResponse.data
    }
    
    func updateInventoryItem(_ item: InventoryItem) async throws -> InventoryItem {
        guard let request = createRequest(
            for: "partners/inventory/\(item.id)",
            method: .PUT,
            body: try JSONEncoder().encode(item)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<InventoryItem>.self, from: data)
        return apiResponse.data
    }
    
    func deleteInventoryItem(_ itemId: String) async throws {
        guard let request = createRequest(for: "partners/inventory/\(itemId)", method: .DELETE) else {
            throw APIError.invalidURL
        }
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 204 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Order Management
    
    func getOrders() async throws -> [Order] {
        guard let request = createRequest(for: "partners/orders") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[Order]>.self, from: data)
        return apiResponse.data
    }
    
    func updateOrderStatus(_ orderId: String, status: OrderStatus) async throws -> Order {
        let updateRequest = OrderStatusUpdateRequest(status: status)
        
        guard let request = createRequest(
            for: "partners/orders/\(orderId)/status",
            method: .PATCH,
            body: try JSONEncoder().encode(updateRequest)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<Order>.self, from: data)
        return apiResponse.data
    }
    
    // MARK: - Customer Management
    
    func getCustomers() async throws -> [Customer] {
        guard let request = createRequest(for: "partners/customers") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[Customer]>.self, from: data)
        return apiResponse.data
    }
    
    func addCustomer(_ customer: Customer) async throws -> Customer {
        guard let request = createRequest(
            for: "partners/customers",
            method: .POST,
            body: try JSONEncoder().encode(customer)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 201 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<Customer>.self, from: data)
        return apiResponse.data
    }
    
    func updateCustomer(_ customer: Customer) async throws -> Customer {
        guard let request = createRequest(
            for: "partners/customers/\(customer.id)",
            method: .PUT,
            body: try JSONEncoder().encode(customer)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<Customer>.self, from: data)
        return apiResponse.data
    }
    
    func deleteCustomer(_ customerId: String) async throws {
        guard let request = createRequest(for: "partners/customers/\(customerId)", method: .DELETE) else {
            throw APIError.invalidURL
        }
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 204 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Staff Management
    
    func getStaff() async throws -> [Staff] {
        guard let request = createRequest(for: "partners/staff") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[Staff]>.self, from: data)
        return apiResponse.data
    }
    
    func addStaff(_ staff: Staff) async throws -> Staff {
        guard let request = createRequest(
            for: "partners/staff",
            method: .POST,
            body: try JSONEncoder().encode(staff)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 201 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<Staff>.self, from: data)
        return apiResponse.data
    }
    
    func updateStaff(_ staff: Staff) async throws -> Staff {
        guard let request = createRequest(
            for: "partners/staff/\(staff.id)",
            method: .PUT,
            body: try JSONEncoder().encode(staff)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<Staff>.self, from: data)
        return apiResponse.data
    }
    
    func deleteStaff(_ staffId: String) async throws {
        guard let request = createRequest(for: "partners/staff/\(staffId)", method: .DELETE) else {
            throw APIError.invalidURL
        }
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 204 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
    
    // MARK: - Reports & Analytics
    
    func getSalesReport(startDate: Date, endDate: Date) async throws -> SalesReport {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        
        let startDateString = dateFormatter.string(from: startDate)
        let endDateString = dateFormatter.string(from: endDate)
        
        guard let request = createRequest(for: "partners/reports/sales?start_date=\(startDateString)&end_date=\(endDateString)") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<SalesReport>.self, from: data)
        return apiResponse.data
    }
    
    func getInventoryReport() async throws -> InventoryReport {
        guard let request = createRequest(for: "partners/reports/inventory") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<InventoryReport>.self, from: data)
        return apiResponse.data
    }
    
    // MARK: - Settings
    
    func getSettings() async throws -> PartnerSettings {
        guard let request = createRequest(for: "partners/settings") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<PartnerSettings>.self, from: data)
        return apiResponse.data
    }
    
    func updateSettings(_ settings: PartnerSettings) async throws -> PartnerSettings {
        guard let request = createRequest(
            for: "partners/settings",
            method: .PUT,
            body: try JSONEncoder().encode(settings)
        ) else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<PartnerSettings>.self, from: data)
        return apiResponse.data
    }
}

// MARK: - Supporting Types

enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case PATCH = "PATCH"
    case DELETE = "DELETE"
}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(Int)
    case decodingError
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .serverError(let code):
            return "Server error: \(code)"
        case .decodingError:
            return "Failed to decode response"
        case .networkError:
            return "Network error"
        }
    }
}

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
    let message: String?
    let timestamp: String
}

struct OrderStatusUpdateRequest: Codable {
    let status: OrderStatus
}

// MARK: - Data Models

struct Customer: Identifiable, Codable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let address: String
    let city: String
    let state: String
    let zipCode: String
    let customerType: CustomerType
    let status: CustomerStatus
    let totalOrders: Int
    let totalSpent: Double
    let averageOrderValue: Double
    let lastOrderDate: Date
    let registrationDate: Date
    let notes: String?
    let tags: [String]
    let loyaltyPoints: Int
    let preferredContactMethod: ContactMethod
    let marketingOptIn: Bool
}

enum CustomerType: String, Codable {
    case individual = "individual"
    case business = "business"
}

enum CustomerStatus: String, Codable {
    case active = "active"
    case inactive = "inactive"
    case suspended = "suspended"
}

enum ContactMethod: String, Codable {
    case email = "email"
    case phone = "phone"
    case sms = "sms"
}

struct Staff: Identifiable, Codable {
    let id: String
    let name: String
    let email: String
    let phone: String?
    let role: StaffRole
    let status: StaffStatus
    let hireDate: Date
    let salary: Double?
    let permissions: [String]
    let notes: String?
}

enum StaffRole: String, Codable {
    case manager = "manager"
    case sales = "sales"
    case technician = "technician"
    case admin = "admin"
}

enum StaffStatus: String, Codable {
    case active = "active"
    case inactive = "inactive"
    case terminated = "terminated"
}

struct SalesReport: Codable {
    let totalSales: Double
    let totalOrders: Int
    let averageOrderValue: Double
    let topSellingItems: [TopSellingItem]
    let salesByCategory: [CategorySales]
    let salesByDate: [DateSales]
}

struct TopSellingItem: Codable {
    let itemId: String
    let itemName: String
    let quantitySold: Int
    let totalRevenue: Double
}

struct CategorySales: Codable {
    let category: String
    let totalSales: Double
    let orderCount: Int
}

struct DateSales: Codable {
    let date: Date
    let totalSales: Double
    let orderCount: Int
}

struct InventoryReport: Codable {
    let totalItems: Int
    let totalValue: Double
    let lowStockItems: Int
    let outOfStockItems: Int
    let topCategories: [CategoryInventory]
    let slowMovingItems: [SlowMovingItem]
}

struct CategoryInventory: Codable {
    let category: String
    let itemCount: Int
    let totalValue: Double
}

struct SlowMovingItem: Codable {
    let itemId: String
    let itemName: String
    let currentStock: Int
    let daysSinceLastSale: Int
}

struct PartnerSettings: Codable {
    let businessName: String
    let businessAddress: String
    let businessPhone: String
    let businessEmail: String
    let taxRate: Double
    let currency: String
    let timezone: String
    let lowStockThreshold: Int
    let autoReorderEnabled: Bool
    let notificationSettings: NotificationSettings
}

struct NotificationSettings: Codable {
    let emailNotifications: Bool
    let smsNotifications: Bool
    let pushNotifications: Bool
    let lowStockAlerts: Bool
    let newOrderAlerts: Bool
    let paymentAlerts: Bool
}
