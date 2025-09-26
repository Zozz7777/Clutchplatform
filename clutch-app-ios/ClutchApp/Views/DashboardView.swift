import SwiftUI

struct DashboardView: View {
    @State private var selectedCar = "DS 7 crossback 2020"
    @State private var carMileage = "20,850 KM"
    @State private var carHealthScore = 80
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        ClutchLogoView(size: 32)
                        
                        Spacer()
                        
                        Text("Your Car")
                            .font(.system(size: 16))
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Button(action: {}) {
                            Image(systemName: "bell")
                                .foregroundColor(.clutchRed)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Car Selection
                    VStack(alignment: .leading, spacing: 8) {
                        Text(selectedCar)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.clutchRed)
                        
                        Text("OPERA")
                            .font(.system(size: 16))
                            .foregroundColor(.clutchRed)
                        
                        // Mileage
                        HStack {
                            Text(carMileage)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                            
                            Spacer()
                            
                            Button(action: {}) {
                                Image(systemName: "pencil")
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding()
                        .background(Color.white)
                        .cornerRadius(8)
                    }
                    .padding(.horizontal)
                    
                    // Quick Actions
                    HStack(spacing: 16) {
                        QuickActionCard(
                            title: "Find Mechanics",
                            icon: "wrench.and.screwdriver.fill",
                            action: {}
                        )
                        
                        QuickActionCard(
                            title: "Shop Car Parts",
                            icon: "cart.fill",
                            action: {}
                        )
                    }
                    .padding(.horizontal)
                    
                    // Car Health Section
                    VStack(alignment: .leading, spacing: 16) {
                        // Health Score
                        VStack {
                            Text("Overall Health Score")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                            
                            ZStack {
                                Circle()
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 12)
                                    .frame(width: 150, height: 150)
                                
                                Circle()
                                    .trim(from: 0, to: CGFloat(carHealthScore) / 100)
                                    .stroke(Color.clutchRed, lineWidth: 12)
                                    .frame(width: 150, height: 150)
                                    .rotationEffect(.degrees(-90))
                                
                                VStack {
                                    Text("\(carHealthScore)%")
                                        .font(.system(size: 32, weight: .bold))
                                        .foregroundColor(.black)
                                    
                                    Text("Good Condition")
                                        .font(.system(size: 14))
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                        
                        // Parts Status
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Parts Expiring Soon")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.black)
                            
                            PartStatusRow(partName: "Engine Oil", status: "Expired 850 Km Ago", isExpired: true)
                            PartStatusRow(partName: "Spark Plugs", status: "9,150 Km ~ Remaining", isExpired: false)
                            PartStatusRow(partName: "Air Filter", status: "4,150 Km ~ Remaining", isExpired: false)
                            PartStatusRow(partName: "Brakes", status: "29,150 Km ~ Remaining", isExpired: false)
                            
                            Button("View All") {
                                // Navigate to parts
                            }
                            .foregroundColor(.clutchRed)
                            .font(.system(size: 16, weight: .bold))
                            .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 100) // Space for tab bar
            }
            .background(Color(red: 0.96, green: 0.96, blue: 0.96))
            .navigationBarHidden(true)
        }
    }
}

struct QuickActionCard: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 48))
                    .foregroundColor(.clutchRed)
                
                Text(title)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.clutchRed)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.white)
            .cornerRadius(12)
        }
    }
}

struct PartStatusRow: View {
    let partName: String
    let status: String
    let isExpired: Bool
    
    var body: some View {
        HStack {
            Text(partName)
                .font(.system(size: 14))
                .foregroundColor(isExpired ? .clutchRed : .black)
            
            Spacer()
            
            Text(status)
                .font(.system(size: 12))
                .foregroundColor(isExpired ? .clutchRed : .gray)
        }
    }
}

#Preview {
    DashboardView()
}
