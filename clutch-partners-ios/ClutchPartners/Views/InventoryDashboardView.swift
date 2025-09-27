import SwiftUI
import CoreData

struct InventoryDashboardView: View {
    @StateObject private var viewModel = InventoryDashboardViewModel()
    @State private var showingAddItem = false
    @State private var selectedItem: InventoryItem?
    @State private var showingItemDetails = false
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var selectedSortOption = SortOption.name
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with Search
                headerView
                
                // Stats Cards
                statsView
                
                // Filter and Sort
                filterView
                
                // Inventory List
                inventoryListView
            }
            .navigationTitle("Inventory")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddItem = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.blue)
                    }
                }
            }
            .sheet(isPresented: $showingAddItem) {
                AddInventoryItemView { item in
                    viewModel.addItem(item)
                }
            }
            .sheet(item: $selectedItem) { item in
                InventoryItemDetailsView(item: item) { updatedItem in
                    viewModel.updateItem(updatedItem)
                } onDelete: { itemToDelete in
                    viewModel.deleteItem(itemToDelete)
                }
            }
            .onAppear {
                viewModel.loadInventory()
            }
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 16) {
            // Search Bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                
                TextField("Search inventory...", text: $searchText)
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
                    title: "Total Items",
                    value: "\(viewModel.totalItems)",
                    icon: "cube.box.fill",
                    color: .blue
                )
                
                StatCard(
                    title: "Low Stock",
                    value: "\(viewModel.lowStockItems)",
                    icon: "exclamationmark.triangle.fill",
                    color: .orange
                )
                
                StatCard(
                    title: "Out of Stock",
                    value: "\(viewModel.outOfStockItems)",
                    icon: "xmark.circle.fill",
                    color: .red
                )
                
                StatCard(
                    title: "Total Value",
                    value: "$\(String(format: "%.0f", viewModel.totalValue))",
                    icon: "dollarsign.circle.fill",
                    color: .green
                )
            }
            .padding(.horizontal)
        }
    }
    
    private var filterView: some View {
        HStack {
            // Category Filter
            Menu {
                Button("All Categories") {
                    selectedCategory = "All"
                }
                ForEach(viewModel.categories, id: \.self) { category in
                    Button(category) {
                        selectedCategory = category
                    }
                }
            } label: {
                HStack {
                    Text(selectedCategory)
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
                Button("Name") { selectedSortOption = .name }
                Button("Price") { selectedSortOption = .price }
                Button("Stock") { selectedSortOption = .stock }
                Button("Category") { selectedSortOption = .category }
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
    
    private var inventoryListView: some View {
        List {
            ForEach(filteredItems) { item in
                InventoryItemRow(item: item) {
                    selectedItem = item
                }
            }
        }
        .listStyle(PlainListStyle())
    }
    
    private var filteredItems: [InventoryItem] {
        var items = viewModel.items
        
        // Apply search filter
        if !searchText.isEmpty {
            items = items.filter { item in
                item.name.localizedCaseInsensitiveContains(searchText) ||
                item.sku.localizedCaseInsensitiveContains(searchText) ||
                item.category.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Apply category filter
        if selectedCategory != "All" {
            items = items.filter { $0.category == selectedCategory }
        }
        
        // Apply sorting
        switch selectedSortOption {
        case .name:
            items = items.sorted { $0.name < $1.name }
        case .price:
            items = items.sorted { $0.price > $1.price }
        case .stock:
            items = items.sorted { $0.stock < $1.stock }
        case .category:
            items = items.sorted { $0.category < $1.category }
        }
        
        return items
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(width: 100)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct InventoryItemRow: View {
    let item: InventoryItem
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Item Image Placeholder
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemGray5))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "cube.box")
                            .foregroundColor(.gray)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.headline)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    Text("SKU: \(item.sku)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text(item.category)
                        .font(.caption)
                        .foregroundColor(.blue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(4)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("$\(String(format: "%.2f", item.price))")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    HStack(spacing: 4) {
                        Text("\(item.stock)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(stockColor)
                        
                        Text("units")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    if item.stock <= item.lowStockThreshold {
                        Text("Low Stock")
                            .font(.caption)
                            .foregroundColor(.orange)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.orange.opacity(0.1))
                            .cornerRadius(4)
                    }
                }
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var stockColor: Color {
        if item.stock == 0 {
            return .red
        } else if item.stock <= item.lowStockThreshold {
            return .orange
        } else {
            return .green
        }
    }
}

struct AddInventoryItemView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AddInventoryItemViewModel()
    let onSave: (InventoryItem) -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section("Item Information") {
                    TextField("Item Name", text: $viewModel.name)
                    TextField("SKU", text: $viewModel.sku)
                    TextField("Description", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("Pricing & Stock") {
                    HStack {
                        Text("Price")
                        Spacer()
                        TextField("0.00", value: $viewModel.price, format: .currency(code: "USD"))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    
                    HStack {
                        Text("Current Stock")
                        Spacer()
                        TextField("0", value: $viewModel.stock, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                    
                    HStack {
                        Text("Low Stock Threshold")
                        Spacer()
                        TextField("5", value: $viewModel.lowStockThreshold, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                }
                
                Section("Category") {
                    Picker("Category", selection: $viewModel.category) {
                        ForEach(InventoryCategory.allCases, id: \.self) { category in
                            Text(category.rawValue).tag(category)
                        }
                    }
                }
                
                Section("Additional Information") {
                    TextField("Supplier", text: $viewModel.supplier)
                    TextField("Location", text: $viewModel.location)
                }
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        if let item = viewModel.createItem() {
                            onSave(item)
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.isValid)
                }
            }
        }
    }
}

struct InventoryItemDetailsView: View {
    @Environment(\.dismiss) private var dismiss
    @State var item: InventoryItem
    let onUpdate: (InventoryItem) -> Void
    let onDelete: (InventoryItem) -> Void
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Item Header
                    VStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.systemGray5))
                            .frame(height: 120)
                            .overlay(
                                Image(systemName: "cube.box")
                                    .font(.system(size: 40))
                                    .foregroundColor(.gray)
                            )
                        
                        Text(item.name)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("SKU: \(item.sku)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGroupedBackground))
                    .cornerRadius(12)
                    
                    // Item Details
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Item Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Name", value: item.name)
                        DetailRow(title: "SKU", value: item.sku)
                        DetailRow(title: "Category", value: item.category)
                        DetailRow(title: "Price", value: "$\(String(format: "%.2f", item.price))")
                        DetailRow(title: "Current Stock", value: "\(item.stock) units")
                        DetailRow(title: "Low Stock Threshold", value: "\(item.lowStockThreshold) units")
                        DetailRow(title: "Supplier", value: item.supplier ?? "Not specified")
                        DetailRow(title: "Location", value: item.location ?? "Not specified")
                        
                        if let description = item.description, !description.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Description")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text(description)
                                    .font(.body)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Stock Management
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Stock Management")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        HStack {
                            Text("Current Stock")
                            Spacer()
                            Text("\(item.stock) units")
                                .fontWeight(.medium)
                        }
                        
                        HStack {
                            Button(action: { item.stock -= 1 }) {
                                Image(systemName: "minus.circle.fill")
                                    .foregroundColor(.red)
                            }
                            .disabled(item.stock <= 0)
                            
                            Spacer()
                            
                            Button(action: { item.stock += 1 }) {
                                Image(systemName: "plus.circle.fill")
                                    .foregroundColor(.green)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Action Buttons
                    VStack(spacing: 12) {
                        Button(action: {
                            onUpdate(item)
                            dismiss()
                        }) {
                            HStack {
                                Image(systemName: "pencil")
                                Text("Update Stock")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        
                        Button(action: {
                            onDelete(item)
                            dismiss()
                        }) {
                            HStack {
                                Image(systemName: "trash")
                                Text("Delete Item")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Item Details")
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

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

// MARK: - ViewModels

@MainActor
class InventoryDashboardViewModel: ObservableObject {
    @Published var items: [InventoryItem] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    var totalItems: Int { items.count }
    var lowStockItems: Int { items.filter { $0.stock > 0 && $0.stock <= $0.lowStockThreshold }.count }
    var outOfStockItems: Int { items.filter { $0.stock == 0 }.count }
    var totalValue: Double { items.reduce(0) { $0 + ($1.price * Double($1.stock)) } }
    var categories: [String] { Array(Set(items.map { $0.category })).sorted() }
    
    func loadInventory() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let items = try await PartnersApiService.shared.getInventoryItems()
                await MainActor.run {
                    self.items = items
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
    
    func addItem(_ item: InventoryItem) {
        items.append(item)
    }
    
    func updateItem(_ item: InventoryItem) {
        if let index = items.firstIndex(where: { $0.id == item.id }) {
            items[index] = item
        }
    }
    
    func deleteItem(_ item: InventoryItem) {
        items.removeAll { $0.id == item.id }
    }
}

@MainActor
class AddInventoryItemViewModel: ObservableObject {
    @Published var name = ""
    @Published var sku = ""
    @Published var description = ""
    @Published var price: Double = 0.0
    @Published var stock: Int = 0
    @Published var lowStockThreshold: Int = 5
    @Published var category: InventoryCategory = .parts
    @Published var supplier = ""
    @Published var location = ""
    
    var isValid: Bool {
        !name.isEmpty && !sku.isEmpty && price > 0
    }
    
    func createItem() -> InventoryItem? {
        guard isValid else { return nil }
        
        return InventoryItem(
            id: UUID().uuidString,
            name: name,
            sku: sku,
            description: description.isEmpty ? nil : description,
            price: price,
            stock: stock,
            lowStockThreshold: lowStockThreshold,
            category: category.rawValue,
            supplier: supplier.isEmpty ? nil : supplier,
            location: location.isEmpty ? nil : location,
            createdAt: Date(),
            updatedAt: Date()
        )
    }
}

// MARK: - Data Models

struct InventoryItem: Identifiable, Codable {
    let id: String
    let name: String
    let sku: String
    let description: String?
    let price: Double
    var stock: Int
    let lowStockThreshold: Int
    let category: String
    let supplier: String?
    let location: String?
    let createdAt: Date
    let updatedAt: Date
}

enum InventoryCategory: String, CaseIterable, Codable {
    case parts = "Parts"
    case accessories = "Accessories"
    case tools = "Tools"
    case fluids = "Fluids"
    case electronics = "Electronics"
    case other = "Other"
}

enum SortOption {
    case name, price, stock, category
}

#Preview {
    InventoryDashboardView()
}
