import SwiftUI

struct SplashView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var isAnimating = false
    @State private var showContent = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.clutchRed, Color.clutchRedLight]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Clutch Logo
                ClutchLogoView(size: 160)
                    .scaleEffect(isAnimating ? 1.1 : 0.9)
                    .opacity(showContent ? 1 : 0)
                
                // App Name
                Text("Clutch")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .opacity(showContent ? 1 : 0)
                
                // Tagline
                Text("Your Car's Best Friend")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                    .opacity(showContent ? 1 : 0)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0)) {
                showContent = true
                isAnimating = true
            }
            
            // Navigate after delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                if authManager.isLoggedIn {
                    // Navigate to dashboard
                } else {
                    // Navigate to onboarding
                }
            }
        }
    }
}

struct ClutchLogoView: View {
    let size: CGFloat
    
    var body: some View {
        ZStack {
            // Segmented C background
            ForEach(0..<14, id: \.self) { index in
                Rectangle()
                    .fill(Color.white)
                    .frame(width: 4, height: size * 0.4)
                    .offset(y: -size * 0.2)
                    .rotationEffect(.degrees(Double(index) * 270.0 / 14.0 + 135.0))
            }
            
            // CLUTCH text
            Text("CLUTCH")
                .font(.system(size: size * 0.15, weight: .bold))
                .foregroundColor(.white)
        }
        .frame(width: size, height: size)
    }
}

#Preview {
    SplashView()
        .environmentObject(AuthManager.shared)
}
