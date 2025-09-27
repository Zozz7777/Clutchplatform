import SwiftUI

struct ClutchDashboardView: View {
    @StateObject private var authManager = AuthManager.shared
    @State private var selectedTab = 0
    @State private var cars: [ClutchCar] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab - Cars and Health
            CarsView(cars: $cars, isLoading: $isLoading, errorMessage: $errorMessage)
                .tabItem {
                    Image(systemName: "car.fill")
                    Text("My Cars")
                }
                .tag(0)
            
            // Services Tab
            ServicesView()
                .tabItem {
                    Image(systemName: "wrench.and.screwdriver.fill")
                    Text("Services")
                }
                .tag(1)
            
            // Parts Tab
            PartsView()
                .tabItem {
                    Image(systemName: "gear")
                    Text("Parts")
                }
                .tag(2)
            
            // Community Tab
            CommunityView()
                .tabItem {
                    Image(systemName: "person.3.fill")
                    Text("Community")
                }
                .tag(3)
            
            // Profile Tab
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
                .tag(4)
        }
        .accentColor(.blue)
        .onAppear {
            loadUserCars()
        }
    }
    
    private func loadUserCars() {
        guard authManager.isLoggedIn else { return }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let userCars = try await ClutchApiService.shared.getUserCars()
                await MainActor.run {
                    self.cars = userCars
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
}

// MARK: - Cars View
struct CarsView: View {
    @Binding var cars: [ClutchCar]
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?
    @State private var selectedCar: ClutchCar?
    @State private var carHealth: CarHealthStatus?
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading cars...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if cars.isEmpty {
                    EmptyCarsView()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(cars) { car in
                                CarCardView(car: car) {
                                    selectedCar = car
                                    loadCarHealth(carId: car.id)
                                }
                            }
                        }
                        .padding()
                    }
                }
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                }
            }
            .navigationTitle("My Cars")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add Car") {
                        // Add car action
                    }
                }
            }
        }
        .sheet(item: $selectedCar) { car in
            CarDetailView(car: car, carHealth: carHealth)
        }
    }
    
    private func loadCarHealth(carId: String) {
        Task {
            do {
                let health = try await ClutchApiService.shared.getCarHealth(carId: carId)
                await MainActor.run {
                    self.carHealth = health
                }
            } catch {
                print("Failed to load car health: \(error)")
            }
        }
    }
}

// MARK: - Car Card View
struct CarCardView: View {
    let car: ClutchCar
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(car.displayName)
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text(car.licensePlate)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(car.formattedMileage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text("\(car.year)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                HStack {
                    Image(systemName: "car.fill")
                        .foregroundColor(.blue)
                    
                    Text("Tap to view details")
                        .font(.caption)
                        .foregroundColor(.blue)
                    
                    Spacer()
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Car Detail View
struct CarDetailView: View {
    let car: ClutchCar
    let carHealth: CarHealthStatus?
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Car Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text(car.displayName)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text(car.licensePlate)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text(car.formattedMileage)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Health Status
                    if let health = carHealth {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Health Status")
                                .font(.headline)
                            
                            HStack {
                                Text("Overall: \(health.overallHealth)%")
                                    .font(.title3)
                                    .fontWeight(.bold)
                                    .foregroundColor(health.overallHealth >= 80 ? .green : health.overallHealth >= 60 ? .orange : .red)
                                
                                Spacer()
                                
                                Text(health.healthStatus)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 12) {
                                HealthComponentView(title: "Engine", component: health.engine)
                                HealthComponentView(title: "Brakes", component: health.brakes)
                                HealthComponentView(title: "Tires", component: health.tires)
                                HealthComponentView(title: "Battery", component: health.battery)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    
                    // Quick Actions
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Quick Actions")
                            .font(.headline)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 12) {
                            QuickActionButton(title: "Book Service", icon: "wrench.and.screwdriver", color: .blue)
                            QuickActionButton(title: "Buy Parts", icon: "gear", color: .green)
                            QuickActionButton(title: "View History", icon: "clock", color: .orange)
                            QuickActionButton(title: "Health Check", icon: "heart", color: .red)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
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

// MARK: - Health Component View
struct HealthComponentView: View {
    let title: String
    let component: HealthComponent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text("\(component.score)%")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(component.statusColor == "green" ? .green : component.statusColor == "yellow" ? .orange : .red)
            
            Text(component.status.capitalized)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(Color(.systemBackground))
        .cornerRadius(8)
    }
}

// MARK: - Quick Action Button
struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    
    var body: some View {
        Button(action: {}) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Empty Cars View
struct EmptyCarsView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "car")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Cars Added")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Add your first car to get started with Clutch")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Add Car") {
                // Add car action
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Services View
struct ServicesView: View {
    var body: some View {
        NavigationView {
            Text("Services View")
                .navigationTitle("Services")
        }
    }
}

// MARK: - Parts View
struct PartsView: View {
    var body: some View {
        NavigationView {
            Text("Parts View")
                .navigationTitle("Parts")
        }
    }
}

// MARK: - Community View
struct CommunityView: View {
    var body: some View {
        NavigationView {
            Text("Community View")
                .navigationTitle("Community")
        }
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                if let user = authManager.currentUser {
                    VStack(spacing: 12) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)
                        
                        Text(user.displayName)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text(user.email)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    VStack(spacing: 12) {
                        ProfileRowView(title: "Edit Profile", icon: "person.circle")
                        ProfileRowView(title: "Settings", icon: "gearshape")
                        ProfileRowView(title: "Help & Support", icon: "questionmark.circle")
                        ProfileRowView(title: "About", icon: "info.circle")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    Spacer()
                    
                    Button("Sign Out") {
                        authManager.signOut()
                    }
                    .foregroundColor(.red)
                    .padding()
                } else {
                    Text("Not logged in")
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .navigationTitle("Profile")
        }
    }
}

// MARK: - Profile Row View
struct ProfileRowView: View {
    let title: String
    let icon: String
    
    var body: some View {
        Button(action: {}) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                    .frame(width: 24)
                
                Text(title)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ClutchDashboardView()
}
