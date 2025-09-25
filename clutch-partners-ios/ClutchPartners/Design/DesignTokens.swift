import SwiftUI

// MARK: - Design System Tokens
// Based on design.json specifications

struct DesignTokens {
    
    // MARK: - Colors (OKLCH)
    struct Colors {
        // Light Theme Colors
        static let lightBackground = Color(red: 1.0, green: 1.0, blue: 1.0) // oklch(1 0 0)
        static let lightForeground = Color(red: 0.145, green: 0.145, blue: 0.145) // oklch(0.1450 0 0)
        static let lightCard = Color(red: 1.0, green: 1.0, blue: 1.0) // oklch(1 0 0)
        static let lightCardForeground = Color(red: 0.145, green: 0.145, blue: 0.145) // oklch(0.1450 0 0)
        static let lightPrimary = Color(red: 0.577, green: 0.245, blue: 0.325) // oklch(0.5770 0.2450 27.3250)
        static let lightPrimaryForeground = Color(red: 0.985, green: 0.985, blue: 0.985) // oklch(0.9850 0 0)
        static let lightSecondary = Color(red: 0.577, green: 0.245, blue: 0.325) // oklch(0.5770 0.2450 27.3250)
        static let lightMuted = Color(red: 0.97, green: 0.97, blue: 0.97) // oklch(0.9700 0 0)
        static let lightMutedForeground = Color(red: 0.556, green: 0.556, blue: 0.556) // oklch(0.5560 0 0)
        static let lightDestructive = Color(red: 0.577, green: 0.245, blue: 0.325) // oklch(0.5770 0.2450 27.3250)
        static let lightBorder = Color(red: 0.922, green: 0.922, blue: 0.922) // oklch(0.9220 0 0)
        static let lightInput = Color(red: 0.922, green: 0.922, blue: 0.922) // oklch(0.9220 0 0)
        static let lightRing = Color(red: 0.708, green: 0.708, blue: 0.708) // oklch(0.7080 0 0)
        static let lightSidebar = Color(red: 0.985, green: 0.985, blue: 0.985) // oklch(0.9850 0 0)
        static let lightSidebarPrimary = Color(red: 0.205, green: 0.205, blue: 0.205) // oklch(0.2050 0 0)
        static let lightSuccess = Color(red: 0.72, green: 0.2, blue: 0.145) // oklch(0.72 0.2 145)
        static let lightWarning = Color(red: 0.85, green: 0.18, blue: 0.75) // oklch(0.85 0.18 75)
        static let lightInfo = Color(red: 0.75, green: 0.1, blue: 0.220) // oklch(0.75 0.1 220)
        
        // Dark Theme Colors
        static let darkBackground = Color(red: 0.145, green: 0.145, blue: 0.145) // oklch(0.1450 0 0)
        static let darkForeground = Color(red: 0.985, green: 0.985, blue: 0.985) // oklch(0.9850 0 0)
        static let darkCard = Color(red: 0.205, green: 0.205, blue: 0.205) // oklch(0.2050 0 0)
        static let darkCardForeground = Color(red: 0.971, green: 0.013, blue: 0.1738) // oklch(0.9710 0.0130 17.3800)
        static let darkPrimary = Color(red: 0.505, green: 0.213, blue: 0.275) // oklch(0.5050 0.2130 27.5180)
        static let darkPrimaryForeground = Color(red: 0.205, green: 0.205, blue: 0.205) // oklch(0.2050 0 0)
        static let darkSecondary = Color(red: 0.269, green: 0.269, blue: 0.269) // oklch(0.2690 0 0)
        static let darkMuted = Color(red: 0.269, green: 0.269, blue: 0.269) // oklch(0.2690 0 0)
        static let darkDestructive = Color(red: 0.704, green: 0.191, blue: 0.222) // oklch(0.7040 0.1910 22.2160)
        static let darkBorder = Color(red: 0.275, green: 0.275, blue: 0.275) // oklch(0.2750 0 0)
        static let darkInput = Color(red: 0.325, green: 0.325, blue: 0.325) // oklch(0.3250 0 0)
        static let darkRing = Color(red: 0.556, green: 0.556, blue: 0.556) // oklch(0.5560 0 0)
        static let darkSidebar = Color(red: 0.205, green: 0.205, blue: 0.205) // oklch(0.2050 0 0)
        static let darkSidebarPrimary = Color(red: 0.577, green: 0.245, blue: 0.325) // oklch(0.5770 0.2450 27.3250)
        static let darkSuccess = Color(red: 0.72, green: 0.2, blue: 0.145) // oklch(0.72 0.2 145)
        static let darkWarning = Color(red: 0.85, green: 0.18, blue: 0.75) // oklch(0.85 0.18 75)
        static let darkInfo = Color(red: 0.75, green: 0.1, blue: 0.220) // oklch(0.75 0.1 220)
    }
    
    // MARK: - Typography
    struct Typography {
        // Font Family - Roboto
        static let fontFamily = "Roboto"
        
        // Font Sizes (from design.json)
        static let xs: CGFloat = 12 // 0.75rem
        static let sm: CGFloat = 14 // 0.875rem
        static let base: CGFloat = 16 // 1rem
        static let lg: CGFloat = 18 // 1.125rem
        static let xl: CGFloat = 20 // 1.25rem
        static let xl2: CGFloat = 24 // 1.5rem
        static let xl3: CGFloat = 30 // 1.875rem
        
