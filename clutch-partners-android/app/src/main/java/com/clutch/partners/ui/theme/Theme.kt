package com.clutch.partners.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = DarkPrimary,
    onPrimary = DarkPrimaryForeground,
    primaryContainer = DarkPrimary,
    onPrimaryContainer = DarkPrimaryForeground,
    secondary = DarkSecondary,
    onSecondary = DarkForeground,
    tertiary = DarkInfo,
    onTertiary = DarkForeground,
    background = DarkBackground,
    onBackground = DarkForeground,
    surface = DarkCard,
    onSurface = DarkCardForeground,
    surfaceVariant = DarkMuted,
    onSurfaceVariant = DarkForeground,
    outline = DarkBorder,
    outlineVariant = DarkBorder,
    scrim = Scrim,
    inverseSurface = LightSurface,
    inverseOnSurface = LightOnSurface,
    inversePrimary = LightPrimary,
    surfaceDim = DarkMuted,
    surfaceBright = DarkCard,
    surfaceContainerLowest = DarkBackground,
    surfaceContainerLow = DarkMuted,
    surfaceContainer = DarkCard,
    surfaceContainerHigh = DarkCard,
    surfaceContainerHighest = DarkCard,
    error = DarkDestructive,
    onError = DarkForeground,
    errorContainer = DarkDestructive,
    onErrorContainer = DarkForeground
)

private val LightColorScheme = lightColorScheme(
    primary = LightPrimary,
    onPrimary = LightPrimaryForeground,
    primaryContainer = LightPrimary,
    onPrimaryContainer = LightPrimaryForeground,
    secondary = LightSecondary,
    onSecondary = LightForeground,
    tertiary = LightInfo,
    onTertiary = LightForeground,
    background = LightBackground,
    onBackground = LightForeground,
    surface = LightCard,
    onSurface = LightCardForeground,
    surfaceVariant = LightMuted,
    onSurfaceVariant = LightMutedForeground,
    outline = LightBorder,
    outlineVariant = LightBorder,
    scrim = Scrim,
    inverseSurface = DarkSurface,
    inverseOnSurface = DarkOnSurface,
    inversePrimary = DarkPrimary,
    surfaceDim = LightMuted,
    surfaceBright = LightCard,
    surfaceContainerLowest = LightBackground,
    surfaceContainerLow = LightMuted,
    surfaceContainer = LightCard,
    surfaceContainerHigh = LightCard,
    surfaceContainerHighest = LightCard,
    error = LightDestructive,
    onError = LightForeground,
    errorContainer = LightDestructive,
    onErrorContainer = LightForeground
)

@Composable
fun ClutchPartnersTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

@Composable
fun ClutchPartnersThemeWithProviders(
    themeManager: ThemeManager,
    languageManager: LanguageManager,
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(
        LocalThemeManager provides themeManager,
        LocalLanguageManager provides languageManager
    ) {
        ClutchPartnersTheme(
            darkTheme = themeManager.isDarkTheme(),
            content = content
        )
    }
}
