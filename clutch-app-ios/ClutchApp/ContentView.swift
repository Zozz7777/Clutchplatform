import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var themeManager: ThemeManager
    @State private var hasCompletedOnboarding = UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")
    
    var body: some View {
        Group {
            if !hasCompletedOnboarding {
                OnboardingView {
                    hasCompletedOnboarding = true
                    UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
                }
            } else if authManager.isLoggedIn {
                MainTabView()
            } else {
                SplashView()
            }
        }
        .preferredColorScheme(themeManager.isDarkMode ? .dark : .light)
    }
}

struct MainTabView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var languageManager: LanguageManager
    
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text(languageManager.localizedString("dashboard"))
                }
            
            CarHealthView()
                .tabItem {
                    Image(systemName: "car.fill")
                    Text(languageManager.localizedString("car_health"))
                }
            
            CommunityView()
                .tabItem {
                    Image(systemName: "person.3.fill")
                    Text(languageManager.localizedString("community"))
                }
            
            LoyaltyView()
                .tabItem {
                    Image(systemName: "star.fill")
                    Text(languageManager.localizedString("loyalty"))
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text(languageManager.localizedString("profile"))
                }
        }
        .accentColor(Color("ClutchOrange"))
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager.shared)
        .environmentObject(ThemeManager.shared)
        .environmentObject(LanguageManager.shared)
}
