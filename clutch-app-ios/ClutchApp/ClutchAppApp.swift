import SwiftUI

@main
struct ClutchAppApp: App {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isLoggedIn {
                    ClutchDashboardView()
                } else {
                    ClutchLoginView()
                }
            }
            .environmentObject(authManager)
            .environmentObject(ThemeManager.shared)
            .environmentObject(LanguageManager.shared)
        }
    }
}
