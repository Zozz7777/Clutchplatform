import SwiftUI

struct PartnerTypeSelectorView: View {
    @EnvironmentObject var authService: AuthService
    @State private var selectedPartnerType: PartnerType?
    @State private var showAuthView = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Choose Your Partner Type")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Select the type of business you want to register as")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 32)
                    
                    // Partner type cards
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(PartnerType.allCases, id: \.self) { partnerType in
                            PartnerTypeCard(
                                partnerType: partnerType,
                                isSelected: selectedPartnerType == partnerType
                            ) {
                                selectedPartnerType = partnerType
                            }
                        }
                    }
                    .padding(.horizontal, 32)
                    
                    // Continue button
                    Button(action: {
                        if let selectedType = selectedPartnerType {
                            authService.setSelectedPartnerType(selectedType)
                            showAuthView = true
                        }
                    }) {
                        Text("Continue")
                            .font(.headline)
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedPartnerType != nil ? Color.designPrimary : Color.designMutedForeground)
                    .cornerRadius(12)
                    .padding(.horizontal, 32)
                    .disabled(selectedPartnerType == nil)
                }
                .padding(.vertical)
            }
            .navigationTitle("Partner Type")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(isPresented: $showAuthView) {
                AuthView()
                    .environmentObject(authService)
            }
        }
    }
}

struct PartnerTypeCard: View {
    let partnerType: PartnerType
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                // Icon
                Image(systemName: partnerType.iconName)
                    .font(.system(size: 32))
                    .foregroundColor(isSelected ? .white : .designPrimary)
                
                // Title
                Text(partnerType.displayName)
                    .font(.headline)
                    .foregroundColor(isSelected ? .white : .designPrimary)
                    .multilineTextAlignment(.center)
                
                // Description
                Text(partnerType.description)
                    .font(.caption)
                    .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.designPrimary : Color(.systemBackground))
                    .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.designPrimary : Color.designMutedForeground.opacity(0.3), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    PartnerTypeSelectorView()
        .environmentObject(AuthService())
}
