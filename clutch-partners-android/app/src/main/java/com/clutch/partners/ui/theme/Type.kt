package com.clutch.partners.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Roboto Font Family - design.json specification
val RobotoFontFamily = FontFamily.Default

// Typography based on design.json specifications with Roboto font
val Typography = Typography(
    displayLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold, // 700
        fontSize = 30.sp, // 1.875rem
        lineHeight = 37.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp // normal tracking
    ),
    displayMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold, // 700
        fontSize = 24.sp, // 1.5rem
        lineHeight = 30.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    displaySmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.SemiBold, // 600
        fontSize = 20.sp, // 1.25rem
        lineHeight = 25.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    headlineLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.SemiBold, // 600
        fontSize = 18.sp, // 1.125rem
        lineHeight = 22.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 16.sp, // 1rem
        lineHeight = 20.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 14.sp, // 0.875rem
        lineHeight = 17.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    titleLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 16.sp, // 1rem
        lineHeight = 20.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    titleMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 14.sp, // 0.875rem
        lineHeight = 17.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    titleSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 12.sp, // 0.75rem
        lineHeight = 15.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal, // 400
        fontSize = 16.sp, // 1rem
        lineHeight = 24.sp, // 1.5 line height (normal)
        letterSpacing = 0.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal, // 400
        fontSize = 14.sp, // 0.875rem
        lineHeight = 21.sp, // 1.5 line height (normal)
        letterSpacing = 0.sp
    ),
    bodySmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal, // 400
        fontSize = 12.sp, // 0.75rem
        lineHeight = 18.sp, // 1.5 line height (normal)
        letterSpacing = 0.sp
    ),
    labelLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 14.sp, // 0.875rem
        lineHeight = 17.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    labelMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 12.sp, // 0.75rem
        lineHeight = 15.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    ),
    labelSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium, // 500
        fontSize = 10.sp, // 0.625rem
        lineHeight = 12.5.sp, // 1.25 line height (tight)
        letterSpacing = 0.sp
    )
)
