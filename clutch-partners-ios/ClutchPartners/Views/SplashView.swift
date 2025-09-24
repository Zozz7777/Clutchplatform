import SwiftUI

struct SplashView: View {
    @EnvironmentObject var authService: AuthService
    @State private var isAnimating = false
    @State private var showOnboarding = false
    
    var body: some View {
        VStack {
            Spacer()
            
            // Logo
            VStack(spacing: 16) {
                Image(systemName: "wrench.and.screwdriver.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.primary)
                    .scaleEffect(isAnimating ? 1.0 : 0.8)
                    .animation(.easeInOut(duration: 1.0), value: isAnimating)
                
                Text("Clutch Partners")
                    .font(.title)
                    .fontWeight(.bold)
                    .opacity(isAnimating ? 1.0 : 0.0)
                    .animation(.easeInOut(duration: 1.0).delay(0.5), value: isAnimating)
            }
            
            Spacer()
            
            // Loading indicator
            VStack(spacing: 16) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .primary))
                    .scaleEffect(1.2)
                
                Text("Loading...")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .opacity(isAnimating ? 1.0 : 0.0)
            .animation(.easeInOut(duration: 1.0).delay(1.0), value: isAnimating)
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        .onAppear {
            isAnimating = true
            
            // Check authentication state after animation
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                if authService.isAuthenticated {
                    // User is already logged in, navigate to dashboard
                    // This will be handled by the parent view
                } else {
                    showOnboarding = true
                }
            }
        }
        .fullScreenCover(isPresented: $showOnboarding) {
            OnboardingView()
                .environmentObject(authService)
        }
    }
}

#Preview {
    SplashView()
        .environmentObject(AuthService())
}