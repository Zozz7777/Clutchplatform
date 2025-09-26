import Foundation
import SwiftUI
import Combine

class ThemeManager: ObservableObject {
    static let shared = ThemeManager()
    
    @Published var isDarkMode = false
    @Published var colorScheme: ColorScheme = .light
    
    private let userDefaults = UserDefaults.standard
    private let themeKey = "clutch_theme_mode"
    
    private init() {
        loadTheme()
    }
    
    private func loadTheme() {
        let savedTheme = userDefaults.string(forKey: themeKey) ?? "system"
        
        switch savedTheme {
        case "dark":
            isDarkMode = true
            colorScheme = .dark
        case "light":
            isDarkMode = false
            colorScheme = .light
        default:
            // System theme
            isDarkMode = false
            colorScheme = .light
        }
    }
    
    func setTheme(_ theme: String) {
        userDefaults.set(theme, forKey: themeKey)
        
        switch theme {
        case "dark":
            isDarkMode = true
            colorScheme = .dark
        case "light":
            isDarkMode = false
            colorScheme = .light
        default:
            // System theme
            isDarkMode = false
            colorScheme = .light
        }
    }
    
    func toggleTheme() {
        setTheme(isDarkMode ? "light" : "dark")
    }
}

// MARK: - Clutch Colors
extension Color {
    static let clutchRed = Color(red: 0.9, green: 0.0, blue: 0.0)
    static let clutchRedLight = Color(red: 1.0, green: 0.2, blue: 0.2)
    static let clutchRedDark = Color(red: 0.8, green: 0.0, blue: 0.0)
    static let clutchGray = Color(red: 0.42, green: 0.45, blue: 0.5)
    static let clutchGrayLight = Color(red: 0.61, green: 0.64, blue: 0.69)
    static let clutchGrayDark = Color(red: 0.22, green: 0.25, blue: 0.31)
}
