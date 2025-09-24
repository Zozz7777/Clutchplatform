import Foundation

// MARK: - Partner User Model
struct PartnerUser: Codable, Identifiable {
    let id: String
    let email: String
    let phone: String
    let businessName: String
    let ownerName: String
    let partnerType: PartnerType
    let businessAddress: BusinessAddress
    let workingHours: WorkingHours?
    let businessSettings: BusinessSettings?
    let role: PartnerRole
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Partner Type Enum
enum PartnerType: String, CaseIterable, Codable {
    case repairCenter = "repair_center"
    case autoPartsShop = "auto_parts_shop"
    case accessoriesShop = "accessories_shop"
    case importerManufacturer = "importer_manufacturer"
    case serviceCenter = "service_center"
    
    var displayName: String {
        switch self {
        case .repairCenter:
            return "Repair Center"
        case .autoPartsShop:
            return "Auto Parts Shop"
        case .accessoriesShop:
            return "Accessories Shop"
        case .importerManufacturer:
            return "Importer/Manufacturer"
        case .serviceCenter:
            return "Service Center"
        }
    }
    
    var description: String {
        switch self {
        case .repairCenter:
            return "Provide automotive repair and maintenance services"
        case .autoPartsShop:
            return "Sell auto parts and components"
        case .accessoriesShop:
            return "Sell automotive accessories and upgrades"
        case .importerManufacturer:
            return "Import or manufacture auto parts"
        case .serviceCenter:
            return "Provide various automotive services"
        }
    }
    
    var iconName: String {
        switch self {
        case .repairCenter:
            return "wrench.and.screwdriver.fill"
        case .autoPartsShop:
            return "cube.box.fill"
        case .accessoriesShop:
            return "star.fill"
        case .importerManufacturer:
            return "building.2.fill"
        case .serviceCenter:
            return "gearshape.fill"
        }
    }
}

// MARK: - Partner Role Enum
enum PartnerRole: String, CaseIterable, Codable {
    case owner = "owner"
    case manager = "manager"
    case staff = "staff"
    case accountant = "accountant"
    
    var displayName: String {
        switch self {
        case .owner:
            return "Owner"
        case .manager:
            return "Manager"
        case .staff:
            return "Staff"
        case .accountant:
            return "Accountant"
        }
    }
    
    var permissions: [Permission] {
        switch self {
        case .owner:
            return Permission.allCases
        case .manager:
            return [.manageOrders, .manageInvoices, .manageStoreSettings, .viewPayments]
        case .staff:
            return [.viewOrders, .updateOrderStatus]
        case .accountant:
            return [.viewPayments, .viewInvoices]
        }
    }
}

// MARK: - Permission Enum
enum Permission: String, CaseIterable, Codable {
    case manageOrders = "manage_orders"
    case manageInvoices = "manage_invoices"
    case manageStoreSettings = "manage_store_settings"
    case viewPayments = "view_payments"
    case viewOrders = "view_orders"
    case updateOrderStatus = "update_order_status"
    case viewInvoices = "view_invoices"
    
    var displayName: String {
        switch self {
        case .manageOrders:
            return "Manage Orders"
        case .manageInvoices:
            return "Manage Invoices"
        case .manageStoreSettings:
            return "Manage Store Settings"
        case .viewPayments:
            return "View Payments"
        case .viewOrders:
            return "View Orders"
        case .updateOrderStatus:
            return "Update Order Status"
        case .viewInvoices:
            return "View Invoices"
        }
    }
}

// MARK: - Business Address Model
struct BusinessAddress: Codable {
    let street: String
    let city: String
    let state: String
    let zipCode: String
    let country: String
    let coordinates: Coordinates?
}

// MARK: - Coordinates Model
struct Coordinates: Codable {
    let latitude: Double
    let longitude: Double
}

// MARK: - Working Hours Model
struct WorkingHours: Codable {
    let monday: DayHours?
    let tuesday: DayHours?
    let wednesday: DayHours?
    let thursday: DayHours?
    let friday: DayHours?
    let saturday: DayHours?
    let sunday: DayHours?
}

// MARK: - Day Hours Model
struct DayHours: Codable {
    let open: String
    let close: String
    let isClosed: Bool
}

// MARK: - Business Settings Model
struct BusinessSettings: Codable {
    let enableServiceOrders: Bool
    let enableProductOrders: Bool
    let enableAppointments: Bool
    let connectedToPartsSystem: Bool
    let notificationSettings: NotificationSettings?
}

// MARK: - Notification Settings Model
struct NotificationSettings: Codable {
    let pushNotifications: Bool
    let emailNotifications: Bool
    let smsNotifications: Bool
    let orderNotifications: Bool
    let paymentNotifications: Bool
    let systemNotifications: Bool
}

// MARK: - Partner Order Model
struct PartnerOrder: Codable, Identifiable {
    let id: String
    let customerName: String
    let customerPhone: String
    let customerEmail: String?
    let serviceName: String
    let serviceDescription: String?
    let productName: String?
    let productDescription: String?
    let quantity: Int?
    let unitPrice: Double?
    let totalAmount: Double
    let status: OrderStatus
    let orderType: OrderType
    let scheduledDate: Date?
    let notes: String?
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Order Status Enum
enum OrderStatus: String, CaseIterable, Codable {
    case pending = "pending"
    case paid = "paid"
    case rejected = "rejected"
    case completed = "completed"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .pending:
            return "Pending"
        case .paid:
            return "Paid"
        case .rejected:
            return "Rejected"
        case .completed:
            return "Completed"
        case .cancelled:
            return "Cancelled"
        }
    }
}

// MARK: - Order Type Enum
enum OrderType: String, CaseIterable, Codable {
    case service = "service"
    case product = "product"
    case appointment = "appointment"
    
    var displayName: String {
        switch self {
        case .service:
            return "Service"
        case .product:
            return "Product"
        case .appointment:
            return "Appointment"
        }
    }
}

// MARK: - Partner Payment Model
struct PartnerPayment: Codable, Identifiable {
    let id: String
    let amount: Double
    let status: PaymentStatus
    let type: PaymentType
    let description: String?
    let reference: String?
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Payment Status Enum
enum PaymentStatus: String, CaseIterable, Codable {
    case pending = "pending"
    case completed = "completed"
    case failed = "failed"
    case cancelled = "cancelled"
    
    var displayName: String {
        switch self {
        case .pending:
            return "Pending"
        case .completed:
            return "Completed"
        case .failed:
            return "Failed"
        case .cancelled:
            return "Cancelled"
        }
    }
}

// MARK: - Payment Type Enum
enum PaymentType: String, CaseIterable, Codable {
    case weeklyPayout = "weekly_payout"
    case bonus = "bonus"
    case refund = "refund"
    case adjustment = "adjustment"
    
    var displayName: String {
        switch self {
        case .weeklyPayout:
            return "Weekly Payout"
        case .bonus:
            return "Bonus"
        case .refund:
            return "Refund"
        case .adjustment:
            return "Adjustment"
        }
    }
}