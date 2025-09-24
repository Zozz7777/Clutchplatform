import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var authService: AuthService
    @State private var currentPage = 0
    @State private var showPartnerTypeSelector = false
    
    private let pages = [
        OnboardingPage(
            title: "Manage Your Store",
            description: "Easily manage your inventory, track sales, and update your business information all in one place.",
            iconName: "storefront.fill"
        ),
        OnboardingPage(
            title: "Handle Orders & Appointments",
            description: "Receive and manage customer orders and appointments efficiently with real-time notifications.",
            iconName: "calendar.badge.clock"
        ),
        OnboardingPage(
            title: "Track Your Revenue",
            description: "Monitor your weekly earnings, view payout history, and track your business performance.",
            iconName: "chart.line.uptrend.xyaxis"
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Page content
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        OnboardingPageView(page: pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                .animation(.easeInOut, value: currentPage)
                
                // Page indicator
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Circle()
                            .fill(index == currentPage ? Color.primary : Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                            .animation(.easeInOut, value: currentPage)
                    }
                }
                .padding(.top, 32)
                
                // Navigation buttons
                HStack(spacing: 16) {
                    if currentPage > 0 {
                        Button("Previous") {
                            withAnimation {
                                currentPage -= 1
                            }
                        }
                        .foregroundColor(.primary)
                    }
                    
                    Spacer()
                    
                    if currentPage < pages.count - 1 {
                        Button("Next") {
                            withAnimation {
                                currentPage += 1
                            }
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.primary)
                        .cornerRadius(8)
                    } else {
                        Button("Get Started") {
                            showPartnerTypeSelector = true
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.primary)
                        .cornerRadius(8)
                    }
                }
                .padding(.horizontal, 32)
                .padding(.top, 32)
                .padding(.bottom, 50)
            }
            .navigationBarHidden(true)
            .fullScreenCover(isPresented: $showPartnerTypeSelector) {
                PartnerTypeSelectorView()
                    .environmentObject(authService)
            }
        }
    }
}

struct OnboardingPage {
    let title: String
    let description: String
    let iconName: String
}

struct OnboardingPageView: View {
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icon
            Image(systemName: page.iconName)
                .font(.system(size: 80))
                .foregroundColor(.primary)
            
            // Content
            VStack(spacing: 16) {
                Text(page.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text(page.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
            
            Spacer()
        }
        .padding(.horizontal, 32)
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AuthService())
}