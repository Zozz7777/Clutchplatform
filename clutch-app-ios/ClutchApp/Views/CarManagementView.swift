import SwiftUI
import CoreData

struct CarManagementView: View {
    @StateObject private var viewModel = CarManagementViewModel()
    @State private var showingAddCar = false
    @State private var selectedCar: Car?
    @State private var showingCarDetails = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                headerView
                
                // Content
                if viewModel.cars.isEmpty {
                    emptyStateView
                } else {
                    carsListView
                }
            }
            .navigationTitle("My Cars")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddCar = true }) {
                        Image(systemName: "plus")
                            .foregroundColor(.blue)
                    }
                }
            }
            .sheet(isPresented: $showingAddCar) {
                AddCarView { car in
                    viewModel.addCar(car)
                }
            }
            .sheet(item: $selectedCar) { car in
                CarDetailsView(car: car) { updatedCar in
                    viewModel.updateCar(updatedCar)
                } onDelete: { carToDelete in
                    viewModel.deleteCar(carToDelete)
                }
            }
            .onAppear {
                viewModel.loadCars()
            }
        }
    }
    
    private var headerView: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Vehicle Management")
                        .font(.title2)
                        .fontWeight(.bold)
                    Text("Manage your vehicles and track maintenance")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            .padding(.horizontal)
            
            // Quick Stats
            HStack(spacing: 16) {
                StatCard(
                    title: "Total Cars",
                    value: "\(viewModel.cars.count)",
                    icon: "car.fill",
                    color: .blue
                )
                
                StatCard(
                    title: "Active",
                    value: "\(viewModel.activeCarsCount)",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                StatCard(
                    title: "Service Due",
                    value: "\(viewModel.serviceDueCount)",
                    icon: "wrench.fill",
                    color: .orange
                )
            }
            .padding(.horizontal)
        }
        .padding(.vertical)
        .background(Color(.systemGroupedBackground))
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "car")
                .font(.system(size: 80))
                .foregroundColor(.gray)
            
            VStack(spacing: 8) {
                Text("No Cars Added")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Add your first vehicle to start tracking maintenance and services")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            
            Button(action: { showingAddCar = true }) {
                HStack {
                    Image(systemName: "plus")
                    Text("Add Your First Car")
                }
                .font(.headline)
                .foregroundColor(.white)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }
            
            Spacer()
        }
    }
    
    private var carsListView: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(viewModel.cars) { car in
                    CarCard(car: car) {
                        selectedCar = car
                    }
                }
            }
            .padding()
        }
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
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct CarCard: View {
    let car: Car
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(car.make) \(car.model)")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text("\(car.year) • \(car.licensePlate)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(car.mileage, specifier: "%.0f") mi")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        if car.nextServiceDate != nil {
                            Text("Service Due")
                                .font(.caption)
                                .foregroundColor(.orange)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color.orange.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                }
                
                HStack {
                    Label(car.fuelType, systemImage: "fuelpump.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Label(car.transmission, systemImage: "gearshift")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct AddCarView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AddCarViewModel()
    let onSave: (Car) -> Void
    
    var body: some View {
        NavigationView {
            Form {
                Section("Vehicle Information") {
                    TextField("Make", text: $viewModel.make)
                    TextField("Model", text: $viewModel.model)
                    TextField("Year", text: $viewModel.year)
                        .keyboardType(.numberPad)
                    TextField("License Plate", text: $viewModel.licensePlate)
                    TextField("VIN (Optional)", text: $viewModel.vin)
                    TextField("Color", text: $viewModel.color)
                }
                
                Section("Additional Details") {
                    TextField("Current Mileage", text: $viewModel.mileage)
                        .keyboardType(.numberPad)
                    
                    Picker("Fuel Type", selection: $viewModel.fuelType) {
                        ForEach(FuelType.allCases, id: \.self) { fuelType in
                            Text(fuelType.rawValue).tag(fuelType)
                        }
                    }
                    
                    Picker("Transmission", selection: $viewModel.transmission) {
                        ForEach(TransmissionType.allCases, id: \.self) { transmission in
                            Text(transmission.rawValue).tag(transmission)
                        }
                    }
                    
                    TextField("Engine Size (Optional)", text: $viewModel.engineSize)
                }
                
                Section("Insurance Information") {
                    TextField("Insurance Company", text: $viewModel.insuranceCompany)
                    TextField("Policy Number", text: $viewModel.policyNumber)
                    TextField("Expiry Date (MM/DD/YYYY)", text: $viewModel.insuranceExpiry)
                }
            }
            .navigationTitle("Add New Car")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        if let car = viewModel.createCar() {
                            onSave(car)
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.isValid)
                }
            }
        }
    }
}

