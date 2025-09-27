import SwiftUI

struct OrderProcessingView: View {
    @StateObject private var viewModel = OrderProcessingViewModel()
    @State private var selectedOrder: Order?
    @State private var showingOrderDetails = false
    @State private var searchText = ""
    @State private var selectedStatus = OrderStatus.all
    @State private var selectedSortOption = OrderSortOption.newest
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with Search
                headerView
                
                // Stats Cards
                statsView
                
                // Filter and Sort
                filterView
                
                // Orders List
                ordersListView
            }
            .navigationTitle("Orders")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedOrder) { order in
                OrderDetailsView(order: order) { updatedOrder in
                    viewModel.updateOrder(updatedOrder)
                }
            }
            .onAppear {
                viewModel.loadOrders()
            }
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 16) {
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                
                TextField("Search orders...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                
                if !searchText.isEmpty {
                    Button(action: { searchText = "" }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(10)
        }
        .padding()
    }
    
    private var statsView: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                StatCard(
                    title: "Total Orders",
                    value: "\(viewModel.totalOrders)",
                    icon: "doc.text.fill",
                    color: .blue
                )
                
                StatCard(
                    title: "Pending",
                    value: "\(viewModel.pendingOrders)",
                    icon: "clock.fill",
                    color: .orange
                )
                
                StatCard(
                    title: "Completed",
                    value: "\(viewModel.completedOrders)",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                StatCard(
                    title: "Revenue",
                    value: "$\(String(format: "%.0f", viewModel.totalRevenue))",
                    icon: "dollarsign.circle.fill",
                    color: .purple
                )
            }
            .padding(.horizontal)
        }
    }
    
    private var filterView: some View {
        HStack {
            // Status Filter
            Menu {
                Button("All Orders") {
                    selectedStatus = .all
                }
                ForEach(OrderStatus.allCases.filter { $0 != .all }, id: \.self) { status in
                    Button(status.displayName) {
                        selectedStatus = status
                    }
                }
            } label: {
                HStack {
                    Text(selectedStatus.displayName)
                    Image(systemName: "chevron.down")
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
            
            Spacer()
            
            // Sort Options
            Menu {
                Button("Newest First") { selectedSortOption = .newest }
                Button("Oldest First") { selectedSortOption = .oldest }
                Button("Highest Value") { selectedSortOption = .highestValue }
                Button("Lowest Value") { selectedSortOption = .lowestValue }
            } label: {
                HStack {
                    Text("Sort")
                    Image(systemName: "arrow.up.arrow.down")
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
        }
        .padding(.horizontal)
    }
    
    private var ordersListView: some View {
        List {
            ForEach(filteredOrders) { order in
                OrderRow(order: order) {
                    selectedOrder = order
                }
            }
        }
        .listStyle(PlainListStyle())
    }
    
    private var filteredOrders: [Order] {
        var orders = viewModel.orders
        
        // Apply search filter
        if !searchText.isEmpty {
            orders = orders.filter { order in
                order.orderNumber.localizedCaseInsensitiveContains(searchText) ||
                order.customerName.localizedCaseInsensitiveContains(searchText) ||
                order.customerEmail.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Apply status filter
        if selectedStatus != .all {
            orders = orders.filter { $0.status == selectedStatus }
        }
        
        // Apply sorting
        switch selectedSortOption {
        case .newest:
            orders = orders.sorted { $0.createdAt > $1.createdAt }
        case .oldest:
            orders = orders.sorted { $0.createdAt < $1.createdAt }
        case .highestValue:
            orders = orders.sorted { $0.totalAmount > $1.totalAmount }
        case .lowestValue:
            orders = orders.sorted { $0.totalAmount < $1.totalAmount }
        }
        
        return orders
    }
}

struct OrderRow: View {
    let order: Order
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Order #\(order.orderNumber)")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text(order.customerName)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("$\(String(format: "%.2f", order.totalAmount))")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
                        StatusBadge(status: order.status)
                    }
                }
                
                HStack {
                    Text("\(order.items.count) items")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text(order.createdAt.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct StatusBadge: View {
    let status: OrderStatus
    
    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(status.color)
            .cornerRadius(4)
    }
}

struct OrderDetailsView: View {
    @Environment(\.dismiss) private var dismiss
    @State var order: Order
    let onUpdate: (Order) -> Void
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Order Header
                    VStack(spacing: 12) {
                        Text("Order #\(order.orderNumber)")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        StatusBadge(status: order.status)
                        
                        Text("$\(String(format: "%.2f", order.totalAmount))")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.green)
                    }
                    .padding()
                    .background(Color(.systemGroupedBackground))
                    .cornerRadius(12)
                    
                    // Customer Information
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Customer Information")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Name", value: order.customerName)
                        DetailRow(title: "Email", value: order.customerEmail)
                        DetailRow(title: "Phone", value: order.customerPhone ?? "Not provided")
                        DetailRow(title: "Address", value: order.shippingAddress)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Order Items
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Order Items")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        ForEach(order.items) { item in
                            OrderItemRow(item: item)
                        }
                        
                        Divider()
                        
                        HStack {
                            Text("Total")
                                .font(.headline)
                                .fontWeight(.semibold)
                            Spacer()
                            Text("$\(String(format: "%.2f", order.totalAmount))")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Order Actions
                    if order.status == .pending {
                        VStack(spacing: 12) {
                            Button(action: {
                                order.status = .processing
                                onUpdate(order)
                            }) {
                                HStack {
                                    Image(systemName: "play.circle.fill")
                                    Text("Start Processing")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            
                            Button(action: {
                                order.status = .cancelled
                                onUpdate(order)
                            }) {
                                HStack {
                                    Image(systemName: "xmark.circle.fill")
                                    Text("Cancel Order")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                        }
                    } else if order.status == .processing {
                        Button(action: {
                            order.status = .shipped
                            onUpdate(order)
                        }) {
                            HStack {
                                Image(systemName: "shippingbox.fill")
                                Text("Mark as Shipped")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    } else if order.status == .shipped {
                        Button(action: {
                            order.status = .delivered
                            onUpdate(order)
                        }) {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Mark as Delivered")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Order Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct OrderItemRow: View {
    let item: OrderItem
    
    var body: some View {
        HStack(spacing: 12) {
            // Item Image Placeholder
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(.systemGray5))
                .frame(width: 50, height: 50)
                .overlay(
                    Image(systemName: "cube.box")
                        .foregroundColor(.gray)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("SKU: \(item.sku)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text("Qty: \(item.quantity)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("$\(String(format: "%.2f", item.price))")
                    .font(.subheadline)
                    .foregroundColor(.green)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - ViewModels

@MainActor
class OrderProcessingViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    var totalOrders: Int { orders.count }
    var pendingOrders: Int { orders.filter { $0.status == .pending }.count }
    var completedOrders: Int { orders.filter { $0.status == .delivered }.count }
    var totalRevenue: Double { orders.reduce(0) { $0 + $1.totalAmount } }
    
    func loadOrders() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let orders = try await PartnersApiService.shared.getOrders()
                await MainActor.run {
                    self.orders = orders
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
    
    func updateOrder(_ order: Order) {
        if let index = orders.firstIndex(where: { $0.id == order.id }) {
            orders[index] = order
        }
    }
}

// MARK: - Data Models

struct Order: Identifiable, Codable {
    let id: String
    let orderNumber: String
    let customerName: String
    let customerEmail: String
    let customerPhone: String?
    let shippingAddress: String
    let items: [OrderItem]
    let totalAmount: Double
    var status: OrderStatus
    let createdAt: Date
    let updatedAt: Date
}

struct OrderItem: Identifiable, Codable {
    let id: String
    let name: String
    let sku: String
    let quantity: Int
    let price: Double
}

enum OrderStatus: String, CaseIterable, Codable {
    case pending = "pending"
    case processing = "processing"
    case shipped = "shipped"
    case delivered = "delivered"
    case cancelled = "cancelled"
    case all = "all"
    
    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .processing: return "Processing"
        case .shipped: return "Shipped"
        case .delivered: return "Delivered"
        case .cancelled: return "Cancelled"
        case .all: return "All Orders"
        }
    }
    
    var color: Color {
        switch self {
        case .pending: return .orange
        case .processing: return .blue
        case .shipped: return .purple
        case .delivered: return .green
        case .cancelled: return .red
        case .all: return .gray
        }
    }
}

enum OrderSortOption {
    case newest, oldest, highestValue, lowestValue
}

#Preview {
    OrderProcessingView()
}
