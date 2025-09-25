# Clutch Shared Design System

This is a shared design system library that ensures consistent design implementation across all Clutch applications (Android, iOS, Web, and Windows).

## 🎯 Purpose

The shared design system provides:
- **Consistent colors** across all platforms using OKLCH color space
- **Unified typography** with Roboto font family
- **Standardized spacing** and border radius values
- **Design tokens** that can be consumed by any platform
- **Single source of truth** for all design decisions

## 📁 Structure

```
shared-design-system/
├── README.md
├── design-tokens/
│   ├── colors.json          # OKLCH color definitions
│   ├── typography.json      # Font family, sizes, weights
│   ├── spacing.json         # Spacing scale
│   ├── border-radius.json   # Border radius values
│   └── shadows.json         # Shadow definitions
├── platform-specific/
│   ├── android/             # Android-specific implementations
│   ├── ios/                 # iOS-specific implementations
│   ├── web/                 # Web-specific implementations
│   └── windows/             # Windows-specific implementations
└── docs/
    ├── usage-guide.md       # How to use the design system
    └── migration-guide.md   # How to migrate existing code
```

## 🎨 Design Tokens

### Colors (OKLCH)
All colors are defined in OKLCH color space for better perceptual uniformity:

```json
{
  "light": {
    "background": "oklch(1 0 0)",
    "foreground": "oklch(0.1450 0 0)",
    "primary": "oklch(0.5770 0.2450 27.3250)",
    "success": "oklch(0.72 0.2 145)",
    "warning": "oklch(0.85 0.18 75)",
    "destructive": "oklch(0.5770 0.2450 27.3250)"
  }
}
```

### Typography
Roboto font family with standardized sizes and weights:

```json
{
  "fontFamily": "Roboto",
  "sizes": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "xl2": "1.5rem",
    "xl3": "1.875rem"
  },
  "weights": {
    "light": 300,
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
}
```

### Spacing
Consistent spacing scale based on 0.25rem base unit:

```json
{
  "base": "0.25rem",
  "xs": "0.125rem",
  "sm": "0.5rem",
  "md": "1rem",
  "lg": "1.5rem",
  "xl": "2rem",
  "xl2": "3rem",
  "xl3": "4rem"
}
```

### Border Radius
Standardized border radius values:

```json
{
  "base": "0.625rem",
  "sm": "0.25rem",
  "md": "0.375rem",
  "lg": "0.625rem",
  "xl": "0.75rem",
  "xl2": "1rem",
  "xl3": "1.5rem",
  "full": "9999px"
}
```

## 🚀 Usage

### Android
```kotlin
// Use design system colors
val primaryColor = DesignTokens.Colors.lightPrimary
val borderRadius = DesignTokens.BorderRadius.base

// Use design system typography
val titleStyle = TextStyle(
    fontFamily = RobotoFontFamily,
    fontSize = DesignTokens.Typography.xl2.sp,
    fontWeight = FontWeight.Bold
)
```

### iOS
```swift
// Use design system colors
let primaryColor = DesignTokens.Colors.lightPrimary
let borderRadius = DesignTokens.BorderRadius.base

// Use design system typography
let titleFont = Font.designDisplayMedium
```

### Web
```css
/* Use design system colors */
.primary-button {
  background-color: oklch(0.5770 0.2450 27.3250);
  border-radius: 0.625rem;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  font-weight: 500;
}
```

## 📋 Migration Checklist

- [ ] Replace all hardcoded colors with design system colors
- [ ] Replace all hardcoded font sizes with design system typography
- [ ] Replace all hardcoded spacing with design system spacing
- [ ] Replace all hardcoded border radius with design system values
- [ ] Update all platform-specific implementations
- [ ] Test across all platforms for consistency
- [ ] Update documentation

## 🔧 Maintenance

The design system should be updated whenever:
- New colors are needed
- Typography changes are required
- Spacing adjustments are made
- New components are added

All changes must be:
1. Documented in the design tokens
2. Implemented across all platforms
3. Tested for consistency
4. Reviewed by the design team

## 📚 Resources

- [OKLCH Color Space](https://oklch.com/)
- [Roboto Font Family](https://fonts.google.com/specimen/Roboto)
- [Design System Best Practices](https://designsystemsrepo.com/)
- [Platform-Specific Guidelines](https://material.io/design) (Android)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) (iOS)