struct CarDetailsView: View {
    @Environment(\.dismiss) private var dismiss
    @State var car: Car
    let onUpdate: (Car) -> Void
    let onDelete: (Car) -> Void
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Car Header
                    VStack(spacing: 12) {
                        Text("\(car.make) \(car.model)")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text("\(car.year) • \(car.licensePlate)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text("\(car.mileage, specifier: "%.0f") miles")
                            .font(.headline)
                            .foregroundColor(.blue)
                    }
                    .padding()
                    .background(Color(.systemGroupedBackground))
                    .cornerRadius(12)
                    
                    // Car Information
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Vehicle Details")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Make", value: car.make)
                        DetailRow(title: "Model", value: car.model)
                        DetailRow(title: "Year", value: "\(car.year)")
                        DetailRow(title: "License Plate", value: car.licensePlate)
                        DetailRow(title: "VIN", value: car.vin ?? "Not provided")
                        DetailRow(title: "Color", value: car.color ?? "Not specified")
                        DetailRow(title: "Mileage", value: "\(car.mileage, specifier: "%.0f") miles")
                        DetailRow(title: "Fuel Type", value: car.fuelType.rawValue)
                        DetailRow(title: "Transmission", value: car.transmission.rawValue)
                        DetailRow(title: "Engine Size", value: car.engineSize ?? "Not specified")
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Insurance Information
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Insurance Information")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Company", value: car.insuranceCompany ?? "Not provided")
                        DetailRow(title: "Policy Number", value: car.policyNumber ?? "Not provided")
                        DetailRow(title: "Expiry Date", value: car.insuranceExpiry ?? "Not provided")
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Service Information
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Service Information")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        DetailRow(title: "Last Service", value: car.lastServiceDate?.formatted() ?? "No service recorded")
                        DetailRow(title: "Next Service", value: car.nextServiceDate?.formatted() ?? "Not scheduled")
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Action Buttons
                    VStack(spacing: 12) {
                        Button(action: {
                            // Edit car action
                        }) {
                            HStack {
                                Image(systemName: "pencil")
                                Text("Edit Car")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        
                        Button(action: {
                            onDelete(car)
                            dismiss()
                        }) {
                            HStack {
                                Image(systemName: "trash")
                                Text("Delete Car")
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
            .navigationTitle("Car Details")
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
class CarManagementViewModel: ObservableObject {
    @Published var cars: [Car] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    var activeCarsCount: Int {
        cars.count
    }
    
    var serviceDueCount: Int {
        cars.filter { $0.nextServiceDate != nil }.count
    }
    
    func loadCars() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let cars = try await ClutchApiService.shared.getUserCars()
                await MainActor.run {
                    self.cars = cars
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
    
    func addCar(_ car: Car) {
        cars.append(car)
    }
    
    func updateCar(_ car: Car) {
        if let index = cars.firstIndex(where: { $0.id == car.id }) {
            cars[index] = car
        }
    }
    
    func deleteCar(_ car: Car) {
        cars.removeAll { $0.id == car.id }
    }
}

@MainActor
class AddCarViewModel: ObservableObject {
    @Published var make = ""
    @Published var model = ""
    @Published var year = ""
    @Published var licensePlate = ""
    @Published var vin = ""
    @Published var color = ""
    @Published var mileage = ""
    @Published var fuelType: FuelType = .gasoline
    @Published var transmission: TransmissionType = .automatic
    @Published var engineSize = ""
    @Published var insuranceCompany = ""
    @Published var policyNumber = ""
    @Published var insuranceExpiry = ""
    
    var isValid: Bool {
        !make.isEmpty && !model.isEmpty && !year.isEmpty && !licensePlate.isEmpty
    }
    
    func createCar() -> Car? {
        guard isValid,
              let yearInt = Int(year),
              let mileageDouble = Double(mileage) else {
            return nil
        }
        
        return Car(
            id: UUID().uuidString,
            make: make,
            model: model,
            year: yearInt,
            licensePlate: licensePlate,
            vin: vin.isEmpty ? nil : vin,
            color: color.isEmpty ? nil : color,
            mileage: mileageDouble,
            fuelType: fuelType,
            transmission: transmission,
            engineSize: engineSize.isEmpty ? nil : engineSize,
            insuranceCompany: insuranceCompany.isEmpty ? nil : insuranceCompany,
            policyNumber: policyNumber.isEmpty ? nil : policyNumber,
            insuranceExpiry: insuranceExpiry.isEmpty ? nil : insuranceExpiry,
            lastServiceDate: nil,
            nextServiceDate: nil
        )
    }
}

// MARK: - Data Models

struct Car: Identifiable, Codable {
    let id: String
    let make: String
    let model: String
    let year: Int
    let licensePlate: String
    let vin: String?
    let color: String?
    let mileage: Double
    let fuelType: FuelType
    let transmission: TransmissionType
    let engineSize: String?
    let insuranceCompany: String?
    let policyNumber: String?
    let insuranceExpiry: String?
    let lastServiceDate: Date?
    let nextServiceDate: Date?
}

enum FuelType: String, CaseIterable, Codable {
    case gasoline = "Gasoline"
    case diesel = "Diesel"
    case hybrid = "Hybrid"
    case electric = "Electric"
    case other = "Other"
}

enum TransmissionType: String, CaseIterable, Codable {
    case automatic = "Automatic"
    case manual = "Manual"
    case cvt = "CVT"
    case other = "Other"
}

#Preview {
    CarManagementView()
}