        // Font Weights
        static let light: Font.Weight = .light // 300
        static let regular: Font.Weight = .regular // 400
        static let medium: Font.Weight = .medium // 500
        static let semibold: Font.Weight = .semibold // 600
        static let bold: Font.Weight = .bold // 700
        
        // Line Heights
        static let tight: CGFloat = 1.25
        static let normal: CGFloat = 1.5
        static let relaxed: CGFloat = 1.75
    }
    
    // MARK: - Spacing
    struct Spacing {
        static let base: CGFloat = 4 // 0.25rem base unit
        static let xs: CGFloat = 2 // 0.125rem
        static let sm: CGFloat = 8 // 0.5rem
        static let md: CGFloat = 16 // 1rem
        static let lg: CGFloat = 24 // 1.5rem
        static let xl: CGFloat = 32 // 2rem
        static let xl2: CGFloat = 48 // 3rem
        static let xl3: CGFloat = 64 // 4rem
    }
    
    // MARK: - Border Radius
    struct BorderRadius {
        static let base: CGFloat = 10 // 0.625rem from design.json
        static let sm: CGFloat = 4 // 0.25rem
        static let md: CGFloat = 6 // 0.375rem
        static let lg: CGFloat = 10 // 0.625rem
        static let xl: CGFloat = 12 // 0.75rem
        static let xl2: CGFloat = 16 // 1rem
        static let xl3: CGFloat = 24 // 1.5rem
        static let full: CGFloat = 9999 // Full rounded
    }
    
    // MARK: - Shadows
    struct Shadows {
        static let xs = Color.black.opacity(0.05)
        static let sm = Color.black.opacity(0.10)
        static let md = Color.black.opacity(0.10)
    }
    
    // MARK: - Z-Index
    struct ZIndex {
        static let base: Double = 0
        static let dropdown: Double = 1000
        static let sticky: Double = 1100
        static let modal: Double = 1200
        static let popover: Double = 1300
        static let tooltip: Double = 1400
    }
    
    // MARK: - Motion
    struct Motion {
        static let fast: Double = 0.15 // 150ms
        static let normal: Double = 0.3 // 300ms
        static let slow: Double = 0.5 // 500ms
    }
}

// MARK: - Color Extensions
extension Color {
    // Semantic color aliases for easier usage
    static let designPrimary = DesignTokens.Colors.lightPrimary
    static let designSecondary = DesignTokens.Colors.lightSecondary
    static let designSuccess = DesignTokens.Colors.lightSuccess
    static let designWarning = DesignTokens.Colors.lightWarning
    static let designDestructive = DesignTokens.Colors.lightDestructive
    static let designInfo = DesignTokens.Colors.lightInfo
    static let designMuted = DesignTokens.Colors.lightMuted
    static let designMutedForeground = DesignTokens.Colors.lightMutedForeground
    static let designBackground = DesignTokens.Colors.lightBackground
    static let designForeground = DesignTokens.Colors.lightForeground
    static let designCard = DesignTokens.Colors.lightCard
    static let designCardForeground = DesignTokens.Colors.lightCardForeground
    static let designBorder = DesignTokens.Colors.lightBorder
    static let designInput = DesignTokens.Colors.lightInput
    static let designRing = DesignTokens.Colors.lightRing
    static let designSidebar = DesignTokens.Colors.lightSidebar
    static let designSidebarPrimary = DesignTokens.Colors.lightSidebarPrimary
}

// MARK: - Font Extensions
extension Font {
    static func designFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        return .custom(DesignTokens.Typography.fontFamily, size: size)
            .weight(weight)
    }
    
    // Predefined font styles
    static let designDisplayLarge = designFont(size: DesignTokens.Typography.xl3, weight: .bold)
    static let designDisplayMedium = designFont(size: DesignTokens.Typography.xl2, weight: .bold)
    static let designDisplaySmall = designFont(size: DesignTokens.Typography.xl, weight: .semibold)
    static let designHeadlineLarge = designFont(size: DesignTokens.Typography.lg, weight: .semibold)
    static let designHeadlineMedium = designFont(size: DesignTokens.Typography.base, weight: .medium)
    static let designHeadlineSmall = designFont(size: DesignTokens.Typography.sm, weight: .medium)
    static let designTitleLarge = designFont(size: DesignTokens.Typography.base, weight: .medium)
    static let designTitleMedium = designFont(size: DesignTokens.Typography.sm, weight: .medium)
    static let designTitleSmall = designFont(size: DesignTokens.Typography.xs, weight: .medium)
    static let designBodyLarge = designFont(size: DesignTokens.Typography.base, weight: .regular)
    static let designBodyMedium = designFont(size: DesignTokens.Typography.sm, weight: .regular)
    static let designBodySmall = designFont(size: DesignTokens.Typography.xs, weight: .regular)
    static let designLabelLarge = designFont(size: DesignTokens.Typography.sm, weight: .medium)
    static let designLabelMedium = designFont(size: DesignTokens.Typography.xs, weight: .medium)
    static let designLabelSmall = designFont(size: 10, weight: .medium)
}
