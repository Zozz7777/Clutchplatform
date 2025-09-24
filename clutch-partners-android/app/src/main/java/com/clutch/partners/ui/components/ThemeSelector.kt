package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.partners.ui.theme.AppTheme
import com.clutch.partners.ui.theme.LocalThemeManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeSelector(
    modifier: Modifier = Modifier,
    onThemeChanged: (AppTheme) -> Unit = {}
) {
    val themeManager = LocalThemeManager.current
    var showThemeDialog by remember { mutableStateOf(false) }
    
    Row(
        modifier = modifier
            .selectable(
                selected = false,
                onClick = { showThemeDialog = true }
            )
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = when (themeManager.currentTheme) {
                AppTheme.LIGHT -> Icons.Default.LightMode
                AppTheme.DARK -> Icons.Default.DarkMode
                AppTheme.AUTO -> Icons.Default.Settings
            },
            contentDescription = "Theme",
            tint = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = themeManager.currentTheme.displayName,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
    
    if (showThemeDialog) {
        ThemeSelectionDialog(
            currentTheme = themeManager.currentTheme,
            onThemeSelected = { theme ->
                themeManager.setTheme(theme)
                onThemeChanged(theme)
                showThemeDialog = false
            },
            onDismiss = { showThemeDialog = false }
        )
    }
}

@Composable
fun ThemeSelectionDialog(
    currentTheme: AppTheme,
    onThemeSelected: (AppTheme) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Select Theme",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column {
                AppTheme.values().forEach { theme ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = currentTheme == theme,
                                onClick = { onThemeSelected(theme) }
                            )
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentTheme == theme,
                            onClick = { onThemeSelected(theme) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = when (theme) {
                                AppTheme.LIGHT -> Icons.Default.LightMode
                                AppTheme.DARK -> Icons.Default.DarkMode
                                AppTheme.AUTO -> Icons.Default.Settings
                            },
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = theme.displayName,
                            fontSize = 16.sp,
                            fontWeight = if (currentTheme == theme) FontWeight.SemiBold else FontWeight.Normal
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
}

@Composable
fun ThemeToggleButton(
    modifier: Modifier = Modifier,
    onThemeChanged: (AppTheme) -> Unit = {}
) {
    val themeManager = LocalThemeManager.current
    val isDark = themeManager.isDarkTheme()
    
    IconButton(
        onClick = {
            val newTheme = if (isDark) AppTheme.LIGHT else AppTheme.DARK
            themeManager.setTheme(newTheme)
            onThemeChanged(newTheme)
        },
        modifier = modifier
    ) {
        Icon(
            imageVector = if (isDark) Icons.Default.LightMode else Icons.Default.DarkMode,
            contentDescription = if (isDark) "Switch to Light" else "Switch to Dark",
            tint = MaterialTheme.colorScheme.primary
        )
    }
}
