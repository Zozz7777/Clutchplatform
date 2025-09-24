import SwiftUI

struct ContentView: View {
    @StateObject private var authService = AuthService()
    
    var body: some View {
        Group {
            if authService.isAuthenticated {
                DashboardView()
                    .environmentObject(authService)
            } else {
                SplashView()
                    .environmentObject(authService)
            }
        }
        .onAppear {
            // Check if user is already authenticated
            authService.checkAuthenticationStatus()
        }
    }
}

#Preview {
    ContentView()
}