import SwiftUI
import MapKit

struct ServiceBookingView: View {
    @StateObject private var viewModel = ServiceBookingViewModel()
    @State private var selectedService: ServiceType?
    @State private var selectedDate = Date()
    @State private var selectedTime = ""
    @State private var selectedLocation: ServiceLocation?
    @State private var showingLocationPicker = false
    @State private var showingConfirmation = false
    @State private var notes = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Service Selection
                    serviceSelectionSection
                    
                    // Date & Time Selection
                    dateTimeSection
                    
                    // Location Selection
                    locationSection
                    
                    // Additional Notes
                    notesSection
                    
                    // Booking Summary
                    bookingSummarySection
                    
                    // Book Service Button
                    bookServiceButton
                }
                .padding()
            }
            .navigationTitle("Book Service")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showingLocationPicker) {
                LocationPickerView(selectedLocation: $selectedLocation)
            }
            .sheet(isPresented: $showingConfirmation) {
                BookingConfirmationView(
                    service: selectedService!,
                    date: selectedDate,
                    time: selectedTime,
                    location: selectedLocation!,
                    notes: notes
                ) {
                    viewModel.bookService(
                        service: selectedService!,
                        date: selectedDate,
                        time: selectedTime,
                        location: selectedLocation!,
                        notes: notes
                    )
                    showingConfirmation = false
                }
            }
            .onAppear {
                viewModel.loadServiceTypes()
                viewModel.loadLocations()
            }
        }
    }
    
    private var serviceSelectionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Select Service")
                .font(.headline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(ServiceType.allCases, id: \.self) { service in
                    ServiceTypeCard(
                        service: service,
                        isSelected: selectedService == service
                    ) {
                        selectedService = service
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var dateTimeSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Date & Time")
                .font(.headline)
                .fontWeight(.semibold)
            
            // Date Picker
            DatePicker(
                "Select Date",
                selection: $selectedDate,
                in: Date()...,
                displayedComponents: .date
            )
            .datePickerStyle(.compact)
            
            // Time Slots
            if !viewModel.availableTimeSlots.isEmpty {
                Text("Available Times")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 8) {
                    ForEach(viewModel.availableTimeSlots, id: \.self) { time in
                        TimeSlotButton(
                            time: time,
                            isSelected: selectedTime == time
                        ) {
                            selectedTime = time
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var locationSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Service Location")
                .font(.headline)
                .fontWeight(.semibold)
            
            if let location = selectedLocation {
                LocationCard(location: location) {
                    showingLocationPicker = true
                }
            } else {
                Button(action: { showingLocationPicker = true }) {
                    HStack {
                        Image(systemName: "location")
                        Text("Select Location")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Additional Notes")
                .font(.headline)
                .fontWeight(.semibold)
            
            TextField("Any specific requirements or notes...", text: $notes, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(3...6)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var bookingSummarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Booking Summary")
                .font(.headline)
                .fontWeight(.semibold)
            
            if let service = selectedService {
                VStack(spacing: 12) {
                    SummaryRow(title: "Service", value: service.title)
                    SummaryRow(title: "Date", value: selectedDate.formatted(date: .abbreviated, time: .omitted))
                    SummaryRow(title: "Time", value: selectedTime.isEmpty ? "Not selected" : selectedTime)
                    SummaryRow(title: "Location", value: selectedLocation?.name ?? "Not selected")
                    SummaryRow(title: "Price", value: service.price)
                }
            } else {
                Text("Select a service to see booking summary")
                    .foregroundColor(.secondary)
                    .italic()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
    
    private var bookServiceButton: some View {
        Button(action: {
            showingConfirmation = true
        }) {
            HStack {
                Image(systemName: "calendar.badge.plus")
                Text("Book Service")
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(canBookService ? Color.blue : Color.gray)
            .cornerRadius(12)
        }
        .disabled(!canBookService)
    }
    
    private var canBookService: Bool {
        selectedService != nil &&
        !selectedTime.isEmpty &&
        selectedLocation != nil
    }
}

struct ServiceTypeCard: View {
    let service: ServiceType
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                Image(systemName: service.icon)
                    .font(.title)
                    .foregroundColor(isSelected ? .white : .blue)
                
                Text(service.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isSelected ? .white : .primary)
                
                Text(service.price)
                    .font(.caption)
                    .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(isSelected ? Color.blue : Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct TimeSlotButton: View {
    let time: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(time)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(isSelected ? .white : .blue)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(isSelected ? Color.blue : Color(.systemGray6))
                .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct LocationCard: View {
    let location: ServiceLocation
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: "location.fill")
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(location.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(location.address)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SummaryRow: View {
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

struct LocationPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedLocation: ServiceLocation?
    @StateObject private var viewModel = LocationPickerViewModel()
    
    var body: some View {
        NavigationView {
            List(viewModel.locations) { location in
                LocationRow(location: location) {
                    selectedLocation = location
                    dismiss()
                }
            }
            .navigationTitle("Select Location")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                viewModel.loadLocations()
            }
        }
    }
}

struct LocationRow: View {
    let location: ServiceLocation
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(location.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(location.address)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                    
                    HStack {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", location.rating))
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Spacer()
                        
                        Text("\(location.distance, specifier: "%.1f") mi")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct BookingConfirmationView: View {
    @Environment(\.dismiss) private var dismiss
    let service: ServiceType
    let date: Date
    let time: String
    let location: ServiceLocation
    let notes: String
    let onConfirm: () -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Confirmation Header
                VStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.green)
                    
                    Text("Confirm Booking")
                        .font(.title2)
                        .fontWeight(.bold)
                }
                
                // Booking Details
                VStack(spacing: 16) {
                    ConfirmationRow(title: "Service", value: service.title)
                    ConfirmationRow(title: "Date", value: date.formatted(date: .abbreviated, time: .omitted))
                    ConfirmationRow(title: "Time", value: time)
                    ConfirmationRow(title: "Location", value: location.name)
                    ConfirmationRow(title: "Price", value: service.price)
                    
                    if !notes.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Notes")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Text(notes)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding()
                .background(Color(.systemGroupedBackground))
                .cornerRadius(12)
                
                Spacer()
                
                // Action Buttons
                VStack(spacing: 12) {
                    Button(action: {
                        onConfirm()
                    }) {
                        Text("Confirm Booking")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(12)
                    }
                    
                    Button(action: {
                        dismiss()
                    }) {
                        Text("Cancel")
                            .font(.headline)
                            .foregroundColor(.blue)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }
                }
            }
            .padding()
            .navigationTitle("Booking Confirmation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct ConfirmationRow: View {
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
class ServiceBookingViewModel: ObservableObject {
    @Published var serviceTypes: [ServiceType] = []
    @Published var locations: [ServiceLocation] = []
    @Published var availableTimeSlots: [String] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    func loadServiceTypes() {
        serviceTypes = ServiceType.allCases
    }
    
    func loadLocations() {
        isLoading = true
        
        Task {
            do {
                let locations = try await ClutchApiService.shared.getServiceLocations()
                await MainActor.run {
                    self.locations = locations
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
    
    func loadAvailableTimeSlots(for date: Date) {
        // Generate time slots for the selected date
        let timeSlots = [
            "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
        ]
        availableTimeSlots = timeSlots
    }
    
    func bookService(service: ServiceType, date: Date, time: String, location: ServiceLocation, notes: String) {
        // Book the service
        Task {
            do {
                try await ClutchApiService.shared.bookService(
                    serviceType: service,
                    date: date,
                    time: time,
                    location: location,
                    notes: notes
                )
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

@MainActor
class LocationPickerViewModel: ObservableObject {
    @Published var locations: [ServiceLocation] = []
    @Published var isLoading = false
    
    func loadLocations() {
        isLoading = true
        
        Task {
            do {
                let locations = try await ClutchApiService.shared.getServiceLocations()
                await MainActor.run {
                    self.locations = locations
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                }
            }
        }
    }
}

// MARK: - Data Models

enum ServiceType: CaseIterable {
    case oilChange
    case tireRotation
    case brakeService
    case engineDiagnostic
    case transmissionService
    case acService
    case batteryService
    case generalInspection
    
    var title: String {
        switch self {
        case .oilChange: return "Oil Change"
        case .tireRotation: return "Tire Rotation"
        case .brakeService: return "Brake Service"
        case .engineDiagnostic: return "Engine Diagnostic"
        case .transmissionService: return "Transmission Service"
        case .acService: return "AC Service"
        case .batteryService: return "Battery Service"
        case .generalInspection: return "General Inspection"
        }
    }
    
    var icon: String {
        switch self {
        case .oilChange: return "drop.fill"
        case .tireRotation: return "arrow.triangle.2.circlepath"
        case .brakeService: return "stop.circle.fill"
        case .engineDiagnostic: return "gear"
        case .transmissionService: return "gearshift"
        case .acService: return "snowflake"
        case .batteryService: return "bolt.fill"
        case .generalInspection: return "magnifyingglass"
        }
    }
    
    var price: String {
        switch self {
        case .oilChange: return "$29.99"
        case .tireRotation: return "$19.99"
        case .brakeService: return "$149.99"
        case .engineDiagnostic: return "$89.99"
        case .transmissionService: return "$199.99"
        case .acService: return "$129.99"
        case .batteryService: return "$79.99"
        case .generalInspection: return "$49.99"
        }
    }
}

struct ServiceLocation: Identifiable, Codable {
    let id: String
    let name: String
    let address: String
    let phone: String
    let rating: Double
    let distance: Double
    let coordinates: CLLocationCoordinate2D
}

#Preview {
    ServiceBookingView()
}
