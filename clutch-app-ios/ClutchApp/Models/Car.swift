import Foundation

struct Car: Codable, Identifiable {
    let id: String
    let userId: String
    let make: String
    let model: String
    let year: Int
    let color: String
    let licensePlate: String
    let vin: String?
    let mileage: Int
    let fuelType: String
    let transmission: String
    let engineSize: String
    let isDefault: Bool
    let createdAt: String
    let updatedAt: String
    let healthScore: CarHealthScore?
    let maintenanceHistory: [MaintenanceRecord]
}

struct CarHealthScore: Codable {
    let overall: Int // 0-100
    let battery: Int
    let tires: Int
    let engine: Int
    let fluids: Int
    let brakes: Int
    let lastUpdated: String
    let recommendations: [HealthRecommendation]
}

struct HealthRecommendation: Codable, Identifiable {
    let id: String
    let category: String
    let title: String
    let description: String
    let priority: String // low, medium, high, critical
    let estimatedCost: Double?
    let estimatedTime: String?
}

struct MaintenanceRecord: Codable, Identifiable {
    let id: String
    let carId: String
    let serviceType: String
    let description: String
    let date: String
    let mileage: Int
    let cost: Double
    let partnerId: String?
    let partnerName: String?
    let invoiceUrl: String?
    let nextServiceDate: String?
    let nextServiceMileage: Int?
}
